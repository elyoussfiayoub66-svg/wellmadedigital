'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper to create server client inside actions
function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // Use service role for backend operations
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Ignore error
          }
        },
      },
    }
  );
}

function calculateScore(data) {
  let score = 0;
  
  // Fleet size
  if (data.fleet === '1–5') score += 1;
  else if (data.fleet === '6–15') score += 2;
  else if (data.fleet === '16–30') score += 3;
  else if (data.fleet === '31–50') score += 4;
  else if (data.fleet === '50+') score += 5;

  // Buying Intent
  if (data.timeline === 'Immediately') score += 5;
  else if (data.timeline === 'Within 1–3 months') score += 3;
  else if (data.timeline === 'Just exploring') score += 1;

  // Current Operations Pain
  if (['WhatsApp', 'Excel / Google Sheets', 'Combination'].includes(data.booking_method)) score += 3;
  
  // Problem Pain
  if (['Double bookings', 'WhatsApp overload', 'Vehicle status tracking'].includes(data.problem)) score += 3;

  return score;
}

export async function startFormSession(visitorId, sessionId) {
  const supabase = createClient();
  
  const { data, error } = await supabase.from('form_sessions').insert({
    session_id: sessionId,
    visitor_id: visitorId,
    current_step: 0,
    status: 'STARTED',
    started_at: new Date().toISOString()
  }).select().single();

  if (error) console.error('Error starting form session:', error);
  return data;
}

export async function updateFormSession(sessionId, step) {
  const supabase = createClient();
  
  const { data, error } = await supabase.from('form_sessions').update({
    current_step: step,
    last_activity: new Date().toISOString()
  }).eq('session_id', sessionId).select().single();

  if (error) console.error('Error updating form session:', error);
  return data;
}

export async function abandonFormSession(sessionId) {
  const supabase = createClient();
  
  await supabase.from('form_sessions').update({
    status: 'ABANDONED',
    abandoned_at: new Date().toISOString()
  }).eq('session_id', sessionId);
}

export async function submitLead(formData, visitorId, sessionId, attribution) {
  const supabase = createClient();
  
  // 1. Calculate Score
  const score = calculateScore(formData);
  
  // 2. See if we have a campaign matching attribution
  let campaignId = null;
  if (attribution && attribution.utm_campaign) {
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id')
      .ilike('name', attribution.utm_campaign)
      .single();
      
    if (campaign) {
      campaignId = campaign.id;
    }
  }

  // 3. Create Lead
  const { data: lead, error: leadError } = await supabase.from('leads').insert({
    agency_name: formData.agency,
    city: formData.city,
    fleet_size: formData.fleet,
    current_booking_method: formData.booking_method,
    main_problem: formData.problem,
    buying_timeline: formData.timeline,
    full_name: formData.name,
    phone: formData.phone,
    email: formData.email,
    qualification_score: score,
    campaign_id: campaignId
  }).select().single();

  if (leadError) {
    console.error('Error creating lead:', leadError);
    return { success: false, error: leadError };
  }

  // 4. Update Form Session to COMPLETED
  await supabase.from('form_sessions').update({
    status: 'COMPLETED',
    lead_id: lead.id,
    completed_at: new Date().toISOString()
  }).eq('session_id', sessionId);
  
  // 5. Optionally, update the Visitor record if not already linked (we omit for simplicity, as session links it)

  return { success: true, lead };
}
