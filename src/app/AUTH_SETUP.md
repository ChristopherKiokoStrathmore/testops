# 🔐 Authentication Setup Guide

## Step 1: Enable Phone Authentication in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd
2. Click **Authentication** → **Providers**
3. Find **Phone** and enable it
4. For testing, you can use **Test Mode** (skip SMS verification)

## Step 2: Update Database Schema

Run this SQL in your Supabase SQL Editor to add authentication support:

```sql
-- Add auth_user_id and phone_number columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles(auth_user_id);
```

## Step 3: Create User Accounts

For each tester, you need to create an auth user. Run this for each phone number:

### Option A: Using Supabase Dashboard (Recommended for Testing)

1. Go to **Authentication** → **Users** → **Add User**
2. Select **Phone**
3. Enter phone number: `+254712345678` (format: +[country code][number])
4. Set password: `1234`
5. Click **Create User**
6. Repeat for all 9 testers

### Option B: Using SQL (Bulk Creation)

⚠️ **Note**: You'll need to manually set passwords through the Supabase Dashboard or use the Supabase Management API. The SQL below creates the users, but passwords must be set separately.

```sql
-- This creates auth users - passwords must be set via Dashboard
-- Use this as reference for phone numbers to create

-- Sample phone numbers (replace with actual numbers):
-- Christopher Kioko: +254712345678
-- Norman Kodi: +254723456789
-- Gabriella Ngeene: +254734567890
-- Geoffrey Gachingiri: +254745678901
-- Valry Oduor: +254756789012
-- Samuel Gitau: +254767890123
-- Ivan Andayi: +254778901234
-- Ahmed Wairimu: +254789012345
-- Dennis Mugendi: +254790123456
```

## Step 4: Link Auth Users to Profiles

After creating auth users, link them to profiles:

```sql
-- Update profiles with auth_user_id and phone numbers
-- Replace the UUIDs and phone numbers with actual values from your auth.users table

-- Example (repeat for each user):
UPDATE profiles 
SET 
  auth_user_id = '[USER_AUTH_UUID]',
  phone_number = '+254712345678'
WHERE full_name = 'Christopher Kioko';

-- You can find user UUIDs in Authentication → Users in Supabase Dashboard
```

## Step 5: Test Login

1. Use any tester's phone number (with country code)
2. Default password: `1234`
3. Click "Sign In"

## Password Management

### Default Password
- All users start with password: `1234`

### Changing Password
1. Login to the app
2. Click the user icon in the top-right
3. Select "Change Password"
4. Enter new password (minimum 4 characters)
5. Confirm new password

## Security Notes

- ✅ No Edge Functions required (using Supabase Auth client-side)
- ✅ RLS policies already set up
- ⚠️ For production, enable SMS verification
- ⚠️ Require users to change default password on first login
- ⚠️ Use stronger passwords (minimum 8+ characters with complexity)

## Troubleshooting

### "Invalid phone number or password"
- Ensure phone number includes country code (e.g., +254...)
- Verify user exists in Authentication → Users
- Check password is correct (default: 1234)

### "No profile found"
- Ensure `auth_user_id` is set in profiles table
- Run the UPDATE query to link auth user to profile

### Can't change password
- User must be logged in
- New password must be at least 4 characters
- Both password fields must match
