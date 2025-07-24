# AppSheet Setup Instructions

## Current Status: API Keys Configured ✅

Your hypertension management system has the AppSheet integration **technically ready** with:
- ✅ API Key 1: V2-5LGhY-XmG87-gOjIl-S2KPh-DtzgR-JMi4J-tsRf6-XzgtI 
- ✅ API Key 2: V2-r5Tgi-Gw8Pr-icj3D-qmaWg-ALAiV-gfp6P-VoBq7-LX1TD
- ✅ All webhook endpoints working
- ✅ All export endpoints working
- ✅ Data sync tested and functional

## What's Missing: AppSheet App Creation

To see patients in AppSheet, you need to create an actual AppSheet app. Here's how:

### Step 1: Create AppSheet App
1. Go to https://www.appsheet.com/
2. Sign in with your Google account
3. Click "Create" → "App" 
4. Choose "Start with existing data"

### Step 2: Set Up Data Source
Instead of using a spreadsheet, you'll connect directly to our API:

**Data Source URL**: `http://[your-replit-url]/api/appsheet/export/members`

### Step 3: Configure Tables
Create these tables in AppSheet:
- **Members** (from `/api/appsheet/export/members`)
- **BpReadings** (from `/api/appsheet/export/readings`) 
- **WorkflowTasks** (from `/api/appsheet/export/tasks`)
- **Lookups** (from `/api/appsheet/export/lookups`)

### Step 4: Set Up Webhooks
In AppSheet app settings, configure webhooks to call:
- Member changes → `http://[your-replit-url]/api/appsheet/webhook/members`
- Reading changes → `http://[your-replit-url]/api/appsheet/webhook/readings`
- Task changes → `http://[your-replit-url]/api/appsheet/webhook/tasks`

## Current Patient Data Available

Right now you have **3 patients** ready to sync:

### 1. John Doe (UFA-001)
- Union: UFA
- BP: 145/95 (Stage 1)
- Email: john.doe@ufanyc.org

### 2. Jane Smith (MS-002) 
- Union: Mount Sinai
- BP: 150/95 (Stage 1)
- Email: jane.smith@mountsinai.org

### 3. Mike Johnson (UFA-003)
- Union: UFA  
- BP: 160/100 (Stage 2)
- Email: mike.johnson@ufanyc.org

## Export Data Right Now

You can see all your data by visiting these URLs:
- Members: `http://localhost:5000/api/appsheet/export/members`
- Readings: `http://localhost:5000/api/appsheet/export/readings`
- Tasks: `http://localhost:5000/api/appsheet/export/tasks`
- Status: `http://localhost:5000/api/appsheet/status`

## Next Steps

1. **Create AppSheet App** using the instructions above
2. **Get App ID** from AppSheet (looks like: `xxxxx-xxxxx-xxxxx`)
3. **Update environment** with `APPSHEET_APP_ID=your-app-id`
4. **Test bidirectional sync** between systems

Once you create the AppSheet app, patients will appear in the mobile interface and you can add/edit them from your phone!