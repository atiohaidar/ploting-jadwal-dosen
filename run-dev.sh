#!/bin/bash

# Script to run both frontend and backend simultaneously
# Usage: ./run-dev.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to cleanup background processes
cleanup() {
    print_warning "Stopping all services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_status "Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_status "Frontend stopped"
    fi
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the project root directory (containing backend/ and frontend/ folders)"
    exit 1
fi

print_status "Starting development environment..."
print_status "Project: Plotting Jadwal Dosen"
echo

# Setup Backend
print_status "Setting up Backend..."
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Installing backend dependencies..."
    npm install
fi

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Run database migrations
print_status "Running database migrations..."
npx prisma migrate deploy

print_status "Backend setup complete"
cd ..
echo

# Setup Frontend
print_status "Setting up Frontend..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Installing frontend dependencies..."
    npm install
fi

print_status "Frontend setup complete"
cd ..
echo

# Start Backend
print_status "Starting Backend (NestJS)..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..
print_status "Backend started with PID: $BACKEND_PID"
echo

# Wait a moment for backend to initialize
sleep 5

# Start Frontend
print_status "Starting Frontend (React + Vite)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..
print_status "Frontend started with PID: $FRONTEND_PID"
echo

print_status "Development servers are running!"
echo -e "${BLUE}Backend:${NC} http://localhost:3000 (or check console output for exact port)"
echo -e "${BLUE}Frontend:${NC} http://localhost:5173"
echo
print_warning "Press Ctrl+C to stop all services"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID