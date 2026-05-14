# 🔴 YOUR PROJECT IS PAUSED - Here's How to Fix It

## The Error You're Seeing:
```
Response to preflight request doesn't pass access control check: 
Redirect is not allowed for a preflight request.
```

**This means:** Your Supabase project auto-paused after inactivity (common on free tier).

---

## ✅ SOLUTION (3 Steps):

### **Step 1: Resume Your Project** ⏯️

1. **Go to:** https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd
2. **Look for a banner** at the top that says "Project Paused" or "Project Suspended"
3. **Click the "Resume" or "Restore Project" button**
4. **Wait 2-3 minutes** for the database to start up ⏳

---

### **Step 2: Add Figma Site to CORS Allowed Origins** 🌐

After the project is resumed:

1. **Go to:** https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/settings/api
2. **Scroll down** to "CORS Configuration" section
3. **Click "Add URL"**
4. **Paste this URL:** `https://interropstesting.figma.site`
5. **Click "Save"**

> **Why?** Your app is running on `interropstesting.figma.site` but Supabase doesn't allow it yet.

---

### **Step 3: Refresh Your App** 🔄

1. **Go back** to your app tab
2. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)
3. **Try logging in again**

---

## 📋 **Quick Checklist:**

- [ ] Project resumed in dashboard
- [ ] Waited 2-3 minutes
- [ ] Added `https://interropstesting.figma.site` to CORS origins
- [ ] Saved CORS settings
- [ ] Refreshed the app
- [ ] Connection status banner should disappear

---

## 🎯 **What's Happening:**

### **Free Tier Auto-Pause:**
- Supabase pauses free projects after **1 week of inactivity**
- You said you use it 8am-9pm, so it paused overnight
- This is normal behavior - just resume it each morning

### **The CORS Error:**
When paused, Supabase **redirects** all requests to a "paused" page. Browsers block redirects during CORS checks, causing the error you see.

---

## 🔧 **Keeping It Active:**

To **prevent auto-pausing**, you have 2 options:

### **Option 1: Upgrade to Pro** ($25/month)
- Never pauses
- Better performance
- More features

### **Option 2: Keep It Active on Free Tier**
Add this simple "keep-alive" endpoint that pings your database daily:
- Use a cron job service (like cron-job.org)
- Ping: `https://mjssawaxbmwjqksyevgd.supabase.co/rest/v1/`
- Schedule: Once per day at 7am

---

## 🆘 **Still Not Working?**

### **After resuming, if you still see errors:**

1. **Check project status:**
   - Go to dashboard
   - Look for any alerts or warnings
   - Verify it says "Active" or "Healthy"

2. **Verify CORS settings:**
   - Setting: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/settings/api
   - Should include: `https://interropstesting.figma.site`
   - Should include: `http://localhost:3000` (for development)
   - Should include: `*` (if you want to allow all - less secure)

3. **Clear browser cache:**
   - Open DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

4. **Check Supabase status:**
   - Visit: https://status.supabase.com
   - Make sure there are no ongoing incidents

---

## 📞 **Your Project Details:**

| Item | Value |
|------|-------|
| **Project ID** | `mjssawaxbmwjqksyevgd` |
| **Project URL** | `https://mjssawaxbmwjqksyevgd.supabase.co` |
| **Dashboard** | https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd |
| **API Settings** | https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/settings/api |
| **Your App URL** | `https://interropstesting.figma.site` |

---

## ⚡ **Quick Test:**

After completing all steps, open your browser console and run:

```javascript
window.testSupabaseHealth()
```

**Expected result:**
```
✅ Database is accessible
⚡ Latency: 200ms
```

---

## 💡 **Pro Tip:**

If you're using the app daily from 8am-9pm:
1. **Bookmark the dashboard** for quick access
2. **Check status** before starting work each day
3. **Resume if needed** (takes 2-3 minutes)
4. **Consider upgrading** to Pro if daily resuming becomes annoying

---

**The connection status banner in your app will automatically disappear once everything is working!** 🎉
