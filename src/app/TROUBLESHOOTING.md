# 🔧 Troubleshooting Guide

## Error: "Network error - check internet connection or CORS settings"

This error means the app cannot reach your Supabase database. Here's how to fix it:

---

## ✅ Step-by-Step Fix

### Step 1: Check if Project is Paused

**Most common cause: Your Supabase project is PAUSED**

1. Go to: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd
2. Look for a banner that says **"Project is paused"** or **"Project is inactive"**
3. Click the **"Resume"** or **"Restore"** button
4. ⏱️ **Wait 2-3 minutes** for the project to fully activate

### Step 2: Verify Internet Connection

1. Open a new tab and visit any website (e.g., google.com)
2. If websites don't load → Fix your internet connection first
3. If websites load → Continue to Step 3

### Step 3: Run Diagnostics

1. Open browser console (Press **F12**)
2. Type: `window.runDiagnostics()`
3. Press Enter
4. Review the output for specific issues

### Step 4: Clear Browser Cache

Sometimes cached data causes issues:

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached images and files"
3. Click "Clear data"

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cache"
3. Click "Clear Now"

**Safari:**
1. Press `Cmd + Option + E`
2. Confirm

### Step 5: Try Incognito/Private Mode

This bypasses all cache and extensions:

- **Chrome/Edge:** `Ctrl + Shift + N`
- **Firefox:** `Ctrl + Shift + P`
- **Safari:** `Cmd + Shift + N`

Then try accessing the app again.

### Step 6: Check Supabase Status

1. Visit: https://status.supabase.com
2. Check if there are any ongoing incidents
3. If yes → Wait for Supabase to resolve the issue

---

## 🎯 Quick Tests

### Test 1: Check if Supabase URL is Reachable

Open browser console (F12) and run:

```javascript
fetch('https://mjssawaxbmwjqksyevgd.supabase.co')
  .then(() => console.log('✅ URL is reachable'))
  .catch(err => console.error('❌ Cannot reach URL:', err.message))
```

**Expected:** `✅ URL is reachable`

### Test 2: Check Health

```javascript
await window.testSupabaseHealth()
```

**Expected:** `{ success: true, message: "Database is accessible", latency: <number> }`

### Test 3: Full Diagnostics

```javascript
await window.runDiagnostics()
```

**Expected:** Detailed report showing all green checkmarks

---

## 🚨 Common Error Messages

| Error Message | Meaning | Fix |
|---------------|---------|-----|
| "Project is PAUSED" | Supabase project inactive | Resume in dashboard, wait 2-3 min |
| "Connection timeout" | Request taking too long | Check internet, project might be starting |
| "Failed to fetch" | Cannot reach server | Project paused or internet issue |
| "CORS error" | Security policy blocking | Project is paused (most common) |
| "Invalid credentials" | Wrong phone/password | Check credentials (default: 1234) |

---

## 💡 Why This Happens

### Paused Projects (Most Common)

Supabase automatically pauses projects on free tier if:
- Not accessed for 7+ days
- Manually paused by you
- Billing issue

**Solution:** Resume the project and wait 2-3 minutes

### CORS Issues (Less Common)

Cross-Origin Resource Sharing (CORS) prevents browsers from accessing APIs from different domains.

**Solution:** 
1. Check if project is paused first (99% of time)
2. If not paused, add your domain to Supabase allowed origins:
   - Go to: Settings → API
   - Add `*` or your specific origin to "Additional URLs"

### Network Issues (Rare)

Your internet connection or firewall blocking access.

**Solution:** Check internet, try different network, disable VPN/firewall temporarily

---

## ✅ When It's Working

You should see:

### Login Page:
```
┌────────────────────────────────┐
│ ✅ Connection Successful       │
│ Supabase project is active and │
│ responding                     │
└────────────────────────────────┘
```

### Console (F12):
```
✅ Supabase connection healthy
✅ Health check passed (150ms)
💡 Tip: Run window.runDiagnostics() for detailed diagnostics
```

### Login Works:
- Enter phone: `0706874314`
- Enter password: `1234`
- Click "Sign In"
- Dashboard loads immediately

---

## 🆘 Still Not Working?

### Try These:

1. **Wait Longer** - After resuming, wait a full 5 minutes
2. **Different Browser** - Try Chrome, Firefox, or Safari
3. **Different Device** - Try on your phone or another computer
4. **Different Network** - Try mobile data instead of WiFi
5. **Check Supabase Dashboard** - Verify project shows "Active" status

### Check Console for Specific Errors:

Press F12 and look at:
- **Console tab** - Error messages
- **Network tab** - Failed requests
- Look for red text or ❌ symbols

### Get Detailed Info:

Run in console:
```javascript
await window.runDiagnostics()
```

This will show exactly what's failing.

---

## 📞 Support Resources

- **Supabase Dashboard:** https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd
- **Supabase Status:** https://status.supabase.com
- **Supabase Docs:** https://supabase.com/docs

---

## 🎉 Success Checklist

- [ ] Project shows "Active" in Supabase dashboard
- [ ] Green "Connection Successful" banner on login page
- [ ] No errors in browser console (F12)
- [ ] Can log in with test credentials
- [ ] Dashboard loads after login
- [ ] Can submit test logs

If all checked → **You're all set!** 🚀

---

## 🔄 After Resuming Project

**Timeline:**

| Time | Status |
|------|--------|
| 0 min | Click "Resume" button |
| 30 sec | Database starts waking up |
| 1 min | DNS records updating |
| 2 min | API endpoints activating |
| 3 min | ✅ Fully operational |

**Be patient!** The full activation takes 2-3 minutes.

---

## 💻 Developer Tools

The app includes helpful console tools:

```javascript
// Run full diagnostics
await window.runDiagnostics()

// Test health check
await window.testSupabaseHealth()

// Check browser info
window.checkBrowser()

// Test simple query
await window.simpleQuery('+254706874314', '1234')
```

All these are available in the browser console (F12).

---

**Last Updated:** After CORS fix implementation
