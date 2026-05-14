import { supabase } from './supabase';
import { queryProfileByPhone } from './supabase-proxy';
import { simpleQuery, checkProjectStatus } from './supabase-simple';

export interface AuthUser {
  id: string;
  phone: string;
  full_name: string;
  role: 'tester' | 'developer';
}

// Local session storage key
const SESSION_KEY = 'testops_user_session';

export const authService = {
  // Sign in with phone and password - direct DB lookup with retry
  async signIn(phone: string, password: string, retryCount = 0): Promise<AuthUser> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 seconds between retries
    
    try {
      // Format phone number - convert 0xxx to +254xxx
      let formattedPhone = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
      
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+254' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+254' + formattedPhone;
      }
      
      console.log(`Login attempt ${retryCount + 1}/${MAX_RETRIES + 1} for ${formattedPhone}`);
      
      // Check project status first on first attempt
      if (retryCount === 0) {
        const status = await checkProjectStatus();
        console.log(status.message);
        
        if (!status.active && status.message.includes('PAUSED')) {
          throw new Error('⚠️ Your Supabase project is PAUSED. Please go to https://supabase.com/dashboard and resume your project.');
        }
      }
      
      // Strategy: Try simplest approach first (avoids CORS preflight)
      let data = null;
      let error = null;
      
      try {
        console.log('1️⃣ Trying simple query (no preflight)...');
        data = await Promise.race([
          simpleQuery(formattedPhone, password),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
        ]);
        console.log('✅ Simple query successful');
      } catch (simpleError: any) {
        console.warn('Simple query failed:', simpleError.message);
        
        try {
          console.log('2️⃣ Trying direct API with auth header...');
          data = await Promise.race([
            queryProfileByPhone(formattedPhone, password),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), 10000)
            )
          ]);
          console.log('✅ Direct API successful');
        } catch (directError: any) {
          console.warn('Direct API failed:', directError.message);
          
          // Last resort: Supabase client
          console.log('3️⃣ Trying Supabase client...');
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          );
          
          const queryPromise = supabase
            .from('profiles')
            .select('*')
            .eq('phone_number', formattedPhone)
            .eq('password', password)
            .single();
          
          const result = await Promise.race([queryPromise, timeoutPromise]);
          data = result.data;
          error = result.error;
        }
      }

      if (error) {
        // Check if it's a network/fetch error that we should retry
        const isFetchError = error.message?.includes('fetch') || 
                            error.message?.includes('Failed') || 
                            error.message?.includes('network') ||
                            error.message?.includes('timeout') ||
                            error.code === 'PGRST301' ||
                            !error.code;
        
        if (isFetchError && retryCount < MAX_RETRIES) {
          console.log(`Network error, retrying in ${RETRY_DELAY}ms...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return this.signIn(phone, password, retryCount + 1);
        }
        
        // Not a fetch error or exceeded retries
        console.error('Login error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        if (isFetchError) {
          throw new Error('Unable to connect to database. Please check your internet connection and try again.');
        }
        
        throw new Error('Invalid phone number or password');
      }

      if (!data) {
        throw new Error('Invalid phone number or password');
      }

      // Store session in localStorage
      const user: AuthUser = {
        id: data.id,
        phone: data.phone_number,
        full_name: data.full_name,
        role: data.role || 'tester',
      };
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      console.log('✅ Login successful:', user.full_name);
      return user;
    } catch (err: any) {
      // Check if it's a timeout error
      if (err.message === 'Request timeout' && retryCount < MAX_RETRIES) {
        console.log(`Request timeout, retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.signIn(phone, password, retryCount + 1);
      }
      
      // If it's our custom error, rethrow it
      if (err.message?.includes('Invalid phone') || 
          err.message?.includes('Unable to connect')) {
        throw err;
      }
      
      // For other network errors, retry if we haven't exceeded max retries
      if (retryCount < MAX_RETRIES) {
        console.log(`Unexpected error, retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.signIn(phone, password, retryCount + 1);
      }
      
      // If all retries failed, throw a network error
      console.error('All login attempts failed:', err);
      throw new Error('Connection failed after multiple attempts. Please try again later.');
    }
  },

  // Sign out
  async signOut() {
    localStorage.removeItem(SESSION_KEY);
  },

  // Get current user from localStorage
  async getCurrentUser(): Promise<AuthUser | null> {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;
    
    try {
      return JSON.parse(sessionData);
    } catch {
      return null;
    }
  },

  // Change password - update DB directly
  async changePassword(userId: string, newPassword: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ password: newPassword })
      .eq('id', userId);

    if (error) throw error;
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const user = await this.getCurrentUser();
    return !!user;
  },
};
