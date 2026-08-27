'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, ChevronRight, ChevronLeft, Calendar as CalendarIcon, Clock, Link as LinkIcon, User, Phone, Mail, AtSign, Briefcase, FileText, Edit2, Trash2, Video } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

export default function CalendarPage() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    businessName: '',
    email: '',
    instagram: '',
    note: '',
    date: '',
    hostId: '',
    time: '',
    meetingLink: ''
  });

  // Panel & Action State
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: '',
    meetingLink: '',
    notes: '',
    date: '',
    time: '',
    hostId: ''
  });
  
  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  // Helper to get Monday of current week
  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const weekDays = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    const supabase = createClient();
    
    const startDate = new Date(currentWeekStart);
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    let query = supabase
      .from('appointments')
      .select(`
        id, scheduled_at, status, title, meeting_link, notes, assignee_id,
        profiles!appointments_assignee_id_fkey(full_name),
        leads(id, full_name, agency_name, phone, email, instagram, business_type, website, main_problem, current_booking_method, desired_outcome, buying_timeline)
      `)
      .gte('scheduled_at', startDate.toISOString())
      .lte('scheduled_at', endDate.toISOString());

    if (selectedAssignee !== 'all') {
      query = query.eq('assignee_id', selectedAssignee);
    }

    const { data, error } = await query;
    if (!error && data) {
      setAppointments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    async function loadTeam() {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('id, full_name').eq('account_status', 'active');
      if (data) setTeamMembers(data);
    }
    loadTeam();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [currentWeekStart, selectedAssignee]);

  // Fetch available slots when host or date changes in modal
  useEffect(() => {
    async function fetchSlots() {
      if (!formData.hostId || !formData.date) {
        setAvailableSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/availability?date=${formData.date}&assignee_id=${formData.hostId}`);
        const data = await res.json();
        if (!res.ok) {
          console.error("API returned an error:", data);
          alert(`Calendar API Error: ${data.error} \nDetails: ${data.details || 'None'}`);
          setAvailableSlots([]);
          return;
        }
        if (data.availableSlots) {
          setAvailableSlots(data.availableSlots);
        }
      } catch (err) {
        console.error("Calendar fetch error:", err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [formData.hostId, formData.date]);

  // Fetch available slots for EDIT modal
  useEffect(() => {
    async function fetchEditSlots() {
      if (!editFormData.hostId || !editFormData.date || !isEditModalOpen) {
        return;
      }
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/availability?date=${editFormData.date}&assignee_id=${editFormData.hostId}`);
        const data = await res.json();
        if (data.availableSlots) {
          // If editing the same date as originally scheduled, we should probably add the current time slot back to available
          // For simplicity, we just set the available slots
          setAvailableSlots(data.availableSlots);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchEditSlots();
  }, [editFormData.hostId, editFormData.date, isEditModalOpen]);

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updateEditForm = (key, value) => {
    setEditFormData(prev => ({ ...prev, [key]: value }));
  };

  const openModal = () => {
    setIsModalOpen(true);
    setModalStep(1);
    setFormData({
      fullName: '', phone: '', businessName: '', email: '', instagram: '', note: '',
      date: '', hostId: '', time: '', meetingLink: ''
    });
  };

  const closeModal = () => setIsModalOpen(false);

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (modalStep === 1) {
      setModalStep(2);
      return;
    }

    if (!formData.time) {
      toast.error("Please select a meeting time.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      
      // 1. Insert Lead
      const { data: leadData, error: leadError } = await supabase.from('leads').insert([{
        full_name: formData.fullName,
        phone: formData.phone,
        agency_name: formData.businessName,
        email: formData.email,
        instagram: formData.instagram,
        status: 'NEW'
      }]).select().single();
      
      if (leadError) throw leadError;

      // Construct the timestamp
      const scheduledAt = new Date(`${formData.date}T${formData.time}:00.000Z`).toISOString();

      // 2. Insert Appointment
      const { error: apptError } = await supabase.from('appointments').insert([{
        lead_id: leadData.id,
        assignee_id: formData.hostId,
        scheduled_at: scheduledAt,
        notes: formData.note,
        meeting_link: formData.meetingLink,
        status: 'SCHEDULED'
      }]);

      if (apptError) throw apptError;

      // Success
      toast.success("Meeting scheduled successfully");
      closeModal();
      fetchAppointments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule meeting.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAppointmentClick = (appt) => {
    setSelectedAppointment(appt);
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedAppointment(null), 300); // clear after animation
  };

  const openEditModal = () => {
    if (!selectedAppointment) return;
    
    const d = new Date(selectedAppointment.scheduled_at);
    // Pad month and day
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    setEditFormData({
      status: selectedAppointment.status || 'SCHEDULED',
      meetingLink: selectedAppointment.meeting_link || '',
      notes: selectedAppointment.notes || '',
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
      hostId: selectedAppointment.assignee_id || ''
    });
    
    // Add current time to available slots temporarily so it shows as selected
    setAvailableSlots([`${hours}:${minutes}`]);
    
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    if (!editFormData.time) {
      toast.error("Please select a meeting time.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const scheduledAt = new Date(`${editFormData.date}T${editFormData.time}:00.000Z`).toISOString();
      
      const { error } = await supabase
        .from('appointments')
        .update({
          status: editFormData.status,
          meeting_link: editFormData.meetingLink,
          notes: editFormData.notes,
          scheduled_at: scheduledAt,
          assignee_id: editFormData.hostId
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;
      
      toast.success("Appointment updated successfully");
      setIsEditModalOpen(false);
      closePanel();
      fetchAppointments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = () => {
    setAppointmentToDelete(selectedAppointment);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!appointmentToDelete) return;
    
    try {
      const supabase = createClient();
      const { error } = await supabase.from('appointments').delete().eq('id', appointmentToDelete.id);
      
      if (error) throw error;
      
      toast.success("Appointment deleted successfully");
      setIsDeleteModalOpen(false);
      closePanel();
      fetchAppointments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete appointment");
    }
  };

  // Generate 10am to 6pm timeslots for calendar grid
  const timeSlots = [];
  for (let h = 10; h < 18; h++) {
    timeSlots.push(`${h}:00`);
    timeSlots.push(`${h}:30`);
  }

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      case 'SCHEDULED':
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] relative">
      <Toaster position="top-right" />
      
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-medium text-brand-text tracking-tight mb-2">Calendar</h1>
          <p className="text-brand-text/70">View team availability and appointments.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="bg-brand-surface border border-brand-border rounded-lg px-4 py-2 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent  cursor-pointer"
          >
            <option value="all">All Team Members</option>
            {teamMembers.map(m => (
              <option key={m.id} value={m.id}>{m.full_name || 'Unnamed Member'}</option>
            ))}
          </select>
          
          <div className="flex items-center gap-2 bg-brand-surface border border-brand-border rounded-lg p-1 ">
            <button onClick={prevWeek} className="p-1 hover:bg-brand-bg rounded"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm font-medium px-2">
              {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
              {weekDays[4].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <button onClick={nextWeek} className="p-1 hover:bg-brand-bg rounded"><ChevronRight className="w-4 h-4" /></button>
          </div>

          <button onClick={openModal} className="flex items-center gap-2 bg-brand-accent text-white px-4 py-2 rounded-lg font-medium hover:opacity-90  transition-opacity">
            <Plus className="w-4 h-4" /> Schedule
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-brand-surface rounded-xl border border-brand-border  flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex border-b border-brand-border shrink-0">
          <div className="w-20 border-r border-brand-border shrink-0"></div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="flex-1 text-center py-3 border-r border-brand-border last:border-r-0">
              <div className="text-xs font-medium text-brand-text/50 uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="text-lg font-medium text-brand-text mt-1">{day.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto relative">
          {loading && (
            <div className="absolute inset-0 bg-brand-surface/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <span className="text-brand-text/50 font-medium">Loading...</span>
            </div>
          )}
          
          {timeSlots.map(time => {
            const [hour, minute] = time.split(':');
            const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
            
            return (
              <div key={time} className="flex border-b border-brand-border h-16 group">
                <div className="w-20 border-r border-brand-border shrink-0 text-xs text-brand-text/50 text-right pr-2 pt-2 relative">
                  <span className="-top-3 relative">{displayTime}</span>
                </div>
                
                {weekDays.map(day => {
                  const slotDate = new Date(day);
                  slotDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
                  
                  const apptInSlot = appointments.find(a => {
                    const d = new Date(a.scheduled_at);
                    return d.getDate() === slotDate.getDate() && 
                           d.getMonth() === slotDate.getMonth() && 
                           d.getHours() === slotDate.getHours() && 
                           d.getMinutes() === slotDate.getMinutes();
                  });

                  return (
                    <div key={day.toISOString() + time} className="flex-1 border-r border-brand-border last:border-r-0 relative hover:bg-brand-bg/50 transition-colors p-1">
                      {apptInSlot && (
                        <div 
                          onClick={() => handleAppointmentClick(apptInSlot)}
                          className="absolute inset-1 bg-brand-accent/10 border border-brand-accent/30 rounded p-1.5 overflow-hidden z-10 hover:bg-brand-accent/20 cursor-pointer  transition-colors"
                        >
                          <div className="text-xs font-semibold text-brand-text truncate leading-tight">
                            {apptInSlot.title || apptInSlot.leads?.full_name || 'Meeting'}
                          </div>
                          <div className="text-[10px] text-brand-text/60 truncate mt-0.5">
                            with {apptInSlot.profiles?.full_name || 'Team Member'}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Side Slide-in Panel */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-40" onClick={closePanel}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-[2px] animate-in fade-in duration-300" />
        </div>
      )}
      
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-brand-surface  z-50 border-l border-brand-border transform transition-transform duration-300 ease-in-out flex flex-col ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedAppointment && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-brand-border bg-brand-bg/30">
              <h2 className="text-xl font-medium text-brand-text tracking-tight">Meeting Details</h2>
              <button onClick={closePanel} className="text-brand-text/50 hover:text-brand-text p-1.5 rounded-full hover:bg-brand-bg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Header Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-brand-text">{selectedAppointment.title || selectedAppointment.leads?.full_name || 'Untitled Meeting'}</h3>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status || 'SCHEDULED'}
                  </span>
                </div>
                
                <div className="flex flex-col gap-3 text-sm text-brand-text/80 bg-brand-bg/50 p-4 rounded-xl border border-brand-border">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-4 h-4 text-brand-accent" />
                    <span>{new Date(selectedAppointment.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-brand-accent" />
                    <span>
                      {new Date(selectedAppointment.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-brand-accent" />
                    <span>Host: <span className="font-medium text-brand-text">{selectedAppointment.profiles?.full_name || 'Unassigned'}</span></span>
                  </div>
                  {selectedAppointment.meeting_link && (
                    <div className="flex items-center gap-3">
                      <Video className="w-4 h-4 text-brand-accent" />
                      <a href={selectedAppointment.meeting_link} target="_blank" rel="noreferrer" className="text-brand-accent hover:underline break-all">
                        {selectedAppointment.meeting_link}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Info */}
              {selectedAppointment.leads && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-brand-text/50 uppercase tracking-wider">Prospect Information</h4>
                  
                  {/* Basic Contact Info */}
                  <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden divide-y divide-brand-dark/5 ">
                    <div className="flex items-center gap-3 p-3.5">
                      <User className="w-4 h-4 text-brand-text/40" />
                      <span className="text-sm text-brand-text font-medium">{selectedAppointment.leads.full_name}</span>
                    </div>
                    {selectedAppointment.leads.agency_name && (
                      <div className="flex items-center gap-3 p-3.5">
                        <Briefcase className="w-4 h-4 text-brand-text/40" />
                        <span className="text-sm text-brand-text">{selectedAppointment.leads.agency_name}</span>
                      </div>
                    )}
                    {selectedAppointment.leads.business_type && (
                      <div className="flex items-center gap-3 p-3.5">
                        <FileText className="w-4 h-4 text-brand-text/40" />
                        <span className="text-sm text-brand-text">Industry: {selectedAppointment.leads.business_type}</span>
                      </div>
                    )}
                    {selectedAppointment.leads.phone && (
                      <div className="flex items-center gap-3 p-3.5">
                        <Phone className="w-4 h-4 text-brand-text/40" />
                        <a href={`tel:${selectedAppointment.leads.phone}`} className="text-sm text-brand-accent hover:underline">{selectedAppointment.leads.phone}</a>
                      </div>
                    )}
                    {selectedAppointment.leads.email && (
                      <div className="flex items-center gap-3 p-3.5">
                        <Mail className="w-4 h-4 text-brand-text/40" />
                        <a href={`mailto:${selectedAppointment.leads.email}`} className="text-sm text-brand-accent hover:underline">{selectedAppointment.leads.email}</a>
                      </div>
                    )}
                    {(selectedAppointment.leads.website || selectedAppointment.leads.instagram) && (
                      <div className="flex items-center gap-3 p-3.5">
                        <LinkIcon className="w-4 h-4 text-brand-text/40" />
                        <a href={selectedAppointment.leads.website || selectedAppointment.leads.instagram} target="_blank" rel="noreferrer" className="text-sm text-brand-accent hover:underline truncate">
                          {selectedAppointment.leads.website || selectedAppointment.leads.instagram}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Consultation Questionnaire Responses */}
                  {(selectedAppointment.leads.main_problem || selectedAppointment.leads.current_booking_method || selectedAppointment.leads.desired_outcome || selectedAppointment.leads.buying_timeline) && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-brand-text/50 uppercase tracking-wider">Questionnaire Responses</h4>
                      <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden divide-y divide-brand-dark/5 ">
                        
                        {selectedAppointment.leads.main_problem && (
                          <div className="p-3.5 space-y-1">
                            <span className="text-[11px] font-semibold text-brand-text/50 uppercase">Main Problem</span>
                            <p className="text-sm text-brand-text leading-relaxed">{selectedAppointment.leads.main_problem}</p>
                          </div>
                        )}
                        
                        {selectedAppointment.leads.current_booking_method && (
                          <div className="p-3.5 space-y-1">
                            <span className="text-[11px] font-semibold text-brand-text/50 uppercase">Current Processes/Tools</span>
                            <p className="text-sm text-brand-text leading-relaxed">{selectedAppointment.leads.current_booking_method}</p>
                          </div>
                        )}
                        
                        {selectedAppointment.leads.desired_outcome && (
                          <div className="p-3.5 space-y-1">
                            <span className="text-[11px] font-semibold text-brand-text/50 uppercase">Ideal Outcome</span>
                            <p className="text-sm text-brand-text leading-relaxed">{selectedAppointment.leads.desired_outcome}</p>
                          </div>
                        )}
                        
                        {selectedAppointment.leads.buying_timeline && (
                          <div className="p-3.5 space-y-1">
                            <span className="text-[11px] font-semibold text-brand-text/50 uppercase">Budget Range</span>
                            <p className="text-sm text-brand-text leading-relaxed">
                              {selectedAppointment.leads.buying_timeline.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                          </div>
                        )}
                        
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {selectedAppointment.notes && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-brand-text/50 uppercase tracking-wider">Notes</h4>
                  <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border text-sm text-brand-text/80 whitespace-pre-wrap">
                    {selectedAppointment.notes}
                  </div>
                </div>
              )}

            </div>
            
            <div className="p-6 border-t border-brand-border bg-brand-surface grid grid-cols-2 gap-3 shrink-0">
              <button 
                onClick={openEditModal}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-bg hover:bg-brand-dark/5 border border-brand-border text-brand-text rounded-lg text-sm font-medium transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button 
                onClick={confirmDelete}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-[#1F0D0D] text-[#F87171] border border-[#3D1515] border border-red-200 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* Edit Appointment Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-lg rounded-2xl  overflow-hidden border border-brand-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-brand-border shrink-0">
              <h2 className="text-xl font-medium text-brand-text">Edit Appointment</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-brand-text/50 hover:text-brand-text p-1 rounded-full hover:bg-brand-bg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="edit-form" onSubmit={handleEditSubmit} className="space-y-5">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Status</label>
                  <select value={editFormData.status} onChange={e => updateEditForm('status', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent">
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Meeting Host</label>
                    <select required value={editFormData.hostId} onChange={e => { updateEditForm('hostId', e.target.value); updateEditForm('time', ''); }} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent">
                      <option value="">Select a host</option>
                      {teamMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Date</label>
                    <input required type="date" value={editFormData.date} onChange={e => { updateEditForm('date', e.target.value); updateEditForm('time', ''); }} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text flex items-center justify-between">
                    Available Times
                    {loadingSlots && <span className="text-brand-accent text-xs">Loading...</span>}
                  </label>
                  
                  {!editFormData.date || !editFormData.hostId ? (
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
                          onClick={() => updateEditForm('time', slot)}
                          className={`py-2 px-1 rounded-md text-xs font-medium transition-all ${
                            editFormData.time === slot 
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
                  <label className="text-sm font-medium text-brand-text">Meeting Link</label>
                  <input type="url" placeholder="https://zoom.us/j/..." value={editFormData.meetingLink} onChange={e => updateEditForm('meetingLink', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Notes</label>
                  <textarea rows={3} value={editFormData.notes} onChange={e => updateEditForm('notes', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none"></textarea>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-brand-border bg-brand-surface shrink-0 flex items-center justify-end">
              <button 
                form="edit-form" 
                type="submit" 
                disabled={submitting}
                className="bg-brand-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90  transition-opacity disabled:opacity-70"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
      />

      {/* Schedule Meeting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-lg rounded-2xl  overflow-hidden border border-brand-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-brand-border shrink-0">
              <h2 className="text-xl font-medium text-brand-text">Schedule a Meeting</h2>
              <button onClick={closeModal} className="text-brand-text/50 hover:text-brand-text p-1 rounded-full hover:bg-brand-bg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-3 bg-brand-bg/50 border-b border-brand-border flex items-center gap-2 text-sm shrink-0">
              <span className={`font-medium ${modalStep === 1 ? 'text-brand-accent' : 'text-brand-text/50'}`}>1. Prospect Info</span>
              <ChevronRight className="w-4 h-4 text-brand-text/30" />
              <span className={`font-medium ${modalStep === 2 ? 'text-brand-accent' : 'text-brand-text/50'}`}>2. Meeting Details</span>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="schedule-form" onSubmit={handleModalSubmit} className="space-y-5">
                
                {modalStep === 1 && (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">Full Name *</label>
                      <input required type="text" value={formData.fullName} onChange={e => updateForm('fullName', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">Phone Number *</label>
                      <input required type="tel" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">Business Name *</label>
                      <input required type="text" value={formData.businessName} onChange={e => updateForm('businessName', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">Email Address</label>
                      <input type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">Instagram Handle</label>
                      <input type="text" placeholder="@username" value={formData.instagram} onChange={e => updateForm('instagram', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">Notes</label>
                      <textarea rows={2} value={formData.note} onChange={e => updateForm('note', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none"></textarea>
                    </div>
                  </div>
                )}

                {modalStep === 2 && (
                  <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-brand-text">Meeting Host *</label>
                        <select required value={formData.hostId} onChange={e => { updateForm('hostId', e.target.value); updateForm('time', ''); }} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent">
                          <option value="">Select a host</option>
                          {teamMembers.map(m => (
                            <option key={m.id} value={m.id}>{m.full_name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-brand-text">Date *</label>
                        <input required type="date" value={formData.date} onChange={e => { updateForm('date', e.target.value); updateForm('time', ''); }} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text flex items-center justify-between">
                        Available Times *
                        {loadingSlots && <span className="text-brand-accent text-xs">Loading...</span>}
                      </label>
                      
                      {!formData.date || !formData.hostId ? (
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
                              onClick={() => updateForm('time', slot)}
                              className={`py-2 px-1 rounded-md text-xs font-medium transition-all ${
                                formData.time === slot 
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
                      <label className="text-sm font-medium text-brand-text">Meeting Link</label>
                      <input type="url" placeholder="https://zoom.us/j/..." value={formData.meetingLink} onChange={e => updateForm('meetingLink', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="p-6 border-t border-brand-border bg-brand-surface shrink-0 flex items-center justify-between">
              {modalStep === 2 ? (
                <button type="button" onClick={() => setModalStep(1)} className="text-brand-text/70 hover:text-brand-text text-sm font-medium transition-colors">
                  Back
                </button>
              ) : <div></div>}
              
              <button 
                form="schedule-form" 
                type="submit" 
                disabled={submitting}
                className="bg-brand-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90  transition-opacity disabled:opacity-70 ml-auto"
              >
                {submitting ? 'Saving...' : modalStep === 1 ? 'Next Step' : 'Confirm & Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
