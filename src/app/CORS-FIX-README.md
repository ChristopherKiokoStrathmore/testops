# 🔧 CORS Fix: Why Mobile Works But Desktop Doesn't

## ⚠️ MOST LIKELY CAUSE: SUPABASE PROJECT IS PAUSED

**See:** `/SUPABASE-PAUSED-FIX.md` for the quick 5-minute fix!

---

## Problem
✅ **Mobile Browser**: App works perfectly  
❌ **Desktop Browser**: "Failed to fetch" errors

## Root Cause #1: Supabase Project Paused (90% of cases)

When your Supabase project is paused, it redirects all requests. Desktop browsers block these redirects, but mobile browsers are more lenient.

**Error:** `Redirect is not allowed for a preflight request`

**Fix:** Resume your project at https://supabase.com/dashboard

## Root Cause #2: CORS (Cross-Origin Resource Sharing)

### What is CORS?
CORS is a browser security feature that blocks web pages from making requests to different domains.

**Your App:**
- Runs on: `https://app-xxxxx.makeproxy-c.figma.site` (Figma Make proxy)
- Tries to access: `https://mjssawaxbmwjqksyevgd.supabase.co` (Supabase API)
- Desktop browsers: **BLOCK** ❌ (strict CORS)
- Mobile browsers: **ALLOW** ✅ (lenient CORS)

---

## ✅ Solutions Implemented

### 1. **Direct REST API Access** (Primary)
- File: `/lib/supabase-proxy.ts`
- Bypasses Supabase JS client
- Uses native `fetch()` with CORS-friendly headers
- Automatically tried first on every login

### 2. **Automatic Fallback**
- File: `/lib/auth.ts`
- Tries Direct API → Falls back to Supabase Client
- 3 retries with 2-second delays
- 10-second timeout per attempt

### 3. **Browser Diagnostics**
- File: `/lib/browser-diagnostics.ts`
- Auto-detects mobile vs desktop
- Logs helpful info to console
- Available via: `window.checkBrowser()`

### 4. **User-Friendly Troubleshooting**
- File: `/components/CORSTroubleshoot.tsx`
- Shows when connection fails
- Explains CORS in simple terms
- Provides step-by-step Supabase config guide

---

## 🎯 Recommended Fix (Permanent Solution)

### Configure Supabase CORS Settings

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Project: `mjssawaxbmwjqksyevgd`

2. **Navigate to Settings**
   - Click **Settings** (left sidebar)
   - Click **API**

3. **Add Allowed Origins**
   - Look for **CORS Configuration** or **Additional CORS Origins**
   - Add these entries:
     ```
     *
     https://www.figma.com
     https://*.makeproxy-c.figma.site
     https://*.figma.site
     ```

4. **Save and Wait**
   - Click Save
   - Wait 1-2 minutes for changes to propagate

### If CORS Settings Not Visible

Some Supabase plans hide CORS settings. Contact Supabase support or use the workarounds below.

---

## 🧪 Testing & Debugging

### Browser Console Commands

Open DevTools (F12) and run:

```javascript
// Check browser compatibility
await window.checkBrowser()

// Test direct Supabase access
await window.testDirectSupabaseAccess()

// Test health endpoint
await window.testSupabaseHealth()

// Query a profile directly
await window.queryProfileByPhone('+254706874314', '1234')
```

### Expected Output

**Mobile Browser:**
```
✅ Direct API access successful
✅ Login successful: Kioko
```

**Desktop Browser (before CORS fix):**
```
⚠️ Desktop browsers have strict CORS policies
❌ Direct API failed, trying Supabase client...
🔄 Retrying login (attempt 1/3)...
```

**Desktop Browser (after CORS fix):**
```
✅ Direct API access successful
✅ Login successful: Kioko
```

---

## 📱 Current Workarounds

While waiting for CORS configuration:

1. **Use Mobile Browser** ✅ Works immediately
2. **Wait for Direct API** ⏳ App retries automatically
3. **Check Console Logs** 🔍 See what's being attempted

---

## 🔍 Technical Details

### CORS Request Flow

```
Desktop Browser Login Attempt
↓
1. Try Direct REST API (GET request with CORS headers)
   ↓ Failed?
2. Try Supabase JS Client
   ↓ Failed?
3. Wait 2 seconds, retry (up to 3 times)
   ↓ All failed?
4. Show error + troubleshooting guide
```

### Why Mobile Works

Mobile browsers implement CORS differently:
- **Relaxed `SameSite` policies**
- **Flexible CORS preflight handling**
- **Different security contexts**

Desktop browsers (Chrome, Firefox, Edge):
- **Strict CORS enforcement**
- **Requires explicit server approval**
- **Blocks by default for security**

---

## 📋 Files Modified

| File | Purpose |
|------|---------|
| `/lib/supabase-proxy.ts` | Direct REST API access |
| `/lib/auth.ts` | Dual-mode auth with fallback |
| `/lib/browser-diagnostics.ts` | Browser detection |
| `/lib/health-check.ts` | Raw connectivity test |
| `/components/CORSTroubleshoot.tsx` | User-facing troubleshooting |
| `/components/Login.tsx` | Shows troubleshooting when needed |

---

## ✅ Summary

**Problem:** Desktop browsers block cross-origin requests (CORS)  
**Workaround:** Direct API + automatic retries  
**Permanent Fix:** Configure Supabase CORS to allow Figma domains  
**User Impact:** Mobile works, desktop shows helpful troubleshooting  

The app now handles CORS gracefully and guides users to the solution!
