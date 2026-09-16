import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const formData = await req.formData();
    
    // Extract data
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    // Attempt to detect which LP this came from via Referer
    const referer = req.headers.get('referer');
    let assignedUserId = null;
    
    if (referer) {
      try {
        const url = new URL(referer);
        const pathSegments = url.pathname.split('/');
        // e.g. /lp/my-slug
        if (pathSegments.length >= 3 && pathSegments[1] === 'lp') {
          const slug = pathSegments[2];
          const { data: lpData } = await supabase
            .from('landing_pages')
            .select('assigned_user_id')
            .eq('slug', slug)
            .single();
            
          if (lpData?.assigned_user_id) {
            assignedUserId = lpData.assigned_user_id;
          }
        }
      } catch (err) {
        console.warn('Could not parse referer for lead assignment');
      }
    }

    if (!name || !email) {
      return NextResponse.redirect(new URL('/?error=missing_fields', req.url));
    }

    // Insert into Leads table
    const { error } = await supabase.from('leads').insert([{
      name,
      email,
      phone,
      status: 'NEW',
      assigned_to: assignedUserId
    }]);

    if (error) throw error;

    // Redirect to a thank you page or back
    return NextResponse.redirect(new URL('/?success=true', req.url));
  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.redirect(new URL('/?error=server_error', req.url));
  }
}
