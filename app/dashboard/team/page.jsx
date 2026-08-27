'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Award, Medal, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import SecurityDeleteModal from '@/components/SecurityDeleteModal';

export default function TeamPage() {
  const [teamStats, setTeamStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmApprove, setConfirmApprove] = useState({ isOpen: false, id: null });
  const [confirmSecurityDelete, setConfirmSecurityDelete] = useState({ isOpen: false, id: null, name: '' });

  const loadTeamData = async () => {
    setLoading(true);
    const supabase = createClient();
    
    // 1. Fetch all profiles
    const { data: profilesData } = await supabase.from('profiles').select('*');
    
    // 2. Fetch project members to count projects
    const { data: pmData } = await supabase.from('project_members').select('user_id');
    
    // 3. Fetch appointments to calculate closing rate
    const { data: apptData } = await supabase.from('appointments').select('assignee_id, meeting_result');
    
    // 4. Fetch paid invoices for revenue
    const { data: invoicesData } = await supabase
      .from('invoices')
      .select(`
        amount,
        projects (
          project_members (user_id, split_percentage)
        )
      `)
      .eq('status', 'Paid');

    if (!profilesData) {
      setLoading(false);
      return;
    }

    // Aggregate data per user
    const aggregated = profilesData.map(user => {
      // Count projects
      const projectsCount = pmData?.filter(pm => pm.user_id === user.id).length || 0;
      
      // Calculate Closing Rate
      const userAppts = apptData?.filter(a => a.assignee_id === user.id) || [];
      const conclusiveAppts = userAppts.filter(a => a.meeting_result && a.meeting_result !== 'Pending');
      const wonAppts = conclusiveAppts.filter(a => a.meeting_result === 'Closed Won');
      const closingRate = conclusiveAppts.length > 0 ? (wonAppts.length / conclusiveAppts.length) * 100 : 0;

      // Calculate Revenue
      let revenue = 0;
      invoicesData?.forEach(inv => {
        const member = inv.projects?.project_members?.find(pm => pm.user_id === user.id);
        if (member) {
          const splitPercentage = member.split_percentage != null ? member.split_percentage : 100;
          const teamPool = Number(inv.amount) * 0.87; // Agency takes 13%
          revenue += teamPool * (splitPercentage / 100);
        }
      });

      return {
        ...user,
        projectsCount,
        closingRate,
        revenue,
        account_status: user.account_status || 'active' // Fallback for old records
      };
    });

    // Sort by Revenue (Primary) and Closing Rate (Secondary)
    aggregated.sort((a, b) => {
      if (b.revenue !== a.revenue) {
        return b.revenue - a.revenue;
      }
      return b.closingRate - a.closingRate;
    });

    // Assign Rankings (only for active users with revenue)
    let rankIndex = 0;
    const ranked = aggregated.map((user) => {
      let rankBadge = { title: 'Member', color: 'bg-gray-100 text-gray-800 border-gray-200' };
      let rank = '-';
      
      if (user.account_status === 'pending') {
        rankBadge = { title: 'Pending Approval', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      } else if (user.revenue > 0) {
        rankIndex++;
        rank = rankIndex;
        if (rankIndex === 1) {
          rankBadge = { title: 'Platinum', color: 'bg-slate-800 text-slate-100 border-slate-700' };
        } else if (rankIndex === 2) {
          rankBadge = { title: 'Gold', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
        } else if (rankIndex === 3) {
          rankBadge = { title: 'Silver', color: 'bg-gray-100 text-gray-800 border-gray-300' };
        } else {
          rankBadge = { title: 'Bronze', color: 'bg-orange-100 text-orange-800 border-orange-200' };
        }
      }
      
      return { ...user, rank, rankBadge };
    });

    setTeamStats(ranked);
    setLoading(false);
  };

  useEffect(() => {
    loadTeamData();
  }, []);

  const handleApprove = (userId) => {
    setConfirmApprove({ isOpen: true, id: userId });
  };

  const executeApprove = async () => {
    const userId = confirmApprove.id;
    const supabase = createClient();
    try {
      const { error } = await supabase.rpc('approve_user', { user_id: userId });
        
      if (error) throw error;
      toast.success("User approved successfully!");
      loadTeamData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve user.");
    }
  };

  const handleDeleteClick = (user) => {
    setConfirmSecurityDelete({ isOpen: true, id: user.id, name: user.full_name || 'Unnamed Member' });
  };

  const executeSecurityDelete = async () => {
    const userId = confirmSecurityDelete.id;
    const supabase = createClient();
    try {
      const { error } = await supabase.rpc('delete_user_account', { user_id: userId });
      if (error) throw error;
      toast.success("User securely deleted.");
      loadTeamData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-medium text-brand-text tracking-tight mb-2">Team Performance & Management</h1>
          <p className="text-brand-text/70">Leaderboard, closing rates, and user approvals.</p>
        </div>
      </div>

      <div className="bg-brand-surface rounded-xl border border-brand-border  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border bg-brand-bg/50">
                <th className="p-4 font-medium text-brand-text/70 text-sm w-16 text-center">Rank</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Team Member</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Status / Badge</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Projects</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Win Rate</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Total Revenue</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-brand-border">
                    <td className="p-4"><div className="w-8 h-8 mx-auto bg-brand-dark/10 rounded-full"></div></td>
                    <td className="p-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-brand-dark/10"></div><div className="flex flex-col gap-2"><div className="w-24 h-4 bg-brand-dark/10 rounded"></div><div className="w-16 h-3 bg-brand-dark/5 rounded"></div></div></div></td>
                    <td className="p-4"><div className="w-24 h-6 bg-brand-dark/10 rounded-full"></div></td>
                    <td className="p-4"><div className="w-8 h-4 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="w-12 h-4 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="w-24 h-4 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="w-20 h-6 bg-brand-dark/10 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : teamStats.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-brand-text/50">No team members found.</td>
                </tr>
              ) : (
                teamStats.map((user) => (
                  <tr key={user.id} className={`border-b border-brand-border transition-colors ${user.rank === 1 ? 'bg-gradient-to-r from-amber-50/50 to-transparent hover:bg-amber-50' : 'hover:bg-brand-bg/50'}`}>
                    <td className="p-4 text-center">
                      {user.rank === 1 ? (
                        <Award className="w-5 h-5 text-amber-500 mx-auto" />
                      ) : user.rank === 2 ? (
                        <Medal className="w-5 h-5 text-slate-400 mx-auto" />
                      ) : user.rank === 3 ? (
                        <Medal className="w-5 h-5 text-orange-700 mx-auto" />
                      ) : (
                        <span className="font-medium text-brand-text/50">{user.rank}</span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-brand-text flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white  ${user.rank === 1 ? 'bg-amber-500' : 'bg-brand-dark'}`}>
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span>{user.full_name || 'Unnamed Member'}</span>
                        <span className="text-[10px] text-brand-text/40">{user.id.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${user.rankBadge.color}`}>
                        {user.account_status === 'pending' && <Clock className="w-3 h-3" />}
                        {user.rankBadge.title}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-brand-text/80">
                      {user.projectsCount}
                    </td>
                    <td className="p-4 font-medium text-brand-text/80">
                      {user.closingRate.toFixed(1)}%
                    </td>
                    <td className="p-4 font-bold text-brand-text">
                      MAD {user.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.account_status === 'pending' ? (
                          <button 
                            onClick={() => handleApprove(user.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors "
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve
                          </button>
                        ) : (
                          <span className="text-xs text-brand-text/40 font-medium px-2">Active</span>
                        )}
                        <button 
                          onClick={() => handleDeleteClick(user)} 
                          className="p-1.5 text-brand-text/40 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete User"
                        >
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
      </div>
      
      {/* Confirm Approve Modal */}
      <ConfirmModal
        isOpen={confirmApprove.isOpen}
        onClose={() => setConfirmApprove({ isOpen: false, id: null })}
        onConfirm={executeApprove}
        title="Approve User"
        message="Are you sure you want to approve this user? They will gain access to the platform."
        confirmText="Approve User"
        confirmStyle="primary"
      />
      
      {/* Security Delete Modal */}
      <SecurityDeleteModal
        isOpen={confirmSecurityDelete.isOpen}
        onClose={() => setConfirmSecurityDelete({ isOpen: false, id: null, name: '' })}
        onConfirm={executeSecurityDelete}
        userName={confirmSecurityDelete.name}
      />
    </div>
  );
}
