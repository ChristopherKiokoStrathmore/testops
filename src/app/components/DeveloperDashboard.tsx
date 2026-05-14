import { useState } from 'react';
import { UserManagement } from './developer/UserManagement';
import { TestLogsManagement } from './developer/TestLogsManagement';
import { SQLQueryInterface } from './developer/SQLQueryInterface';
import { PasswordReset } from './developer/PasswordReset';
import { AdvancedAnalytics } from './developer/AdvancedAnalytics';
import { SupabaseConnectionStatus } from './SupabaseConnectionStatus';
import { authService, type AuthUser } from '../lib/auth';
import { 
  Users, 
  FileText, 
  Database, 
  Key, 
  BarChart3, 
  LogOut,
  Shield,
  User as UserIcon
} from 'lucide-react';

interface DeveloperDashboardProps {
  currentUser: AuthUser;
  onLogout: () => void;
}

type TabType = 'analytics' | 'users' | 'logs' | 'passwords' | 'sql';

export function DeveloperDashboard({ currentUser, onLogout }: DeveloperDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await authService.signOut();
    onLogout();
  };

  const tabs = [
    { id: 'analytics' as TabType, name: 'Analytics', icon: BarChart3, color: 'emerald' },
    { id: 'users' as TabType, name: 'Users', icon: Users, color: 'blue' },
    { id: 'logs' as TabType, name: 'Test Logs', icon: FileText, color: 'purple' },
    { id: 'passwords' as TabType, name: 'Passwords', icon: Key, color: 'orange' },
    { id: 'sql' as TabType, name: 'SQL Query', icon: Database, color: 'red' },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="glass-effect border-b border-white/10 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white tracking-tight">Developer Dashboard</h1>
                <p className="text-sm text-gray-400">Full system access and control</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-2xl transition-all duration-200 border border-white/10 hover:border-white/20"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full flex items-center justify-center border border-purple-500/30">
                  <UserIcon className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-white tracking-tight">{currentUser.full_name}</p>
                  <p className="text-xs text-purple-400">Developer</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 glass-effect rounded-2xl shadow-2xl apple-shadow-lg border border-white/10 py-2 z-50 animate-scale-in">
                  <div className="px-4 py-3 border-b border-white/10 sm:hidden">
                    <p className="text-sm font-semibold text-white">{currentUser.full_name}</p>
                    <p className="text-xs text-purple-400">Developer</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="glass-effect border-b border-white/10 backdrop-blur-xl sticky top-[73px] z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'analytics' && <AdvancedAnalytics />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'logs' && <TestLogsManagement />}
        {activeTab === 'passwords' && <PasswordReset />}
        {activeTab === 'sql' && <SQLQueryInterface />}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 glass-effect border-t border-white/10 backdrop-blur-xl z-40">
        <div className="flex justify-around px-4 py-3">
          {tabs.slice(0, 4).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'text-purple-400 bg-purple-500/10'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Supabase Connection Status */}
      <SupabaseConnectionStatus />
    </div>
  );
}
