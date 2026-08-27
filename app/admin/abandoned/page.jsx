import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const revalidate = 0;

export default async function AbandonedPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  // Fetch abandoned sessions (status STARTED and last_activity is older than 30 mins)
  // or explicitly marked as ABANDONED. We'll join with visitors if we want, but for now just basic query.
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  
  const { data: abandoned, error } = await supabase
    .from('form_sessions')
    .select(`
      *,
      visitors (
        first_page,
        device,
        user_agent
      )
    `)
    .eq('status', 'STARTED')
    .lt('last_activity', thirtyMinsAgo)
    .order('last_activity', { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-text mb-8">Abandoned Sessions</h1>
      <p className="text-brand-text/60 mb-6">Users who started the form but did not complete it.</p>
      
      <div className="bg-brand-surface rounded-xl  border border-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-brand-bg text-brand-text/60 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Session ID</th>
                <th className="px-6 py-4">Step Reached</th>
                <th className="px-6 py-4">Device</th>
                <th className="px-6 py-4">Started At</th>
                <th className="px-6 py-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!abandoned || abandoned.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-brand-text/60">
                    No abandoned sessions found.
                  </td>
                </tr>
              ) : (
                abandoned.map((session) => (
                  <tr key={session.id} className="hover:bg-brand-bg">
                    <td className="px-6 py-4 font-medium text-brand-text font-mono text-sm">
                      {session.session_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">
                        Step {session.current_step}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-text/60 text-sm">
                      {session.visitors?.device || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-brand-text/60 text-sm">
                      {new Date(session.started_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-brand-text/60 text-sm">
                      {new Date(session.last_activity).toLocaleString()}
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