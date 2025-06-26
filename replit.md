# Fire Department Blood Pressure Management System

## Overview

This is a comprehensive blood pressure monitoring and management system designed specifically for fire departments to track firefighter health. The system combines a Django backend with a React frontend to provide a complete solution for patient management, BP monitoring, workflow management, and communication tracking.

## System Architecture

### Hybrid Architecture
The system uses a hybrid approach with two different architectures:
1. **Django-only Backend** (Primary): Complete API and web interface in Django
2. **Node.js + React Frontend** (Secondary): Modern React interface with Express server proxy

### Primary Stack (Django)
- **Backend**: Django 4.2+ with Django REST Framework
- **Database**: SQLite (configurable for PostgreSQL/MySQL)
- **Authentication**: Django's built-in authentication system
- **Admin Interface**: Django admin panel with custom configurations

### Secondary Stack (Node.js + React)
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with blue theme customization
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and building

## Key Components

### Backend Components
1. **User Management**: Custom User model with role-based access (admin, nurse, coach, firefighter)
2. **Patient Management**: Complete firefighter patient records with department tracking
3. **BP Reading System**: Automated blood pressure categorization and abnormal reading detection
4. **Workflow Management**: Task assignment and follow-up tracking with priority levels
5. **Communication Logging**: Advanced logging with filtering and analytics capabilities

### Frontend Components
1. **Dashboard**: Real-time overview with interactive charts and statistics
2. **Patient Interface**: Comprehensive patient management with search and filtering
3. **BP Monitoring**: Individual patient BP trend visualization
4. **Workflow Tasks**: Task management interface with priority sorting
5. **Communication Tracking**: Advanced communication history and analytics

### Database Schema
- **Users**: Custom user model extending Django's AbstractUser
- **Patients**: Firefighter records with department, union, and medical information
- **BP Readings**: Blood pressure measurements with automatic categorization
- **Workflow Tasks**: Task management with assignment and status tracking
- **Communication Logs**: Patient interaction history with outcomes and analytics

## Data Flow

### Django API Flow
1. **Authentication**: Session-based authentication through Django
2. **API Endpoints**: RESTful API using Django REST Framework
3. **Data Processing**: Automatic BP categorization and workflow task creation
4. **Database Operations**: Django ORM for all database interactions

### React Frontend Flow
1. **User Interface**: React components with TypeScript for type safety
2. **API Communication**: TanStack Query for efficient data fetching and caching
3. **State Management**: Zustand for client-side state (authentication, UI state)
4. **Real-time Updates**: Query invalidation for live data updates

### Workflow Automation
1. **BP Reading Entry**: Automatic categorization based on AHA guidelines
2. **Task Creation**: Automated workflow task generation for abnormal readings
3. **Priority Assignment**: Risk-based priority assignment for tasks
4. **Communication Tracking**: Comprehensive logging of all patient interactions

## External Dependencies

### Python Dependencies
- Django 4.2+ for web framework
- Django REST Framework for API functionality
- django-cors-headers for frontend integration
- python-decouple for environment configuration
- Pillow for image handling

### Node.js Dependencies
- React 18 for frontend framework
- TypeScript for type safety
- Tailwind CSS for styling
- Radix UI for accessible components
- TanStack Query for data fetching
- Vite for build tooling

### Database Options
- SQLite (default, no external dependency)
- PostgreSQL (optional, requires psycopg2)
- MySQL (optional, requires mysqlclient)

## Deployment Strategy

### Development Environment
1. **Django Development**: Use `python manage.py runserver` on port 5000
2. **React Development**: Use `npm run dev` for Vite development server
3. **Database**: SQLite for local development, easily configurable for production databases

### Production Deployment
1. **Static Files**: Django collectstatic for production assets
2. **Database**: PostgreSQL recommended for production
3. **Web Server**: Nginx + Gunicorn for Django deployment
4. **Environment Variables**: Use .env files for configuration

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16, python-3.11
- **Run Command**: `npm run dev` (Node.js + React frontend)
- **Build Command**: `npm run build`
- **Port Configuration**: 5000 (external port 80)

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- June 26, 2025: Added Date of Birth field with automatic age calculation
- June 26, 2025: Removed authentication requirement - direct access without login
- June 26, 2025: Updated patient management to show both DOB and calculated age
- June 26, 2025: Complete standalone deployment package created

## Changelog

Changelog:
- June 17, 2025. Initial setup
- June 26, 2025. DOB implementation and authentication removal