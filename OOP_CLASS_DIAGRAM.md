# Fire Department BP Management System - Object-Oriented Class Diagram

## Visual Class Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DOMAIN MODELS LAYER                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │      User       │    │     Patient     │    │   BpReading     │            │
│  │─────────────────│    │─────────────────│    │─────────────────│            │
│  │ - id: number    │    │ - id: number    │    │ - id: number    │            │
│  │ - username: str │    │ - employeeId    │    │ - patientId     │            │
│  │ - password: str │    │ - firstName     │    │ - systolic      │            │
│  │ - name: string  │    │ - lastName      │    │ - diastolic     │            │
│  │ - role: string  │    │ - department    │    │ - heartRate     │            │
│  │ - email: string │    │ - union: string │    │ - category      │            │
│  │ - phone: string │    │ - age: number   │    │ - isAbnormal    │            │
│  │ - createdAt     │    │ - email: string │    │ - recordedAt    │            │
│  │─────────────────│    │ - phone: string │    │ - recordedBy    │            │
│  │ + isAdmin()     │    │ - emergencyCtc  │    │─────────────────│            │
│  │ + isNurse()     │    │ - medications   │    │ + isNormal()    │            │
│  │ + isCoach()     │    │ - allergies     │    │ + isHyperCrisis │            │
│  │ + canManage()   │    │ - lastCheckup   │    │ + getRiskLevel  │            │
│  │ + validatePwd() │    │ - customThresh  │    │ + compareTo()   │            │
│  │ + toPublicData()│    │ - createdAt     │    │ + getFormatted  │            │
│  └─────────────────┘    │─────────────────│    │ + isRecent()    │            │
│                         │ + getFullName() │    │ + calculateCat  │            │
│                         │ + hasCustomThr  │    └─────────────────┘            │
│                         │ + needsCheckup  │                                   │
│                         │ + isAbnormal()  │                                   │
│                         │ + matchesSearch │                                   │
│                         │ + getMedicList  │                                   │
│                         └─────────────────┘                                   │
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                                   │
│  │  WorkflowTask   │    │ CommunicationLog│                                   │
│  │─────────────────│    │─────────────────│                                   │
│  │ - id: number    │    │ - id: number    │                                   │
│  │ - patientId     │    │ - patientId     │                                   │
│  │ - assignedTo    │    │ - userId        │                                   │
│  │ - title: string │    │ - type: string  │                                   │
│  │ - description   │    │ - message       │                                   │
│  │ - priority      │    │ - outcome       │                                   │
│  │ - status        │    │ - followUpReq   │                                   │
│  │ - dueDate       │    │ - followUpDate  │                                   │
│  │ - completedAt   │    │ - createdAt     │                                   │
│  │ - createdAt     │    │─────────────────│                                   │
│  │─────────────────│    │ + getTypeIcon() │                                   │
│  │ + isOverdue()   │    │ + requiresF/U() │                                   │
│  │ + isDueToday()  │    │ + getOutcome()  │                                   │
│  │ + isHighPrio()  │    │ + logActivity() │                                   │
│  │ + isActive()    │    └─────────────────┘                                   │
│  │ + complete()    │                                                           │
│  │ + start()       │                                                           │
│  │ + cancel()      │                                                           │
│  │ + canAssignTo() │                                                           │
│  └─────────────────┘                                                           │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SERVICE LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐ │
│  │ AuthenticationSvc   │    │    PatientService   │    │  BpReadingService   │ │
│  │─────────────────────│    │─────────────────────│    │─────────────────────│ │
│  │ - storage: IStorage │    │ - storage: IStorage │    │ - storage: IStorage │ │
│  │─────────────────────│    │─────────────────────│    │ - patientSvc        │ │
│  │ + authenticate()    │    │ + getAllPatients()  │    │ - workflowSvc       │ │
│  │ + validateSession() │    │ + searchPatients()  │    │─────────────────────│ │
│  │ + hasPermission()   │    │ + getPatientById()  │    │ + createReading()   │ │
│  └─────────────────────┘    │ + createPatient()   │    │ + getByPatient()    │ │
│                             │ + updatePatient()   │    │ + getAbnormal()     │ │
│                             │ + needingCheckup()  │    │ + analyzeTrends()   │ │
│                             │ + withAbnormal()    │    │ + getDashStats()    │ │
│                             │ + getStatistics()   │    └─────────────────────┘ │
│                             └─────────────────────┘                            │
│                                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────┐                           │
│  │  WorkflowService    │    │ CommunicationSvc    │                           │
│  │─────────────────────│    │─────────────────────│                           │
│  │ - storage: IStorage │    │ - storage: IStorage │                           │
│  │─────────────────────│    │─────────────────────│                           │
│  │ + createTaskForBP() │    │ + logCommunication()│                           │
│  │ + getAllTasks()     │    │ + getByPatient()    │                           │
│  │ + getByAssignee()   │    │ + getFollowUps()    │                           │
│  │ + updateStatus()    │    │ + searchLogs()      │                           │
│  │ + assignTask()      │    │ + getStatistics()   │                           │
│  │ + getPriority()     │    │ + completeF/U()     │                           │
│  │ + getOverdue()      │    │ + scheduleF/U()     │                           │
│  │ + escalate()        │    └─────────────────────┘                           │
│  │ + getStatistics()   │                                                       │
│  └─────────────────────┘                                                       │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                            CONTROLLER LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  AuthController │  │PatientController│  │BpReadingCtrl    │  │WorkflowCtrl │ │
│  │─────────────────│  │─────────────────│  │─────────────────│  │─────────────│ │
│  │ - authSvc       │  │ - patientSvc    │  │ - bpReadingSvc  │  │ - workflowSvc│ │
│  │─────────────────│  │ - bpReadingSvc  │  │ - patientSvc    │  │─────────────│ │
│  │ + login()       │  │ - workflowSvc   │  │ - workflowSvc   │  │ + getAllTasks│ │
│  │ + logout()      │  │─────────────────│  │─────────────────│  │ + getPriorty │ │
│  │ + validate()    │  │ + getAll()      │  │ + getAll()      │  │ + getOverdue │ │
│  │ + checkPerm()   │  │ + getById()     │  │ + getAbnormal() │  │ + getByUser  │ │
│  └─────────────────┘  │ + create()      │  │ + getByPatient()│  │ + createTask │ │
│                       │ + update()      │  │ + getTrends()   │  │ + updateStat │ │
│                       │ + priority()    │  │ + create()      │  │ + assign()   │ │
│                       │ + statistics()  │  └─────────────────┘  │ + escalate() │ │
│                       └─────────────────┘                      └─────────────┘ │
│                                                                                 │
│  ┌─────────────────┐                                                           │
│  │DashboardCtrl    │                                                           │
│  │─────────────────│                                                           │
│  │ - allServices   │                                                           │
│  │─────────────────│                                                           │
│  │ + getStats()    │                                                           │
│  │ + getAlerts()   │                                                           │
│  │ + getRecent()   │                                                           │
│  └─────────────────┘                                                           │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION ORCHESTRATOR                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                            Application                                      │ │
│  │─────────────────────────────────────────────────────────────────────────────│ │
│  │ - authController: AuthController                                            │ │
│  │ - patientController: PatientController                                      │ │
│  │ - bpReadingController: BpReadingController                                  │ │
│  │ - workflowController: WorkflowController                                    │ │
│  │ - dashboardController: DashboardController                                  │ │
│  │─────────────────────────────────────────────────────────────────────────────│ │
│  │ + constructor()         // Initializes all controllers with DI             │ │
│  │ + registerRoutes(app)   // Maps HTTP routes to controller methods          │ │
│  │ + getHealthStatus()     // Returns system health information               │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DATA ACCESS LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           IStorage Interface                                │ │
│  │─────────────────────────────────────────────────────────────────────────────│ │
│  │ + getUser(id): Promise<User>                                                │ │
│  │ + getUserByUsername(username): Promise<User>                                │ │
│  │ + createUser(user): Promise<User>                                           │ │
│  │ + getPatient(id): Promise<Patient>                                          │ │
│  │ + getAllPatients(): Promise<Patient[]>                                      │ │
│  │ + createPatient(patient): Promise<Patient>                                  │ │
│  │ + getBpReading(id): Promise<BpReading>                                      │ │
│  │ + getBpReadingsByPatient(patientId): Promise<BpReading[]>                   │ │
│  │ + createBpReading(reading): Promise<BpReading>                              │ │
│  │ + getWorkflowTask(id): Promise<WorkflowTask>                                │ │
│  │ + getAllWorkflowTasks(): Promise<WorkflowTask[]>                            │ │
│  │ + createWorkflowTask(task): Promise<WorkflowTask>                           │ │
│  │ + updateWorkflowTask(id, updates): Promise<WorkflowTask>                    │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                         ▲                                       │
│                                         │                                       │
│                                         │ implements                            │
│                                         │                                       │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   MemStorage    │    │ DatabaseStorage │    │  Future Storage │            │
│  │   (Current)     │    │ (PostgreSQL)    │    │ Implementations │            │
│  │─────────────────│    │─────────────────│    │─────────────────│            │
│  │ - users: Map    │    │ - db: Database  │    │ - MongoDB       │            │
│  │ - patients: Map │    │ - pool: Pool    │    │ - Redis Cache   │            │
│  │ - readings: Map │    │─────────────────│    │ - Elasticsearch │            │
│  │ - tasks: Map    │    │ + query()       │    │ - Cloud Storage │            │
│  │ - logs: Map     │    │ + transaction() │    └─────────────────┘            │
│  │─────────────────│    │ + migrate()     │                                   │
│  │ + seedData()    │    │ + backup()      │                                   │
│  │ + getAllX()     │    └─────────────────┘                                   │
│  │ + createX()     │                                                           │
│  │ + updateX()     │                                                           │
│  │ + searchX()     │                                                           │
│  └─────────────────┘                                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Key Object-Oriented Design Patterns

