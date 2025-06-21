#!/bin/bash

# Fire Department BP Management System - Standalone Deployment Script
# This script creates a complete deployment package

set -e

echo "🔥 Fire Department BP Management - Standalone Deployment Package Creator"
echo "=================================================================="

# Create deployment directory
DEPLOY_DIR="fire-department-bp-standalone"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

echo "📁 Creating deployment structure..."

# Copy essential application files
cp -r client $DEPLOY_DIR/
cp -r server $DEPLOY_DIR/
cp -r shared $DEPLOY_DIR/

# Copy configuration files
cp package-standalone.json $DEPLOY_DIR/package.json
cp tsconfig.json $DEPLOY_DIR/
cp tsconfig.server.json $DEPLOY_DIR/
cp vite.config.ts $DEPLOY_DIR/
cp tailwind.config.ts $DEPLOY_DIR/
cp postcss.config.js $DEPLOY_DIR/
cp components.json $DEPLOY_DIR/

# Copy deployment files
cp Dockerfile $DEPLOY_DIR/
cp docker-compose.yml $DEPLOY_DIR/
cp ecosystem.config.js $DEPLOY_DIR/
cp nginx.conf $DEPLOY_DIR/
cp STANDALONE_DEPLOYMENT.md $DEPLOY_DIR/README.md

echo "⚙️ Creating environment template..."
cat > $DEPLOY_DIR/.env.example << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/bp_management
# For SQLite: DATABASE_URL=sqlite:./bp_management.db

# Server Configuration
PORT=5000
NODE_ENV=production

# Security (CHANGE IN PRODUCTION)
SESSION_SECRET=change-this-secret-key-in-production-environment

# Optional: External Services
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
EOF

echo "🛠️ Creating database initialization script..."
cat > $DEPLOY_DIR/init.sql << 'EOF'
-- Fire Department BP Management Database Initialization
CREATE DATABASE IF NOT EXISTS bp_management;
CREATE USER IF NOT EXISTS bp_user WITH PASSWORD 'bp_password';
GRANT ALL PRIVILEGES ON DATABASE bp_management TO bp_user;
EOF

echo "📋 Creating installation script..."
cat > $DEPLOY_DIR/install.sh << 'EOF'
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
EOF

chmod +x $DEPLOY_DIR/install.sh

echo "🚀 Creating quick start script..."
cat > $DEPLOY_DIR/quick-start.sh << 'EOF'
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
EOF

chmod +x $DEPLOY_DIR/quick-start.sh

echo "📱 Creating systemd service file..."
cat > $DEPLOY_DIR/bp-management.service << 'EOF'
[Unit]
Description=Fire Department BP Management System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/bp-management
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

echo "📚 Creating comprehensive README..."
cat > $DEPLOY_DIR/QUICK_START.md << 'EOF'
# Quick Start Guide

## Fastest Setup (SQLite)
```bash
chmod +x quick-start.sh
./quick-start.sh
```

## Standard Setup
```bash
chmod +x install.sh
./install.sh
cp .env.example .env
# Edit .env with your settings
npm run build
npm start
```

## Docker Setup
```bash
docker-compose up -d
```

## Access
- Application: http://localhost:5000
- Default login: admin/admin123

## Features
- Patient management with union filtering
- Blood pressure monitoring and categorization
- Call center with follow-up tracking
- Analytics and reporting
- Role-based access (admin/nurse/coach)
- Export capabilities
EOF

echo "🗜️ Creating deployment archive..."
tar -czf fire-department-bp-standalone.tar.gz $DEPLOY_DIR

echo ""
echo "✅ Standalone deployment package created successfully!"
echo ""
echo "📦 Package: fire-department-bp-standalone.tar.gz"
echo "📁 Directory: $DEPLOY_DIR/"
echo ""
echo "To deploy:"
echo "1. Transfer fire-department-bp-standalone.tar.gz to your server"
echo "2. Extract: tar -xzf fire-department-bp-standalone.tar.gz"
echo "3. Run: cd $DEPLOY_DIR && ./install.sh"
echo ""
echo "🔥 Your Fire Department BP Management System is ready for deployment!"