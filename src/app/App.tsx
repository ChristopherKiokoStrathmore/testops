import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { DailyTest } from './components/DailyTest';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { DeveloperDashboard } from './components/DeveloperDashboard';
import { SetupGuide } from './components/SetupGuide';
import { ReminderNotifications } from './components/ReminderNotifications';
import { ConnectionIndicator } from './components/ConnectionIndicator';
import { ConnectionRestoredBanner } from './components/ConnectionRestoredBanner';
import { SupabaseConnectionStatus } from './components/SupabaseConnectionStatus';
import { authService, type AuthUser } from './lib/auth';
import { supabase } from './lib/supabase';
import { testSupabaseConnection } from './lib/supabase-test';
import './lib/diagnostics'; // Load full diagnostics suite
import { LayoutDashboard, ClipboardList } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'analytics'>('daily');
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      // Test Supabase connection on startup (non-blocking)
      if (import.meta.env.DEV) {
        console.log('🔄 Running connection test...');
        testSupabaseConnection().catch(err => {
          console.warn('Connection test failed (non-critical):', err);
        });
      }
      
      // Check auth from localStorage
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Setup check error:', error);
      // Don't show setup guide, just allow login
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('daily');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Show setup guide if database not configured
  if (needsSetup) {
    return <SetupGuide />;
  }

  // Show login if not authenticated
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Show Developer Dashboard if user is a developer
  if (currentUser.role === 'developer') {
    return <DeveloperDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  // Show regular tester dashboard
  return (
    <div className="min-h-screen bg-black">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow glass-effect border-r border-white/10 pt-8 pb-4 overflow-y-auto backdrop-blur-xl">
          <div className="flex items-center flex-shrink-0 px-8 mb-10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">TestOps</h1>
                <p className="text-xs text-gray-500 font-medium">Fintech QA Suite</p>
              </div>
            </div>
          </div>
          <nav className="mt-5 flex-1 px-4 space-y-2">
            <button
              onClick={() => setActiveTab('daily')}
              className={`w-full group flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 ${
                activeTab === 'daily'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ClipboardList className="mr-3 flex-shrink-0 h-5 w-5" />
              Daily Test
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full group flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="mr-3 flex-shrink-0 h-5 w-5" />
              Analytics
            </button>
          </nav>

          {/* Footer */}
          <div className="px-4 mt-8">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-gray-500 leading-relaxed">
                Professional testing platform for mobile payment systems and fintech applications.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 glass-effect border-t border-white/10 backdrop-blur-xl z-40">
        <div className="flex items-center justify-around py-3 px-4">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all duration-200 ${
              activeTab === 'daily'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <ClipboardList className="h-6 w-6" />
            <span className="text-xs font-medium">Daily Test</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all duration-200 ${
              activeTab === 'analytics'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-xs font-medium">Analytics</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {activeTab === 'daily' ? (
          <DailyTest currentUser={currentUser} onLogout={handleLogout} />
        ) : (
          <AnalyticsDashboard />
        )}
      </div>

      {/* Reminder Notifications */}
      {activeTab === 'daily' && <ReminderNotifications />}
      
      {/* Connection Status Indicator */}
      <ConnectionIndicator />
      
      {/* Connection Restored Banner */}
      <ConnectionRestoredBanner />
      
      {/* Supabase Connection Status */}
      <SupabaseConnectionStatus />
    </div>
  );
}
