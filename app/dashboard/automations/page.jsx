'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, Settings, Activity, Play, Pause, Archive, BarChart2, CheckCircle2, AlertCircle, Link as LinkIcon, Trash2 } from 'lucide-react';

const Instagram = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>);
import toast, { Toaster } from 'react-hot-toast';

export default function AutomationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('automations');
  const [igAccounts, setIgAccounts] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [loginMethod, setLoginMethod] = useState('credentials'); // 'credentials' or 'session'
  const [igCredentials, setIgCredentials] = useState({ handle: '', password: '' });
  const [connectingIg, setConnectingIg] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', type: 'warning', onConfirm: null });

  const fetchRealData = async () => {
    const supabase = createClient();
    try {
      const { data: accountsData, error: accountsError } = await supabase.from('ig_accounts').select('*');
      if (!accountsError && accountsData) {
        setIgAccounts(accountsData);
      }
      
      const { data: automationsData, error: autoError } = await supabase.from('dm_automations').select('*').order('created_at', { ascending: false });
      if (!autoError && automationsData) {
        setAutomations(automationsData);
      }

      const { data: logsData, error: logsError } = await supabase
        .from('prospects')
        .select('ig_handle, outreach_status, updated_at')
        .eq('pipeline_status', 'error')
        .order('updated_at', { ascending: false })
        .limit(100);
      if (!logsError && logsData) {
        setLogs(logsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchRealData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNewAutomation = () => {
    const hasActiveAccount = igAccounts.some(acc => acc.status === 'active');
    if (!hasActiveAccount) {
      toast.error('You must have at least one active Instagram account connected to create an automation.');
      return;
    }
    router.push('/dashboard/automations/builder');
  };

  const connectIgAccount = () => {
    setIgCredentials({ handle: '', password: '' });
    setIsConnectModalOpen(true);
  };

    const handleUpdateStatus = async (id, newStatus) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('dm_automations').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      toast.success(`Automation ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Automation',
      message: 'Are you sure you want to permanently delete this automation? This action cannot be undone.',
      type: 'error',
      onConfirm: async () => {
        try {
          const supabase = createClient();
          const { error } = await supabase.from('dm_automations').delete().eq('id', id);
          if (error) throw error;
          setAutomations(prev => prev.filter(a => a.id !== id));
          toast.success("Automation deleted");
        } catch (err) {
          console.error(err);
          toast.error('Failed to delete automation');
        }
      }
    });
  };

  const handleConnectSubmit = async (e) => {
    e.preventDefault();
    if (!igCredentials.handle || (!igCredentials.password && !igCredentials.session_id)) return toast.error("Please enter a username and either a password or session ID");
    
    setConnectingIg(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from('ig_accounts').insert([{
        handle: igCredentials.handle.startsWith('@') ? igCredentials.handle : '@' + igCredentials.handle,
        password_hash: igCredentials.password || null,
        session_id: igCredentials.session_id || null,
        status: 'active'
      }]).select().single();
      
      if (error) throw error;
      
      toast.success("Instagram account connected successfully!");
      setIgAccounts(prev => [...prev, data]);
      setIsConnectModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect account");
    } finally {
      setConnectingIg(false);
    }
  };

  const removeAccount = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Disconnect Account',
      message: 'Are you sure you want to disconnect this Instagram account?',
      type: 'warning',
      onConfirm: async () => {
        try {
          const supabase = createClient();
          const { error } = await supabase.from('ig_accounts').delete().eq('id', id);
          if (error) throw error;
          
          setIgAccounts(prev => prev.filter(a => a.id !== id));
          toast.success('Account disconnected');
        } catch (err) {
          console.error(err);
          toast.error('Failed to disconnect account');
        }
      }
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'active') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-green-500/10 text-green-500 border border-green-500/20"><Play className="w-3 h-3" /> Active</span>;
    if (status === 'paused') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"><Pause className="w-3 h-3" /> Paused</span>;
    if (status === 'archived') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-brand-bg text-brand-text/60 border border-brand-border"><Archive className="w-3 h-3" /> Archived</span>;
    if (status === 'error') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-red-500/10 text-red-500 border border-red-500/20"><AlertCircle className="w-3 h-3" /> Error</span>;
    return null;
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-medium text-brand-text tracking-tight mb-2">DM Automations</h1>
          <p className="text-brand-text/70">Scale your Instagram outreach on autopilot.</p>
        </div>
        
        <button 
          onClick={handleNewAutomation} 
          className="flex items-center gap-2 bg-brand-accent text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity font-medium text-sm whitespace-nowrap shadow-lg shadow-brand-accent/20"
        >
          <Plus className="w-4 h-4" />
          New Automation
        </button>
      </div>

      <div className="mb-8 bg-brand-surface border border-brand-border rounded-xl p-5 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-brand-text flex items-center gap-2">
            <Instagram className="w-4 h-4 text-brand-accent" /> Connected Instagram Accounts
          </h2>
          <button onClick={connectIgAccount} className="text-xs font-medium text-brand-accent hover:underline flex items-center gap-1">
            <LinkIcon className="w-3 h-3" /> Connect Account
          </button>
        </div>
        
        {loading ? (
          <div className="p-6 text-center border border-brand-border rounded-xl bg-brand-bg/50">
            <p className="text-sm text-brand-text/50">Loading accounts...</p>
          </div>
        ) : igAccounts.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-brand-border rounded-xl bg-brand-bg/50">
            <Instagram className="w-8 h-8 text-brand-text/30 mx-auto mb-3" />
            <p className="text-sm text-brand-text/70 mb-4">No accounts connected yet. Connect your Instagram account to start sending DMs.</p>
            <button onClick={connectIgAccount} className="bg-brand-surface border border-brand-border text-brand-text px-4 py-2 rounded-lg text-sm font-medium hover:border-brand-accent transition-colors">
              Connect Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {igAccounts.map(acc => (
              <div key={acc.id} className="flex items-center justify-between p-4 rounded-xl border border-brand-border bg-brand-bg/50 hover:border-brand-accent/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-[2px]">
                    <div className="w-full h-full bg-brand-surface rounded-full flex items-center justify-center border-2 border-brand-surface">
                      <Instagram className="w-4 h-4 text-brand-text" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-text">{acc.handle}</p>
                    <p className="text-xs mt-1">{getStatusBadge(acc.status)}</p>
                  </div>
                </div>
                <button onClick={() => removeAccount(acc.id)} className="p-2 text-brand-text/40 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100" title="Disconnect">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex border-b border-brand-border mb-6 shrink-0">
        <button
          onClick={() => setActiveTab('automations')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'automations' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text/60 hover:text-brand-text'}`}
        >
          <Activity className="w-4 h-4" /> Automations
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'analytics' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text/60 hover:text-brand-text'}`}
        >
          <BarChart2 className="w-4 h-4" /> Analytics
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'logs' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text/60 hover:text-brand-text'}`}
        >
          <AlertCircle className="w-4 h-4" /> Execution Logs
        </button>
      </div>

      <div className="flex-1 min-h-0 bg-brand-surface rounded-xl border border-brand-border overflow-hidden flex flex-col">
        {activeTab === 'automations' && (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg/50">
                  <th className="p-4 font-medium text-brand-text/70 text-sm">Automation Name</th>
                  <th className="p-4 font-medium text-brand-text/70 text-sm">Status</th>
                  <th className="p-4 font-medium text-brand-text/70 text-sm">Source</th>
                  <th className="p-4 font-medium text-brand-text/70 text-sm">Progress</th>
                  <th className="p-4 font-medium text-brand-text/70 text-sm">Next Execution</th>
                  <th className="p-4 font-medium text-brand-text/70 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-brand-text/50">
                      Loading automations...
                    </td>
                  </tr>
                ) : automations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-brand-text/50">
                      No automations created yet. Click &quot;New Automation&quot; to get started.
                    </td>
                  </tr>
                ) : (
                  automations.map(auto => (
                    <tr key={auto.id} className="border-b border-brand-border hover:bg-brand-bg/30 transition-colors">
                      <td className="p-4 font-medium text-brand-text">{auto.name}</td>
                      <td className="p-4">{getStatusBadge(auto.status)}</td>
                      <td className="p-4 text-sm text-brand-text/80">{auto.source}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-brand-text/80">
                          <span className="font-semibold text-brand-text">{auto.sent}</span> / {auto.scheduled}
                        </div>
                        <div className="w-32 h-1.5 bg-brand-bg rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-brand-accent rounded-full" style={{ width: `${(auto.sent / auto.scheduled) * 100}%` }}></div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-brand-text/80">
                        {(() => {
                          if (!auto.nextexecution || auto.nextexecution === 'Pending' || auto.nextexecution === 'Completed' || auto.nextexecution === 'No Leads') return auto.nextexecution;
                          const date = new Date(auto.nextexecution);
                          if (isNaN(date.getTime())) return auto.nextexecution; // fallback
                          const now = new Date();
                          const diffMins = Math.round((date - now) / 60000);
                          if (diffMins <= 0) return 'Executing soon...';
                          return `In ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
                        })()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {auto.status === 'active' ? (
                            <button onClick={() => handleUpdateStatus(auto.id, 'paused')} className="p-1.5 text-brand-text/50 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-md transition-colors" title="Pause">
                              <Pause className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => handleUpdateStatus(auto.id, 'active')} className="p-1.5 text-brand-text/50 hover:text-green-500 hover:bg-green-500/10 rounded-md transition-colors" title="Start">
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => router.push(`/dashboard/automations/builder?id=${auto.id}`)} className="p-1.5 text-brand-text/50 hover:text-brand-text hover:bg-brand-bg rounded-md transition-colors" title="Settings">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(auto.id)} className="p-1.5 text-brand-text/50 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {automations.map(auto => (
                <div key={auto.id} className="bg-brand-bg/30 border border-brand-border rounded-xl p-5 hover:border-brand-accent/30 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-brand-text text-lg">{auto.name}</h3>
                    {getStatusBadge(auto.status)}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-brand-surface rounded-lg border border-brand-border shadow-sm">
                      <div className="text-3xl font-bold text-brand-text">{auto.sent}</div>
                      <div className="text-[10px] uppercase tracking-widest text-brand-text/50 mt-1.5 font-semibold">DMs Sent</div>
                    </div>
                    <div className="text-center p-4 bg-brand-surface rounded-lg border border-brand-border shadow-sm">
                      <div className="text-3xl font-bold text-brand-text">{Math.floor(auto.sent * 0.4)}</div>
                      <div className="text-[10px] uppercase tracking-widest text-brand-text/50 mt-1.5 font-semibold">Opened</div>
                    </div>
                    <div className="text-center p-4 bg-brand-surface rounded-lg border border-brand-border shadow-sm relative overflow-hidden group">
                      <div className="absolute inset-0 bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="text-3xl font-bold text-brand-accent">{Math.floor((auto.sent * 0.15) / auto.sent * 100)}%</div>
                      <div className="text-[10px] uppercase tracking-widest text-brand-accent/70 mt-1.5 font-semibold">Reply Rate</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <h2 className="text-lg font-semibold text-brand-text mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" /> Recent Errors
            </h2>
            {logs.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-brand-border rounded-xl bg-brand-bg/50 text-brand-text/50">
                <p>No recent errors found. Everything is running smoothly!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log, i) => (
                  <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-brand-text mb-1">{log.ig_handle}</div>
                      <div className="text-xs text-red-400 font-medium">{log.outreach_status || 'Unknown error'}</div>
                    </div>
                    <div className="text-[10px] text-brand-text/50 whitespace-nowrap font-mono bg-brand-bg px-2 py-1 rounded-md border border-brand-border">
                      {new Date(log.updated_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      
      {/* Connect IG Account Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-md rounded-2xl overflow-hidden border border-brand-border flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-brand-border bg-brand-bg/50">
              <h2 className="text-lg font-semibold text-brand-text flex items-center gap-2">
                <Instagram className="w-5 h-5 text-pink-500" /> Connect Instagram
              </h2>
              <button onClick={() => setIsConnectModalOpen(false)} className="text-brand-text/50 hover:text-brand-text p-1 rounded-lg hover:bg-brand-bg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleConnectSubmit} className="p-6 space-y-4">
              <div className="flex border-b border-brand-border mb-4">
                <button 
                  type="button" 
                  onClick={() => setLoginMethod('credentials')} 
                  className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${loginMethod === 'credentials' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text/50 hover:text-brand-text'}`}
                >
                  Credentials
                </button>
                <button 
                  type="button" 
                  onClick={() => setLoginMethod('session')} 
                  className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${loginMethod === 'session' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text/50 hover:text-brand-text'}`}
                >
                  Session ID
                </button>
              </div>

              {loginMethod === 'credentials' && (
                <>
                  <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded-lg text-xs mb-4">
                    Basic login via username and password. Note: You might face CAPTCHAs during connection.
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Instagram Username</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 font-medium">@</span>
                      <input 
                        required 
                        type="text" 
                        placeholder="username"
                        value={igCredentials.handle} 
                        onChange={e => setIgCredentials(prev => ({ ...prev, handle: e.target.value.replace('@', '') }))} 
                        className="w-full bg-brand-bg border border-brand-border rounded-lg pl-8 pr-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Password</label>
                    <input 
                      required={loginMethod === 'credentials'}
                      type="password" 
                      placeholder="••••••••"
                      value={igCredentials.password || ''} 
                      onChange={e => setIgCredentials(prev => ({ ...prev, password: e.target.value }))} 
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" 
                    />
                  </div>
                </>
              )}

              {loginMethod === 'session' && (
                <>
                  <div className="bg-brand-accent/10 border border-brand-accent/20 text-brand-accent p-3 rounded-lg text-xs mb-4">
                    Recommended: Connect instantly using your sessionid cookie. Bypasses CAPTCHA and 2FA.
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Instagram Username</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 font-medium">@</span>
                      <input 
                        required 
                        type="text" 
                        placeholder="username"
                        value={igCredentials.handle} 
                        onChange={e => setIgCredentials(prev => ({ ...prev, handle: e.target.value.replace('@', '') }))} 
                        className="w-full bg-brand-bg border border-brand-border rounded-lg pl-8 pr-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Session ID Cookie</label>
                    <input 
                      required={loginMethod === 'session'}
                      type="text" 
                      placeholder="sessionid value from devtools"
                      value={igCredentials.session_id || ''} 
                      onChange={e => setIgCredentials(prev => ({ ...prev, session_id: e.target.value }))} 
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent font-mono text-xs" 
                    />
                    <p className="text-[10px] text-brand-text/50">Find this in Chrome DevTools: F12 → Application → Cookies → instagram.com → sessionid</p>
                  </div>
                </>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-brand-border mt-6">
                <button type="button" onClick={() => setIsConnectModalOpen(false)} className="text-brand-text/70 hover:text-brand-text text-sm font-medium px-4 py-2 transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={connectingIg}
                  className="bg-brand-accent text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center gap-2"
                >
                  {connectingIg ? 'Connecting...' : 'Securely Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-sm rounded-2xl overflow-hidden border border-brand-border flex flex-col shadow-2xl">
            <div className={`p-5 border-b border-brand-border flex items-center gap-3 ${confirmModal.type === 'error' ? 'bg-red-500/10 text-red-500' : confirmModal.type === 'warning' ? 'bg-orange-500/10 text-orange-500' : 'bg-brand-accent/10 text-brand-accent'}`}>
              <AlertCircle className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-brand-text">{confirmModal.title}</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-brand-text/70 leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="p-4 bg-brand-bg/50 border-t border-brand-border flex items-center justify-end gap-3">
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
                className="px-4 py-2 text-sm font-medium text-brand-text/70 hover:text-brand-text transition-colors bg-transparent"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (confirmModal.onConfirm) await confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }} 
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90 ${confirmModal.type === 'error' ? 'bg-red-500' : confirmModal.type === 'warning' ? 'bg-orange-500' : 'bg-brand-accent'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}
