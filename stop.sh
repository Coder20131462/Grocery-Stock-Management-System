#!/bin/bash

echo "🛑 Stopping Grocery Store Stock Management System..."
echo "==================================================="

# Function to check if a port is in use
port_in_use() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    if port_in_use $1; then
        echo "🔄 Stopping process on port $1..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 1
        if port_in_use $1; then
            echo "⚠️  Process on port $1 may still be running"
        else
            echo "✅ Process on port $1 stopped"
        fi
    else
        echo "✅ No process running on port $1"
    fi
}

# Kill processes by PID if available
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    echo "🔄 Stopping backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null || true
    rm -f .backend.pid
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo "🔄 Stopping frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null || true
    rm -f .frontend.pid
fi

# Kill any remaining processes on ports
kill_port 8080
kill_port 3000
kill_port 3001

# Kill any remaining Spring Boot processes
echo "🔄 Checking for remaining Spring Boot processes..."
pkill -f "spring-boot:run" 2>/dev/null || true
pkill -f "maven" 2>/dev/null || true

# Kill any remaining npm processes
echo "🔄 Checking for remaining npm processes..."
pkill -f "npm start" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true

sleep 2

echo ""
echo "✅ All servers have been stopped!"
echo "📝 Log files preserved: backend.log, frontend.log"
echo "" 