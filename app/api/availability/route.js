import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    // HARDCODED USER ID AS REQUESTED
    const targetUserId = '84c58de0-775c-4e67-87a8-72b545e96a3c';

    if (!dateStr) {
      return NextResponse.json({ error: \Missing parameter date\ }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase API keys are not configured correctly on the server.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const allPossibleSlots = [];
    for (let hour = 10; hour < 18; hour++) {
      allPossibleSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allPossibleSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    const startDate = new Date(`${dateStr}T00:00:00.000Z`);
    const endDate = new Date(`${dateStr}T23:59:59.999Z`);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: `Invalid date format: ${dateStr}` }, { status: 400 });
    }

    // Only query appointments for this specific user that are NOT canceled
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('scheduled_at, assignee_id, status')
      .eq('assignee_id', targetUserId)
      .neq('status', 'CANCELED') // Free up canceled slots
      .gte('scheduled_at', startDate.toISOString())
      .lte('scheduled_at', endDate.toISOString());

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: 'Database query failed', details: error.message }, { status: 500 });
    }

    const bookedSlots = new Set();
    (appointments || []).forEach(app => {
      const dateObj = new Date(app.scheduled_at);
      const hours = dateObj.getUTCHours().toString().padStart(2, '0');
      const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
      bookedSlots.add(`${hours}:${minutes}`);
    });

    const freeSlots = [];
    
    // Real-time check: Do not allow past times if the date is today
    const now = new Date();
    // Assuming clinic timezone is UTC for math, or local. Let's compare timestamps.
    const isToday = now.toISOString().split('T')[0] === dateStr;

    allPossibleSlots.forEach(slot => {
      if (!bookedSlots.has(slot)) {
        if (isToday) {
          const [slotH, slotM] = slot.split(':').map(Number);
          // Compare with current UTC time (if appointments are saved in UTC). 
          // If the landing page assumes local time, we should compare against local time.
          // To be safe, we parse the exact slot time today and check if it's in the past.
          const slotTime = new Date(`${dateStr}T${slot}:00.000Z`);
          if (slotTime.getTime() > now.getTime()) {
             freeSlots.push(slot);
          }
        } else {
          freeSlots.push(slot);
        }
      }
    });

    return NextResponse.json({ date: dateStr, availableSlots: freeSlots });

  } catch (error) {
    console.error('Unhandled error in availability route:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
