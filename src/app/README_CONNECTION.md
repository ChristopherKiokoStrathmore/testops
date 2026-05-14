# 🔌 Connection Troubleshooting

## 🎯 **Quick Answer:**

### **Works on another computer?**
→ **Clear your browser cache!**

### **Doesn't work anywhere?**
→ **Supabase project might be paused**

---

## ⚡ **Quick Fix (30 seconds):**

### **For: "Works on Computer B, not Computer A"**

**On the broken computer:**

```
1. Press F12
2. Right-click the refresh button (🔄)
3. Select "Empty Cache and Hard Reload"
4. Close DevTools (F12 again)
5. Done! ✅
```

**Why:** Your browser cached the old "paused project" response.

---

## 🔴 **Quick Fix: Supabase Paused**

### **For: "Doesn't work on any computer"**

**Step 1:** Resume project (1 min)
- Go to: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd
- Click "Resume Project"
- Wait 2-3 minutes

**Step 2:** Add CORS origin (30 sec)
- Go to: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/settings/api
- Click "Add URL"
- Paste: `https://interropstesting.figma.site`
- Click "Save"

**Step 3:** Test (30 sec)
- Refresh your app
- Click "Retry" on the red banner
- Should work! ✅

---

## 📚 **Full Guides:**

### **Browser Cache Issues:**
- `/BROWSER_CACHE_FIX.md` - Step-by-step cache clearing
- `/WHY_ONE_COMPUTER_WORKS.md` - Deep dive explanation
- `/CONNECTION_ISSUES_SUMMARY.md` - Overview

### **Supabase Paused:**
- `/QUICK_START.md` - First-time setup
- `/UNPAUSE_INSTRUCTIONS.md` - Detailed unpause guide

---

## 🧪 **Console Commands:**

Press F12, go to Console tab, and run:

```javascript
// Quick health check
window.testSupabaseHealth()

// Full diagnostics
window.runDiagnostics()
```

---

## ✅ **How to Know It's Fixed:**

### **Success Signs:**
- ✅ No red banner at top-right
- ✅ Can log in
- ✅ Console shows "✅ Supabase Connection Healthy"

### **Still Broken:**
- ❌ Red banner showing
- ❌ CORS errors in console
- ❌ "Failed to fetch" errors

---

## 🆘 **Still Need Help?**

1. Read `/BROWSER_CACHE_FIX.md` (most common)
2. Try Incognito mode (Ctrl+Shift+N)
3. Run `window.runDiagnostics()` in console
4. Check guides above

---

**TL;DR: Press F12 → Right-click refresh → "Empty Cache and Hard Reload"**
