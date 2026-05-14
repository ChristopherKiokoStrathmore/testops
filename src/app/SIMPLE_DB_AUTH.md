# 🚀 Simple Database Authentication Setup

## ✅ NO Supabase Auth Required!

This app uses **direct database lookup** - no Supabase Auth configuration needed!

---

## 📝 Setup Instructions (1 Step!)

### Step 1: Run Database SQL

1. **Open SQL Editor:** https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/sql/new

2. **Copy ALL of this SQL** (it will drop old tables and recreate them):

```sql
-- Drop existing tables if they exist
DROP TABLE IF EXISTS test_logs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table with passwords
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL DEFAULT '1234',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all 9 testers
INSERT INTO profiles (full_name, phone_number, password) 
VALUES
  ('Christopher Kioko', '+254785638462', '1234'),
  ('Gabriella Ngeene', '+254105107837', '1234'),
  ('Norman Kodi', '+254733578275', '1234'),
  ('Geoffrey Gachingiri', '+254782544992', '1234'),
  ('Ahmed Wairimu', '+254785460106', '1234'),
  ('Samuel Gitau', '+254751665392', '1234'),
  ('Ivan Andayi', '+254100524754', '1234'),
  ('Dennis Mugendi', '+254783150482', '1234'),
  ('Valry Oduor', '+254107441742', '1234');

-- Create test_logs table
CREATE TABLE test_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('M-pesa', 'Safaricom', 'USSD', 'STK')),
  duration_sec INTEGER NOT NULL DEFAULT 0,
  is_failed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_test_logs_created_at ON test_logs(created_at);
CREATE INDEX idx_test_logs_tester_id ON test_logs(tester_id);
CREATE INDEX idx_test_logs_category ON test_logs(category);
CREATE INDEX idx_profiles_phone_number ON profiles(phone_number);

-- Enable RLS and allow all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on profiles" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on test_logs" ON test_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Verify
SELECT id, full_name, phone_number, password FROM profiles ORDER BY full_name;
```

3. Click **"Run"**
4. You should see 9 rows displayed at the bottom
5. **Done!** 🎉

---

## ✅ Test Login

1. **Refresh the app**
2. Login with:
   - Phone: **0785638462** (or +254785638462)
   - Password: **1234**
3. You're in!

---

## 🔐 How It Works

**Simple Database Lookup:**
1. User enters phone + password
2. App queries `profiles` table: `WHERE phone_number = ? AND password = ?`
3. If match found → Login successful
4. Session stored in browser localStorage
5. No Supabase Auth needed!

---

## 📞 Login Credentials

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

Both phone formats work!

---

## 🔧 Features

✅ **Login** - Phone + password (direct DB lookup)
✅ **Change Password** - Updates database directly
✅ **Sign Out** - Clears local session
✅ **Auto-format** - Works with 0... or +254...
✅ **No Auth Setup** - Just run SQL and go!

---

## 🎯 Advantages

✅ **Super Simple** - Just 1 SQL script
✅ **No OTP** - No SMS verification needed
✅ **No Auth Config** - Skip Supabase Auth entirely
✅ **Direct Control** - Passwords in your database
✅ **Fast Setup** - Ready in 30 seconds

---

## 🔒 Change Passwords

**From the app:**
1. Click user icon (top right)
2. Click "Change Password"
3. Enter new password
4. Done - updates database directly

**Manually via SQL:**
```sql
-- Change Christopher's password to "newpass"
UPDATE profiles 
SET password = 'newpass' 
WHERE phone_number = '+254785638462';
```

---

## ❗ Troubleshooting

### Error: "column phone_number does not exist"
- Old table structure exists
- **Solution:** Run the full SQL script (it drops old tables first)

### "Invalid phone number or password"
- Check phone format (0... or +254...)
- Password is case-sensitive (default: 1234)
- Make sure SQL was run successfully

### Can't see login form
- Check browser console for errors
- Verify Supabase URL and anon key are correct

### Login works but no data
- Check that test_logs table was created
- Verify RLS policies allow all operations

---

## 📊 Database Structure

**profiles table:**
- `id` - UUID (primary key)
- `full_name` - Text
- `phone_number` - Text (unique)
- `password` - Text
- `created_at` - Timestamp

**test_logs table:**
- `id` - UUID (primary key)
- `tester_id` - UUID (references profiles)
- `category` - Text (M-pesa/Safaricom/USSD/STK)
- `duration_sec` - Integer
- `is_failed` - Boolean
- `created_at` - Timestamp

---

## 🎉 That's It!

**No more setup needed!**
- ❌ No Supabase Auth configuration
- ❌ No phone provider setup
- ❌ No user creation in Auth dashboard
- ❌ No OTP codes
- ✅ Just run SQL and login!

**Enjoy your simple, direct database authentication! 🚀**
