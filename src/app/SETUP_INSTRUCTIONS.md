# Testing Management App - Setup Instructions

## Database Setup

### 1. Create the `profiles` table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the 9 testers
INSERT INTO profiles (full_name) VALUES
  ('Christopher Kioko'),
  ('Norman Kodi'),
  ('Gabriella Ngeene'),
  ('Geoffrey Gachingiri'),
  ('Valry Oduor'),
  ('Samuel Gitau'),
  ('Ivan Andayi'),
  ('Ahmed Wairimu'),
  ('Dennis Mugendi');
```

### 2. Create the `test_logs` table

```sql
-- Create test_logs table
CREATE TABLE test_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id UUID NOT NULL REFERENCES profiles(id),
  category TEXT NOT NULL CHECK (category IN ('M-pesa', 'Safaricom', 'USSD', 'STK')),
  duration_sec INTEGER NOT NULL DEFAULT 0,
  is_failed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_test_logs_created_at ON test_logs(created_at);
CREATE INDEX idx_test_logs_tester_id ON test_logs(tester_id);
CREATE INDEX idx_test_logs_category ON test_logs(category);
```

### 3. Set up Row Level Security (RLS) - Optional but Recommended

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_logs ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust as needed)
CREATE POLICY "Allow all operations on profiles" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on test_logs" ON test_logs
  FOR ALL USING (true) WITH CHECK (true);
```

## App Usage

### Tester Management
- The app will automatically select the first tester on load
- Use the "Swap Tester" button in the header to change testers
- Search functionality helps find testers quickly
- **Note**: You mentioned there will be 4 testers at any given time - the app supports all 9 testers in the system, but you can manage active testers through the swap functionality

### Logging Tests
1. Select Pass or Fail for each category (M-pesa, Safaricom, USSD, STK)
2. If **Pass**: Enter the time taken in seconds
3. If **Fail**: Select whether it failed with a prompt (Yes/No)
4. Click "Log Hourly Test" to save all 4 categories at once

### Analytics
- Switch between Daily, Weekly, and Monthly views
- View average duration for passed tests
- See failure rates across all categories
- Export all data to CSV using the "Download CSV" button

## Notes
- All 4 categories must have a status (Pass/Fail) selected before submitting
- Passed tests require a time duration
- The time slot automatically updates to show the current hour
- Data is immediately available in the Analytics dashboard after logging
