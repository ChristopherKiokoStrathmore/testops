import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { healthCheck } from '../lib/health-check';

export function ConnectionIndicator() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [details, setDetails] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    const result = await healthCheck();
    setStatus(result.success ? 'online' : 'offline');
    setDetails(result.success ? `Connected (${result.latency}ms)` : result.message);
  };

  if (status === 'checking') return null;

  return (
    <div 
      className="fixed bottom-4 right-4 z-50"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <div className="relative">
        {/* Status Indicator */}
        <button
          onClick={checkStatus}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-full shadow-lg backdrop-blur-xl
            transition-all duration-300 hover:scale-105 active:scale-95
            ${status === 'online' 
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/20 border border-red-500/30 text-red-400'}
          `}
          title="Click to refresh connection status"
        >
          {status === 'online' ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4 animate-pulse" />
          )}
          
          {showDetails && (
            <span className="text-xs font-medium whitespace-nowrap">
              {details}
            </span>
          )}
        </button>

        {/* Tooltip on hover */}
        {!showDetails && (
          <div className="absolute bottom-full right-0 mb-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-gray-900/95 border border-gray-700 rounded-lg px-3 py-2 shadow-xl backdrop-blur-xl">
              <p className={`text-xs font-medium ${status === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>
                {details}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
