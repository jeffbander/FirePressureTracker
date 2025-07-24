# AppSheet Integration Guide

## Overview

This guide explains how to connect your AppSheet app to the Union-Based Hypertension Program Management System for bidirectional data synchronization. The integration supports real-time data sync for members, BP readings, tasks, and lookup tables.

## Prerequisites

1. **AppSheet App Configuration**:
   - Your AppSheet app must be published and accessible via API
   - You need the Application Access Key (API token)
   - Your app should have tables matching our data structure

2. **Required Environment Variables**:
   ```bash
   APPSHEET_APP_ID=your-app-id-here
   APPSHEET_ACCESS_TOKEN=your-access-token-here
   APPSHEET_BASE_URL=https://api.appsheet.com/api/v2/apps
   ```

## AppSheet Table Structure

### Members Table (Required)
Your AppSheet app should have a "Members" table with these columns:

| Column Name | Type | Description |
|-------------|------|-------------|
| id | Number | Primary key (auto-generated) |
| fullName | Text | Member's full name |
| dateOfBirth | Date | Date of birth |
| email | Email | Email address |
| mobilePhone | Phone | Mobile phone number |
| unionId | Number | Union ID (foreign key) |
| unionMemberId | Text | Union-specific member ID |
| height | Number | Height in inches |
| weight | Number | Weight in pounds |
| statusId | Number | Member status ID (foreign key) |
| createdAt | DateTime | Creation timestamp |
| lastActiveAt | DateTime | Last activity timestamp |

### BpReadings Table (Required)
| Column Name | Type | Description |
|-------------|------|-------------|
| id | Number | Primary key (auto-generated) |
| memberId | Number | Member ID (foreign key) |
| systolic | Number | Systolic pressure |
| diastolic | Number | Diastolic pressure |
| heartRate | Number | Heart rate (optional) |
| categoryId | Number | BP category ID (foreign key) |
| notes | LongText | Reading notes |
| recordedAt | DateTime | When reading was taken |
| isAbnormal | Yes/No | Whether reading is abnormal |
| createdAt | DateTime | Creation timestamp |

### Tasks Table (Optional)
| Column Name | Type | Description |
|-------------|------|-------------|
| id | Number | Primary key (auto-generated) |
| memberId | Number | Member ID (foreign key) |
| assignedTo | Number | Assigned user ID |
| title | Text | Task title |
| description | LongText | Task description |
| typeId | Number | Task type ID (foreign key) |
| priorityId | Number | Priority ID (foreign key) |
| statusId | Number | Status ID (foreign key) |
| createdByAi | Yes/No | Whether created by AI |
| dueDate | DateTime | Due date |
| completedAt | DateTime | Completion timestamp |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

## Webhook Configuration

### Step 1: Configure AppSheet Webhooks

In your AppSheet app, set up webhooks for data changes:

1. Go to **Automation** > **Bots**
2. Create a new bot for each table you want to sync
3. Set the webhook URL to your system endpoints:

**Member Changes Webhook:**
- URL: `https://your-domain.com/api/appsheet/webhook/members`
- Method: POST
- Headers: `Content-Type: application/json`

**BP Readings Webhook:**
- URL: `https://your-domain.com/api/appsheet/webhook/readings`
- Method: POST
- Headers: `Content-Type: application/json`

**Tasks Webhook:**
- URL: `https://your-domain.com/api/appsheet/webhook/tasks`
- Method: POST
- Headers: `Content-Type: application/json`

### Step 2: Webhook Payload Format

AppSheet will send payloads in this format:

```json
{
  "action": "ADD|UPDATE|DELETE",
  "data": {
    "id": 123,
    "fullName": "John Doe",
    "dateOfBirth": "1980-01-15",
    "email": "john.doe@example.com",
    "union": "UFA",
    "status": "pending_verification"
  }
}
```

## API Endpoints

### Data Export Endpoints (For Initial Sync)

**Get All Members:**
```
GET /api/appsheet/export/members
```

**Get All BP Readings:**
```
GET /api/appsheet/export/readings?limit=1000&memberId=123
```

**Get All Tasks:**
```
GET /api/appsheet/export/tasks
```

**Get Lookup Tables:**
```
GET /api/appsheet/export/lookups
```

**System Status:**
```
GET /api/appsheet/status
```

### Webhook Endpoints (For Real-time Sync)

**Member Data Sync:**
```
POST /api/appsheet/webhook/members
Content-Type: application/json

{
  "action": "ADD",
  "data": {
    "fullName": "John Doe",
    "dateOfBirth": "1980-01-15",
    "email": "john.doe@ufanyc.org",
    "union": "UFA",
    "unionMemberId": "UFA-001"
  }
}
```

