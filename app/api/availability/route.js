import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');
  const assigneeId = searchParams.get('assignee_id');

  if (!dateStr || !assigneeId) {
    return NextResponse.json({ error: 'Missing date or assignee_id' }, { status: 400 });
  }

  // Create a supabase client with the SERVICE_ROLE key to bypass RLS for fetching appointments
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Generate all possible 30-min slots from 10:00 to 17:30 (since 18:00 is the end time)
  const availableSlots = [];
  for (let hour = 10; hour < 18; hour++) {
    availableSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    availableSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  try {
    // Parse the requested date to set boundaries
    const targetDate = new Date(dateStr);
    
    // Start of the day in UTC (or assuming the DB stores them in UTC and we query by date)
    // To avoid timezone complexities, we'll query by the DATE part if possible, 
    // or construct exact timestamp boundaries.
    const startDate = new Date(`${dateStr}T00:00:00.000Z`);
    const endDate = new Date(`${dateStr}T23:59:59.999Z`);

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('scheduled_at')
      .eq('assignee_id', assigneeId)
      .gte('scheduled_at', startDate.toISOString())
      .lte('scheduled_at', endDate.toISOString());

    if (error) throw error;

    // Extract the booked times (HH:MM) from the appointments
    const bookedTimes = appointments.map(app => {
      const dateObj = new Date(app.scheduled_at);
      // Get the local time string HH:MM that corresponds to the booked slot
      const hours = dateObj.getUTCHours().toString().padStart(2, '0');
      const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    });

    // Filter out the booked slots
    const freeSlots = availableSlots.filter(slot => !bookedTimes.includes(slot));

    return NextResponse.json({ date: dateStr, availableSlots: freeSlots });

  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
