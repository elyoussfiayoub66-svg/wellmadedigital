import { createClient } from '@supabase/supabase-js'

// WARNING: ONLY USE THIS IN SECURE SERVER ENVIRONMENTS (e.g. Server Actions, API Routes)
// NEVER expose this client to the browser.

export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined.");
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
