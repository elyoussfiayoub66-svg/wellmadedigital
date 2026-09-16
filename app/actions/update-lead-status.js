'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendCapiEvent } from '@/lib/meta-capi';

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );
}

export async function updateLeadStatusAction(leadId, newStatus) {
  const supabase = await createClient();
  const updated_at = new Date().toISOString();

  // Fetch the lead first to pass the data to CAPI
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (fetchError || !lead) {
    return { success: false, error: fetchError?.message || 'Lead not found' };
  }

  // Update status in DB
  const { error: updateError } = await supabase
    .from('leads')
    .update({ status: newStatus, updated_at })
    .eq('id', leadId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Trigger Meta CAPI Event for the status change
  // We send the new status as the event_name
  await sendCapiEvent(newStatus, lead);

  return { 
    success: true, 
    updatedLead: { ...lead, status: newStatus, updated_at }
  };
}
