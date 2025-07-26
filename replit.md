# Union-Based Hypertension Program Management System

## Overview

This is a comprehensive union-based hypertension program management system designed to support member health monitoring across multiple unions (UFA, Mount Sinai, LBA, UFOA). The system features AI-powered clinical triage, automated communication management, intelligent fulfillment routing, and member-centric workflows for proactive cardiovascular health intervention.

## System Architecture

### Modern Node.js + React Stack
- **Backend**: Express.js with TypeScript for API services
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **Frontend**: React 18 with TypeScript and modern component architecture
- **Styling**: Tailwind CSS with custom union-specific theming
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and building

## Key Components

### Union-Based Member Management
1. **Member Registration**: Mobile app intake with union-specific routing
2. **Verification Workflow**: Union admin approval process with role-based access
3. **Member Profiles**: Comprehensive health profiles with medical history
4. **Dynamic Member Lists**: Active, inactive, pending first reading categorization
5. **Union Analytics**: Performance metrics segmented by union affiliation

### AI-Powered Clinical Triage
1. **Automated BP Analysis**: Real-time abnormal reading detection
2. **Risk Assessment**: Multi-factor cardiovascular risk scoring
3. **Intervention Recommendations**: AI-driven assignment to coaches or nurse practitioners
4. **Clinical Review**: Human oversight and override capabilities
5. **Trend Analysis**: Historical pattern recognition and escalation

### Intelligent Fulfillment System
1. **Union-Based Routing**: Automatic fulfillment path determination (ShipNYC vs Union inventory)
2. **Queue Management**: Separate fulfillment queues per union (UFA, Mount Sinai, LBA, UFOA)
3. **Tracking Integration**: Carrier API integration for real-time shipping updates
4. **Status Automation**: Automatic member reassignment upon delivery confirmation
5. **Inventory Analytics**: Fulfillment performance metrics by union and queue

### Advanced Communication Management
1. **AI-Driven Follow-up**: Automated follow-up scheduling based on interaction outcomes
2. **Sentiment Analysis**: AI sentiment detection for communication prioritization
3. **Two-Way Messaging**: In-app messaging system between members and staff
4. **Communication Analytics**: Resolution rates, response times, and effectiveness metrics
5. **Staff Assignment**: Intelligent routing to appropriate clinical or support staff

### Database Schema
- **Members**: Union member profiles with comprehensive medical and lifestyle data
- **Users**: Staff management with role-based permissions (admin, clinical_team, fulfillment_team, communication_staff, union_rep)
- **Cuff Fulfillment**: End-to-end tracking from request to delivery with union-specific routing
- **Clinical Triage**: AI triage results with human review capabilities
- **Communications**: Enhanced communication logging with AI analysis
- **Messages**: Two-way messaging system with conversation threading
- **BP Readings**: Enhanced readings with device sync and member association
- **Workflow Tasks**: AI-generated and manual task management

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

