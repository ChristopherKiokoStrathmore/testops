import { CheckCircle2, Zap } from 'lucide-react';

export function ConnectionSuccess() {
  return (
    <div className="glass-effect border-2 border-emerald-500/40 rounded-2xl p-4 bg-emerald-500/5 animate-scale-in">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500/20 p-2 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        
        <div className="flex-1">
          <h4 className="text-emerald-400 font-semibold text-sm mb-0.5">
            Connection Successful
          </h4>
          <p className="text-gray-400 text-xs">
            Supabase project is active and responding
          </p>
        </div>

        <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
      </div>
    </div>
  );
}
