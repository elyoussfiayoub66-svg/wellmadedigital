import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const assigneeId = searchParams.get('assignee_id');

    if (!dateStr || !assigneeId) {
      return NextResponse.json({ error: `Missing parameters. date: ${dateStr}, assignee_id: ${assigneeId}` }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase API keys are not configured correctly on the server.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const availableSlots = [];
    for (let hour = 10; hour < 18; hour++) {
      availableSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      availableSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    const startDate = new Date(`${dateStr}T00:00:00.000Z`);
    const endDate = new Date(`${dateStr}T23:59:59.999Z`);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: `Invalid date format: ${dateStr}` }, { status: 400 });
    }

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('scheduled_at')
      .eq('assignee_id', assigneeId)
      .gte('scheduled_at', startDate.toISOString())
      .lte('scheduled_at', endDate.toISOString());

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: 'Database query failed', details: error.message }, { status: 500 });
    }

    const bookedTimes = (appointments || []).map(app => {
      const dateObj = new Date(app.scheduled_at);
      const hours = dateObj.getUTCHours().toString().padStart(2, '0');
      const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    });

    const freeSlots = availableSlots.filter(slot => !bookedTimes.includes(slot));
    return NextResponse.json({ date: dateStr, availableSlots: freeSlots });

  } catch (error) {
    console.error('Unhandled error in availability route:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
