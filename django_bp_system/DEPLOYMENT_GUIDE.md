# Fire Department BP Management System - Deployment Guide

## Package Contents

This complete Django version includes:

### Core Application Files
- **bp_system/**: Main Django project configuration
- **bp_management/**: Core application with models, views, serializers
- **templates/**: HTML templates for web interface
- **static/**: CSS styling and static assets
- **requirements.txt**: Python dependencies
- **manage.py**: Django management script

### Key Features Implemented
- ✅ Complete REST API with all endpoints
- ✅ Patient management with full CRUD operations
- ✅ Blood pressure readings with automatic categorization
- ✅ Workflow task management
- ✅ Communication logging with advanced analytics
- ✅ Django admin interface
- ✅ User authentication and role-based access
- ✅ Sample data seeding command
- ✅ Responsive web templates

## Quick Deployment (3 Steps)

### 1. Setup Environment
```bash
# Extract package and navigate
tar -xzf django_fire_department_bp_system.tar.gz
cd django_bp_system

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Initialize Database
```bash
# Run migrations
python manage.py migrate

# Load sample data (creates test users and patients)
python manage.py seed_data
```

### 3. Start Application
```bash
# Start server
python manage.py runserver 0.0.0.0:8000

# Access application at:
# http://localhost:8000/ - Web interface
# http://localhost:8000/admin/ - Admin panel
# http://localhost:8000/api/ - REST API
```

## Test Credentials

After running `seed_data`, use these accounts:
- **Admin**: admin / admin123
- **Nurse**: nurse1 / nurse123  
- **Health Coach**: coach1 / coach123

## API Examples

### Authentication
```bash
# Login to get session
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Get Patients
```bash
curl -X GET http://localhost:8000/api/patients/ \
  -H "Cookie: sessionid=YOUR_SESSION_ID"
```

### Create BP Reading
```bash
curl -X POST http://localhost:8000/api/readings/ \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionid=YOUR_SESSION_ID" \
  -d '{"patient": 1, "systolic": 140, "diastolic": 90, "heart_rate": 75, "recorded_by": 1}'
```

### Communication Analytics
```bash
curl -X GET "http://localhost:8000/api/communications/analytics/?period=30d" \
  -H "Cookie: sessionid=YOUR_SESSION_ID"
```

## Production Deployment

### Environment Configuration
1. Copy `.env.example` to `.env`
2. Set production values:
   ```env
   SECRET_KEY=your-production-secret-key
   DEBUG=False
   ALLOWED_HOSTS=your-domain.com
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   ```

### Database Setup
For PostgreSQL:
```bash
pip install psycopg2-binary
python manage.py migrate
python manage.py collectstatic
```

### Web Server (Gunicorn + Nginx)
```bash
pip install gunicorn
gunicorn bp_system.wsgi:application --bind 0.0.0.0:8000
```

## Architecture Overview

The system maintains all original features while providing:

- **REST API**: Complete endpoints for all operations
- **Django Admin**: Full administrative interface
- **Authentication**: Session-based with role management
- **Data Models**: Patient, BpReading, WorkflowTask, CommunicationLog, User
- **Advanced Features**: BP categorization, communication analytics, filtering
- **Scalability**: Ready for production deployment

This Django version provides the same comprehensive functionality as the original React/Express system but with the robustness and administrative capabilities of Django.