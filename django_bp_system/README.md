# Fire Department Blood Pressure Management System (Django Version)

A comprehensive Django-based blood pressure monitoring and management system designed specifically for fire departments to track and manage firefighter health through advanced tracking, communication, and proactive healthcare interventions.

## Features

### Core Functionality
- **Patient Management**: Complete CRUD operations for firefighter patients
- **Blood Pressure Monitoring**: Automated BP categorization and abnormal reading detection
- **Workflow Management**: Hypertension management with automated task creation
- **Communication Tracking**: Advanced logging with filtering and analytics
- **REST API**: Complete API endpoints for all operations
- **Admin Interface**: Django admin panel for comprehensive data management

### Advanced Features
- **Automated BP Categorization**: Automatic classification (Normal, Elevated, Stage 1/2 Hypertension, Crisis)
- **Communication Analytics**: Response rates, staff performance tracking, daily trends
- **Interactive Filtering**: Advanced search and filtering capabilities
- **Role-based Access**: Admin, Nurse, Coach, and Firefighter roles
- **Data Export**: API endpoints for data analysis and reporting

## Technology Stack

- **Backend**: Django 4.2+ with Django REST Framework
- **Database**: SQLite (easily configurable for PostgreSQL/MySQL)
- **Authentication**: Django's built-in authentication with session management
- **API**: RESTful API with comprehensive endpoints
- **Admin**: Django admin interface with custom configurations

## Quick Start

### 1. Installation

```bash
# Clone or extract the project
cd django_bp_system

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Load sample data
python manage.py seed_data
```

### 3. Run the Application

```bash
# Start development server
python manage.py runserver

# Access the application
# Web Interface: http://localhost:8000/
# Admin Panel: http://localhost:8000/admin/
# API Root: http://localhost:8000/api/
```

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout

### Patients
- `GET /api/patients/` - List all patients
- `POST /api/patients/` - Create new patient
- `GET /api/patients/{id}/` - Get patient details
- `PUT /api/patients/{id}/` - Update patient
- `DELETE /api/patients/{id}/` - Delete patient
- `GET /api/patients/priority/` - Get priority patients with abnormal readings

### Blood Pressure Readings
- `GET /api/readings/` - List all readings
- `POST /api/readings/` - Create new reading
- `GET /api/readings/{id}/` - Get reading details
- `GET /api/readings/recent/` - Get recent readings
- `GET /api/readings/abnormal/` - Get abnormal readings

### Workflow Tasks
- `GET /api/workflow/` - List all tasks
- `POST /api/workflow/` - Create new task
- `GET /api/workflow/{id}/` - Get task details
- `PUT /api/workflow/{id}/` - Update task
- `DELETE /api/workflow/{id}/` - Delete task

### Communication Logs
- `GET /api/communications/` - List all communications
- `POST /api/communications/` - Create new communication log
- `GET /api/communications/{id}/` - Get communication details
- `GET /api/communications/analytics/` - Get communication analytics

### Dashboard
- `GET /api/dashboard/stats/` - Get dashboard statistics

## API Query Parameters

### Filtering Communications
- `patient_id` - Filter by patient ID
- `user_id` - Filter by user ID
- `type` - Filter by communication type (call, email, note, visit)
- `outcome` - Filter by outcome (resolved, unresolved, escalated, no_answer, scheduled)
- `date_from` - Filter from date (YYYY-MM-DD)
- `date_to` - Filter to date (YYYY-MM-DD)
- `search` - Search in message, notes, patient names
- `sort_by` - Sort field (created_at, patient_name, user_name, type, outcome)
- `sort_order` - Sort order (asc, desc)

### Example API Calls

```bash
# Get all patients
curl -X GET http://localhost:8000/api/patients/

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Create BP reading
curl -X POST http://localhost:8000/api/readings/ \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionid=YOUR_SESSION_ID" \
  -d '{"patient": 1, "systolic": 140, "diastolic": 90, "heart_rate": 75, "recorded_by": 1}'

# Get communication analytics
curl -X GET "http://localhost:8000/api/communications/analytics/?period=30d" \
  -H "Cookie: sessionid=YOUR_SESSION_ID"
```

## Test Accounts

After running `python manage.py seed_data`, the following test accounts are available:

- **Admin**: username: `admin`, password: `admin123`
- **Nurse**: username: `nurse1`, password: `nurse123`
- **Coach**: username: `coach1`, password: `coach123`

## Data Models

### User
- Custom user model with roles (admin, nurse, coach, firefighter)
- Extended with name, phone, and role fields

### Patient
- Firefighter patient information
- Employee ID, department, union, contact details
- Custom BP thresholds, medications, allergies

### BpReading
- Blood pressure measurements with automatic categorization
- Linked to patient and recording user
- Heart rate, notes, timestamp

### WorkflowTask
- Task management for hypertension workflow
- Priority levels, status tracking, due dates
- Assigned to specific users

### CommunicationLog
- Communication tracking with patients
- Types: call, email, note, visit
- Outcomes and follow-up scheduling

## Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
```

### Database Configuration
For PostgreSQL:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'bp_management',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## Deployment

### Production Settings
1. Set `DEBUG=False`
2. Configure proper `SECRET_KEY`
3. Set up production database
4. Configure static files serving
5. Set `ALLOWED_HOSTS`

### Docker Deployment
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
RUN python manage.py collectstatic --noinput

CMD ["gunicorn", "bp_system.wsgi:application", "--bind", "0.0.0.0:8000"]
```

## Development

### Adding New Features
1. Create new models in `bp_management/models.py`
2. Add serializers in `bp_management/serializers.py`
3. Implement views in `bp_management/views.py`
4. Update URLs in `bp_management/urls.py`
5. Run migrations: `python manage.py makemigrations && python manage.py migrate`

### Testing
```bash
# Run tests
python manage.py test

# Check code coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

## Support

This system provides a complete foundation for blood pressure management in fire departments. The Django REST API can be integrated with any frontend framework, mobile applications, or other systems.

For additional configuration or customization, refer to the Django documentation and the detailed code comments throughout the application.