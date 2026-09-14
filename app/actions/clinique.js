'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
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

export async function submitCliniqueBooking({ name, phone, businessName, meetingDate, meetingTime }) {
  const supabase = createClient();

  // 1. Determine assignee (auto-distribution)
  let selectedAssigneeId = null;

  const { data: settings } = await supabase
    .from('crm_settings')
    .select('meeting_distribution_mode')
    .limit(1)
    .maybeSingle();

  if (!settings || settings.meeting_distribution_mode === 'auto') {
    // Get all active team members
    const { data: members } = await supabase
      .from('profiles')
      .select('id, full_name, created_at')
      .eq('account_status', 'active');

    if (members && members.length > 0) {
      // Check availability for this specific slot
      // For now, assign to the oldest member (calendar cascading)
      const sorted = members.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
      selectedAssigneeId = sorted[0].id;
    }
  }

  // 2. Insert Lead
  const { data: lead, error: leadError } = await supabase.from('leads').insert({
    full_name: name,
    phone: phone,
    agency_name: businessName,
    status: 'NEW'
  }).select().single();

  if (leadError) {
    console.error('Lead insert error:', leadError);
    return { success: false, error: leadError.message };
  }

  // 3. Insert Appointment
  const scheduledAt = new Date(`${meetingDate}T${meetingTime}:00.000Z`).toISOString();

  const { error: apptError } = await supabase.from('appointments').insert({
    lead_id: lead.id,
    assignee_id: selectedAssigneeId,
    scheduled_at: scheduledAt,
    status: 'SCHEDULED'
  });

  if (apptError) {
    console.error('Appointment insert error:', apptError);
    return { success: false, error: apptError.message };
  }

  // 4. Fire Meta CAPI (server-side, no RLS issue)
  try {
    const PIXEL_ID = '720698980383477';
    const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;

    if (ACCESS_TOKEN) {
      const crypto = require('crypto');
      const hash = (val) => val ? crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex') : undefined;

      const hashedPh = phone ? hash(phone) : null;
      const userDataPayload = {};
      if (hashedPh) userDataPayload.ph = [hashedPh];
      if (lead?.id) userDataPayload.lead_id = lead.id.toString();

      const payload = {
        data: [{
          action_source: "system_generated",
          custom_data: { event_source: "crm", lead_event_source: "Wellmade CRM", content_name: "Clinique LP" },
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          user_data: userDataPayload
        }]
      };

      fetch(`https://graph.facebook.com/v26.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(err => console.error('CAPI error:', err));
    }
  } catch (e) {
    console.error('CAPI prep error:', e);
  }

  return { success: true, leadId: lead.id };
}
