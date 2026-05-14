# 🔧 CORS Desktop Browser Fix

## The Problem

Your app works on **mobile browsers** but fails on **desktop browsers** with this error:
```
Access to fetch blocked by CORS policy: Response to preflight request doesn't pass access control check: Redirect is not allowed for a preflight request.
```

## Root Cause

Desktop browsers enforce CORS more strictly than mobile browsers. Your Supabase project is returning a **redirect** during CORS preflight checks, which desktop browsers block.

## ✅ SOLUTION: Fix Supabase CORS Settings

### Step 1: Add Figma Site to Supabase CORS

1. Go to **https://supabase.com/dashboard**
2. Select your project: **mjssawaxbmwjqksyevgd**
3. Click **Settings** (gear icon in left sidebar)
4. Click **API** section
5. Scroll down to **"CORS Configuration"** or **"API Settings"**
6. Look for **"Additional Allowed Origins"** or **"CORS Allowed Origins"**
7. **Add this URL:**
   ```
   https://interropstesting.figma.site
   ```
8. Click **Save** or **Update**
9. **Wait 2-3 minutes** for changes to propagate

### Step 2: Verify RLS Policies

Your Row Level Security (RLS) policies must allow anonymous access:

1. In Supabase Dashboard, go to **Authentication** → **Policies**
2. Check `profiles` table:
   - Should have a policy allowing SELECT for anon role
3. Check `test_logs` table:
   - Should allow SELECT and INSERT for anon role

### Step 3: Check API Keys

Verify your API keys haven't expired:

1. Go to **Settings** → **API**
2. Copy the **anon public** key
3. Compare with the key in your app (starts with `eyJhbGci...`)
4. If different, update `/lib/supabase.ts` with the new key

## 🎯 Quick Test

After making changes, test immediately:

1. **Clear browser cache:**
   - Chrome: Press `Ctrl+Shift+Delete` → Clear cached images and files
   - Or use Incognito/Private window

2. **Test connection in console:**
   ```javascript
   window.testSupabaseHealth()
   ```

3. **Try logging in again**

## 🔍 If Still Not Working

### Option A: Check Browser Extensions

Some extensions block CORS:
- Try disabling ad blockers
- Try disabling privacy extensions
- Test in Incognito mode

### Option B: Verify Supabase Project Status

1. Go to Supabase Dashboard
2. Check if project shows **"ACTIVE"** (green)
3. If paused, click **Resume Project**
4. Wait 2-3 minutes for full activation

### Option C: Check DNS/Network

Desktop and mobile might use different DNS:
```javascript
// In browser console, test direct connection:
fetch('https://mjssawaxbmwjqksyevgd.supabase.co/rest/v1/', {
  method: 'HEAD',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qc3Nhd2F4Ym13anFrc3lldmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDk0OTIsImV4cCI6MjA4NDk4NTQ5Mn0.v5Y4jNn9lLDbrjd4EdYzFPwXRlzgQomS32Mnz686X9U'
  }
}).then(r => console.log('✅ Direct connection works!', r.status))
  .catch(e => console.error('❌ Connection failed:', e));
```

## 📝 Technical Details

**Why Mobile Works But Desktop Doesn't:**

1. **Mobile browsers** are more lenient with CORS and may cache auth
2. **Desktop browsers** (especially Chrome) strictly enforce CORS preflight rules
3. **Preflight requests** are OPTIONS requests that check CORS before actual requests
4. If Supabase returns a **redirect** (302/301) during preflight, desktop browsers reject it

**The Redirect Happens When:**
- CORS origin is not whitelisted
- Project is in transition state
- API keys are invalid
- RLS policies block anon access

## 🚀 Expected Result

After fixing CORS settings, you should see:
```
✅ Health check passed
✅ Connection established
✅ Login successful
```

## ⚠️ Important Notes

1. **CORS changes take 2-3 minutes** to propagate
2. **Clear browser cache** after making changes
3. **Test in Incognito** to avoid cache issues
4. **Both HTTP and HTTPS** might need to be added if using both

## 📞 Still Having Issues?

If problems persist after following all steps:
1. Run `window.runDiagnostics()` in browser console
2. Check if other Figma sites can access your Supabase
3. Verify you're using the correct Supabase URL
4. Consider creating a new API key if current one is old

---

**Last Updated:** Now  
**Status:** Active Issue - CORS Configuration Needed
