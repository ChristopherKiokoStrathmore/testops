/**
 * Simple health check for Supabase REST API
 * This bypasses the Supabase JS client to test raw connectivity
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function healthCheck(): Promise<{
  success: boolean;
  message: string;
  latency?: number;
  details?: string;
}> {
  const startTime = Date.now();
  
  try {
    // Try a simple REST endpoint first
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': SUPABASE_KEY,
      },
      mode: 'cors',
      signal: AbortSignal.timeout(8000) // 8 second timeout
    });

    const latency = Date.now() - startTime;

    // Check for redirect (project paused)
    if (response.type === 'opaqueredirect' || 
        response.status === 301 || 
        response.status === 302 || 
        response.status === 307 || 
        response.status === 308) {
      return {
        success: false,
        message: '⚠️ Project is PAUSED',
        details: 'Go to supabase.com/dashboard and resume your project',
        latency
      };
    }

    if (!response.ok && response.status !== 0) {
      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
        details: 'Server returned an error',
        latency
      };
    }

    // If we got here, the connection works
    return {
      success: true,
      message: 'Database is accessible',
      latency
    };
  } catch (err: any) {
    const latency = Date.now() - startTime;
    
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      return {
        success: false,
        message: 'Connection timeout',
        details: 'Database may be paused, starting up, or network is slow. Wait 2-3 minutes after unpausing.',
        latency
      };
    }

    if (err.message?.includes('Failed to fetch')) {
      return {
        success: false,
        message: 'Cannot reach Supabase',
        details: 'Project may be paused, check your internet connection, or wait 2-3 minutes after unpausing',
        latency
      };
    }

    if (err.message?.includes('CORS')) {
      return {
        success: false,
        message: 'CORS error',
        details: 'Add your domain to Supabase allowed origins or project is paused',
        latency
      };
    }

    return {
      success: false,
      message: `Connection error: ${err.message}`,
      details: 'Check console for details',
      latency
    };
  }
}

// Expose health check function to window for manual testing
if (typeof window !== 'undefined') {
  (window as any).testSupabaseHealth = healthCheck;
  
  // Run initial silent check on load - only log issues
  healthCheck().then(result => {
    if (!result.success) {
      console.warn('%c⚠️ Supabase Connection Issue', 'color: #f59e0b; font-weight: bold;');
      console.warn(`%c${result.message}`, 'color: #fbbf24;');
      if (result.details) {
        console.warn(`%c${result.details}`, 'color: #9ca3af;');
      }
    }
  }).catch(() => {
    // Silent fail - the UI will handle it
  });
}
