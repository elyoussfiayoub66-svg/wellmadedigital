'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function BookingPage() {
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
      const { data } = await supabase.from('profiles').select('id, full_name').eq('account_status', 'active');
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

      // ADVANCED ROUTING LOGIC: Match the highest budget with the highest closing rate closer available at this time
      const availableMemberIds = memberAvailability[formData.meetingTime] || [];
      if (availableMemberIds.length === 0) throw new Error("No team members available for this slot.");

      // Sort available members by closing rate (descending)
      const availableMembers = teamMembers
          .filter(m => availableMemberIds.includes(m.id))
          .sort((a, b) => b.closing_rate - a.closing_rate);

      let selectedAssigneeId = availableMembers[0].id; // Default to best closer
      
      if (availableMembers.length > 1) {
          // Budget ranks: 30k_plus=4, 15k_to_30k=3, 5k_to_15k=2, under_5k=1
          const budget = formData.budget;
          let tierIndex = 0; // 0 is best closer
          
          if (budget === 'under_5k') {
              tierIndex = availableMembers.length - 1; // Lowest closer
          } else if (budget === '5k_to_15k') {
              tierIndex = Math.min(2, availableMembers.length - 1); 
          } else if (budget === '15k_to_30k') {
              tierIndex = Math.min(1, availableMembers.length - 1);
          } else if (budget === '30k_plus') {
              tierIndex = 0; // Best closer
          }
          
          selectedAssigneeId = availableMembers[tierIndex].id;
      }
      
      
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

      setStatus('success');
    } catch (err) {
      console.error(err);
      alert("Failed to submit booking. Please try again.");
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-brand-surface p-10 rounded-xl border border-brand-border text-center ">
          <div className="w-16 h-16 bg-brand-bg text-brand-accent rounded-xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-medium text-brand-text mb-3">Application Received</h2>
          <p className="text-brand-text/70 mb-8 leading-relaxed">
            Thank you for applying for a consultation. We have successfully booked your meeting.
          </p>
          <Link href="/" className="inline-block bg-brand-accent text-brand-text-light font-medium py-3 px-8 rounded-lg hover:opacity-90 transition-all shadow-none">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg font-sans selection:bg-brand-accent selection:text-brand-text-light">
      <header className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl font-medium text-brand-text flex items-center gap-2">
            <img src="/assets/logo.png?v=2" alt="Wellmade Digital Logo" className="w-[120px] h-auto object-contain" />
          </Link>
          <div className="text-sm font-medium text-brand-text/50">
            Step {step} of 3
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-16 px-6">
        <div className="max-w-2xl w-full">
          
          <div className="mb-10">
            <h1 className="text-3xl font-medium text-brand-text mb-3">
              {step === 1 && "Tell us about you"}
              {step === 2 && "Operational Challenges"}
              {step === 3 && "Schedule Consultation"}
            </h1>
            <p className="text-lg text-brand-text/70">
              {step === 1 && "Basic information to help us prepare for our call."}
              {step === 2 && "Help us understand what's holding your business back."}
              {step === 3 && "When is a good time to discuss your custom solution?"}
            </p>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-xl p-8 md:p-10 ">
            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-8">
              
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-text">Name</label>
                      <input required type="text" value={formData.name} onChange={e => updateForm('name', e.target.value)} className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-text">Email</label>
                      <input required type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-text">Phone</label>
                      <input required type="tel" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-text">Business Name</label>
                      <input required type="text" value={formData.businessName} onChange={e => updateForm('businessName', e.target.value)} className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-text">Business Type / Industry</label>
                      <input required type="text" value={formData.businessType} onChange={e => updateForm('businessType', e.target.value)} className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-text">Website or Social Profile</label>
                      <input type="url" value={formData.website} onChange={e => updateForm('website', e.target.value)} className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text">What’s the biggest thing you wish your current system could do for you, but it can’t?</label>
                    <textarea required rows={3} value={formData.problem} onChange={e => updateForm('problem', e.target.value)} className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all resize-none"></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text">How do you currently manage your business information, leads, clients, and daily operations?</label>
                    <textarea required rows={2} value={formData.currentProcess} onChange={e => updateForm('currentProcess', e.target.value)} placeholder="e.g. Spreadsheets, WhatsApp, Generic CRM" className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all resize-none"></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text">If you could have one system built specifically around your business, what would you want it to make easier or completely automate?</label>
                    <textarea required rows={2} value={formData.desiredOutcome} onChange={e => updateForm('desiredOutcome', e.target.value)} className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all resize-none"></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text">Budget Range</label>
                    <select required value={formData.budget} onChange={e => updateForm('budget', e.target.value)} className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all">
                      <option value="">Select range</option>
                      <option value="under_5k">Under MAD 5,000</option>
                      <option value="5k_to_15k">MAD 5,000 - MAD 15,000</option>
                      <option value="15k_to_30k">MAD 15,000 - MAD 30,000</option>
                      <option value="30k_plus">MAD 30,000+</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text">Preferred Meeting Date</label>
                    <input 
                      required 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.meetingDate} 
                      onChange={e => { updateForm('meetingDate', e.target.value); updateForm('meetingTime', ''); }} 
                      className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all" 
                    />
                  </div>

                  {formData.meetingDate && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-text">Available Times</label>
                      {loadingSlots ? (
                        <div className="text-sm text-brand-text/50 py-4">Checking availability...</div>
                      ) : availableSlots.length === 0 ? (
                        <div className="text-sm text-red-500 py-4">
                          No available slots on this date. Please choose another.
                          <br />
                          DEBUG info: teamMembers={teamMembers.length}, date={formData.meetingDate}
                          {debugErrors.length > 0 && (
                            <pre className="mt-2 p-2 bg-red-100 text-red-800 text-xs rounded break-all whitespace-pre-wrap">
                              {debugErrors.join('\n')}
                            </pre>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
                          {availableSlots.map(slot => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => updateForm('meetingTime', slot)}
                              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                formData.meetingTime === slot 
                                  ? 'bg-brand-accent text-white border-brand-accent ' 
                                  : 'bg-brand-bg text-brand-text hover:border-brand-accent hover:text-brand-accent border border-transparent'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text">Additional Notes <span className="text-brand-text/50 font-normal">(Optional)</span></label>
                    <textarea rows={3} value={formData.notes} onChange={e => updateForm('notes', e.target.value)} className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all resize-none"></textarea>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-brand-border">
                {step > 1 ? (
                  <button type="button" onClick={handleBack} disabled={status === 'submitting'} className="text-brand-text/70 font-medium hover:text-brand-text transition-colors px-4 py-2">
                    Back
                  </button>
                ) : <div></div>}
                
                <button 
                  type="submit" 
                  disabled={status === 'submitting'}
                  className="bg-brand-accent text-brand-text-light font-medium px-8 py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-70 shadow-none"
                >
                  {status === 'submitting' ? 'Processing...' : step === 3 ? 'Complete Booking' : 'Continue'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
