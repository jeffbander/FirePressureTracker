# Fire Department Blood Pressure Management System - Deployment Guide

## System Overview
Complete Fire Department Blood Pressure Management System converted from Node.js to Python Django with PostgreSQL database integration.

## Archive Contents
- `django_bp_system/` - Main Django application with models, views, and API endpoints
- `client/` - React frontend with Tailwind CSS and TypeScript
- `server/` - Original Node.js server (for reference)
- `shared/` - Shared TypeScript schemas and utilities
- `.vscode/` - VS Code configuration for Python development
- Configuration files for both Python and Node.js environments

## Prerequisites
- Python 3.11+ with Django 5.2.3
- Node.js 20+ (for React frontend)
- PostgreSQL database
- VS Code with Python extension pack

## Quick Setup After Extraction

### 1. Extract Archive
```bash
tar -xzf fire_department_bp_system_complete.tar.gz
cd fire_department_bp_system_complete/
```

### 2. Install Python Dependencies
```bash
cd django_bp_system/
pip install -r requirements.txt
```

### 3. Install Node.js Dependencies (for React frontend)
```bash
cd ../
npm install
```

### 4. Database Setup
- Create PostgreSQL database
- Set environment variables:
  ```
  DATABASE_URL=postgresql://user:password@localhost:5432/bp_management
  PGDATABASE=bp_management
  PGUSER=your_user
  PGPASSWORD=your_password
  PGHOST=localhost
  PGPORT=5432
  ```

### 5. Django Setup
```bash
cd django_bp_system/
python manage.py migrate
python manage.py seed_data
python manage.py createsuperuser
```

### 6. Run in VS Code
Open project in VS Code and use:
- **Debug Panel**: Select "Django Server" → Play button
- **Command Palette**: Ctrl+Shift+P → "Tasks: Run Task" → "Run Django Server"
- **Terminal**: `cd django_bp_system && python manage.py runserver 0.0.0.0:5000`

## Features Included
- Complete Django REST API with PostgreSQL
- React frontend with TypeScript and Tailwind CSS
- Patient management with blood pressure tracking
- Workflow task management for hypertension cases
- Communication logging system
- Admin interface at /admin/
- Sample data seeding command
- VS Code debugging configuration

## API Endpoints
- `/api/dashboard/stats/` - Dashboard statistics
- `/api/patients/` - Patient management
- `/api/bp-readings/` - Blood pressure readings
- `/api/workflow-tasks/` - Task management
- `/api/communications/` - Communication logs

## Default Login
- Admin: username `admin`, password `password`
- Access Django admin at: http://localhost:5000/admin/

## Port Configuration
- Django server: 5000
- React development: 3000 (if running separately)

The system maintains full functionality after extraction and follows Django best practices for production deployment.