
#!/bin/bash

echo "🚀 Setting up WhatsApp Web Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "🔧 Setting up backend environment..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "🔧 Please edit backend/.env file with your configuration"
fi
cd ..

echo "🏗️ Building frontend..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start the backend: cd backend && npm run dev"
echo "2. Start the frontend: npm run dev"
echo ""
echo "Or use Docker:"
echo "docker-compose up -d"
echo ""
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:5000"
echo ""
echo "📚 Check the README files for more information:"
echo "- Frontend: README.md"
echo "- Backend: backend/README.md"
