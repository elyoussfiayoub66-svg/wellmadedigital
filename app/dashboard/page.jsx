'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  TrendingUp, TrendingDown, Wallet, Users, FolderGit2, AlertCircle, Award, Search, Calendar, PhoneCall, MessageSquare, Activity, MoreHorizontal, ArrowUpRight, ArrowDownRight, Target, Zap, DollarSign, PieChart as PieChartIcon, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  AreaChart, Area, ComposedChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  
  // High-level Metrics
  const [metrics, setMetrics] = useState({
    collectedRevenueTM: 0,
    collectedRevenueTrend: 0,
    agencyBudgetAllTime: 0,
    netProfitTM: 0,
    netProfitTrend: 0,
    pipelineValue: 0,
    activeProjects: 0,
    totalProspects: 0,
    meetingsBooked: 0,
    dmsSent: 0,
    dmsSentTrend: 0,
    replyRate: 0,
    cac: 0,
    arpc: 0,
    closeRate: 0,
    showupRate: 0,
    roas: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  
  // Charts Data
  const [financeData, setFinanceData] = useState([]); 
  const [leadStatusData, setLeadStatusData] = useState([]);
  const [projectStatusData, setProjectStatusData] = useState([]);
  const [outreachData, setOutreachData] = useState([]);
  const [meetingsSourceData, setMeetingsSourceData] = useState([]);
  const [closeRateData, setCloseRateData] = useState([]);
  const [weeklyPerfData, setWeeklyPerfData] = useState([]);

  // Mini Chart Trends
  const [budgetTrendData, setBudgetTrendData] = useState([]);
  const [revenueTrendData, setRevenueTrendData] = useState([]);
  const [profitTrendData, setProfitTrendData] = useState([]);

  const COLORS = ['#ec4899', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#10b981'];

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      const supabase = createClient();
      
      const fetchAll = async (table, select = '*') => {
        let all = [];
        let from = 0;
        const step = 1000;
        while (true) {
          const { data } = await supabase.from(table).select(select).range(from, from + step - 1);
          if (!data || data.length === 0) break;
          all = [...all, ...data];
          if (data.length < step) break;
          from += step;
        }
        return all;
      };
      
      try {
        // Date Helpers
        const now = new Date();
        const nowTime = now.getTime();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();
        
        const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysInLastMonth = new Date(lastMonthYear, lastMonth + 1, 0).getDate();
        const maxDays = Math.max(daysInCurrentMonth, daysInLastMonth);

        const isThisMonth = (dateString) => {
            if (!dateString) return false;
            const d = new Date(dateString);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        };
        const isLastMonth = (dateString) => {
            if (!dateString) return false;
            const d = new Date(dateString);
            return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        };

        const getWeekIndex = (dateString) => {
           if (!dateString) return -1;
           const dTime = new Date(dateString).getTime();
           const diffDays = Math.floor((nowTime - dTime) / (1000 * 60 * 60 * 24));
           if (diffDays < 0) return -1;
           return Math.floor(diffDays / 7);
        };

        // Fetch Data
        const invoices = await fetchAll('invoices');
        const expenses = await fetchAll('expenses');
        const projects = await fetchAll('projects', '*, leads(agency_name)');
        const leads = await fetchAll('leads');
        const appointments = await fetchAll('appointments');
        const prospects = await fetchAll('prospects');
        const automations = await fetchAll('dm_automations', 'sent, created_at');
        
        // 1. Financials
        const paidInvoices = invoices.filter(i => i.status === 'Paid');
        
        const collectedRevTM = paidInvoices.filter(i => isThisMonth(i.created_at)).reduce((sum, i) => sum + Number(i.amount), 0);
        const collectedRevLM = paidInvoices.filter(i => isLastMonth(i.created_at)).reduce((sum, i) => sum + Number(i.amount), 0);
        const colRevTrend = collectedRevLM ? ((collectedRevTM - collectedRevLM) / collectedRevLM) * 100 : 100;

        const agencyBudgetAllTime = paidInvoices.reduce((sum, i) => sum + Number(i.amount), 0) * 0.13;

        const agencyCutsTM = collectedRevTM * 0.13;
        const expTM = expenses.filter(e => isThisMonth(e.expense_date)).reduce((sum, e) => sum + Number(e.amount), 0);
        const netProfitTM = collectedRevTM - agencyCutsTM - expTM;

        const agencyCutsLM = collectedRevLM * 0.13;
        const expLM = expenses.filter(e => isLastMonth(e.expense_date)).reduce((sum, e) => sum + Number(e.amount), 0);
        const netProfitLM = collectedRevLM - agencyCutsLM - expLM;
        const netProfitTrend = netProfitLM !== 0 ? ((netProfitTM - netProfitLM) / Math.abs(netProfitLM)) * 100 : 100;

        // 2. Projects & Leads
        const activeProjects = projects.filter(p => p.status === 'Active');
        const pipelineValue = activeProjects.reduce((sum, p) => sum + Number(p.value || 0), 0);
        
        const wonLeads = leads.filter(l => l.status === 'CLOSED_WON');
        const conversionRate = leads.length ? (wonLeads.length / leads.length) * 100 : 0;
        
        // 3. Outreach & Automations
        let callsMadeCount = 0;
        let responsesCount = 0;
        let dmRepliedCount = 0;
        
        const dmsSentTM = automations.filter(a => isThisMonth(a.created_at)).reduce((sum, a) => sum + (a.sent || 0), 0);
        const dmsSentLM = automations.filter(a => isLastMonth(a.created_at)).reduce((sum, a) => sum + (a.sent || 0), 0);
        const dmsSentTrend = dmsSentLM ? ((dmsSentTM - dmsSentLM) / dmsSentLM) * 100 : 100;
        const totalDmsSent = automations.reduce((sum, a) => sum + (a.sent || 0), 0);

        prospects.forEach(p => {
          const out = (p.outreach_status || '').toLowerCase();
          const follow = (p.followup_status || '').toLowerCase();
          const pipe = (p.pipeline_status || '').toLowerCase();
          
          const isNoAnswer = out.includes('voice mail') || out.includes('no answer') || follow.includes('voice mail') || follow.includes('no answer');
          const isResponded = out.includes('not interested') || out.includes('follow up') || out.includes('meeting booked') || follow.includes('not interested') || follow.includes('meeting booked') || follow.includes('do not contact');
          
          if (isNoAnswer || isResponded) {
            callsMadeCount++;
          }
          if (isResponded) {
            responsesCount++;
          }
          if (['replied', 'booked', 'closed', 'meeting scheduled'].includes(pipe)) {
            dmRepliedCount++;
          }
        });
        
        const responseRate = callsMadeCount > 0 ? (responsesCount / callsMadeCount) * 100 : 0;
        const replyRate = totalDmsSent > 0 ? (dmRepliedCount / totalDmsSent) * 100 : 0;
        
        // 4. Advanced Metrics
        const attendedMeetings = appointments.filter(a => ['COMPLETED', 'ATTENDED', 'HELD'].includes((a.status || '').toUpperCase())).length;
        const showupRateVal = appointments.length > 0 ? (attendedMeetings / appointments.length) * 100 : 0;
        const closeRateVal = attendedMeetings > 0 ? (wonLeads.length / attendedMeetings) * 100 : 0;
        
        const totalAgencyRev = agencyBudgetAllTime;
        const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        
        const cacVal = wonLeads.length > 0 ? totalExpenses / wonLeads.length : 0;
        const arpcVal = wonLeads.length > 0 ? totalAgencyRev / wonLeads.length : 0;
        const roasVal = totalExpenses > 0 ? totalAgencyRev / totalExpenses : 0;
        
        setMetrics({
          collectedRevenueTM: collectedRevTM,
          collectedRevenueTrend: colRevTrend,
          agencyBudgetAllTime: agencyBudgetAllTime,
          netProfitTM,
          netProfitTrend,
          pipelineValue,
          activeProjects: activeProjects.length,
          totalProspects: prospects.length,
          meetingsBooked: appointments.length,
          responseRate,
          dmsSent: totalDmsSent,
          dmsSentTrend: dmsSentTrend,
          replyRate,
          cac: cacVal,
          arpc: arpcVal,
          closeRate: closeRateVal,
          showupRate: showupRateVal,
          roas: roasVal
        });

        // 5. Generate Weekly Performance Data
        const weeklyDataRaw = Array(4).fill(0).map((_, i) => ({
            week: i,
            dmsSent: 0, dmReplies: 0, dmMeetings: 0, dmClosed: 0,
            callsMade: 0, callResponses: 0, callMeetings: 0, callClosed: 0,
            adsLeads: 0, adsMeetings: 0, adsClosed: 0
        }));

        automations.forEach(a => {
            const w = getWeekIndex(a.created_at);
            if (w >= 0 && w < 4) weeklyDataRaw[w].dmsSent += (a.sent || 0);
        });

        prospects.forEach(p => {
            const wUpdated = getWeekIndex(p.updated_at || p.created_at);
            if (wUpdated >= 0 && wUpdated < 4) {
                const out = (p.outreach_status || '').toLowerCase();
                const follow = (p.followup_status || '').toLowerCase();
                const pipe = (p.pipeline_status || '').toLowerCase();
                
                const isDmAttempt = ['contacted', 'replied', 'booked', 'meeting scheduled', 'closed'].includes(pipe);
                const isCallAttempt = out.includes('voice mail') || out.includes('no answer') || follow.includes('voice mail') || follow.includes('no answer') || out.includes('not interested') || out.includes('follow up') || out.includes('meeting booked') || follow.includes('not interested') || follow.includes('meeting booked') || follow.includes('do not contact');
                const isRespondedCall = out.includes('not interested') || out.includes('follow up') || out.includes('meeting booked') || follow.includes('not interested') || follow.includes('meeting booked') || follow.includes('do not contact');
                
                let channel = isDmAttempt ? 'dm' : (isCallAttempt ? 'call' : 'unknown');
                
                if (channel === 'call') {
                    if (isCallAttempt) weeklyDataRaw[wUpdated].callsMade++;
                    if (isRespondedCall) weeklyDataRaw[wUpdated].callResponses++;
                    if (pipe === 'closed') weeklyDataRaw[wUpdated].callClosed++;
                } else if (channel === 'dm') {
                    if (['replied', 'booked', 'meeting scheduled', 'closed'].includes(pipe)) weeklyDataRaw[wUpdated].dmReplies++;
                    if (pipe === 'closed') weeklyDataRaw[wUpdated].dmClosed++;
                }
            }
        });

        appointments.forEach(a => {
            const w = getWeekIndex(a.created_at);
            if (w >= 0 && w < 4) {
                if (a.lead_id && !a.prospect_id) {
                    weeklyDataRaw[w].adsMeetings++;
                } else if (a.prospect_id) {
                    const p = prospects.find(pr => pr.id === a.prospect_id);
                    if (p) {
                        const pipe = (p.pipeline_status || '').toLowerCase();
                        if (['contacted', 'replied', 'booked', 'meeting scheduled', 'closed'].includes(pipe)) {
                            weeklyDataRaw[w].dmMeetings++;
                        } else {
                            weeklyDataRaw[w].callMeetings++;
                        }
                    } else {
                        weeklyDataRaw[w].callMeetings++;
                    }
                } else {
                    weeklyDataRaw[w].adsMeetings++;
                }
            }
        });

        leads.forEach(l => {
            const wCreated = getWeekIndex(l.created_at);
            if (wCreated >= 0 && wCreated < 4) {
                weeklyDataRaw[wCreated].adsLeads++;
            }
            if (l.status === 'CLOSED_WON') {
                const wUpdated = getWeekIndex(l.updated_at || l.created_at);
                if (wUpdated >= 0 && wUpdated < 4) {
                    weeklyDataRaw[wUpdated].adsClosed++;
                }
            }
        });
        
        setWeeklyPerfData(weeklyDataRaw);

        // 6. Generate Mini Charts Data
        const rTrend = [];
        const pTrend = [];
        let rRev = 0;
        let rProfit = 0;
        
        for (let i = 1; i <= daysInCurrentMonth; i++) {
            const dRev = paidInvoices.filter(inv => isThisMonth(inv.created_at) && new Date(inv.created_at).getDate() === i).reduce((sum, inv) => sum + Number(inv.amount), 0);
            const dExp = expenses.filter(e => isThisMonth(e.expense_date) && new Date(e.expense_date).getDate() === i).reduce((sum, e) => sum + Number(e.amount), 0);
            
            rRev += dRev;
            rTrend.push({ day: i, value: rRev });

            const dAgencyCut = dRev * 0.13;
            rProfit += (dRev - dAgencyCut - dExp);
            pTrend.push({ day: i, value: rProfit });
        }
        setRevenueTrendData(rTrend);
        setProfitTrendData(pTrend);

        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(currentYear, currentMonth - i, 1);
            const monthStr = d.toLocaleString('default', { month: 'short' }).toUpperCase();
            last6Months.push(monthStr);
        }

        const monthlyBudgetHistory = {};
        last6Months.forEach(m => monthlyBudgetHistory[m] = 0);
        paidInvoices.forEach(inv => {
            const m = new Date(inv.created_at).toLocaleString('default', { month: 'short' }).toUpperCase();
            if (monthlyBudgetHistory[m] !== undefined) {
                monthlyBudgetHistory[m] += (Number(inv.amount) * 0.13);
            }
        });
        
        let runningAgencyBudget = 0;
        paidInvoices.forEach(inv => {
            const date = new Date(inv.created_at);
            if (date < new Date(currentYear, currentMonth - 5, 1)) {
                 runningAgencyBudget += (Number(inv.amount) * 0.13);
            }
        });
        
        const bTrend = last6Months.map(m => {
            runningAgencyBudget += monthlyBudgetHistory[m];
            return { month: m, value: runningAgencyBudget };
        });
        setBudgetTrendData(bTrend);

        // Meetings Source Logic
        let onlineMeetings = 0;
        let dmMeetings = 0;
        let coldCallMeetings = 0;

        appointments.forEach(a => {
            if (a.lead_id && !a.prospect_id) {
                onlineMeetings++;
            } else if (a.prospect_id) {
                const p = prospects.find(pr => pr.id === a.prospect_id);
                if (p) {
                    const pipe = (p.pipeline_status || '').toLowerCase();
                    if (['contacted', 'replied', 'booked', 'meeting scheduled', 'closed'].includes(pipe)) {
                        dmMeetings++;
                    } else {
                        coldCallMeetings++;
                    }
                } else {
                    coldCallMeetings++;
                }
            } else {
                onlineMeetings++;
            }
        });

        setMeetingsSourceData([
            { name: 'Online (Leads)', value: onlineMeetings },
            { name: 'DMs (Prospects)', value: dmMeetings },
            { name: 'Cold Calls', value: coldCallMeetings }
        ]);

        // Build Top Performers
        const profiles = await fetchAll('profiles', 'id, full_name');
        const pmData = await fetchAll('project_members', 'user_id, split_percentage, project_id');
        
        if (profiles && invoices && pmData) {
            const perf = profiles.map(user => {
               let rev = 0;
               paidInvoices.forEach(inv => {
                   const member = pmData.find(pm => pm.project_id === inv.projects?.id && pm.user_id === user.id);
                   if (member) {
                       const split = member.split_percentage != null ? member.split_percentage : 100;
                       const teamPool = Number(inv.amount) * 0.87;
                       rev += teamPool * (split / 100);
                   } else {
                     const directMember = pmData.find(pm => pm.project_id === inv.project_id && pm.user_id === user.id);
                     if (directMember) {
                       const split = directMember.split_percentage != null ? directMember.split_percentage : 100;
                       const teamPool = Number(inv.amount) * 0.87;
                       rev += teamPool * (split / 100);
                     }
                   }
               });
               return { ...user, revenue: rev };
            }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
            setTopPerformers(perf);
        }

        // Close Rate over 6 Months Chart
        const monthlyCloseRate = {};
        last6Months.forEach(m => {
            monthlyCloseRate[m] = { month: m, 'Attended Meetings': 0, 'Won Leads': 0 };
        });

        appointments.forEach(a => {
            const status = (a.status || '').toUpperCase();
            if (['COMPLETED', 'ATTENDED', 'HELD'].includes(status)) {
                const m = new Date(a.created_at).toLocaleString('default', { month: 'short' }).toUpperCase();
                if (monthlyCloseRate[m]) monthlyCloseRate[m]['Attended Meetings']++;
            }
        });

        leads.forEach(l => {
            if (l.status === 'CLOSED_WON') {
                const m = new Date(l.updated_at || l.created_at).toLocaleString('default', { month: 'short' }).toUpperCase();
                if (monthlyCloseRate[m]) monthlyCloseRate[m]['Won Leads']++;
            }
        });

        const closeRateDataArr = last6Months.map(m => {
            const data = monthlyCloseRate[m];
            const rate = data['Attended Meetings'] > 0 ? (data['Won Leads'] / data['Attended Meetings']) * 100 : 0;
            return {
                month: m,
                'Close Rate %': parseFloat(rate.toFixed(1)),
                'Attended': data['Attended Meetings'],
                'Won': data['Won Leads']
            };
        });
        setCloseRateData(closeRateDataArr);

        // Chart Data Preparation (Status)
        const statusCounts = leads.reduce((acc, lead) => {
            acc[lead.status || 'NEW'] = (acc[lead.status || 'NEW'] || 0) + 1;
            return acc;
        }, {});
        setLeadStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

        const pStatusCounts = projects.reduce((acc, proj) => {
            acc[proj.status || 'Planning'] = (acc[proj.status || 'Planning'] || 0) + 1;
            return acc;
        }, {});
        setProjectStatusData(Object.entries(pStatusCounts).map(([name, value]) => ({ name, value })));

        // Finance Chart Timeline
        const monthlyFinance = {};
        last6Months.forEach(m => {
            monthlyFinance[m] = { month: m, Revenue: 0, Expenses: 0 };
        });

        paidInvoices.forEach(inv => {
            const m = new Date(inv.created_at).toLocaleString('default', { month: 'short' }).toUpperCase();
            if (monthlyFinance[m]) {
                monthlyFinance[m].Revenue += (Number(inv.amount) * 0.13);
            }
        });

        expenses.forEach(exp => {
             const m = new Date(exp.expense_date).toLocaleString('default', { month: 'short' }).toUpperCase();
             if (monthlyFinance[m]) {
                 monthlyFinance[m].Expenses += Number(exp.amount);
             }
        });

        const fData = last6Months.map(m => monthlyFinance[m]);
        setFinanceData(fData);

        // Outreach Chart Timeline (Daily, Current Month vs Last Month)
        const dailyOutreach = [];
        for (let i = 1; i <= maxDays; i++) {
            dailyOutreach.push({ 
                day: i, 
                'DMs Sent': 0, 'DMs Sent (Last Month)': 0,
                'Calls Made': 0, 'Calls Made (Last Month)': 0,
                'Meetings Booked': 0, 'Meetings Booked (Last Month)': 0
            });
        }

        automations.forEach(a => {
            const d = new Date(a.created_at);
            const m = d.getMonth();
            const y = d.getFullYear();
            const dayOfMonth = d.getDate();
            if (m === currentMonth && y === currentYear) {
               if (dailyOutreach[dayOfMonth - 1]) dailyOutreach[dayOfMonth - 1]['DMs Sent'] += (a.sent || 0);
            } else if (m === lastMonth && y === lastMonthYear) {
               if (dailyOutreach[dayOfMonth - 1]) dailyOutreach[dayOfMonth - 1]['DMs Sent (Last Month)'] += (a.sent || 0);
            }
        });

        prospects.forEach(p => {
            const out = (p.outreach_status || '').toLowerCase();
            const follow = (p.followup_status || '').toLowerCase();
            const d = new Date(p.updated_at || p.created_at);
            const m = d.getMonth();
            const y = d.getFullYear();
            const dayOfMonth = d.getDate();

            const isCall = out.includes('voice mail') || out.includes('no answer') || out.includes('not interested') || out.includes('follow up') || out.includes('meeting booked') || follow.includes('voice mail') || follow.includes('no answer') || follow.includes('not interested') || follow.includes('meeting booked') || follow.includes('do not contact');
            if (isCall) {
                if (m === currentMonth && y === currentYear) {
                   if (dailyOutreach[dayOfMonth - 1]) dailyOutreach[dayOfMonth - 1]['Calls Made']++;
                } else if (m === lastMonth && y === lastMonthYear) {
                   if (dailyOutreach[dayOfMonth - 1]) dailyOutreach[dayOfMonth - 1]['Calls Made (Last Month)']++;
                }
            }
        });

        appointments.forEach(a => {
            const d = new Date(a.created_at);
            const m = d.getMonth();
            const y = d.getFullYear();
            const dayOfMonth = d.getDate();
            if (m === currentMonth && y === currentYear) {
               if (dailyOutreach[dayOfMonth - 1]) dailyOutreach[dayOfMonth - 1]['Meetings Booked']++;
            } else if (m === lastMonth && y === lastMonthYear) {
               if (dailyOutreach[dayOfMonth - 1]) dailyOutreach[dayOfMonth - 1]['Meetings Booked (Last Month)']++;
            }
        });

        setOutreachData(dailyOutreach);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111112] border border-white/10 p-4 rounded-2xl shadow-2xl z-50 backdrop-blur-xl">
          <p className="text-white/50 text-xs font-bold uppercase mb-3">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6 mb-2 last:mb-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-white/80 text-sm font-medium">{entry.name}</span>
              </div>
              <span className="text-white font-bold text-sm">
                {entry.name === 'Revenue' || entry.name === 'Expenses' ? `MAD ${Number(entry.value).toLocaleString()}` : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const TrendBadge = ({ value }) => {
    if (value === 0 || value === 100 || isNaN(value)) return null;
    const isPositive = value > 0;
    return (
      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isPositive ? 'bg-[#ec4899]/10 text-[#ec4899]' : 'bg-red-500/10 text-red-500'}`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(value).toFixed(1)}%
      </div>
    );
  };

  const BentoCard = ({ title, value, subtitle, icon: Icon, trend, chartData, chartColor, isLarge }) => (
    <div className={`bg-[#131316] rounded-[2rem] border border-white/[0.03] shadow-lg relative overflow-hidden group flex flex-col hover:border-white/[0.08] transition-colors duration-500 ${isLarge ? 'p-8 min-h-[220px]' : 'p-6 min-h-[180px]'}`}>
      <div className="flex justify-between items-start z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.03] flex items-center justify-center group-hover:bg-white/[0.06] transition-colors">
            <Icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
          </div>
          <span className="text-white/60 font-semibold text-sm">{title}</span>
        </div>
        {trend !== undefined && <TrendBadge value={trend} />}
      </div>
      
      <div className="mt-auto z-10 relative pt-6">
        <div className={`font-black text-white tracking-tight ${isLarge ? 'text-5xl' : 'text-3xl'}`}>
          {value}
        </div>
        {subtitle && <div className="text-xs text-white/40 mt-2 font-medium">{subtitle}</div>}
      </div>

      {chartData && chartData.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[60%] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor || "#ec4899"} stopOpacity={0.8}/>
                  <stop offset="100%" stopColor={chartColor || "#ec4899"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={chartColor || "#ec4899"} strokeWidth={3} fill={`url(#grad-${title.replace(/\s+/g, '-')})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 blur-[50px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
    </div>
  );

  const ChannelRow = ({ name, icon: Icon, color }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!weeklyPerfData || weeklyPerfData.length === 0) return null;
    
    const current = weeklyPerfData[0];
    let volKey, respKey, meetKey, closedKey;
    let labelVol = 'Attempts', labelResp = 'Response Rate';

    if (name === 'Direct Messages') { 
        volKey='dmsSent'; respKey='dmReplies'; meetKey='dmMeetings'; closedKey='dmClosed'; 
        labelResp = 'Reply Rate';
    } else if (name === 'Cold Calls') { 
        volKey='callsMade'; respKey='callResponses'; meetKey='callMeetings'; closedKey='callClosed'; 
    } else { 
        volKey='adsLeads'; respKey='adsMeetings'; meetKey='adsMeetings'; closedKey='adsClosed'; 
        labelVol = 'Leads'; labelResp = 'Booking Rate';
    }

    const vol = current[volKey];
    const resp = current[respKey];
    const meet = current[meetKey];
    const closed = current[closedKey];

    const rate = vol > 0 ? (resp / vol) * 100 : 0;
    const closeRate = meet > 0 ? (closed / meet) * 100 : 0;

    const trendData = [...weeklyPerfData].reverse().map((w, idx) => ({ name: `Week ${idx+1}`, value: w[meetKey] }));

    return (
        <>
        <tr className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors cursor-pointer group" onClick={() => setIsExpanded(!isExpanded)}>
           <td className="py-5 pl-4 rounded-l-2xl">
               <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.03] group-hover:bg-white/[0.08] transition-colors" style={{ color: color }}>
                       <Icon className="w-5 h-5" />
                   </div>
                   <span className="font-bold text-white text-[15px]">{name}</span>
               </div>
           </td>
           <td className="py-5 text-white font-semibold text-[15px]">
               {vol} <span className="text-white/30 text-xs font-medium ml-1.5">{labelVol}</span>
           </td>
           <td className="py-5 text-white/90 font-semibold text-[15px]">
               {rate.toFixed(1)}% <span className="text-white/30 text-xs font-medium ml-1.5">{labelResp}</span>
           </td>
           <td className="py-5 text-white font-semibold text-[15px]">
               {meet} <span className="text-white/30 text-xs font-medium ml-1.5">Meetings</span>
           </td>
           <td className="py-5 text-white/90 font-semibold text-[15px]">
               {closeRate.toFixed(1)}% <span className="text-white/30 text-xs font-medium ml-1.5">Close Rate</span>
           </td>
           <td className="py-5 w-32">
               <div className="h-10 w-full opacity-70 group-hover:opacity-100 transition-opacity">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={trendData}>
                           <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                       </LineChart>
                   </ResponsiveContainer>
               </div>
           </td>
           <td className="py-5 pr-4 text-right rounded-r-2xl">
               <div className="text-white/30 group-hover:text-white transition-colors inline-flex bg-white/5 p-2 rounded-lg">
                   {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
               </div>
           </td>
        </tr>
        {isExpanded && (
           <tr>
               <td colSpan="7" className="p-0 border-b border-white/[0.02] bg-white/[0.01]">
                   <div className="px-6 py-6 border-x border-white/[0.02]">
                       <table className="w-full text-left">
                           <thead>
                               <tr className="text-white/40 uppercase tracking-wider text-[11px]">
                                   <th className="pb-3 font-semibold">Weekly Timeline</th>
                                   <th className="pb-3 font-semibold">Volume</th>
                                   <th className="pb-3 font-semibold">{labelResp}</th>
                                   <th className="pb-3 font-semibold">Meetings Booked</th>
                                   <th className="pb-3 font-semibold">Close Rate</th>
                               </tr>
                           </thead>
                           <tbody>
                               {weeklyPerfData.map((w, idx) => {
                                   const wVol = w[volKey];
                                   const wResp = w[respKey];
                                   const wMeet = w[meetKey];
                                   const wClosed = w[closedKey];
                                   const wRate = wVol > 0 ? (wResp / wVol) * 100 : 0;
                                   const wCloseRate = wMeet > 0 ? (wClosed / wMeet) * 100 : 0;
                                   return (
                                       <tr key={idx} className="border-t border-white/[0.03] text-white/60 hover:bg-white/[0.02] transition-colors">
                                           <td className="py-3 font-medium text-sm flex items-center gap-2">
                                               <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: idx === 0 ? color : 'transparent', border: idx !== 0 ? '1px solid rgba(255,255,255,0.2)' : 'none' }}></div>
                                               {idx === 0 ? 'This Week' : `${idx} Week${idx > 1 ? 's' : ''} Ago`}
                                           </td>
                                           <td className="py-3 text-sm font-semibold text-white/80">{wVol}</td>
                                           <td className="py-3 text-sm font-semibold text-white/80">{wRate.toFixed(1)}%</td>
                                           <td className="py-3 text-sm font-semibold text-white/80">{wMeet}</td>
                                           <td className="py-3 text-sm font-semibold text-white/80">{wCloseRate.toFixed(1)}%</td>
                                       </tr>
                                   )
                               })}
                           </tbody>
                       </table>
                   </div>
               </td>
           </tr>
        )}
        </>
    )
  }

  if (loading) {
      return (
        <div className="space-y-6 animate-pulse pb-12 pt-4">
          <div className="h-10 bg-white/5 rounded-xl w-72 mb-8"></div>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4 h-[220px] bg-white/5 rounded-[2rem]"></div>
            <div className="col-span-12 lg:col-span-4 h-[220px] bg-white/5 rounded-[2rem]"></div>
            <div className="col-span-12 lg:col-span-4 h-[220px] bg-white/5 rounded-[2rem]"></div>
          </div>
        </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12 pt-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-tight">Command Center</h1>
          <p className="text-white/40 font-medium mt-1">Creative overview of your agency's performance.</p>
        </div>
        <div className="bg-[#131316] px-5 py-2.5 rounded-2xl border border-white/5 text-sm font-bold text-white/80 flex items-center gap-3 shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ec4899] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ec4899]"></span>
          </span>
          Live Sync Active
        </div>
      </div>

      {/* BENTO GRID: ROW 1 (The Heroes) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <BentoCard 
            title="Agency Budget (All Time)" 
            value={`MAD ${metrics.agencyBudgetAllTime.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
            subtitle="Total cuts from each invoice"
            icon={Zap} 
            chartData={budgetTrendData}
            chartColor="#ec4899"
            isLarge
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <BentoCard 
            title="Collected Revenue" 
            value={`MAD ${metrics.collectedRevenueTM.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
            subtitle="Paid Invoices (Current Month)"
            icon={DollarSign} 
            trend={metrics.collectedRevenueTrend}
            chartData={revenueTrendData}
            chartColor="#3b82f6"
            isLarge
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <BentoCard 
            title="Net Profit (This Month)" 
            value={`MAD ${metrics.netProfitTM.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
            subtitle="Rev - Agency Cuts - Expenses"
            icon={Wallet} 
            trend={metrics.netProfitTrend}
            chartData={profitTrendData}
            chartColor="#10b981"
            isLarge
          />
        </div>
      </div>

      {/* BENTO GRID: ROW 2 (Secondary KPIs) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <BentoCard title="Pipeline Value" value={`MAD ${metrics.pipelineValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} subtitle="From Active Projects" icon={Activity} />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <BentoCard title="Active Projects" value={metrics.activeProjects} subtitle="Currently in progress" icon={FolderGit2} />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <BentoCard title="DMs Sent" value={metrics.dmsSent} subtitle="All Time Automated DMs" trend={metrics.dmsSentTrend} icon={MessageSquare} />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <BentoCard title="Showup Rate" value={`${metrics.showupRate.toFixed(1)}%`} subtitle="Attended vs Booked" icon={Users} />
        </div>
      </div>

      {/* BENTO GRID: ROW 3 (Outreach taking 100%) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 bg-[#131316] rounded-[2rem] border border-white/[0.03] p-8 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white">Outreach & Conversion Pipeline</h2>
              <p className="text-sm text-white/40 font-medium mt-1">Daily tracking of automated DMs and manual calls.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.05] px-4 py-1.5 rounded-xl text-xs font-semibold text-white/60">
              Daily (This vs Last Month)
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={outreachData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDMs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600 }} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }} />
                
                <Area type="monotone" dataKey="DMs Sent" name="DMs Sent (This Month)" stroke="#ec4899" strokeWidth={3} fill="url(#colorDMs)" activeDot={{ r: 6, strokeWidth: 0, fill: '#ec4899' }} />
                <Line type="monotone" dataKey="DMs Sent (Last Month)" stroke="#ec4899" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4 }} />
                
                <Area type="monotone" dataKey="Calls Made" name="Calls Made (This Month)" stroke="#3b82f6" strokeWidth={3} fill="url(#colorCalls)" activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} />
                <Line type="monotone" dataKey="Calls Made (Last Month)" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4 }} />
                
                <Area type="monotone" dataKey="Meetings Booked" name="Meetings Booked (This Month)" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorMeetings)" activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }} />
                <Line type="monotone" dataKey="Meetings Booked (Last Month)" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* NEW BENTO GRID: ROW 4 (Channel Performance Table) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 bg-[#131316] rounded-[2rem] border border-white/[0.03] p-8 flex flex-col min-h-[350px]">
            <h2 className="text-xl font-bold text-white mb-2">Channel Performance Comparison</h2>
            <p className="text-sm text-white/40 font-medium mb-8">Weekly breakdown of volume, conversions, and meetings across all channels (expand for history).</p>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/[0.05] text-white/40 text-xs uppercase tracking-wider">
                            <th className="pb-4 pl-4 font-semibold">Acquisition Channel</th>
                            <th className="pb-4 font-semibold">Weekly Volume</th>
                            <th className="pb-4 font-semibold">Response / Reply Rate</th>
                            <th className="pb-4 font-semibold">Meetings Booked</th>
                            <th className="pb-4 font-semibold">Meetings Close Rate</th>
                            <th className="pb-4 font-semibold">Meetings Trend (4W)</th>
                            <th className="pb-4 font-semibold pr-4 text-right">History</th>
                        </tr>
                    </thead>
                    <tbody>
                       <ChannelRow name="Direct Messages" icon={MessageSquare} color="#ec4899" />
                       <ChannelRow name="Cold Calls" icon={PhoneCall} color="#3b82f6" />
                       <ChannelRow name="Ads / Online" icon={Target} color="#10b981" />
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* BENTO GRID: ROW 5 (Close Rate & Meetings Source) */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Close Rate Chart */}
        <div className="col-span-12 xl:col-span-8 bg-[#131316] rounded-[2rem] border border-white/[0.03] p-8 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white">Closing Rate Analysis</h2>
              <p className="text-sm text-white/40 font-medium mt-1">Percentage of Attended Meetings converted to Closed Won.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.05] px-4 py-1.5 rounded-xl text-xs font-semibold text-white/60">6 Months</div>
          </div>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={closeRateData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600 }} dx={-10} tickFormatter={(val) => `${val}%`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }} />
                <Area type="monotone" dataKey="Close Rate %" stroke="#10b981" strokeWidth={4} fill="url(#colorClose)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Meetings Source */}
        <div className="col-span-12 xl:col-span-4 bg-[#131316] rounded-[2rem] border border-white/[0.03] p-8 flex flex-col min-h-[450px]">
          <h2 className="text-xl font-bold text-white mb-2">Meetings Source</h2>
          <p className="text-sm text-white/40 font-medium mb-8">Where your meetings are coming from.</p>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={meetingsSourceData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value" stroke="none" cornerRadius={8}>
                  {meetingsSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BENTO GRID: ROW 6 (Cashflow & Top Performers) */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Finance Chart */}
        <div className="col-span-12 xl:col-span-8 bg-[#131316] rounded-[2rem] border border-white/[0.03] p-8 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white">Cashflow Analysis</h2>
              <p className="text-sm text-white/40 font-medium mt-1">Agency Revenue vs Expenses over time.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.05] px-4 py-1.5 rounded-xl text-xs font-semibold text-white/60">6 Months</div>
          </div>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `${val/1000}k`} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }} />
                <Bar dataKey="Revenue" fill="#ec4899" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expenses" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="col-span-12 xl:col-span-4 bg-[#131316] rounded-[2rem] border border-white/[0.03] p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Top Performers</h2>
            <MoreHorizontal className="w-5 h-5 text-white/20" />
          </div>
          
          <div className="space-y-4 flex-1">
            {topPerformers.length === 0 ? (
                <div className="text-white/20 text-sm h-full flex items-center justify-center font-medium">No performance data yet.</div>
            ) : (
                topPerformers.map((user, idx) => (
                  <div key={user.id} className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${idx === 0 ? 'bg-[#ec4899] text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'bg-white/5 text-white/60'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white/90 truncate text-base">{user.full_name || 'Team Member'}</p>
                      <p className="text-xs text-white/40 font-medium mt-1">MAD {user.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} generated</p>
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
