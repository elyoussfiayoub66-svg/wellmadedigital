'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

export async function submitCliniqueBooking({ name, phone, businessName, meetingDate, meetingTime }) {
  const supabase = await createClient();

  // HARDCODED USER ID AS REQUESTED
  const targetUserId = '84c58de0-775c-4e67-87a8-72b545e96a3c';

  // 1. Normalize Phone
  let cleanPhone = phone ? phone.trim() : '';
  if (cleanPhone) {
    let digits = cleanPhone.replace(/[^0-9]/g, '');
    if (digits.startsWith('00')) digits = digits.substring(2);
    if (digits.startsWith('0') && digits.length === 10) {
      digits = '212' + digits.substring(1);
    } else if ((digits.startsWith('6') || digits.startsWith('7') || digits.startsWith('5')) && digits.length === 9) {
      digits = '212' + digits;
    }
    cleanPhone = '+' + digits;
  }

  // 1. Insert Lead
  const { data: lead, error: leadError } = await supabase.from('leads').insert({
    full_name: name,
    phone: cleanPhone || phone,
    agency_name: businessName,
    status: 'NEW'
  }).select().single();

  if (leadError || !lead) {
    console.error('Lead insertion error:', leadError);
    return { success: false, error: leadError?.message || 'Failed to create lead' };
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

  // 4. Trigger Workflow Engine (WhatsApp Worker)
  try {
    const workerUrl = process.env.NEXT_PUBLIC_WHATSAPP_WORKER_URL || 'http://localhost:3001';
    await fetch(`${workerUrl}/api/webhook/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead })
    });
  } catch (err) {
    console.error('Failed to ping workflow engine:', err);
  }

  return { success: true, leadId: lead.id };
}
