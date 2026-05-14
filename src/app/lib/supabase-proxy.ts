/**
 * Supabase Proxy Layer
 * This helps bypass CORS issues in browser environments
 * by using different request strategies
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface QueryParams {
  phone_number: string;
  password: string;
}

/**
 * Direct REST API query with CORS-friendly headers
 */
export async function queryProfileByPhone(phone: string, password: string): Promise<any> {
  try {
    // Use URL search params for GET request (more CORS-friendly)
    const url = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
    url.searchParams.append('phone_number', `eq.${phone}`);
    url.searchParams.append('password', `eq.${password}`);
    url.searchParams.append('select', '*');
    url.searchParams.append('limit', '1');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      return null;
    }

    return data[0]; // Return first match
  } catch (err: any) {
    console.error('Proxy query error:', err);
    throw err;
  }
}

/**
 * Test if direct API access works
 */
export async function testDirectAccess(): Promise<boolean> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    return response.ok;
  } catch (err) {
    console.error('Direct access test failed:', err);
    return false;
  }
}

// Expose for console testing
if (typeof window !== 'undefined') {
  (window as any).testDirectSupabaseAccess = testDirectAccess;
  (window as any).queryProfileByPhone = queryProfileByPhone;
}
