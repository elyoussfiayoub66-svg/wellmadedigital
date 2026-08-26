'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, ChevronRight, ChevronLeft } from 'lucide-react';

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
        id, scheduled_at, status, title, meeting_link,
        profiles!appointments_assignee_id_fkey(full_name),
        leads(full_name, agency_name)
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
        if (data.availableSlots) {
          setAvailableSlots(data.availableSlots);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [formData.hostId, formData.date]);

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
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
      alert("Please select a meeting time.");
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
      closeModal();
      fetchAppointments(); // Refresh the calendar
    } catch (err) {
      console.error(err);
      alert("Failed to schedule meeting.");
    } finally {
      setSubmitting(false);
    }
  };

  // Generate 10am to 6pm timeslots for calendar grid
  const timeSlots = [];
  for (let h = 10; h < 18; h++) {
    timeSlots.push(`${h}:00`);
    timeSlots.push(`${h}:30`);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] relative">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-medium text-brand-text tracking-tight mb-2">Calendar</h1>
          <p className="text-brand-text/70">View team availability and appointments.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="bg-brand-surface border border-brand-dark/10 rounded-lg px-4 py-2 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent shadow-sm"
          >
            <option value="all">All Team Members</option>
            {teamMembers.map(m => (
              <option key={m.id} value={m.id}>{m.full_name || 'Unnamed Member'}</option>
            ))}
          </select>
          
          <div className="flex items-center gap-2 bg-brand-surface border border-brand-dark/10 rounded-lg p-1 shadow-sm">
            <button onClick={prevWeek} className="p-1 hover:bg-brand-bg rounded"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm font-medium px-2">
              {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
              {weekDays[4].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <button onClick={nextWeek} className="p-1 hover:bg-brand-bg rounded"><ChevronRight className="w-4 h-4" /></button>
          </div>

          <button onClick={openModal} className="flex items-center gap-2 bg-brand-accent text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 shadow-sm transition-opacity">
            <Plus className="w-4 h-4" /> Schedule
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-brand-surface rounded-xl border border-brand-dark/5 shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex border-b border-brand-dark/10 shrink-0">
          <div className="w-20 border-r border-brand-dark/10 shrink-0"></div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="flex-1 text-center py-3 border-r border-brand-dark/10 last:border-r-0">
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
              <div key={time} className="flex border-b border-brand-dark/5 h-16 group">
                <div className="w-20 border-r border-brand-dark/10 shrink-0 text-xs text-brand-text/50 text-right pr-2 pt-2 relative">
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
                    <div key={day.toISOString() + time} className="flex-1 border-r border-brand-dark/10 last:border-r-0 relative hover:bg-brand-bg/50 transition-colors p-1">
                      {apptInSlot && (
                        <div className="absolute inset-1 bg-brand-accent/10 border border-brand-accent/30 rounded p-1.5 overflow-hidden z-10 hover:bg-brand-accent/20 cursor-pointer shadow-sm">
                          <div className="text-xs font-semibold text-brand-text truncate leading-tight">
                            {apptInSlot.leads?.full_name || 'Meeting'}
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

      {/* Schedule Meeting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-brand-dark/10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-brand-dark/5 shrink-0">
              <h2 className="text-xl font-medium text-brand-text">Schedule a Meeting</h2>
              <button onClick={closeModal} className="text-brand-text/50 hover:text-brand-text p-1 rounded-full hover:bg-brand-bg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-3 bg-brand-bg/50 border-b border-brand-dark/5 flex items-center gap-2 text-sm shrink-0">
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
                      <input required type="text" value={formData.fullName} onChange={e => updateForm('fullName', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">Phone Number *</label>
                      <input required type="tel" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">Business Name *</label>
                      <input required type="text" value={formData.businessName} onChange={e => updateForm('businessName', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">Email Address</label>
                      <input type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">Instagram Handle</label>
                      <input type="text" placeholder="@username" value={formData.instagram} onChange={e => updateForm('instagram', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">Notes</label>
                      <textarea rows={2} value={formData.note} onChange={e => updateForm('note', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none"></textarea>
                    </div>
                  </div>
                )}

                {modalStep === 2 && (
                  <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-brand-text">Meeting Host *</label>
                        <select required value={formData.hostId} onChange={e => { updateForm('hostId', e.target.value); updateForm('time', ''); }} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent">
                          <option value="">Select a host</option>
                          {teamMembers.map(m => (
                            <option key={m.id} value={m.id}>{m.full_name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-brand-text">Date *</label>
                        <input required type="date" value={formData.date} onChange={e => { updateForm('date', e.target.value); updateForm('time', ''); }} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text flex items-center justify-between">
                        Available Times *
                        {loadingSlots && <span className="text-brand-accent text-xs">Loading...</span>}
                      </label>
                      
                      {!formData.date || !formData.hostId ? (
                        <div className="text-sm text-brand-text/50 p-4 border border-dashed border-brand-dark/10 rounded-lg text-center bg-brand-bg/50">
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
                                  ? 'bg-brand-accent text-white shadow-sm' 
                                  : 'bg-brand-bg text-brand-text hover:border-brand-accent border border-brand-dark/10'
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
                      <input type="url" placeholder="https://zoom.us/j/..." value={formData.meetingLink} onChange={e => updateForm('meetingLink', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="p-6 border-t border-brand-dark/5 bg-brand-surface shrink-0 flex items-center justify-between">
              {modalStep === 2 ? (
                <button type="button" onClick={() => setModalStep(1)} className="text-brand-text/70 hover:text-brand-text text-sm font-medium transition-colors">
                  Back
                </button>
              ) : <div></div>}
              
              <button 
                form="schedule-form" 
                type="submit" 
                disabled={submitting}
                className="bg-brand-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 shadow-sm transition-opacity disabled:opacity-70 ml-auto"
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
