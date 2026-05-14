import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: 'public',
  },
});

export interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  password: string;
  created_at?: string;
}

export interface TestLog {
  id?: string;
  tester_id: string;
  category: 'M-pesa' | 'Safaricom' | 'USSD' | 'STK';
  duration_sec: number;
  is_failed: boolean;
  transaction_id?: string;
  created_at?: string;
  // Joined data from profiles table
  profiles?: {
    full_name: string;
    phone_number: string;
  };
}
