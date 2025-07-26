# AppSheet Bidirectional API Integration Documentation

## Overview

The Union-Based Hypertension Program Management System provides comprehensive bidirectional data synchronization with AppSheet mobile applications. This integration enables real-time data flow between the web-based management system and mobile field operations.

**AppSheet App ID**: `29320fd7-0017-46ab-8427-0c15b574f046`  
**Production Dataset**: 554 members, 7,473 BP readings across 4 unions

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AppSheet      │◄──►│  Main System    │◄──►│   Database      │
│   Mobile App    │    │   (Express.js)  │    │  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
    Field Staff              Web Interface          Persistent Storage
    Data Entry               Analytics & Admin       Normalized Schema
```

## Data Flow Directions

### 1. AppSheet → Main System (Inbound)
Mobile app data flows into the web management system via webhooks.

### 2. Main System → AppSheet (Outbound)
Web system data exports to AppSheet via REST API endpoints.

---

## 🔄 INBOUND DATA FLOW (AppSheet → Main System)

### Triggers
- **User Actions**: Field staff enters data in AppSheet mobile app
- **AppSheet Bots**: Automated workflows trigger data sync
- **Data Changes**: CREATE, UPDATE, DELETE operations in AppSheet
- **Real-time Sync**: Immediate webhook execution upon data modification

### Webhook Endpoints

#### 1. Member Data Webhook
**Endpoint**: `POST /api/appsheet/webhook/members`

**Triggers**:
- New member registration in mobile app
- Member profile updates (contact info, medical history)
- Status changes (verification, activation, deactivation)

**Supported Actions**:
- `ADD`: Create new member record
- `UPDATE`: Modify existing member data
- `DELETE`: Deactivate member (soft delete)

**Data Mapping**:
```json
{
  "action": "ADD|UPDATE|DELETE",
  "data": {
    "fullName": "John Doe",
    "dateOfBirth": "1980-01-15",
    "email": "john.doe@ufanyc.org",
    "mobilePhone": "555-1234",
    "union": "ufa",                     // Maps to unionId
    "unionMemberId": "UFA-001",
    "height": 72,
    "weight": 180,
    "gender": "male",                   // Maps to genderId
    "status": "pending_verification"    // Maps to statusId
  }
}
```

**Automatic Processing**:
- Union name → Union ID lookup
- Gender → Gender ID lookup  
- Status → Status ID lookup
- Date string → Date object conversion
- Data validation using Zod schemas

#### 2. Blood Pressure Readings Webhook
**Endpoint**: `POST /api/appsheet/webhook/readings`

**Triggers**:
- New BP measurement entry from mobile device
- Reading corrections or updates
- Bulk reading imports
- Device synchronization

**Supported Actions**:
- `ADD`: Create new BP reading
- `UPDATE`: Modify existing reading
- `DELETE`: Remove erroneous reading

**Data Mapping**:
```json
{
  "action": "ADD|UPDATE|DELETE",
  "data": {
    "memberId": 123,
    "systolic": 145,
    "diastolic": 95,
    "heartRate": 72,
    "category": "stage1",              // Maps to categoryId
    "recordedAt": "2025-07-26T14:30:00Z",
    "notes": "Reading taken at home",
    "deviceId": "BP-DEVICE-001",
    "syncedFromDevice": true
  }
}
```

**Automatic Processing**:
- BP category classification (normal, elevated, stage1, stage2, low)
- Abnormal reading detection (isAbnormal flag)
- Automatic workflow task creation for abnormal readings
- Clinical triage assignment based on severity

#### 3. Workflow Tasks Webhook
**Endpoint**: `POST /api/appsheet/webhook/tasks`

**Triggers**:
- Task completion in mobile app
- Task status updates
- Priority changes
- Assignment modifications

**Supported Actions**:
- `ADD`: Create new task
- `UPDATE`: Modify task status/details
- `DELETE`: Cancel/remove task

**Data Mapping**:
```json
{
  "action": "ADD|UPDATE|DELETE",
  "data": {
    "memberId": 123,
    "assignedTo": 456,                 // User ID
    "type": "coach_outreach",          // Maps to typeId
    "priority": "high",                // Maps to priorityId
    "status": "completed",             // Maps to statusId
    "title": "Follow up on abnormal reading",
    "description": "Contact member about 150/95 reading",
    "dueDate": "2025-07-30T00:00:00Z"
  }
}
```

#### 4. Communications Webhook
**Endpoint**: `POST /api/appsheet/webhook/communications`

**Triggers**:
- Call logging from mobile app
- Message sending/receiving
- Communication outcome recording

**Data Mapping**:
```json
{
  "action": "ADD|UPDATE",
  "data": {
    "memberId": 123,
    "type": "call",                    // Maps to typeId
    "status": "completed",             // Maps to statusId
    "subject": "Follow-up call",
    "content": "Discussed recent BP readings",
    "sentAt": "2025-07-26T14:30:00Z",
    "deliveredAt": "2025-07-26T14:30:00Z",
    "respondedAt": "2025-07-26T14:35:00Z"
  }
}
```

### Error Handling & Validation

**Input Validation**:
- All incoming data validated against Zod schemas
- Required fields enforcement
- Data type conversion and sanitization
- Foreign key validation (member exists, valid unions, etc.)

**Error Responses**:
```json
{
  "success": false,
  "error": "Invalid member data: Union 'invalid' not found",
  "timestamp": "2025-07-26T14:30:00Z"
}
```

**Automatic Fallbacks**:
- Missing union defaults to "UFOA"
- Missing status defaults to "pending_verification"
- Invalid dates converted to current timestamp
- Missing categories auto-calculated from BP values

---

## 📤 OUTBOUND DATA FLOW (Main System → AppSheet)

### Triggers
- **Scheduled Sync**: AppSheet polls endpoints every 5-15 minutes
- **Manual Refresh**: User-initiated data refresh in mobile app
- **Initial Load**: New app installation or data reset
- **Bulk Export**: Administrative data export operations

### Export Endpoints

#### 1. Members Export
**Endpoint**: `GET /api/appsheet/export/members`

**Use Cases**:
- Initial member list synchronization
- Periodic member data updates
- New member verification workflow
- Contact information updates

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fullName": "John Doe",
      "dateOfBirth": "1980-01-15",
      "age": 45,
      "email": "john.doe@ufanyc.org",
      "mobilePhone": "555-1234",
      "unionId": 1,
      "unionMemberId": "UFA-001",
      "height": 72,
      "weight": 180,
      "statusId": 1,
      "createdAt": "2025-07-16T00:39:51.212Z",
      "lastActiveAt": "2025-07-26T14:30:00Z"
    }
  ],
  "count": 554,
  "timestamp": "2025-07-26T14:30:00Z"
}
```

