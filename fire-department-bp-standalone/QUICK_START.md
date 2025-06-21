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
