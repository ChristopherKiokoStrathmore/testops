# 📱 Phone Authentication Setup Guide

## ⚡ Quick Start - 4 Steps

### Step 1: Run Database SQL

1. Open: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/sql/new
2. Copy all SQL from `DATABASE_SETUP.sql` file
3. Click "Run"
4. Verify: You should see 9 profiles created

---

### Step 2: Enable Phone Authentication

**This is REQUIRED - the app won't work without this!**

1. Go to: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/auth/providers
2. Find **"Phone"** in the list
3. Toggle it **ON** (enable it)
4. Configuration options:
   - **For Testing (Recommended):** 
     - Enable "Phone confirmations"
     - Skip SMS provider setup
     - Users will be auto-confirmed
   - **For Production:**
     - Set up Twilio or other SMS provider
5. Click **"Save"**

---

### Step 3: Create Phone Auth Users

Go to: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/auth/users

**Create these 9 users (Click "Add User" for each):**

| Name | Phone Number | Password |
|------|--------------|----------|
| Christopher | +254785638462 | 1234 |
| Gabriella | +254105107837 | 1234 |
| Norman | +254733578275 | 1234 |
| Geoffrey | +254782544992 | 1234 |
| Ahmed | +254785460106 | 1234 |
| Samuel | +254751665392 | 1234 |
| Ivan | +254100524754 | 1234 |
| Dennis | +254783150482 | 1234 |
| Valry | +254107441742 | 1234 |

**For each user:**
1. Click "Add User" → "Create new user"
2. Select **"Phone"** (not Email!)
3. Enter phone number with +254 (e.g., +254785638462)
4. Enter password: 1234
5. Click "Create User"

---

### Step 4: Link Auth Users to Profiles

After creating all 9 users, link them:

```sql
-- First, get all user IDs
SELECT id, phone FROM auth.users ORDER BY phone;

-- Then link each user (replace UUIDs with actual values from above query)
UPDATE profiles SET auth_user_id = 'UUID_FOR_CHRISTOPHER' WHERE phone_number = '+254785638462';
UPDATE profiles SET auth_user_id = 'UUID_FOR_GABRIELLA' WHERE phone_number = '+254105107837';
UPDATE profiles SET auth_user_id = 'UUID_FOR_NORMAN' WHERE phone_number = '+254733578275';
UPDATE profiles SET auth_user_id = 'UUID_FOR_GEOFFREY' WHERE phone_number = '+254782544992';
UPDATE profiles SET auth_user_id = 'UUID_FOR_AHMED' WHERE phone_number = '+254785460106';
UPDATE profiles SET auth_user_id = 'UUID_FOR_SAMUEL' WHERE phone_number = '+254751665392';
UPDATE profiles SET auth_user_id = 'UUID_FOR_IVAN' WHERE phone_number = '+254100524754';
UPDATE profiles SET auth_user_id = 'UUID_FOR_DENNIS' WHERE phone_number = '+254783150482';
UPDATE profiles SET auth_user_id = 'UUID_FOR_VALRY' WHERE phone_number = '+254107441742';
```

**Or link them all at once (replace UUIDs):**

```sql
-- Match by phone number automatically (safer)
WITH user_phones AS (
  SELECT id, phone FROM auth.users
)
UPDATE profiles p
SET auth_user_id = up.id
FROM user_phones up
WHERE p.phone_number = up.phone;
```

---

## ✅ Test Login

1. **Refresh the app**
2. Login with:
   - Phone: `0785638462` or `+254785638462`
   - Password: `1234`
3. You should be logged in!

---

## 📋 Login Credentials

All users have password: **1234**

| Name | Phone (0...) | Phone (+254...) |
|------|-------------|-----------------|
| Christopher | 0785638462 | +254785638462 |
| Gabriella | 0105107837 | +254105107837 |
| Norman | 0733578275 | +254733578275 |
| Geoffrey | 0782544992 | +254782544992 |
| Ahmed | 0785460106 | +254785460106 |
| Samuel | 0751665392 | +254751665392 |
| Ivan | 0100524754 | +254100524754 |
| Dennis | 0783150482 | +254783150482 |
| Valry | 0107441742 | +254107441742 |

---

## 🔧 Features

✅ **Login** - Phone number + password (1234)
✅ **Change Password** - Click user icon → "Change Password"
✅ **Sign Out** - Click user icon → "Sign Out"
✅ **Auto-format** - Works with 0... or +254...

---

## ❗ Troubleshooting

### "Phone logins are disabled"
- ⚠️ You haven't enabled Phone provider in Supabase
- Go to Step 2 above and enable Phone authentication

### "Invalid credentials"
- Check phone number format (+254... or 0...)
- Verify password is exactly: 1234
- Make sure user was created in Auth → Users

### "User not found after login"
- auth_user_id not linked in profiles table
- Run Step 4 UPDATE queries

### Can't create phone users
- Phone provider must be enabled first (Step 2)
- Use +254 format when creating users
- Don't include spaces or dashes

---

## 📝 Quick Reference

**Supabase Project:** mjssawaxbmwjqksyevgd

**Important Links:**
- SQL Editor: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/sql/new
- Auth Providers: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/auth/providers
- Users: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/auth/users

**Default Password:** 1234

**Phone Format:** 
- Users can login with: 0785638462
- Or with: +254785638462
- Both work!
