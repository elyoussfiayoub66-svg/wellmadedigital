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
      return NextResponse.json({ error: `Missing parameter date` }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase API keys are not configured correctly on the server.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's profile to get custom availability settings
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('availability')
      .eq('id', targetUserId)
      .single();

    if (profileError) {
      console.error('Failed to fetch profile availability:', profileError);
      return NextResponse.json({ error: 'Failed to fetch availability profile' }, { status: 500 });
    }

    const availabilityConfig = profile?.availability || {
      monday: { active: true, start: "09:00", end: "17:00" },
      tuesday: { active: true, start: "09:00", end: "17:00" },
      wednesday: { active: true, start: "09:00", end: "17:00" },
      thursday: { active: true, start: "09:00", end: "17:00" },
      friday: { active: true, start: "09:00", end: "17:00" },
      saturday: { active: false, start: "09:00", end: "17:00" },
      sunday: { active: false, start: "09:00", end: "17:00" },
    };

    const startDate = new Date(`${dateStr}T00:00:00.000Z`);
    const endDate = new Date(`${dateStr}T23:59:59.999Z`);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: `Invalid date format: ${dateStr}` }, { status: 400 });
    }

    // Determine day of week
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[startDate.getUTCDay()];
    const dayConfig = availabilityConfig[dayOfWeek];

    if (!dayConfig || !dayConfig.active) {
      return NextResponse.json({ date: dateStr, availableSlots: [] });
    }

    // Generate possible slots based on start/end time and break times
    const allPossibleSlots = [];
    const parseTime = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m; // Convert to minutes
    };
    const formatTime = (totalMins) => {
      const h = Math.floor(totalMins / 60).toString().padStart(2, '0');
      const m = (totalMins % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    const startMins = parseTime(dayConfig.start || "09:00");
    const endMins = parseTime(dayConfig.end || "17:00");
    
    let breakStartMins = -1;
    let breakEndMins = -1;
    if (dayConfig.hasBreak && dayConfig.breakStart && dayConfig.breakEnd) {
      breakStartMins = parseTime(dayConfig.breakStart);
      breakEndMins = parseTime(dayConfig.breakEnd);
    }

    for (let m = startMins; m < endMins; m += 30) {
      // If the slot falls inside a break, skip it
      if (dayConfig.hasBreak && m >= breakStartMins && m < breakEndMins) {
        continue;
      }
      allPossibleSlots.push(formatTime(m));
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
    const isToday = now.toISOString().split('T')[0] === dateStr;

    allPossibleSlots.forEach(slot => {
      if (!bookedSlots.has(slot)) {
        if (isToday) {
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
