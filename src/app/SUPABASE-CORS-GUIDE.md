# 🎯 Supabase CORS Configuration - Visual Guide

## Direct Link (Fastest Way)

**Click here to go directly to the settings:**  
🔗 https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/settings/api

---

## Step-by-Step Navigation

### Method 1: From Dashboard Home

```
1. Go to https://supabase.com/dashboard
2. You'll see your projects list
3. Find and click on project: mjssawaxbmwjqksyevgd
4. Look for the ⚙️ Settings icon in the left sidebar
5. Click Settings → API
6. Scroll down to find CORS configuration
```

### Method 2: From Project Page

```
1. If you're already in your project dashboard
2. Look at the left sidebar
3. Click the ⚙️ icon at the bottom (Settings)
4. In the Settings submenu, click "API"
5. Scroll to "CORS Configuration" section
```

---

## What You're Looking For

### Section Names (varies by Supabase version):

The CORS settings might be under any of these names:
- ✅ **"CORS Configuration"**
- ✅ **"Additional Allowed Origins"**
- ✅ **"API CORS Settings"**
- ✅ **"Allowed Origins"**

### Visual Indicators:

Look for:
- 📝 A text input box or textarea
- 🌐 Mentions of "origins" or "domains"
- 🔒 Security-related section
- 📋 List of URLs

### Default Content:

You might see:
```
https://localhost:3000
https://localhost:8000
```

Or it might be empty.

---

## Adding Your URL

### Copy This Exact URL:
```
https://interropstesting.figma.site
```

### Where to Add It:

**Option A: Separate Input Fields**
```
┌─────────────────────────────────────────┐
│ Allowed Origin 1:                       │
│ https://localhost:3000                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Allowed Origin 2:                       │
│ https://interropstesting.figma.site    │  ← ADD HERE
└─────────────────────────────────────────┘

[+ Add Another Origin]
```

**Option B: Comma-Separated**
```
┌─────────────────────────────────────────┐
│ Allowed Origins:                        │
│                                         │
│ https://localhost:3000,                 │
│ https://interropstesting.figma.site    │  ← ADD HERE
└─────────────────────────────────────────┘
```

**Option C: One Per Line**
```
┌─────────────────────────────────────────┐
│ Allowed Origins (one per line):         │
│                                         │
│ https://localhost:3000                  │
│ https://interropstesting.figma.site    │  ← ADD HERE
│                                         │
└─────────────────────────────────────────┘
```

---

## Important Rules

### ✅ DO:
- Include `https://` protocol
- Use exact domain (interropstesting.figma.site)
- Keep it lowercase
- Save after adding
- Wait 2-3 minutes after saving

### ❌ DON'T:
- Add trailing slash: `https://interropstesting.figma.site/` ❌
- Use wildcards: `https://*.figma.site` ❌ (might not work)
- Add path: `https://interropstesting.figma.site/login` ❌
- Add port: `https://interropstesting.figma.site:443` ❌
- Use http: `http://interropstesting.figma.site` ❌

---

## Correct Examples

### ✅ Single Origin:
```
https://interropstesting.figma.site
```

### ✅ Multiple Origins (comma-separated):
```
https://localhost:3000, https://interropstesting.figma.site
```

### ✅ Multiple Origins (one per line):
```
https://localhost:3000
https://localhost:8000
https://interropstesting.figma.site
```

---

## Incorrect Examples

### ❌ With trailing slash:
```
https://interropstesting.figma.site/
```

### ❌ With path:
```
https://interropstesting.figma.site/app
```

### ❌ With wildcard (may not work):
```
https://*.figma.site
```

### ❌ Mixed protocols:
```
http://interropstesting.figma.site
https://interropstesting.figma.site
```
(Pick one - use https)

---

## After Adding

### 1. Save the Changes
Look for buttons like:
- [Save]
- [Update]
- [Apply Changes]
- [Confirm]

### 2. Confirmation Message
You should see something like:
```
✅ CORS settings updated successfully
✅ Changes will take effect in 2-3 minutes
```

