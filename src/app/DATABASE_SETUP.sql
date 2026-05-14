-- ==============================================
-- TESTOPS DATABASE SETUP - DIRECT DB AUTH
-- ==============================================
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/sql/new
-- ==============================================

-- Step 1: Drop existing tables if they exist
DROP TABLE IF EXISTS test_logs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Step 2: Create profiles table with passwords
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL DEFAULT '1234',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Insert all 9 testers with passwords
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

-- Step 4: Create test_logs table
CREATE TABLE test_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('M-pesa', 'Safaricom', 'USSD', 'STK')),
  duration_sec INTEGER NOT NULL DEFAULT 0,
  is_failed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create indexes for performance
CREATE INDEX idx_test_logs_created_at ON test_logs(created_at);
CREATE INDEX idx_test_logs_tester_id ON test_logs(tester_id);
CREATE INDEX idx_test_logs_category ON test_logs(category);
CREATE INDEX idx_profiles_phone_number ON profiles(phone_number);

-- Step 6: Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_logs ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies (allow all for now)
CREATE POLICY "Allow all operations on profiles" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on test_logs" ON test_logs
  FOR ALL USING (true) WITH CHECK (true);

-- ==============================================
-- VERIFICATION
-- ==============================================
-- Check that all profiles were created
SELECT id, full_name, phone_number, password FROM profiles ORDER BY full_name;

-- You should see 9 rows with password '1234'
