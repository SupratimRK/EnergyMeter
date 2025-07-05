#!/bin/bash

# Energy Meter Dashboard Setup Script
# This script helps set up the React frontend for the Energy Meter Dashboard

echo "🔌 Energy Meter Dashboard - Frontend Setup"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm -v) is installed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "⚙️  Creating environment configuration..."
    cat > .env << EOF
# Energy Meter Dashboard Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/realtime/stream
VITE_APP_NAME=Energy Meter Dashboard
VITE_APP_VERSION=1.0.0
EOF
    echo "✅ Environment file created (.env)"
else
    echo "✅ Environment file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Ensure the backend server is running on http://localhost:3000"
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Open your browser and navigate to:"
echo "   http://localhost:3001"
echo ""
echo "📚 Additional commands:"
echo "   npm run build    - Build for production"
echo "   npm run preview  - Preview production build"
echo "   npm run lint     - Run code linting"
echo ""
echo "🔗 Useful links:"
echo "   Backend API: http://localhost:3000/health"
echo "   WebSocket Test: ws://localhost:3000/realtime/stream"
echo ""
echo "Happy coding! 🚀"
