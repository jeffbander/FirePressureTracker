# AppSheet Integration - Quick Reference

## Current Status ✅
- **Production App ID**: `29320fd7-0017-46ab-8427-0c15b574f046`
- **Members**: 554 across 4 unions (UFOA, ufa, lba, sinai)
- **BP Readings**: 7,473 readings with deduplication logic
- **API Keys**: Configured (APPSHEET_API_KEY_1, APPSHEET_API_KEY_2)

## Data Flow Summary

### 📱 AppSheet → Web System (Inbound)
**Real-time webhooks triggered by mobile app actions:**

| Endpoint | Purpose | Triggers |
|----------|---------|----------|
| `/api/appsheet/webhook/members` | Member data sync | Registration, profile updates, status changes |
| `/api/appsheet/webhook/readings` | BP readings sync | New measurements, device sync, corrections |
| `/api/appsheet/webhook/tasks` | Task updates | Task completion, status changes, assignments |
| `/api/appsheet/webhook/communications` | Call/message logging | Communication outcomes, follow-ups |

### 🌐 Web System → AppSheet (Outbound)
**Scheduled exports for mobile app consumption:**

| Endpoint | Purpose | Refresh Rate |
|----------|---------|--------------|
| `/api/appsheet/export/members` | Member list sync | Every 5-15 minutes |
| `/api/appsheet/export/readings` | BP readings sync | Every 5-15 minutes |
| `/api/appsheet/export/tasks` | Task assignments | Every 5-15 minutes |
| `/api/appsheet/export/lookups` | Reference data | Daily |
| `/api/appsheet/status` | Health check | On-demand |

## Key Features

### 🔄 Automatic Data Processing
- **Union Mapping**: Text names → Database IDs
- **BP Classification**: Automatic AHA guideline categorization
- **Task Creation**: Abnormal readings trigger workflow tasks
- **Deduplication**: Prevents duplicate BP readings

### 🛡️ Data Validation
- **Schema Validation**: All data validated with Zod schemas
- **Error Handling**: Graceful fallbacks with detailed logging
- **Audit Trail**: Complete logging for compliance
- **Soft Deletes**: HIPAA-compliant data archiving

### 📊 Union Distribution
- **UFOA**: 267 members (48%), 3,360 readings
- **ufa**: 242 members (44%), 3,368 readings  
- **lba**: 33 members (6%), 756 readings
- **sinai**: 11 members (2%), 19 readings

## Quick Test Commands

```bash
# Health check
curl "http://localhost:5000/api/appsheet/status"

# Test member webhook
curl -X POST "http://localhost:5000/api/appsheet/webhook/members" \
  -H "Content-Type: application/json" \
  -d '{"action": "ADD", "data": {"fullName": "Test User", "union": "ufa"}}'

# Export recent data
curl "http://localhost:5000/api/appsheet/export/members?limit=5"
```

For complete documentation, see: [AppSheet Bidirectional API Documentation](./appsheet-bidirectional-api-documentation.md)