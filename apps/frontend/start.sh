#!/bin/bash
# Frontend start script for Render deployment
# This ensures the frontend Next.js server starts correctly

# We're already in /opt/render/project/src when this runs
# Navigate to frontend directory relative to current location
cd apps/frontend || exit 1

echo "Current directory: $(pwd)"
echo "PORT environment variable: ${PORT:-3000}"

# Check if standalone build exists
if [ -f ".next/standalone/server.js" ]; then
  echo "Starting Next.js standalone server on port ${PORT:-3000}..."
  cd .next/standalone
  PORT=${PORT:-3000} exec node server.js
else
  echo "Starting Next.js with next start on port ${PORT:-3000}..."
  exec npx next start -p ${PORT:-3000}
fi