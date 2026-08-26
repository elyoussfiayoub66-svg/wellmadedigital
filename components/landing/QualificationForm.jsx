'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { startFormSession, updateFormSession, abandonFormSession, submitLead } from '@/app/actions/form';
import { getOrCreateVisitorId } from '@/lib/tracking/visitor';
import { getAttribution } from '@/lib/tracking/attribution';
import * as meta from '@/lib/tracking/meta';
import { ChevronRight, ChevronLeft, Loader2, X } from 'lucide-react';

const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Agadir', 'Other'];
const FLEET_SIZES = ['1–5', '6–15', '16–30', '31–50', '50+'];
const BOOKING_METHODS = ['WhatsApp', 'Excel / Google Sheets', 'Phone calls', 'Booking platforms', 'Existing software', 'Combination'];
const PROBLEMS = ['Double bookings', 'Vehicle availability', 'WhatsApp overload', 'Vehicle status tracking', 'Staff management', 'Customer/bookings management', 'Other'];
const TIMELINES = ['Immediately', 'Within 1–3 months', 'Just exploring'];

export default function QualificationForm({ isOpen, onClose }) {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otherProblem, setOtherProblem] = useState('');
  
  const [formData, setFormData] = useState({
    agency: '',
    city: '',
    fleet: '',
    booking_method: '',
    problem: '',
    timeline: '',
    name: '',
    phone: '',
    email: ''
  });

  // Track session start and mount logic
  useEffect(() => {
    if (isOpen && !sessionId) {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      
      const initSession = async () => {
        const vid = getOrCreateVisitorId();
        await startFormSession(vid, newSessionId);
        meta.event('Form_Start');
      };
      
      initSession();
    }
  }, [isOpen, sessionId]);

  // Handle closing / abandonment tracking
  const handleClose = async () => {
    if (sessionId && step < 6) {
      await abandonFormSession(sessionId);
    }
    onClose();
  };

  const nextStep = async () => {
    if (step < 6) {
      const next = step + 1;
      setStep(next);
      meta.event(`Form_Step_${step}`); // Log completion of current step
      if (sessionId) {
        await updateFormSession(sessionId, step); // Update session in DB
      }
    } else {
      submitForm();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    meta.event('Form_Submit');
    
    try {
      const finalFormData = { ...formData };
      if (finalFormData.problem === 'Other') {
        finalFormData.problem = `Other: ${otherProblem}`;
      }

      const vid = getOrCreateVisitorId();
      const attribution = getAttribution();
      
      const res = await submitLead(finalFormData, vid, sessionId, attribution);
      
      if (res.success) {
        router.push('/thank-you');
        onClose(); // Hide form modal if we're redirecting
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Error submitting form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[60vh] border border-slate-100">
      
      {/* Progress Bar Header */}
      <div className="bg-slate-50 p-6 border-b border-slate-100">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-bold tracking-wide text-slate-500 uppercase">Step {step} of 6</div>
          <div className="text-sm font-medium text-slate-400">
            {Math.round((step / 6) * 100)}% Complete
          </div>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${(step / 6) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="p-8 md:p-10 overflow-y-auto flex-1">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tell us about your agency</h2>
            <p className="text-slate-500 text-lg">We need a few details to understand your scale.</p>
            <div className="space-y-5 mt-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Agency Name</label>
                <input 
                  type="text" 
                  value={formData.agency}
                  onChange={e => setFormData({...formData, agency: e.target.value})}
                  className="w-full bg-slate-50 border-slate-200 rounded-xl p-4 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg" 
                  placeholder="e.g. Atlas Rent a Car"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                <select 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className="w-full bg-slate-50 border-slate-200 rounded-xl p-4 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                >
                  <option value="">Select a city...</option>
                  {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How many vehicles do you manage?</h2>
            <div className="space-y-3 mt-6">
              {FLEET_SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setFormData({...formData, fleet: size});
                    nextStep();
                  }}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                    formData.fleet === size ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-xl">{size}</span> <span className="text-lg">Vehicles</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How do you currently manage bookings?</h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {BOOKING_METHODS.map(method => (
                <button
                  key={method}
                  onClick={() => {
                    setFormData({...formData, booking_method: method});
                    nextStep();
                  }}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all h-full ${
                    formData.booking_method === method ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold text-lg">{method}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">What's your biggest operational problem?</h2>
            <div className="space-y-3 mt-6">
              {PROBLEMS.map(problem => (
                <button
                  key={problem}
                  onClick={() => {
                    setFormData({...formData, problem});
                    if (problem !== 'Other') nextStep();
                  }}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                    formData.problem === problem ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold text-lg">{problem}</span>
                </button>
              ))}
              
              {formData.problem === 'Other' && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                  <input 
                    type="text" 
                    value={otherProblem}
                    onChange={e => setOtherProblem(e.target.value)}
                    placeholder="Please specify..."
                    className="w-full bg-slate-50 border-slate-200 rounded-xl p-4 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg" 
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How soon are you looking to improve?</h2>
            <div className="space-y-3 mt-6">
              {TIMELINES.map(timeline => (
                <button
                  key={timeline}
                  onClick={() => {
                    setFormData({...formData, timeline});
                    nextStep();
                  }}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                    formData.timeline === timeline ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold text-lg">{timeline}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Where should we send the demo details?</h2>
            <p className="text-slate-500 text-lg">Last step. We'll show you exactly how to fix the chaos.</p>
            <div className="space-y-5 mt-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border-slate-200 rounded-xl p-4 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Phone / WhatsApp</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-50 border-slate-200 rounded-xl p-4 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 border-slate-200 rounded-xl p-4 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg" 
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6 md:px-10 md:py-8 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
        <button 
          onClick={prevStep}
          disabled={step === 1 || isSubmitting}
          className={`flex items-center px-5 py-3 font-semibold rounded-xl transition-all ${step === 1 ? 'text-slate-400 cursor-not-allowed opacity-50' : 'text-slate-700 hover:bg-slate-200 bg-slate-100'}`}
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        
        <button 
          onClick={nextStep}
          disabled={isSubmitting}
          className="flex items-center px-8 py-4 font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 text-lg"
        >
          {isSubmitting ? (
            <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Submitting...</>
          ) : step === 6 ? (
            'Book My Free Demo'
          ) : (
            <>Next <ChevronRight className="w-6 h-6 ml-2" /></>
          )}
        </button>
      </div>
    </div>
  );
}
