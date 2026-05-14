import { useState, useEffect } from 'react';
import { authService } from '../lib/auth';
import { connectionTest } from '../lib/connection-test';
import { CORSTroubleshoot } from './CORSTroubleshoot';
import { CORSDesktopFix } from './CORSDesktopFix';
import { ProjectPausedAlert } from './ProjectPausedAlert';
import { ConnectionSuccess } from './ConnectionSuccess';
import { DetailedErrorAlert } from './DetailedErrorAlert';
import { SupabaseConnectionStatus } from './SupabaseConnectionStatus';
import { Phone, Lock, ArrowRight, AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [retryInfo, setRetryInfo] = useState<string>('');
  const [showCORSFix, setShowCORSFix] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Detect if on desktop browser (non-mobile) FIRST
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const desktop = !isMobile;
    setIsDesktop(desktop);
    
    // Then check connection (with a tiny delay to ensure state is set)
    setTimeout(() => checkConnection(), 10);
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    setError(null);
    setErrorDetails(null);
    setShowCORSFix(false);
    const result = await connectionTest.testConnection();
    setConnectionStatus(result.success ? 'connected' : 'disconnected');
    if (!result.success) {
      setError(result.message);
      setErrorDetails((result as any).details || null);
      
      // If it's a CORS/redirect error, show the CORS fix (especially on desktop)
      const corsError = result.message?.includes('CORS') || 
                        result.message?.includes('redirect') ||
                        result.message?.includes('preflight') ||
                        result.message?.includes('blocked') ||
                        result.message?.includes('ERR_FAILED') ||
                        (result as any).details?.includes('CORS') ||
                        (result as any).details?.includes('redirect') ||
                        (result as any).details?.includes('preflight');
      
      // Always show CORS fix for CORS errors, but prioritize desktop
      if (corsError) {
        setShowCORSFix(true);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRetryInfo('');
    setIsLoading(true);

    try {
      // Show retry info by listening to console logs
      const originalLog = console.log;
      console.log = (...args) => {
        const msg = args.join(' ');
        if (msg.includes('attempt') || msg.includes('retrying')) {
          setRetryInfo(msg);
        }
        originalLog.apply(console, args);
      };
      
      await authService.signIn(phone, password);
      
      // Restore console.log
      console.log = originalLog;
      
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Check error type and show appropriate message
      if (err.message?.includes('Unable to connect') || 
          err.message?.includes('Connection failed') ||
          err.message?.includes('fetch') || 
          err.message?.includes('CORS') ||
          err.message?.includes('preflight') ||
          err.message?.includes('blocked') ||
          err.message?.includes('network')) {
        setError('⚠️ Unable to connect to the database. Please check:\n\n1. Your internet connection\n2. The Supabase project is active\n3. Wait 1-2 minutes if project was just restored');
        setConnectionStatus('disconnected');
        setShowCORSFix(true); // Always show CORS fix for connection errors
      } else if (err.message?.includes('Invalid phone')) {
        setError('❌ Invalid phone number or password.');
      } else {
        setError(`❌ ${err.message || 'Login failed. Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
      setRetryInfo('');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle gradient background - Apple style */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black opacity-50" />
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
      }} />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo/Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-500/20 mb-6 animate-scale-in">
            <span className="text-3xl">📋</span>
          </div>
          <h1 className="text-4xl font-semibold text-white mb-2 tracking-tight">Welcome back</h1>
          <p className="text-gray-400 text-base">Sign in to continue to TestOps</p>
        </div>

        {/* Login Form */}
        <div className="glass-effect rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Connection Status */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${
              connectionStatus === 'connected' 
                ? 'bg-emerald-500/10 border-emerald-500/20' 
                : connectionStatus === 'disconnected'
                ? 'bg-yellow-500/10 border-yellow-500/20'
                : 'bg-blue-500/10 border-blue-500/20'
            }`}>
              {connectionStatus === 'checking' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
              {connectionStatus === 'connected' && <Wifi className="w-4 h-4 text-emerald-400" />}
              {connectionStatus === 'disconnected' && <WifiOff className="w-4 h-4 text-yellow-400" />}
              <p className={`text-sm ${
                connectionStatus === 'connected' 
                  ? 'text-emerald-300' 
                  : connectionStatus === 'disconnected'
                  ? 'text-yellow-300'
                  : 'text-blue-300'
              }`}>
                {connectionStatus === 'checking' && 'Checking connection...'}
                {connectionStatus === 'connected' && 'Database connected'}
                {connectionStatus === 'disconnected' && 'Database initializing - please wait'}
              </p>
              {connectionStatus === 'disconnected' && (
                <button
                  type="button"
                  onClick={checkConnection}
                  className="ml-auto text-xs text-yellow-300 hover:text-yellow-200 underline"
                >
                  Retry
                </button>
              )}
            </div>

            {/* Retry Info */}
            {retryInfo && (
              <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 animate-scale-in">
                <Loader2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5 animate-spin" />
                <p className="text-blue-300 text-sm leading-relaxed">{retryInfo}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 animate-scale-in">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm leading-relaxed whitespace-pre-line">{error}</p>
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Phone Number
              </label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors duration-200" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0785638462"
                  required
                  className="w-full bg-white/5 text-white pl-12 pr-4 py-4 rounded-2xl border border-white/10 focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 placeholder:text-gray-600"
                />
              </div>
              <p className="text-gray-600 text-xs mt-2 ml-1">Enter with or without +254</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors duration-200" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-white/5 text-white pl-12 pr-4 py-4 rounded-2xl border border-white/10 focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 placeholder:text-gray-600"
                />
              </div>
              <p className="text-gray-600 text-xs mt-2 ml-1">Default password: 1234</p>
            </div>

            {/* Helpful tip when connection fails */}
            {connectionStatus === 'disconnected' && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <p className="text-blue-300 text-xs text-center">
                  💡 Connection check failed, but you can still try logging in.
                  <br />The login might work even if the pre-check doesn't.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-6 rounded-2xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>{connectionStatus === 'disconnected' ? 'Try Sign In Anyway' : 'Sign In'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8">
            <div className="border-t border-white/10 pt-6">
              <p className="text-center text-gray-500 text-sm">
                Fintech QA Management Suite
              </p>
              <p className="text-center text-gray-600 text-xs mt-2">
                Secure testing platform for mobile payment systems
              </p>
            </div>
          </div>
        </div>

        {/* Connection status */}
        {connectionStatus === 'connected' && (
          <div className="mt-6 animate-scale-in">
            <ConnectionSuccess />
          </div>
        )}

        {/* Desktop CORS Fix - Show first if detected */}
        {showCORSFix && connectionStatus === 'disconnected' && (
          <div className="mt-6 animate-scale-in">
            <CORSDesktopFix />
          </div>
        )}

        {/* Detailed error with retry */}
        {connectionStatus === 'disconnected' && error && !showCORSFix && (
          <div className="mt-6 animate-scale-in">
            <DetailedErrorAlert 
              message={error}
              details={errorDetails || undefined}
              onRetry={checkConnection}
            />
          </div>
        )}

        {/* Browser-specific info - only show if generic error and not showing CORS fix */}
        {connectionStatus === 'disconnected' && !showCORSFix && !error?.includes('PAUSED') && !error?.includes('timeout') && !error?.includes('Cannot reach') && (
          <div className="mt-6 animate-scale-in space-y-4">
            <CORSTroubleshoot />
          </div>
        )}

        {/* Bottom info */}
        <p className="text-center text-gray-600 text-xs mt-8">
          Protected by industry-standard encryption
        </p>
      </div>
      
      {/* Supabase Connection Status */}
      <SupabaseConnectionStatus />
    </div>
  );
}
