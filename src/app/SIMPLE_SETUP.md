# 🚀 Simple Setup Guide - Email Authentication

This guide uses **email authentication** (enabled by default in Supabase) instead of phone auth.

## Step 1: Run Database Setup SQL

1. Go to: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/sql/new
2. Copy and paste this SQL:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  auth_user_id UUID REFERENCES auth.users(id),
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the 9 testers with emails
INSERT INTO profiles (full_name, email) 
VALUES
  ('Christopher Kioko', 'christopher@testops.app'),
  ('Gabriella Ngeene', 'gabriella@testops.app'),
  ('Norman Kodi', 'norman@testops.app'),
  ('Geoffrey Gachingiri', 'geoffrey@testops.app'),
  ('Ahmed Wairimu', 'ahmed@testops.app'),
  ('Samuel Gitau', 'samuel@testops.app'),
  ('Ivan Andayi', 'ivan@testops.app'),
  ('Dennis Mugendi', 'dennis@testops.app'),
  ('Valry Oduor', 'valry@testops.app')
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

3. Click **"Run"**

## Step 2: Create User Accounts

### Option A: Quick Batch Creation (Easiest!)

Go to SQL Editor and run this:

```sql
-- This requires service_role key, so use Option B instead
-- See Option B below for creating users via Dashboard
```

### Option B: Manual Creation via Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/auth/users
2. For each tester, click **"Add User"**:

| Name | Email | Password |
|------|-------|----------|
| Christopher Kioko | christopher@testops.app | 1234 |
| Gabriella Ngeene | gabriella@testops.app | 1234 |
| Norman Kodi | norman@testops.app | 1234 |
| Geoffrey Gachingiri | geoffrey@testops.app | 1234 |
| Ahmed Wairimu | ahmed@testops.app | 1234 |
| Samuel Gitau | samuel@testops.app | 1234 |
| Ivan Andayi | ivan@testops.app | 1234 |
| Dennis Mugendi | dennis@testops.app | 1234 |
| Valry Oduor | valry@testops.app | 1234 |

**Steps for each user:**
- Click "Add User" → "Create new user"
- Select **"Email"**
- Enter email (e.g., `christopher@testops.app`)
- Enter password: `1234`
- **IMPORTANT**: Uncheck "Auto Confirm User" or the user won't be able to login
- Click "Create User"

## Step 3: Link Users to Profiles

After creating all users, link them to profiles:

```sql
-- Get user IDs first
SELECT id, email FROM auth.users;

-- Then link each user (replace [UUID] with actual user ID)
UPDATE profiles SET auth_user_id = '[CHRISTOPHER_UUID]' WHERE email = 'christopher@testops.app';
UPDATE profiles SET auth_user_id = '[GABRIELLA_UUID]' WHERE email = 'gabriella@testops.app';
UPDATE profiles SET auth_user_id = '[NORMAN_UUID]' WHERE email = 'norman@testops.app';
UPDATE profiles SET auth_user_id = '[GEOFFREY_UUID]' WHERE email = 'geoffrey@testops.app';
UPDATE profiles SET auth_user_id = '[AHMED_UUID]' WHERE email = 'ahmed@testops.app';
UPDATE profiles SET auth_user_id = '[SAMUEL_UUID]' WHERE email = 'samuel@testops.app';
UPDATE profiles SET auth_user_id = '[IVAN_UUID]' WHERE email = 'ivan@testops.app';
UPDATE profiles SET auth_user_id = '[DENNIS_UUID]' WHERE email = 'dennis@testops.app';
UPDATE profiles SET auth_user_id = '[VALRY_UUID]' WHERE email = 'valry@testops.app';
```

## Step 4: Test Login!

1. **Refresh your app**
2. You'll see the login screen
3. **Login credentials:**
   - Email: `christopher@testops.app` (or any other tester)
   - Password: `1234`

## Login Credentials Reference

| Tester | Email | Password |
|--------|-------|----------|
| Christopher | christopher@testops.app | 1234 |
| Gabriella | gabriella@testops.app | 1234 |
| Norman | norman@testops.app | 1234 |
| Geoffrey | geoffrey@testops.app | 1234 |
| Ahmed | ahmed@testops.app | 1234 |
| Samuel | samuel@testops.app | 1234 |
| Ivan | ivan@testops.app | 1234 |
| Dennis | dennis@testops.app | 1234 |
| Valry | valry@testops.app | 1234 |

## Features Available

✅ **Login** - Email + Password authentication
✅ **Change Password** - Click user icon → "Change Password"
✅ **Sign Out** - Click user icon → "Sign Out"
✅ **Session Persistence** - Stay logged in across page refreshes

## Troubleshooting

### "Invalid email or password"
- Make sure you created the user in Authentication → Users
- Verify email is exactly as shown above
- Password is `1234`
- User must be confirmed (auto-confirmed when creating)

### "Email not confirmed"
- When creating user, make sure to check "Auto Confirm User"
- Or go to user details and manually confirm

### Can't login after creating user
- Wait 5-10 seconds after creating user
- Make sure auth_user_id is linked in profiles table
- Check browser console for errors

## Why Email Instead of Phone?

- ✅ Email auth is **enabled by default** in Supabase
- ✅ No SMS provider setup required
- ✅ No additional configuration needed
- ✅ Works immediately after user creation
- ✅ All other features work exactly the same!

Phone auth requires:
- Enabling phone provider
- SMS provider setup (Twilio, etc.)
- Phone number verification
- Additional cost for SMS

For an internal testing app, email is simpler and faster!
