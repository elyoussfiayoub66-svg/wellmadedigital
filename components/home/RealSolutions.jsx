'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, Phone, Trash2, FileText, Plus, ChevronLeft, ChevronRight, Settings, Check, Mail } from 'lucide-react';

export default function RealSolutions() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, label: 'Patient Portal' },
    { id: 1, label: 'Smart Calendar' },
    { id: 2, label: 'Clinical CRM' }
  ];

  return (
    <section className="py-24 bg-[#0E0E0F] border-t border-white/[.05] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C2496B]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-[#C2496B]/10 text-[#C2496B] text-[10px] font-bold tracking-widest uppercase mb-4 border border-[#C2496B]/20">
            Real Solutions
          </span>
          <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-4">
            Built for modern clinics.
          </h2>
          <p className="text-[#888888] text-lg max-w-2xl mx-auto font-light">
            Stop relying on generic tools. We build tailored booking systems and patient CRMs that look beautiful and work seamlessly.
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2 p-1.5 bg-white/[.03] border border-white/[.08] rounded-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#C2496B] text-white shadow-lg' 
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[.05]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* UI Container */}
        <div className="rounded-3xl border border-white/[.08] bg-white overflow-hidden shadow-2xl mx-auto max-w-[1000px] min-h-[600px] relative">
          
          {/* View 1: Booking System */}
          {activeTab === 0 && (
            <div className="flex h-full min-h-[600px] animate-in fade-in duration-500">
              {/* Left Side - Blue */}
              <div className="w-[40%] bg-[#2B5A8F] p-12 flex flex-col justify-center relative overflow-hidden text-white">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#2B5A8F] to-[#1A3A5F] opacity-90" />
                
                <div className="relative z-10">
                  <button className="text-sm text-white/70 hover:text-white mb-12 flex items-center gap-2 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back to website
                  </button>
                  <h3 className="text-4xl font-semibold mb-4 tracking-tight leading-tight">Schedule your visit.</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Take the first step toward long-term oral health. Fill out the form, and our team will prepare for your arrival.
                  </p>
                </div>
              </div>
              
              {/* Right Side - White */}
              <div className="w-[60%] bg-white p-12 flex flex-col justify-center">
                <div className="max-w-[420px] mx-auto w-full">
                  <div className="flex gap-2 mb-8">
                    <div className="h-1.5 w-1/4 bg-[#1E3A8A] rounded-full" />
                    <div className="h-1.5 w-1/4 bg-gray-200 rounded-full" />
                    <div className="h-1.5 w-1/4 bg-gray-200 rounded-full" />
                    <div className="h-1.5 w-1/4 bg-gray-200 rounded-full" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-6">Step 1 of 4</p>
                  
                  <h4 className="text-2xl font-semibold text-[#0F172A] mb-6 font-serif">Select a service</h4>
                  
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {[
                      { id: 1, label: 'General Dentistry', selected: true },
                      { id: 2, label: 'Cosmetic Dentistry', selected: false },
                      { id: 3, label: 'Dental Implants', selected: false },
                      { id: 4, label: 'Orthodontics', selected: false },
                      { id: 5, label: 'Pediatric Dentistry', selected: false },
                      { id: 6, label: 'Emergency Care', selected: false },
                    ].map(service => (
                      <button 
                        key={service.id}
                        className={`p-4 text-left rounded-xl border text-sm font-medium transition-all ${
                          service.selected 
                            ? 'border-[#1E3A8A] bg-[#EFF6FF] text-[#1E3A8A]' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {service.label}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="px-8 py-3 bg-[#1E3A8A] text-white rounded-xl text-sm font-medium shadow-md hover:bg-[#1e3a8a]/90 transition-colors">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View 2: Calendar */}
          {activeTab === 1 && (
            <div className="h-full bg-white flex flex-col p-6 animate-in fade-in duration-500">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  <h3 className="text-2xl font-serif font-semibold text-[#0F172A]">Calendar</h3>
                  
                  <div className="flex bg-gray-100/80 rounded-lg p-1">
                    <button className="px-4 py-1.5 text-xs font-medium text-gray-500 rounded-md">Day</button>
                    <button className="px-4 py-1.5 text-xs font-medium text-gray-500 rounded-md">Week</button>
                    <button className="px-4 py-1.5 text-xs font-medium text-[#1E3A8A] bg-white rounded-md shadow-sm">Month</button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button className="p-2 hover:bg-gray-50"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
                      <span className="px-3 text-sm font-medium text-gray-700">Today</span>
                      <button className="p-2 hover:bg-gray-50"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
                    </div>
                    <span className="text-sm font-semibold text-[#0F172A]">September 2026</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#E57853] rounded-lg shadow-sm hover:bg-[#E57853]/90">
                    <Plus className="w-4 h-4" /> Schedule Appointment
                  </button>
                </div>
              </div>
              
              {/* Calendar Grid */}
              <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden flex flex-col bg-white">
                {/* Days header */}
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-medium text-gray-500">{day}</div>
                  ))}
                </div>
                {/* Days grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-gray-200 gap-px">
                  {Array.from({ length: 35 }).map((_, i) => {
                    const dayNum = i < 0 ? 31 + i : (i % 30) + 1;
                    const isOtherMonth = i < 0 || i > 29;
                    const isToday = i === 13;
                    
                    return (
                      <div key={i} className={`bg-white p-2 min-h-[100px] flex flex-col ${isOtherMonth ? 'opacity-40 bg-gray-50' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[#1E3A8A] text-white' : 'text-gray-700'}`}>
                            {dayNum}
                          </span>
                        </div>
                        
                        {/* Events mock */}
                        {i === 6 && (
                          <div className="px-2 py-1.5 bg-[#1E3A8A] text-white text-[10px] font-medium rounded-full mb-1 truncate">
                            13:30 - Ayoub
                          </div>
                        )}
                        {i === 11 && (
                          <div className="px-2 py-1.5 bg-[#1E3A8A] text-white text-[10px] font-medium rounded-full truncate">
                            13:30 - Ayoub
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* View 3: CRM Profile */}
          {activeTab === 2 && (
            <div className="h-full bg-[#F8FAFC] flex flex-col animate-in fade-in duration-500">
              
              {/* Top Banner */}
              <div className="bg-white p-6 border-b border-gray-200 m-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex gap-5">
                    <div className="w-16 h-16 rounded-full bg-[#E0E7FF] text-[#1E3A8A] flex items-center justify-center text-xl font-serif font-semibold">
                      AE
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-serif font-semibold text-[#0F172A]">Ayoub elhamdawi</h2>
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full uppercase tracking-wide">New</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> 0635044692</span>
                        <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> va165362</span>
                        <span>0 yrs • Male</span>
                        <span>Patient since Sep 2026</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="w-10 h-10 rounded-xl border border-red-100 text-red-500 flex items-center justify-center hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] text-white rounded-xl text-sm font-medium shadow-sm hover:bg-[#1E3A8A]/90">
                      <FileText className="w-4 h-4" /> Add Clinical Report
                    </button>
                    <button className="px-5 py-2.5 bg-[#E57853] text-white rounded-xl text-sm font-medium shadow-sm hover:bg-[#E57853]/90">
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Layout */}
              <div className="flex gap-6 px-6 pb-6 h-full">
                {/* Left Col */}
                <div className="flex-1 bg-transparent flex flex-col">
                  {/* Tabs */}
                  <div className="flex gap-6 border-b border-gray-200 mb-6">
                    <button className="pb-3 text-sm font-medium text-[#1E3A8A] border-b-2 border-[#1E3A8A]">Appointment History</button>
                    <button className="pb-3 text-sm font-medium text-gray-500">Clinical Reports (0)</button>
                  </div>
                  
                  {/* Timeline */}
                  <div className="relative pl-3">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[#E57853]" />
                    <span className="text-[10px] font-bold text-[#E57853] uppercase tracking-wider ml-4">Upcoming</span>
                    
                    <div className="border-l-2 border-gray-200 ml-1 mt-4 space-y-4 pb-6">
                      
                      {[7, 12].map((date) => (
                        <div key={date} className="relative ml-6 bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                          <div className="absolute -left-[30px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-300" />
                          <div className="flex gap-12">
                            <div>
                              <p className="text-sm font-semibold text-[#0F172A]">Sep {date}, 2026</p>
                              <p className="text-xs text-gray-500 mt-1">1:30 PM • 45 min</p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#0F172A]">Consultation</p>
                              <p className="text-xs text-gray-500 mt-1">with Unassigned</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Booked</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                          </div>
                        </div>
                      ))}

                    </div>
                    <p className="text-xs text-gray-400 mt-2 ml-4">No past visits recorded.</p>
                  </div>
                </div>

                {/* Right Col */}
                <div className="w-[320px] space-y-4">
                  {/* Personal Info */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-serif font-semibold text-[#0F172A]">Personal Info</h3>
                      <button className="text-xs font-semibold text-[#1E3A8A]">Edit</button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                        <p className="text-sm font-medium text-[#0F172A]">Ayoub elhamdawi</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Date of Birth</p>
                        <p className="text-sm font-medium text-[#0F172A]">September 6, 2026</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Gender</p>
                        <p className="text-sm font-medium text-[#0F172A]">Male</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                        <p className="text-sm font-medium text-[#0F172A]">0635044692</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">CNIE</p>
                        <p className="text-sm font-medium text-[#0F172A]">va165362</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Address</p>
                        <p className="text-sm font-medium text-gray-400">--</p>
                      </div>
                    </div>
                  </div>

                  {/* Health Notes */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-serif font-semibold text-[#0F172A]">Health Notes</h3>
                      <button className="text-xs font-semibold text-[#1E3A8A]">Edit</button>
                    </div>
                    <p className="text-sm text-gray-500">No specific health notes recorded.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
