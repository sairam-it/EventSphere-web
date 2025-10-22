#!/bin/bash

echo "🚀 Starting EventSphere..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   brew services start mongodb-community"
    echo "   or"
    echo "   sudo systemctl start mongod"
    echo ""
fi

# Check if .env file exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  No .env file found in server directory."
    echo "   Creating .env file with default values..."
    echo "PORT=5003
MONGO_URI=mongodb://localhost:27017/eventsphere
JWT_SECRET=your_super_secret_jwt_key_here_$(date +%s)
NODE_ENV=development" > server/.env
    echo "✅ Created server/.env file"
fi

echo "📦 Installing dependencies if needed..."

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install --silent
cd ..

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install --silent
cd ..

echo "✅ Dependencies ready!"
echo ""
echo "🌐 Starting services..."
echo "   Server: http://localhost:5003"
echo "   Client: http://localhost:5173"
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
