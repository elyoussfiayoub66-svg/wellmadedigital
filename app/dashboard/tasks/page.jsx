'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TasksPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectMembers, setProjectMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Assigned',
    assignee_id: '',
    due_date: ''
  });

  const COLUMNS = ['Assigned', 'In Progress', 'Tested', 'Completed', 'Overdue'];

  useEffect(() => {
    async function loadProjects() {
      const supabase = createClient();
      const { data } = await supabase
        .from('projects')
        .select('id, name')
        .order('created_at', { ascending: false });
      
      if (data) {
        setProjects(data);
        if (data.length > 0) setSelectedProjectId(data[0].id);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    
    async function loadProjectData() {
      setLoading(true);
      const supabase = createClient();
      
      // Load members for this specific project
      const { data: membersData } = await supabase
        .from('project_members')
        .select('profiles(id, full_name)')
        .eq('project_id', selectedProjectId);
      
      if (membersData) {
        setProjectMembers(membersData.map(pm => pm.profiles));
      }

      // Load tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles:assignee_id(id, full_name)
        `)
        .eq('project_id', selectedProjectId);
      
      if (tasksData) {
        setTasks(tasksData);
      }
      setLoading(false);
    }
    
    loadProjectData();
  }, [selectedProjectId]);

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow dropping
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    // Database update
    const supabase = createClient();
    try {
      await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    } catch (error) {
      console.error("Failed to update task status:", error);
      // Ideally, revert UI state here on failure
    }
  };

  // Modal Handlers
  const openModal = () => {
    setFormData({ title: '', description: '', status: 'Assigned', assignee_id: '', due_date: '' });
    setIsModalOpen(true);
  };
  
  const closeModal = () => setIsModalOpen(false);
  
  const updateForm = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.from('tasks').insert([{
        project_id: selectedProjectId,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        assignee_id: formData.assignee_id || null,
        due_date: formData.due_date || null
      }]).select(`*, profiles:assignee_id(id, full_name)`).single();

      if (error) throw error;

      setTasks(prev => [...prev, data]);
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned': return 'border-blue-200 bg-blue-50 text-blue-700';
      case 'In Progress': return 'border-yellow-200 bg-yellow-50 text-yellow-700';
      case 'Tested': return 'border-purple-200 bg-purple-50 text-purple-700';
      case 'Completed': return 'border-green-200 bg-green-50 text-green-700';
      case 'Overdue': return 'border-red-200 bg-red-50 text-red-700';
      default: return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-medium text-brand-text tracking-tight mb-2">Tasks</h1>
          <p className="text-brand-text/70">Project kanban board and task assignments.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-brand-surface border border-brand-dark/10 rounded-lg p-1 shadow-sm">
            <select 
              value={selectedProjectId} 
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium text-brand-text px-4 py-1.5 cursor-pointer outline-none w-48"
            >
              <option value="" disabled>Select a Project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={openModal} 
            disabled={!selectedProjectId}
            className="flex items-center gap-2 bg-brand-accent text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 shadow-sm transition-opacity disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        {!selectedProjectId ? (
          <div className="h-full flex items-center justify-center text-brand-text/50">
            Please select a project to view its tasks.
          </div>
        ) : loading ? (
          <div className="h-full flex items-center justify-center text-brand-text/50">
            Loading board...
          </div>
        ) : (
          <div className="flex h-full gap-6 min-w-max">
            {COLUMNS.map(column => {
              const columnTasks = tasks.filter(t => t.status === column);
              
              return (
                <div 
                  key={column} 
                  className="flex flex-col w-[320px] shrink-0"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column)}
                >
                  <div className={`px-4 py-3 rounded-t-xl border-t border-x ${getStatusColor(column)} flex items-center justify-between`}>
                    <h3 className="font-semibold text-sm">{column}</h3>
                    <span className="text-xs font-bold bg-white/50 px-2 py-0.5 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 bg-brand-surface/50 border border-brand-dark/10 rounded-b-xl p-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
                    {columnTasks.length === 0 && (
                      <div className="text-xs text-brand-text/30 text-center py-4 border-2 border-dashed border-brand-dark/5 rounded-lg">
                        Drop tasks here
                      </div>
                    )}
                    
                    {columnTasks.map(task => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="bg-brand-surface border border-brand-dark/10 p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-brand-accent/30 transition-colors group"
                      >
                        <h4 className="font-medium text-brand-text text-sm mb-1">{task.title}</h4>
                        {task.description && (
                          <p className="text-xs text-brand-text/60 line-clamp-2 mb-3">{task.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-dark/5">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-brand-text/50">
                            <Clock className="w-3.5 h-3.5" />
                            {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'No date'}
                          </div>
                          
                          {task.profiles && (
                            <div className="w-6 h-6 rounded-full bg-brand-dark flex items-center justify-center text-[10px] font-bold text-white shadow-sm" title={task.profiles.full_name}>
                              {task.profiles.full_name.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-brand-dark/10 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-brand-dark/5 shrink-0">
              <h2 className="text-xl font-medium text-brand-text">Create Task</h2>
              <button onClick={closeModal} className="text-brand-text/50 hover:text-brand-text p-1 rounded-full hover:bg-brand-bg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Task Title *</label>
                  <input required type="text" value={formData.title} onChange={e => updateForm('title', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Description</label>
                  <textarea rows={3} value={formData.description} onChange={e => updateForm('description', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none"></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Assign To</label>
                    <select required value={formData.assignee_id} onChange={e => updateForm('assignee_id', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent">
                      <option value="">Select Team Member...</option>
                      {projectMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name}</option>
                      ))}
                    </select>
                    {projectMembers.length === 0 && (
                      <p className="text-[10px] text-red-500 mt-1">No team members assigned to this project.</p>
                    )}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Due Date</label>
                    <input type="date" value={formData.due_date} onChange={e => updateForm('due_date', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-brand-dark/5 bg-brand-surface shrink-0 flex items-center justify-end gap-3">
              <button type="button" onClick={closeModal} className="text-brand-text/70 hover:text-brand-text text-sm font-medium px-4 py-2 transition-colors">
                Cancel
              </button>
              <button 
                form="task-form" 
                type="submit" 
                disabled={submitting}
                className="bg-brand-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 shadow-sm transition-opacity disabled:opacity-70"
              >
                {submitting ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
