'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getOrCreateVisitorId } from '@/lib/tracking/visitor';
import { captureAttribution } from '@/lib/tracking/attribution';
import * as meta from '@/lib/tracking/meta';
import { createClient } from '@/lib/supabase/client';

export default function TrackingProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Initialize Visitor ID & Capture Attribution
    const visitorId = getOrCreateVisitorId();
    const attribution = captureAttribution();

    // 2. Register visitor in DB if not exists
    const registerVisitor = async () => {
      const supabase = createClient();
      
      // Attempt to insert visitor. Note: RLS allows insert, but we should handle conflicts or let it silently fail if unique constraint violated.
      // A better way is an upsert or checking first, but since we rely on anon key, an RPC or just an upsert might work.
      // For now, we do a simple insert and ignore duplicate errors.
      
      const { error } = await supabase.from('visitors').insert({
        visitor_id: visitorId,
        first_page: window.location.pathname,
        device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        user_agent: navigator.userAgent
      });
      
      // We can also insert attribution if it's new
      if (!sessionStorage.getItem('attribution_saved')) {
         await supabase.from('attribution').insert({
           visitor_id: visitorId,
           ...attribution
         });
         sessionStorage.setItem('attribution_saved', 'true');
      }
    };
    
    registerVisitor();

  }, []); // Run once on mount

  useEffect(() => {
    // Track page views on route change
    meta.pageview();
    
    // Log page view event to our DB
    const logPageView = async () => {
      const supabase = createClient();
      const visitorId = getOrCreateVisitorId();
      await supabase.from('events').insert({
        visitor_id: visitorId,
        event_name: 'PageView',
        page: pathname,
        metadata: { searchParams: searchParams.toString() }
      });
    };
    
    logPageView();
    
  }, [pathname, searchParams]);

  return <>{children}</>;
}