#### 2. Blood Pressure Readings Export
**Endpoint**: `GET /api/appsheet/export/readings`

**Query Parameters**:
- `limit`: Maximum number of readings (default: 1000)
- `memberId`: Filter by specific member
- `startDate`: Filter readings after date
- `endDate`: Filter readings before date

**Use Cases**:
- Historical trend analysis
- Abnormal reading alerts
- Clinical review workflows
- Member progress tracking

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "memberId": 1,
      "systolic": 145,
      "diastolic": 95,
      "heartRate": 72,
      "categoryId": 4,
      "notes": "Reading taken at home",
      "recordedAt": "2025-07-16T14:30:00Z",
      "isAbnormal": true,
      "createdAt": "2025-07-16T14:30:00Z"
    }
  ],
  "count": 7473,
  "timestamp": "2025-07-26T14:30:00Z"
}
```

#### 3. Workflow Tasks Export
**Endpoint**: `GET /api/appsheet/export/tasks`

**Query Parameters**:
- `assignedTo`: Filter by assigned user
- `status`: Filter by task status
- `priority`: Filter by priority level
- `memberId`: Filter by member

**Use Cases**:
- Field staff task assignment
- Priority-based task sorting
- Completion tracking
- Workload management

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "memberId": 1,
      "assignedTo": 2,
      "typeId": 1,
      "priorityId": 2,
      "statusId": 1,
      "title": "Follow up on abnormal reading",
      "description": "Contact member about 145/95 reading",
      "dueDate": "2025-07-30T00:00:00Z",
      "createdAt": "2025-07-26T14:30:00Z"
    }
  ],
  "count": 45,
  "timestamp": "2025-07-26T14:30:00Z"
}
```

#### 4. Communications Export
**Endpoint**: `GET /api/appsheet/export/communications`

**Use Cases**:
- Communication history review
- Follow-up scheduling
- Outcome tracking
- Performance metrics

#### 5. Lookup Data Export
**Endpoint**: `GET /api/appsheet/export/lookups`

**Use Cases**:
- Reference data synchronization
- Dropdown list population
- Data validation rules
- UI consistency

