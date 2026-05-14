/**
 * Ultra-simple Supabase API access
 * Avoids CORS preflight by using minimal headers
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Simple GET request that avoids CORS preflight
 * Only uses simple headers that don't trigger OPTIONS request
 */
export async function simpleQuery(phone: string, password: string): Promise<any> {
  try {
    // Build URL with query params (GET request with simple headers = no preflight!)
    const url = `${SUPABASE_URL}/rest/v1/profiles?phone_number=eq.${encodeURIComponent(phone)}&password=eq.${encodeURIComponent(password)}&select=*`;
    
    console.log('🔵 Trying simple GET request (no preflight)...');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
      },
      // No Authorization header to avoid preflight
      // No custom headers to avoid preflight
    });

    if (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) {
      console.error('❌ Supabase redirecting - project may be paused');
      throw new Error('⚠️ Your Supabase project is PAUSED. Please go to https://supabase.com/dashboard and resume your project.');
    }

    if (!response.ok) {
      const text = await response.text();
      console.error('API Error Response:', text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('✅ Login successful via simple query');
      return data[0];
    }
    
    return null;
  } catch (err: any) {
    console.error('Simple query failed:', err.message);
    throw err;
  }
}

/**
 * Insert test log using simple POST
 */
export async function simpleInsert(table: string, data: any): Promise<any> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Insert failed: ${text}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error('Simple insert failed:', err.message);
    throw err;
  }
}

/**
 * Check if Supabase project is active
 */
export async function checkProjectStatus(): Promise<{ active: boolean; message: string }> {
  try {
    // Try hitting the health endpoint
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
      },
    });

    if (response.status === 301 || response.status === 302) {
      return {
        active: false,
        message: '⚠️ Supabase project appears to be PAUSED. Go to dashboard to resume it.',
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        active: true,
        message: '✅ Project is active but authentication failed (expected for HEAD request)',
      };
    }

    if (response.ok || response.status === 404) {
      return {
        active: true,
        message: '✅ Supabase project is active',
      };
    }

    return {
      active: false,
      message: `❌ Unexpected status: ${response.status}`,
    };
  } catch (err: any) {
    return {
      active: false,
      message: `❌ Network error: ${err.message}`,
    };
  }
}

// Expose for debugging
if (typeof window !== 'undefined') {
  (window as any).simpleQuery = simpleQuery;
  (window as any).checkProjectStatus = checkProjectStatus;
}
