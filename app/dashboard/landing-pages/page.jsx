'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, LayoutTemplate, MoreVertical, Edit, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function LandingPages() {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      if (error && error.code !== '42P01') throw error; // Ignore if table doesn't exist yet
      if (data) setPages(data);
    } catch (error) {
      console.error('Error fetching landing pages:', error);
      toast.error('Failed to load landing pages. Ensure you ran the SQL script.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setNewPageTitle('');
    setIsModalOpen(true);
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    setIsCreating(true);
    const slug = newPageTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('landing_pages')
        .insert([{ 
          title: newPageTitle.trim(), 
          slug, 
          assigned_user_id: user?.id 
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Landing page created!');
      setIsModalOpen(false);
      router.push(`/builder/${data.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create landing page (Slug might already exist)');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this landing page?')) return;
    try {
      const { error } = await supabase.from('landing_pages').delete().eq('id', id);
      if (error) throw error;
      setPages(prev => prev.filter(p => p.id !== id));
      toast.success('Deleted successfully');
    } catch (err) {
      toast.error('Failed to delete landing page');
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text tracking-tight">Landing Pages</h1>
          <p className="text-brand-muted text-sm mt-1">Design custom pages to capture leads.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-accent/90"
        >
          <Plus className="h-4 w-4" />
          Create New Page
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-border border-t-brand-accent"></div>
        </div>
      ) : pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border bg-brand-surface py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-bg mb-4">
            <LayoutTemplate className="h-8 w-8 text-brand-muted" />
          </div>
          <h3 className="text-lg font-bold text-brand-text">No landing pages yet</h3>
          <p className="text-sm text-brand-muted mt-2 max-w-sm mb-6">
            Create your first drag-and-drop landing page to start capturing custom leads.
          </p>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-brand-dark px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-dark/90"
          >
            <Plus className="h-4 w-4" />
            Create Page
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map(page => (
            <div key={page.id} className="group flex flex-col rounded-2xl border border-brand-border bg-brand-surface overflow-hidden hover:border-brand-accent/30 transition-all">
              <div className="aspect-video bg-brand-bg flex items-center justify-center border-b border-brand-border relative">
                <LayoutTemplate className="h-10 w-10 text-brand-text/20" />
                <div className="absolute inset-0 bg-brand-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Link href={`/builder/${page.id}`} className="px-4 py-2 bg-brand-accent text-white rounded-lg text-sm font-bold hover:bg-brand-accent/90">
                    Edit Design
                  </Link>
                  <Link href={`/lp/${page.slug}`} target="_blank" className="px-4 py-2 bg-white text-brand-dark rounded-lg text-sm font-bold hover:bg-white/90">
                    View Live
                  </Link>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-brand-text line-clamp-1">{page.title}</h3>
                    <Link href={`/lp/${page.slug}`} target="_blank" className="text-xs text-brand-accent hover:underline mt-1 block">
                      /lp/{page.slug}
                    </Link>
                  </div>
                  <button onClick={() => handleDelete(page.id)} className="p-2 text-brand-text/40 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-border flex items-center justify-between text-xs text-brand-text/60">
                  <span>Assigned to: {page.profiles?.full_name || 'Self'}</span>
                  <span>{new Date(page.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-brand-surface w-full max-w-md rounded-2xl border border-brand-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-brand-text mb-2">Create New Landing Page</h2>
              <p className="text-brand-muted text-sm mb-6">Enter a title for your landing page. This will be used to generate the URL.</p>
              
              <form onSubmit={handleCreatePage}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">Page Title</label>
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder="e.g. Summer Campaign 2026"
                      value={newPageTitle}
                      onChange={(e) => setNewPageTitle(e.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-3 text-brand-text font-medium focus:border-brand-accent focus:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
                    />
                  </div>
                  
                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isCreating}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold text-brand-muted hover:text-brand-text hover:bg-brand-border/50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating || !newPageTitle.trim()}
                      className="px-6 py-2.5 rounded-xl bg-brand-accent text-sm font-bold text-white hover:bg-brand-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isCreating && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                      {isCreating ? 'Creating...' : 'Create Page'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
