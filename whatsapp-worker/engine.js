const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// We need a reference to the activeSockets from index.js
let activeSocketsRef = null;

function initWorkflowEngine(activeSockets) {
  activeSocketsRef = activeSockets;
  console.log('Initializing Workflow Execution Engine...');

  // Listen to new leads
  supabase
    .channel('public:leads:inserts')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, payload => {
      console.log('Workflow Engine: Detected new lead!', payload.new.id);
      triggerWorkflows('New Lead Created', { lead: payload.new });
    })
    .subscribe((status) => {
      console.log('Workflow Engine: Leads listener status ->', status);
    });
}

async function triggerWorkflows(eventType, payload) {
  // Fetch all active workflows
  const { data: workflows, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('status', 'active');

  if (error || !workflows) {
    console.error('Workflow Engine: Failed to fetch active workflows', error);
    return;
  }

  for (const wf of workflows) {
    if (!wf.nodes || !wf.edges) continue;
    
    // Find trigger node
    const triggerNode = wf.nodes.find(n => n.type === 'trigger');
    if (!triggerNode) continue;
    
    const nodeEventType = triggerNode.data?.eventType || 'Incoming WhatsApp Message';
    if (nodeEventType === eventType) {
      console.log(`Starting workflow ${wf.name} for event ${eventType}`);
      
      // Update stats in UI
      supabase.from('workflows').select('total_executions').eq('id', wf.id).single().then(({data}) => {
        if(data) {
          supabase.from('workflows').update({ 
            last_run_at: new Date().toISOString(),
            total_executions: (data.total_executions || 0) + 1
          }).eq('id', wf.id).then().catch(console.error);
        }
      });
      
      // Start processing from the nodes connected to the trigger
      const nextEdges = wf.edges.filter(e => e.source === triggerNode.id);
      for (const edge of nextEdges) {
        processNode(wf, edge.target, payload);
      }
    }
  }
}

async function processNode(workflow, nodeId, payload) {
  const node = workflow.nodes.find(n => n.id === nodeId);
  if (!node) return;

  console.log(`Executing Node [${node.type}] - ${node.data?.label || nodeId}`);
  
  // Re-fetch lead to ensure we have latest data (in case previous nodes updated it)
  if (payload.lead?.id) {
    const { data: latestLead } = await supabase.from('leads').select('*').eq('id', payload.lead.id).single();
    if (latestLead) payload.lead = latestLead;
  }
  
  let nextHandle = 'next';
  let stopExecution = false;

  try {
      switch (node.type) {
      case 'whatsapp':
        nextHandle = await executeWhatsAppNode(workflow, node, payload);
        break;
      case 'interactive':
        stopExecution = true;
        await executeInteractiveNode(workflow, node, payload);
        break;
      case 'delay':
        // Delay stops synchronous execution
        stopExecution = true;
        await executeDelayNode(workflow, node, payload);
        break;
      case 'condition':
        nextHandle = await executeConditionNode(node, payload);
        break;
      case 'crm':
        nextHandle = await executeCrmNode(node, payload);
        break;
    }
  } catch (err) {
    console.error(`Error executing node ${nodeId}:`, err);
    nextHandle = 'failed';
  }

  if (stopExecution) return; // Delay handles its own continuation

  // Find next nodes
  const nextEdges = workflow.edges.filter(e => e.source === node.id && (!e.sourceHandle || e.sourceHandle === nextHandle || nextHandle === 'next'));
  
  for (const edge of nextEdges) {
    processNode(workflow, edge.target, payload);
  }
}

function resolveTemplate(template, payload) {
  if (!template) return '';
  return template.replace(/\{\{([a-zA-Z0-9_.]+)\}\}/g, (match, path) => {
    const parts = path.split('.');
    let val = payload;
    for (const p of parts) {
      if (val) val = val[p];
    }
    return val !== undefined && val !== null ? val : match;
  });
}
  
function formatPhoneNumber(phone) {
  if (!phone) return null;
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('00')) clean = clean.substring(2);
  // Moroccan local numbers (e.g. 06..., 07..., 05... -> 10 digits)
  if (clean.startsWith('0') && clean.length === 10) {
    clean = '212' + clean.substring(1);
  } else if ((clean.startsWith('6') || clean.startsWith('7') || clean.startsWith('5')) && clean.length === 9) {
    clean = '212' + clean;
  }
  return clean;
}

