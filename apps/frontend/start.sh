#!/bin/bash
# Frontend start script for Render deployment
# This ensures the frontend Next.js server starts correctly

# Navigate to the frontend directory
cd /opt/render/project/src/apps/frontend

# Check if standalone build exists
if [ -f ".next/standalone/apps/frontend/server.js" ]; then
  echo "Starting Next.js standalone server..."
  cd .next/standalone/apps/frontend
  exec node server.js
else
  echo "Starting Next.js with next start..."
  exec node node_modules/.bin/next start -p ${PORT:-3000}
fi