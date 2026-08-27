import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const revalidate = 0;

export default async function LeadsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-text mb-8">Leads CRM</h1>
      <div className="bg-brand-surface rounded-xl  border border-brand-border overflow-hidden">
        <div className="p-4 border-b border-brand-border bg-brand-bg flex justify-between items-center flex-wrap gap-4">
          <input 
            type="text" 
            placeholder="Search leads..." 
            className="border-brand-border rounded-lg p-2 border text-sm w-full md:w-64"
          />
          <select className="border-brand-border rounded-lg p-2 border text-sm w-full md:w-auto">
            <option>All Statuses</option>
            <option>NEW</option>
            <option>QUALIFIED</option>
            <option>CONTACTED</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-brand-bg text-brand-text/60 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Agency</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Fleet</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!leads || leads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-brand-text/60">
                    No leads found yet.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-brand-bg cursor-pointer">
                    <td className="px-6 py-4 font-medium text-brand-text">{lead.agency_name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-brand-text">{lead.full_name}</div>
                      <div className="text-xs text-brand-text/60">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-brand-text/60">{lead.city || 'N/A'}</td>
                    <td className="px-6 py-4 text-brand-text/60">{lead.fleet_size || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${lead.qualification_score > 0 ? 'bg-brand-accent/10 text-brand-accent' : 'bg-brand-bg text-brand-text/80'}`}>
                        {lead.qualification_score || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${lead.status === 'NEW' ? 'bg-brand-bg text-brand-accent' : 'bg-brand-bg text-brand-text/80'}`}>
                        {lead.status || 'NEW'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-text/60 text-sm">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
