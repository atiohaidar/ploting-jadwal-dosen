# Development Setup

This project consists of a NestJS backend and a React frontend. Use the provided script to run both services simultaneously.

## Quick Start

```bash
# Make sure you're in the project root directory
cd /workspaces/ploting-jadwal-dosen

# Run the development script
./run-dev.sh
```

## What the script does

1. **Backend Setup**:
   - Installs dependencies (if needed)
   - Generates Prisma client
   - Runs database migrations

2. **Frontend Setup**:
   - Installs dependencies (if needed)

3. **Starts Services**:
   - Backend: `npm run start:dev` (NestJS with watch mode)
   - Frontend: `npm run dev` (Vite development server)

## URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000 (check console output for exact port)

## Stopping Services

Press `Ctrl+C` in the terminal where the script is running to stop both services gracefully.

## Manual Setup (Alternative)

If you prefer to run services manually:

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```