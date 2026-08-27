'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditCaseStudyPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .eq('id', id)
        .single();
        
      if (data) {
        setFormData({
          title: data.title || '',
          client_name: data.client_name || '',
          industry: data.industry || '',
          short_description: data.short_description || '',
          problem: data.problem || '',
          solution: data.solution || '',
          status: data.status || 'DRAFT',
          image_url: data.image_url || ''
        });
        if (data.results && data.results.length > 0) {
          setResults(data.results);
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [id]);

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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this case study?')) return;
    
    const supabase = createClient();
    await supabase.from('case_studies').delete().eq('id', id);
    router.push('/admin/case-studies');
    router.refresh();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const supabase = createClient();

    const filteredResults = results.filter(r => r.metric && r.description);

    const { error } = await supabase
      .from('case_studies')
      .update({
        ...formData,
        results: filteredResults,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      alert('Error updating case study: ' + error.message);
      setIsSubmitting(false);
    } else {
      router.push('/admin/case-studies');
      router.refresh();
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/case-studies" className="p-2 hover:bg-brand-dark/5 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-medium tracking-tight">Edit Case Study</h1>
        </div>
        <button 
          onClick={handleDelete}
          className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Delete
        </button>
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
          <label className="text-sm font-medium">Short Description</label>
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
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>

      </form>
    </div>
  );
}
