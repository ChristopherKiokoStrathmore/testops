# 🚀 Complete Setup Guide - Database + Authentication

## Part 1: Database Setup

### Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/sql/new

### Step 2: Run Database Setup SQL

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  auth_user_id UUID REFERENCES auth.users(id),
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the 9 testers
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

## Part 2: Enable Phone Authentication

### Step 1: Enable Phone Provider
1. Go to: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/auth/providers
2. Find **Phone** in the list
3. Click **Enable**
4. For testing, enable **"Enable phone confirmations"** but you can skip SMS setup
5. Click **Save**

## Part 3: Create User Accounts

### You have 2 options:

---

## 🎯 OPTION A: Manual Creation (Recommended - Easiest)

For each tester, follow these steps:

1. Go to: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/auth/users
2. Click **"Add User"** → Select **"Create new user"**
3. Select **Phone** option
4. Enter the phone number and password:

**Create these 9 users:**

| Tester Name | Phone Number | Password |
|------------|--------------|----------|
| Christopher Kioko | +254785638462 | 1234 |
| Gabriella Ngeene | +254105107837 | 1234 |
| Norman Kodi | +254733578275 | 1234 |
| Geoffrey Gachingiri | +254782544992 | 1234 |
| Ahmed Wairimu | +254785460106 | 1234 |
| Samuel Gitau | +254751665392 | 1234 |
| Ivan Andayi | +254100524754 | 1234 |
| Dennis Mugendi | +254783150482 | 1234 |
| Valry Oduor | +254107441742 | 1234 |

5. After creating each user, **copy their UUID** from the users list

---

## 🎯 OPTION B: Automatic Creation via SQL

⚠️ **Note**: This requires Supabase Service Role Key (found in Settings → API)

If you want to automate user creation, you can use the Supabase API, but manual creation is simpler for 9 users.

---

## Part 4: Link Auth Users to Profiles

After creating all auth users, run this SQL to link them:

```sql
-- Link Christopher Kioko
UPDATE profiles 
SET auth_user_id = '[PASTE_CHRISTOPHER_UUID_HERE]'
WHERE phone_number = '+254785638462';

-- Link Gabriella Ngeene
UPDATE profiles 
SET auth_user_id = '[PASTE_GABRIELLA_UUID_HERE]'
WHERE phone_number = '+254105107837';

-- Link Norman Kodi
UPDATE profiles 
SET auth_user_id = '[PASTE_NORMAN_UUID_HERE]'
WHERE phone_number = '+254733578275';

-- Link Geoffrey Gachingiri
UPDATE profiles 
SET auth_user_id = '[PASTE_GEOFFREY_UUID_HERE]'
WHERE phone_number = '+254782544992';

-- Link Ahmed Wairimu
UPDATE profiles 
SET auth_user_id = '[PASTE_AHMED_UUID_HERE]'
WHERE phone_number = '+254785460106';

-- Link Samuel Gitau
UPDATE profiles 
SET auth_user_id = '[PASTE_SAMUEL_UUID_HERE]'
WHERE phone_number = '+254751665392';

-- Link Ivan Andayi
UPDATE profiles 
SET auth_user_id = '[PASTE_IVAN_UUID_HERE]'
WHERE phone_number = '+254100524754';

-- Link Dennis Mugendi
UPDATE profiles 
SET auth_user_id = '[PASTE_DENNIS_UUID_HERE]'
WHERE phone_number = '+254783150482';

-- Link Valry Oduor
UPDATE profiles 
SET auth_user_id = '[PASTE_VALRY_UUID_HERE]'
WHERE phone_number = '+254107441742';
```

### How to get the UUIDs:
1. Go to Authentication → Users
2. Click on a user
3. Copy their UUID (looks like: `a1b2c3d4-e5f6-7890-1234-567890abcdef`)
4. Paste it in the SQL above
5. Run the SQL

---

## Part 5: Test the App!

1. **Refresh your app**
2. You'll see the login screen
3. **Login with any tester:**
   - Phone: `0785638462` or `+254785638462` (both work)
   - Password: `1234`
4. Click **Sign In**

---

## 🔐 Password Management

### Change Password:
1. Login to the app
2. Click the **user icon** in the top-right corner
3. Select **"Change Password"**
4. Enter your new password (minimum 4 characters)
5. Confirm the new password
6. Click **"Change Password"**

### Sign Out:
1. Click the **user icon** in the top-right
2. Select **"Sign Out"**

---

## Quick Reference - Login Credentials

**All users start with password: `1234`**

| Name | Phone (with +254) | Phone (without) |
|------|------------------|-----------------|
| Christopher | +254785638462 | 0785638462 |
| Gabriella | +254105107837 | 0105107837 |
| Norman | +254733578275 | 0733578275 |
| Geoffrey | +254782544992 | 0782544992 |
| Ahmed | +254785460106 | 0785460106 |
| Samuel | +254751665392 | 0751665392 |
| Ivan | +254100524754 | 0100524754 |
| Dennis | +254783150482 | 0783150482 |
| Valry | +254107441742 | 0107441742 |

---

## ✅ Verification Checklist

- [ ] Database tables created (profiles, test_logs)
- [ ] Phone authentication enabled in Supabase
- [ ] All 9 auth users created with password "1234"
- [ ] All profiles linked to auth users (auth_user_id set)
- [ ] App login screen loads
- [ ] Can login with phone + password
- [ ] Can see tester selection after login
- [ ] Can change password from user menu
- [ ] Can sign out

---

## 🆘 Troubleshooting

### "Invalid phone number or password"
- Try with country code: `+254785638462`
- Try without: `0785638462`
- Verify password is exactly: `1234`

### "No profile found after login"
- Check that auth_user_id is set in profiles table
- Run the UPDATE queries to link users

### Can't create auth users
- Make sure Phone provider is enabled
- Check you're in the correct Supabase project

### Login screen doesn't show
- Check browser console for errors
- Verify Supabase credentials in code are correct
