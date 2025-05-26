
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Initialize SQLite database
const db = new sqlite3.Database('whatsapp.db');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS message_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT,
    type TEXT,
    phone_number TEXT,
    content TEXT,
    status TEXT,
    media_type TEXT,
    media_path TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS webhook_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT,
    method TEXT,
    endpoint TEXT,
    status INTEGER,
    source TEXT,
    payload TEXT,
    response TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS webhook_config (
    id INTEGER PRIMARY KEY,
    webhook_url TEXT,
    is_active INTEGER DEFAULT 1
  )`);
});

// WhatsApp client setup
let client;
let qrCodeString = '';
let connectionStatus = 'disconnected';
let sessionData = null;

const initializeWhatsApp = () => {
  client = new Client({
    authStrategy: new LocalAuth({
      clientId: "whatsapp-web-client"
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', async (qr) => {
    console.log('QR Code received');
    qrCodeString = await qrcode.toDataURL(qr);
    connectionStatus = 'connecting';
  });

  client.on('ready', () => {
    console.log('WhatsApp Web client is ready!');
    connectionStatus = 'connected';
    sessionData = {
      sessionId: uuidv4(),
      lastConnected: new Date().toISOString()
    };
  });

  client.on('disconnected', (reason) => {
    console.log('WhatsApp Web client disconnected:', reason);
    connectionStatus = 'disconnected';
    qrCodeString = '';
    sessionData = null;
  });

  client.on('message_create', async (message) => {
    if (message.fromMe) {
      // Log sent message
      await logMessage({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'sent',
        phoneNumber: message.to,
        content: message.body,
        status: 'delivered',
        mediaType: message.hasMedia ? 'unknown' : null
      });
    }
  });

  client.on('message', async (message) => {
    console.log('Received message:', message.body);
    
    // Log received message
    const messageLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'received',
      phoneNumber: message.from,
      content: message.body,
      status: 'delivered',
      mediaType: null,
      mediaPath: null
    };

    // Handle media
    if (message.hasMedia) {
      try {
        const media = await message.downloadMedia();
        const fileName = `received-${Date.now()}-${message.id.id}.${media.mimetype.split('/')[1]}`;
        const filePath = path.join('uploads', fileName);
        
        fs.writeFileSync(filePath, media.data, 'base64');
        messageLog.mediaType = media.mimetype.split('/')[0];
        messageLog.mediaPath = filePath;
      } catch (error) {
        console.error('Error downloading media:', error);
      }
    }

    await logMessage(messageLog);

    // Send webhook notification
    await sendWebhookNotification({
      type: 'message_received',
      message: {
        id: message.id.id,
        from: message.from,
        body: message.body,
        timestamp: message.timestamp,
        hasMedia: message.hasMedia,
        mediaType: messageLog.mediaType,
        mediaPath: messageLog.mediaPath
      }
    });
  });

  client.initialize();
};

// Helper functions
const logMessage = (messageData) => {
  return new Promise((resolve, reject) => {
    const { id, timestamp, type, phoneNumber, content, status, mediaType, mediaPath } = messageData;
    db.run(
      `INSERT INTO message_logs (id, timestamp, type, phone_number, content, status, media_type, media_path) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, timestamp, type, phoneNumber, content, status, mediaType, mediaPath],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

