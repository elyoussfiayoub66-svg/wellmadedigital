'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Database, UploadCloud, Save, Play, Clock, MessageSquare, ChevronRight, Check } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AutomationBuilderPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: 'New Automation - ' + new Date().toLocaleDateString(),
    source: 'db', // 'db' or 'csv'
    dbQuantity: 100,
    dbPipelineStatus: 'not contacted',
    dbOutreachStatus: 'not called',
    delayBetweenDms: 5, // minutes
    delayAfterBatch: 60, // minutes (wait between 4 dms)
    message: 'Hey {first_name}, loved your recent post! We help agencies scale, open to a quick chat?'
  });

  const [saving, setSaving] = useState(false);

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (status) => {
    if (!formData.name.trim()) return toast.error('Please provide an automation name.');
    if (!formData.message.trim()) return toast.error('Please define a message.');
    
    setSaving(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase.from('dm_automations').insert([{
        name: formData.name,
        status: status,
        source: formData.source === 'db' ? 'Database' : 'CSV',
        scheduled: formData.source === 'db' ? formData.dbQuantity : 0,
        sent: 0,
        nextExecution: 'Pending',
        delay_between_dms: formData.delayBetweenDms,
        delay_after_batch: formData.delayAfterBatch,
        message_template: formData.message,
        pipeline_status_filter: formData.source === 'db' ? formData.dbPipelineStatus : null,
        outreach_status_filter: formData.source === 'db' ? formData.dbOutreachStatus : null
      }]);
      
      if (error) {
        if (error.code === '42P01') {
           toast.error('The dm_automations table does not exist in Supabase yet.');
        } else {
           throw error;
        }
        return;
      }
      
      toast.success(`Automation ${status === 'active' ? 'Activated' : 'Saved to Archive'}!`);
      router.push('/dashboard/automations');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create automation');
    } finally {
      setSaving(false);
    }
  };

  const pipelineOptions = ["not contacted", "contacted", "meeting scheduled", "discovery call completed", "negotiation", "closed", "lost"];
  const outreachOptions = ["email sent", "dm sent", "no answer", "no answer 1", "no answer 2", "no answer 3", "voice mail", "voice mail 1", "voice mail 2", "not called", "meeting booked", "follow up", "not interested", "do not call", "wrong contact"];

  const customSelectClass = "appearance-none bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent pr-10 cursor-pointer hover:border-brand-text/30 transition-colors bg-[url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"%23F7F5F0\" stroke-width=\"2\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19 9l-7 7-7-7\"/></svg>')] bg-no-repeat bg-[right_12px_center] bg-[length:16px_16px]";

  return (
    <div className="h-full flex flex-col overflow-hidden bg-brand-dark">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-brand-border bg-brand-surface shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/automations')} className="p-2 text-brand-text/50 hover:text-brand-text rounded-lg hover:bg-brand-bg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => updateForm('name', e.target.value)}
            className="bg-transparent border-none text-lg font-semibold text-brand-text focus:outline-none focus:ring-0 px-0 w-64 md:w-96 placeholder:text-brand-text/30"
            placeholder="Automation Name"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSave('archived')}
            disabled={saving}
            className="flex items-center gap-2 bg-brand-bg border border-brand-border text-brand-text px-4 py-2 rounded-lg hover:border-brand-accent hover:text-brand-accent transition-colors font-medium text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save Draft (Archive)
          </button>
          <button 
            onClick={() => handleSave('active')}
            disabled={saving}
            className="flex items-center gap-2 bg-brand-accent text-white px-5 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium text-sm disabled:opacity-50 shadow-lg shadow-brand-accent/20"
          >
            <Play className="w-4 h-4 fill-current" /> Activate Now
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
          
          {/* Step 1: Leads Source */}
          <section className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-brand-border pb-4">
              <div className="w-8 h-8 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center font-bold text-sm">1</div>
              <h2 className="text-lg font-semibold text-brand-text">Select Leads Source</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => updateForm('source', 'db')}
                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all ${formData.source === 'db' ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-border bg-brand-bg/50 hover:border-brand-text/30'}`}
              >
                <Database className={`w-8 h-8 ${formData.source === 'db' ? 'text-brand-accent' : 'text-brand-text/50'}`} />
                <span className="font-medium text-brand-text">Fetch from Database</span>
              </button>
              <button 
                onClick={() => updateForm('source', 'csv')}
                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all ${formData.source === 'csv' ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-border bg-brand-bg/50 hover:border-brand-text/30'}`}
              >
                <UploadCloud className={`w-8 h-8 ${formData.source === 'csv' ? 'text-brand-accent' : 'text-brand-text/50'}`} />
                <span className="font-medium text-brand-text">Import Custom CSV</span>
              </button>
            </div>

            {formData.source === 'db' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text/80">Quantity of Leads</label>
                  <input 
                    type="number" 
                    value={formData.dbQuantity} 
                    onChange={e => updateForm('dbQuantity', Number(e.target.value))}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" 
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text/80">Pipeline Status</label>
                  <select value={formData.dbPipelineStatus} onChange={e => updateForm('dbPipelineStatus', e.target.value)} className={`${customSelectClass} w-full`}>
                    {pipelineOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text/80">Outreach Status</label>
                  <select value={formData.dbOutreachStatus} onChange={e => updateForm('dbOutreachStatus', e.target.value)} className={`${customSelectClass} w-full`}>
                    {outreachOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-brand-border rounded-xl bg-brand-bg/30 animate-in fade-in slide-in-from-top-4 duration-300">
                <UploadCloud className="w-10 h-10 text-brand-text/30 mx-auto mb-3" />
                <p className="text-sm text-brand-text/70 mb-4">Drag and drop your CSV file here, or click to browse.</p>
                <button className="bg-brand-surface border border-brand-border text-brand-text px-4 py-2 rounded-lg text-sm font-medium hover:border-brand-accent transition-colors">
                  Browse Files
                </button>
              </div>
            )}
          </section>

          {/* Step 2: Delays */}
          <section className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-brand-border pb-4">
              <div className="w-8 h-8 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center font-bold text-sm">2</div>
              <h2 className="text-lg font-semibold text-brand-text flex items-center gap-2"><Clock className="w-5 h-5 text-brand-accent"/> Timing & Delays</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 bg-brand-bg/50 p-5 rounded-xl border border-brand-border">
                <label className="text-sm font-medium text-brand-text block mb-1">Delay between each DM (Minutes)</label>
                <p className="text-xs text-brand-text/50 mb-4">Time to wait before sending the next message to avoid spam filters.</p>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="1" max="30" 
                    value={formData.delayBetweenDms} 
                    onChange={e => updateForm('delayBetweenDms', Number(e.target.value))}
                    className="flex-1 accent-brand-accent"
                  />
                  <span className="w-12 text-center font-semibold text-brand-text bg-brand-surface py-1 rounded border border-brand-border">{formData.delayBetweenDms}m</span>
                </div>
              </div>

              <div className="space-y-2 bg-brand-bg/50 p-5 rounded-xl border border-brand-border">
                <label className="text-sm font-medium text-brand-text block mb-1">Batch Delay (Minutes)</label>
                <p className="text-xs text-brand-text/50 mb-4">Time to wait after sending a batch of 4 DMs.</p>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="10" max="120" step="5"
                    value={formData.delayAfterBatch} 
                    onChange={e => updateForm('delayAfterBatch', Number(e.target.value))}
                    className="flex-1 accent-brand-accent"
                  />
                  <span className="w-12 text-center font-semibold text-brand-text bg-brand-surface py-1 rounded border border-brand-border">{formData.delayAfterBatch}m</span>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3: Message Definition */}
          <section className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm">
             <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center font-bold text-sm">3</div>
                <h2 className="text-lg font-semibold text-brand-text flex items-center gap-2"><MessageSquare className="w-5 h-5 text-brand-accent"/> Message Definition</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                <textarea 
                  rows={8}
                  value={formData.message}
                  onChange={e => updateForm('message', e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl p-4 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none custom-scrollbar"
                  placeholder="Type your outreach message here..."
                />
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-brand-text/50 py-1">Variables:</span>
                  {['{first_name}', '{business_name}', '{niche}', '{city}'].map(variable => (
                    <button 
                      key={variable}
                      type="button"
                      onClick={() => updateForm('message', formData.message + ' ' + variable)}
                      className="text-[11px] font-mono bg-brand-bg border border-brand-border text-brand-text px-2 py-1 rounded hover:border-brand-accent hover:text-brand-accent transition-colors"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Preview */}
              <div className="lg:col-span-1 bg-brand-bg rounded-xl border border-brand-border p-4 flex flex-col">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-text/50 mb-4">Preview</h3>
                
                <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xl flex flex-col max-h-[300px]">
                  <div className="flex items-center justify-center border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-3">
                    <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">@prospect_ig</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-end">
                    <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 p-3 rounded-2xl rounded-br-sm text-sm ml-auto max-w-[85%] whitespace-pre-wrap">
                      {formData.message
                        .replace('{first_name}', 'John')
                        .replace('{business_name}', 'Acme Corp')
                        .replace('{niche}', 'Plumbing')
                        .replace('{city}', 'New York')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
