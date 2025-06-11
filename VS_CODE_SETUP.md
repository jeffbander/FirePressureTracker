# VS Code Login Fix - Fire Department BP System

## The Problem
Login isn't working because both Node.js and Django servers are trying to run on port 5000, causing authentication conflicts.

## Solution: Run Only Django Server

### Step 1: In VS Code
1. Open the **Run and Debug** panel (Ctrl+Shift+D / Cmd+Shift+D)
2. Select **"Django Server"** from the dropdown
3. Click the **Play button** (▶️)

### Step 2: Verify Django is Running
- Open browser to: http://localhost:5000/admin/
- Login with: **username:** `admin` **password:** `password`

### Step 3: If Login Still Fails
Run these commands in VS Code terminal:

```bash
cd django_bp_system
python3 manage.py shell -c "
from bp_management.models import User
admin = User.objects.get(username='admin')
admin.set_password('password')
admin.save()
print('Password reset for admin user')
"
```

### Step 4: Test Login
- Django Admin: http://localhost:5000/admin/
- API Login: Use username `admin` and password `password`

## Default Users Available
- **Admin**: username `admin`, password `password`
- **Nurse**: username `nurse`, password `password`  
- **Coach**: username `coach`, password `password`

## Important Notes
- Only run the Django server (not Node.js)
- Use `python3` instead of `python` on macOS
- Make sure you're in the `django_bp_system` directory
- PostgreSQL database must be running

## Troubleshooting
If authentication still fails:
1. Stop all servers
2. Delete any existing sessions
3. Run only Django server via VS Code Debug Panel
4. Test login at /admin/ first before using the app