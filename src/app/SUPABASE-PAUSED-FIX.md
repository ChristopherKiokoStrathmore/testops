# 🔴 SUPABASE PROJECT PAUSED - QUICK FIX

## Error You're Seeing

```
Access to fetch at 'https://mjssawaxbmwjqksyevgd.supabase.co/rest/v1/profiles...' 
has been blocked by CORS policy: Response to preflight request doesn't pass access 
control check: Redirect is not allowed for a preflight request.
```

## What This Means

⚠️ **Your Supabase project is PAUSED or INACTIVE**

When a Supabase project is paused, it redirects all API requests. Desktop browsers reject these redirects during CORS preflight checks, causing the "Failed to fetch" error.

Mobile browsers are more lenient and might work around this - that's why it works on mobile!

---

## ✅ QUICK FIX (5 minutes)

### Step 1: Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard
2. Log in with your Supabase account
3. Select project: **mjssawaxbmwjqksyevgd**

### Step 2: Check Project Status

Look for a banner that says:
- "Project Paused"
- "Inactive Project"  
- "Resume Project"

### Step 3: Resume Project

1. Click **"Resume Project"** or **"Restore Project"**
2. Wait 1-2 minutes for the project to fully activate
3. You'll see a green "Active" status

### Step 4: Test

1. Go back to your app
2. Refresh the browser
3. Try logging in with:
   - Phone: `0706874314` (or any tester)
   - Password: `1234`

---

## Why Does This Happen?

Supabase pauses free-tier projects after:
- **7 days of inactivity**
- **Long periods without API calls**
- **Resource limits exceeded**

Resuming is:
- ✅ **FREE**
- ✅ **Instant** (1-2 minutes)
- ✅ **No data loss**

---

## Alternative: Configure CORS (if resuming doesn't fix it)

If resuming the project doesn't work, configure CORS:

1. In Supabase Dashboard → **Settings** → **API**
2. Scroll to **"CORS Configuration"**  
3. Add: `*` (allow all origins)
4. Or specifically: `https://*.figma.site`
5. Click **Save**
6. Wait 1-2 minutes

---

## Verification

After resuming, check in browser console (F12):

```javascript
// Should now show project is active
await window.checkProjectStatus()

// Should successfully query
await window.simpleQuery('+254706874314', '1234')
```

---

## Still Not Working?

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Try incognito mode**
3. **Wait 5 minutes** (DNS propagation)
4. **Check Supabase status**: https://status.supabase.com

---

## Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| Works on mobile ✅ | Mobile browsers lenient | - |
| Fails on desktop ❌ | Strict CORS + Redirect | Resume project |
| "Redirect not allowed" | Project paused | Go to dashboard |
| "Failed to fetch" | Network/CORS | Check project status |

**Most common fix:** Just resume the paused project! 🎉
