import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const revalidate = 0; // Disable static caching for admin dashboard

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // We use anon key because RLS allows authenticated users full access
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  // Execute aggregation queries
  const [
    { count: totalVisitors },
    { count: formStarts },
    { count: completedForms },
    { count: qualifiedLeads },
    { count: demosBooked }
  ] = await Promise.all([
    supabase.from('visitors').select('*', { count: 'exact', head: true }),
    supabase.from('form_sessions').select('*', { count: 'exact', head: true }),
    supabase.from('form_sessions').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gt('qualification_score', 0),
    supabase.from('appointments').select('*', { count: 'exact', head: true })
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-text mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-brand-surface p-6 rounded-xl shadow-sm border border-brand-dark/5">
          <div className="text-sm font-medium text-brand-text/60 mb-1">Total Visitors</div>
          <div className="text-3xl font-bold text-brand-text">{totalVisitors || 0}</div>
        </div>
        <div className="bg-brand-surface p-6 rounded-xl shadow-sm border border-brand-dark/5">
          <div className="text-sm font-medium text-brand-text/60 mb-1">Form Starts</div>
          <div className="text-3xl font-bold text-brand-accent">{formStarts || 0}</div>
        </div>
        <div className="bg-brand-surface p-6 rounded-xl shadow-sm border border-brand-dark/5">
          <div className="text-sm font-medium text-brand-text/60 mb-1">Completed</div>
          <div className="text-3xl font-bold text-indigo-600">{completedForms || 0}</div>
        </div>
        <div className="bg-brand-surface p-6 rounded-xl shadow-sm border border-brand-dark/5">
          <div className="text-sm font-medium text-brand-text/60 mb-1">Qualified Leads</div>
          <div className="text-3xl font-bold text-green-600">{qualifiedLeads || 0}</div>
        </div>
        <div className="bg-brand-surface p-6 rounded-xl shadow-sm border border-brand-dark/5">
          <div className="text-sm font-medium text-brand-text/60 mb-1">Demos Booked</div>
          <div className="text-3xl font-bold text-purple-600">{demosBooked || 0}</div>
        </div>
      </div>
      
      <h2 className="text-xl font-bold text-brand-text mb-4">Conversion Funnel</h2>
      <div className="bg-brand-surface p-8 rounded-xl shadow-sm border border-brand-dark/5">
        <div className="flex justify-between items-center relative flex-wrap gap-y-12">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-brand-bg -z-10 -translate-y-1/2 hidden md:block"></div>
          
          <div className="flex flex-col items-center bg-brand-surface px-2 z-10 w-full md:w-auto">
            <div className="w-16 h-16 bg-brand-bg rounded-xl flex items-center justify-center text-xl font-bold text-brand-text/80 mb-2 border-4 border-white shadow-sm">{totalVisitors || 0}</div>
            <div className="text-sm font-medium text-brand-text/60">Visitors</div>
          </div>
          
          <div className="flex flex-col items-center bg-brand-surface px-2 z-10 w-full md:w-auto">
            <div className="w-16 h-16 bg-brand-bg rounded-xl flex items-center justify-center text-xl font-bold text-brand-accent mb-2 border-4 border-white shadow-sm">{formStarts || 0}</div>
            <div className="text-sm font-medium text-brand-text/60">Started Form</div>
          </div>
          
          <div className="flex flex-col items-center bg-brand-surface px-2 z-10 w-full md:w-auto">
            <div className="w-16 h-16 bg-brand-bg rounded-xl flex items-center justify-center text-xl font-bold text-brand-text mb-2 border-4 border-white shadow-sm">{completedForms || 0}</div>
            <div className="text-sm font-medium text-brand-text/60">Completed</div>
          </div>
          
          <div className="flex flex-col items-center bg-brand-surface px-2 z-10 w-full md:w-auto">
            <div className="w-16 h-16 bg-brand-accent/10 rounded-xl flex items-center justify-center text-xl font-bold text-brand-accent mb-2 border-4 border-white shadow-sm">{qualifiedLeads || 0}</div>
            <div className="text-sm font-medium text-brand-text/60">Qualified</div>
          </div>
          
          <div className="flex flex-col items-center bg-brand-surface px-2 z-10 w-full md:w-auto">
            <div className="w-16 h-16 bg-brand-bg rounded-xl flex items-center justify-center text-xl font-bold text-brand-text mb-2 border-4 border-white shadow-sm">{demosBooked || 0}</div>
            <div className="text-sm font-medium text-brand-text/60">Demos</div>
          </div>
        </div>
      </div>
    </div>
  );
}