- July 26, 2025: **COMPREHENSIVE APPSHEET API DOCUMENTATION COMPLETE** - Created detailed bidirectional API flow documentation
- July 26, 2025: Fixed duplicate blood pressure readings issue - implemented deduplication logic in patient detail views
- July 26, 2025: Enhanced communication API integration - replaced prompt/alert system with real database operations
- July 26, 2025: Completed mobile responsiveness with working hamburger menu and proper navigation
- July 26, 2025: Fixed workflow JSON parsing error - added missing `/api/workflow` endpoint that was causing "Unexpected token '<'" errors
- July 26, 2025: Fixed patient ID validation to prevent "NaN" errors when invalid IDs are passed
- July 26, 2025: Fixed patient display to show correct total count (553) instead of only current page count (20)
- July 26, 2025: Removed redundant "Union" prefix from patient cards and added union badges for clearer display
- July 25, 2025: **COMPLETE APPSHEET DATA MIGRATION SUCCESS** - Imported full production dataset: 553 members and 7,470 BP readings
- July 25, 2025: Achieved comprehensive data coverage across all unions: UFOA (267 members, 3,360 readings), UFA (242 members, 3,368 readings), LBA (33 members, 756 readings), Mount Sinai (11 members, 19 readings)
- July 25, 2025: Successfully analyzed AppSheet app structure including Users table, app_data (BP readings), and call_records tables
- July 25, 2025: Discovered 34.7% of members have BP readings recorded, with 361 members awaiting first readings
- July 25, 2025: Identified LBA union members have highest average BP (134/87) requiring targeted intervention
- July 24, 2025: **APPSHEET INTEGRATION COMPLETE & DEPLOYED** - Built comprehensive bidirectional data sync with AppSheet and configured API keys
- July 24, 2025: Created REST API endpoints for exporting members, BP readings, tasks, communications, and lookup data
- July 24, 2025: Implemented webhook system for real-time data synchronization from AppSheet to main system
- July 24, 2025: Fixed date format validation issues in webhooks with proper type conversion
- July 24, 2025: Created detailed integration documentation and testing examples
- July 24, 2025: Successfully tested all webhook endpoints (members, readings, tasks) with proper error handling
- July 24, 2025: Configured production API keys (APPSHEET_API_KEY_1, APPSHEET_API_KEY_2) for authenticated access
- July 24, 2025: Completed end-to-end testing with 3 members, 3 BP readings, and 2 workflow tasks across multiple unions
- July 24, 2025: Verified union-specific workflows (UFA, Mount Sinai) and clinical triage automation working correctly
- July 16, 2025: **MAJOR DATABASE OPTIMIZATION** - Converted entire database schema to use integer IDs for efficient queries
- July 16, 2025: Implemented normalized PostgreSQL schema with lookup tables for all string values (unions, statuses, priorities, categories)
- July 16, 2025: Created 11 lookup tables: roles, unions, genders, member_statuses, task_statuses, task_priorities, task_types, bp_categories, communication_types, communication_statuses, fulfillment_statuses
- July 16, 2025: Replaced expensive string comparisons with integer foreign key relationships for optimal query performance
- July 16, 2025: Updated storage layer to use Drizzle ORM with PostgreSQL and new normalized schema structure
- July 16, 2025: Created database initialization scripts with proper lookup table population
- July 16, 2025: Rebuilt API endpoints to work with integer-based schema while maintaining backward compatibility
- July 16, 2025: Successfully migrated from old Django-based tables to optimized union-based hypertension program schema
- July 10, 2025: **MAJOR TRANSFORMATION** - Converted entire system from Fire Department BP Management to Union-Based Hypertension Program
- July 10, 2025: Redesigned database schema with new member-centric tables (members, cuffFulfillment, clinicalTriage, communications, messages)
- July 10, 2025: Created comprehensive backend services: MemberService, AiTriageService, CommunicationService
- July 10, 2025: Implemented AI-powered clinical triage with risk assessment and intervention recommendations
- July 10, 2025: Built intelligent fulfillment system with union-specific routing (UFA→ShipNYC, Mount Sinai→ShipNYC, LBA→Union inventory, UFOA→Union inventory)
- July 10, 2025: Added advanced communication management with AI sentiment analysis and automated follow-up scheduling
- July 10, 2025: Created comprehensive API endpoints for member registration, verification, fulfillment tracking, triage, and analytics
- July 10, 2025: Established role-based access control for union representatives, clinical teams, fulfillment teams, and communication staff
- July 10, 2025: Integrated two-way messaging system with conversation threading between members and staff
- July 10, 2025: Built analytics dashboard with real-time metrics for operational, clinical, and communication performance

## Previous Fire Department System Changes
- June 26, 2025: Added Date of Birth field with automatic age calculation
- June 26, 2025: Removed authentication requirement - direct access without login
- June 26, 2025: Updated patient management to show both DOB and calculated age
- June 26, 2025: Complete standalone deployment package created
- June 26, 2025: Implemented webhook endpoint for external patient registration
- June 26, 2025: Added patient approval workflow with status management
- June 26, 2025: Created approvals interface for managing patient confirmations
- June 26, 2025: Implemented automated workflow events system with email notifications
- June 26, 2025: Added automated cuff request emails to sbzakow@mswheart.com
- June 26, 2025: Created welcome email system for newly activated patients
- June 30, 2025: Enhanced approval workflow with union-based segregation and admin oversight
- June 30, 2025: Added new patient statuses: awaiting_first_reading, inactive
- June 30, 2025: Implemented automated status transitions and inactive patient monitoring
- June 30, 2025: Created union-specific approval interfaces with pending counts by union

## Changelog

Changelog:
- June 17, 2025. Initial setup
- June 26, 2025. DOB implementation and authentication removal
- July 10, 2025. Complete system transformation to Union-Based Hypertension Program