### 3. Wait Period
**Critical:** Changes don't apply immediately!
- ⏱️ Wait at least 2-3 minutes
- 🌍 Changes need to propagate to edge network
- 🚫 Don't test immediately after saving

### 4. Clear Browser Cache
After waiting:
- Press `Ctrl+Shift+Delete`
- Clear "Cached images and files"
- Or use Incognito/Private mode

### 5. Test Connection
- Refresh your app page
- Try logging in
- Check browser console for errors

---

## Verification

### Test in Browser Console:
```javascript
// Should succeed after fix
fetch('https://mjssawaxbmwjqksyevgd.supabase.co/rest/v1/', {
  method: 'HEAD',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qc3Nhd2F4Ym13anFrc3lldmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDk0OTIsImV4cCI6MjA4NDk4NTQ5Mn0.v5Y4jNn9lLDbrjd4EdYzFPwXRlzgQomS32Mnz686X9U'
  }
})
.then(r => console.log('✅ Success!', r.status))
.catch(e => console.error('❌ Still failing:', e));
```

### Expected Results:

**Before fix:**
```
❌ Failed to fetch
❌ CORS policy: Redirect is not allowed for a preflight request
```

**After fix:**
```
✅ Success! 200
✅ Login works on desktop
```

---

## Troubleshooting

### "I don't see CORS settings"
- Check if you're in the API section
- Some Supabase plans hide advanced settings
- Try scrolling down - it might be at the bottom
- Look under "Authentication" or "Security" tabs

### "Save button is disabled"
- Make sure you made a change
- Check if the URL format is valid
- Try refreshing the settings page
- Check your Supabase plan permissions

### "Changes don't seem to work"
- Wait full 3 minutes (not 2)
- Clear ALL browser data, not just cache
- Try in Incognito mode
- Check if you saved correctly

### "Still getting CORS errors"
- Verify exact URL match (no typos)
- Check for trailing slashes
- Ensure https:// protocol
- Verify project is not paused
- Check API key is correct

---

## Alternative: Using Supabase CLI

If dashboard doesn't work, use CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref mjssawaxbmwjqksyevgd

# Update CORS (in supabase/config.toml)
# Then push changes
supabase db push
```

---

## Screenshots Reference

### Where to Find Settings:

```
Dashboard Layout:
┌──────────────────────────────────────────┐
│ [Logo] Project: mjssawaxbmwjqksyevgd     │
├──────────┬───────────────────────────────┤
│ Home     │                               │
│ Database │                               │
│ Auth     │    Main Content Area          │
│ Storage  │                               │
│ Edge     │                               │
│ ......   │                               │
│ ⚙️ Settings │  ← CLICK HERE             │
│   ├─ General                             │
│   ├─ API     ← THEN HERE                 │
│   ├─ Auth                                │
│   └─ ...                                 │
└──────────┴───────────────────────────────┘
```

### API Settings Page:

```
API Settings
├─ Project URL
├─ Project API keys
│  ├─ anon public
│  └─ service_role
├─ JWT Settings
│  └─ JWT Secret
└─ CORS Configuration  ← SCROLL TO HERE
   └─ [Add your URL here]
```

---

## Quick Checklist

Before you start:
- [ ] I have my Supabase login ready
- [ ] I know my project ID: mjssawaxbmwjqksyevgd
- [ ] I have the URL to add: https://interropstesting.figma.site

During configuration:
- [ ] Found the Settings → API page
- [ ] Located CORS Configuration section
- [ ] Added the URL correctly (no trailing slash)
- [ ] Clicked Save/Update
- [ ] Saw confirmation message

After configuration:
- [ ] Waited 2-3 minutes
- [ ] Cleared browser cache
- [ ] Refreshed the app
- [ ] Tested login on desktop
- [ ] Verified console shows no CORS errors

---

**Remember:** The fix is simple once you find the right place. Take your time navigating the dashboard, and don't rush the testing phase!
