-- =============================================
-- DATABASE SCHEMA UPDATE - ADD with_prompt COLUMN
-- =============================================
-- This SQL script adds the missing 'with_prompt' column to the test_logs table
-- Run this in your Supabase SQL Editor

-- Add with_prompt column to test_logs table
ALTER TABLE public.test_logs
ADD COLUMN IF NOT EXISTS with_prompt boolean DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.test_logs.with_prompt IS 'Indicates if a prompt was given when test failed. NULL for passed tests, true/false for failed tests.';

-- =============================================
-- COMPLETE UPDATED SCHEMA (for reference)
-- =============================================

-- Profiles table (no changes)
-- CREATE TABLE public.profiles (
--   id uuid NOT NULL DEFAULT gen_random_uuid(),
--   full_name text NOT NULL,
--   phone_number text NOT NULL UNIQUE,
--   password text NOT NULL DEFAULT '1234'::text,
--   created_at timestamp with time zone DEFAULT now(),
--   role text DEFAULT 'tester'::text,
--   CONSTRAINT profiles_pkey PRIMARY KEY (id)
-- );

-- Test logs table (with new with_prompt column)
-- CREATE TABLE public.test_logs (
--   id uuid NOT NULL DEFAULT gen_random_uuid(),
--   tester_id uuid NOT NULL,
--   category text NOT NULL CHECK (category = ANY (ARRAY['M-pesa'::text, 'Safaricom'::text, 'USSD'::text, 'STK'::text])),
--   duration_sec integer NOT NULL DEFAULT 0,
--   is_failed boolean NOT NULL DEFAULT false,
--   with_prompt boolean DEFAULT NULL,  -- NEW COLUMN
--   created_at timestamp with time zone DEFAULT now(),
--   CONSTRAINT test_logs_pkey PRIMARY KEY (id),
--   CONSTRAINT test_logs_tester_id_fkey FOREIGN KEY (tester_id) REFERENCES public.profiles(id)
-- );
