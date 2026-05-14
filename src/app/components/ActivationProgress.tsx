import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Clock } from 'lucide-react';

interface ActivationProgressProps {
  onComplete?: () => void;
}

export function ActivationProgress({ onComplete }: ActivationProgressProps) {
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const steps = [
    { label: 'Database starting', duration: 30 },
    { label: 'DNS records updating', duration: 60 },
    { label: 'API endpoints activating', duration: 90 },
    { label: 'Final checks', duration: 30 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => {
        const newElapsed = prev + 1;
        
        // Update step based on elapsed time
        const cumulativeTime = steps.slice(0, step + 1).reduce((sum, s) => sum + s.duration, 0);
        if (newElapsed >= cumulativeTime && step < steps.length - 1) {
          setStep(step + 1);
        }
        
        // Complete after total duration
        const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
        if (newElapsed >= totalDuration) {
          clearInterval(timer);
          onComplete?.();
        }
        
        return newElapsed;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
  const progress = Math.min((elapsed / totalDuration) * 100, 100);

  return (
    <div className="glass-effect border-2 border-blue-500/40 rounded-2xl p-6 bg-blue-500/5 animate-scale-in">
      <div className="flex items-start gap-4 mb-5">
        <div className="bg-blue-500/20 p-3 rounded-xl">
          <Clock className="w-6 h-6 text-blue-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-blue-400 font-bold text-lg mb-1">
            Project Activating...
          </h3>
          <p className="text-gray-400 text-sm">
            Please wait while your Supabase project wakes up
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-blue-400 font-mono">
            {formatTime(elapsed)}
          </div>
          <div className="text-xs text-gray-500">
            / {formatTime(totalDuration)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500">Starting</span>
          <span className="text-xs text-blue-400 font-medium">
            {Math.round(progress)}%
          </span>
          <span className="text-xs text-gray-500">Ready</span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((stepData, index) => {
          const isActive = index === step;
          const isComplete = index < step;
          
          return (
            <div
              key={index}
              className={`flex items-center gap-3 transition-all duration-300 ${
                isActive ? 'scale-105' : ''
              }`}
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                ${isComplete ? 'bg-emerald-500/20' : isActive ? 'bg-blue-500/20' : 'bg-gray-800/50'}
              `}>
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-600" />
                )}
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-medium transition-colors ${
                  isComplete ? 'text-emerald-400' : 
                  isActive ? 'text-blue-400' : 
                  'text-gray-500'
                }`}>
                  {stepData.label}
                </p>
              </div>

              {isActive && (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              )}
              {isComplete && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer tip */}
      <div className="mt-5 pt-5 border-t border-white/5">
        <p className="text-xs text-gray-500 text-center">
          💡 This usually takes 2-3 minutes. Feel free to grab a coffee!
        </p>
      </div>
    </div>
  );
}
