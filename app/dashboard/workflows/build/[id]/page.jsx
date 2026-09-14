'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast, Toaster } from 'react-hot-toast';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  MessageCircle, Zap, GitMerge, Save, Play, Clock,
  Database, RefreshCw, MousePointerClick, ArrowLeft,
  Settings, X, ChevronRight, Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';

/* ═══════════════════════════════════════════════════════════════════
   ICON-ONLY NODE COMPONENT — compact square, hover tooltip, n8n-style
   ═══════════════════════════════════════════════════════════════════ */

const NODE_META = {
  trigger:     { icon: Zap,               color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.35)', label: 'Trigger' },
  whatsapp:    { icon: MessageCircle,      color: '#25D366', bg: 'rgba(37,211,102,0.12)', border: 'rgba(37,211,102,0.35)', label: 'Send Message' },
  interactive: { icon: MousePointerClick,  color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', label: 'Interactive' },
  crm:         { icon: Database,           color: '#A855F7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.35)', label: 'Update CRM' },
  condition:   { icon: GitMerge,           color: '#6366F1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.35)', label: 'Switch' },
  delay:       { icon: Clock,             color: '#9CA3AF', bg: 'rgba(156,163,175,0.10)', border: 'rgba(156,163,175,0.30)', label: 'Delay' },
  loop:        { icon: RefreshCw,          color: '#14B8A6', bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.35)', label: 'Loop' },
};

const handleStyle = {
  width: 10, height: 10, background: '#18181B', border: '2px solid #52525B', zIndex: 10,
};

// Map each node type to its specific outputs
const NODE_OUTPUTS = {
  trigger:     [{ id: 'next', label: 'Next' }],
  whatsapp:    [{ id: 'sent', label: 'Sent' }, { id: 'failed', label: 'Failed' }],
  interactive: [{ id: 'opt1', label: 'Option A' }, { id: 'opt2', label: 'Option B' }],
  crm:         [{ id: 'success', label: 'Success' }, { id: 'failed', label: 'Failed' }],
  condition:   [{ id: 'true', label: 'True' }, { id: 'false', label: 'False' }],
  delay:       [{ id: 'done', label: 'Done' }, { id: 'error', label: 'Error' }],
  loop:        [{ id: 'item', label: 'Next Item' }, { id: 'done', label: 'Done' }],
};

function IconNode({ data, type, selected }) {
  const meta = NODE_META[type] || NODE_META.trigger;
  const Icon = meta.icon;
  const outputs = NODE_OUTPUTS[type] || [{ id: 'next', label: 'Next' }];

  return (
    <div className="group relative">
      {/* Tooltip */}
      <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#27272A] border border-[#3F3F46] rounded-lg text-[11px] text-gray-200 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {data.label || meta.label}
      </div>

      {/* Glow ring on select */}
      {selected && (
        <div className="absolute -inset-1.5 rounded-2xl" style={{ boxShadow: `0 0 0 2px ${meta.color}40, 0 0 20px ${meta.color}20` }} />
      )}

      {/* Node body */}
      <div
        className="relative w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all duration-200"
        style={{
          background: meta.bg,
          border: `1.5px solid ${selected ? meta.color : meta.border}`,
          boxShadow: selected ? `0 0 24px ${meta.color}15` : '0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        <Icon className="w-5 h-5" style={{ color: meta.color }} />
      </div>

      {/* Target Handle (Left) */}
      {type !== 'trigger' && (
        <Handle type="target" position={Position.Left} style={{ ...handleStyle, left: -5, top: '50%' }} />
      )}

      {/* Source Handles (Right) */}
      {outputs.map((out, index) => {
        // Calculate vertical position for multiple ports
        const isSingle = outputs.length === 1;
        const spacing = 100 / (outputs.length + 1);
        const top = isSingle ? '50%' : `${spacing * (index + 1)}%`;
        
        return (
          <div key={out.id}>
            <Handle
              type="source"
              id={out.id}
              position={Position.Right}
              style={{ ...handleStyle, right: -5, top }}
            />
            {/* Port Label Tooltip (visible on hover) */}
            <div 
              className="absolute right-[-45px] px-1.5 py-0.5 bg-[#18181B] border border-[#27272A] rounded text-[8px] text-gray-400 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
              style={{ top: `calc(${top} - 8px)` }}
            >
              {out.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Register each type pointing to the same component — type is passed as prop */
const TriggerNode     = (p) => <IconNode {...p} type="trigger" />;
const MessageNode     = (p) => <IconNode {...p} type="whatsapp" />;
const InteractiveNode = (p) => <IconNode {...p} type="interactive" />;
const CRMNode         = (p) => <IconNode {...p} type="crm" />;
const ConditionNode   = (p) => <IconNode {...p} type="condition" />;
const DelayNode       = (p) => <IconNode {...p} type="delay" />;
const LoopNode        = (p) => <IconNode {...p} type="loop" />;

const nodeTypes = {
  trigger: TriggerNode,
  whatsapp: MessageNode,
  interactive: InteractiveNode,
  crm: CRMNode,
  condition: ConditionNode,
  delay: DelayNode,
  loop: LoopNode,
};

/* ═══════════════════════════════════════════════════════════════════
   PROPERTIES PANEL — appears when a node is selected
   ═══════════════════════════════════════════════════════════════════ */

function PropertiesPanel({ node, onClose, onUpdate }) {
  if (!node) return null;
  const meta = NODE_META[node.type] || NODE_META.trigger;
  const Icon = meta.icon;

  const panels = {
    trigger: (
      <div className="space-y-4">
        <Field label="Event Type">
          <select 
            className="field-input" 
            value={node.data.eventType || 'Incoming WhatsApp Message'}
            onChange={(e) => onUpdate(node.id, { eventType: e.target.value })}
          >
            <option>Incoming WhatsApp Message</option>
            <option>New Lead Created</option>
            <option>Lead Status Changed</option>
            <option>Appointment Booked</option>
            <option>Scheduled Time (Cron)</option>
            <option>Webhook Received</option>
            <option>Form Submitted</option>
          </select>
        </Field>
      </div>
    ),
    whatsapp: (
      <div className="space-y-4">
        <Field label="Message Template">
          <textarea 
            rows={4} 
            className="field-input resize-none" 
            placeholder="Hi {{lead.full_name}}..." 
            value={node.data.template || ''} 
            onChange={(e) => onUpdate(node.id, { template: e.target.value })}
          />
        </Field>
        <div className="flex flex-wrap gap-1.5">
          {['lead.full_name','lead.phone','lead.email','lead.agency_name','appointment.date'].map(v => (
            <button 
              key={v} 
              onClick={() => onUpdate(node.id, { template: (node.data.template || '') + ` {{${v}}}` })}
              className="px-2 py-1 bg-[#C2496B]/10 text-[#C2496B] text-[10px] rounded-md font-mono hover:bg-[#C2496B]/20 transition-colors"
            >
              {`{{${v}}}`}
            </button>
          ))}
        </div>
      </div>
    ),
    interactive: (
      <div className="space-y-4">
        <Field label="Type">
          <select 
            className="field-input"
            value={node.data.interactiveType || 'Reply Buttons (Max 3)'}
            onChange={(e) => onUpdate(node.id, { interactiveType: e.target.value })}
          >
            <option>Reply Buttons (Max 3)</option>
            <option>List Menu (Max 10)</option>
          </select>
        </Field>
        <Field label="Button 1">
          <input 
            type="text" 
            className="field-input" 
            value={node.data.btn1 || ''} 
            onChange={(e) => onUpdate(node.id, { btn1: e.target.value })}
            placeholder="Yes, I'm interested"
          />
        </Field>
        <Field label="Button 2">
          <input 
            type="text" 
            className="field-input" 
            value={node.data.btn2 || ''} 
            onChange={(e) => onUpdate(node.id, { btn2: e.target.value })}
            placeholder="No, thanks"
          />
        </Field>
      </div>
    ),
    crm: (
      <div className="space-y-4">
        <Field label="Action">
          <select 
            className="field-input"
            value={node.data.crmAction || 'Update Lead Status'}
            onChange={(e) => onUpdate(node.id, { crmAction: e.target.value })}
          >
            <option>Update Lead Status</option>
            <option>Add Qualification Score</option>
            <option>Assign to Agent</option>
            <option>Add Note</option>
            <option>Create Appointment</option>
          </select>
        </Field>
        <Field label="Value">
          <select 
            className="field-input"
            value={node.data.crmValue || 'confirmed'}
            onChange={(e) => onUpdate(node.id, { crmValue: e.target.value })}
          >
            <option>confirmed</option>
            <option>follow up scheduled</option>
            <option>followed up</option>
            <option>canceled</option>
            <option>expired</option>
          </select>
        </Field>
      </div>
    ),
    condition: (
      <div className="space-y-4">
        <Field label="If Variable">
          <input 
            type="text" 
            className="field-input font-mono" 
            value={node.data.condVar || ''} 
            onChange={(e) => onUpdate(node.id, { condVar: e.target.value })}
            placeholder="{{lead.qualification_score}}"
          />
        </Field>
        <Field label="Operator">
          <select 
            className="field-input"
            value={node.data.condOp || 'Greater than'}
            onChange={(e) => onUpdate(node.id, { condOp: e.target.value })}
          >
            <option>Greater than</option>
            <option>Less than</option>
            <option>Equals</option>
            <option>Contains</option>
            <option>Is empty</option>
          </select>
        </Field>
        <Field label="Value">
          <input 
            type="text" 
            className="field-input" 
            value={node.data.condValue || ''} 
            onChange={(e) => onUpdate(node.id, { condValue: e.target.value })}
            placeholder="50"
          />
        </Field>
      </div>
    ),
    delay: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration">
            <input 
              type="number" 
              className="field-input" 
              value={node.data.delayDuration || ''} 
              onChange={(e) => onUpdate(node.id, { delayDuration: e.target.value })}
              placeholder="24"
            />
          </Field>
          <Field label="Unit">
            <select 
              className="field-input"
              value={node.data.delayUnit || 'Minutes'}
              onChange={(e) => onUpdate(node.id, { delayUnit: e.target.value })}
            >
              <option>Minutes</option>
              <option>Hours</option>
              <option>Days</option>
            </select>
          </Field>
        </div>
      </div>
    ),
    loop: (
      <div className="space-y-4">
        <Field label="Array / List">
          <input type="text" className="field-input font-mono" defaultValue="{{lead.appointments}}" />
        </Field>
        <Field label="Max Iterations">
          <input type="number" className="field-input" defaultValue="100" />
        </Field>
      </div>
    ),
  };

  return (
    <div className="w-80 bg-[#18181B] border border-[#27272A] flex flex-col shrink-0 animate-in slide-in-from-right-4 duration-200 m-4 rounded-[30px] overflow-hidden shadow-2xl h-[calc(100%-32px)]">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[#27272A] flex items-center justify-between bg-[#18181B] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
            <Icon className="w-4 h-4" style={{ color: meta.color }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{meta.label}</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Properties</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-8 pb-10 pt-6 custom-scrollbar space-y-6">
        <div className="bg-[#0F0F12]/50 border border-[#27272A]/50 rounded-2xl p-5">
          <Field label="Node Name">
            <input type="text" className="field-input" defaultValue={node.data.label || meta.label} />
          </Field>
        </div>
        <div className="bg-[#0F0F12]/50 border border-[#27272A]/50 rounded-2xl p-5">
          <h4 className="text-xs font-semibold text-gray-300 mb-5 flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-500" /> Configuration
          </h4>
          {panels[node.type]}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN BUILDER
   ═══════════════════════════════════════════════════════════════════ */

const initialNodes = [];
const initialEdges = [];

let id = 1;
const getId = () => `node_${id++}`;

function Builder() {
  const router = useRouter();
  const params = useParams();
  const workflowId = params.id;
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [status, setStatus] = useState('paused');
  const [isSaving, setIsSaving] = useState(false);
  const [whatsappAccounts, setWhatsappAccounts] = useState([]);
  const [whatsappAccountId, setWhatsappAccountId] = useState('');

  useEffect(() => {
    fetchAccounts();
    if (workflowId && workflowId !== 'new') {
      loadWorkflow();
    }
  }, [workflowId]);

  async function fetchAccounts() {
    const supabase = createClient();
    const { data } = await supabase.from('whatsapp_accounts').select('id, phone_number, worker_status');
    if (data) setWhatsappAccounts(data);
  }

  async function loadWorkflow() {
    const supabase = createClient();
    const { data, error } = await supabase.from('workflows').select('*').eq('id', workflowId).single();
    if (data) {
      setWorkflowName(data.name || 'Untitled Workflow');
      setStatus(data.status || 'paused');
      if (data.nodes) setNodes(data.nodes);
      if (data.edges) setEdges(data.edges);
      if (data.whatsapp_account_id) setWhatsappAccountId(data.whatsapp_account_id);
    }
  }

  async function handleSave(newStatus = status) {
    if (newStatus === 'active' && status === 'paused') {
      if (!window.confirm('Are you sure you want to activate this workflow?')) return;
    } else if (newStatus === 'paused' && status === 'active') {
      if (!window.confirm('Are you sure you want to pause/deactivate this workflow?')) return;
    }

    setIsSaving(true);
    const supabase = createClient();
    try {
      const payload = {
        name: workflowName,
        status: newStatus,
        nodes,
        edges,
        whatsapp_account_id: whatsappAccountId || null
      };

      if (workflowId === 'new') {
        const { data, error } = await supabase.from('workflows').insert(payload).select().single();
        if (error) throw error;
        toast.success('Workflow created successfully!');
        if (data) router.push(`/dashboard/workflows/build/${data.id}`);
      } else {
        const { error } = await supabase.from('workflows').update(payload).eq('id', workflowId);
        if (error) throw error;
        setStatus(newStatus);
        toast.success(`Workflow ${newStatus === 'active' ? 'activated' : 'saved'} successfully!`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error saving workflow: ' + e.message);
    }
    setIsSaving(false);
  }

  const onConnect = useCallback((params) => {
    let color = '#52525B';
    if (params.sourceHandle === 'true') color = '#4ADE80';
    if (params.sourceHandle === 'false') color = '#F87171';
    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      style: { stroke: color, strokeWidth: 1.5 },
    }, eds));
  }, [setEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const meta = NODE_META[type];
    setNodes((nds) => nds.concat({ id: getId(), type, position, data: { label: meta?.label || type } }));
  }, [reactFlowInstance, setNodes]);

  const onNodeClick = useCallback((_, node) => setSelectedNode(node), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  const onAddNode = useCallback((type) => {
    const meta = NODE_META[type];
    
    // Add some random offset so they don't stack exactly on top of each other
    const randomOffset = Math.floor(Math.random() * 40) - 20;
    
    // Default position in the middle-ish of the view
    // A more advanced approach would use reactFlowInstance.screenToFlowPosition
    // on the center of the screen, but this works well for a fixed default
    const position = { 
      x: 250 + randomOffset, 
      y: 200 + (nodes.length * 20) 
    };

    setNodes((nds) => nds.concat({ 
      id: getId(), 
      type, 
      position, 
      data: { label: meta?.label || type } 
    }));
  }, [nodes.length, setNodes]);

  return (
    <div className="flex h-screen flex-col" style={{ background: '#09090B' }}>

      {/* ── Top bar ── */}
      <header className="h-12 bg-[#0F0F12] border-b border-[#1F1F23] flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard/workflows')} className="p-1.5 text-gray-500 hover:text-white rounded-md hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-[#27272A]" />
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-[13px] font-medium text-gray-200 bg-transparent border-none outline-none focus:ring-1 focus:ring-[#C2496B] rounded px-1.5 py-0.5 min-w-[150px] transition-all hover:bg-white/5"
            placeholder="Workflow Name"
          />
          <span className={`px-1.5 py-0.5 ${status === 'active' ? 'bg-[#C2496B]/20 text-[#C2496B]' : 'bg-[#27272A] text-gray-500'} text-[9px] uppercase rounded font-bold tracking-widest`}>
            {status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={whatsappAccountId}
            onChange={(e) => setWhatsappAccountId(e.target.value)}
            className="bg-[#18181B] border border-[#27272A] text-gray-300 text-xs rounded-lg px-2 py-1.5 outline-none focus:border-[#C2496B] transition-colors"
          >
            <option value="">Select WhatsApp Account</option>
            {whatsappAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.phone_number} ({acc.worker_status})
              </option>
            ))}
          </select>

          <button 
            onClick={() => handleSave('paused')}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181B] border border-[#27272A] rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:border-[#3F3F46] transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          
          {status === 'active' ? (
            <button 
              onClick={() => handleSave('paused')}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#27272A] rounded-lg text-xs font-semibold text-white hover:bg-[#3F3F46] transition-colors shadow-lg disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" /> Deactivate
            </button>
          ) : (
            <button 
              onClick={() => handleSave('active')}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#C2496B] rounded-lg text-xs font-semibold text-white hover:bg-[#a83c5c] transition-colors shadow-lg shadow-[#C2496B]/10 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" /> Activate
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">

        {/* ── Node palette (left) ── */}
        <aside className="w-16 bg-[#0F0F12] border-r border-[#1F1F23] flex flex-col items-center py-4 gap-2 shrink-0 z-10">
          {Object.entries(NODE_META).map(([type, meta]) => {
            const Icon = meta.icon;
            return (
              <div
                key={type}
                className="group relative w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-150"
                style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
                onClick={() => onAddNode(type)}
              >
                <Icon className="w-4 h-4" style={{ color: meta.color }} />
                {/* Tooltip */}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#27272A] border border-[#3F3F46] rounded-lg text-[11px] text-gray-200 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {meta.label}
                </div>
              </div>
            );
          })}
        </aside>

        {/* ── Canvas ── */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
              <div className="w-16 h-16 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Drag a node from the left to start building</p>
              <p className="text-gray-600 text-xs mt-1">or drop a Trigger node to begin your workflow</p>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: '#3F3F46', strokeWidth: 1.5 } }}
            style={{ background: '#09090B' }}
          >
            <Background color="#27272A" variant="dots" gap={24} size={1} />
            <Controls
              showInteractive={false}
              className="!bg-[#18181B] !border-[#27272A] !rounded-xl !shadow-2xl [&>button]:!bg-[#18181B] [&>button]:!border-[#27272A] [&>button]:!text-gray-400 [&>button:hover]:!bg-[#27272A] [&>button:hover]:!text-white [&>button>svg]:!fill-current"
            />
            <MiniMap
              nodeColor={(n) => NODE_META[n.type]?.color || '#52525B'}
              maskColor="rgba(0,0,0,0.7)"
              className="!bg-[#18181B] !border-[#27272A] !rounded-xl"
              style={{ width: 140, height: 90 }}
            />
          </ReactFlow>
        </div>

        {/* ── Properties panel (right) ── */}
        {selectedNode && (
          <PropertiesPanel
            key={selectedNode.id}
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={updateNodeConfig}
          />
        )}
      </div>

      {/* Global field styles */}
      <style jsx global>{`
        .field-input {
          width: 100%;
          background: #09090B;
          border: 1px solid #27272A;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.8125rem;
          color: #F4F4F5;
          outline: none;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.3);
          transition: all 0.2s ease;
        }
        .field-input:focus {
          border-color: #C2496B;
          box-shadow: 0 0 0 2px rgba(194,73,107,0.15), inset 0 1px 2px rgba(0,0,0,0.3);
          background: #0F0F12;
        }
        .field-input:hover:not(:focus) {
          border-color: #3F3F46;
        }
        .react-flow__edge-path {
          stroke-linecap: round;
        }
      `}</style>
    </div>
  );
}

export default function WorkflowBuilderPage() {
  return (
    <div className="fixed inset-0 z-[100]" style={{ background: '#09090B' }}>
      <Toaster position="top-center" />
      <ReactFlowProvider>
        <Builder />
      </ReactFlowProvider>
    </div>
  );
}
