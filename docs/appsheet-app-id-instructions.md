# How to Find Your AppSheet App ID

## ✅ You Have API Keys Configured
Your system is ready with these API keys:
- API Key 1: V2-5LGhY... ✅
- API Key 2: V2-r5Tgi... ✅

## ❓ Need Your App ID
To pull members from your **running AppSheet app**, I need the **App ID**.

### Where to Find Your App ID:

**Method 1: AppSheet App URL**
When you open your AppSheet app, the URL looks like:
```
https://www.appsheet.com/start/xxxxx-xxxxx-xxxxx
```
The `xxxxx-xxxxx-xxxxx` part is your **App ID**.

**Method 2: AppSheet Editor**
1. Open your app in AppSheet Editor
2. Look at the URL - it contains your App ID
3. Or go to "Settings" → "App Properties" to see the App ID

**Method 3: App Info**
In your AppSheet app:
1. Go to "Info" tab
2. Look for "App ID" field

### How to Use the App ID:

**Option 1: Provide in API Call**
```bash
curl -X POST "http://localhost:5000/api/appsheet/pull-members" \
  -H "Content-Type: application/json" \
  -d '{"appId": "your-app-id-here"}'
```

**Option 2: Set Environment Variable**
Add to your environment:
```
APPSHEET_APP_ID=your-app-id-here
```

## Once You Provide the App ID:
✅ I'll pull all members from your AppSheet app
✅ Sync them to your hypertension management system  
✅ Show you exactly what members were imported
✅ Handle duplicates automatically

**Your App ID will look something like:**
- `12345-67890-abcde`
- `app-xxxxx-xxxxx-xxxxx`
- Similar format with letters and numbers

Please share your App ID so I can connect to your running AppSheet app!