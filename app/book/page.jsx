'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState('idle');
  
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [memberAvailability, setMemberAvailability] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    website: '',
    problem: '',
    currentProcess: '',
    desiredOutcome: '',
    budget: '',
    assigneeId: '',
    meetingDate: '',
    meetingTime: '',
    notes: ''
  });

  // Fetch team members (profiles) on mount
  useEffect(() => {
    async function loadTeam() {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('id, full_name, created_at').eq('account_status', 'active');
      
      if (data) {
        // Assign a mock closing rate if not present in DB for advanced distribution algorithm
        const membersWithRates = data.map(m => ({
           ...m, 
           closing_rate: m.closing_rate !== undefined && m.closing_rate !== null ? m.closing_rate : Math.floor(Math.random() * 100)
        }));
        setTeamMembers(membersWithRates);
      }
    }
    loadTeam();
  }, []);

  // Fetch available slots for ALL team members
  const [debugErrors, setDebugErrors] = useState([]);
  
  useEffect(() => {
    async function fetchSlots() {
      if (!formData.meetingDate || teamMembers.length === 0) {
        setAvailableSlots([]);
        setMemberAvailability({});
        return;
      }
      setLoadingSlots(true);
      setDebugErrors([]);
      try {
        let allSlots = new Set();
        let availabilityMap = {}; // { timeSlot: [memberId1, memberId2] }
        let errs = [];

        await Promise.all(teamMembers.map(async (member) => {
          try {
            const res = await fetch(`/api/availability?date=${formData.meetingDate}&assignee_id=${member.id}`);
            if (res.ok) {
              const data = await res.json();
              if (data.availableSlots) {
                data.availableSlots.forEach(slot => {
                   allSlots.add(slot);
                   if (!availabilityMap[slot]) availabilityMap[slot] = [];
                   availabilityMap[slot].push(member.id);
                });
              }
            } else {
              const text = await res.text();
              errs.push(`Member ${member.id} API not ok: ${res.status} ${text}`);
            }
          } catch (e) {
            errs.push(`Member ${member.id} network error: ${e.message}`);
          }
        }));

        setAvailableSlots(Array.from(allSlots).sort());
        setMemberAvailability(availabilityMap);
        setDebugErrors(errs);
      } catch (err) {
        console.error("Fetch error:", err);
        setDebugErrors([err.message]);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [formData.meetingDate, teamMembers]);

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.meetingTime) {
      alert("Please select a time slot.");
      return;
    }

    setStatus('submitting');
    
    try {
      const supabase = createClient();

      const { data: settings } = await supabase.from('crm_settings').select('meeting_distribution_mode').limit(1).maybeSingle();
      
      let selectedAssigneeId = null;

      if (!settings || settings.meeting_distribution_mode === 'auto') {
        // ADVANCED ROUTING LOGIC: Assign to oldest user first (calendar cascading)
        const availableMemberIds = memberAvailability[formData.meetingTime] || [];
        if (availableMemberIds.length === 0) throw new Error("No team members available for this slot.");

        // Sort available members by account creation date (oldest first)
        const availableMembers = teamMembers
            .filter(m => availableMemberIds.includes(m.id))
            .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

        selectedAssigneeId = availableMembers[0].id;
      }
      // If 'manual', selectedAssigneeId remains null so it lands in the unassigned queue
      
      
      // 1. Insert Lead
      const { data: leadData, error: leadError } = await supabase.from('leads').insert([{
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        agency_name: formData.businessName,
        business_type: formData.businessType,
        website: formData.website,
        main_problem: formData.problem,
        current_booking_method: formData.currentProcess,
        desired_outcome: formData.desiredOutcome,
        buying_timeline: formData.budget, // mapping budget roughly here
        status: 'NEW'
      }]).select().single();
      
      if (leadError) throw leadError;

      // Construct the timestamp for the appointment
      const scheduledAt = new Date(`${formData.meetingDate}T${formData.meetingTime}:00.000Z`).toISOString();

      // 2. Insert Appointment
      const { error: apptError } = await supabase.from('appointments').insert([{
        lead_id: leadData.id,
        assignee_id: selectedAssigneeId,
        scheduled_at: scheduledAt,
        notes: formData.notes,
        status: 'SCHEDULED'
      }]);

      if (apptError) throw apptError;

      router.push('/thank-you');
    } catch (err) {
      console.error(err);
      alert("Failed to submit booking. Please try again.");
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0E0E0F] text-[#F7F5F0] font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] relative overflow-hidden">
      
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C2496B]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <header className="relative z-10 border-b border-[#F7F5F0]/10 bg-[#0E0E0F]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/assets/logo.png?v=2" alt="Wellmade Digital Logo" className="h-[70px] w-auto object-contain" />
          </Link>
          <div className="text-[10px] font-bold tracking-widest uppercase text-[#C8A464]">
            Step {step} of 2
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-20 px-6 relative z-10">
        <div className="max-w-3xl w-full">
          
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tighter mb-4 text-[#F7F5F0]">
              {step === 1 && "Tell us about you."}
              {step === 2 && "Schedule Consultation."}
            </h1>
            <p className="text-lg text-[#F7F5F0]/60 font-light">
              {step === 1 && "Basic information to help us prepare for our call."}
              {step === 2 && "When is a good time to discuss your custom solution?"}
            </p>
          </div>

          <div className="bg-[#1A1A1B]/40 border border-[#F7F5F0]/10 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-2xl">
            <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-8">
              
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/50">Name</label>
                      <input required type="text" value={formData.name} onChange={e => updateForm('name', e.target.value)} className="w-full bg-[#0E0E0F] border border-[#F7F5F0]/10 rounded-lg px-4 py-4 text-[#F7F5F0] focus:outline-none focus:border-[#C2496B] focus:ring-1 focus:ring-[#C2496B]/20 transition-all placeholder-[#F7F5F0]/20" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/50">Email</label>
                      <input required type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} className="w-full bg-[#0E0E0F] border border-[#F7F5F0]/10 rounded-lg px-4 py-4 text-[#F7F5F0] focus:outline-none focus:border-[#C2496B] focus:ring-1 focus:ring-[#C2496B]/20 transition-all placeholder-[#F7F5F0]/20" placeholder="john@company.com" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/50">Phone</label>
                      <input required type="tel" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full bg-[#0E0E0F] border border-[#F7F5F0]/10 rounded-lg px-4 py-4 text-[#F7F5F0] focus:outline-none focus:border-[#C2496B] focus:ring-1 focus:ring-[#C2496B]/20 transition-all placeholder-[#F7F5F0]/20" placeholder="+1 (555) 000-0000" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/50">Business Name</label>
                      <input required type="text" value={formData.businessName} onChange={e => updateForm('businessName', e.target.value)} className="w-full bg-[#0E0E0F] border border-[#F7F5F0]/10 rounded-lg px-4 py-4 text-[#F7F5F0] focus:outline-none focus:border-[#C2496B] focus:ring-1 focus:ring-[#C2496B]/20 transition-all placeholder-[#F7F5F0]/20" placeholder="Acme Corp" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/50">Industry</label>
                      <input required type="text" value={formData.businessType} onChange={e => updateForm('businessType', e.target.value)} className="w-full bg-[#0E0E0F] border border-[#F7F5F0]/10 rounded-lg px-4 py-4 text-[#F7F5F0] focus:outline-none focus:border-[#C2496B] focus:ring-1 focus:ring-[#C2496B]/20 transition-all placeholder-[#F7F5F0]/20" placeholder="e.g. Real Estate" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/50">Website</label>
                      <input type="url" value={formData.website} onChange={e => updateForm('website', e.target.value)} className="w-full bg-[#0E0E0F] border border-[#F7F5F0]/10 rounded-lg px-4 py-4 text-[#F7F5F0] focus:outline-none focus:border-[#C2496B] focus:ring-1 focus:ring-[#C2496B]/20 transition-all placeholder-[#F7F5F0]/20" placeholder="https://" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/50">Preferred Meeting Date</label>
                    <input 
                      required 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.meetingDate} 
                      onChange={e => { updateForm('meetingDate', e.target.value); updateForm('meetingTime', ''); }} 
                      className="w-full bg-[#0E0E0F] border border-[#F7F5F0]/10 rounded-lg px-4 py-4 text-[#F7F5F0] focus:outline-none focus:border-[#C2496B] focus:ring-1 focus:ring-[#C2496B]/20 transition-all cursor-pointer" 
                    />
                  </div>

                  {formData.meetingDate && (
                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/50">Available Times</label>
                      {loadingSlots ? (
                        <div className="text-sm text-[#F7F5F0]/50 py-4 animate-pulse">Checking system availability...</div>
                      ) : availableSlots.length === 0 ? (
                        <div className="text-sm text-red-400 py-4">
                          No available slots on this date. Please choose another.
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
                          {availableSlots.map(slot => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => updateForm('meetingTime', slot)}
                              className={`py-3 px-3 rounded-lg text-sm font-bold transition-all ${
                                formData.meetingTime === slot 
                                  ? 'bg-[#C2496B] text-white border-[#C2496B] shadow-[0_0_15px_rgba(194,73,107,0.4)]' 
                                  : 'bg-[#0E0E0F] text-[#F7F5F0]/70 hover:border-[#C2496B] hover:text-[#C2496B] border border-[#F7F5F0]/10'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/50">Additional Notes <span className="font-normal">(Optional)</span></label>
                    <textarea rows={3} value={formData.notes} onChange={e => updateForm('notes', e.target.value)} className="w-full bg-[#0E0E0F] border border-[#F7F5F0]/10 rounded-lg px-4 py-4 text-[#F7F5F0] focus:outline-none focus:border-[#C2496B] focus:ring-1 focus:ring-[#C2496B]/20 transition-all resize-none"></textarea>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-[#F7F5F0]/10">
                {step > 1 ? (
                  <button type="button" onClick={handleBack} disabled={status === 'submitting'} className="text-[#F7F5F0]/50 text-sm tracking-widest uppercase font-bold hover:text-[#F7F5F0] transition-colors">
                    &larr; Back
                  </button>
                ) : <div></div>}
                
                <button 
                  type="submit" 
                  disabled={status === 'submitting'}
                  className="bg-[#C2496B] text-white text-sm tracking-widest uppercase font-bold px-8 py-4 rounded-lg hover:bg-[#a63c5a] transition-all disabled:opacity-50"
                >
                  {status === 'submitting' ? 'Processing...' : step === 2 ? 'Complete Booking' : 'Continue'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
