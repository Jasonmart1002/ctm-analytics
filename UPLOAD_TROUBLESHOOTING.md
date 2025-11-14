# Upload Page Not Showing - Quick Fix

## Issue
The `/dashboard/upload` page is returning 404 or you can't see "Upload Data" in the sidebar.

## Solution

### Step 1: Make Sure You're Signed In
1. Go to http://localhost:3000
2. If you see "Sign In" button, you're NOT signed in
3. Click "Sign In" and log in with your account

### Step 2: Verify Your Role is "Admin"
The upload feature requires admin permissions.

1. Go to https://dashboard.clerk.com
2. Click **"Users"** in the left sidebar
3. Find and click your user account
4. Scroll down to **"Public metadata"**
5. You should see:
   ```json
   {
     "role": "admin"
   }
   ```
6. If you don't see this, click **"Edit"** and add it
7. Click **"Save"**

### Step 3: Create an Organization (If Enabled)
If you enabled Organizations in Clerk:

1. In your app, look for the organization switcher (top-left)
2. Click it
3. Click **"Create organization"**
4. Name it (e.g., "My Company")
5. Click **"Create"**

### Step 4: Refresh Your Browser
1. Go back to your app
2. Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows) to hard refresh
3. You should now see **"Upload Data"** in the sidebar!

## Quick Check

Run this in your browser console (F12 → Console tab):
```javascript
fetch('/api/upload-csv', {
  method: 'POST',
  body: new FormData()
}).then(r => r.json()).then(console.log)
```

Expected responses:
- ✅ `{"error": "No file provided"}` - API works, you're authenticated!
- ❌ `{"error": "Unauthorized"}` - You're not signed in
- ❌ 404 - Server issue

## Still Not Working?

### Check Server Logs
```bash
tail -f /tmp/ctm-dev.log
```

### Verify File Exists
```bash
ls -la app/\(dashboard\)/dashboard/upload/page.tsx
```

### Restart Server
```bash
# Stop server (Ctrl+C in terminal running it)
# Or kill it:
pkill -f "next dev"

# Start again:
cd /Users/jason/ctm-analytics
npm run dev
```

### Check Your Role Permissions
In `lib/auth.ts`, verify admin has uploadData:
```typescript
admin: {
  uploadData: true,  // ← Should be true
  // ...
}
```

## Expected Behavior

When everything is working:
1. ✅ You're signed in
2. ✅ Your role is "admin"  
3. ✅ You're in an organization
4. ✅ Sidebar shows "Upload Data" option
5. ✅ Clicking it takes you to `/dashboard/upload`
6. ✅ You see a drag & drop upload interface

## Test Upload

Once you can see the page:
1. Download sample data: http://localhost:3000/sample-ctm-data.csv
2. Drag & drop it onto the upload area
3. Click "Upload 1 File(s)"
4. Watch it process!
5. Check database: `npx prisma studio`

---

**Most Common Issue:** Not being signed in or not having admin role set in Clerk Dashboard!
