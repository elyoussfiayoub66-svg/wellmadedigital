import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const revalidate = 0;

export default async function AnalyticsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  // Fetch attributions to see where traffic is coming from
  const { data: attributions, error } = await supabase
    .from('attribution')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-text mb-8">Traffic Analytics</h1>
      
      <div className="bg-brand-surface rounded-xl shadow-sm border border-brand-dark/5 overflow-hidden">
        <div className="p-4 border-b border-brand-dark/5 bg-brand-bg font-bold text-brand-text/80">
          Recent Traffic Sources
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-brand-bg text-brand-text/60 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Medium</th>
                <th className="px-6 py-4">Campaign</th>
                <th className="px-6 py-4">Landing Page</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!attributions || attributions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-brand-text/60">
                    No traffic data tracked yet. Ensure UTM parameters are used.
                  </td>
                </tr>
              ) : (
                attributions.map((attr) => (
                  <tr key={attr.id} className="hover:bg-brand-bg">
                    <td className="px-6 py-4 font-medium text-brand-text">{attr.utm_source || 'Direct'}</td>
                    <td className="px-6 py-4 text-brand-text/60">{attr.utm_medium || '-'}</td>
                    <td className="px-6 py-4 text-brand-text/60">{attr.utm_campaign || '-'}</td>
                    <td className="px-6 py-4 text-brand-text/60 text-sm max-w-[200px] truncate">
                      {attr.landing_page || '/'}
                    </td>
                    <td className="px-6 py-4 text-brand-text/60 text-sm">
                      {new Date(attr.created_at).toLocaleString()}
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