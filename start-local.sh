#!/bin/bash

# Start both frontend and backend for local development

echo "🚀 Starting ReelPost locally..."

# Function to cleanup on exit
cleanup() {
    echo -e "\n🛑 Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set trap to cleanup on CTRL+C
trap cleanup INT

# Check and install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install
    cd ..
else
    echo "✅ Backend dependencies already installed"
fi

# Check and install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "🎨 Installing frontend dependencies..."
    cd frontend && npm install
    cd ..
else
    echo "✅ Frontend dependencies already installed"
fi

# Start backend server
echo "📦 Starting backend server..."
cd backend && npm start &
BACKEND_PID=$!

# Wait a bit for backend to initialize
sleep 3

# Start frontend dev server
echo "🎨 Starting frontend server..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo -e "\n✅ Services started!"
echo "📦 Backend: http://localhost:3000"
echo "🎨 Frontend: http://localhost:5173 (or check terminal output if port is different)"
echo -e "\nPress CTRL+C to stop all services"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID 