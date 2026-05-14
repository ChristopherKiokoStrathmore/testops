# Developer Dashboard Setup Guide

## 🎯 Overview
This guide will help you set up the Developer Dashboard with full administrative capabilities.

---

## 📋 Step 1: Add Role Column to Profiles Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'tester';

-- Add a comment to the column
COMMENT ON COLUMN profiles.role IS 'User role: tester or developer';
```

---

## 👤 Step 2: Add Kioko as Developer

```sql
-- Insert Kioko as a developer
INSERT INTO profiles (id, phone_number, full_name, password, role, created_at)
VALUES (
  gen_random_uuid(),
  '+254706874314',
  'Kioko',
  '1234',
  'developer',
  NOW()
)
ON CONFLICT (phone_number) 
DO UPDATE SET 
  full_name = 'Kioko',
  role = 'developer';

-- Verify the account was created
SELECT id, phone_number, full_name, role, created_at 
FROM profiles 
WHERE phone_number = '+254706874314';
```

---

## 🔧 Step 3: Create SQL Query Execution Function (IMPORTANT!)

This function is required for the SQL Query Interface to work:

```sql
-- Create a function to execute dynamic SQL queries
CREATE OR REPLACE FUNCTION execute_sql(query_text TEXT)
RETURNS SETOF JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_record RECORD;
  result_json JSON;
  results JSON[] := '{}';
BEGIN
  -- Execute the query and return results as JSON
  FOR result_record IN EXECUTE query_text
  LOOP
    result_json := row_to_json(result_record);
    results := array_append(results, result_json);
  END LOOP;
  
  RETURN QUERY SELECT unnest(results);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO anon;
```

**⚠️ SECURITY WARNING:** This function allows executing arbitrary SQL. In production:
- Add role-based access control
- Limit to SELECT queries only
- Add query validation
- Log all queries for audit purposes

---

## 🔐 Step 4: Login Credentials for Kioko

**Phone Number:** `0706874314` (or `+254706874314`)  
**Password:** `1234` (should be changed after first login)

---

## ✅ Step 5: Verify Setup

1. Run all SQL commands above in Supabase SQL Editor
2. Log in with Kioko's credentials
3. You should see the Developer Dashboard instead of the regular tester interface

---

## 🎨 Developer Dashboard Features

### 1. **Advanced Analytics** 📊
- View overall system statistics
- Tester performance metrics
- Category breakdown charts
- Time-series trends
- Detailed statistics tables
- Export analytics reports as JSON

### 2. **User Management** 👥
- View all users (testers and developers)
- Add new users
- Delete users
- Toggle user roles (tester ↔ developer)
- See user creation dates

### 3. **Test Logs Management** 📝
- View all test logs from all testers
- Edit test logs (category, duration, status)
- Delete test logs
- Search and filter by tester/category
- Real-time updates

### 4. **Password Reset** 🔑
- Reset any user's password
- Quick password management
- Immediate effect

### 5. **SQL Query Interface** 💻
- Execute custom SQL queries
- Pre-built common queries:
  - All Users
  - Recent Test Logs
  - Failed Tests Today
  - Test Summary by Tester
- Export query results to CSV
- Syntax highlighting
- Error reporting

---

## 🚀 Additional SQL Queries for Developers

### View All Developers
```sql
SELECT * FROM profiles WHERE role = 'developer';
```

### Promote a User to Developer
```sql
UPDATE profiles 
SET role = 'developer' 
WHERE phone_number = '+254XXXXXXXXX';
```

### Demote a Developer to Tester
```sql
UPDATE profiles 
SET role = 'tester' 
WHERE phone_number = '+254XXXXXXXXX';
```

### View Test Summary
```sql
SELECT 
  p.full_name,
  COUNT(tl.*) as total_tests,
  SUM(CASE WHEN tl.is_failed THEN 1 ELSE 0 END) as failed_tests,
  ROUND(AVG(tl.duration_sec), 2) as avg_duration_sec
FROM test_logs tl
JOIN profiles p ON p.id = tl.tester_id
GROUP BY p.full_name
ORDER BY total_tests DESC;
```

### Delete All Test Logs for a Specific Date
```sql
DELETE FROM test_logs 
WHERE created_at::date = '2026-01-26';
```

### View Failed Tests with Tester Names
```sql
SELECT 
  p.full_name as tester,
  tl.category,
  tl.created_at
FROM test_logs tl
JOIN profiles p ON p.id = tl.tester_id
WHERE tl.is_failed = true
ORDER BY tl.created_at DESC;
```

---

## 🔒 Security Best Practices

1. **Change Default Password:** Immediately change from '1234' to a strong password
2. **Limit Developer Accounts:** Only create developer accounts for trusted personnel
3. **Monitor SQL Queries:** Keep track of what queries are being run
4. **Regular Backups:** Always backup your database before running destructive queries
5. **Test in Development:** Test SQL queries in a development environment first

---

## 🆘 Troubleshooting

### Issue: "Function execute_sql does not exist"
**Solution:** Run Step 3 SQL commands to create the function

### Issue: "Permission denied for function execute_sql"
**Solution:** Run the GRANT commands in Step 3

### Issue: Developer sees regular tester dashboard
**Solution:** 
1. Check if role is set correctly: `SELECT role FROM profiles WHERE phone_number = '+254706874314';`
2. If role is NULL or 'tester', update it: `UPDATE profiles SET role = 'developer' WHERE phone_number = '+254706874314';`
3. Log out and log back in

### Issue: Cannot delete or edit test logs
**Solution:** Check Supabase RLS (Row Level Security) policies and ensure proper permissions

---

## 📞 Support

For additional help or feature requests, contact your development team.

---

**Last Updated:** January 26, 2026  
**Version:** 1.0
