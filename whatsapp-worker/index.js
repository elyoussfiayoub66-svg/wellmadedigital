require('dotenv').config({ path: '../.env.local' });
const express = require('express');
const cors = require('cors');
const { makeWASocket, useMultiFileAuthState, DisconnectReason, getAggregateVotesInPollMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const { initWorkflowEngine, resumeWorkflowFromInteractive } = require('./engine');
const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// Store active sockets
const activeSockets = new Map();

async function startWhatsAppClient(accountId) {
  console.log(`Starting WhatsApp client for account: ${accountId}`);
  
  // Point to the persistent disk mounted at /opt/render/project/src/auth_info
  const authFolder = path.join(__dirname, '..', 'auth_info', accountId);
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // Also print to terminal for debugging
    logger: pino({ level: 'silent' }), // Suppress verbose logs
    browser: ['WebGo Builder CRM', 'Chrome', '1.0.0']
  });

  activeSockets.set(accountId, sock);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(`Received QR for ${accountId}. Converting to DataURL...`);
      try {
        // Convert QR to Base64 image
        const qrDataUrl = await QRCode.toDataURL(qr);
        console.log(`Successfully converted QR. Updating Supabase...`);
        
        // Save QR to Supabase so frontend can display it
        const { error: updateErr } = await supabase
          .from('whatsapp_accounts')
          .update({ 
            qr_code_url: qrDataUrl,
            worker_status: 'pairing'
          })
          .eq('id', accountId);
          
        if (updateErr) {
          console.error("Supabase QR update failed:", updateErr);
        } else {
          console.log("Supabase QR updated successfully!");
        }
          
      } catch (err) {
        console.error("Failed to generate QR data URL", err);
      }
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(`Connection closed for ${accountId}. Reconnecting: ${shouldReconnect}`);
      
      activeSockets.delete(accountId);

      if (shouldReconnect) {
        setTimeout(() => startWhatsAppClient(accountId), 5000); // 5 sec delay
      } else {
        console.log(`Logged out of ${accountId}`);
        await supabase
          .from('whatsapp_accounts')
          .update({ worker_status: 'disconnected', qr_code_url: null })
          .eq('id', accountId);
          
        // Cleanup auth folder
        fs.rmSync(authFolder, { recursive: true, force: true });
      }
    }

    if (connection === 'open') {
      console.log(`Connected successfully for ${accountId}!`);
      
      // Try to get phone number
      const phoneId = sock.user?.id?.split(':')[0] || sock.user?.id?.split('@')[0] || 'Unknown';
      
      await supabase
        .from('whatsapp_accounts')
        .update({ 
          worker_status: 'connected', 
          qr_code_url: null,
          phone_number: '+' + phoneId
        })
        .eq('id', accountId);
    }
  });

  // Listen for incoming messages (to trigger workflows later)
  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg || !msg.message || msg.key.fromMe) return;

      const senderJid = msg.key.remoteJid;
      const phone = senderJid.split('@')[0];
      
      let incomingText = '';
      const cleanDigits = phone.replace(/[^0-9]/g, '');
      const last9 = cleanDigits.slice(-9);

      let targetLeadId = null;

      // 1. Handle Poll Vote
      if (msg.message.pollUpdateMessage) {
        console.log(`Received poll vote from ${phone}, parsing...`);
        const pollCreationMessageKey = msg.message.pollUpdateMessage.pollCreationMessageKey;
        
        // Find the exact pending interaction by message_id
        const { data: pollMemory } = await supabase
          .from('pending_interactions')
          .select('*')
          .eq('message_id', pollCreationMessageKey.id)
          .single();
          
        if (pollMemory) {
          targetLeadId = pollMemory.lead_id;

          if (pollMemory.message_json) {
            const originalMessage = {
              key: pollCreationMessageKey,
              message: pollMemory.message_json
            };
            
            try {
              // Decrypt the vote!
              const votes = getAggregateVotesInPollMessage({
                message: originalMessage,
                pollUpdates: [msg]
              });
              
              const selectedOption = votes.find(v => v.voters.length > 0);
              if (selectedOption) {
                incomingText = selectedOption.name;
                console.log(`Poll vote decrypted! User selected: ${incomingText}`);
              }
            } catch (decodeErr) {
              console.error("Failed to decrypt poll vote:", decodeErr);
            }
          }
        }
      }

      // 2. Extract text from standard message
      if (!incomingText) {
        if (msg.message.conversation) incomingText = msg.message.conversation;
        else if (msg.message.extendedTextMessage?.text) incomingText = msg.message.extendedTextMessage.text;
      }
      
      if (!incomingText) return;
      
      console.log(`Incoming text/vote from ${phone}: ${incomingText}`);

      // 3. Find lead if not already found from poll memory
      if (!targetLeadId) {
        const { data: leads } = await supabase
          .from('leads')
          .select('id')
          .or(`phone.like.%${cleanDigits}%,phone.like.%${last9}%`)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (leads && leads.length > 0) {
          targetLeadId = leads[0].id;
        }
      }

      if (!targetLeadId) return;

      // Check if this lead has a pending interaction
      const { data: pendingInt } = await supabase
        .from('pending_interactions')
        .select('*')
        .eq('lead_id', targetLeadId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (pendingInt) {
        console.log(`Found pending interaction for lead ${lead.id} at node ${pendingInt.node_id}`);
        // Delete the memory record so they don't get stuck
        await supabase.from('pending_interactions').delete().eq('id', pendingInt.id);
        
        // Resume the engine
        await resumeWorkflowFromInteractive(pendingInt, incomingText.trim());
      }
      
    } catch (err) {
      console.error('Error processing incoming message:', err);
    }
  });
}

app.post('/api/whatsapp/start', async (req, res) => {
  const { accountId } = req.body;
  if (!accountId) return res.status(400).json({ error: 'Missing accountId' });

  if (activeSockets.has(accountId)) {
    return res.json({ success: true, message: 'Worker already running for this account' });
  }

  // Start the background process without awaiting its full connection
  startWhatsAppClient(accountId).catch(console.error);

  res.json({ success: true, message: 'Worker initialized and generating QR...' });
});

app.post('/api/whatsapp/stop', async (req, res) => {
  const { accountId } = req.body;
  
  const sock = activeSockets.get(accountId);
  if (sock) {
    sock.logout();
    activeSockets.delete(accountId);
  }
  
  res.json({ success: true });
});

// Health check endpoint for Render

const { triggerWorkflows } = require('./engine');
app.post('/api/webhook/lead', async (req, res) => {
  const lead = req.body.lead;
  if (lead) {
    console.log('Webhook: Received new lead ->', lead.id);
    triggerWorkflows('New Lead Created', { lead });
  }
  res.json({ success: true });
});
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// Restore previously connected sessions on boot
async function bootActiveSessions() {
  const { data } = await supabase
    .from('whatsapp_accounts')
    .select('id, token, expires_at')
    .eq('worker_status', 'connected');
    
  if (data) {
    for (const acc of data) {
      if (!acc.token) {
        console.log(`Skipping unconfigured account ${acc.id} (missing token)`);
        continue;
      }
      
      if (acc.expires_at && new Date(acc.expires_at) < new Date()) {
        console.log(`Skipping expired account ${acc.id}`);
        continue;
      }
      
      console.log(`Restoring session for ${acc.id}`);
      startWhatsAppClient(acc.id).catch(console.error);
    }
  }
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`WhatsApp Worker running on port ${PORT}`);
  bootActiveSessions();
  initWorkflowEngine(activeSockets);
});


