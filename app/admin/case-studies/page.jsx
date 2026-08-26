import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default async function CaseStudiesPage() {
  const supabase = await createClient();
  const { data: caseStudies } = await supabase
    .from('case_studies')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-medium tracking-tight">Case Studies</h1>
        <Link 
          href="/admin/case-studies/new" 
          className="bg-brand-accent text-brand-text-light px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add New
        </Link>
      </div>

      <div className="bg-brand-surface rounded-xl shadow-sm border border-brand-dark/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-brand-bg/50 text-brand-text/70 text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Client</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-dark/5">
            {caseStudies?.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-brand-text/50">
                  No case studies found. Create your first one!
                </td>
              </tr>
            ) : (
              caseStudies?.map((study) => (
                <tr key={study.id} className="hover:bg-brand-bg/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{study.title}</td>
                  <td className="px-6 py-4 text-brand-text/70">{study.client_name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      study.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-brand-text/10 text-brand-text'
                    }`}>
                      {study.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-brand-text/70">
                    {new Date(study.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/case-studies/${study.id}`}
                      className="inline-flex items-center gap-1 text-brand-accent hover:opacity-80 font-medium text-sm"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
