require('dotenv').config();
const express = require('express');
const { IgApiClient } = require('instagram-private-api');
const { createClient } = require('@supabase/supabase-js');
const pino = require('pino');

const logger = pino();
const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'placeholder'
);

// In-memory store of active IG clients
const igClients = new Map();

// Initialize an Instagram client
async function initIgClient(accountId, username, password) {
  try {
    const ig = new IgApiClient();
    ig.state.generateDevice(username);
    
    // Attempt to login
    logger.info(`Attempting to login to IG account: ${username}`);
    await ig.simulate.preLoginFlow();
    const auth = await ig.account.login(username, password);
    process.nextTick(async () => await ig.simulate.postLoginFlow());
    
    igClients.set(accountId, ig);
    logger.info(`Successfully logged in: ${username}`);
    return ig;
  } catch (err) {
    logger.error(`Failed to login for ${username}: ${err.message}`);
    throw err;
  }
}

// Fetch and initialize all active IG accounts
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
        // Mark as error if failed
        await supabase.from('ig_accounts').update({ status: 'error' }).eq('id', acc.id);
      }
    }
  }
}

// Basic delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Replace placeholders in message
function parseMessage(template, prospect) {
  let msg = template;
  msg = msg.replace(/{first_name}/g, prospect.owner_name ? prospect.owner_name.split(' ')[0] : 'there');
  msg = msg.replace(/{business_name}/g, prospect.business_name || 'your business');
  msg = msg.replace(/{niche}/g, prospect.niche || 'your industry');
  msg = msg.replace(/{city}/g, prospect.city || 'your area');
  return msg;
}

// Helper to get random integer between min and max
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Engine to process active automations
async function processAutomations() {
  try {
    await loadIgAccounts();
    logger.info('Checking for active automations...');
    
    // 1. Fetch active automations that are due for execution
    const { data: automations, error } = await supabase
      .from('dm_automations')
      .select('*')
      .eq('status', 'active');
      
    if (error) throw error;
    if (!automations || automations.length === 0) return;
    
    const now = new Date();

    for (const auto of automations) {
      // Check if it's time to execute
      if (auto.nextexecution !== 'Pending') {
        const nextExecTime = new Date(auto.nextexecution);
        if (now < nextExecTime) {
           // Not time yet, skip this automation
           continue; 
        }
      }
      
      // Check if we hit the limit
      if (auto.sent >= auto.scheduled) {
        logger.info(`Automation ${auto.name} completed its scheduled run.`);
        await supabase.from('dm_automations').update({ status: 'archived', nextexecution: 'Completed' }).eq('id', auto.id);
        continue;
      }

      logger.info(`Executing automation: ${auto.name} (Sent: ${auto.sent}/${auto.scheduled})`);
      
      // 2. Fetch the next pending prospect (just 1)
      // In a real scenario, you'd track which prospects have been contacted by this automation.
      // For now, we simulate fetching the next prospect.
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

      // 3. SEND THE DM IMMEDIATELY
      // We grab the first available connected IG client (for MVP)
      const activeIgKeys = Array.from(igClients.keys());
      if (activeIgKeys.length === 0) {
        logger.warn('No active IG clients connected! Cannot send DM.');
        continue; // Skip execution until an account is connected
      }
      
      const ig = igClients.get(activeIgKeys[0]); // Just pick the first one
      const prospectHandle = (prospect.ig_handle || prospect.instagram || '').replace('@', '').trim();
      
      if (!prospectHandle) {
        logger.warn(`Prospect ${prospect.id} has no IG handle. Skipping.`);
        await supabase.from('prospects').update({ pipeline_status: 'wrong contact' }).eq('id', prospect.id);
        continue;
      }

      try {
        logger.info(`Preparing to send real DM to @${prospectHandle}...`);
        const userId = await ig.user.getIdByUsername(prospectHandle);
        const thread = ig.entity.directThread([userId.toString()]);
        const finalMessage = parseMessage(auto.message_template, prospect);
        
        await thread.broadcastText(finalMessage);
        logger.info(`-> Successfully sent REAL DM to @${prospectHandle}`);
      } catch (sendErr) {
        logger.error(`Failed to send DM to @${prospectHandle}: ${sendErr.message}`);
        // We will pause the automation to prevent spamming errors
        await supabase.from('dm_automations').update({ status: 'error' }).eq('id', auto.id);
        continue; 
      }

      // 4. Calculate the NEXT delay
      const newSentCount = auto.sent + 1;
      let delayMinutes = 0;
      
      // If the new sent count is a multiple of 4, apply the batch delay
      if (newSentCount % 4 === 0) {
         delayMinutes = getRandomInt(auto.delay_after_batch_min, auto.delay_after_batch_max);
         logger.info(`Batch of 4 reached. Next DM will wait ${delayMinutes} minutes.`);
      } else {
         delayMinutes = getRandomInt(auto.delay_between_dms_min, auto.delay_between_dms_max);
         logger.info(`Next DM will wait ${delayMinutes} minutes.`);
      }

      // Calculate exact timestamp for next execution
      const nextExecTimestamp = new Date(now.getTime() + delayMinutes * 60000);

      // 5. Update the database
      await supabase.from('dm_automations').update({
        sent: newSentCount,
        nextexecution: nextExecTimestamp.toISOString()
      }).eq('id', auto.id);
      
      // Update prospect status so we don't message them again
      await supabase.from('prospects').update({ pipeline_status: 'contacted' }).eq('id', prospect.id);
    }
  } catch (err) {
    logger.error(`Engine Error: ${err.message}`);
  }
}

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'IG Worker is running', activeClients: igClients.size });
});

// API endpoint to connect a new account (trigger from Next.js dashboard)
app.post('/api/connect', async (req, res) => {
  const { accountId, username, password } = req.body;
  try {
    await initIgClient(accountId, username, password);
    res.json({ success: true, message: 'Account connected successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Run engine periodically (e.g. every minute)
setInterval(processAutomations, 10000); // 10 seconds for testing

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`IG Worker listening on port ${PORT}`);
  // processAutomations(); // run once on startup
});
