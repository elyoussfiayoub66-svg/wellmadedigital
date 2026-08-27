'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  TrendingUp, Wallet, Users, FolderGit2, AlertCircle, TrendingDown, Award 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    netProfit: 0,
    pipelineValue: 0,
    conversionRate: 0,
    activeProjects: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  
  // Chart Data
  const [financeData, setFinanceData] = useState([]); // Month, Revenue, Expenses
  const [leadStatusData, setLeadStatusData] = useState([]);
  const [projectStatusData, setProjectStatusData] = useState([]);

  const COLORS = ['#22c55e', '#eab308', '#3b82f6', '#8b5cf6', '#ef4444'];

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      const supabase = createClient();
      
      try {
        // 1. Fetch Invoices (Agency Revenue 13%)
        const { data: invoices } = await supabase.from('invoices').select('*').eq('status', 'Paid');
        const agencyRevenue = (invoices || []).reduce((sum, inv) => sum + Number(inv.amount), 0) * 0.13;
        
        // 2. Fetch Expenses (Agency Profit)
        const { data: expenses } = await supabase.from('expenses').select('*');
        const totalExpenses = (expenses || []).reduce((sum, exp) => sum + Number(exp.amount), 0);
        
        // 3. Fetch Projects (Pipeline, Status)
        const { data: projects } = await supabase.from('projects').select('*, leads(agency_name)');
        const activeProjects = (projects || []).filter(p => p.status === 'Active');
        const pipelineValue = activeProjects.reduce((sum, p) => sum + Number(p.value || 0), 0);
        
        // 4. Fetch Leads (Conversion Rate)
        const { data: leads } = await supabase.from('leads').select('*');
        const wonLeads = (leads || []).filter(l => l.status === 'CLOSED_WON');
        const conversionRate = leads?.length ? (wonLeads.length / leads.length) * 100 : 0;
        
        setMetrics({
          netProfit: agencyRevenue - totalExpenses,
          pipelineValue,
          conversionRate,
          activeProjects: activeProjects.length
        });

        // 5. Build Top Performers
        const { data: profiles } = await supabase.from('profiles').select('id, full_name');
        const { data: pmData } = await supabase.from('project_members').select('user_id, split_percentage, project_id');
        
        if (profiles && invoices && pmData) {
            const perf = profiles.map(user => {
               let rev = 0;
               invoices.forEach(inv => {
                   const member = pmData.find(pm => pm.project_id === inv.projects?.id && pm.user_id === user.id);
                   if (member) {
                       const split = member.split_percentage != null ? member.split_percentage : 100;
                       const teamPool = Number(inv.amount) * 0.87;
                       rev += teamPool * (split / 100);
                   } else {
                     // try matching project_id if it's there
                     const directMember = pmData.find(pm => pm.project_id === inv.project_id && pm.user_id === user.id);
                     if (directMember) {
                       const split = directMember.split_percentage != null ? directMember.split_percentage : 100;
                       const teamPool = Number(inv.amount) * 0.87;
                       rev += teamPool * (split / 100);
                     }
                   }
               });
               return { ...user, revenue: rev };
            }).sort((a, b) => b.revenue - a.revenue).slice(0, 3);
            
            setTopPerformers(perf);
        }

        // 6. Chart Data
        
        // Lead Status Chart
        const statusCounts = (leads || []).reduce((acc, lead) => {
            acc[lead.status || 'NEW'] = (acc[lead.status || 'NEW'] || 0) + 1;
            return acc;
        }, {});
        setLeadStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

        // Project Status Chart
        const pStatusCounts = (projects || []).reduce((acc, proj) => {
            acc[proj.status || 'Planning'] = (acc[proj.status || 'Planning'] || 0) + 1;
            return acc;
        }, {});
        setProjectStatusData(Object.entries(pStatusCounts).map(([name, value]) => ({ name, value })));

        // Finance Chart (Mocking past 6 months based on actual data if possible)
        const monthlyFinance = {};
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStr = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            last6Months.push(monthStr);
            monthlyFinance[monthStr] = { month: monthStr, Revenue: 0, Expenses: 0 };
        }

        invoices?.forEach(inv => {
            const d = new Date(inv.created_at);
            const m = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            if (monthlyFinance[m]) {
                monthlyFinance[m].Revenue += (Number(inv.amount) * 0.13);
            }
        });

        expenses?.forEach(exp => {
             const d = new Date(exp.expense_date);
             const m = d.toLocaleString('default', { month: 'short', year: '2-digit' });
             if (monthlyFinance[m]) {
                 monthlyFinance[m].Expenses += Number(exp.amount);
             }
        });

        setFinanceData(last6Months.map(m => monthlyFinance[m]));

        // Recent Activity
        const recent = [
            ...(invoices || []).map(i => ({ type: 'invoice', date: new Date(i.created_at), title: `Invoice ${i.invoice_number} Paid`, amount: i.amount })),
            ...(expenses || []).map(e => ({ type: 'expense', date: new Date(e.expense_date), title: `Expense: ${e.category}`, amount: e.amount })),
            ...(projects || []).map(p => ({ type: 'project', date: new Date(p.created_at), title: `New Project: ${p.name}`, amount: 0 }))
        ].sort((a, b) => b.date - a.date).slice(0, 5);
        
        setRecentActivity(recent);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  if (loading) {
      return (
        <div className="space-y-8 animate-pulse pb-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-brand-dark/10 rounded w-64 mb-3"></div>
              <div className="h-4 bg-brand-dark/10 rounded w-96"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-brand-surface p-6 rounded-2xl border border-brand-border h-[140px]">
                <div className="h-4 bg-brand-dark/10 rounded w-32 mb-4"></div>
                <div className="h-8 bg-brand-dark/10 rounded w-24"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-brand-surface rounded-2xl border border-brand-border h-[400px]"></div>
            <div className="bg-brand-surface rounded-2xl border border-brand-border h-[400px]"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-brand-surface rounded-2xl border border-brand-border h-[380px]"></div>
            ))}
          </div>
        </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-text tracking-tight mb-2">Agency Command Center</h1>
          <p className="text-brand-text/70">A complete overview of your agency's performance.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-brand-surface to-brand-surface/50 p-6 rounded-2xl border border-brand-border  relative overflow-hidden group hover:border-brand-accent/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-16 h-16 text-brand-accent" />
          </div>
          <h3 className="text-sm font-semibold text-brand-text/70 mb-2 uppercase tracking-wider">Net Agency Profit</h3>
          <div className={`text-3xl font-black ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            MAD {metrics.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-brand-text/50 mt-2 font-medium">All Time Profit</div>
        </div>

        <div className="bg-gradient-to-br from-brand-surface to-brand-surface/50 p-6 rounded-2xl border border-brand-border  relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-blue-500" />
          </div>
          <h3 className="text-sm font-semibold text-brand-text/70 mb-2 uppercase tracking-wider">Pipeline Value</h3>
          <div className="text-3xl font-black text-brand-text">MAD {metrics.pipelineValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className="text-xs text-brand-text/50 mt-2 font-medium">From Active Projects</div>
        </div>

        <div className="bg-gradient-to-br from-brand-surface to-brand-surface/50 p-6 rounded-2xl border border-brand-border  relative overflow-hidden group hover:border-green-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-16 h-16 text-green-500" />
          </div>
          <h3 className="text-sm font-semibold text-brand-text/70 mb-2 uppercase tracking-wider">Conversion Rate</h3>
          <div className="text-3xl font-black text-brand-text">{metrics.conversionRate.toFixed(1)}%</div>
          <div className="text-xs text-brand-text/50 mt-2 font-medium">Leads to Closed Won</div>
        </div>

        <div className="bg-gradient-to-br from-brand-surface to-brand-surface/50 p-6 rounded-2xl border border-brand-border  relative overflow-hidden group hover:border-orange-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FolderGit2 className="w-16 h-16 text-orange-500" />
          </div>
          <h3 className="text-sm font-semibold text-brand-text/70 mb-2 uppercase tracking-wider">Active Projects</h3>
          <div className="text-3xl font-black text-brand-text">{metrics.activeProjects}</div>
          <div className="text-xs text-brand-text/50 mt-2 font-medium">Currently in progress</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-brand-surface rounded-2xl border border-brand-border  p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-bold text-brand-text mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-accent" /> Revenue vs Expenses (Past 6 Months)
          </h2>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,0,0,0.5)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,0,0,0.5)', fontSize: 12 }} tickFormatter={(val) => `${val/1000}k`} dx={-10} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                   formatter={(value) => [`MAD ${Number(value).toLocaleString()}`, '']}
                   labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="Revenue" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-brand-surface rounded-2xl border border-brand-border  p-6 flex flex-col">
          <h2 className="text-lg font-bold text-brand-text mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Top Performers
          </h2>
          <div className="space-y-4 flex-1">
            {topPerformers.length === 0 ? (
                <div className="text-brand-text/50 text-sm h-full flex items-center justify-center">No performance data yet.</div>
            ) : (
                topPerformers.map((user, idx) => (
                  <div key={user.id} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-brand-bg/50 to-transparent border border-brand-border hover:border-brand-border transition-colors">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-white  text-lg ${idx === 0 ? 'bg-amber-500 border-2 border-amber-200' : idx === 1 ? 'bg-slate-400 border-2 border-slate-200' : 'bg-orange-700 border-2 border-orange-300'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-brand-text truncate text-base">{user.full_name || 'Team Member'}</p>
                      <p className="text-xs text-brand-text/60 font-medium mt-1">MAD {user.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} generated</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Leads Distribution */}
        <div className="bg-brand-surface rounded-2xl border border-brand-border  p-6 flex flex-col h-[380px]">
          <h2 className="text-lg font-bold text-brand-text mb-2">Leads by Status</h2>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadStatusData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value">
                  {leadStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [value, 'Leads']} 
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects Distribution */}
        <div className="bg-brand-surface rounded-2xl border border-brand-border  p-6 flex flex-col h-[380px]">
          <h2 className="text-lg font-bold text-brand-text mb-2">Projects by Status</h2>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value">
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [value, 'Projects']} 
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-brand-surface rounded-2xl border border-brand-border  p-6 overflow-hidden flex flex-col h-[380px]">
          <h2 className="text-lg font-bold text-brand-text mb-6">Recent Activity</h2>
          <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
            {recentActivity.length === 0 ? (
                <div className="text-brand-text/50 text-sm h-full flex items-center justify-center">No recent activity.</div>
            ) : (
                recentActivity.map((activity, i) => (
                  <div key={i} className="flex gap-4 p-3 rounded-lg hover:bg-brand-bg/50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white  ${
                        activity.type === 'invoice' ? 'bg-green-500' : 
                        activity.type === 'expense' ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                      {activity.type === 'invoice' ? <Wallet className="w-5 h-5" /> : 
                       activity.type === 'expense' ? <TrendingDown className="w-5 h-5" /> : 
                       <FolderGit2 className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-brand-text truncate">{activity.title}</p>
                      <p className="text-xs text-brand-text/60 mt-1">{activity.date.toLocaleDateString()} at {activity.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
