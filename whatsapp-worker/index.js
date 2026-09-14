require('dotenv').config({ path: '../.env.local' });
const express = require('express');
const cors = require('cors');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
  
  const authFolder = path.join(__dirname, 'auth_info', accountId);
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
      console.log(`Received QR for ${accountId}`);
      try {
        // Convert QR to Base64 image
        const qrDataUrl = await QRCode.toDataURL(qr);
        
        // Save QR to Supabase so frontend can display it
        await supabase
          .from('whatsapp_accounts')
          .update({ 
            qr_code_url: qrDataUrl,
            worker_status: 'pairing'
          })
          .eq('id', accountId);
          
      } catch (err) {
        console.error("Failed to generate QR data URL", err);
      }
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(`Connection closed for ${accountId}. Reconnecting: ${shouldReconnect}`);
      
      if (shouldReconnect) {
        startWhatsAppClient(accountId);
      } else {
        console.log(`Logged out of ${accountId}`);
        activeSockets.delete(accountId);
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
    console.log(`New message received on ${accountId}:`, JSON.stringify(m, null, 2));
    // We will hook this up to workflows later!
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
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// Restore previously connected sessions on boot
async function bootActiveSessions() {
  const { data } = await supabase
    .from('whatsapp_accounts')
    .select('id')
    .eq('worker_status', 'connected');
    
  if (data) {
    for (const acc of data) {
      console.log(`Restoring session for ${acc.id}`);
      startWhatsAppClient(acc.id).catch(console.error);
    }
  }
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`WhatsApp Worker running on port ${PORT}`);
  bootActiveSessions();
});
