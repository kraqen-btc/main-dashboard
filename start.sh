#!/bin/bash

cd "$(dirname "$0")"

echo "Backend baslatiliyor..."
node server/index.js &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

sleep 2

echo "Frontend baslatiliyor..."
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "=== Servisler baslatildi ==="
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""
echo "Durdurmak icin: ./stop.sh"
