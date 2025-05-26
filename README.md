
# WhatsApp Web Dashboard

A complete full-stack application for managing WhatsApp Web automation with webhook support for real-time message notifications.

## Features

### Frontend (React + TypeScript)
- Modern responsive dashboard built with React and Tailwind CSS
- Real-time connection status monitoring
- QR code display for WhatsApp Web authentication
- Message sending interface with phone number validation
- Media file upload and sending (images, videos, audio, documents)
- Message logs with search and filtering
- Webhook configuration and testing
- Webhook logs monitoring
- Dashboard statistics and analytics

### Backend (Node.js + Express)
- WhatsApp Web.js integration for message handling
- QR code generation for authentication
- RESTful API endpoints
- SQLite database for message and webhook logs
- Media file handling with 10MB size limit
- Webhook notifications for incoming messages
- Real-time message processing
- Connection status management

### Webhook Features
- Configure custom webhook URLs
- Real-time message notifications
- Media file transfer support
- Test webhook functionality
- Comprehensive webhook logs
- Secure payload delivery

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Chrome/Chromium (for WhatsApp Web.js)

### Installation

1. **Clone and setup:**
```bash
git clone <repository-url>
cd whatsapp-web-dashboard
chmod +x setup.sh
./setup.sh
```

2. **Start the backend:**
```bash
cd backend
npm run dev
```

3. **Start the frontend (in another terminal):**
```bash
npm run dev
```

4. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Docker Deployment

For production deployment with Docker:

```bash
docker-compose up -d
```

## Configuration

### Backend Environment Variables
Copy `backend/.env.example` to `backend/.env` and configure:

```env
PORT=5000
NODE_ENV=development
DB_PATH=./whatsapp.db
WHATSAPP_SESSION_PATH=./whatsapp-session
DEFAULT_WEBHOOK_URL=https://your-webhook-endpoint.com/webhook
```

### Webhook Configuration
1. Deploy your webhook endpoint that accepts POST requests
2. Go to "Webhook Config" tab in the dashboard
3. Enter your webhook URL and click "Configure"
4. Test the webhook using the "Send Test Event" button

## API Documentation

### Connection Management
- `GET /api/connection/status` - Get connection status
- `POST /api/connection/connect` - Connect to WhatsApp Web
- `POST /api/connection/disconnect` - Disconnect
- `POST /api/connection/qr-code` - Get QR code

### Messaging
- `POST /api/send-message` - Send text message
- `POST /api/send-media` - Send media file
- `GET /api/messages/logs` - Get message logs
- `DELETE /api/messages/logs` - Clear logs

### Webhook Management
- `GET /api/webhook/logs` - Get webhook logs
- `DELETE /api/webhook/logs` - Clear webhook logs
- `GET /api/webhook/info` - Get webhook configuration
- `POST /api/webhook/configure` - Configure webhook URL
- `POST /api/webhook/test` - Send test webhook

### Dashboard
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/health` - Health check

## Webhook Payload

When a message is received, your webhook will receive:

```json
{
  "type": "message_received",
  "message": {
    "id": "message_id_123",
    "from": "+1234567890@c.us",
    "body": "Hello, this is a test message",
    "timestamp": 1234567890,
    "hasMedia": false,
    "mediaType": null,
    "mediaPath": null
  }
}
```

## Supported Media Types

- **Images:** JPG, PNG, GIF, WebP
- **Videos:** MP4, AVI, MOV
- **Audio:** MP3, WAV, OGG
- **Documents:** PDF, DOC, DOCX, TXT

Maximum file size: 10MB

## Development

### Project Structure
```
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks
│   ├── services/          # API services
│   └── pages/             # Route pages
├── backend/               # Backend Node.js app
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies
│   └── uploads/          # Media file storage
├── docker-compose.yml    # Docker configuration
└── README.md            # This file
```

### Adding New Features
1. **Frontend:** Add components in `src/components/`
2. **Backend:** Add routes in `backend/server.js`
3. **API:** Update `src/services/api.ts` for new endpoints

## Security Considerations

- Validate all incoming webhook requests
- Implement rate limiting for API endpoints
- Use HTTPS in production
- Sanitize file uploads
- Implement proper authentication for production use

## Troubleshooting

### Common Issues

**WhatsApp won't connect:**
- Ensure Chrome/Chromium is installed
- Check if port 5000 is available
- Try deleting `.wwebjs_auth` folder and reconnecting

**Webhook not receiving data:**
- Verify webhook URL is accessible from the internet
- Check webhook logs for error details
- Test webhook endpoint manually

**File upload fails:**
- Check file size (max 10MB)
- Verify file type is supported
- Ensure uploads directory has write permissions

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check webhook logs for errors
4. Ensure all dependencies are properly installed
