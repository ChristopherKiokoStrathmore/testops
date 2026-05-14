# 🚀 Quick Setup Guide - 3 Steps

## Step 1: Go to Supabase SQL Editor

1. Open this link: **https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/sql/new**
2. Or manually: Go to your Supabase Dashboard → Click "SQL Editor" → Click "New Query"

## Step 2: Copy & Paste This SQL

Copy ALL of the SQL below and paste it into the SQL Editor:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the 9 testers (only if they don't exist)
INSERT INTO profiles (full_name) 
SELECT * FROM (VALUES
  ('Christopher Kioko'),
  ('Norman Kodi'),
  ('Gabriella Ngeene'),
  ('Geoffrey Gachingiri'),
  ('Valry Oduor'),
  ('Samuel Gitau'),
  ('Ivan Andayi'),
  ('Ahmed Wairimu'),
  ('Dennis Mugendi')
) AS v(full_name)
WHERE NOT EXISTS (SELECT 1 FROM profiles LIMIT 1);

-- Create test_logs table
CREATE TABLE IF NOT EXISTS test_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id UUID NOT NULL REFERENCES profiles(id),
  category TEXT NOT NULL CHECK (category IN ('M-pesa', 'Safaricom', 'USSD', 'STK')),
  duration_sec INTEGER NOT NULL DEFAULT 0,
  is_failed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_logs_created_at ON test_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_test_logs_tester_id ON test_logs(tester_id);
CREATE INDEX IF NOT EXISTS idx_test_logs_category ON test_logs(category);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_logs ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations
DROP POLICY IF EXISTS "Allow all operations on profiles" ON profiles;
CREATE POLICY "Allow all operations on profiles" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on test_logs" ON test_logs;
CREATE POLICY "Allow all operations on test_logs" ON test_logs
  FOR ALL USING (true) WITH CHECK (true);
```

## Step 3: Run the Query

1. Click the **"Run"** button (or press Ctrl/Cmd + Enter)
2. You should see "Success. No rows returned"
3. **Refresh your app** - it will now work!

---

## ✅ How to Verify It Worked

After running the SQL:
1. Go to "Table Editor" in Supabase
2. You should see two tables: `profiles` and `test_logs`
3. Click on `profiles` - you should see all 9 testers listed
4. Refresh your Testing Management App

---

## ⚠️ Troubleshooting

**If you get an error about tables already existing:**
- That's okay! The SQL is designed to be safe to run multiple times

**If you still see errors in the app:**
1. Make sure you're logged into the correct Supabase project
2. Check that you clicked "Run" in the SQL Editor
3. Try refreshing the app page (Ctrl/Cmd + R)

**If the "profiles" table is empty:**
- The INSERT statement only runs if the table is empty
- To add testers manually, use the Supabase Table Editor
