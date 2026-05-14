import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Key, CheckCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  phone_number: string;
  full_name: string;
}

export function PasswordReset() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, phone_number, full_name')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const resetPassword = async () => {
    if (!selectedUser || !newPassword) {
      alert('Please select a user and enter a new password');
      return;
    }

    if (newPassword.length < 4) {
      alert('Password must be at least 4 characters long');
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ password: newPassword })
        .eq('id', selectedUser);

      if (error) throw error;

      setSuccess(true);
      setNewPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      alert('❌ Error resetting password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white tracking-tight">Password Reset</h2>
        <p className="text-gray-400 text-sm mt-1">Reset any user's password</p>
      </div>

      <div className="glass-effect border border-white/10 rounded-3xl p-6">
        <div className="space-y-6">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Select User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.phone_number})
                </option>
              ))}
            </select>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
            <p className="text-gray-500 text-xs mt-2">Minimum 4 characters</p>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetPassword}
            disabled={loading || !selectedUser || !newPassword}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Key className="w-5 h-5" />
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>

          {/* Success Message */}
          {success && selectedUserData && (
            <div className="glass-effect border border-emerald-500/30 rounded-2xl p-4 bg-emerald-500/5 animate-scale-in">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-emerald-400 font-semibold text-sm">Password Reset Successfully!</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {selectedUserData.full_name}'s password has been updated
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="glass-effect border border-blue-500/30 rounded-2xl p-4 bg-blue-500/5">
            <p className="text-blue-400 text-sm font-medium mb-1">💡 Quick Tip</p>
            <p className="text-gray-400 text-xs">
              The new password will take effect immediately. Users can change their own password after logging in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