const logWebhookCall = (webhookData) => {
  return new Promise((resolve, reject) => {
    const { id, timestamp, method, endpoint, status, source, payload, response } = webhookData;
    db.run(
      `INSERT INTO webhook_logs (id, timestamp, method, endpoint, status, source, payload, response) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, timestamp, method, endpoint, status, source, JSON.stringify(payload), JSON.stringify(response)],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

const sendWebhookNotification = async (data) => {
  return new Promise((resolve) => {
    db.get('SELECT webhook_url FROM webhook_config WHERE is_active = 1 LIMIT 1', async (err, row) => {
      if (err || !row || !row.webhook_url) {
        console.log('No active webhook URL configured');
        resolve();
        return;
      }

      const webhookLogId = uuidv4();
      const timestamp = new Date().toISOString();

      try {
        const response = await axios.post(row.webhook_url, data, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'WhatsApp-Webhook/1.0'
          },
          timeout: 10000
        });

        await logWebhookCall({
          id: webhookLogId,
          timestamp,
          method: 'POST',
          endpoint: row.webhook_url,
          status: response.status,
          source: 'whatsapp-server',
          payload: data,
          response: response.data
        });

        console.log('Webhook notification sent successfully');
      } catch (error) {
        await logWebhookCall({
          id: webhookLogId,
          timestamp,
          method: 'POST',
          endpoint: row.webhook_url,
          status: error.response?.status || 500,
          source: 'whatsapp-server',
          payload: data,
          response: { error: error.message }
        });

        console.error('Failed to send webhook notification:', error.message);
      }

      resolve();
    });
  });
};

// API Routes

// Connection Management
app.get('/api/connection/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: connectionStatus,
      sessionId: sessionData?.sessionId,
      lastConnected: sessionData?.lastConnected
    }
  });
});

app.post('/api/connection/connect', async (req, res) => {
  try {
    if (connectionStatus === 'disconnected') {
      initializeWhatsApp();
    }
    
    res.json({
      success: true,
      data: {
        qrCode: qrCodeString,
        status: connectionStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/connection/disconnect', async (req, res) => {
  try {
    if (client) {
      await client.destroy();
    }
    connectionStatus = 'disconnected';
    qrCodeString = '';
    sessionData = null;
    
    res.json({
      success: true,
      message: 'Disconnected successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/connection/qr-code', (req, res) => {
  res.json({
    success: true,
    data: {
      qrCode: qrCodeString
    }
  });
});

// Message API
app.post('/api/send-message', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!client || connectionStatus !== 'connected') {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp client not connected'
      });
    }

    const chatId = phoneNumber.includes('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;
    const sentMessage = await client.sendMessage(chatId, message);
    
    const messageLog = {
      id: sentMessage.id.id,
      timestamp: new Date().toISOString(),
      type: 'sent',
      phoneNumber: phoneNumber,
      content: message,
      status: 'delivered',
      mediaType: null
    };

    await logMessage(messageLog);

    res.json({
      success: true,
      data: {
        messageId: sentMessage.id.id
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/send-media', upload.single('media'), async (req, res) => {
  try {
    const { phoneNumber, caption } = req.body;
    const file = req.file;
    
    if (!client || connectionStatus !== 'connected') {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp client not connected'
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No media file provided'
      });
    }

    const media = MessageMedia.fromFilePath(file.path);
    const chatId = phoneNumber.includes('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;
    
    const sentMessage = await client.sendMessage(chatId, media, { caption });
    
    const messageLog = {
      id: sentMessage.id.id,
      timestamp: new Date().toISOString(),
      type: 'sent',
      phoneNumber: phoneNumber,
      content: caption || `Media file: ${file.originalname}`,
      status: 'delivered',
      mediaType: file.mimetype.split('/')[0],
      mediaPath: file.path
    };

    await logMessage(messageLog);

    res.json({
      success: true,
      data: {
        messageId: sentMessage.id.id
      }
    });
  } catch (error) {
    console.error('Error sending media:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Message Logs API
app.get('/api/messages/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  db.all(
    'SELECT * FROM message_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?',
    [limit, offset],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }
      
      res.json({
        success: true,
        data: rows
      });
    }
  );
});

app.delete('/api/messages/logs', (req, res) => {
  db.run('DELETE FROM message_logs', (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
    
    res.json({
      success: true,
      message: 'Message logs cleared'
    });
  });
});

// Webhook API
app.get('/api/webhook/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  db.all(
    'SELECT * FROM webhook_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?',
    [limit, offset],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }
      
      const formattedRows = rows.map(row => ({
        ...row,
        payload: JSON.parse(row.payload),
        response: JSON.parse(row.response)
      }));
      
      res.json({
        success: true,
        data: formattedRows
      });
    }
  );
});

app.delete('/api/webhook/logs', (req, res) => {
  db.run('DELETE FROM webhook_logs', (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
    
    res.json({
      success: true,
      message: 'Webhook logs cleared'
    });
  });
});

app.get('/api/webhook/info', (req, res) => {
  db.get('SELECT webhook_url, is_active FROM webhook_config WHERE is_active = 1 LIMIT 1', (err, row) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
    
    res.json({
      success: true,
      data: {
        endpoint: row?.webhook_url || '',
        status: row?.is_active ? 'active' : 'inactive'
      }
    });
  });
});

app.post('/api/webhook/configure', (req, res) => {
  const { webhookUrl } = req.body;
  
  if (!webhookUrl) {
    return res.status(400).json({
      success: false,
      error: 'Webhook URL is required'
    });
  }
  
  // Clear existing webhook configs and add new one
  db.serialize(() => {
    db.run('DELETE FROM webhook_config');
    db.run('INSERT INTO webhook_config (webhook_url, is_active) VALUES (?, 1)', [webhookUrl], (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }
      
      res.json({
        success: true,
        message: 'Webhook configured successfully'
      });
    });
  });
});

app.post('/api/webhook/test', async (req, res) => {
  const testData = {
    type: 'webhook_test',
    timestamp: new Date().toISOString(),
    test: true,
    message: 'This is a test webhook event from WhatsApp Web Dashboard'
  };

  await sendWebhookNotification(testData);
  
  res.json({
    success: true,
    message: 'Test webhook sent'
  });
});

// Dashboard Stats API
app.get('/api/dashboard/stats', (req, res) => {
  const queries = [
    new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM message_logs WHERE type = 'sent'", (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM message_logs WHERE type = 'received'", (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM message_logs WHERE media_type IS NOT NULL", (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM webhook_logs", (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    })
  ];

  Promise.all(queries)
    .then(([messagesSent, messagesReceived, mediaFilesSent, webhookEvents]) => {
      res.json({
        success: true,
        data: {
          messagesSent,
          messagesReceived,
          mediaFilesSent,
          webhookEvents,
          uptime: process.uptime(),
          lastActivity: new Date().toISOString()
        }
      });
    })
    .catch(error => {
      res.status(500).json({
        success: false,
        error: error.message
      });
    });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime()
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook endpoint available at: http://localhost:${PORT}/webhook/whatsapp`);
});

// Initialize WhatsApp on startup
setTimeout(() => {
  console.log('Initializing WhatsApp Web client...');
  initializeWhatsApp();
}, 2000);
