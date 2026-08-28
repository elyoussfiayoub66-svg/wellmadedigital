'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Award, Medal, CheckCircle2, Clock, Trash2, Eye, X, Briefcase, ListTodo, Users, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import SecurityDeleteModal from '@/components/SecurityDeleteModal';

export default function TeamPage() {
  const [teamStats, setTeamStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmApprove, setConfirmApprove] = useState({ isOpen: false, id: null });
  const [confirmSecurityDelete, setConfirmSecurityDelete] = useState({ isOpen: false, id: null, name: '' });
  const [inspectUser, setInspectUser] = useState(null);

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

    // 5. Fetch tasks for task completion rate
    const { data: tasksData } = await supabase.from('tasks').select('assignee_id, status');
    
    // 6. Fetch prospects for "prospects listed"
    // Note: if created_by doesn't exist, this will gracefully fallback to 0
    const { data: prospectsData } = await supabase.from('prospects').select('*');

    if (!profilesData) {
      setLoading(false);
      return;
    }

    // Aggregate data per user
    const aggregated = profilesData.map(user => {
      // Count projects
      const projectsCount = pmData?.filter(pm => pm.user_id === user.id).length || 0;
      
      // Meetings & Closing Rate
      const userAppts = apptData?.filter(a => a.assignee_id === user.id) || [];
      const conclusiveAppts = userAppts.filter(a => a.meeting_result && a.meeting_result !== 'Pending');
      const wonAppts = conclusiveAppts.filter(a => a.meeting_result === 'Closed Won');
      const closingRate = conclusiveAppts.length > 0 ? (wonAppts.length / conclusiveAppts.length) * 100 : 0;

      const meetingsAssigned = userAppts.length;
      const meetingsCompleted = conclusiveAppts.length;

      // Tasks Completion Rate
      const userTasks = tasksData?.filter(t => t.assignee_id === user.id) || [];
      const completedTasks = userTasks.filter(t => t.status === 'Completed');
      const taskCompletionRate = userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0;

      // Prospects Listed
      const prospectsListed = prospectsData?.filter(p => p.created_by === user.id).length || 0;

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
        meetingsAssigned,
        meetingsCompleted,
        taskCompletionRate,
        prospectsListed,
        revenue,
        account_status: user.account_status || 'active'
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
                <th className="p-4 font-medium text-brand-text/70 text-sm">Expertise</th>
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
                    <td className="p-4"><div className="w-32 h-6 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="w-24 h-6 bg-brand-dark/10 rounded-full"></div></td>
                    <td className="p-4"><div className="w-8 h-4 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="w-12 h-4 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="w-24 h-4 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="w-20 h-6 bg-brand-dark/10 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : teamStats.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-brand-text/50">No team members found.</td>
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
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {user.expertise && user.expertise.length > 0 ? (
                          <>
                            {user.expertise.slice(0, 3).map(tech => (
                              <span key={tech} className="px-2 py-0.5 text-[10px] font-medium bg-brand-dark/10 border border-brand-dark/20 rounded text-brand-text/70 whitespace-nowrap">
                                {tech}
                              </span>
                            ))}
                            {user.expertise.length > 3 && (
                              <span className="px-2 py-0.5 text-[10px] font-medium bg-brand-accent/10 border border-brand-accent/20 rounded text-brand-accent whitespace-nowrap">
                                +{user.expertise.length - 3} more
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-brand-text/40 italic">Unspecified</span>
                        )}
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
                          onClick={() => setInspectUser(user)} 
                          className="p-1.5 text-brand-text/60 hover:text-brand-text hover:bg-brand-bg rounded-md transition-colors flex items-center gap-1 text-xs font-medium"
                          title="Inspect User"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Inspect</span>
                        </button>
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

      {/* Inspect User Slide-up Panel */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-2xl rounded-t-3xl sm:rounded-2xl overflow-hidden border border-brand-border flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 shadow-2xl">
            
            <div className="flex items-start justify-between p-6 sm:p-8 border-b border-brand-border shrink-0 bg-brand-bg/30">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white bg-brand-dark border-2 border-brand-border">
                  {inspectUser.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-text">{inspectUser.full_name || 'Unnamed Member'}</h2>
                  <p className="text-sm text-brand-text/50">{inspectUser.email}</p>
                </div>
              </div>
              <button onClick={() => setInspectUser(null)} className="p-2 text-brand-text/50 hover:text-brand-text bg-brand-bg/50 hover:bg-brand-dark/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar space-y-8">
              
              {/* Expertise Tags */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text/50">Full Area of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {inspectUser.expertise && inspectUser.expertise.length > 0 ? (
                    inspectUser.expertise.map(tech => (
                      <span key={tech} className="px-3 py-1 text-xs font-medium bg-brand-dark/10 border border-brand-dark/20 rounded-md text-brand-text/80">
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-brand-text/40 italic">No expertise selected yet.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Metric Cards */}
                <div className="bg-brand-bg/30 border border-brand-border p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-brand-text/50 mb-2"><Users className="w-4 h-4"/> <span className="text-xs font-bold uppercase tracking-wider">Prospects Listed</span></div>
                  <div className="text-3xl font-bold text-brand-text">{inspectUser.prospectsListed || 0}</div>
                </div>

                <div className="bg-brand-bg/30 border border-brand-border p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-brand-text/50 mb-2"><Briefcase className="w-4 h-4"/> <span className="text-xs font-bold uppercase tracking-wider">Projects Worked On</span></div>
                  <div className="text-3xl font-bold text-brand-text">{inspectUser.projectsCount || 0}</div>
                </div>

                <div className="bg-brand-bg/30 border border-brand-border p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-brand-text/50 mb-2"><Target className="w-4 h-4"/> <span className="text-xs font-bold uppercase tracking-wider">Meetings (Assigned / Completed)</span></div>
                  <div className="text-3xl font-bold text-brand-text">{inspectUser.meetingsAssigned || 0} <span className="text-brand-text/40 text-lg">/ {inspectUser.meetingsCompleted || 0}</span></div>
                </div>

                <div className="bg-brand-bg/30 border border-brand-border p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-brand-text/50 mb-2"><Award className="w-4 h-4"/> <span className="text-xs font-bold uppercase tracking-wider">Closing Rate</span></div>
                  <div className="text-3xl font-bold text-brand-accent">{inspectUser.closingRate ? inspectUser.closingRate.toFixed(1) : 0}%</div>
                </div>
                
                <div className="col-span-2 bg-brand-bg/30 border border-brand-border p-4 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-brand-text/50 mb-2">
                    <div className="flex items-center gap-2"><ListTodo className="w-4 h-4"/> <span className="text-xs font-bold uppercase tracking-wider">Task Completion Rate</span></div>
                    <span className="text-xs font-medium text-brand-text">{inspectUser.taskCompletionRate ? inspectUser.taskCompletionRate.toFixed(0) : 0}%</span>
                  </div>
                  <div className="w-full bg-brand-dark/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-accent h-full rounded-full transition-all duration-1000" style={{ width: `${inspectUser.taskCompletionRate || 0}%` }}></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
