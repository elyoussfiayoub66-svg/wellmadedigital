'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [leads, setLeads] = useState([]); // Used for 'Client' selection
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    lead_id: '',
    start_date: '',
    delivery_date: '',
    status: 'Planning',
    value: '',
    assignedUsers: [] // Array of { user_id, percentage }
  });

  const fetchInitialData = async () => {
    setLoading(true);
    const supabase = createClient();
    
    // Fetch Projects with relations
    const { data: projectsData, error: projErr } = await supabase
      .from('projects')
      .select(`
        *,
        leads(agency_name, full_name),
        project_members(
          user_id,
          split_percentage,
          profiles(id, full_name)
        )
      `)
      .order('created_at', { ascending: false });

    if (!projErr && projectsData) {
      setProjects(projectsData);
    }

    // Fetch Leads for dropdown
    const { data: leadsData } = await supabase.from('leads').select('id, agency_name, full_name');
    if (leadsData) setLeads(leadsData);

    // Fetch Team Members for assignment
    const { data: teamData } = await supabase.from('profiles').select('id, full_name');
    if (teamData) setTeamMembers(teamData);

    setLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const openModal = (mode = 'create', project = null) => {
    setModalMode(mode);
    if (mode === 'edit' && project) {
      setFormData({
        id: project.id,
        name: project.name || '',
        lead_id: project.lead_id || '',
        start_date: project.start_date || '',
        delivery_date: project.delivery_date || '',
        status: project.status || 'Planning',
        value: project.value || '',
        assignedUsers: project.project_members?.map(pm => ({
          user_id: pm.user_id,
          percentage: pm.split_percentage != null ? pm.split_percentage : 100
        })) || []
      });
    } else {
      setFormData({
        id: null, name: '', lead_id: '', start_date: '', delivery_date: '',
        status: 'Planning', value: '', assignedUsers: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleUserAssignment = (userId) => {
    setFormData(prev => {
      const isSelected = prev.assignedUsers.some(u => u.user_id === userId);
      let newAssigned;
      
      if (isSelected) {
        newAssigned = prev.assignedUsers.filter(u => u.user_id !== userId);
      } else {
        newAssigned = [...prev.assignedUsers, { user_id: userId, percentage: 100 }];
      }
      
      // Automatically calculate a fair split whenever someone is added OR removed
      const count = newAssigned.length;
      if (count > 0) {
        const split = Math.floor(100 / count);
        newAssigned = newAssigned.map((u, idx) => ({
          ...u,
          percentage: idx === 0 ? 100 - (split * (count - 1)) : split // ensure it equals 100
        }));
      }
      
      return { ...prev, assignedUsers: newAssigned };
    });
  };

  const updatePercentage = (userId, value) => {
    setFormData(prev => ({
      ...prev,
      assignedUsers: prev.assignedUsers.map(u => 
        u.user_id === userId ? { ...u, percentage: Number(value) } : u
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enforce 100% split
    const totalSplit = formData.assignedUsers.reduce((sum, u) => sum + Number(u.percentage), 0);
    if (formData.assignedUsers.length > 0 && totalSplit !== 100) {
      toast.error(`The assigned percentages must total exactly 100%. Currently: ${totalSplit}%`);
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      const projectPayload = {
        name: formData.name,
        lead_id: formData.lead_id || null,
        start_date: formData.start_date || null,
        delivery_date: formData.delivery_date || null,
        status: formData.status,
        value: formData.value || 0
      };

      let projectId = formData.id;

      if (modalMode === 'create') {
        // Insert Project
        const { data, error } = await supabase.from('projects').insert([projectPayload]).select().single();
        if (error) throw error;
        projectId = data.id;
      } else {
        // Update Project
        const { error } = await supabase.from('projects').update(projectPayload).eq('id', projectId);
        if (error) throw error;
        
        // Delete existing members to recreate
        await supabase.from('project_members').delete().eq('project_id', projectId);
      }

      // Insert assigned users with their split percentage
      if (formData.assignedUsers.length > 0) {
        const membersPayload = formData.assignedUsers.map(u => ({
          project_id: projectId,
          user_id: u.user_id,
          split_percentage: u.percentage
        }));
        const { error: membersErr } = await supabase.from('project_members').insert(membersPayload);
        if (membersErr) throw membersErr;
      }

      closeModal();
      toast.success(modalMode === 'create' ? 'Project created successfully' : 'Project updated successfully');
      fetchInitialData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save project.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const executeDelete = async () => {
    const id = confirmDelete.id;
    const supabase = createClient();
    try {
      await supabase.from('projects').delete().eq('id', id);
      toast.success("Project deleted successfully");
      fetchInitialData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-medium text-brand-text tracking-tight mb-2">Projects</h1>
          <p className="text-brand-text/70">Manage and track all your active projects.</p>
        </div>
        <button onClick={() => openModal('create')} className="flex items-center gap-2 bg-brand-accent text-white px-4 py-2 rounded-lg font-medium hover:opacity-90  transition-opacity">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="bg-brand-surface rounded-xl border border-brand-border  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border bg-brand-bg/50">
                <th className="p-4 font-medium text-brand-text/70 text-sm">Project Name</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Client</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Start Date</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Delivery Date</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Team (Split)</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Status</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Value</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-brand-border">
                    <td className="p-4"><div className="w-32 h-4 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="w-24 h-4 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="w-20 h-4 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="w-20 h-4 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="flex -space-x-2"><div className="w-8 h-8 rounded-full bg-brand-dark/10"></div><div className="w-8 h-8 rounded-full bg-brand-dark/10"></div></div></td>
                    <td className="p-4"><div className="w-16 h-5 bg-brand-dark/10 rounded-full"></div></td>
                    <td className="p-4"><div className="w-20 h-4 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="flex justify-end gap-2"><div className="w-7 h-7 bg-brand-dark/10 rounded-md"></div><div className="w-7 h-7 bg-brand-dark/10 rounded-md"></div></div></td>
                  </tr>
                ))
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-brand-text/50">No projects found. Create one to get started.</td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="border-b border-brand-border hover:bg-brand-bg/50 transition-colors">
                    <td className="p-4 font-medium text-brand-text">{project.name}</td>
                    <td className="p-4 text-brand-text/80 text-sm">{project.leads?.agency_name || project.leads?.full_name || 'No Client'}</td>
                    <td className="p-4 text-brand-text/70 text-sm">{project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}</td>
                    <td className="p-4 text-brand-text/70 text-sm">{project.delivery_date ? new Date(project.delivery_date).toLocaleDateString() : '-'}</td>
                    <td className="p-4">
                      <div className="flex -space-x-2">
                        {project.project_members?.length > 0 ? (
                          project.project_members.map((pm, idx) => (
                            <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-brand-dark flex items-center justify-center text-xs font-bold text-white  relative group" title={`${pm.profiles?.full_name} (${pm.split_percentage || 100}%)`}>
                              {pm.profiles?.full_name?.charAt(0) || 'U'}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-brand-text/40">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-brand-text">
                      {project.value ? `MAD ${Number(project.value).toLocaleString()}` : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openModal('edit', project)} className="p-1.5 text-brand-text/50 hover:text-brand-accent hover:bg-brand-accent/10 rounded-md transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(project.id)} className="p-1.5 text-brand-text/50 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
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

      {/* Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-lg rounded-2xl  overflow-hidden border border-brand-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-brand-border shrink-0">
              <h2 className="text-xl font-medium text-brand-text">
                {modalMode === 'create' ? 'Create New Project' : 'Edit Project'}
              </h2>
              <button onClick={closeModal} className="text-brand-text/50 hover:text-brand-text p-1 rounded-full hover:bg-brand-bg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="project-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Project Name *</label>
                  <input required type="text" value={formData.name} onChange={e => updateForm('name', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Client (Lead)</label>
                  <select value={formData.lead_id} onChange={e => updateForm('lead_id', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent">
                    <option value="">Select a client...</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.agency_name || l.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Start Date</label>
                    <input type="date" value={formData.start_date} onChange={e => updateForm('start_date', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Delivery Date</label>
                    <input type="date" value={formData.delivery_date} onChange={e => updateForm('delivery_date', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Status</label>
                    <select value={formData.status} onChange={e => updateForm('status', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent">
                      <option value="Planning">Planning</option>
                      <option value="Active">Active</option>
                      <option value="Review">Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Project Value (MAD)</label>
                    <input type="number" step="0.01" value={formData.value} onChange={e => updateForm('value', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-brand-border">
                  <label className="text-sm font-medium text-brand-text flex justify-between">
                    <span>Assign Team Members</span>
                    <span className="text-xs text-brand-text/50">Revenue Split %</span>
                  </label>
                  <div className="bg-brand-bg border border-brand-border rounded-lg p-3 max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                    {teamMembers.length === 0 ? (
                      <div className="text-xs text-brand-text/50">No team members found.</div>
                    ) : (
                      teamMembers.map(member => {
                        const assigned = formData.assignedUsers.find(u => u.user_id === member.id);
                        return (
                          <div key={member.id} className="flex items-center justify-between p-1.5 hover:bg-brand-surface rounded-md transition-colors">
                            <label className="flex items-center gap-3 cursor-pointer flex-1">
                              <input 
                                type="checkbox" 
                                checked={!!assigned}
                                onChange={() => toggleUserAssignment(member.id)}
                                className="w-4 h-4 text-brand-accent rounded border-brand-border focus:ring-brand-accent"
                              />
                              <span className="text-sm text-brand-text truncate">{member.full_name || 'Unnamed Member'}</span>
                            </label>
                            
                            {assigned && (
                              <div className="flex items-center gap-1 w-20 shrink-0">
                                <input 
                                  type="number" 
                                  min="0" max="100" 
                                  value={assigned.percentage} 
                                  onChange={(e) => updatePercentage(member.id, e.target.value)}
                                  className="w-12 px-1.5 py-1 text-xs font-medium bg-brand-surface border border-brand-border rounded focus:outline-none focus:border-brand-accent text-right "
                                />
                                <span className="text-xs font-medium text-brand-text/60">%</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                  
                  {formData.assignedUsers.length > 0 && (
                    <div className="flex justify-between items-center text-xs mt-2 px-1">
                      <span className="text-brand-text/60">Total Split Allocation:</span>
                      <span className={`font-bold ${formData.assignedUsers.reduce((sum, u) => sum + Number(u.percentage), 0) === 100 ? 'text-green-600' : 'text-amber-600'}`}>
                        {formData.assignedUsers.reduce((sum, u) => sum + Number(u.percentage), 0)}%
                      </span>
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-brand-border bg-brand-surface shrink-0 flex items-center justify-end gap-3">
              <button type="button" onClick={closeModal} className="text-brand-text/70 hover:text-brand-text text-sm font-medium px-4 py-2 transition-colors">
                Cancel
              </button>
              <button 
                form="project-form" 
                type="submit" 
                disabled={submitting}
                className="bg-brand-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90  transition-opacity disabled:opacity-70"
              >
                {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Project' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={executeDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone and will delete associated members and tasks."
        confirmText="Delete Project"
        confirmStyle="danger"
      />
    </div>
  );
}
