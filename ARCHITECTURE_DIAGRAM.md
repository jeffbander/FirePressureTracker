# Fire Department BP Management System - Object-Oriented Architecture

## High-Level System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER (React Frontend)                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │  Dashboard  │  │  Patients   │  │  Workflow   │  │  BP Trends  │  │  Comms  │ │
│  │   Component │  │  Component  │  │  Component  │  │  Component  │  │ Component│ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│         │                │                │                │                │     │
│         └────────────────┼────────────────┼────────────────┼────────────────┘     │
│                          │                │                │                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                     Authentication Store (Zustand)                         │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                           │ HTTP API Calls
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           API LAYER (Express.js Controllers)                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │    Auth     │  │   Patient   │  │  BP Reading │  │  Workflow   │  │  Comm   │ │
│  │ Controller  │  │ Controller  │  │ Controller  │  │ Controller  │  │Controller│ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│         │                │                │                │                │     │
│         └────────────────┼────────────────┼────────────────┼────────────────┘     │
│                          │                │                │                      │
│                          ▼                ▼                ▼                      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER (Business Logic)                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Authentication  │  │    Patient      │  │   BP Reading    │  │  Workflow   │ │
│  │    Service      │  │    Service      │  │    Service      │  │   Service   │ │
│  │                 │  │                 │  │                 │  │             │ │
│  │ • Authenticate  │  │ • CRUD Ops      │  │ • Create Reading│  │ • Task Mgmt │ │
│  │ • Validate      │  │ • Search        │  │ • Trend Analysis│  │ • Auto Gen  │ │
│  │ • Permissions   │  │ • Statistics    │  │ • Risk Assessment│ │ • Priority  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│         │                       │                       │                │       │
│         └───────────────────────┼───────────────────────┼────────────────┘       │
│                                 │                       │                        │
│  ┌─────────────────┐            │                       │        ┌─────────────┐ │
│  │ Communication   │            │                       │        │   Report    │ │
│  │    Service      │            │                       │        │   Service   │ │
│  │                 │            │                       │        │             │ │
│  │ • Log Comms     │            │                       │        │ • Dashboard │ │
│  │ • Track F/U     │            │                       │        │ • Analytics │ │
│  │ • Notifications │            │                       │        │ • Exports   │ │
│  └─────────────────┘            │                       │        └─────────────┘ │
│                                 │                       │                        │
│                                 ▼                       ▼                        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MODEL LAYER (Domain Objects)                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │    User     │  │   Patient   │  │  BpReading  │  │ WorkflowTask│  │  Comm   │ │
│  │    Model    │  │   Model     │  │    Model    │  │    Model    │  │  Log    │ │
│  │             │  │             │  │             │  │             │  │ Model   │ │
│  │ • Auth      │  │ • Validation│  │ • BP Cat.   │  │ • Priority  │  │ • Types │ │
│  │ • Roles     │  │ • Search    │  │ • Risk Calc │  │ • Status    │  │ • F/U   │ │
│  │ • Perms     │  │ • Thresholds│  │ • Trends    │  │ • Assignment│  │ • Notes │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│         │                │                │                │                │     │
│         └────────────────┼────────────────┼────────────────┼────────────────┘     │
│                          │                │                │                      │
│                          ▼                ▼                ▼                      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATA ACCESS LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                         Storage Interface                                  │ │
│  │                                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │ │
│  │  │   Memory    │  │ PostgreSQL  │  │   Future    │  │   Future    │       │ │
│  │  │  Storage    │  │  Storage    │  │   MySQL     │  │   MongoDB   │       │ │
│  │  │ (Current)   │  │ (Available) │  │  Storage    │  │   Storage   │       │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

## Data Flow Patterns

### 1. User Authentication Flow
┌─────────┐    ┌─────────────┐    ┌─────────────────┐    ┌─────────┐
│ Login   │───▶│ Auth        │───▶│ Authentication  │───▶│ Storage │
│ Form    │    │ Controller  │    │ Service         │    │ Layer   │
└─────────┘    └─────────────┘    └─────────────────┘    └─────────┘
                       │                    │
                       ▼                    ▼
               ┌─────────────┐    ┌─────────────────┐
               │ JWT Token   │    │ User Model      │
               │ Response    │    │ Validation      │
               └─────────────┘    └─────────────────┘

### 2. BP Reading Creation Flow
┌─────────┐    ┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Reading │───▶│ BP Reading  │───▶│ BP Reading      │───▶│ Patient     │
│ Form    │    │ Controller  │    │ Service         │    │ Service     │
└─────────┘    └─────────────┘    └─────────────────┘    └─────────────┘
                       │                    │                    │
                       ▼                    ▼                    ▼
               ┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
               │ Response    │    │ BpReading Model │    │ Workflow    │
               │ Data        │    │ + Category      │    │ Auto-Gen    │
               └─────────────┘    └─────────────────┘    └─────────────┘

### 3. Workflow Task Generation Flow
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Abnormal    │───▶│ Workflow        │───▶│ Risk Assessment │───▶│ Task        │
│ BP Reading  │    │ Service         │    │ Algorithm       │    │ Assignment  │
└─────────────┘    └─────────────────┘    └─────────────────┘    └─────────────┘
                           │                        │                    │
                           ▼                        ▼                    ▼
                   ┌─────────────┐        ┌─────────────────┐    ┌─────────────┐
                   │ Priority    │        │ Triage Rules    │    │ User        │
                   │ Calculation │        │ (AHA Guidelines)│    │ Assignment  │
                   └─────────────┘        └─────────────────┘    └─────────────┘

## Key Object-Oriented Design Principles

### 1. Single Responsibility Principle
- **User Model**: Handles user data and role-based permissions
- **Patient Model**: Manages patient information and medical history
- **BpReading Model**: Processes BP data and risk categorization
- **Services**: Each service handles one domain area

### 2. Open/Closed Principle
- **Storage Interface**: Allows multiple storage implementations
- **Service Layer**: Extensible for new business rules
- **Model Validation**: Configurable validation rules

### 3. Dependency Inversion
- **Controllers** depend on **Service Interfaces**
- **Services** depend on **Storage Interfaces**
- **Models** are independent domain objects

### 4. Composition over Inheritance
- **Services** compose multiple models
- **Controllers** compose multiple services
- **Complex operations** built from simple model methods

## Security Architecture

### Authentication Flow
```
Client Request → Auth Middleware → JWT Validation → User Object → Permission Check
```

### Authorization Layers
1. **Route Level**: Public vs Protected routes
2. **Service Level**: Role-based access control
3. **Model Level**: Data validation and sanitization
4. **Storage Level**: Query parameter validation

## Scalability Considerations

### Horizontal Scaling
- **Stateless Services**: All business logic in services
- **Database Abstraction**: Easy to switch storage backends
- **API Design**: RESTful endpoints for load balancing

### Performance Optimization
- **Model Caching**: Patient and user data caching
- **Service Layer**: Bulk operations and batch processing
- **Database Indexing**: Optimized queries through storage layer

## Error Handling Strategy

### Layered Error Handling
```
Model Validation Errors → Service Business Logic Errors → Controller HTTP Errors → Client Display
```

### Error Types
1. **Validation Errors**: Invalid data format or constraints
2. **Business Logic Errors**: Rule violations (e.g., duplicate patient)
3. **System Errors**: Database connection, external service failures
4. **Security Errors**: Unauthorized access, invalid tokens