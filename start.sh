#!/bin/bash

echo "🛒 Grocery Store Stock Management System - Startup Script"
echo "========================================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    echo "🔄 Killing process on port $1..."
    lsof -ti:$1 | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists java; then
    echo "❌ Java is not installed. Please install Java 17 or higher."
    exit 1
fi

if ! command_exists mvn; then
    echo "❌ Maven is not installed. Please install Maven 3.6 or higher."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm 8 or higher."
    exit 1
fi

echo "✅ All prerequisites are installed!"

# Check Java version
JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "⚠️  Warning: Java version is $JAVA_VERSION. Java 17 or higher is recommended."
fi

# Kill existing processes on ports
if port_in_use 8080; then
    kill_port 8080
fi

if port_in_use 3000; then
    kill_port 3000
fi

if port_in_use 3001; then
    kill_port 3001
fi

# Start backend
echo "🚀 Starting backend server..."
cd backend

# Install dependencies if needed
if [ ! -d "target" ]; then
    echo "📦 Installing backend dependencies..."
    mvn clean install -q
fi

# Start backend in background
echo "🔄 Starting Spring Boot application on port 8080..."
mvn spring-boot:run > ../backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:8080/api/auth/signin >/dev/null 2>&1; then
        echo "✅ Backend is running on http://localhost:8080"
        break
    fi
    sleep 2
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start. Check backend.log for details."
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
done

# Start frontend
echo "🚀 Starting frontend server..."
cd ../frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend
echo "🔄 Starting React development server..."
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
for i in {1..20}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo "✅ Frontend is running on http://localhost:3000"
        FRONTEND_URL="http://localhost:3000"
        break
    elif curl -s http://localhost:3001 >/dev/null 2>&1; then
        echo "✅ Frontend is running on http://localhost:3001"
        FRONTEND_URL="http://localhost:3001"
        break
    fi
    sleep 3
    if [ $i -eq 20 ]; then
        echo "❌ Frontend failed to start. Check frontend.log for details."
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
        exit 1
    fi
done

# Success message
echo ""
echo "🎉 SUCCESS! Both servers are running:"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  http://localhost:8080"
echo "   Database: http://localhost:8080/h2-console"
echo ""
echo "🔑 Demo Accounts:"
echo "   Admin: username=admin, password=admin123"
echo "   User:  username=user, password=user123"
echo ""
echo "📝 Logs:"
echo "   Backend: backend.log"
echo "   Frontend: frontend.log"
echo ""
echo "🛑 To stop the servers, run: ./stop.sh"
echo ""

# Save PIDs for cleanup
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

# Keep script running
echo "✨ Application is ready! Press Ctrl+C to stop all servers."
trap 'echo ""; echo "🛑 Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .backend.pid .frontend.pid; echo "✅ All servers stopped."; exit 0' INT

# Wait for processes
wait 