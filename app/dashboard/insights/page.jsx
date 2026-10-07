'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  BarChart2, 
  TrendingUp, 
  MessageCircle, 
  PhoneCall, 
  Calendar, 
  FileText, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Percent,
  ThumbsUp,
  History,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [insights, setInsights] = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      // Try to fetch the latest weekly insight
      const { data, error } = await supabase
        .from('weekly_insights')
        .select('*')
        .order('week_start_date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // If table doesn't exist or no data, we'll just show null
        console.log('No insights found or table missing:', error.message);
      } else {
        setInsights(data);
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const generateWeeklyData = async () => {
    setGenerating(true);
    try {
      const supabase = createClient();
      
      // Get current week start date (Monday)
      const today = new Date();
      const day = today.getDay(); // 0 is Sunday, 1 is Monday...
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const currentWeekStart = new Date(today.setDate(diff)).toISOString().split('T')[0];

      // Fetch real data from DB for the current week
      const { data: prospectsData } = await supabase
        .from('prospects')
        .select('*')
        .gte('created_at', currentWeekStart);
        
      const prospects = prospectsData || [];
      const dms_made = prospects.length;
      
      const positiveRepliesOptions = ['meeting scheduled', 'discovery call completed', 'negotiation', 'closed', 'contacted'];
      const positive_replies = prospects.filter(p => p.pipeline_status && positiveRepliesOptions.includes(p.pipeline_status.toLowerCase())).length;
      const dm_reply_rate = dms_made > 0 ? ((positive_replies / dms_made) * 100).toFixed(1) : 0;

      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .gte('created_at', currentWeekStart);
      const meetings = appointmentsData ? appointmentsData.length : 0;

      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .gte('created_at', currentWeekStart);
      const projectsList = projectsData || [];
      const deals = projectsList.length;
      const proposals = prospects.filter(p => p.pipeline_status && p.pipeline_status.toLowerCase() === 'negotiation').length + deals;
      
      const revenue = projectsList.reduce((acc, p) => acc + (parseFloat(p.value) || 0), 0);
      
      let deliveryDaysSum = 0;
      let projectsWithDelivery = 0;
      projectsList.forEach(p => {
        if (p.start_date && p.delivery_date) {
          const diffTime = Math.abs(new Date(p.delivery_date) - new Date(p.start_date));
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          deliveryDaysSum += diffDays;
          projectsWithDelivery++;
        }
      });
      const delivery_time_days = projectsWithDelivery > 0 ? (deliveryDaysSum / projectsWithDelivery).toFixed(1) : 0;

      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', currentWeekStart);
      const expensesList = expensesData || [];
      const totalExpenses = expensesList.reduce((acc, exp) => acc + (parseFloat(exp.amount) || 0), 0);
      const totalProfit = revenue - totalExpenses;
      const profit_per_project = deals > 0 ? Math.floor(totalProfit / deals) : 0;

      const realData = {
        week_start_date: currentWeekStart,
        dms_made,
        dm_reply_rate,
        positive_replies,
        meetings,
        proposals,
        deals,
        revenue,
        delivery_time_days,
        profit_per_project,
      };

      // Remove existing record for this week if it exists to replace it with fresh data
      await supabase.from('weekly_insights').delete().eq('week_start_date', currentWeekStart);

      const { data, error } = await supabase
        .from('weekly_insights')
        .insert([realData])
        .select()
        .single();

      if (error) {
        toast.error('Could not save data. Please ensure the weekly_insights table exists.');
        console.error(error);
        setInsights(realData);
      } else {
        setInsights(data);
        toast.success('Weekly insights generated from real data successfully!');
      }
    } catch (err) {
      console.error('Error generating data:', err);
      toast.error('An error occurred while generating insights.');
    } finally {
      setGenerating(false);
    }
  };

  const metrics = [
    { label: 'DMs (Calls Made)', value: insights?.dms_made || 0, icon: PhoneCall, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'DMs Reply Rate', value: `${insights?.dm_reply_rate || 0}%`, icon: Percent, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Positive Replies', value: insights?.positive_replies || 0, icon: ThumbsUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Meetings', value: insights?.meetings || 0, icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Proposals', value: insights?.proposals || 0, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Deals', value: insights?.deals || 0, icon: Briefcase, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { label: 'Revenue', value: `$${(insights?.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Delivery Time / Project', value: `${insights?.delivery_time_days || 0} days`, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Profit / Project', value: `$${(insights?.profit_per_project || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-brand-accent" />
            Weekly Business Insights
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Track your weekly outreach, conversion, and financial metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/insights/history"
            className="flex items-center gap-2 px-4 py-2 bg-brand-surface border border-brand-border rounded-lg text-brand-text hover:border-brand-accent transition-colors text-sm font-medium"
          >
            <History className="w-4 h-4" />
            Historical Timeline
          </Link>
          <button
            onClick={generateWeeklyData}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : 'Generate This Week'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-brand-surface border border-brand-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : insights ? (
        <div className="space-y-6">
          <div className="bg-brand-surface border border-brand-border p-4 rounded-xl flex items-center justify-between">
            <span className="text-brand-muted text-sm">
              Showing insights for the week of: <strong className="text-brand-text">{new Date(insights.week_start_date).toLocaleDateString()}</strong>
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {metrics.map((metric, idx) => (
              <div key={idx} className="bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-brand-accent/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${metric.bg} ${metric.color} group-hover:scale-110 transition-transform`}>
                    <metric.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-muted">{metric.label}</p>
                    <p className="text-2xl font-bold text-brand-text mt-1">{metric.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-brand-surface border border-brand-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-8 h-8 text-brand-muted" />
          </div>
          <h2 className="text-xl font-semibold text-brand-text mb-2">No Insights Yet</h2>
          <p className="text-brand-muted mb-6 max-w-md mx-auto">
            You haven't generated any weekly insights yet. Click the button above to generate your first report.
          </p>
          <button
            onClick={generateWeeklyData}
            disabled={generating}
            className="flex items-center gap-2 px-6 py-3 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-colors mx-auto font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            Generate Insights
          </button>
        </div>
      )}
    </div>
  );
}