async function resolveJid(sock, rawPhone) {
  const cleanPhone = formatPhoneNumber(rawPhone);
  if (!cleanPhone) return null;

  try {
    const results = await sock.onWhatsApp(cleanPhone);
    if (results && results[0]?.exists) {
      console.log(`Resolved verified WhatsApp JID for ${rawPhone} -> ${results[0].jid}`);
      return results[0].jid;
    }
  } catch (err) {
    console.warn(`onWhatsApp check failed for ${cleanPhone}:`, err.message);
  }

  return cleanPhone + '@s.whatsapp.net';
}

async function executeWhatsAppNode(workflow, node, payload) {
  if (!workflow.whatsapp_account_id) {
    console.error('No WhatsApp account linked to workflow');
    return 'failed';
  }
  
  // Verify Token Security and Expiration
  const { data: accountData } = await supabase
    .from('whatsapp_accounts')
    .select('token, expires_at')
    .eq('id', workflow.whatsapp_account_id)
    .single();
    
  if (!accountData || !accountData.token) {
    console.error('Account rejected: Missing workflow token configuration');
    return 'failed';
  }
  
  if (accountData.expires_at && new Date(accountData.expires_at) < new Date()) {
    console.error('Account rejected: Workflow token has expired');
    return 'failed';
  }
  
  const sock = activeSocketsRef.get(workflow.whatsapp_account_id);
  if (!sock) {
    console.error('WhatsApp worker not connected for this workflow');
    return 'failed';
  }
  
  const leadPhone = payload.lead?.phone;
  if (!leadPhone) {
    console.error('Lead has no phone number');
    return 'failed';
  }

  const jid = await resolveJid(sock, leadPhone);
  if (!jid) {
    console.error(`Could not resolve valid WhatsApp JID for ${leadPhone}`);
    return 'failed';
  }
  
  const messageText = resolveTemplate(node.data?.template, payload);
  
  console.log(`Sending WhatsApp message to ${jid}: ${messageText}`);
  await sock.sendMessage(jid, { text: messageText });
  
  return 'sent';
}

async function executeInteractiveNode(workflow, node, payload) {
  if (!workflow.whatsapp_account_id) {
    console.error('No WhatsApp account linked to workflow');
    return;
  }
  
  // Verify Token Security and Expiration
  const { data: accountData } = await supabase
    .from('whatsapp_accounts')
    .select('token, expires_at')
    .eq('id', workflow.whatsapp_account_id)
    .single();
    
  if (!accountData || !accountData.token) {
    console.error('Account rejected: Missing workflow token configuration');
    return;
  }
  
  if (accountData.expires_at && new Date(accountData.expires_at) < new Date()) {
    console.error('Account rejected: Workflow token has expired');
    return;
  }
  
  const sock = activeSocketsRef.get(workflow.whatsapp_account_id);
  if (!sock) {
    console.error('WhatsApp worker not connected for this workflow');
    return;
  }
  
  const leadPhone = payload.lead?.phone;
  if (!leadPhone) return;

  const jid = await resolveJid(sock, leadPhone);
  if (!jid) {
    console.error(`Could not resolve valid WhatsApp JID for ${leadPhone}`);
    return;
  }
  
  const messageText = resolveTemplate(node.data?.template, payload);
  const btn1Text = node.data?.btn1 || 'Yes';
  const btn2Text = node.data?.btn2 || 'No';
  
  console.log(`Sending Interactive Poll to ${jid}: ${messageText}`);
  
  const response = await sock.sendMessage(jid, {
    poll: {
      name: messageText,
      values: [btn1Text, btn2Text],
      selectableCount: 1
    }
  });
  
  const messageId = response?.key?.id;
  if (messageId && payload.lead?.id) {
    // Save state to pending_interactions memory
    const { error } = await supabase.from('pending_interactions').insert([{
      lead_id: payload.lead.id,
      workflow_id: workflow.id,
      node_id: node.id,
      message_id: messageId,
      message_json: response.message
    }]);
    
    if (error) console.error('Failed to save pending interaction:', error);
    else console.log(`Workflow paused at node ${node.id}, waiting for lead to vote on poll.`);
  }
}

