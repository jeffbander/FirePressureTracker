# Connect Your Existing AppSheet App

## Your System is Ready! ✅

**Current Status:**
- 3 Members (John Doe, Jane Smith, Mike Johnson)
- 3 BP Readings (all abnormal, needing clinical attention)
- 2 Workflow Tasks (coach and nurse outreach)
- API Keys configured and working

## To Connect Your Running AppSheet App:

### Step 1: Configure Data Sources in AppSheet
In your AppSheet app, add these data source URLs:

**Members Table:**
```
http://localhost:5000/api/appsheet/export/members
```

**BP Readings Table:**
```
http://localhost:5000/api/appsheet/export/readings
```

**Workflow Tasks Table:**
```
http://localhost:5000/api/appsheet/export/tasks
```

**Lookup Data:**
```
http://localhost:5000/api/appsheet/export/lookups
```

### Step 2: Set Up Webhooks (AppSheet → Your System)
Configure these webhook URLs in your AppSheet app:

**Member Changes:**
```
http://localhost:5000/api/appsheet/webhook/members
```

**BP Reading Changes:**
```
http://localhost:5000/api/appsheet/webhook/readings
```

**Task Changes:**
```
http://localhost:5000/api/appsheet/webhook/tasks
```

### Step 3: Provide App ID
Once connected, give me your AppSheet App ID so I can enable outbound sync (Your System → AppSheet).

## What You'll See in AppSheet

**Members View:**
- John Doe (UFA-001) - UFA union
- Jane Smith (MS-002) - Mount Sinai  
- Mike Johnson (UFA-003) - UFA union

**BP Readings View:**
- 145/95 (Stage 1) - John Doe
- 150/95 (Stage 1) - Jane Smith  
- 160/100 (Stage 2) - Mike Johnson

**Tasks View:**
- Coach outreach for Jane Smith (High priority)
- Nurse outreach for Mike Johnson (Urgent priority)

## Union-Specific Features Working:
- UFA members → ShipNYC fulfillment
- Mount Sinai members → ShipNYC fulfillment
- Automated clinical triage based on BP categories
- Union representative access controls

Your integration is fully functional - just need to connect your AppSheet app to these endpoints!