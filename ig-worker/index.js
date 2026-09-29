require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const pino = require('pino');
const puppeteer = require('puppeteer');

const logger = pino();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Map of account_id -> { browser, page }
const igClients = new Map();

// Helper to get random integer between min and max
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Parse message template variables
const parseMessage = (template, prospect) => {
  if (!template) return '';
  return template
    .replace(/{first_name}/g, prospect.first_name || 'there')
    .replace(/{business_name}/g, prospect.business_name || 'your business')
    .replace(/{city}/g, prospect.city || 'your city');
};

async function initIgClient(accountId, username, password) {
  try {
    logger.info(`Launching visual browser for ${username}...`);
    const browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized', '--disable-notifications']
    });
    const page = await browser.newPage();
    
    await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });
    
    await page.waitForSelector('input', { timeout: 60000 });

    try {
      const cookieBtns = await page.$$('button');
      for (let btn of cookieBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.toLowerCase().includes('allow')) {
          await btn.click();
          break;
        }
      }
    } catch(e) {}

    const inputs = await page.$$('input');
    let userTyped = false;
    let passTyped = false;
    for (let input of inputs) {
      const type = await page.evaluate(el => el.type, input);
      const name = await page.evaluate(el => el.name, input);
      
      if (!userTyped && (type === 'text' || name === 'username' || name === 'email')) {
        await input.type(username, { delay: 100 });
        userTyped = true;
      } else if (!passTyped && (type === 'password' || name === 'password' || name === 'pass')) {
        await input.type(password, { delay: 100 });
        passTyped = true;
      }
    }
    
    if (!userTyped || !passTyped) {
       throw new Error("Could not find username or password inputs on the login page!");
    }
    
    const loginBtns = await page.$$('button[type="submit"]');
    if (loginBtns.length > 0) {
       await loginBtns[0].click();
    } else {
       await page.keyboard.press('Enter');
    }
    
    await new Promise(r => setTimeout(r, 10000));
    
    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
      throw new Error("Failed to log in. Check credentials, 2FA, or Instagram blocked the IP.");
    }
    
    logger.info(`Successfully logged into ${username} via Puppeteer Browser`);
    igClients.set(accountId, { browser, page });
  } catch (err) {
    logger.error(`Failed to login ${username}: ${err.message}`);
    throw err;
  }
}

async function loadIgAccounts() {
  const { data: accounts, error } = await supabase.from('ig_accounts').select('*').eq('status', 'active');
  if (error) {
    logger.error('Failed to fetch IG accounts:', error);
    return;
  }
  
  for (const acc of accounts) {
    if (!igClients.has(acc.id)) {
      try {
        const username = acc.handle.replace('@', '').trim();
        await initIgClient(acc.id, username, acc.password_hash);
      } catch (err) {
        await supabase.from('ig_accounts').update({ status: 'error' }).eq('id', acc.id);
      }
    }
  }
}

async function processAutomations() {
  try {
    await loadIgAccounts();
    logger.info('Checking for active automations...');
    
    const { data: automations, error } = await supabase
      .from('dm_automations')
      .select('*')
      .eq('status', 'active');
      
    if (error) throw error;
    if (!automations || automations.length === 0) return;
    
    const now = new Date();

    for (const auto of automations) {
      if (auto.nextexecution !== 'Pending') {
        const nextExecTime = new Date(auto.nextexecution);
        if (now < nextExecTime) continue; 
      }
      
      if (auto.sent >= auto.scheduled) {
        logger.info(`Automation ${auto.name} completed its scheduled run.`);
        await supabase.from('dm_automations').update({ status: 'archived', nextexecution: 'Completed' }).eq('id', auto.id);
        continue;
      }

      logger.info(`Executing automation: ${auto.name} (Sent: ${auto.sent}/${auto.scheduled})`);
      
      const { data: prospects } = await supabase
        .from('prospects')
        .select('*')
        .eq('pipeline_status', auto.pipeline_status_filter || 'not contacted')
        .limit(1);
        
      const prospect = prospects && prospects.length > 0 ? prospects[0] : null;

      if (!prospect) {
        logger.info(`No more prospects found for ${auto.name}. Pausing automation.`);
        await supabase.from('dm_automations').update({ status: 'paused', nextexecution: 'No Leads' }).eq('id', auto.id);
        continue;
      }

      // SEND DM VIA PUPPETEER
      const activeIgKeys = Array.from(igClients.keys());
      if (activeIgKeys.length === 0) {
        logger.warn('No active IG browsers open! Cannot send DM.');
        continue;
      }
      
      const client = igClients.get(activeIgKeys[0]);
      const page = client.page;
      const prospectHandle = (prospect.ig_handle || prospect.instagram || '').replace('@', '').trim();
      
      if (!prospectHandle) {
        await supabase.from('prospects').update({ pipeline_status: 'wrong contact' }).eq('id', prospect.id);
        continue;
      }

      try {
        logger.info(`Navigating to @${prospectHandle} profile...`);
        await page.goto(`https://www.instagram.com/${prospectHandle}/`, { waitUntil: 'networkidle2' });
        
        // Find and click the "Message" button
        const clickedMessage = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('div[role="button"]'));
          const msgBtn = btns.find(b => b.textContent.trim().toLowerCase() === 'message');
          if (msgBtn) {
            msgBtn.click();
            return true;
          }
          return false;
        });

        if (!clickedMessage) {
           throw new Error("Could not find 'Message' button on profile. Maybe private or blocked?");
        }

        // Wait for the DM textarea
        await page.waitForSelector('div[contenteditable="true"][role="textbox"]', { timeout: 10000 });
        
        const finalMessage = parseMessage(auto.message_template, prospect);
        await page.type('div[contenteditable="true"][role="textbox"]', finalMessage, { delay: 50 });
        
        // Hit enter to send
        await page.keyboard.press('Enter');
        
        logger.info(`-> Successfully sent REAL DM to @${prospectHandle} via Puppeteer!`);
        
        // Wait a second for it to actually send before navigating away
        await new Promise(r => setTimeout(r, 2000));
        
      } catch (sendErr) {
        logger.error(`Failed to send DM to @${prospectHandle}: ${sendErr.message}`);
        await supabase.from('prospects').update({ pipeline_status: 'error' }).eq('id', prospect.id);
        continue; 
      }

      // Calculate next delay
      const newSentCount = auto.sent + 1;
      let delayMinutes = 0;
      
      if (newSentCount % 4 === 0) {
         delayMinutes = getRandomInt(auto.delay_after_batch_min, auto.delay_after_batch_max);
         logger.info(`Batch of 4 reached. Next DM will wait ${delayMinutes} minutes.`);
      } else {
         delayMinutes = getRandomInt(auto.delay_between_dms_min, auto.delay_between_dms_max);
         logger.info(`Next DM will wait ${delayMinutes} minutes.`);
      }

      const nextExecTimestamp = new Date(now.getTime() + delayMinutes * 60000);

      await supabase.from('dm_automations').update({
        sent: newSentCount,
        nextexecution: nextExecTimestamp.toISOString()
      }).eq('id', auto.id);
      
      await supabase.from('prospects').update({ pipeline_status: 'contacted' }).eq('id', prospect.id);
    }
  } catch (err) {
    logger.error(`Engine Error: ${err.message}`);
  }
}

// Start engine loop
setInterval(processAutomations, 15000); // 15 seconds
logger.info('IG Puppeteer Worker started');
