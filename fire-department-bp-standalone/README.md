# Fire Department BP Management System - Standalone Deployment

## Overview
This is a complete standalone version of the Fire Department Blood Pressure Management System that can be deployed on any server or run locally without Replit dependencies.

## System Requirements
- Node.js 18+ 
- npm or yarn
- PostgreSQL 12+ (optional, can use SQLite)
- 2GB RAM minimum
- 10GB disk space

## Installation Instructions

### 1. Download and Extract
```bash
# Extract the deployment package
tar -xzf fire-department-bp-standalone.tar.gz
cd fire-department-bp-standalone
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/bp_management
# For SQLite (simpler setup):
# DATABASE_URL=sqlite:./bp_management.db

# Server Configuration
PORT=5000
NODE_ENV=production

# Security
SESSION_SECRET=your-secret-key-here-change-this-in-production
```

### 4. Database Setup

#### Option A: PostgreSQL (Recommended for Production)
```bash
# Install PostgreSQL and create database
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb bp_management
sudo -u postgres createuser --createdb bp_user
sudo -u postgres psql -c "ALTER USER bp_user PASSWORD 'your_password';"

# Run database migrations
npm run db:migrate
```

#### Option B: SQLite (Easier Setup)
```bash
# SQLite database will be created automatically
npm run db:migrate
```

### 5. Build and Start
```bash
# Build the application
npm run build

# Start in production mode
npm start

# Or for development
npm run dev
```

### 6. Access the Application
Open your browser to: `http://localhost:5000`

## Default Login Credentials
- **Admin**: username: `admin`, password: `admin123`
- **Nurse**: username: `nurse`, password: `nurse123`  
- **Coach**: username: `coach`, password: `coach123`

The system also supports automatic role detection based on username patterns.

## Deployment Options

### Docker Deployment
```bash
# Build Docker image
docker build -t bp-management .

# Run with Docker Compose
docker-compose up -d
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 Process Manager
```bash
# Install PM2
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Setup auto-restart on server reboot
pm2 startup
pm2 save
```

## Features Included
- ✅ Complete patient management system
- ✅ Blood pressure monitoring and categorization
- ✅ Workflow task management
- ✅ Communication tracking with follow-up scheduling
- ✅ Union-based filtering and analytics
- ✅ Call center dashboard
- ✅ Role-based access control
- ✅ Dashboard with real-time statistics
- ✅ Automatic role detection from usernames
- ✅ Export capabilities
- ✅ Responsive design for mobile/tablet

## File Structure
```
fire-department-bp-standalone/
├── client/                 # React frontend
├── server/                 # Express backend
├── shared/                 # Shared schemas and utilities
├── public/                 # Static assets
├── dist/                   # Built application
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── docker-compose.yml
├── Dockerfile
├── ecosystem.config.js     # PM2 configuration
└── README.md
```

## Maintenance

### Database Backups
```bash
# PostgreSQL backup
pg_dump bp_management > backup_$(date +%Y%m%d).sql

# SQLite backup
cp bp_management.db backup_$(date +%Y%m%d).db
```

### Log Management
Application logs are stored in:
- `logs/application.log`
- `logs/error.log`

### Updates
```bash
# Pull latest version
git pull origin main

# Install new dependencies
npm install

# Rebuild application
npm run build

# Restart with PM2
pm2 restart bp-management
```

## Troubleshooting

### Common Issues
1. **Port already in use**: Change PORT in .env file
2. **Database connection failed**: Verify DATABASE_URL in .env
3. **Permission denied**: Ensure proper file permissions with `chmod +x`
4. **Build failed**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Support
For technical support or deployment assistance:
- Check logs in `logs/` directory
- Verify all environment variables are set
- Ensure database is running and accessible
- Check firewall settings for port 5000

## Security Considerations
- Change default passwords immediately
- Use strong SESSION_SECRET in production
- Enable HTTPS with SSL certificates
- Configure firewall rules
- Regular security updates
- Database user permissions
- Backup encryption

## Performance Tuning
- Use PM2 cluster mode for multiple CPU cores
- Configure Nginx for static file serving
- Enable database query optimization
- Implement Redis for session storage
- Set up database connection pooling

This standalone version is production-ready and includes all features from the Replit version with additional deployment flexibility.