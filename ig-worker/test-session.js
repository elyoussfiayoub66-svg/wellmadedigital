const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch({ 
    headless: true, // Use true so it doesn't pop up for the user right now, just for taking a screenshot
    args: ['--disable-notifications']
  });
  const page = await browser.newPage();
  
  // Replace with a dummy sessionid, wait, we can fetch from supabase
  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY);
  
  const { data: acc } = await supabase.from('ig_accounts').select('*').limit(1).single();
  
  if (acc && acc.session_id) {
    console.log("Found session_id in DB, trying to load...");
    await page.setCookie({
      name: 'sessionid',
      value: acc.session_id,
      domain: '.instagram.com',
      path: '/',
      secure: true,
      httpOnly: true
    });
    
    await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
    
    await page.screenshot({ path: 'session-test.png' });
    console.log("Screenshot saved to session-test.png");
    
    const url = page.url();
    console.log("URL after goto:", url);
    
    const isLoggedIn = await page.evaluate(() => {
       return !!document.querySelector('svg[aria-label="Home"]') || !!document.querySelector('svg[aria-label="New post"]');
    });
    
    console.log("isLoggedIn evaluated to:", isLoggedIn);
  } else {
    console.log("No session_id found in DB for the first account");
  }
  
  await browser.close();
}
run();
