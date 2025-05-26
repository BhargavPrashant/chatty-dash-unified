// server.js
require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const multer        = require('multer');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode        = require('qrcode');
const sqlite3       = require('sqlite3').verbose();
const axios         = require('axios');
const bodyParser    = require('body-parser');
const { v4: uuidv4 }= require('uuid');
const path          = require('path');
const fs            = require('fs');

// Load env vars
const PORT                 = process.env.PORT || 5000;
const DB_PATH              = process.env.DB_PATH || './whatsapp.db';
const SESSION_PATH         = process.env.WHATSAPP_SESSION_PATH || './whatsapp-session';
const DEFAULT_WEBHOOK_URL  = process.env.DEFAULT_WEBHOOK_URL || '';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  index: false,
  extensions: ['jpg','png','pdf','mp4','mp3']
}));

// Ensure uploads exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 10*1024*1024 } });

// SQLite
const db = new sqlite3.Database(DB_PATH);
// ... create tables as before ...

// WhatsApp client
let client, qrCodeString = '', connectionStatus = 'disconnected', sessionData = null;

function initializeWhatsApp(){
  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'whatsapp-web-client', dataPath: SESSION_PATH }),
    puppeteer:    { headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] }
  });

  client.on('qr', async qr => {
    qrCodeString = await qrcode.toDataURL(qr);
    connectionStatus = 'connecting';
  });

  client.on('ready', () => {
    connectionStatus = 'connected';
    sessionData = { sessionId: uuidv4(), lastConnected: new Date().toISOString() };
  });

  client.on('disconnected', reason => {
    connectionStatus = 'disconnected';
    qrCodeString    = '';
    sessionData     = null;
  });

  // incoming and outgoing message handlers (as before),
  // logMessage(), logWebhookCall(), sendWebhookNotification() unchanged
  client.initialize();
}

setTimeout(initializeWhatsApp, 2000);

// --- Webhook receiver for external services ---
app.post('/webhook/whatsapp', async (req, res) => {
  await sendWebhookNotification({ type: 'external_event', payload: req.body });
  res.sendStatus(200);
});

// --- API routes (connection, send-message, send-media, logs, webhook config) ---
// same as before, but sendWebhookNotification now uses DEFAULT_WEBHOOK_URL fallback:

async function sendWebhookNotification(data){
  // get from DB
  db.get('SELECT webhook_url FROM webhook_config WHERE is_active=1 LIMIT 1', async (err,row)=>{
    const webhookUrl = row?.webhook_url || DEFAULT_WEBHOOK_URL;
    if(!webhookUrl) return;
    const logId = uuidv4(), ts = new Date().toISOString();
    try {
      const response = await axios.post(webhookUrl, data, { headers:{'Content-Type':'application/json'}, timeout:10000 });
      await logWebhookCall({ id:logId, timestamp:ts, method:'POST', endpoint:webhookUrl, status:response.status, source:'whatsapp-server', payload:data, response:response.data });
    } catch(e) {
      await logWebhookCall({ id:logId, timestamp:ts, method:'POST', endpoint:webhookUrl, status:e.response?.status||500, source:'whatsapp-server', payload:data, response:{error:e.message} });
    }
  });
}

// ... rest of your API routes unchanged ...

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`External webhook endpoint: http://localhost:${PORT}/webhook/whatsapp`);
});
