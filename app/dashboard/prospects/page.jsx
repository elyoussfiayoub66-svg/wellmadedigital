'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Edit2, Trash2, X, Search, CalendarPlus, Plus } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import toast, { Toaster } from 'react-hot-toast';

export default function ProspectsPage() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNiche, setFilterNiche] = useState('All');
  const [filterOutreach, setFilterOutreach] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [teamMembers, setTeamMembers] = useState([]);
  
  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [scheduleData, setScheduleData] = useState({
    hostId: '',
    date: '',
    time: '',
    meetingLink: '',
    note: ''
  });

  
  const [formData, setFormData] = useState({
    id: null,
    business_name: '',
    owner_name: '',
    niche: '',
    ig_handle: '',
    phone: '',
    email: '',
    pipeline_status: 'not contacted',
    outreach_status: 'not called',
    followup_status: ''
  });

  const fetchProspects = async () => {
    setLoading(true);
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProspects(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  const openAddModal = () => {
    setFormData({
      id: null,
      business_name: '',
      owner_name: '',
      niche: '',
      ig_handle: '',
      phone: '',
      email: '',
      pipeline_status: 'not contacted',
      outreach_status: 'not called',
      followup_status: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prospect) => {
    setFormData({ ...prospect });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  
  useEffect(() => {
    async function loadTeam() {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('id, full_name').eq('account_status', 'active');
      if (data) setTeamMembers(data);
    }
    loadTeam();
  }, []);

  useEffect(() => {
    async function fetchSlots() {
      if (!scheduleData.hostId || !scheduleData.date) {
        setAvailableSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/availability?date=${scheduleData.date}&assignee_id=${scheduleData.hostId}`);
        const data = await res.json();
        if (res.ok && data.availableSlots) {
          setAvailableSlots(data.availableSlots);
        } else {
          setAvailableSlots([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [scheduleData.hostId, scheduleData.date]);

  const openScheduleModal = (prospect) => {
    setScheduleTarget(prospect);
    setScheduleData({
      hostId: '',
      date: '',
      time: '',
      meetingLink: '',
      note: ''
    });
    setIsScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setScheduleTarget(null);
  };

  const updateSchedule = (key, value) => {
    setScheduleData(prev => ({ ...prev, [key]: value }));
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleData.time) {
      toast.error("Please select a meeting time.");
      return;
    }

    setScheduleSubmitting(true);
    try {
      const supabase = createClient();
      
      // 1. Insert Lead
      const { data: leadData, error: leadError } = await supabase.from('leads').insert([{
        full_name: scheduleTarget.owner_name || scheduleTarget.business_name || 'Unknown',
        phone: scheduleTarget.phone,
        agency_name: scheduleTarget.business_name,
        email: scheduleTarget.email,
        instagram: scheduleTarget.ig_handle,
        status: 'NEW'
      }]).select().single();
      
      if (leadError) throw leadError;

      // 2. Insert Appointment
      const scheduledAt = new Date(`${scheduleData.date}T${scheduleData.time}:00.000Z`).toISOString();
      const { error: apptError } = await supabase.from('appointments').insert([{
        lead_id: leadData.id,
        assignee_id: scheduleData.hostId,
        scheduled_at: scheduledAt,
        notes: scheduleData.note,
        meeting_link: scheduleData.meetingLink,
        status: 'SCHEDULED'
      }]);

      if (apptError) throw apptError;

      // 3. Update prospect pipeline status
      await supabase.from('prospects').update({ pipeline_status: 'meeting scheduled' }).eq('id', scheduleTarget.id);

      toast.success("Meeting scheduled successfully");
      closeScheduleModal();
      fetchProspects();
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule meeting.");
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const updateForm = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();

    try {
      if (formData.id) {
        // Update
        const { error } = await supabase
          .from('prospects')
          .update({
            business_name: formData.business_name,
            owner_name: formData.owner_name,
            niche: formData.niche,
            ig_handle: formData.ig_handle,
            phone: formData.phone,
            email: formData.email,
            pipeline_status: formData.pipeline_status,
            outreach_status: formData.outreach_status,
            followup_status: formData.followup_status
          })
          .eq('id', formData.id);

        if (error) throw error;
        toast.success('Prospect updated!');
      } else {
        // Create
        const { error } = await supabase
          .from('prospects')
          .insert([{
            business_name: formData.business_name,
            owner_name: formData.owner_name,
            niche: formData.niche,
            ig_handle: formData.ig_handle,
            phone: formData.phone,
            email: formData.email,
            pipeline_status: formData.pipeline_status,
            outreach_status: formData.outreach_status,
            followup_status: formData.followup_status
          }]);

        if (error) throw error;
        toast.success('Prospect added!');
      }

      closeModal();
      fetchProspects();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save prospect.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (prospect) => {
    setDeleteTarget(prospect);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    
    const supabase = createClient();
    try {
      await supabase.from('prospects').delete().eq('id', deleteTarget.id);
      toast.success('Prospect deleted');
      fetchProspects();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete prospect.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const pipelineOptions = ["not contacted", "contacted", "meeting scheduled", "discovery call completed", "negotiation", "closed", "lost"];
  const outreachOptions = ["email sent", "dm sent", "no answer", "no answer 1", "no answer 2", "no answer 3", "voice mail", "voice mail 1", "voice mail 2", "not called", "meeting booked", "follow up", "not interested", "do not call", "wrong contact"];
  const followupOptions = ["", "meeting booked", "not interested", "do not contact", "no answer", "voice mail"];

  const uniqueNiches = [...new Set(prospects.map(p => p.niche).filter(Boolean))].sort();

  // Filter prospects based on active tab, search, and dropdowns
  const displayedProspects = prospects.filter(p => {
    // 1. Search filtering (all contact info)
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      p.business_name?.toLowerCase().includes(q) || 
      p.owner_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.ig_handle?.toLowerCase().includes(q) ||
      p.niche?.toLowerCase().includes(q)
    );
    if (!matchesSearch) return false;

    // 2. Dropdown filtering
    if (filterNiche !== 'All' && p.niche !== filterNiche) return false;
    if (filterOutreach !== 'All' && p.outreach_status !== filterOutreach) return false;

    // 3. Tab filtering
    if (activeTab === 'all') return true;
    
    // Followups tab logic
    const out = p.outreach_status?.toLowerCase() || '';
    const follow = p.followup_status?.toLowerCase() || '';
    return out.includes('no answer') || out.includes('voice mail') || out.includes('follow up') || follow !== '';
  });

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    const s = status.toLowerCase();
    if (s.includes('closed') || s.includes('booked') || s.includes('completed')) return 'bg-green-100 text-green-800 border-green-200';
    if (s.includes('lost') || s.includes('not interested') || s.includes('wrong') || s.includes('do not call')) return 'bg-red-100 text-red-800 border-red-200';
    if (s.includes('negotiation') || s.includes('no answer') || s.includes('voice mail') || s.includes('follow up')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-medium text-brand-text tracking-tight mb-2">Prospects</h1>
          <p className="text-brand-text/70">Manage your outreach pipeline and followups.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Niche Filter */}
          <select 
            value={filterNiche} 
            onChange={e => setFilterNiche(e.target.value)}
            className="bg-brand-surface border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent min-w-[140px] appearance-none"
          >
            <option value="All">All Niches</option>
            {uniqueNiches.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          
          {/* Outreach Filter */}
          <select 
            value={filterOutreach} 
            onChange={e => setFilterOutreach(e.target.value)}
            className="bg-brand-surface border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent min-w-[140px] appearance-none"
          >
            <option value="All">All Outreach</option>
            {outreachOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent text-sm text-brand-text"
            />
          </div>
          <button onClick={openAddModal} className="flex items-center gap-2 bg-brand-accent text-white px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity font-medium text-sm whitespace-nowrap">
            <Plus className="w-4 h-4" />
            Add Prospect
          </button>
        </div>
      </div>

      <div className="flex border-b border-brand-border mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'all' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text/60 hover:text-brand-text'}`}
        >
          All Prospects
        </button>
        <button
          onClick={() => setActiveTab('followups')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'followups' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text/60 hover:text-brand-text'}`}
        >
          Followups
        </button>
      </div>

      <div className="bg-brand-surface rounded-xl border border-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border bg-brand-bg/50">
                <th className="p-4 font-medium text-brand-text/70 text-sm">Business Info</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Contact Details</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Pipeline Status</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Outreach Status</th>
                {activeTab === 'followups' && (
                  <th className="p-4 font-medium text-brand-text/70 text-sm">Followup Status</th>
                )}
                <th className="p-4 font-medium text-brand-text/70 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={activeTab === 'followups' ? 6 : 5} className="p-8 text-center text-brand-text/50">Loading prospects...</td>
                </tr>
              ) : displayedProspects.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'followups' ? 6 : 5} className="p-8 text-center text-brand-text/50">No prospects found.</td>
                </tr>
              ) : (
                displayedProspects.map((prospect) => (
                  <tr key={prospect.id} className="border-b border-brand-border hover:bg-brand-bg/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-brand-text">{prospect.business_name}</div>
                      <div className="text-xs text-brand-text/60 mt-0.5">{prospect.owner_name || 'No owner listed'} • {prospect.niche || 'No niche'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-brand-text/80">{prospect.email || '-'}</div>
                      <div className="text-xs text-brand-text/60 mt-0.5">{prospect.phone || '-'} {prospect.ig_handle ? `• ${prospect.ig_handle}` : ''}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(prospect.pipeline_status)}`}>
                        {prospect.pipeline_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(prospect.outreach_status)}`}>
                        {prospect.outreach_status}
                      </span>
                    </td>
                    {activeTab === 'followups' && (
                      <td className="p-4">
                        {prospect.followup_status ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(prospect.followup_status)}`}>
                            {prospect.followup_status}
                          </span>
                        ) : (
                          <span className="text-xs text-brand-text/40">-</span>
                        )}
                      </td>
                    )}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openScheduleModal(prospect)} className="p-1.5 text-brand-text/50 hover:text-green-500 hover:bg-green-500/10 rounded-md transition-colors" title="Schedule Meeting">
                          <CalendarPlus className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEditModal(prospect)} className="p-1.5 text-brand-text/50 hover:text-brand-accent hover:bg-brand-accent/10 rounded-md transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(prospect)} className="p-1.5 text-brand-text/50 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
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
          <div className="bg-brand-surface w-full max-w-2xl rounded-2xl overflow-hidden border border-brand-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-brand-border shrink-0">
              <h2 className="text-xl font-medium text-brand-text">{formData.id ? 'Edit' : 'Add'} Prospect</h2>
              <button onClick={closeModal} className="text-brand-text/50 hover:text-brand-text p-1 rounded-full hover:bg-brand-bg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="prospect-form" onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Business Name</label>
                    <input required type="text" value={formData.business_name} onChange={e => updateForm('business_name', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Owner Name</label>
                    <input type="text" value={formData.owner_name} onChange={e => updateForm('owner_name', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Email</label>
                    <input type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Phone</label>
                    <input type="tel" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">IG Handle</label>
                    <input type="text" value={formData.ig_handle} onChange={e => updateForm('ig_handle', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Niche</label>
                  <input type="text" value={formData.niche} onChange={e => updateForm('niche', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                </div>

                <div className="border-t border-brand-border pt-4 mt-2">
                  <h3 className="text-sm font-semibold text-brand-text mb-4">Pipeline & Outreach</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">Pipeline Status</label>
                      <select value={formData.pipeline_status} onChange={e => updateForm('pipeline_status', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent">
                        {pipelineOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">Outreach Status</label>
                      <select value={formData.outreach_status} onChange={e => updateForm('outreach_status', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent">
                        {outreachOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-sm font-medium text-brand-text">Followup Status</label>
                      <select value={formData.followup_status} onChange={e => updateForm('followup_status', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent">
                        {followupOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt || 'None'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-brand-border bg-brand-surface shrink-0 flex items-center justify-end gap-3">
              <button type="button" onClick={closeModal} className="text-brand-text/70 hover:text-brand-text text-sm font-medium px-4 py-2 transition-colors">
                Cancel
              </button>
              <button 
                form="prospect-form" 
                type="submit" 
                disabled={submitting}
                className="bg-brand-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {submitting ? 'Saving...' : 'Save Prospect'}
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* Schedule Meeting Modal */}
      {isScheduleModalOpen && scheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-lg rounded-2xl overflow-hidden border border-brand-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-brand-border shrink-0">
              <div>
                <h2 className="text-xl font-medium text-brand-text">Schedule Meeting</h2>
                <p className="text-xs text-brand-text/60 mt-1">with {scheduleTarget.business_name}</p>
              </div>
              <button onClick={closeScheduleModal} className="text-brand-text/50 hover:text-brand-text p-1 rounded-full hover:bg-brand-bg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="schedule-form" onSubmit={handleScheduleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Meeting Host</label>
                    <select required value={scheduleData.hostId} onChange={e => { updateSchedule('hostId', e.target.value); updateSchedule('time', ''); }} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent">
                      <option value="">Select a host</option>
                      {teamMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Date</label>
                    <input required type="date" min={new Date().toISOString().split('T')[0]} value={scheduleData.date} onChange={e => { updateSchedule('date', e.target.value); updateSchedule('time', ''); }} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text flex items-center justify-between">
                    Available Times
                    {loadingSlots && <span className="text-brand-accent text-xs">Loading...</span>}
                  </label>
                  
                  {!scheduleData.date || !scheduleData.hostId ? (
                    <div className="text-sm text-brand-text/50 p-4 border border-dashed border-brand-border rounded-lg text-center bg-brand-bg/50">
                      Select a host and date to see slots
                    </div>
                  ) : availableSlots.length === 0 && !loadingSlots ? (
                    <div className="text-sm text-red-500 p-4 border border-dashed border-red-200 rounded-lg text-center bg-red-50">
                      No available slots.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                      {availableSlots.map(slot => (
                        <button
                          key={slot} type="button"
                          onClick={() => updateSchedule('time', slot)}
                          className={`py-2 px-1 rounded-md text-xs font-medium transition-all ${
                            scheduleData.time === slot 
                              ? 'bg-brand-accent text-white ' 
                              : 'bg-brand-bg text-brand-text hover:border-brand-accent border border-brand-border'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-medium text-brand-text">Meeting Link (Optional)</label>
                  <input type="url" placeholder="https://zoom.us/j/..." value={scheduleData.meetingLink} onChange={e => updateSchedule('meetingLink', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Internal Notes</label>
                  <textarea rows={3} value={scheduleData.note} onChange={e => updateSchedule('note', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none"></textarea>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-brand-border bg-brand-surface shrink-0 flex items-center justify-end gap-3">
              <button type="button" onClick={closeScheduleModal} className="text-brand-text/70 hover:text-brand-text text-sm font-medium px-4 py-2 transition-colors">
                Cancel
              </button>
              <button 
                form="schedule-form" 
                type="submit" 
                disabled={scheduleSubmitting}
                className="bg-brand-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {scheduleSubmitting ? 'Scheduling...' : 'Confirm Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={handleConfirmDelete} 
        title='Delete Prospect?' 
        message={`${deleteTarget?.business_name} will be permanently removed.`} 
        confirmText='Yes, Delete' 
        confirmStyle='danger' 
      />
      <Toaster position='top-right' />
    </div>
  );
}
