'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trophy, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export default function PaymentsPage() {
  const [users, setUsers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('this_month');

  // Fetch all data once on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createClient();
      
      // Fetch users
      const { data: profilesData } = await supabase.from('profiles').select('id, full_name');
      if (profilesData) setUsers(profilesData);

      // Fetch Paid invoices and their project members
      const { data: invoicesData, error } = await supabase
        .from('invoices')
        .select(`
          id, amount, updated_at, status,
          projects (
            id,
            project_members (user_id, split_percentage)
          )
        `)
        .eq('status', 'Paid');

      if (!error && invoicesData) {
        setInvoices(invoicesData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Calculate Date Ranges
  const getPeriodDates = (filter) => {
    const now = new Date();
    let currentStart = new Date(now);
    let currentEnd = new Date(now);
    let prevStart = new Date(now);
    let prevEnd = new Date(now);

    switch(filter) {
      case 'this_month':
        currentStart.setDate(1); currentStart.setHours(0,0,0,0);
        
        prevStart = new Date(currentStart); prevStart.setMonth(prevStart.getMonth() - 1);
        prevEnd = new Date(currentStart); prevEnd.setDate(0); prevEnd.setHours(23,59,59,999);
        break;
      case 'past_month':
        currentStart.setMonth(currentStart.getMonth() - 1); currentStart.setDate(1); currentStart.setHours(0,0,0,0);
        currentEnd = new Date(currentStart); currentEnd.setMonth(currentEnd.getMonth() + 1); currentEnd.setDate(0); currentEnd.setHours(23,59,59,999);
        
        prevStart = new Date(currentStart); prevStart.setMonth(prevStart.getMonth() - 1);
        prevEnd = new Date(currentStart); prevEnd.setDate(0); prevEnd.setHours(23,59,59,999);
        break;
      case 'past_6_months':
        currentStart.setMonth(currentStart.getMonth() - 6); currentStart.setHours(0,0,0,0);
        
        prevStart = new Date(currentStart); prevStart.setMonth(prevStart.getMonth() - 6);
        prevEnd = new Date(currentStart); prevEnd.setMilliseconds(-1);
        break;
      case 'past_year':
        currentStart.setFullYear(currentStart.getFullYear() - 1); currentStart.setHours(0,0,0,0);
        
        prevStart = new Date(currentStart); prevStart.setFullYear(prevStart.getFullYear() - 1);
        prevEnd = new Date(currentStart); prevEnd.setMilliseconds(-1);
        break;
      case 'all_time':
        currentStart = new Date(0); // 1970
        prevStart = new Date(0); // No previous period for all time
        prevEnd = new Date(0);
        break;
    }
    return { currentStart, currentEnd, prevStart, prevEnd };
  };

  // Process data based on active filter
  const { currentStart, currentEnd, prevStart, prevEnd } = getPeriodDates(timeFilter);

  const leaderboard = users.map(user => {
    let currentRevenue = 0;
    let prevRevenue = 0;

    invoices.forEach(inv => {
      // Check if user is assigned to this invoice's project and get their percentage
      const member = inv.projects?.project_members?.find(pm => pm.user_id === user.id);
      if (!member) return;

      const splitPercentage = member.split_percentage != null ? member.split_percentage : 100;
      const invDate = new Date(inv.updated_at || inv.created_at);
      
      // Agency takes 13%, team splits the remaining 87%
      const teamPool = Number(inv.amount) * 0.87;
      const amount = teamPool * (splitPercentage / 100);

      // Current Period
      if (invDate >= currentStart && invDate <= currentEnd) {
        currentRevenue += amount;
      }
      
      // Previous Period
      if (timeFilter !== 'all_time' && invDate >= prevStart && invDate <= prevEnd) {
        prevRevenue += amount;
      }
    });

    let growth = 0;
    if (prevRevenue > 0) {
      growth = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
    } else if (currentRevenue > 0) {
      growth = 100; // Infinity practically, but we'll cap at 100% for display if previous was 0
    }

    return {
      ...user,
      currentRevenue,
      prevRevenue,
      growth
    };
  }).sort((a, b) => b.currentRevenue - a.currentRevenue); // Sort descending

  const topEarner = leaderboard.length > 0 && leaderboard[0].currentRevenue > 0 ? leaderboard[0] : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-medium text-brand-text tracking-tight mb-2">Payments & Leaderboard</h1>
          <p className="text-brand-text/70">Track team revenue and performance.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-brand-surface border border-brand-border rounded-lg p-1 ">
          <Calendar className="w-4 h-4 text-brand-text/50 ml-2" />
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-brand-text pr-8 py-1.5 cursor-pointer outline-none"
          >
            <option value="this_month">This Month</option>
            <option value="past_month">Past Month</option>
            <option value="past_6_months">Past 6 Months</option>
            <option value="past_year">Past Year</option>
            <option value="all_time">From Scratch (All Time)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8 animate-pulse">
          <div className="mb-8 bg-brand-surface border border-brand-border rounded-2xl p-6 h-48 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-brand-dark/10 rounded-full"></div>
              <div>
                <div className="h-5 bg-brand-dark/10 rounded w-32 mb-2"></div>
                <div className="h-8 bg-brand-dark/10 rounded w-48"></div>
              </div>
            </div>
            <div className="h-16 bg-brand-dark/10 rounded w-40"></div>
          </div>
          <div className="bg-brand-surface rounded-xl border border-brand-border  overflow-hidden h-96">
            <div className="p-5 border-b border-brand-border bg-brand-bg/30">
              <div className="h-5 bg-brand-dark/10 rounded w-40"></div>
            </div>
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 bg-brand-dark/5 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Earner Spotlight */}
          {topEarner && (
            <div className="mb-8 bg-gradient-to-r from-yellow-50 to-amber-100 border border-amber-200 rounded-2xl p-6  flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 text-amber-500/10">
                <Trophy className="w-64 h-64" />
              </div>
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center border-4 border-white  text-3xl text-white font-bold">
                  {topEarner.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wider">Top Earner</h2>
                  </div>
                  <h3 className="text-2xl font-bold text-brand-text">{topEarner.full_name || 'Unnamed Member'}</h3>
                </div>
              </div>
              
              <div className="relative z-10 text-center md:text-right bg-brand-surface/60 backdrop-blur-sm px-8 py-4 rounded-xl border border-white">
                <p className="text-sm font-medium text-brand-text/60 mb-1">Revenue Generated</p>
                <p className="text-4xl font-black text-brand-text">MAD {topEarner.currentRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="bg-brand-surface rounded-xl border border-brand-border  overflow-hidden">
            <div className="p-5 border-b border-brand-border bg-brand-bg/30">
              <h3 className="font-medium text-brand-text">Team Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-bg/50">
                    <th className="p-4 font-medium text-brand-text/70 text-sm">Rank</th>
                    <th className="p-4 font-medium text-brand-text/70 text-sm">Team Member</th>
                    <th className="p-4 font-medium text-brand-text/70 text-sm">Selected Period Revenue</th>
                    {timeFilter !== 'all_time' && (
                      <th className="p-4 font-medium text-brand-text/70 text-sm">Previous Period Revenue</th>
                    )}
                    {timeFilter !== 'all_time' && (
                      <th className="p-4 font-medium text-brand-text/70 text-sm">Trend</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-brand-text/50">No team members found.</td>
                    </tr>
                  ) : (
                    leaderboard.map((user, index) => (
                      <tr key={user.id} className="border-b border-brand-border hover:bg-brand-bg/50 transition-colors">
                        <td className="p-4 font-medium text-brand-text/50 w-16 text-center">
                          {index + 1}
                        </td>
                        <td className="p-4 font-medium text-brand-text flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-dark flex items-center justify-center text-xs font-bold text-white ">
                            {user.full_name?.charAt(0) || 'U'}
                          </div>
                          {user.full_name || 'Unnamed Member'}
                        </td>
                        <td className="p-4 font-bold text-brand-text">
                          MAD {user.currentRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        {timeFilter !== 'all_time' && (
                          <td className="p-4 text-brand-text/70 font-medium text-sm">
                            MAD {user.prevRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        )}
                        {timeFilter !== 'all_time' && (
                          <td className="p-4">
                            {user.growth > 0 ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                <TrendingUp className="w-3 h-3" /> +{user.growth.toFixed(1)}%
                              </span>
                            ) : user.growth < 0 ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">
                                <TrendingDown className="w-3 h-3" /> {user.growth.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-brand-text/40 px-2">0%</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
