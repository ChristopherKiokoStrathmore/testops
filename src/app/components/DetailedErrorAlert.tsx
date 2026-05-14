import { AlertTriangle, RefreshCw, ExternalLink, Clock } from 'lucide-react';

interface DetailedErrorAlertProps {
  message: string;
  details?: string;
  onRetry?: () => void;
}

export function DetailedErrorAlert({ message, details, onRetry }: DetailedErrorAlertProps) {
  const isPausedError = message.includes('PAUSED') || message.includes('paused') || 
                        message.includes('Cannot reach') || message.includes('timeout');

  return (
    <div className="glass-effect border-2 border-amber-500/40 rounded-2xl p-5 bg-amber-500/5">
      <div className="flex items-start gap-4">
        <div className="bg-amber-500/20 p-2.5 rounded-lg flex-shrink-0">
          {isPausedError ? (
            <Clock className="w-5 h-5 text-amber-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          )}
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="text-amber-400 font-semibold text-sm mb-1">
              {message}
            </h4>
            {details && (
              <p className="text-gray-400 text-xs leading-relaxed">
                {details}
              </p>
            )}
          </div>

          {isPausedError && (
            <div className="space-y-2 text-xs text-gray-400">
              <p className="font-semibold text-amber-400">Quick Fix:</p>
              <ol className="space-y-1.5 ml-4 list-decimal">
                <li>Go to <span className="text-blue-400 font-mono">supabase.com/dashboard</span></li>
                <li>Find your project: <span className="text-blue-400 font-mono">mjssawaxbmwjqksyevgd</span></li>
                <li>Click <span className="text-emerald-400 font-semibold">"Resume"</span> or <span className="text-emerald-400 font-semibold">"Restore"</span></li>
                <li>Wait <span className="text-amber-400 font-semibold">2-3 minutes</span> for activation</li>
                <li>Return here and try again</li>
              </ol>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-xs font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Connection
              </button>
            )}
            
            <a
              href="https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Supabase Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
