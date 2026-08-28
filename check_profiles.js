const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
let url = '';
let key = '';

env.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

fetch(`${url}/rest/v1/profiles?select=*`, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
}).then(r => r.json()).then(data => {
  console.log("Profiles:", data);
}).catch(console.error);
