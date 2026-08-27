import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const revalidate = 0;

export default async function CampaignsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-text">Campaigns</h1>
        <button className="bg-brand-accent text-brand-text-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors">
          + New Campaign
        </button>
      </div>

      <div className="bg-brand-surface rounded-xl  border border-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-brand-bg text-brand-text/60 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Budget</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Start Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!campaigns || campaigns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-brand-text/60">
                    No active campaigns found.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-bg">
                    <td className="px-6 py-4 font-medium text-brand-text">{c.name}</td>
                    <td className="px-6 py-4 text-brand-text/60">{c.platform}</td>
                    <td className="px-6 py-4 text-brand-text/60">{c.city}</td>
                    <td className="px-6 py-4 text-brand-text font-medium">MAD {c.budget || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'ACTIVE' ? 'bg-brand-accent/10 text-brand-accent' : 'bg-brand-bg text-brand-text/80'}`}>
                        {c.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-text/60 text-sm">
                      {c.start_date ? new Date(c.start_date).toLocaleDateString() : 'N/A'}
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