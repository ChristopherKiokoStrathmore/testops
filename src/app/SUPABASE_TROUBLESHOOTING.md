# Supabase Connection Troubleshooting Guide

## Current Issue: CORS "Redirect not allowed" Error

This error means the Supabase REST API is redirecting requests instead of responding, which happens when:
1. **Project is paused** (most common)
2. **REST API gateway is still initializing** after restore
3. **Project is being migrated** to a new server

## Quick Fix Steps

### Step 1: Check Project Status
1. Go to: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd
2. Look for status indicator (should be green "Active")
3. If paused, click "Restore Project"

### Step 2: Wait for Full Initialization
After restoring:
- **Database (SQL)**: Available immediately (30 seconds)
- **REST API**: Takes 5-10 minutes to fully initialize
- **Realtime**: Takes 3-5 minutes

The app needs the **REST API** to work, so wait the full 10 minutes.

### Step 3: Verify with Direct API Test
Open browser console on your app and run:
```javascript
fetch('https://mjssawaxbmwjqksyevgd.supabase.co/rest/v1/profiles?select=id&limit=1', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qc3Nhd2F4Ym13anFrc3lldmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDk0OTIsImV4cCI6MjA4NDk4NTQ5Mn0.v5Y4jNn9lLDbrjd4EdYzFPwXRlzgQomS32Mnz686X9U',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qc3Nhd2F4Ym13anFrc3lldmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDk0OTIsImV4cCI6MjA4NDk4NTQ5Mn0.v5Y4jNn9lLDbrjd4EdYzFPwXRlzgQomS32Mnz686X9U'
  }
}).then(r => r.json()).then(console.log).catch(console.error);
```

**Success**: Returns `[{id: "..."}]`  
**Still initializing**: CORS error

### Step 4: Force Restart (If Still Not Working After 15 Minutes)
1. Dashboard → Settings → General
2. Click "Pause Project"
3. Wait 1 minute
4. Click "Restore Project"
5. Wait 10 minutes

## Confirmed Working Settings

✅ **Project URL**: https://mjssawaxbmwjqksyevgd.supabase.co  
✅ **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  
✅ **RLS Disabled**: Both tables (profiles, test_logs)  
✅ **Database Status**: Active (15 profiles)  
✅ **Permissions**: anon role has full access

## What's Working vs Not Working

| Component | Status | Evidence |
|-----------|--------|----------|
| Database (SQL) | ✅ Working | Query returned 15 profiles |
| Row Level Security | ✅ Disabled | `rowsecurity = false` |
| Permissions | ✅ Granted | anon has ALL on both tables |
| REST API Gateway | ❌ Initializing | CORS redirect error |

## Timeline

The REST API typically takes:
- **0-2 minutes**: Database online (SQL works)
- **2-5 minutes**: Realtime online
- **5-10 minutes**: REST API fully online
- **10+ minutes**: Contact Supabase support

## App Features During Initialization

The app now shows:
- 🔵 **Checking connection**: Testing API
- 🟢 **Database connected**: Ready to login
- 🟡 **Database initializing**: Wait and retry

Click "Retry" button to test connection again.

## When to Try Logging In

✅ **Safe to try**: When connection indicator is green  
⏳ **Wait**: When connection indicator is yellow  
🔄 **Retry**: Click retry button every 2-3 minutes

## Default Test Credentials

Phone: `0706874314` (Kioko - Developer)  
Password: `1234`

---

**Last Updated**: 2026-01-29  
**Database Status**: Online ✅  
**REST API Status**: Initializing ⏳
