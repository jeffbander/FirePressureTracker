# AppSheet Integration Examples

This document provides comprehensive examples for testing the AppSheet integration with the Union-Based Hypertension Program Management System.

## Testing the Integration

### 1. Health Check

```bash
curl "http://localhost:5000/api/appsheet/status"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "totalMembers": 2,
    "totalReadings": 2,
    "totalTasks": 0,
    "serverTime": "2025-07-24T22:39:33.123Z",
    "version": "1.0.0",
    "status": "healthy"
  }
}
```

### 2. Export Data (AppSheet → Main System)

#### Export Members
```bash
curl "http://localhost:5000/api/appsheet/export/members"
```

#### Export BP Readings
```bash
curl "http://localhost:5000/api/appsheet/export/readings"
```

#### Export Tasks
```bash
curl "http://localhost:5000/api/appsheet/export/tasks"
```

#### Export Communications
```bash
curl "http://localhost:5000/api/appsheet/export/communications"
```

#### Export Lookup Data
```bash
curl "http://localhost:5000/api/appsheet/export/lookups"
```

### 3. Webhook Testing (AppSheet → Main System)

#### Add New Member
```bash
curl -X POST "http://localhost:5000/api/appsheet/webhook/members" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "ADD",
    "data": {
      "fullName": "Jane Smith",
      "dateOfBirth": "1985-03-20",
      "email": "jane.smith@mountsinai.org",
      "mobilePhone": "555-5678",
      "union": "Mount Sinai",
      "unionMemberId": "MS-002",
      "height": 65,
      "weight": 140,
      "gender": "female"
    }
  }'
```

#### Update Member
```bash
curl -X POST "http://localhost:5000/api/appsheet/webhook/members" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "UPDATE",
    "data": {
      "id": 2,
      "mobilePhone": "555-9999",
      "weight": 145
    }
  }'
```

#### Add BP Reading
```bash
curl -X POST "http://localhost:5000/api/appsheet/webhook/readings" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "ADD",
    "data": {
      "memberId": 2,
      "systolic": 150,
      "diastolic": 95,
      "heartRate": 78,
      "category": "stage1",
      "recordedAt": "2025-07-24T22:30:00Z",
      "notes": "Evening reading from AppSheet"
    }
  }'
```

#### Add Workflow Task
```bash
curl -X POST "http://localhost:5000/api/appsheet/webhook/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "ADD",
    "data": {
      "memberId": 2,
      "type": "coach_outreach",
      "priority": "high",
      "status": "pending",
      "description": "Follow up on high BP reading from AppSheet",
      "notes": "Member reported Stage 1 hypertension"
    }
  }'
```

## Data Mapping

### Union Names
- "UFA" → UFA union (ID: 1)
- "Mount Sinai" → Mount Sinai union (ID: 2)
- "LBA" → LBA union (ID: 3)
- "UFOA" → UFOA union (ID: 4)

### Member Statuses
- "pending_verification" → Awaiting union verification
- "approved" → Approved by union
- "active_members" → Active program members
- "inactive_members" → Inactive program members

### BP Categories
- "normal" → Normal blood pressure
- "elevated" → Elevated blood pressure
- "stage1" → Stage 1 Hypertension
- "stage2" → Stage 2 Hypertension
- "crisis" → Hypertensive Crisis

### Task Types
- "coach_outreach" → Coach outreach for BP management
- "nurse_outreach" → Nurse practitioner consultation
- "urgent_call" → Urgent medical consultation
- "follow_up" → Follow-up communication

### Task Priorities
- "low" → Low priority (level 1)
- "medium" → Medium priority (level 2)
- "high" → High priority (level 3)
- "urgent" → Urgent priority (level 4)

### Task Statuses
- "pending" → Task not yet started
- "in_progress" → Task is being worked on
- "completed" → Task completed successfully
- "cancelled" → Task cancelled

## Error Handling

The integration includes comprehensive error handling:

1. **Invalid data validation** - Returns detailed error messages
2. **Missing lookup data** - Falls back to default values
3. **Database errors** - Returns proper HTTP status codes
4. **Date format handling** - Automatically converts string dates to Date objects

## Security Considerations

1. All endpoints validate input data
2. Database operations use parameterized queries
3. Error messages don't expose sensitive information
4. Rate limiting should be implemented for production use

## Performance Optimization

1. Batch operations for multiple records
2. Efficient database queries with proper indexing
3. Caching of lookup table data
4. Minimal data transformation overhead