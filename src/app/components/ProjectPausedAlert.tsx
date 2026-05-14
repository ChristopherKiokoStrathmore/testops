import { AlertTriangle, ExternalLink } from 'lucide-react';

export function ProjectPausedAlert() {
  return (
    <div className="glass-effect border-2 border-red-500/40 rounded-2xl p-6 bg-red-500/5">
      <div className="flex items-start gap-4">
        <div className="bg-red-500/20 p-3 rounded-xl">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-red-400 font-bold text-lg mb-2">
            Supabase Project May Be Paused
          </h3>
          
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            The error "Redirect is not allowed for a preflight request" typically means your 
            Supabase project is <strong className="text-red-300">PAUSED</strong> or 
            <strong className="text-red-300"> INACTIVE</strong>.
          </p>

          <div className="bg-black/30 rounded-xl p-4 mb-4 space-y-2">
            <p className="text-gray-400 text-xs font-medium mb-2">🔧 How to Fix:</p>
            
            <ol className="text-gray-300 text-sm space-y-2 ml-4 list-decimal">
              <li>
                Go to your{' '}
                <a 
                  href="https://supabase.com/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 underline inline-flex items-center gap-1"
                >
                  Supabase Dashboard
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                Select project: <code className="text-yellow-300 bg-black/50 px-2 py-0.5 rounded text-xs">
                  mjssawaxbmwjqksyevgd
                </code>
              </li>
              <li>
                Look for a banner that says <strong>"Project Paused"</strong>
              </li>
              <li>
                Click <strong className="text-emerald-400">"Resume Project"</strong> or{' '}
                <strong className="text-emerald-400">"Restore Project"</strong>
              </li>
              <li>
                Wait 1-2 minutes for the project to fully activate
              </li>
              <li>
                Refresh this page and try logging in again
              </li>
            </ol>
          </div>

          <div className="flex items-start gap-2 text-xs text-gray-400">
            <span>💡</span>
            <p>
              Supabase pauses free-tier projects after inactivity. 
              Resuming takes just a few clicks and is completely free.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
