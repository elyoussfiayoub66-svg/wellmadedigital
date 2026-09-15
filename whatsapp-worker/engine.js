const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// In-memory execution log buffer (holds last 300 logs for live terminal)
const executionLogs = [];

function addLog(level, category, message, details = null) {
  const logEntry = {
    id: Math.random().toString(36).substring(2, 11),
    timestamp: new Date().toISOString(),
    level, // 'info' | 'success' | 'warning' | 'error'
    category, // 'SYSTEM' | 'TRIGGER' | 'TOKEN' | 'PHONE' | 'NODE' | 'WHATSAPP' | 'POLL' | 'REPLY'
    message,
    details: details ? details : undefined
  };
  executionLogs.unshift(logEntry);
  if (executionLogs.length > 300) executionLogs.pop();

  console.log(`[${logEntry.level.toUpperCase()}] [${category}] ${message}`, details ? JSON.stringify(details) : '');

  // Asynchronously attempt to persist to workflow_logs in Supabase if table exists
  try {
    supabase.from('workflow_logs').insert([{
      status: level,
      node_type: category,
      message,
      details: details ? details : null,
      created_at: logEntry.timestamp
    }]).then(() => {}).catch(() => {});
  } catch {}

  return logEntry;
}

function getExecutionLogs() {
  return executionLogs;
}

function clearExecutionLogs() {
  executionLogs.length = 0;
  return true;
}

// We need a reference to the activeSockets from index.js
let activeSocketsRef = null;

function initWorkflowEngine(activeSockets) {
  activeSocketsRef = activeSockets;
  addLog('info', 'SYSTEM', 'Workflow execution engine initialized and listening for triggers');

  // Listen to new leads
  supabase
    .channel('public:leads:inserts')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, payload => {
      addLog('info', 'TRIGGER', `Realtime DB trigger: New lead inserted (${payload.new.full_name || 'No Name'} - ${payload.new.phone || 'No Phone'})`, { leadId: payload.new.id, lead: payload.new });
      triggerWorkflows('New Lead Created', { lead: payload.new });
    })
    .subscribe((status) => {
      console.log('Workflow Engine: Leads listener status ->', status);
      if (status === 'SUBSCRIBED') {
        addLog('success', 'SYSTEM', 'Supabase Realtime subscription connected for "leads" table');
      }
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
  
  addLog('info', 'NODE', `Executing node [${node.id}] (${node.type}: "${node.data?.label || node.id}")`);

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
    addLog('error', 'NODE', `Error executing node [${node.id}]: ${err.message}`);
    nextHandle = 'failed';
  }

  if (stopExecution) {
    if (node.type === 'interactive') {
      addLog('info', 'WAITING', `⏸️ Workflow is PAUSED at interactive node [${node.id}]. Downstream nodes will NOT run until the lead taps a button in WhatsApp.`);
    }
    return;
  }

  // Find next nodes with handle synonym support ('sent' / 'done' / 'success' / 'next')
  const nextEdges = workflow.edges.filter(e => {
    if (e.source !== node.id) return false;
    if (!e.sourceHandle) return true;
    if (nextHandle === 'next') return true;
    if (e.sourceHandle === nextHandle) return true;
    const successHandles = ['sent', 'done', 'success', 'next'];
    if (successHandles.includes(nextHandle) && successHandles.includes(e.sourceHandle)) return true;
    const failureHandles = ['failed', 'error', 'false'];
    if (failureHandles.includes(nextHandle) && failureHandles.includes(e.sourceHandle)) return true;
    return false;
  });
  
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
  const leadName = payload.lead?.full_name || 'Lead';
  const leadPhone = payload.lead?.phone;

  if (!workflow.whatsapp_account_id) {
    addLog('error', 'ACCOUNT', `No WhatsApp worker account linked to workflow "${workflow.name}". Please link an account in the canvas settings.`, { workflowId: workflow.id });
    return 'failed';
  }
  
  // Verify Token Security and Expiration
  const { data: accountData, error: accErr } = await supabase
    .from('whatsapp_accounts')
    .select('token, expires_at, name, worker_status')
    .eq('id', workflow.whatsapp_account_id)
    .single();
    
  if (accErr || !accountData) {
    addLog('error', 'ACCOUNT', `Failed to find account ${workflow.whatsapp_account_id} in database!`, { error: accErr?.message });
    return 'failed';
  }

  if (!accountData.token) {
    addLog('error', 'TOKEN', `Account "${accountData.name || accountData.id}" is rejected: Missing valid token configuration. Complete setup in Accounts tab.`, { accountId: workflow.whatsapp_account_id });
    return 'failed';
  }
  
  if (accountData.expires_at && new Date(accountData.expires_at) < new Date()) {
    addLog('error', 'TOKEN', `Account "${accountData.name || accountData.id}" token expired on ${new Date(accountData.expires_at).toLocaleString()}! Message blocked.`, { expiresAt: accountData.expires_at });
    return 'failed';
  }
  
  addLog('info', 'TOKEN', `Token verified active for "${accountData.name || 'Worker'}". Expiration: ${accountData.expires_at ? new Date(accountData.expires_at).toLocaleDateString() : 'Lifetime'}`);

  const sock = activeSocketsRef.get(workflow.whatsapp_account_id);
  if (!sock) {
    addLog('error', 'SOCKET', `WhatsApp worker session is NOT active in memory for account "${accountData.name || workflow.whatsapp_account_id}". Status in DB: ${accountData.worker_status}. Make sure phone is paired.`, { accountId: workflow.whatsapp_account_id });
    return 'failed';
  }
  
  if (!leadPhone) {
    addLog('error', 'PHONE', `Lead "${leadName}" has no phone number in database! Cannot send message.`, { leadId: payload.lead?.id });
    return 'failed';
  }

  const jid = await resolveJid(sock, leadPhone);
  if (!jid) {
    addLog('error', 'PHONE', `Could not resolve a valid WhatsApp destination JID for number "${leadPhone}".`);
    return 'failed';
  }
  
  addLog('info', 'PHONE', `Resolved WhatsApp destination JID: ${jid} for "${leadName}" (${leadPhone})`);

  const messageText = resolveTemplate(node.data?.template, payload);
  
  addLog('info', 'WHATSAPP', `Sending message to ${jid} (Template: "${messageText.substring(0, 60)}${messageText.length > 60 ? '...' : ''}")`);
  try {
    await sock.sendMessage(jid, { text: messageText });
    addLog('success', 'WHATSAPP', `Message successfully delivered to WhatsApp for ${leadName} (${jid})`);
    return 'sent';
  } catch (err) {
    addLog('error', 'WHATSAPP', `Failed to send WhatsApp message to ${jid}: ${err.message}`, { error: err.message, stack: err.stack });
    return 'failed';
  }
}

