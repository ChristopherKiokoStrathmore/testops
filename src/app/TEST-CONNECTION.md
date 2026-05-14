# 🧪 Test Supabase Connection

## Quick Test

After unpausing your Supabase project, test the connection:

### 1. Open Browser Console (F12)

### 2. Run These Commands:

```javascript
// Test 1: Check if project is active
await window.checkProjectStatus()
// ✅ Should return: { active: true, message: "Supabase project is active" }

// Test 2: Simple health check
await window.testSupabaseHealth()
// ✅ Should return: { success: true, message: "Database is accessible", latency: <number> }

// Test 3: Try a simple query
await window.simpleQuery('+254706874314', '1234')
// ✅ Should return user object with id, full_name, phone_number, role
```

---

## Expected Results After Resuming Project:

### ✅ Login Page Should Show:

```
┌─────────────────────────────────────┐
│  Connection Successful              │
│  Supabase project is active and     │
│  responding                         │
└─────────────────────────────────────┘
```

### ✅ Console Should Show:

```
✅ Supabase connection healthy
✅ Health check passed (150ms)
```

### ✅ Login Should Work With:

| Phone | Password | Role |
|-------|----------|------|
| 0706874314 | 1234 | developer |
| 0712345678 | 1234 | tester |
| 0723456789 | 1234 | tester |
| 0734567890 | 1234 | tester |
| 0745678901 | 1234 | tester |
| 0756789012 | 1234 | tester |
| 0767890123 | 1234 | tester |
| 0778901234 | 1234 | tester |
| 0789012345 | 1234 | tester |
| 0701234567 | 1234 | tester |

---

## If Still Failing:

### 1. Check Console for Specific Error

```javascript
// Look for these error types:
- "Redirect is not allowed" → Project still paused (wait 2-3 min)
- "Failed to fetch" → Network/CORS issue
- "Invalid credentials" → Wrong phone/password
- "403 Forbidden" → RLS policy issue
```

### 2. Wait 2-3 Minutes

After resuming, Supabase needs time to:
- ✅ Restart database
- ✅ Update DNS records  
- ✅ Enable API endpoints

### 3. Clear Browser Cache

```
Chrome: Ctrl + Shift + Delete
Firefox: Ctrl + Shift + Delete
Safari: Cmd + Option + E
```

### 4. Try Incognito/Private Mode

This bypasses cache completely.

### 5. Verify Project Status

Go to: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd

Look for:
- ✅ Green "Active" badge
- ✅ API endpoints are live
- ✅ No "Paused" or "Inactive" warnings

---

## Troubleshooting Console Errors:

| Error | Meaning | Fix |
|-------|---------|-----|
| `net::ERR_FAILED` | Project still paused | Wait 2-3 minutes |
| `CORS policy` | CORS not configured | Add `*` to allowed origins |
| `401 Unauthorized` | Wrong credentials | Check phone/password |
| `403 Forbidden` | RLS blocking | Check RLS policies |
| `Timeout` | Slow connection | Try again or check internet |

---

## Success Indicators:

✅ **Green "Connection Successful" banner**  
✅ **No console errors**  
✅ **Login works with test credentials**  
✅ **Dashboard loads after login**  
✅ **Can submit test logs**  

If all these work → **You're all set!** 🎉

---

## Support:

Still having issues? Check:
1. `/SUPABASE-PAUSED-FIX.md` - Paused project fix
2. `/CORS-FIX-README.md` - CORS configuration
3. Browser console logs - Detailed error info
4. Supabase status page: https://status.supabase.com
