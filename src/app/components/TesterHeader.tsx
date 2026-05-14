import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Key } from 'lucide-react';
import { authService, type AuthUser } from '../lib/auth';
import { ChangePasswordModal } from './ChangePasswordModal';

interface TesterHeaderProps {
  user: AuthUser;
  onSignOut: () => void;
}

export function TesterHeader({ user, onSignOut }: TesterHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Safety check - if user is not loaded yet, don't render
  if (!user) {
    return null;
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    onSignOut();
  };

  return (
    <>
      <div className="glass-effect border-b border-white/10 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Current User Info */}
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Logged in as</p>
                <p className="text-sm font-semibold text-white tracking-tight">
                  {user.full_name}
                </p>
              </div>
            </div>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-2xl transition-all duration-200 border border-white/10 hover:border-white/20"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                  <User className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-white tracking-tight">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.phone}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-60 glass-effect rounded-2xl shadow-2xl apple-shadow-lg border border-white/10 py-2 z-50 animate-scale-in">
                  {/* User Info (mobile) */}
                  <div className="px-4 py-3 border-b border-white/10 sm:hidden">
                    <p className="text-sm font-semibold text-white">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.phone}</p>
                  </div>

                  {/* Change Password */}
                  <button
                    onClick={() => {
                      setShowChangePassword(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center">
                      <Key className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Change Password</span>
                  </button>

                  {/* Sign Out */}
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
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal
          userId={user.id}
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </>
  );
}
