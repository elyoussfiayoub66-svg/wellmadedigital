import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  // Protect this route from being called accidentally in production after setup
  // You might want to remove or disable this file once run!
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Setup only allowed in development' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase keys' }, { status: 500 });
  }

  // Use service role key to bypass RLS and create users directly
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const email = 'admin@scaleup.agency';
  const password = 'ScaleUp2026!';

  // Inject the master admin account directly into auth.users
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    // If the user already exists, it's fine.
    if (error.message.includes('already exists')) {
      return NextResponse.json({ message: 'Admin account already exists!', email });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ 
    message: 'Successfully injected master admin account directly!',
    email,
    password: 'ScaleUp2026! (Keep this secure)'
  });
}
