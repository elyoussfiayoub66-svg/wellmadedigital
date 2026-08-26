'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Edit2, Trash2, X, Search } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import toast, { Toaster } from 'react-hot-toast';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leadStatuses, setLeadStatuses] = useState([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const [formData, setFormData] = useState({
    id: null,
    full_name: '',
    agency_name: '',
    email: '',
    phone: '',
    status: '',
    appointment_id: null,
    meeting_status: '',
    meeting_result: ''
  });

  const fetchClients = async () => {
    setLoading(true);
    const supabase = createClient();
    
    // Fetch leads and left join appointments and projects
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        appointments (
          id, status, meeting_result, scheduled_at
        ),
        projects (
          id, name, status
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Process data for the table
      const processed = data.map(lead => {
        // Sort appointments by date to get the most recent
        const sortedAppts = lead.appointments?.sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at)) || [];
        const latestAppt = sortedAppts[0];

        return {
          ...lead,
          latest_appointment: latestAppt,
          projects_list: lead.projects || []
        };
      });
      setClients(processed);
    }
    setLoading(false);
  };

  const fetchSettings = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from('crm_settings').select('lead_statuses').single();
    if (!error && data?.lead_statuses) {
      setLeadStatuses(data.lead_statuses);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchSettings();
  }, []);

  const openEditModal = (client) => {
    setFormData({
      id: client.id,
      full_name: client.full_name || '',
      agency_name: client.agency_name || '',
      email: client.email || '',
      phone: client.phone || '',
      status: client.status || 'NEW',
      appointment_id: client.latest_appointment?.id || null,
      meeting_status: client.latest_appointment?.status || 'SCHEDULED',
      meeting_result: client.latest_appointment?.meeting_result || 'Pending'
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const updateForm = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();

    try {
      // Update Lead
      const { error: leadErr } = await supabase
        .from('leads')
        .update({
          full_name: formData.full_name,
          agency_name: formData.agency_name,
          email: formData.email,
          phone: formData.phone,
          status: formData.status
        })
        .eq('id', formData.id);

      if (leadErr) throw leadErr;

      // Update Appointment (if exists)
      if (formData.appointment_id) {
        const { error: apptErr } = await supabase
          .from('appointments')
          .update({
            status: formData.meeting_status,
            meeting_result: formData.meeting_result
          })
          .eq('id', formData.appointment_id);
          
        if (apptErr) throw apptErr;
      }

      closeModal();
      fetchClients();
      toast.success('Client updated!');
    } catch (err) {
      console.error(err);
      toast.error("Failed to update client.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (client) => {
    setDeleteTarget(client);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    
    const supabase = createClient();
    try {
      await supabase.from('leads').delete().eq('id', deleteTarget.id);
      toast.success('Client deleted');
      fetchClients();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete client.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    const s = status.toLowerCase();
    if (s.includes('won') || s === 'completed' || s === 'active') return 'bg-green-100 text-green-800 border-green-200';
    if (s.includes('lost') || s === 'cancelled') return 'bg-red-100 text-red-800 border-red-200';
    if (s.includes('pending') || s === 'scheduled') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-medium text-brand-text tracking-tight mb-2">Clients (CRM)</h1>
          <p className="text-brand-text/70">Manage your leads, clients, and meeting outcomes.</p>
        </div>
        
        <div className="relative w-64">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40" />
          <input 
            type="text" 
            placeholder="Search clients..." 
            className="w-full pl-10 pr-4 py-2 bg-brand-surface border border-brand-dark/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent text-sm text-brand-text"
          />
        </div>
      </div>

      <div className="bg-brand-surface rounded-xl border border-brand-dark/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-dark/5 bg-brand-bg/50">
                <th className="p-4 font-medium text-brand-text/70 text-sm">Client Info</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Contact</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Meeting Status</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Meeting Result</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Projects</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-brand-text/50">Loading clients...</td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-brand-text/50">No clients found. Book a meeting to create a client.</td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="border-b border-brand-dark/5 hover:bg-brand-bg/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-brand-text">{client.agency_name || client.full_name}</div>
                      <div className="text-xs text-brand-text/60 mt-0.5">{client.agency_name ? client.full_name : 'No Agency'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-brand-text/80">{client.email || '-'}</div>
                      <div className="text-xs text-brand-text/60 mt-0.5">{client.phone || '-'}</div>
                    </td>
                    <td className="p-4">
                      {client.latest_appointment ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(client.latest_appointment.status)}`}>
                          {client.latest_appointment.status}
                        </span>
                      ) : (
                        <span className="text-xs text-brand-text/40">No Meeting</span>
                      )}
                    </td>
                    <td className="p-4 text-sm font-medium text-brand-text/80">
                      {client.latest_appointment?.meeting_result || '-'}
                    </td>
                    <td className="p-4">
                      {client.projects_list.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {client.projects_list.map((proj, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <span className={`w-2 h-2 rounded-full ${getStatusColor(proj.status).split(' ')[0]}`}></span>
                              <span className="text-brand-text/80">{proj.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-brand-text/40">None</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(client)} className="p-1.5 text-brand-text/50 hover:text-brand-accent hover:bg-brand-accent/10 rounded-md transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(client)} className="p-1.5 text-brand-text/50 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
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

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-brand-dark/10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-brand-dark/5 shrink-0">
              <h2 className="text-xl font-medium text-brand-text">Edit Client</h2>
              <button onClick={closeModal} className="text-brand-text/50 hover:text-brand-text p-1 rounded-full hover:bg-brand-bg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="edit-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Lead Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => updateForm('status', e.target.value)} 
                    className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  >
                    {leadStatuses.length === 0 && <option value={formData.status}>{formData.status || 'NEW'}</option>}
                    {leadStatuses.map((status, idx) => (
                      <option key={idx} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Full Name</label>
                  <input required type="text" value={formData.full_name} onChange={e => updateForm('full_name', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Business/Agency Name</label>
                  <input type="text" value={formData.agency_name} onChange={e => updateForm('agency_name', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Email</label>
                    <input type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Phone</label>
                    <input type="tel" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                </div>

                <div className="border-t border-brand-dark/5 pt-4 mt-2">
                  <h3 className="text-sm font-semibold text-brand-text mb-4">Meeting Status</h3>
                  
                  {formData.appointment_id ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-brand-text">Status</label>
                        <select value={formData.meeting_status} onChange={e => updateForm('meeting_status', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent">
                          <option value="SCHEDULED">Scheduled</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="NO_SHOW">No Show</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-brand-text">Meeting Result</label>
                        <select value={formData.meeting_result} onChange={e => updateForm('meeting_result', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent">
                          <option value="Pending">Pending</option>
                          <option value="Closed Won">Closed Won</option>
                          <option value="Closed Lost">Closed Lost</option>
                          <option value="Follow Up">Follow Up</option>
                          <option value="Not Interested">Not Interested</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-brand-text/50">No appointment found for this client.</div>
                  )}
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-brand-dark/5 bg-brand-surface shrink-0 flex items-center justify-end gap-3">
              <button type="button" onClick={closeModal} className="text-brand-text/70 hover:text-brand-text text-sm font-medium px-4 py-2 transition-colors">
                Cancel
              </button>
              <button 
                form="edit-form" 
                type="submit" 
                disabled={submitting}
                className="bg-brand-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 shadow-sm transition-opacity disabled:opacity-70"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={handleConfirmDelete} 
        title='Delete Client?' 
        message={`${deleteTarget?.full_name || deleteTarget?.agency_name} and all their meeting data will be permanently removed.`} 
        confirmText='Yes, Delete' 
        confirmStyle='danger' 
      />
      <Toaster position='top-right' />
    </div>
  );
}
