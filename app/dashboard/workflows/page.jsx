'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Settings, Play, Pause, MoreVertical, Smartphone, BarChart3, Workflow, QrCode, Trash2, Loader2, CheckCircle2, Terminal, RefreshCw, AlertTriangle, AlertCircle, Search, Trash, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function WorkflowsManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('workflows');
  const [workflows, setWorkflows] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ... QR states
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [activeAccountId, setActiveAccountId] = useState(null);

  // Configuration Modal states
  const [configuringAccount, setConfiguringAccount] = useState(null);
  const [accountName, setAccountName] = useState('');
  const [accountDuration, setAccountDuration] = useState('1'); // Months

  // Terminal / Logs states
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(true);
  const [workerStatus, setWorkerStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [expandedLogIds, setExpandedLogIds] = useState(new Set());

  useEffect(() => {
    fetchData();
    return () => clearInterval(pollingInterval);
  }, []);

  async function fetchData() {
    // ... existing fetch logic
    setLoading(true);
    try {
      const supabase = createClient();
      
      const { data: wfData } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });
      if (wfData) setWorkflows(wfData);

      const { data: accData } = await supabase
        .from('whatsapp_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      if (accData) setAccounts(accData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch execution logs from worker API or Supabase fallback
  const fetchLogs = async (showLoading = true) => {
    if (showLoading) setLogsLoading(true);
    const workerUrl = process.env.NEXT_PUBLIC_WHATSAPP_WORKER_URL || 'http://localhost:3001';
    
    try {
      const res = await fetch(`${workerUrl}/api/logs`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          setLogs(data.logs);
          setWorkerStatus('online');
          return;
        }
      }
      setWorkerStatus('offline');
    } catch {
      // Fallback to Supabase workflow_logs table if worker direct fetch fails
      try {
        const supabase = createClient();
        const { data: dbLogs } = await supabase
          .from('workflow_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (dbLogs && dbLogs.length > 0) {
          setLogs(dbLogs.map(l => ({
            id: l.id,
            timestamp: l.created_at,
            level: l.status || 'info',
            category: l.node_type || 'SYSTEM',
            message: l.message,
            details: l.details
          })));
        }
      } catch {}
      setWorkerStatus('offline');
    } finally {
      if (showLoading) setLogsLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!window.confirm("Clear all execution logs from console?")) return;
    const workerUrl = process.env.NEXT_PUBLIC_WHATSAPP_WORKER_URL || 'http://localhost:3001';
    try {
      await fetch(`${workerUrl}/api/logs/clear`, { method: 'POST' });
    } catch {}
    try {
      const supabase = createClient();
      await supabase.from('workflow_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch {}
    setLogs([]);
  };

  // Poll logs when on terminal tab
  useEffect(() => {
    if (activeTab !== 'terminal') return;
    fetchLogs(true);

    if (!autoRefreshLogs) return;
    const timer = setInterval(() => {
      fetchLogs(false);
    }, 3000);

    return () => clearInterval(timer);
  }, [activeTab, autoRefreshLogs]);

  const createWorkflow = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('workflows')
        .insert([{ name: 'New Automation Workflow', status: 'paused' }])
        .select()
        .single();
        
      if (!error && data) {
        router.push(`/dashboard/workflows/build/${data.id}`);
      } else {
        router.push('/dashboard/workflows/build/new');
      }
    } catch {
      router.push('/dashboard/workflows/build/new');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    // Optimistic update
    setWorkflows(workflows.map(w => w.id === id ? { ...w, status: newStatus } : w));
    const supabase = createClient();
    await supabase.from('workflows').update({ status: newStatus }).eq('id', id);
  };

  const deleteWorkflow = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workflow?")) return;
    setWorkflows(workflows.filter(w => w.id !== id));
    const supabase = createClient();
    await supabase.from('workflows').delete().eq('id', id);
  };

  // Poll a specific account to check for QR code or Connection Success
  const startPolling = (accountId) => {
    if (pollingInterval) clearInterval(pollingInterval);
    
    const interval = setInterval(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('whatsapp_accounts')
        .select('*')
        .eq('id', accountId)
        .single();
        
      if (data) {
        if (data.qr_code_url) {
          setQrCodeData(data.qr_code_url);
        }
        if (data.worker_status === 'connected') {
          // Connected successfully!
          clearInterval(interval);
          setIsGenerating(false);
          setQrCodeData(null);
          
          if (!data.token) {
            setConfiguringAccount(data);
          } else {
            setActiveAccountId(null);
            fetchData(); // Refresh the list
          }
        }
      }
    }, 2000); // Check every 2 seconds
    
    setPollingInterval(interval);
  };

  const generateQR = async () => {
    setIsGenerating(true);
    try {
      const supabase = createClient();
      // 1. Create a placeholder account in the DB
      const { data: account, error } = await supabase
        .from('whatsapp_accounts')
        .insert([{ phone_number: 'Connecting...', worker_status: 'pairing' }])
        .select()
        .single();
        
      if (error || !account) throw new Error("Failed to create account record");
      
      setActiveAccountId(account.id);
      
      const workerUrl = process.env.NEXT_PUBLIC_WHATSAPP_WORKER_URL || 'http://localhost:3001';
      // 2. Call the background worker to start the Baileys session
      await fetch(`${workerUrl}/api/whatsapp/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: account.id })
      });
      
      // 3. Start polling the DB for the QR code image
      startPolling(account.id);
      
    } catch (err) {
      console.error(err);
      alert("Failed to start WhatsApp worker. Is the worker running?");
      setIsGenerating(false);
    }
  };

  const saveConfiguration = async () => {
    if (!accountName.trim()) {
      alert("Please provide an account name.");
      return;
    }
    
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Calculate expiration date
      let expiresAt = null;
      if (accountDuration !== 'lifetime') {
        const date = new Date();
        date.setMonth(date.getMonth() + parseInt(accountDuration));
        expiresAt = date.toISOString();
      }
      
      // Generate a simple secure-looking token
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      await supabase
        .from('whatsapp_accounts')
        .update({ 
          name: accountName.trim(), 
          token: token, 
          expires_at: expiresAt 
        })
        .eq('id', configuringAccount.id);
        
      setConfiguringAccount(null);
      setActiveAccountId(null);
      fetchData(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert("Failed to save configuration.");
    } finally {
      setLoading(false);
    }
  };

  const disconnectAccount = async (id) => {
    if (!window.confirm("Disconnect this WhatsApp account? Automation will stop.")) return;
    const workerUrl = process.env.NEXT_PUBLIC_WHATSAPP_WORKER_URL || 'http://localhost:3001';
    // Tell worker to logout
    try {
      await fetch(`${workerUrl}/api/whatsapp/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: id })
      });
    } catch (e) {
      console.error("Worker might already be stopped", e);
    }

    setAccounts(accounts.filter(a => a.id !== id));
    const supabase = createClient();
    await supabase.from('whatsapp_accounts').delete().eq('id', id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">WhatsApp Automations</h1>
          <p className="text-brand-muted text-sm mt-1">Manage your connected worker accounts and active workflows.</p>
        </div>
        <button 
          onClick={createWorkflow}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#C2496B] text-white font-medium rounded-xl hover:bg-[#a83c5c] transition-all shadow-[0_4px_14px_rgba(194,73,107,0.3)]"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/5">
        {[
          { id: 'workflows', label: 'Workflows', icon: Workflow },
          { id: 'accounts', label: 'WhatsApp Worker', icon: Smartphone },
          { id: 'terminal', label: 'Terminal / Logs', icon: Terminal },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === tab.id ? 'text-[#C2496B]' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C2496B] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="pt-2">
        {activeTab === 'workflows' && (
          <div className="grid gap-4">
            {loading ? (
              <div className="text-gray-400 text-sm p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading workflows...
              </div>
            ) : workflows.length === 0 ? (
              <div className="bg-[#1A1A1B] border border-white/5 rounded-xl p-8 text-center text-gray-400">
                No workflows created yet. Click "New Workflow" to build your first automation.
              </div>
            ) : (
              workflows.map(wf => (
                <div key={wf.id} className="bg-[#1A1A1B] border border-white/5 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleStatus(wf.id, wf.status)}
                      title={wf.status === 'active' ? 'Pause Workflow' : 'Activate Workflow'}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-105 ${wf.status === 'active' ? 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                    >
                      {wf.status === 'active' ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                    </button>
                    <div>
                      <h3 className="font-semibold text-white">{wf.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Last run: {wf.last_run_at ? new Date(wf.last_run_at).toLocaleDateString() : 'Never'} • {wf.total_executions || 0} executions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      wf.status === 'active' ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-white/5 text-gray-400'
                    }`}>
                      {wf.status}
                    </span>
                    <Link href={`/dashboard/workflows/build/${wf.id}`} title="Edit Canvas" className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" />
                    </Link>
                    <button onClick={() => deleteWorkflow(wf.id)} title="Delete Workflow" className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="bg-[#1A1A1B] border border-white/5 rounded-xl p-8 text-center max-w-2xl mx-auto mt-4">
            {configuringAccount ? (
              <div className="flex flex-col items-center w-full">
                <div className="flex flex-col animate-in zoom-in-95 duration-300 w-full max-w-md">
                  <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-[#25D366]" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Configure Account</h2>
                  <p className="text-gray-400 text-sm mb-6">
                    Configure your new WhatsApp account instance to activate the workflow token.
                  </p>
                  
                  <div className="space-y-4 text-left">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Account Name</label>
                      <input
                        type="text"
                        className="w-full bg-[#2C2C2E] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#25D366]/50"
                        placeholder="e.g. Main Sales Line"
                        value={accountName}
                        onChange={e => setAccountName(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Token Duration</label>
                      <select
                        className="w-full bg-[#2C2C2E] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#25D366]/50"
                        value={accountDuration}
                        onChange={e => setAccountDuration(e.target.value)}
                      >
                        <option value="1">1 Month</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="lifetime">Lifetime</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">This account will disconnect when the token expires.</p>
                    </div>
                    
                    <button
                      onClick={saveConfiguration}
                      disabled={loading}
                      className="w-full py-3 mt-4 bg-[#25D366] text-black font-semibold rounded-lg hover:bg-[#20b858] transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Configuration'}
                    </button>
                    <button
                      onClick={() => setConfiguringAccount(null)}
                      disabled={loading}
                      className="w-full py-2 mt-2 bg-transparent text-gray-400 font-semibold rounded-lg hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : accounts.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white text-left mb-6">Connected Worker Instances</h2>
                {accounts.map(acc => (
                  <div key={acc.id} className="flex items-center justify-between p-4 bg-[#2C2C2E] rounded-xl border border-[#3A3A3C]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#25D366]/10 rounded-full flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-[#25D366]" />
                      </div>
                        <div className="text-left">
                          <div className="text-white font-medium">{acc.name || acc.phone_number}</div>
                          <div className="flex flex-col gap-1 mt-1">
                            {acc.name && (
                              <span className="text-[11px] text-gray-500">{acc.phone_number}</span>
                            )}
                            <div className="flex items-center gap-1.5">
                              {!acc.token ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                  <span className="text-[10px] text-yellow-500 font-medium uppercase tracking-wider">
                                    Action Required: Setup Incomplete
                                  </span>
                                </>
                              ) : (!acc.expires_at || new Date(acc.expires_at) > new Date()) ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]"></span>
                                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                    Token Active {acc.expires_at ? `(Expires ${new Date(acc.expires_at).toLocaleDateString()})` : '(Lifetime)'}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                  <span className="text-[10px] text-red-400 font-medium uppercase tracking-wider">
                                    Token Expired
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                    </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#25D366]/10 text-[#25D366]">
                          {acc.worker_status}
                        </span>
                        {!acc.token && acc.worker_status === 'connected' && (
                          <button onClick={() => setConfiguringAccount(acc)} className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors ml-2" title="Complete Setup">
                            <Settings className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => disconnectAccount(acc.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-2" title="Disconnect">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                  {qrCodeData ? (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                      <h2 className="text-xl font-bold text-white mb-2">Scan to Link Worker</h2>
                      <p className="text-gray-400 text-sm max-w-sm mb-8">
                        Open WhatsApp on your phone, tap Menu or Settings and select Linked Devices. Point your phone to this screen to capture the code.
                      </p>
                      
                      <div className="p-4 bg-white rounded-2xl mb-8">
                        <img src={qrCodeData} alt="WhatsApp QR Code" className="w-64 h-64 opacity-90" />
                      </div>
                    </div>
                  ) : isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-300">
                      <div className="w-12 h-12 border-4 border-[#25D366]/20 border-t-[#25D366] rounded-full animate-spin mb-6" />
                      <p className="text-gray-300 font-medium">Connecting to WhatsApp Worker...</p>
                      <p className="text-gray-500 text-sm mt-2">Initializing secure proxy session.</p>
                    </div>
                  ) : (
                    <>
                    <div className="w-20 h-20 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-6">
                      <QrCode className="w-10 h-10 text-[#25D366]" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-3">Connect WhatsApp Worker</h2>
                    <p className="text-gray-400 text-sm max-w-md mb-8 leading-relaxed">
                      Scan a QR code to link your regular WhatsApp or WhatsApp Business app directly to our secure background worker. No paid Meta API required.
                    </p>
                    <button 
                      onClick={generateQR}
                      className="px-8 py-3 bg-[#25D366] text-black font-semibold rounded-xl hover:bg-[#20b858] transition-colors shadow-lg shadow-[#25D366]/20 flex items-center gap-2"
                    >
                      <QrCode className="w-5 h-5" />
                      Generate QR Code
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'terminal' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Terminal Control Bar */}
            <div className="bg-[#141518] border border-white/10 rounded-xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Left: Status Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs font-mono">
                  <span className={`w-2.5 h-2.5 rounded-full ${workerStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-gray-300">
                    Worker: <span className={workerStatus === 'online' ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                      {workerStatus === 'online' ? 'Connected (Live)' : 'Checking / Standby'}
                    </span>
                  </span>
                </div>

                {accounts.find(a => a.worker_status === 'connected') ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-emerald-500/20 rounded-lg text-xs font-mono text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>WhatsApp Active: {accounts.find(a => a.worker_status === 'connected')?.phone_number || 'Paired'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-red-500/20 rounded-lg text-xs font-mono text-red-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>No Active WhatsApp Session</span>
                  </div>
                )}

                <div className="text-xs text-gray-500 font-mono">
                  {logs.length} total event{logs.length === 1 ? '' : 's'}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs font-mono text-gray-200 focus:outline-none focus:border-[#C2496B] transition-colors"
                  />
                </div>

                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-gray-300 cursor-pointer hover:bg-white/5 transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={autoRefreshLogs}
                    onChange={(e) => setAutoRefreshLogs(e.target.checked)}
                    className="rounded border-white/20 bg-transparent text-[#C2496B] focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                  />
                  <span>Live 3s</span>
                </label>

                <button
                  onClick={() => fetchLogs(true)}
                  disabled={logsLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-gray-200 transition-colors disabled:opacity-50"
                  title="Refresh Logs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={clearLogs}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs font-mono text-red-400 transition-colors"
                  title="Clear Console"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All Logs', count: logs.length },
                { id: 'success', label: 'Success', count: logs.filter(l => l.level === 'success').length, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
                { id: 'info', label: 'Info', count: logs.filter(l => l.level === 'info').length, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
                { id: 'warning', label: 'Warnings', count: logs.filter(l => l.level === 'warning').length, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
                { id: 'error', label: 'Errors', count: logs.filter(l => l.level === 'error').length, color: 'text-red-400 border-red-500/30 bg-red-500/10' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setLogFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors border ${
                    logFilter === f.id
                      ? f.color || 'bg-white/15 text-white border-white/30 font-semibold'
                      : 'bg-black/30 border-white/5 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            {/* Terminal Console View */}
            <div className="bg-[#0D0E12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Window Title Bar */}
              <div className="bg-[#15161B] px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
                  </div>
                  <span className="text-xs font-mono text-gray-400 ml-2">whatsapp-engine@worker:~ execution.log</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-gray-500">
                  <span>Render Web Service</span>
                  <span>•</span>
                  <span>Port 3001</span>
                </div>
              </div>

              {/* Console Body */}
              <div className="p-4 font-mono text-xs max-h-[600px] overflow-y-auto custom-scrollbar divide-y divide-white/5">
                {logsLoading && logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin text-[#C2496B] mb-3" />
                    <p>Connecting to worker and streaming logs...</p>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <Terminal className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-300 font-semibold mb-1">No Execution Logs Recorded Yet</p>
                    <p className="text-gray-500 text-xs max-w-md mx-auto leading-relaxed">
                      Logs will automatically stream here when a lead is captured or a workflow executes. You can test your workflow by creating a lead or submitting a landing page form.
                    </p>
                  </div>
                ) : (
                  logs
                    .filter(log => {
                      const matchesFilter = logFilter === 'all' || log.level === logFilter;
                      const term = logSearch.toLowerCase();
                      const matchesSearch = !term || (
                        (log.message && log.message.toLowerCase().includes(term)) ||
                        (log.category && log.category.toLowerCase().includes(term)) ||
                        (log.details && JSON.stringify(log.details).toLowerCase().includes(term))
                      );
                      return matchesFilter && matchesSearch;
                    })
                    .map((log, idx) => {
                      const isExpanded = expandedLogIds.has(log.id || idx);
                      const levelColor = 
                        log.level === 'error' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                        log.level === 'warning' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                        log.level === 'success' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                        'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';

                      const timeStr = log.timestamp 
                        ? new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : '00:00:00';

                      return (
                        <div key={log.id || idx} className="py-2.5 px-2 hover:bg-white/[0.02] rounded transition-colors group">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <span className="text-gray-500 select-none shrink-0 font-mono text-[11px] pt-0.5">
                                {timeStr}
                              </span>

                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border tracking-wider shrink-0 ${levelColor}`}>
                                {log.category || log.level}
                              </span>

                              <p className={`break-words leading-relaxed ${
                                log.level === 'error' ? 'text-red-300 font-semibold' :
                                log.level === 'warning' ? 'text-amber-300' :
                                log.level === 'success' ? 'text-emerald-300' :
                                'text-gray-300'
                              }`}>
                                {log.message}
                              </p>
                            </div>

                            {log.details && (
                              <button
                                onClick={() => {
                                  const id = log.id || idx;
                                  const next = new Set(expandedLogIds);
                                  if (next.has(id)) next.delete(id);
                                  else next.add(id);
                                  setExpandedLogIds(next);
                                }}
                                className="text-gray-500 hover:text-gray-300 text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 shrink-0 transition-colors flex items-center gap-1"
                              >
                                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                Payload
                              </button>
                            )}
                          </div>

                          {/* Expanded JSON details */}
                          {isExpanded && log.details && (
                            <div className="mt-2.5 ml-14 p-3 bg-black/60 border border-white/10 rounded-lg text-[11px] text-gray-300 overflow-x-auto">
                              <pre>{JSON.stringify(log.details, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Messages Sent (Worker)', value: '0', change: '+0%' },
              { label: 'Delivery Rate', value: '0%', change: '+0%' },
              { label: 'Active Workflows', value: workflows.filter(w => w.status === 'active').length.toString(), change: '0' },
            ].map(stat => (
              <div key={stat.label} className="bg-[#1A1A1B] border border-white/5 rounded-xl p-6">
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-white">{stat.value}</span>
                  <span className={`text-xs font-semibold ${stat.change.startsWith('+') ? 'text-green-500' : 'text-gray-500'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
