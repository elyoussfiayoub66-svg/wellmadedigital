const { IgApiClient } = require('instagram-private-api');
const fs = require('fs');

async function login() {
  const ig = new IgApiClient();
  ig.state.generateDevice('ayoub__solutions');
  // We don't have the password, we need to fetch it from supabase
  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY);
  
  const { data: accounts } = await supabase.from('ig_accounts').select('*').eq('handle', '@ayoub__solutions').single();
  
  try {
    const auth = await ig.account.login('ayoub__solutions', accounts.password_hash);
    console.log("Success! Logged in as", auth.username);
    const cookies = await ig.state.serializeCookieJar();
    
    // Map to puppeteer format
    const puppeteerCookies = cookies.cookies.map(c => ({
      name: c.key,
      value: c.value,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly
    }));
    
    fs.writeFileSync(`cookies_ayoub__solutions.json`, JSON.stringify(puppeteerCookies, null, 2));
    console.log("Saved cookies to cookies_ayoub__solutions.json");
  } catch (e) {
    console.error("Login failed:", e.message);
  }
}
login();
