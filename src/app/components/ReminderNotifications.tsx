import { useEffect, useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';

export function ReminderNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Check if user has previously enabled reminders
      const savedPreference = localStorage.getItem('testRemindersEnabled');
      if (savedPreference === 'true' && Notification.permission === 'granted') {
        setIsEnabled(true);
        setupHourlyReminders();
      }
    }

    // Show prompt after 30 seconds if not already decided
    const timer = setTimeout(() => {
      if (permission === 'default') {
        setShowPrompt(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setPermission(result);
        
        if (result === 'granted') {
          setIsEnabled(true);
          localStorage.setItem('testRemindersEnabled', 'true');
          setupHourlyReminders();
          setShowPrompt(false);
          
          // Show immediate test notification
          new Notification('Reminders Enabled! 🔔', {
            body: 'You will receive hourly reminders to complete your tests.',
            icon: '📋',
            badge: '📋',
          });
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  const disableReminders = () => {
    setIsEnabled(false);
    localStorage.setItem('testRemindersEnabled', 'false');
    setShowPrompt(false);
  };

  const setupHourlyReminders = () => {
    // Check every minute if it's the start of a new hour
    setInterval(() => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // Trigger at the start of each hour (00:00)
      if (minutes === 0 && seconds === 0) {
        const hour = now.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;

        if ('Notification' in window && Notification.permission === 'granted') {
          // Vibrate
          if ('vibrate' in navigator) {
            navigator.vibrate([300, 100, 300]);
          }

          // Show notification
          new Notification(`⏰ Time for Hourly Test!`, {
            body: `It's ${displayHour}:00 ${ampm}. Please complete your testing for this hour.`,
            icon: '📋',
            badge: '📋',
            tag: 'hourly-reminder',
            requireInteraction: true,
          });

          // Play sound
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
          } catch (error) {
            console.log('Audio playback not supported:', error);
          }
        }
      }
    }, 1000); // Check every second
  };

  // Don't show anything if notifications aren't supported
  if (!('Notification' in window)) {
    return null;
  }

  return (
    <>
      {/* Notification Prompt */}
      {showPrompt && permission === 'default' && (
        <div className="fixed bottom-20 lg:bottom-4 right-4 z-50 animate-slide-in">
          <div className="glass-effect border border-white/10 rounded-3xl p-6 max-w-sm shadow-2xl apple-shadow-lg">
            <button
              onClick={() => setShowPrompt(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1 pr-4">
                <h4 className="text-white font-semibold text-lg mb-2 tracking-tight">
                  Enable Hourly Reminders?
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Get notified at the start of each hour to complete your tests. Your phone will beep and vibrate.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={requestPermission}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Enable
                  </button>
                  <button
                    onClick={disableReminders}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 border border-white/10"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Status Indicator */}
      {isEnabled && (
        <div className="fixed top-20 right-4 z-40 animate-fade-in">
          <div className="glass-effect border border-emerald-500/30 rounded-2xl px-4 py-2 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">Reminders On</span>
          </div>
        </div>
      )}

      {/* Settings Button (always visible if permission granted) */}
      {permission === 'granted' && (
        <button
          onClick={() => setShowPrompt(true)}
          className="fixed bottom-24 lg:bottom-8 right-4 z-40 w-12 h-12 glass-effect border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95"
          title="Notification Settings"
        >
          {isEnabled ? (
            <Bell className="w-5 h-5 text-emerald-400" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
        </button>
      )}
    </>
  );
}
