import { useState, useEffect } from 'react';
import { TesterHeader } from './TesterHeader';
import { CategoryCard } from './CategoryCard';
import { SetupGuide } from './SetupGuide';
import { supabase } from '../lib/supabase';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import type { AuthUser } from '../lib/auth';

interface CategoryData {
  duration: number;
  withPrompt: boolean;
  transactionId: string;
  status: 'none' | 'pass' | 'fail';
}

interface DailyTestProps {
  currentUser: AuthUser;
  onLogout: () => void;
}

export function DailyTest({ currentUser, onLogout }: DailyTestProps) {
  // Safety check
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const [currentTimeSlot, setCurrentTimeSlot] = useState<string>('');
  const [nextTimeSlot, setNextTimeSlot] = useState<string>('');
  const [categories, setCategories] = useState<Record<string, CategoryData>>({
    'M-pesa': { duration: 0, withPrompt: false, transactionId: '', status: 'none' },
    'Safaricom': { duration: 0, withPrompt: false, transactionId: '', status: 'none' },
    'USSD': { duration: 0, withPrompt: false, transactionId: '', status: 'none' },
    'STK': { duration: 0, withPrompt: false, transactionId: '', status: 'none' },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // Get current time slot and next time slot
  useEffect(() => {
    const updateTimeSlot = () => {
      const now = new Date();
      const hour = now.getHours();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      setCurrentTimeSlot(`${displayHour}:00 ${ampm}`);

      // Calculate next hour
      const nextHour = (hour + 1) % 24;
      const nextAmpm = nextHour >= 12 ? 'PM' : 'AM';
      const nextDisplayHour = nextHour % 12 || 12;
      setNextTimeSlot(`${nextDisplayHour}:00 ${nextAmpm}`);
    };

    updateTimeSlot();
    const interval = setInterval(updateTimeSlot, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Check if database is set up
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const { error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);

        if (error) {
          if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
            setShowSetupGuide(true);
          }
        }
      } catch (error) {
        console.error('Error checking database:', error);
        setShowSetupGuide(true);
      }
    };

    checkDatabase();
  }, []);

  const handleCategoryChange = (category: string, field: 'duration' | 'withPrompt' | 'transactionId', value: number | boolean | string) => {
    setCategories(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleStatusChange = (category: string, status: 'none' | 'pass' | 'fail') => {
    setCategories(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        status,
        // Reset fields when changing status
        duration: 0,
        transactionId: '',
        isFailed: status === 'fail' ? prev[category].isFailed : false,
      },
    }));
  };

  const triggerNotification = () => {
    // Vibrate if supported (mobile devices)
    if ('vibrate' in navigator) {
      // Pattern: vibrate 200ms, pause 100ms, vibrate 200ms
      navigator.vibrate([200, 100, 200]);
    }

    // Play a beep sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio playback not supported:', error);
    }
  };

  const handleSubmit = async () => {
    // Validate that all categories have a status selected
    const incompleteCategories = Object.entries(categories).filter(
      ([_, data]) => data.status === 'none'
    );

    if (incompleteCategories.length > 0) {
      alert('⚠️ Please select Pass or Fail for all categories');
      return;
    }

    // Validate that all passed tests have Airtel money messages
    const passedWithoutTransactionId = Object.entries(categories).filter(
      ([_, data]) => data.status === 'pass' && !data.transactionId.trim()
    );

    if (passedWithoutTransactionId.length > 0) {
      const categoryNames = passedWithoutTransactionId.map(([name]) => name).join(', ');
      alert(`⚠️ Please enter Airtel Money Message for: ${categoryNames}`);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Create log entries for all 4 categories using current logged-in user
      const logs = Object.entries(categories).map(([category, data]) => ({
        tester_id: currentUser.id,
        category: category as 'M-pesa' | 'Safaricom' | 'USSD' | 'STK',
        duration_sec: 0, // Always 0 - time tracking removed
        is_failed: data.status === 'fail',
        transaction_id: data.status === 'pass' ? data.transactionId : null,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('test_logs').insert(logs);

      if (error) throw error;

      setSubmitStatus('success');
      
      // Trigger phone beep/vibration
      triggerNotification();

      // Reset form after successful submission
      setTimeout(() => {
        setCategories({
          'M-pesa': { duration: 0, withPrompt: false, transactionId: '', status: 'none' },
          'Safaricom': { duration: 0, withPrompt: false, transactionId: '', status: 'none' },
          'USSD': { duration: 0, withPrompt: false, transactionId: '', status: 'none' },
          'STK': { duration: 0, withPrompt: false, transactionId: '', status: 'none' },
        });
        setSubmitStatus(null);
      }, 4000);
    } catch (error) {
      console.error('Error submitting logs:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show setup guide if database is not configured
  if (showSetupGuide) {
    return <SetupGuide />;
  }

  return (
    <div className="min-h-screen pb-32 lg:pb-8">
      <TesterHeader
        user={currentUser}
        onSignOut={onLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Slot Indicator */}
        <div className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Current Test Slot</p>
              <p className="text-white text-3xl font-semibold tracking-tight">{currentTimeSlot}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <CategoryCard
            title="M-pesa"
            icon="💳"
            color="emerald"
            duration={categories['M-pesa'].duration}
            withPrompt={categories['M-pesa'].withPrompt}
            transactionId={categories['M-pesa'].transactionId}
            status={categories['M-pesa'].status}
            onDurationChange={(val) => handleCategoryChange('M-pesa', 'duration', val)}
            onWithPromptChange={(val) => handleCategoryChange('M-pesa', 'withPrompt', val)}
            onTransactionIdChange={(val) => handleCategoryChange('M-pesa', 'transactionId', val)}
            onStatusChange={(status) => handleStatusChange('M-pesa', status)}
          />
          <CategoryCard
            title="Safaricom"
            icon="📱"
            color="green"
            duration={categories['Safaricom'].duration}
            withPrompt={categories['Safaricom'].withPrompt}
            transactionId={categories['Safaricom'].transactionId}
            status={categories['Safaricom'].status}
            onDurationChange={(val) => handleCategoryChange('Safaricom', 'duration', val)}
            onWithPromptChange={(val) => handleCategoryChange('Safaricom', 'withPrompt', val)}
            onTransactionIdChange={(val) => handleCategoryChange('Safaricom', 'transactionId', val)}
            onStatusChange={(status) => handleStatusChange('Safaricom', status)}
          />
          <CategoryCard
            title="USSD"
            icon="📞"
            color="teal"
            duration={categories['USSD'].duration}
            withPrompt={categories['USSD'].withPrompt}
            transactionId={categories['USSD'].transactionId}
            status={categories['USSD'].status}
            onDurationChange={(val) => handleCategoryChange('USSD', 'duration', val)}
            onWithPromptChange={(val) => handleCategoryChange('USSD', 'withPrompt', val)}
            onTransactionIdChange={(val) => handleCategoryChange('USSD', 'transactionId', val)}
            onStatusChange={(status) => handleStatusChange('USSD', status)}
          />
          <CategoryCard
            title="STK"
            icon="🔐"
            color="cyan"
            duration={categories['STK'].duration}
            withPrompt={categories['STK'].withPrompt}
            transactionId={categories['STK'].transactionId}
            status={categories['STK'].status}
            onDurationChange={(val) => handleCategoryChange('STK', 'duration', val)}
            onWithPromptChange={(val) => handleCategoryChange('STK', 'withPrompt', val)}
            onTransactionIdChange={(val) => handleCategoryChange('STK', 'transactionId', val)}
            onStatusChange={(status) => handleStatusChange('STK', status)}
          />
        </div>

        {/* Submit Button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full max-w-md bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-5 px-8 rounded-3xl font-semibold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? 'Logging Test...' : 'Log Hourly Test'}
          </button>

          {submitStatus === 'success' && (
            <div className="glass-effect border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full animate-scale-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-lg mb-2 tracking-tight">Thank you for submitting! 🎉</h4>
                  <p className="text-gray-400 text-sm mb-3">Your test results have been logged successfully.</p>
                  <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-medium text-sm">
                      See you at the {nextTimeSlot} slot!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="glass-effect border border-red-500/30 rounded-3xl p-6 max-w-md w-full animate-scale-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-lg mb-2 tracking-tight">Submission Failed</h4>
                  <p className="text-gray-400 text-sm">Error logging test. Please try again.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
