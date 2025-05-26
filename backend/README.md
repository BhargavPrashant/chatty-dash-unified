
# WhatsApp Web Backend

This is the backend server for the WhatsApp Web Dashboard application.

## Features

- WhatsApp Web.js integration
- QR code generation for authentication
- Message sending and receiving
- Media file support (images, videos, audio, documents)
- Webhook notifications for incoming messages
- SQLite database for message and webhook logs
- RESTful API endpoints
- Real-time connection status

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start the server:
```bash
npm run dev
```

The server will start on http://localhost:5000

## API Endpoints

### Connection Management
- `GET /api/connection/status` - Get connection status
- `POST /api/connection/connect` - Connect to WhatsApp Web
- `POST /api/connection/disconnect` - Disconnect from WhatsApp Web
- `POST /api/connection/qr-code` - Get QR code for authentication

### Messaging
- `POST /api/send-message` - Send text message
- `POST /api/send-media` - Send media file with optional caption
- `GET /api/messages/logs` - Get message logs
- `DELETE /api/messages/logs` - Clear message logs

### Webhook Management
- `GET /api/webhook/logs` - Get webhook logs
- `DELETE /api/webhook/logs` - Clear webhook logs
- `GET /api/webhook/info` - Get current webhook configuration
- `POST /api/webhook/configure` - Configure webhook URL
- `POST /api/webhook/test` - Send test webhook

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/health` - Health check endpoint

## Webhook Configuration

The server can send webhook notifications to your specified endpoint when:
- New messages are received
- Message status updates occur
- Media files are received

Configure your webhook URL through the API or frontend interface.

## Media File Support

Supported file types:
- Images: JPG, PNG, GIF, WebP
- Videos: MP4, AVI, MOV
- Audio: MP3, WAV, OGG
- Documents: PDF, DOC, DOCX, TXT

Maximum file size: 10MB
