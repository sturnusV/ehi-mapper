#!/bin/sh

# Start the backend server
echo "🚀 Starting EHI Mapper Backend..."
node dist/app.js &

# Wait a moment for backend to start
sleep 5

# Serve the frontend static files (simple HTTP server)
echo "🌐 Serving Frontend..."
cd /app/client/dist
npx serve -s -l 3000 &

# Keep the container running
wait