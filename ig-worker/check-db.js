const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY
);

async function run() {
  // Try to update using a dummy record to see if column exists
  const { error } = await supabase.from('ig_accounts').select('session_id').limit(1);
  if (error && error.message.includes('session_id')) {
     console.log("session_id column does not exist. Please run add_session_id.sql in your Supabase SQL editor.");
  } else {
     console.log("session_id column exists or is accessible.");
  }
}
run();