async function executeInteractiveNode(workflow, node, payload) {
  const leadName = payload.lead?.full_name || 'Lead';
  const leadPhone = payload.lead?.phone;

  if (!workflow.whatsapp_account_id) {
    addLog('error', 'ACCOUNT', `No WhatsApp worker account linked to workflow "${workflow.name}".`, { workflowId: workflow.id });
    return;
  }
  
  // Verify Token Security and Expiration
  const { data: accountData, error: accErr } = await supabase
    .from('whatsapp_accounts')
    .select('token, expires_at, name, worker_status')
    .eq('id', workflow.whatsapp_account_id)
    .single();
    
  if (accErr || !accountData) {
    addLog('error', 'ACCOUNT', `Account ${workflow.whatsapp_account_id} not found in database!`, { error: accErr?.message });
    return;
  }

  if (!accountData.token) {
    addLog('error', 'TOKEN', `Account "${accountData.name || accountData.id}" rejected: Missing valid token configuration.`, { accountId: workflow.whatsapp_account_id });
    return;
  }
  
  if (accountData.expires_at && new Date(accountData.expires_at) < new Date()) {
    addLog('error', 'TOKEN', `Account "${accountData.name || accountData.id}" token expired! Interactive poll blocked.`, { expiresAt: accountData.expires_at });
    return;
  }
  
  addLog('info', 'TOKEN', `Token verified active for "${accountData.name || 'Worker'}". Interactive poll approved.`);

  const sock = activeSocketsRef.get(workflow.whatsapp_account_id);
  if (!sock) {
    addLog('error', 'SOCKET', `WhatsApp worker session is NOT active in memory for account "${accountData.name || workflow.whatsapp_account_id}". Status in DB: ${accountData.worker_status}. Make sure phone is paired.`, { accountId: workflow.whatsapp_account_id });
    return;
  }
  
  if (!leadPhone) {
    addLog('error', 'PHONE', `Lead "${leadName}" has no phone number in database! Cannot send interactive poll.`, { leadId: payload.lead?.id });
    return;
  }

  const jid = await resolveJid(sock, leadPhone);
  if (!jid) {
    addLog('error', 'PHONE', `Could not resolve a valid WhatsApp destination JID for number "${leadPhone}".`);
    return;
  }
  
  addLog('info', 'PHONE', `Resolved WhatsApp destination JID: ${jid} for "${leadName}" (${leadPhone})`);

  const messageText = resolveTemplate(node.data?.template, payload);
  const btn1Text = node.data?.btn1 || 'Yes';
  const btn2Text = node.data?.btn2 || 'No';
  
  addLog('info', 'POLL', `Sending Interactive Poll to ${jid}: "${messageText}" [Option 1: "${btn1Text}", Option 2: "${btn2Text}"]`);
  
  try {
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
      
      if (error) {
        addLog('error', 'MEMORY', `Failed to save pending interaction state to database: ${error.message}`, { error });
      } else {
        addLog('success', 'POLL', `Interactive Poll sent to ${jid} (Message ID: ${messageId}). Workflow paused at node [${node.id}] waiting for lead reply.`);
      }
    } else {
      addLog('warning', 'POLL', `Poll sent but message ID or lead ID was missing. Response key: ${JSON.stringify(response?.key)}`);
    }
  } catch (err) {
    addLog('error', 'POLL', `Failed to dispatch WhatsApp poll to ${jid}: ${err.message}`, { error: err.message, stack: err.stack });
  }
}

