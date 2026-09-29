const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://mnkrjfgbxfwxrcploteg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua3JqZmdieGZ3eHJjcGxvdGVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTkzMTM1OCwiZXhwIjoyMTAxNTA3MzU4fQ.cpicIW4nMp6PG-n5xLbROPfoA1r-cOGeQ8lEztxcYXU');

async function fix() {
  await supabase.from('ig_accounts').update({ status: 'active' }).eq('status', 'error');
  console.log("Reset error accounts to active!");
}
fix();