**Response Format**:
```json
{
  "success": true,
  "data": {
    "unions": [
      {"id": 1, "name": "ufa", "description": "Uniformed Firefighters Association"},
      {"id": 2, "name": "sinai", "description": "Mount Sinai"}
    ],
    "memberStatuses": [
      {"id": 1, "name": "pending_verification", "description": "Pending Verification"},
      {"id": 2, "name": "active", "description": "Active Member"}
    ],
    "bpCategories": [
      {"id": 1, "name": "normal", "description": "Normal (<120/80)"},
      {"id": 2, "name": "elevated", "description": "Elevated (120-129/<80)"}
    ],
    "taskTypes": [
      {"id": 1, "name": "coach_outreach", "description": "Health Coach Outreach"},
      {"id": 2, "name": "nurse_practitioner", "description": "Nurse Practitioner Review"}
    ]
  },
  "timestamp": "2025-07-26T14:30:00Z"
}
```

#### 6. System Status
**Endpoint**: `GET /api/appsheet/status`

**Use Cases**:
- Health checks
- System monitoring
- Integration testing
- Performance metrics

**Response Format**:
```json
{
  "success": true,
  "data": {
    "totalMembers": 554,
    "totalReadings": 7473,
    "totalTasks": 45,
    "serverTime": "2025-07-26T14:30:00Z",
    "version": "1.0.0",
    "status": "healthy"
  },
  "timestamp": "2025-07-26T14:30:00Z"
}
```

---

## 🔧 Technical Implementation

### Authentication & Security

**API Keys**:
- `APPSHEET_API_KEY_1`: Primary API access key
- `APPSHEET_API_KEY_2`: Secondary/backup API key

**Security Measures**:
- Input validation and sanitization
- SQL injection prevention via Drizzle ORM
- Rate limiting consideration for webhook endpoints
- HTTPS enforcement for production
- Audit logging for all data changes

### Data Transformation

**Automatic Lookups**:
```javascript
// Union name to ID mapping
const unionRecord = await storage.getUnionByName(data.union || 'UFOA');

// Status name to ID mapping  
const statusRecord = await storage.getMemberStatusByName(data.status || 'pending_verification');

// Gender name to ID mapping
const genderRecord = data.gender ? await storage.getGenderByName(data.gender) : null;
```

**BP Category Classification**:
```javascript
// Automatic BP categorization based on AHA guidelines
let categoryName = "normal";
if (systolic >= 180 || diastolic >= 120) categoryName = "stage2";
else if (systolic >= 140 || diastolic >= 90) categoryName = "stage1";
else if (systolic >= 130 || diastolic >= 80) categoryName = "elevated";
else if (systolic < 90 || diastolic < 60) categoryName = "low";
```

**Date Handling**:
```javascript
// Convert string dates to Date objects
recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date(),
dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null
```

### Error Handling & Logging

**Comprehensive Logging**:
```javascript
console.log('AppSheet webhook received:', { action, data });
console.error('AppSheet webhook error:', error);
```

**Graceful Error Recovery**:
- Invalid data falls back to safe defaults
- Partial updates allowed for non-critical fields
- Detailed error messages for debugging
- Transaction rollback on critical failures

---

## 🚀 Usage Examples

### Testing Webhook Integration

#### Add New Member from AppSheet:
```bash
curl -X POST "http://localhost:5000/api/appsheet/webhook/members" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "ADD",
    "data": {
      "fullName": "Maria Rodriguez",
      "dateOfBirth": "1975-08-12",
      "email": "maria.rodriguez@lbanyc.org", 
      "mobilePhone": "555-7890",
      "union": "lba",
      "unionMemberId": "LBA-105",
      "height": 64,
      "weight": 155,
      "gender": "female"
    }
  }'
```

#### Add BP Reading from Mobile Device:
```bash
curl -X POST "http://localhost:5000/api/appsheet/webhook/readings" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "ADD", 
    "data": {
      "memberId": 123,
      "systolic": 155,
      "diastolic": 98,
      "heartRate": 85,
      "recordedAt": "2025-07-26T14:30:00Z",
      "notes": "Taken at fire station",
      "deviceId": "OMRON-001"
    }
  }'
```

#### Complete Task in Field:
```bash
curl -X POST "http://localhost:5000/api/appsheet/webhook/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "UPDATE",
    "data": {
      "id": 15,
      "status": "completed",
      "notes": "Successfully contacted member, scheduled follow-up"
    }
  }'
```

### Testing Export Integration

#### Get Recent Members:
```bash
curl "http://localhost:5000/api/appsheet/export/members?limit=10"
```

#### Get Abnormal Readings:
```bash  
curl "http://localhost:5000/api/appsheet/export/readings?limit=50"
```

#### Get High Priority Tasks:
```bash
curl "http://localhost:5000/api/appsheet/export/tasks?priority=high"
```

---

## 🔄 Workflow Automation

### Automatic Task Creation

**Trigger**: Abnormal BP reading received via webhook
**Action**: Automatic workflow task generation

