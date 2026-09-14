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

  // HARDCODED USER ID AS REQUESTED
  const targetUserId = '84c58de0-775c-4e67-87a8-72b545e96a3c';

  // 1. Insert Lead (Assigned to the target user)
  const { data: lead, error: leadError } = await supabase.from('leads').insert({
    full_name: name,
    phone,
    agency_name: businessName,
    business_type: 'Clinique',
    status: 'NEW',
    source: 'Website Booking',
    assigned_to: targetUserId
  }).select().single();

  if (leadError || !lead) {
    console.error('Lead insertion error:', leadError);
    return { success: false, error: 'Failed to create lead' };
  }

  // 2. Insert Appointment
  const dateTimeStr = `${meetingDate}T${meetingTime}:00.000Z`;
  const { error: apptError } = await supabase.from('appointments').insert({
    lead_id: lead.id,
    scheduled_at: dateTimeStr,
    status: 'SCHEDULED',
    title: `Discovery Call - ${businessName || name}`,
    assignee_id: targetUserId
  });

  if (apptError) {
    console.error('Appointment insertion error:', apptError);
    return { success: false, error: 'Failed to schedule appointment' };
  }

  // 3. Trigger Notification
  await supabase.from('notifications').insert({
    user_id: targetUserId,
    type: 'meeting',
    title: 'New Clinic Booking',
    content: `${name} booked a meeting for ${meetingDate} at ${meetingTime}.`,
    link: '/dashboard/calendar'
  });

  return { success: true, leadId: lead.id };
}