async function resumeWorkflowFromInteractive(pendingInteraction, selectedOptionText) {
  console.log(`Resuming workflow ${pendingInteraction.workflow_id} from interactive node ${pendingInteraction.node_id}. Selected: ${selectedOptionText}`);
  
  // Fetch workflow
  const { data: workflow } = await supabase.from('workflows').select('*').eq('id', pendingInteraction.workflow_id).single();
  if (!workflow) return;
  
  // Fetch lead
  const { data: lead } = await supabase.from('leads').select('*').eq('id', pendingInteraction.lead_id).single();
  if (!lead) return;
  
  const node = workflow.nodes?.find(n => n.id === pendingInteraction.node_id);
  if (!node) return;
  
  const btn1Text = node.data?.btn1 || 'Yes';
  // const btn2Text = node.data?.btn2 || 'No';
  
  // Determine which branch to take based on the exact text of the button they voted for
  const nextHandle = selectedOptionText === btn1Text ? 'opt1' : 'opt2';
  
  const payload = { lead };
  
  // Find next nodes
  const nextEdges = workflow.edges?.filter(e => e.source === node.id && e.sourceHandle === nextHandle) || [];
  
  for (const edge of nextEdges) {
    processNode(workflow, edge.target, payload);
  }
}

async function executeDelayNode(workflow, node, payload) {
  const duration = parseInt(node.data?.delayDuration || '0', 10);
  const unit = node.data?.delayUnit || 'Minutes';
  
  let ms = 0;
  if (unit === 'Minutes') ms = duration * 60 * 1000;
  if (unit === 'Hours') ms = duration * 60 * 60 * 1000;
  if (unit === 'Days') ms = duration * 24 * 60 * 60 * 1000;
  
  console.log(`Delaying workflow for ${duration} ${unit} (${ms}ms)`);
  
  // WARNING: In-memory delay. If server restarts, this is lost.
  setTimeout(() => {
    console.log(`Delay finished. Resuming workflow.`);
    // Find next nodes
    const nextEdges = workflow.edges.filter(e => e.source === node.id && (e.sourceHandle === 'done' || !e.sourceHandle));
    for (const edge of nextEdges) {
      processNode(workflow, edge.target, payload);
    }
  }, ms);
}

async function executeConditionNode(node, payload) {
  const variablePath = node.data?.condVar || '';
  const operator = node.data?.condOp || 'Equals';
  const expectedValue = node.data?.condValue || '';
  
  // Extract variable value
  let actualValue = payload;
  const parts = variablePath.replace(/[{}]/g, '').split('.');
  for (const p of parts) {
    if (actualValue) actualValue = actualValue[p];
  }
  
  // Safe comparison
  const a = String(actualValue || '').toLowerCase();
  const b = String(expectedValue || '').toLowerCase();
  
  let result = false;
  switch (operator) {
    case 'Equals': result = a === b; break;
    case 'Not equals': result = a !== b; break;
    case 'Contains': result = a.includes(b); break;
    case 'Is empty': result = !a; break;
    case 'Is not empty': result = !!a; break;
    // Basic numerical support
    case 'Greater than': result = Number(a) > Number(b); break;
    case 'Less than': result = Number(a) < Number(b); break;
  }
  
  console.log(`Condition evaluated: ${actualValue} ${operator} ${expectedValue} => ${result}`);
  return result ? 'true' : 'false';
}

async function executeCrmNode(node, payload) {
  const action = node.data?.crmAction;
  const value = node.data?.crmValue;
  const leadId = payload.lead?.id;
  
  if (!leadId) return 'failed';
  
  if (action === 'Update Lead Status') {
    console.log(`Updating lead ${leadId} status to ${value}`);
    await supabase.from('leads').update({ status: value }).eq('id', leadId);
  }
  
  return 'success';
}

module.exports = { initWorkflowEngine, triggerWorkflows, resumeWorkflowFromInteractive };