**Logic**:
1. BP reading categorized as stage1/stage2/elevated
2. `isAbnormal` flag set to `true`
3. Workflow task created automatically:
   - **Stage 2 (≥180/120)**: Nurse Practitioner review (High priority)
   - **Stage 1 (≥140/90)**: Health Coach outreach (Medium priority)  
   - **Elevated (≥130/80)**: Lifestyle coaching (Low priority)

### Clinical Triage Integration

**AI-Powered Assignment**:
- Risk assessment based on BP trends
- Member history analysis
- Automatic staff assignment
- Priority scoring

### Communication Tracking

**Bidirectional Logging**:
- Mobile app logs calls/messages
- Web system tracks outcomes
- Automated follow-up scheduling
- Performance analytics

---

## 📊 Data Consistency & Validation

### Deduplication Logic

**Problem**: Multiple identical readings from device sync
**Solution**: Automatic deduplication based on:
- Member ID
- Systolic/Diastolic values  
- Recorded timestamp
- Device ID (when available)

```javascript
// Remove duplicates in getBpReadingsByMember
const uniqueReadings = allReadings.filter((reading, index, arr) => {
  return index === arr.findIndex(r => 
    r.systolic === reading.systolic && 
    r.diastolic === reading.diastolic && 
    new Date(r.recordedAt).getTime() === new Date(reading.recordedAt).getTime()
  );
});
```

### Union-Specific Validation

**Supported Unions**:
- `UFOA`: 267 members, 3,360 readings
- `ufa`: 242 members, 3,368 readings  
- `lba`: 33 members, 756 readings
- `sinai`: 11 members, 19 readings

**Validation Rules**:
- Union names must match exactly (case-sensitive)
- Union member IDs must be unique within union
- Status transitions follow defined workflows

---

## 🚨 Monitoring & Troubleshooting

### Health Check Endpoint

**Monitor Integration Status**:
```bash
curl "http://localhost:5000/api/appsheet/status"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "totalMembers": 554,
    "totalReadings": 7473,
    "status": "healthy"
  }
}
```

### Common Issues & Solutions

**Webhook Not Triggering**:
1. Check AppSheet bot configuration
2. Verify webhook URL accessibility  
3. Confirm AppSheet app deployment
4. Review AppSheet automation settings

**Data Not Syncing**:
1. Verify field name matching (case-sensitive)
2. Check data type compatibility
3. Review validation error logs
4. Confirm lookup table values

**Authentication Errors**:
1. Verify API keys are set correctly
2. Check AppSheet app permissions
3. Ensure API access is enabled
4. Review authentication headers

### Debug Commands

**View Webhook Logs**:
```bash
# Monitor real-time webhook calls
tail -f server.log | grep "AppSheet webhook"
```

**Test Data Export**:
```bash
# Verify export endpoint functionality
curl -v "http://localhost:5000/api/appsheet/export/members"
```

**Database Validation**:
```bash
# Check record counts match
curl "http://localhost:5000/api/appsheet/status"
```

---

## 📈 Performance Considerations

### Optimization Strategies

**Database Queries**:
- Indexed foreign key relationships
- Efficient JOIN operations via Drizzle ORM
- Query result caching for lookup tables
- Pagination for large datasets

**Webhook Processing**:
- Asynchronous processing for heavy operations
- Batch operations for bulk updates
- Error queuing and retry logic
- Rate limiting prevention

**Export Efficiency**:
- Streaming large datasets
- Incremental sync capabilities
- Compressed response payloads
- Conditional requests (If-Modified-Since)

### Scalability Features

**Horizontal Scaling**:
- Stateless webhook endpoints
- Database connection pooling
- Load balancer compatibility
- Microservice architecture ready

**Data Volume Management**:
- Automatic data archiving strategies
- Configurable retention policies
- Export pagination with cursors
- Real-time vs batch processing options

---

## 🔮 Future Enhancements

### Planned Features

**Real-time Notifications**:
- WebSocket integration for live updates
- Push notifications to mobile devices
- Critical alert escalation
- Multi-channel communication

**Advanced Analytics**:
- Predictive health modeling
- Trend analysis and forecasting  
- Population health insights
- Risk stratification algorithms

**Enhanced Security**:
- OAuth 2.0 authentication
- Role-based access control
- Audit trail compliance
- Data encryption at rest

**Mobile Optimization**:
- Offline data collection
- Background synchronization
- Conflict resolution
- Progressive web app features

---

This documentation provides comprehensive coverage of the bidirectional AppSheet integration, including all data flows, triggers, endpoints, and technical implementation details for the Union-Based Hypertension Program Management System.