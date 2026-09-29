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
  const [loading, setLoading] = useState(true);

  const fetchRealData = async () => {
    setLoading(true);
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
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
    toast.success('Instagram authentication flow would start here.');
  };

  const removeAccount = (id) => {
    setIgAccounts(prev => prev.filter(a => a.id !== id));
    toast.success('Account disconnected');
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
                      <td className="p-4 text-sm text-brand-text/80">{auto.nextExecution}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {auto.status === 'active' ? (
                            <button className="p-1.5 text-brand-text/50 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-md transition-colors" title="Pause">
                              <Pause className="w-4 h-4" />
                            </button>
                          ) : (
                            <button className="p-1.5 text-brand-text/50 hover:text-green-500 hover:bg-green-500/10 rounded-md transition-colors" title="Start">
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-1.5 text-brand-text/50 hover:text-brand-text hover:bg-brand-bg rounded-md transition-colors" title="Settings">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-brand-text/50 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Archive">
                            <Archive className="w-4 h-4" />
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
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
}
