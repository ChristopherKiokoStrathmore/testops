import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus, Trash2, Shield, User, Phone, Key, CheckCircle, XCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  phone_number: string;
  full_name: string;
  role: string;
  created_at: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    phone: '',
    name: '',
    password: '1234',
    role: 'tester'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async () => {
    if (!newUser.phone || !newUser.name) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Format phone number
      let formattedPhone = newUser.phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+254' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+254' + formattedPhone;
      }

      const { error } = await supabase
        .from('profiles')
        .insert({
          phone_number: formattedPhone,
          full_name: newUser.name,
          password: newUser.password,
          role: newUser.role
        });

      if (error) throw error;

      alert('✅ User added successfully!');
      setShowAddUser(false);
      setNewUser({ phone: '', name: '', password: '1234', role: 'tester' });
      loadUsers();
    } catch (error: any) {
      alert('❌ Error adding user: ' + error.message);
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      alert('✅ User deleted successfully!');
      loadUsers();
    } catch (error: any) {
      alert('❌ Error deleting user: ' + error.message);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'developer' ? 'tester' : 'developer';
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      alert(`✅ User role updated to ${newRole}!`);
      loadUsers();
    } catch (error: any) {
      alert('❌ Error updating role: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">User Management</h2>
          <p className="text-gray-400 text-sm mt-1">Manage all testers and developers</p>
        </div>
        <button
          onClick={() => setShowAddUser(!showAddUser)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-2xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Add User Form */}
      {showAddUser && (
        <div className="glass-effect border border-white/10 rounded-3xl p-6 animate-scale-in">
          <h3 className="text-lg font-semibold text-white mb-4 tracking-tight">Add New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
              <input
                type="text"
                placeholder="0712345678"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input
                type="text"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
              >
                <option value="tester">Tester</option>
                <option value="developer">Developer</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={addUser}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-2xl font-medium transition-all duration-200"
            >
              Add User
            </button>
            <button
              onClick={() => setShowAddUser(false)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-2xl font-medium transition-all duration-200 border border-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="glass-effect border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">User</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Phone</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Role</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Created</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        user.role === 'developer' 
                          ? 'bg-purple-500/20 border border-purple-500/30' 
                          : 'bg-emerald-500/20 border border-emerald-500/30'
                      }`}>
                        {user.role === 'developer' ? (
                          <Shield className="w-5 h-5 text-purple-400" />
                        ) : (
                          <User className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <span className="text-white font-medium">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{user.phone_number}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleRole(user.id, user.role)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105 ${
                        user.role === 'developer'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {user.role}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => deleteUser(user.id, user.full_name)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm">
        Total Users: {users.length}
      </div>
    </div>
  );
}