### 1. Dependency Injection Pattern
```
Application
    └── Controllers (inject Services)
        └── Services (inject Storage Interface)
            └── Models (pure domain objects)
```

### 2. Repository Pattern
```
IStorage Interface
    ├── MemStorage (current implementation)
    └── DatabaseStorage (PostgreSQL implementation)
```

### 3. Service Layer Pattern
```
Controllers handle HTTP requests
    ↓
Services handle business logic
    ↓
Models handle domain rules
    ↓
Storage handles data persistence
```

### 4. Factory Pattern
```
BpReading.create() - Creates reading with proper categorization
WorkflowService.createTaskForAbnormalReading() - Auto-generates tasks
```

## Class Relationships

### Composition Relationships
- **Application** *composes* Controllers
- **Controllers** *compose* Services
- **Services** *compose* Storage Interface
- **BpReadingService** *composes* PatientService + WorkflowService

### Dependency Relationships
- **All Services** *depend on* IStorage Interface
- **Controllers** *depend on* Services
- **Application** *depends on* Controllers

### Inheritance Relationships
- **MemStorage** *implements* IStorage
- **DatabaseStorage** *implements* IStorage
- All Models inherit from their respective schema types

## Method Flow Examples

### 1. Create BP Reading Flow
```
POST /api/bp-readings
    ↓
BpReadingController.createReading()
    ↓
BpReadingService.createBpReading()
    ↓
Patient.getSystolicThreshold() + BpReading.create()
    ↓
Storage.createBpReading()
    ↓
WorkflowService.createTaskForAbnormalReading() (if abnormal)
```

### 2. User Authentication Flow
```
POST /api/auth/login
    ↓
AuthController.login()
    ↓
AuthenticationService.authenticateUser()
    ↓
User.validatePassword()
    ↓
User.toPublicData()
```

### 3. Dashboard Statistics Flow
```
GET /api/dashboard/stats
    ↓
DashboardController.getStats()
    ↓
PatientService.getPatientStatistics()
    BpReadingService.getDashboardStats()
    WorkflowService.getTaskStatistics()
    ↓
Multiple Model calculations and Storage queries
```

## Benefits of This OOP Architecture

1. **Single Responsibility**: Each class has one clear purpose
2. **Open/Closed Principle**: Easy to extend without modifying existing code
3. **Dependency Inversion**: High-level modules don't depend on low-level modules
4. **Interface Segregation**: Clean, focused interfaces
5. **Composition over Inheritance**: Flexible object relationships
6. **Testability**: Easy to mock dependencies for unit testing
7. **Maintainability**: Clear separation of concerns
8. **Scalability**: Easy to add new features and storage backends