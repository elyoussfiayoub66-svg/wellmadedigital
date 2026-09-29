require('dotenv').config();
const express = require('express');
const { IgApiClient } = require('instagram-private-api');
const { createClient } = require('@supabase/supabase-js');
const pino = require('pino');

const logger = pino({ transport: { target: 'pino-pretty' } });
const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_KEY || 'placeholder'
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

// Engine to process active automations
async function processAutomations() {
  try {
    logger.info('Checking for active automations...');
    // 1. Fetch active automations from Supabase
    // const { data: automations } = await supabase.from('dm_automations').select('*').eq('status', 'active');
    
    // Fake automation for demonstration
    const activeAutomations = []; 
    
    for (const auto of activeAutomations) {
      // Logic for each automation:
      // - Get pending leads for this automation
      // - Check if it's time to send based on `delay_between_dms`
      // - Get the IG client
      // - Send DM
      // - Update analytics and status
      logger.info(`Processing automation: ${auto.name}`);
      
      // Example sending flow:
      /*
      const ig = igClients.get(auto.ig_account_id);
      if (!ig) continue;

      const userId = await ig.user.getIdByUsername(prospect.ig_handle);
      const thread = ig.entity.directThread([userId.toString()]);
      const finalMessage = parseMessage(auto.message_template, prospect);
      
      await thread.broadcastText(finalMessage);
      logger.info(`Sent DM to ${prospect.ig_handle}`);
      
      // Implement delay...
      await delay(auto.delay_between_dms * 60 * 1000);
      */
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
setInterval(processAutomations, 60000);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`IG Worker listening on port ${PORT}`);
  // processAutomations(); // run once on startup
});
