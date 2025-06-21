#!/bin/bash

echo "🔥 Installing Fire Department BP Management System..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment
if [ ! -f .env ]; then
    echo "📝 Creating environment configuration..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database settings"
fi

# Create logs directory
mkdir -p logs

echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Setup your database (PostgreSQL or SQLite)"
echo "3. Run: npm run build"
echo "4. Run: npm start"
echo ""
echo "For detailed instructions, see README.md"
