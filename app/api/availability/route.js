import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const assigneeId = searchParams.get('assignee_id');

    if (!dateStr) {
      return NextResponse.json({ error: `Missing parameter date` }, { status: 400 });
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

    let teamIds = [];
    if (assigneeId) {
      teamIds = [assigneeId];
    } else {
      const { data: profiles } = await supabase.from('profiles').select('id');
      teamIds = profiles?.map(p => p.id) || [];
    }

    const freeSlots = [];
    if (teamIds.length === 0) {
      // If no profiles exist yet, just allow booking based on global appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('scheduled_at')
        .gte('scheduled_at', startDate.toISOString())
        .lte('scheduled_at', endDate.toISOString());
        
      const bookedSlots = new Set();
      (appointments || []).forEach(app => {
        const dateObj = new Date(app.scheduled_at);
        const hours = dateObj.getUTCHours().toString().padStart(2, '0');
        const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
        bookedSlots.add(`${hours}:${minutes}`);
      });
      
      allPossibleSlots.forEach(slot => {
        if (!bookedSlots.has(slot)) {
          freeSlots.push(slot);
        }
      });
      
      return NextResponse.json({ date: dateStr, availableSlots: freeSlots });
    }

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('scheduled_at, assignee_id')
      .in('assignee_id', teamIds)
      .gte('scheduled_at', startDate.toISOString())
      .lte('scheduled_at', endDate.toISOString());

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: 'Database query failed', details: error.message }, { status: 500 });
    }

    // For each slot, check if AT LEAST ONE team member is free
    
    // Group booked times by assignee
    const bookingsByAssignee = {};
    teamIds.forEach(id => bookingsByAssignee[id] = new Set());
    
    (appointments || []).forEach(app => {
      const dateObj = new Date(app.scheduled_at);
      const hours = dateObj.getUTCHours().toString().padStart(2, '0');
      const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
      const timeSlot = `${hours}:${minutes}`;
      bookingsByAssignee[app.assignee_id]?.add(timeSlot);
    });

    allPossibleSlots.forEach(slot => {
      // Slot is available if there is any team member who hasn't booked this slot
      const isAvailable = teamIds.some(id => !bookingsByAssignee[id].has(slot));
      if (isAvailable) {
        freeSlots.push(slot);
      }
    });

    return NextResponse.json({ date: dateStr, availableSlots: freeSlots });

  } catch (error) {
    console.error('Unhandled error in availability route:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
