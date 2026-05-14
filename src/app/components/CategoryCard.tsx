interface CategoryCardProps {
  title: string;
  icon: string;
  color: 'emerald' | 'green' | 'teal' | 'cyan';
  duration: number;
  withPrompt: boolean;
  transactionId: string;
  onDurationChange: (value: number) => void;
  onWithPromptChange: (value: boolean) => void;
  onTransactionIdChange: (value: string) => void;
  status: 'none' | 'pass' | 'fail';
  onStatusChange: (status: 'none' | 'pass' | 'fail') => void;
}

const colorClasses = {
  emerald: {
    border: 'border-emerald-500/20',
    bg: 'bg-gradient-to-br from-emerald-500/5 to-emerald-600/10',
    iconBg: 'from-emerald-500 to-emerald-600',
    text: 'text-emerald-400',
    shadow: 'shadow-emerald-500/10',
  },
  green: {
    border: 'border-green-500/20',
    bg: 'bg-gradient-to-br from-green-500/5 to-green-600/10',
    iconBg: 'from-green-500 to-green-600',
    text: 'text-green-400',
    shadow: 'shadow-green-500/10',
  },
  teal: {
    border: 'border-teal-500/20',
    bg: 'bg-gradient-to-br from-teal-500/5 to-teal-600/10',
    iconBg: 'from-teal-500 to-teal-600',
    text: 'text-teal-400',
    shadow: 'shadow-teal-500/10',
  },
  cyan: {
    border: 'border-cyan-500/20',
    bg: 'bg-gradient-to-br from-cyan-500/5 to-cyan-600/10',
    iconBg: 'from-cyan-500 to-cyan-600',
    text: 'text-cyan-400',
    shadow: 'shadow-cyan-500/10',
  },
};

export function CategoryCard({
  title,
  icon,
  color,
  duration,
  withPrompt,
  transactionId,
  onDurationChange,
  onWithPromptChange,
  onTransactionIdChange,
  status,
  onStatusChange,
}: CategoryCardProps) {
  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-3xl p-6 backdrop-blur-sm hover:border-${color}-500/40 transition-all duration-300 hover:shadow-lg ${colors.shadow}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${colors.iconBg} rounded-2xl flex items-center justify-center shadow-lg ${colors.shadow}`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">{title}</h3>
        </div>
      </div>

      {/* Pass/Fail Buttons */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-3">
          Test Result
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onStatusChange('pass')}
            className={`py-3.5 px-4 rounded-2xl font-medium transition-all duration-200 ${
              status === 'pass'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            Pass
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('fail')}
            className={`py-3.5 px-4 rounded-2xl font-medium transition-all duration-200 ${
              status === 'fail'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-[1.02]'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            Fail
          </button>
        </div>
      </div>

      {/* Airtel Money Message Field - Shows when PASS is selected */}
      {status === 'pass' && (
        <div className="mb-6 animate-scale-in">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Airtel Money Message <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => onTransactionIdChange(e.target.value)}
            placeholder="Enter Airtel money message (required)"
            required
            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all duration-200"
          />
        </div>
      )}

      {/* Failed with Prompt Field - Shows when FAIL is selected */}
      {status === 'fail' && (
        <div className="animate-scale-in">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Failed with Prompt?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onWithPromptChange(false)}
              className={`py-3.5 px-4 rounded-2xl font-medium transition-all duration-200 ${
                !withPrompt
                  ? 'bg-gray-600 text-white shadow-lg scale-[1.02]'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              No
            </button>
            <button
              type="button"
              onClick={() => onWithPromptChange(true)}
              className={`py-3.5 px-4 rounded-2xl font-medium transition-all duration-200 ${
                withPrompt
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              Yes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
