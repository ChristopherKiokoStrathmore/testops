import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

export function ConnectionRestoredBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Listen for connection restored event
    const handleRestore = () => {
      setShow(true);
      // Auto-hide after 5 seconds
      setTimeout(() => setShow(false), 5000);
    };

    window.addEventListener('connection-restored', handleRestore);
    return () => window.removeEventListener('connection-restored', handleRestore);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="glass-effect border-2 border-emerald-500/40 rounded-2xl p-4 bg-emerald-500/10 shadow-2xl backdrop-blur-xl max-w-sm">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          
          <div className="flex-1">
            <h4 className="text-emerald-400 font-semibold text-sm mb-1">
              Connection Restored!
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Supabase is now active and responding. You can now use the app normally.
            </p>
          </div>

          <button
            onClick={() => setShow(false)}
            className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
