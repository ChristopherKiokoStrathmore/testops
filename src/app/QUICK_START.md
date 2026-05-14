# ⚡ Quick Start - Fix Database Connection

## 🚨 **You're seeing connection errors because:**
1. Your Supabase project is **PAUSED** (auto-pauses after inactivity on free tier)
2. Your Figma Site domain is not in **CORS allowed origins**

---

## ✅ **3-Minute Fix:**

### **Step 1: Resume Project** (1 minute)
🔗 **Go here:** https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd

**What you'll see:**
- A banner saying "Project Paused" or "Project Suspended"
- A green "Resume Project" or "Restore Project" button

**What to do:**
- Click the **Resume** button
- ⏳ **Important:** Wait 2-3 minutes for the database to start

---

### **Step 2: Add CORS Origin** (30 seconds)
🔗 **Go here:** https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/settings/api

**Scroll down to find "CORS Configuration" section**

**What to do:**
1. Click **"Add URL"** button
2. Paste: `https://interropstesting.figma.site`
3. Click **"Save"** or **"Add"**
4. The URL should now appear in the list

**Optional but recommended - Also add:**
- `http://localhost:3000` (for local development)
- `http://localhost:5173` (for Vite dev server)

---

### **Step 3: Test Connection** (30 seconds)
🔗 **Go back to your app:** https://interropstesting.figma.site

**What to do:**
1. **Hard refresh** the page (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
2. You should see the red **connection status banner** at top right
3. Click the **"Retry"** button
4. If successful, the banner will **disappear** ✅

**Try logging in:**
- Phone: `+254736967128` (or any tester number)
- Password: `1234`

---

## 🎯 **How to Know It's Working:**

### ✅ **SUCCESS Signs:**
- No red banner at top right
- Login form works
- Can submit tests
- Analytics load properly

### ❌ **STILL BROKEN Signs:**
- Red banner still showing
- CORS errors in console (F12)
- "Failed to fetch" errors

---

## 🔍 **Troubleshooting:**

### **Problem: Still seeing "Database Paused" after resuming**
**Solution:** Wait the full 2-3 minutes. The database needs time to start up.

### **Problem: "Connection Lost" even after CORS added**
**Solutions:**
1. **Check CORS was saved** - Go back and verify the URL is in the list
2. **Check project is active** - Dashboard should say "Active" or "Healthy"
3. **Clear browser cache** - Hard refresh or clear cache in DevTools
4. **Try different browser** - Test in Chrome/Firefox/Safari

### **Problem: Can't find "Resume Project" button**
**Solution:** Your project might already be active. Check the dashboard - if there's no pause banner, it's running.

### **Problem: CORS errors even after adding the URL**
**Solutions:**
1. **Exact match required** - Make sure you added `https://interropstesting.figma.site` (no trailing slash)
2. **Wait a moment** - CORS changes can take 10-30 seconds to propagate
3. **Try wildcard** - As a test, try adding `*` to CORS (allows all origins, less secure)

---

## 📊 **Understanding the Logs:**

### **This is the KEY error:**
```
Response to preflight request doesn't pass access control check: 
Redirect is not allowed for a preflight request.
```

**What it means:** 
- Supabase is **redirecting** requests (because project is paused)
- Browsers **block redirects** during CORS preflight checks
- Result: All API calls fail with CORS errors

**The fix:** Resume the project so it stops redirecting

---

## ⏰ **Daily Workflow (Since You Use 8am-9pm):**

### **Morning Routine (If Paused):**
1. Open dashboard: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd
2. Click "Resume" if paused
3. Wait 2-3 minutes
4. Start testing

### **To Avoid Daily Resuming:**
Consider upgrading to **Pro ($25/month)** for:
- ✅ Never pauses
- ✅ Better performance
- ✅ More database space
- ✅ Priority support

---

## 🛠️ **Console Commands:**

Open browser console (F12) and run these:

### **Test Connection:**
```javascript
window.testSupabaseHealth()
```

**Expected output when working:**
```
{ success: true, message: "Database is accessible", latency: 200 }
```

### **Full Diagnostics:**
```javascript
window.runDiagnostics()
```

**This will show:**
- Browser info
- Network status
- Supabase reachability
- CORS status
- Project status

---

## 📱 **UI Features:**

Your app now has:
- **🔴 Red banner** when database is paused/disconnected
- **Retry button** to test connection again
- **Direct links** to dashboard and CORS settings
- **Instructions** built into the banner
- **Auto-retry** every 30 seconds
- **Auto-hide** when connection restored

---

## 📋 **Checklist for First-Time Setup:**

- [ ] Supabase account logged in
- [ ] Project `mjssawaxbmwjqksyevgd` resumed
- [ ] CORS origin `https://interropstesting.figma.site` added
- [ ] Waited 2-3 minutes after resuming
- [ ] Hard refreshed the app
- [ ] Tested login with a tester account
- [ ] Connection banner disappeared

---

## 🆘 **Still Need Help?**

1. **Read the detailed guide:** `/UNPAUSE_INSTRUCTIONS.md`
2. **Check Supabase status:** https://status.supabase.com
3. **Run diagnostics:** `window.runDiagnostics()` in console
4. **Screenshot the errors** and check the console logs

---

## 🎉 **Once It's Working:**

Your Testing Management App will have:
- ✅ Phone number authentication
- ✅ Daily test logging (M-pesa, Safaricom, USSD, STK)
- ✅ Pass/Fail tracking with prompts
- ✅ Analytics dashboard
- ✅ PDF & CSV exports
- ✅ Developer dashboard (for Kioko)
- ✅ Time slot detection
- ✅ Automatic reminders

**Happy testing! 🚀**
