# 📱 Simple Phone Login Setup (NO OTP)

## ⚡ Quick Setup - Phone + Password Only (No SMS/OTP)

### Step 1: Run Database SQL

1. Open: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/sql/new
2. Copy and paste this:

```sql
-- Create profiles table with phone numbers
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  auth_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all 9 testers with phone numbers
INSERT INTO profiles (full_name, phone_number) 
VALUES
  ('Christopher Kioko', '+254785638462'),
  ('Gabriella Ngeene', '+254105107837'),
  ('Norman Kodi', '+254733578275'),
  ('Geoffrey Gachingiri', '+254782544992'),
  ('Ahmed Wairimu', '+254785460106'),
  ('Samuel Gitau', '+254751665392'),
  ('Ivan Andayi', '+254100524754'),
  ('Dennis Mugendi', '+254783150482'),
  ('Valry Oduor', '+254107441742')
ON CONFLICT DO NOTHING;

-- Create test_logs table
CREATE TABLE IF NOT EXISTS test_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id UUID NOT NULL REFERENCES profiles(id),
  category TEXT NOT NULL CHECK (category IN ('M-pesa', 'Safaricom', 'USSD', 'STK')),
  duration_sec INTEGER NOT NULL DEFAULT 0,
  is_failed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_test_logs_created_at ON test_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_test_logs_tester_id ON test_logs(tester_id);
CREATE INDEX IF NOT EXISTS idx_test_logs_category ON test_logs(category);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow all operations on profiles" ON profiles;
CREATE POLICY "Allow all operations on profiles" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on test_logs" ON test_logs;
CREATE POLICY "Allow all operations on test_logs" ON test_logs
  FOR ALL USING (true) WITH CHECK (true);
```

3. Click "Run"

---

### Step 2: Enable Phone Provider (WITHOUT SMS)

**CRITICAL - This enables phone login without OTP codes!**

1. Go to: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/auth/providers
2. Find **"Phone"** 
3. Click to expand settings
4. **IMPORTANT SETTINGS:**
   - ✅ Enable Phone provider (toggle ON)
   - ❌ **DISABLE "Enable phone confirmations"** (or leave SMS provider blank)
   - ❌ Skip all SMS provider setup (Twilio, etc.)
5. Click **"Save"**

**This configuration allows phone + password login WITHOUT OTP/SMS codes!**

---

### Step 3: Create Phone Users (Password Only)

1. Go to: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/auth/users
2. Click **"Add User"** for each tester:

**Create these 9 users:**

| Name | Phone | Password |
|------|-------|----------|
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
2. Select **"Phone"**
3. Phone: Enter with +254 (e.g., **+254785638462**)
4. Password: **1234**
5. ✅ **Auto Confirm User** (check this box!)
6. Click "Create User"

**Auto-confirm is KEY - this bypasses OTP verification!**

---

### Step 4: Link Users to Profiles

After creating all users, run this SQL:

```sql
-- Automatically link all users by phone number
WITH user_phones AS (
  SELECT id, phone FROM auth.users
)
UPDATE profiles p
SET auth_user_id = up.id
FROM user_phones up
WHERE p.phone_number = up.phone;

-- Verify all linked
SELECT 
  p.full_name, 
  p.phone_number, 
  CASE WHEN p.auth_user_id IS NOT NULL THEN '✓ Linked' ELSE '✗ Not Linked' END as status
FROM profiles p
ORDER BY p.full_name;
```

You should see all 9 users with "✓ Linked" status.

---

## ✅ Test Login (NO OTP!)

1. Refresh your app
2. Login with:
   - Phone: **0785638462** (or +254785638462)
   - Password: **1234**
3. Click "Sign In"
4. **You're logged in immediately - NO OTP CODE!**

---

## 🎯 How It Works (No OTP)

**Normal Phone Auth:** Phone → SMS Code → Verify → Login
**Our Setup:** Phone + Password → Login ✅

**Why no OTP?**
- No SMS provider configured = Can't send codes
- Auto-confirm enabled = User verified immediately
- Password required = Secure without SMS

---

## 📞 Login Credentials

All users: Password = **1234**

| Tester | Phone (with 0) | Phone (with +254) |
|--------|---------------|-------------------|
| Christopher | 0785638462 | +254785638462 |
| Gabriella | 0105107837 | +254105107837 |
| Norman | 0733578275 | +254733578275 |
| Geoffrey | 0782544992 | +254782544992 |
| Ahmed | 0785460106 | +254785460106 |
| Samuel | 0751665392 | +254751665392 |
| Ivan | 0100524754 | +254100524754 |
| Dennis | 0783150482 | +254783150482 |
| Valry | 0107441742 | +254107441742 |

Both formats work!

---

## 🔧 Features

✅ Login with phone + password (no OTP)
✅ Change password from user menu
✅ Sign out
✅ Auto-format phone numbers

---

## ❗ Troubleshooting

### "Phone logins are disabled"
- Phone provider not enabled
- Go to Auth → Providers → Enable Phone

### Getting OTP codes / SMS errors
- **Disable** "Enable phone confirmations" in Phone provider settings
- Don't configure SMS provider (Twilio)
- Make sure "Auto Confirm User" is checked when creating users

### "Phone number needs to be verified"
- User wasn't auto-confirmed when created
- Go to Auth → Users → Click user → Manually confirm
- Or recreate user with "Auto Confirm" checked

### Can't login with password
- Make sure you selected "Phone" (not Email) when creating user
- Phone must match exactly (+254...)
- Password is case-sensitive (1234)

---

## 🎉 Summary

**What you get:**
- Simple phone + password login
- No OTP codes
- No SMS costs
- Works instantly

**Perfect for:**
- Internal apps
- Testing environments
- Apps where you control user creation
