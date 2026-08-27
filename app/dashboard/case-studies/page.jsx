'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Trash2, Edit2, Eye, EyeOff, TrendingUp, AlertTriangle, ImageIcon, UploadCloud } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

// ─── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-brand-dark/8 rounded-lg ${className}`} />;
}

// ─── Image Uploader ──────────────────────────────────────────────────────────
function ImageUploader({ value, onChange }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const uploadFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB.');
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `case-studies/${fileName}`;

    const { error } = await supabase.storage
      .from('media')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) {
      toast.error('Upload failed: ' + error.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
    onChange(publicUrl);
    toast.success('Image uploaded!');
    setUploading(false);
  }, [onChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    uploadFile(file);
  }, [uploadFile]);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleFileInput = (e) => uploadFile(e.target.files[0]);

  if (value) {
    return (
      <div className="relative group rounded-xl overflow-hidden border border-brand-border bg-brand-bg">
        <img src={value} alt="Cover" className="w-full h-36 object-cover" />
        <div className="absolute inset-0 bg-brand-dark/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-3 py-1.5 bg-brand-surface text-brand-text text-xs font-semibold rounded-lg hover:bg-brand-bg transition-colors"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors"
          >
            Remove
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
        dragging
          ? 'border-brand-accent bg-brand-accent/5 scale-[1.01]'
          : 'border-brand-dark/15 bg-brand-bg hover:border-brand-accent/50 hover:bg-brand-accent/3'
      }`}
    >
      {uploading ? (
        <>
          <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm font-medium text-brand-text/60">Uploading...</p>
        </>
      ) : (
        <>
          <UploadCloud className={`w-8 h-8 mb-2 transition-colors ${ dragging ? 'text-brand-accent' : 'text-brand-text/30' }`} />
          <p className="text-sm font-medium text-brand-text/70">
            {dragging ? 'Drop to upload' : 'Drag & drop or click to browse'}
          </p>
          <p className="text-xs text-brand-text/40 mt-1">PNG, JPG, WEBP up to 5MB</p>
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const isPublished = status === 'PUBLISHED';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
      isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-green-500' : 'bg-amber-500'}`} />
      {isPublished ? 'Published' : 'Draft'}
    </span>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-brand-surface rounded-2xl border border-brand-border flex items-center justify-center mb-6 ">
        <TrendingUp className="w-9 h-9 text-brand-accent opacity-60" />
      </div>
      <h3 className="text-xl font-semibold text-brand-text mb-2">No case studies yet</h3>
      <p className="text-brand-text/60 max-w-xs mb-8">Create your first case study. Published ones will appear automatically on your homepage.</p>
      <button onClick={onAdd} className="flex items-center gap-2 bg-brand-accent text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity ">
        <Plus className="w-4 h-4" /> Create Case Study
      </button>
    </div>
  );
}

