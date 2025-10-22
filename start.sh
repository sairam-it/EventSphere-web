#!/bin/bash

# EventSphere Startup Script
echo "🚀 Starting EventSphere..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   brew services start mongodb-community"
    echo "   or"
    echo "   sudo systemctl start mongod"
    echo ""
    read -p "Press Enter to continue anyway..."
fi

# Check if .env file exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  No .env file found in server directory."
    echo "   Please copy .env.example to .env and configure it:"
    echo "   cp server/.env.example server/.env"
    echo "   Then edit server/.env with your configuration"
    echo ""
    read -p "Press Enter to continue anyway..."
fi

echo "📦 Installing dependencies..."

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
cd ..

echo "✅ Dependencies installed!"
echo ""
echo "🌐 Starting services..."
echo "   Server will run on: http://localhost:5003"
echo "   Client will run on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Start server in background
cd server
npm run dev &
SERVER_PID=$!
cd ..

# Start client
cd client
npm run dev &
CLIENT_PID=$!
cd ..

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    echo "✅ Services stopped!"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
