import { supabase } from './supabase';
import { healthCheck } from './health-check';

// Track previous connection state to detect restoration
let wasDisconnected = false;

export const connectionTest = {
  // Test if Supabase REST API is responding
  async testConnection(): Promise<{ success: boolean; message: string; details?: string }> {
    try {
      // First try raw health check
      const health = await healthCheck();
      
      if (!health.success) {
        console.warn('Health check failed:', health.message);
        console.warn('Details:', health.details);
        wasDisconnected = true;
        return {
          success: false,
          message: health.message,
          details: health.details,
        };
      }
      
      console.log(`✅ Health check passed (${health.latency}ms)`);
      
      // If was disconnected and now connected, dispatch event
      if (wasDisconnected && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('connection-restored'));
        wasDisconnected = false;
      }
      
      // Then try Supabase client
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );

      const queryPromise = supabase
        .from('profiles')
        .select('id')
        .limit(1);

      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      if (result.error) {
        console.warn('Supabase client error:', result.error.message);
        return {
          success: false,
          message: 'Database client error. You can still try logging in.',
        };
      }

      return {
        success: true,
        message: 'Connection successful',
      };
    } catch (err: any) {
      console.warn('Connection test error:', err);
      return {
        success: false,
        message: 'Pre-check unavailable. You can still try logging in.',
      };
    }
  },

  // Retry connection with exponential backoff
  async waitForConnection(maxAttempts = 5): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.testConnection();
      if (result.success) return true;

      // Wait before retry (2s, 4s, 8s, 16s, 32s)
      const waitTime = Math.min(2000 * Math.pow(2, i), 32000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    return false;
  },
};