// ─── Results Builder ─────────────────────────────────────────────────────────
function ResultsBuilder({ results, onChange }) {
  const addResult = () => onChange([...results, { metric: '', description: '' }]);
  const removeResult = (i) => onChange(results.filter((_, idx) => idx !== i));
  const updateResult = (i, key, val) => {
    const updated = results.map((r, idx) => idx === i ? { ...r, [key]: val } : r);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {results.map((r, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Metric (e.g. +45%)"
            value={r.metric}
            onChange={e => updateResult(i, 'metric', e.target.value)}
            className="w-28 bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
          <input
            type="text"
            placeholder="Description (e.g. conversion rate)"
            value={r.description}
            onChange={e => updateResult(i, 'description', e.target.value)}
            className="flex-1 bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
          <button type="button" onClick={() => removeResult(i)} className="text-brand-text/40 hover:text-red-500 transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={addResult} className="flex items-center gap-1.5 text-sm text-brand-accent hover:opacity-80 transition-opacity font-medium">
        <Plus className="w-3.5 h-3.5" /> Add Result Metric
      </button>
    </div>
  );
}

// ─── Form Modal ──────────────────────────────────────────────────────────────
function CaseStudyModal({ study, onClose, onSaved }) {
  const isEdit = !!study;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: study?.title || '',
    client_name: study?.client_name || '',
    industry: study?.industry || '',
    short_description: study?.short_description || '',
    problem: study?.problem || '',
    solution: study?.solution || '',
    image_url: study?.image_url || '',
    status: study?.status || 'DRAFT',
    results: study?.results || [],
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const payload = { ...form };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from('case_studies').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', study.id));
    } else {
      ({ error } = await supabase.from('case_studies').insert([payload]));
    }

    if (error) {
      toast.error('Failed to save. Please try again.');
      console.error(error);
    } else {
      toast.success(isEdit ? 'Case study updated!' : 'Case study created!');
      onSaved();
      onClose();
    }
    setSaving(false);
  };

  const inputClass = "w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent placeholder:text-brand-text/30";
  const labelClass = "text-sm font-medium text-brand-text";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-brand-surface w-full max-w-2xl rounded-2xl  border border-brand-border flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-dark/8 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-brand-text">{isEdit ? 'Edit Case Study' : 'New Case Study'}</h2>
            <p className="text-xs text-brand-text/50 mt-0.5">Fill in the details below. Set to Published to show on homepage.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-brand-text/40 hover:text-brand-text hover:bg-brand-bg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          
          {/* Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-brand-bg rounded-xl border border-brand-dark/8">
            <div>
              <p className="text-sm font-semibold text-brand-text">Publication Status</p>
              <p className="text-xs text-brand-text/50 mt-0.5">Published studies appear on the public homepage.</p>
            </div>
            <button
              type="button"
              onClick={() => update('status', form.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                form.status === 'PUBLISHED' ? 'bg-green-500' : 'bg-brand-dark/20'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-brand-surface  transition-transform duration-300 ${
                form.status === 'PUBLISHED' ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Row: Title + Client */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Project Title *</label>
              <input required type="text" value={form.title} onChange={e => update('title', e.target.value)} className={inputClass} placeholder="e.g. CRM Overhaul" />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Client Name *</label>
              <input required type="text" value={form.client_name} onChange={e => update('client_name', e.target.value)} className={inputClass} placeholder="e.g. Acme Corp" />
            </div>
          </div>

          {/* Industry */}
          <div className="space-y-1.5">
            <label className={labelClass}>Industry</label>
            <input type="text" value={form.industry} onChange={e => update('industry', e.target.value)} className={inputClass} placeholder="e.g. Real Estate" />
          </div>

          {/* Cover Image - Drag & Drop */}
          <div className="space-y-1.5">
            <label className={labelClass}>Cover Image</label>
            <ImageUploader value={form.image_url} onChange={val => update('image_url', val)} />
          </div>

          {/* Short Description */}
          <div className="space-y-1.5">
            <label className={labelClass}>Short Description *</label>
            <textarea required rows={2} value={form.short_description} onChange={e => update('short_description', e.target.value)} className={`${inputClass} resize-none`} placeholder="A one-sentence summary shown on the homepage card." />
          </div>

          {/* Problem */}
          <div className="space-y-1.5">
            <label className={labelClass}>The Problem</label>
            <textarea rows={3} value={form.problem} onChange={e => update('problem', e.target.value)} className={`${inputClass} resize-none`} placeholder="Describe the challenge the client was facing..." />
          </div>

          {/* Solution */}
          <div className="space-y-1.5">
            <label className={labelClass}>Our Solution</label>
            <textarea rows={3} value={form.solution} onChange={e => update('solution', e.target.value)} className={`${inputClass} resize-none`} placeholder="Describe what you built or implemented..." />
          </div>

          {/* Results Builder */}
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Results / Metrics</label>
              <p className="text-xs text-brand-text/50 mt-0.5">These appear as highlighted stats on the homepage card (max 2 shown).</p>
            </div>
            <ResultsBuilder results={form.results} onChange={val => update('results', val)} />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-dark/8 bg-brand-surface shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusBadge status={form.status} />
            <span className="text-xs text-brand-text/40">— will be {form.status === 'PUBLISHED' ? 'visible on homepage' : 'saved as draft'}</span>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-brand-text hover:bg-brand-bg rounded-lg transition-colors border border-brand-border">
              Cancel
            </button>
            <button
              form=""
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2 bg-brand-accent text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity  disabled:opacity-60"
            >
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Study'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CaseStudiesPage() {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudy, setEditingStudy] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchStudies = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setStudies(data);
    setLoading(false);
  };

  useEffect(() => { fetchStudies(); }, []);

  const openCreate = () => { setEditingStudy(null); setModalOpen(true); };
  const openEdit = (study) => { setEditingStudy(study); setModalOpen(true); };

  const handleTogglePublish = async (study) => {
    const supabase = createClient();
    const newStatus = study.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const { error } = await supabase
      .from('case_studies')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', study.id);
    
    if (error) {
      toast.error('Failed to update status.');
    } else {
      toast.success(newStatus === 'PUBLISHED' ? '✅ Published to homepage!' : '📄 Moved to Draft');
      fetchStudies();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const supabase = createClient();
    const { error } = await supabase.from('case_studies').delete().eq('id', deleteTarget.id);
    if (error) {
      toast.error('Failed to delete case study.');
    } else {
      toast.success('Case study deleted.');
      fetchStudies();
    }
    setDeleteTarget(null);
  };

  const publishedCount = studies.filter(s => s.status === 'PUBLISHED').length;
  const draftCount = studies.filter(s => s.status === 'DRAFT').length;

  return (
    <div className="space-y-8">
      <Toaster position="top-right" toastOptions={{ className: 'font-sans text-sm' }} />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-text tracking-tight">Case Studies</h1>
          <p className="text-brand-text/60 mt-1">Manage your portfolio. Published studies appear live on the homepage.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-accent text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90  transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" /> New Case Study
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Studies', value: studies.length, color: 'text-brand-accent' },
          { label: 'Published', value: publishedCount, color: 'text-green-600' },
          { label: 'Drafts', value: draftCount, color: 'text-amber-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-brand-surface border border-brand-dark/8 rounded-xl p-5 ">
            <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-sm text-brand-text/60 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-brand-surface rounded-2xl p-6 border border-brand-dark/8 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 w-24 rounded-lg" />
                <Skeleton className="h-9 w-24 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : studies.length === 0 ? (
        <EmptyState onAdd={openCreate} />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {studies.map(study => (
            <div
              key={study.id}
              className="group bg-brand-surface border border-brand-dark/8 rounded-2xl p-6  hover:border-brand-accent/30 hover: transition-all duration-200 flex flex-col"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-brand-text truncate">{study.title}</h3>
                  <p className="text-sm text-brand-text/50 font-medium mt-0.5">
                    {study.client_name}{study.industry ? ` · ${study.industry}` : ''}
                  </p>
                </div>
                <StatusBadge status={study.status} />
              </div>

              {/* Description */}
              <p className="text-sm text-brand-text/70 leading-relaxed line-clamp-2 flex-1 mb-4">
                {study.short_description || <span className="italic text-brand-text/30">No description yet.</span>}
              </p>

              {/* Results preview */}
              {study.results && study.results.length > 0 && (
                <div className="flex gap-4 mb-4 pt-3 border-t border-brand-dark/8">
                  {study.results.slice(0, 3).map((r, i) => (
                    <div key={i}>
                      <div className="text-base font-bold text-brand-accent">{r.metric}</div>
                      <div className="text-xs text-brand-text/50">{r.description}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto">
                <button
                  onClick={() => openEdit(study)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-bg text-brand-text text-sm font-medium rounded-lg hover:bg-brand-dark/8 transition-colors border border-brand-dark/8"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleTogglePublish(study)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors border ${
                    study.status === 'PUBLISHED'
                      ? 'bg-[#1F1A0D] text-[#FCD34D] border border-[#3D3315] border-amber-200 hover:bg-amber-100'
                      : 'bg-[#0D1F0D] text-[#4ADE80] border border-[#1A3D1A] border-green-200 hover:bg-green-100'
                  }`}
                >
                  {study.status === 'PUBLISHED' ? (
                    <><EyeOff className="w-3.5 h-3.5" /> Unpublish</>
                  ) : (
                    <><Eye className="w-3.5 h-3.5" /> Publish</>
                  )}
                </button>
                <button
                  onClick={() => setDeleteTarget(study)}
                  className="ml-auto p-2 text-brand-text/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <CaseStudyModal
          study={editingStudy}
          onClose={() => { setModalOpen(false); setEditingStudy(null); }}
          onSaved={fetchStudies}
        />
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Case Study?"
        message={`"${deleteTarget?.title}" will be permanently removed from both the dashboard and the homepage. This cannot be undone.`}
        confirmText="Yes, Delete"
        confirmStyle="danger"
      />
    </div>
  );
}
