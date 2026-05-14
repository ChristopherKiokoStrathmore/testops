import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface SupabaseConnectionStatusProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

export function SupabaseConnectionStatus({ onConnectionChange }: SupabaseConnectionStatusProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'paused'>('checking');
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkConnection = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (error) {
        if (error.message?.includes('paused') || error.message?.includes('Project is paused')) {
          setStatus('paused');
          onConnectionChange?.(false);
        } else {
          setStatus('disconnected');
          onConnectionChange?.(false);
        }
      } else {
        setStatus('connected');
        onConnectionChange?.(true);
      }
    } catch (error: any) {
      console.error('Supabase connection check failed:', error);
      
      // Check if it's a network error or paused project
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        setStatus('disconnected');
      } else {
        setStatus('paused');
      }
      onConnectionChange?.(false);
    } finally {
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    await checkConnection();
    setTimeout(() => setIsRetrying(false), 1000);
  };

  if (status === 'connected') {
    return null; // Don't show anything when connected
  }

  if (status === 'checking') {
    return (
      <div className="fixed top-4 right-4 z-50 glass-effect border border-blue-500/30 rounded-2xl p-4 shadow-2xl max-w-sm animate-scale-in">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">Checking connection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 glass-effect border border-red-500/30 rounded-2xl p-5 shadow-2xl max-w-md animate-scale-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
          {status === 'paused' ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-400" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm mb-1">
            🔴 Database Paused
          </h4>
          <p className="text-gray-300 text-xs mb-2 leading-relaxed">
            Your Supabase project is <span className="text-red-400 font-semibold">paused</span>. 
            Resume it and add CORS origin to fix.
          </p>
          
          {/* Instructions */}
          <div className="bg-white/5 rounded-lg p-2.5 mb-3 space-y-1.5">
            <p className="text-gray-400 text-xs font-semibold mb-1">If it works on another computer:</p>
            <p className="text-gray-400 text-xs">💡 <strong className="text-white">Clear cache:</strong> Press F12 → Right-click refresh → "Empty Cache and Hard Reload"</p>
            <p className="text-gray-400 text-xs">💡 <strong className="text-white">Try Incognito:</strong> Ctrl+Shift+N (may be browser extension blocking)</p>
            <p className="text-gray-400 text-xs">💡 <strong className="text-white">If project is paused:</strong> Resume in dashboard, add CORS, wait 2-3 min</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Checking...' : 'Retry'}
            </button>
            <a
              href="https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-all"
            >
              Resume Project
            </a>
            <a
              href="https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-xs font-medium transition-all"
            >
              CORS Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
