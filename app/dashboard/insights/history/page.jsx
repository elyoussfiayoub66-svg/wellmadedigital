'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, LineChart as LineChartIcon } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function HistoricalInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: insightsData, error } = await supabase
          .from('weekly_insights')
          .select('*')
          .order('week_start_date', { ascending: true }); // old to new for charts

        if (error) {
          console.log('Error or table not found:', error);
          // Mock some historical data if table empty/doesn't exist
          setMockData();
        } else if (insightsData && insightsData.length > 0) {
          setData(insightsData.map(d => ({
            ...d,
            weekLabel: new Date(d.week_start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          })));
        } else {
          setMockData();
        }
      } catch (err) {
        console.error(err);
        setMockData();
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const setMockData = () => {
    // Generate some fake historical data for demo
    const mock = [];
    const now = new Date();
    for (let i = 12; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - (i * 7));
      mock.push({
        week_start_date: d.toISOString().split('T')[0],
        weekLabel: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        revenue: Math.floor(Math.random() * 5000) + 2000 + (12-i)*200, // uptrend
        profit_per_project: Math.floor(Math.random() * 1000) + 500 + (12-i)*50,
        dms_made: Math.floor(Math.random() * 200) + 100 + (12-i)*20,
        meetings: Math.floor(Math.random() * 10) + 2 + Math.floor((12-i)/2),
        deals: Math.floor(Math.random() * 3) + 1 + Math.floor((12-i)/4),
      });
    }
    setData(mock);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/insights"
          className="p-2 bg-brand-surface border border-brand-border rounded-lg text-brand-muted hover:text-brand-text hover:border-brand-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-text flex items-center gap-2">
            <LineChartIcon className="w-6 h-6 text-brand-accent" />
            Historical Progress
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Track your performance and growth over time.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-brand-surface border border-brand-border rounded-xl animate-pulse" />
          <div className="h-80 bg-brand-surface border border-brand-border rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue & Profit Chart */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-brand-text mb-4">Financial Growth</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="weekLabel" 
                    stroke="#888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#E5E5E5' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="profit_per_project" name="Profit/Project" stroke="#C2496B" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Outreach Chart */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-brand-text mb-4">Outreach & Conversion</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="weekLabel" 
                    stroke="#888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#E5E5E5' }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="dms_made" name="DMs Made" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="meetings" name="Meetings" stroke="#f97316" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="deals" name="Deals" stroke="#ec4899" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
