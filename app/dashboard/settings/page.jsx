"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { 
  Building2, 
  DollarSign, 
  Kanban, 
  Bell, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical,
  ChevronRight,
  Sparkles,
  ArrowUp,
  ArrowDown
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const [settings, setSettings] = useState({
    id: null,
    agency_name: "",
    agency_email: "",
    agency_phone: "",
    agency_address: "",
    default_commission_rate: 0,
    lead_statuses: [],
    alert_preferences: {
      new_lead: false,
      meeting_booked: false,
      payment_received: false,
      task_assigned: false,
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("crm_settings")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings({
          id: data.id,
          agency_name: data.agency_name || "",
          agency_email: data.agency_email || "",
          agency_phone: data.agency_phone || "",
          agency_address: data.agency_address || "",
          default_commission_rate: data.default_commission_rate || 0,
          lead_statuses: data.lead_statuses || ["New", "Contacted", "Qualified", "Lost", "Won"],
          alert_preferences: data.alert_preferences || {
            new_lead: true,
            meeting_booked: true,
            payment_received: true,
            task_assigned: true,
          }
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Suppressing the toast here temporarily so it doesn't annoy the user if schema cache isn't reloaded yet
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updateData = {
        agency_name: settings.agency_name,
        agency_email: settings.agency_email,
        agency_phone: settings.agency_phone,
        agency_address: settings.agency_address,
        default_commission_rate: parseFloat(settings.default_commission_rate),
        lead_statuses: settings.lead_statuses,
        alert_preferences: settings.alert_preferences,
        updated_at: new Date().toISOString(),
      };

      let error;

      if (settings.id) {
        const { error: updateError } = await supabase
          .from("crm_settings")
          .update(updateData)
          .eq("id", settings.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("crm_settings")
          .insert([updateData]);
        error = insertError;
      }

      if (error) throw error;
      toast.success("Settings saved successfully!");
      await fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Make sure you reloaded the schema cache.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleAlertChange = (key) => {
    setSettings(prev => ({
      ...prev,
      alert_preferences: {
        ...prev.alert_preferences,
        [key]: !prev.alert_preferences[key]
      }
    }));
  };

  // Pipeline Status Management
  const [newStatus, setNewStatus] = useState("");
  
  const addStatus = () => {
    if (newStatus.trim() && !settings.lead_statuses.includes(newStatus.trim())) {
      setSettings(prev => ({
        ...prev,
        lead_statuses: [...prev.lead_statuses, newStatus.trim()]
      }));
      setNewStatus("");
    }
  };

  const removeStatus = (indexToRemove) => {
    setSettings(prev => ({
      ...prev,
      lead_statuses: prev.lead_statuses.filter((_, index) => index !== indexToRemove)
    }));
  };

  const moveStatus = (index, direction) => {
    const newStatuses = [...settings.lead_statuses];
    if (direction === "up" && index > 0) {
      [newStatuses[index - 1], newStatuses[index]] = [newStatuses[index], newStatuses[index - 1]];
    } else if (direction === "down" && index < newStatuses.length - 1) {
      [newStatuses[index], newStatuses[index + 1]] = [newStatuses[index + 1], newStatuses[index]];
    }
    setSettings(prev => ({ ...prev, lead_statuses: newStatuses }));
  };

  const tabs = [
    { id: "general", label: "General", icon: Building2, desc: "Basic agency info" },
    { id: "commissions", label: "Commissions", icon: DollarSign, desc: "Default payouts" },
    { id: "pipeline", label: "Pipeline", icon: Kanban, desc: "Deal stages" },
    { id: "notifications", label: "Alerts", icon: Bell, desc: "In-app notifications" },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 animate-ping rounded-full bg-brand-accent/20"></div>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-dark/10 border-t-brand-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Premium Header */}
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4 rounded-3xl bg-gradient-to-br from-brand-surface to-brand-bg p-8 shadow-sm border border-brand-dark/5 overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> System Configuration
          </div>
          <h1 className="text-4xl font-black tracking-tight text-brand-dark mb-2">Workspace Settings</h1>
          <p className="text-brand-text/60 max-w-lg leading-relaxed">
            Configure your agency's core parameters, from pipeline stages to global commission rates. Changes made here affect the entire CRM.
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="relative z-10 group flex items-center gap-2 rounded-xl bg-brand-dark px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-brand-dark/90 hover:shadow-lg hover:shadow-brand-dark/20 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {isSaving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
          ) : (
            <Save className="h-4 w-4 transition-transform group-hover:scale-110" />
          )}
          {isSaving ? 'Saving Changes...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Advanced Sidebar */}
        <div className="md:col-span-3 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all duration-300 group ${
                  isActive
                    ? "bg-brand-surface shadow-sm border border-brand-dark/5"
                    : "hover:bg-brand-surface/50 border border-transparent"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-accent rounded-r-full" />
                )}
                
                <div className={`p-2.5 rounded-xl transition-colors duration-300 ${
                  isActive ? "bg-brand-accent text-white shadow-md shadow-brand-accent/20" : "bg-brand-dark/5 text-brand-text/50 group-hover:bg-brand-dark/10 group-hover:text-brand-text"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1">
                  <div className={`text-sm font-bold transition-colors ${isActive ? "text-brand-dark" : "text-brand-text/70 group-hover:text-brand-dark"}`}>
                    {tab.label}
                  </div>
                  <div className="text-xs text-brand-text/40 font-medium mt-0.5">{tab.desc}</div>
                </div>
                
                <ChevronRight className={`w-4 h-4 transition-all ${isActive ? "text-brand-dark/20 translate-x-0" : "text-transparent -translate-x-2 group-hover:text-brand-dark/10 group-hover:translate-x-0"}`} />
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="md:col-span-9">
          <div className="rounded-3xl bg-brand-surface p-8 shadow-sm border border-brand-dark/5 min-h-[500px] transition-all duration-500">
            
            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-brand-dark">Agency Profile</h2>
                  <p className="text-sm text-brand-text/50 mt-1">This information may appear on client-facing documents like invoices.</p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-text/50">Agency Name</label>
                    <input
                      type="text"
                      name="agency_name"
                      value={settings.agency_name}
                      onChange={handleGeneralChange}
                      className="w-full rounded-xl border border-brand-dark/10 bg-brand-bg/50 px-4 py-3.5 text-brand-text font-medium transition-all focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-accent/10"
                      placeholder="e.g. WellMade Digital"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-text/50">Support Email</label>
                    <input
                      type="email"
                      name="agency_email"
                      value={settings.agency_email}
                      onChange={handleGeneralChange}
                      className="w-full rounded-xl border border-brand-dark/10 bg-brand-bg/50 px-4 py-3.5 text-brand-text font-medium transition-all focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-accent/10"
                      placeholder="hello@agency.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-text/50">Phone Number</label>
                    <input
                      type="tel"
                      name="agency_phone"
                      value={settings.agency_phone}
                      onChange={handleGeneralChange}
                      className="w-full rounded-xl border border-brand-dark/10 bg-brand-bg/50 px-4 py-3.5 text-brand-text font-medium transition-all focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-accent/10"
                      placeholder="+212 600 000 000"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-text/50">HQ Address</label>
                    <textarea
                      name="agency_address"
                      value={settings.agency_address}
                      onChange={handleGeneralChange}
                      rows={3}
                      className="w-full rounded-xl border border-brand-dark/10 bg-brand-bg/50 px-4 py-3.5 text-brand-text font-medium transition-all focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-accent/10 resize-none"
                      placeholder="Casablanca, Morocco"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Commissions Tab */}
            {activeTab === "commissions" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-brand-dark">Payouts & Cuts</h2>
                  <p className="text-sm text-brand-text/50 mt-1">Set the default margin the agency takes before splitting with freelancers.</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-brand-bg/50 border border-brand-dark/5 flex gap-6 items-center">
                  <div className="w-16 h-16 rounded-full bg-brand-accent/10 flex items-center justify-center shrink-0">
                    <DollarSign className="w-8 h-8 text-brand-accent" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-text/50">Default Agency Cut (%)</label>
                    <div className="relative max-w-xs">
                      <input
                        type="number"
                        name="default_commission_rate"
                        value={settings.default_commission_rate}
                        onChange={handleGeneralChange}
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full rounded-xl border border-brand-dark/10 bg-white px-4 py-3.5 pl-12 text-2xl font-black text-brand-dark transition-all focus:border-brand-accent focus:outline-none focus:ring-4 focus:ring-brand-accent/10"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-brand-dark/30">%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pipeline Tab */}
            {activeTab === "pipeline" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-brand-dark">Pipeline Stages</h2>
                  <p className="text-sm text-brand-text/50 mt-1">Customize the exact flow a lead goes through before closing.</p>
                </div>
                
                <div className="space-y-3">
                  {settings.lead_statuses.map((status, index) => (
                    <div key={index} className="group flex items-center gap-4 rounded-xl border border-brand-dark/5 bg-brand-bg/30 p-2 pr-4 transition-all hover:bg-white hover:shadow-sm">
                      <div className="flex flex-col gap-1 p-2 bg-brand-dark/5 rounded-lg">
                        <button
                          onClick={() => moveStatus(index, "up")}
                          disabled={index === 0}
                          className="text-brand-text/30 hover:text-brand-dark disabled:opacity-20 transition-colors"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => moveStatus(index, "down")}
                          disabled={index === settings.lead_statuses.length - 1}
                          className="text-brand-text/30 hover:text-brand-dark disabled:opacity-20 transition-colors"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <div className="flex-1 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-dark text-white text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                        <span className="font-bold text-brand-dark text-lg">{status}</span>
                      </div>

                      <button
                        onClick={() => removeStatus(index)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete stage"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-brand-dark/5">
                  <div className="relative flex-1">
                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text/30" />
                    <input
                      type="text"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addStatus()}
                      placeholder="Type a new stage name and press enter..."
                      className="w-full rounded-xl border border-brand-dark/10 bg-brand-bg/50 px-4 py-3.5 pl-12 text-brand-text font-medium transition-all focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-accent/10"
                    />
                  </div>
                  <button
                    onClick={addStatus}
                    disabled={!newStatus.trim()}
                    className="flex items-center gap-2 rounded-xl bg-brand-dark px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-brand-dark/90 disabled:opacity-50 shadow-sm"
                  >
                    Add Stage
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-brand-dark">Alert Preferences</h2>
                  <p className="text-sm text-brand-text/50 mt-1">Toggle which events trigger a red badge in your navigation bell.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "new_lead", label: "New Lead Alerts", desc: "When a new lead applies." },
                    { key: "meeting_booked", label: "Meeting Booked", desc: "When a meeting is scheduled." },
                    { key: "payment_received", label: "Payment Received", desc: "When an invoice is paid." },
                    { key: "task_assigned", label: "Task Assigned", desc: "When you are assigned a task." },
                  ].map((alert) => (
                    <div key={alert.key} className="flex items-start justify-between rounded-2xl border border-brand-dark/5 bg-brand-bg/30 p-5 transition-all hover:bg-white hover:shadow-sm">
                      <div className="pr-4">
                        <h3 className="font-bold text-brand-dark text-base mb-1">{alert.label}</h3>
                        <p className="text-xs font-medium text-brand-text/50 leading-relaxed">{alert.desc}</p>
                      </div>
                      
                      {/* iOS Style Toggle */}
                      <button
                        onClick={() => handleAlertChange(alert.key)}
                        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-brand-accent/20 ${
                          settings.alert_preferences[alert.key] ? "bg-brand-accent" : "bg-brand-dark/10"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
                            settings.alert_preferences[alert.key] ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
