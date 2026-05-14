import { supabase } from './supabase';

/**
 * Direct Supabase connection tester
 * This helps diagnose connection issues
 */
export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
  
  try {
    // Test 1: Simple query
    console.log('Test 1: Simple query to profiles table...');
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .limit(1);
    
    if (error) {
      console.error('❌ Query failed:', error);
      return false;
    }
    
    console.log('✅ Query successful:', data);
    
    // Test 2: Count query
    console.log('Test 2: Count query...');
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Count query failed:', countError);
    } else {
      console.log('✅ Count query successful:', count, 'profiles found');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return false;
  }
}

// Manual test only - don't auto-run
// Call testSupabaseConnection() manually from console if needed
