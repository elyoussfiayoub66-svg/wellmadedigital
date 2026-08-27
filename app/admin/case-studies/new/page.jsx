'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function NewCaseStudyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState([{ metric: '', description: '' }]);
  
  const [formData, setFormData] = useState({
    title: '',
    client_name: '',
    industry: '',
    short_description: '',
    problem: '',
    solution: '',
    status: 'DRAFT',
    image_url: ''
  });

  const handleResultChange = (index, field, value) => {
    const newResults = [...results];
    newResults[index][field] = value;
    setResults(newResults);
  };

  const addResult = () => {
    setResults([...results, { metric: '', description: '' }]);
  };

  const removeResult = (index) => {
    setResults(results.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const supabase = createClient();

    const filteredResults = results.filter(r => r.metric && r.description);

    const { error } = await supabase
      .from('case_studies')
      .insert({
        ...formData,
        results: filteredResults
      });

    if (error) {
      alert('Error creating case study: ' + error.message);
      setIsSubmitting(false);
    } else {
      router.push('/admin/case-studies');
      router.refresh();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/case-studies" className="p-2 hover:bg-brand-dark/5 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-medium tracking-tight">New Case Study</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-brand-surface p-8 rounded-[10px] border border-brand-border border border-brand-border ">
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input 
              required 
              type="text" 
              className="w-full p-3 bg-brand-bg rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Scaling operations for a B2B SaaS"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Client Name</label>
            <input 
              required 
              type="text" 
              className="w-full p-3 bg-brand-bg rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              value={formData.client_name}
              onChange={e => setFormData({...formData, client_name: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Industry</label>
            <input 
              type="text" 
              className="w-full p-3 bg-brand-bg rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              value={formData.industry}
              onChange={e => setFormData({...formData, industry: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select 
              className="w-full p-3 bg-brand-bg rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Short Description (for homepage card)</label>
          <textarea 
            rows={2}
            className="w-full p-3 bg-brand-bg rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
            value={formData.short_description}
            onChange={e => setFormData({...formData, short_description: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">The Problem</label>
          <textarea 
            rows={4}
            className="w-full p-3 bg-brand-bg rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
            value={formData.problem}
            onChange={e => setFormData({...formData, problem: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">The Solution</label>
          <textarea 
            rows={4}
            className="w-full p-3 bg-brand-bg rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
            value={formData.solution}
            onChange={e => setFormData({...formData, solution: e.target.value})}
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-brand-border">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Key Results (Metrics)</label>
            <button type="button" onClick={addResult} className="text-brand-accent text-sm font-medium flex items-center gap-1 hover:opacity-80">
              <Plus className="w-4 h-4" /> Add Metric
            </button>
          </div>
          
          {results.map((result, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="e.g. +45%"
                  className="w-full p-3 bg-brand-bg rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                  value={result.metric}
                  onChange={e => handleResultChange(idx, 'metric', e.target.value)}
                />
              </div>
              <div className="flex-[2]">
                <input 
                  type="text" 
                  placeholder="e.g. Increase in lead conversion"
                  className="w-full p-3 bg-brand-bg rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                  value={result.description}
                  onChange={e => handleResultChange(idx, 'description', e.target.value)}
                />
              </div>
              {results.length > 1 && (
                <button type="button" onClick={() => removeResult(idx)} className="p-3 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-brand-border flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-brand-accent text-brand-text-light px-6 py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Case Study'}
          </button>
        </div>

      </form>
    </div>
  );
}
