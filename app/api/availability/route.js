import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';


export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');
  const assigneeId = searchParams.get('assignee_id');

  if (!dateStr || !assigneeId) {
    return NextResponse.json({ error: 'Missing date or assignee_id' }, { status: 400 });
  }

  // Fallback to anon key if service role key is missing (though RLS might block anon requests)
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseKey) {
    return NextResponse.json({ error: 'Supabase API key is not configured on the server.' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey
  );

  const availableSlots = [];
  for (let hour = 10; hour < 18; hour++) {
    availableSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    availableSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  try {
    const startDate = new Date(`${dateStr}T00:00:00.000Z`);
    const endDate = new Date(`${dateStr}T23:59:59.999Z`);

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('scheduled_at')
      .eq('assignee_id', assigneeId)
      .gte('scheduled_at', startDate.toISOString())
      .lte('scheduled_at', endDate.toISOString());

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
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
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch availability', details: error }, { status: 500 });
  }
}