**BP Reading Sync:**
```
POST /api/appsheet/webhook/readings
Content-Type: application/json

{
  "action": "ADD",
  "data": {
    "memberId": 1,
    "systolic": 145,
    "diastolic": 95,
    "heartRate": 72,
    "notes": "Reading taken at home"
  }
}
```

**Task Sync:**
```
POST /api/appsheet/webhook/tasks
Content-Type: application/json

{
  "action": "ADD",
  "data": {
    "memberId": 1,
    "title": "Follow up on BP reading",
    "description": "Member has elevated BP, needs coaching",
    "taskType": "coach_outreach",
    "priority": "high"
  }
}
```

## Data Mapping

### Status Mapping
The system uses integer IDs internally but accepts string values from AppSheet:

**Member Statuses:**
- `pending_verification` → 1
- `approved` → 2
- `rejected` → 3
- `awaiting_shipment` → 4
- `shipped` → 5
- `delivered` → 6
- `pending_first_reading` → 7
- `active_members` → 8
- `inactive_members` → 9

**BP Categories:**
- `normal` → 1 (<120 and <80)
- `elevated` → 2 (120-129 and <80)
- `stage1` → 3 (130-139 or 80-89)
- `stage2` → 4 (≥140 or ≥90)
- `crisis` → 5 (≥180 or ≥120)

**Task Types:**
- `coach_outreach` → 1
- `nurse_outreach` → 2
- `urgent_call` → 3
- `follow_up` → 4
- `no_action` → 5

**Task Priorities:**
- `low` → 1
- `medium` → 2
- `high` → 3
- `urgent` → 4

**Unions:**
- `UFA` → 1
- `Mount Sinai` → 2
- `LBA` → 3
- `UFOA` → 4

## Implementation Steps

### 1. Set Up Environment Variables

Add these to your environment configuration:

```bash
# AppSheet Configuration
APPSHEET_APP_ID=your-app-id-here
APPSHEET_ACCESS_TOKEN=your-access-token-here
APPSHEET_BASE_URL=https://api.appsheet.com/api/v2/apps
```

### 2. Initial Data Sync

Use the export endpoints to perform an initial sync of existing data:

```bash
# Export members to AppSheet
curl -X GET "https://your-domain.com/api/appsheet/export/members"

# Export BP readings to AppSheet
curl -X GET "https://your-domain.com/api/appsheet/export/readings"

# Get lookup table data for reference
curl -X GET "https://your-domain.com/api/appsheet/export/lookups"
```

### 3. Configure Real-time Sync

Set up AppSheet webhooks to call your webhook endpoints whenever data changes in AppSheet.

### 4. Test the Integration

```bash
# Test webhook endpoint
curl -X POST "https://your-domain.com/api/appsheet/webhook/members" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "ADD",
    "data": {
      "fullName": "Test User",
      "dateOfBirth": "1985-05-15",
      "email": "test@example.com",
      "union": "UFA",
      "unionMemberId": "TEST-001"
    }
  }'

# Check system status
curl -X GET "https://your-domain.com/api/appsheet/status"
```

## Error Handling

The integration includes comprehensive error handling:

- **Invalid Data**: Returns 400 with validation errors
- **Missing Records**: Returns 404 for non-existent records
- **Server Errors**: Returns 500 with error details
- **Authentication**: Webhook endpoints are open but can be secured with API keys

All webhook responses include:
```json
{
  "success": true|false,
  "message": "Description of result",
  "error": "Error details if failed"
}
```

## Data Flow Diagram

```
AppSheet App ←→ Webhooks ←→ Your System
     ↑                           ↓
   Mobile Users              PostgreSQL DB
     ↑                           ↓
   Field Staff              Analytics & AI
```

## Security Considerations

1. **API Authentication**: Consider adding API key authentication to webhook endpoints
2. **Data Validation**: All incoming data is validated against schemas
3. **Audit Logging**: All data changes are logged for compliance
4. **Rate Limiting**: Consider implementing rate limiting for webhook endpoints
5. **HTTPS Only**: All endpoints should use HTTPS in production

## Troubleshooting

### Common Issues

**Webhook Not Triggering:**
- Check AppSheet bot configuration
- Verify webhook URL is accessible
- Check AppSheet app deployment status

**Data Not Syncing:**
- Verify field names match exactly
- Check data types and validation rules
- Review error logs in system console

**Authentication Errors:**
- Verify APPSHEET_ACCESS_TOKEN is correct
- Check AppSheet app permissions
- Ensure API access is enabled

### Debug Endpoints

**Test Connection:**
```bash
curl -X GET "https://your-domain.com/api/appsheet/status"
```

**View Logs:**
Check server logs for detailed error information and webhook payloads.

## Support

For implementation assistance or troubleshooting, the system includes comprehensive logging and error reporting. All webhook calls and API responses are logged for debugging purposes.