async function resumeWorkflowFromInteractive(pendingInteraction, selectedOptionText) {
  console.log(`Resuming workflow ${pendingInteraction.workflow_id} from interactive node ${pendingInteraction.node_id}. Selected: ${selectedOptionText}`);
  
  // Fetch workflow
  const { data: workflow } = await supabase.from('workflows').select('*').eq('id', pendingInteraction.workflow_id).single();
  if (!workflow) {
    addLog('error', 'WORKFLOW', `Cannot resume: Workflow ${pendingInteraction.workflow_id} not found in database.`);
    return;
  }
  
  // Fetch lead
  const { data: lead } = await supabase.from('leads').select('*').eq('id', pendingInteraction.lead_id).single();
  if (!lead) {
    addLog('error', 'WORKFLOW', `Cannot resume: Lead ${pendingInteraction.lead_id} not found in database.`);
    return;
  }
  
  const node = workflow.nodes?.find(n => n.id === pendingInteraction.node_id);
  if (!node) {
    addLog('error', 'WORKFLOW', `Cannot resume: Node ${pendingInteraction.node_id} not found in workflow.`);
    return;
  }
  
  const btn1Text = (node.data?.btn1 || 'Yes').trim();
  const btn2Text = (node.data?.btn2 || 'No').trim();
  const cleanSelected = (selectedOptionText || '').trim();
  
  // Determine which branch to take based on the text of the button they voted for
  const isOpt1 = cleanSelected.toLowerCase() === btn1Text.toLowerCase();
  const nextHandle = isOpt1 ? 'opt1' : 'opt2';
  const branchName = isOpt1 ? `Option 1 ("${btn1Text}")` : `Option 2 ("${btn2Text}")`;
  
  addLog('success', 'POLL_REPLY', `Lead "${lead.full_name || lead.phone}" selected "${cleanSelected}". Resuming along ${branchName}.`, {
    selected: cleanSelected,
    branch: nextHandle,
    nodeId: node.id
  });
  
  const payload = { lead };
  
  // Find next nodes
  const nextEdges = workflow.edges?.filter(e => e.source === node.id && e.sourceHandle === nextHandle) || [];
  
  if (nextEdges.length === 0) {
    addLog('info', 'WORKFLOW', `No downstream nodes connected to ${branchName} of node [${node.id}]. Workflow complete.`);
  }
  
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

module.exports = { 
  initWorkflowEngine, 
  triggerWorkflows, 
  resumeWorkflowFromInteractive,
  addLog,
  getExecutionLogs,
  clearExecutionLogs
};

