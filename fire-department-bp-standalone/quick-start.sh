#!/bin/bash

echo "🔥 Quick Start - Fire Department BP Management"

# Use SQLite for quick setup
export DATABASE_URL="sqlite:./bp_management.db"
export NODE_ENV="development"
export SESSION_SECRET="dev-secret-key"

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building application..."
npm run build

echo "🚀 Starting server..."
echo "Access the application at: http://localhost:5000"
echo "Press Ctrl+C to stop"
npm start
