import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit2, Save, X, Search, Filter, Plus, Calendar, Clock } from 'lucide-react';

interface TestLog {
  id: string;
  tester_id: string;
  category: string;
  duration_sec: number;
  is_failed: boolean;
  created_at: string;
  tester_name?: string;
  transaction_id?: string;
  failed_with_prompt?: boolean;
}

interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
}

export function TestLogsManagement() {
  const [logs, setLogs] = useState<TestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TestLog>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  // Manual log form state
  const [manualLogForm, setManualLogForm] = useState({
    tester_id: '',
    category: 'M-pesa',
    is_failed: false,
    transaction_id: '',
    failed_with_prompt: false,
    duration_seconds: 30,
    test_date: new Date().toISOString().split('T')[0],
    test_time: new Date().toTimeString().slice(0, 5),
  });

  useEffect(() => {
    loadLogs();
    loadProfiles();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_logs')
        .select(`
          *,
          profiles!tester_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      const formattedLogs = data?.map(log => ({
        ...log,
        tester_name: log.profiles?.full_name || 'Unknown'
      })) || [];

      setLogs(formattedLogs);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number')
        .eq('role', 'tester')
        .order('full_name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const deleteLog = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this test log?')) return;

    try {
      const { error } = await supabase
        .from('test_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      alert('✅ Log deleted successfully!');
      loadLogs();
    } catch (error: any) {
      alert('❌ Error deleting log: ' + error.message);
    }
  };

  const startEdit = (log: TestLog) => {
    setEditingId(log.id);
    setEditForm({
      category: log.category,
      duration_sec: log.duration_sec,
      is_failed: log.is_failed
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('test_logs')
        .update({
          category: editForm.category,
          duration_sec: editForm.duration_sec,
          is_failed: editForm.is_failed
        })
        .eq('id', logId);

      if (error) throw error;

      alert('✅ Log updated successfully!');
      setEditingId(null);
      setEditForm({});
      loadLogs();
    } catch (error: any) {
      alert('❌ Error updating log: ' + error.message);
    }
  };

  const addManualLog = async () => {
    if (!manualLogForm.tester_id) {
      alert('⚠️ Please select a tester');
      return;
    }

    if (!manualLogForm.is_failed && !manualLogForm.transaction_id.trim()) {
      alert('⚠️ Please enter Airtel Money Message for passed tests');
      return;
    }

    try {
      // Combine date and time to create ISO timestamp
      const dateTimeString = `${manualLogForm.test_date}T${manualLogForm.test_time}:00`;
      const timestamp = new Date(dateTimeString).toISOString();

      const logData = {
        tester_id: manualLogForm.tester_id,
        category: manualLogForm.category,
        is_failed: manualLogForm.is_failed,
        duration_seconds: manualLogForm.duration_seconds,
        created_at: timestamp,
        transaction_id: manualLogForm.is_failed ? null : manualLogForm.transaction_id,
        failed_with_prompt: manualLogForm.is_failed ? manualLogForm.failed_with_prompt : null,
      };

      const { error } = await supabase
        .from('test_logs')
        .insert([logData]);

      if (error) throw error;

      alert('✅ Manual log added successfully!');
      
      // Reset form
      setManualLogForm({
        tester_id: '',
        category: 'M-pesa',
        is_failed: false,
        transaction_id: '',
        failed_with_prompt: false,
        duration_seconds: 30,
        test_date: new Date().toISOString().split('T')[0],
        test_time: new Date().toTimeString().slice(0, 5),
      });
      
      setShowAddModal(false);
      loadLogs();
    } catch (error: any) {
      alert('❌ Error adding log: ' + error.message);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.tester_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
          <h2 className="text-2xl font-semibold text-white tracking-tight">Test Logs Management</h2>
          <p className="text-gray-400 text-sm mt-1">View, edit, delete, and manually add test logs</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Manual Log
        </button>
      </div>

      {/* Filters */}
      <div className="glass-effect border border-white/10 rounded-3xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by tester or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Category Filter</label>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all appearance-none"
              >
                <option value="all">All Categories</option>
                <option value="M-pesa">M-pesa</option>
                <option value="Safaricom">Safaricom</option>
                <option value="USSD">USSD</option>
                <option value="STK">STK</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-effect border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Tester</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Category</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Duration</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Date</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{log.tester_name}</td>
                  <td className="px-6 py-4">
                    {editingId === log.id ? (
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="M-pesa">M-pesa</option>
                        <option value="Safaricom">Safaricom</option>
                        <option value="USSD">USSD</option>
                        <option value="STK">STK</option>
                      </select>
                    ) : (
                      <span className="text-gray-400">{log.category}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === log.id ? (
                      <input
                        type="number"
                        value={editForm.duration_sec}
                        onChange={(e) => setEditForm({ ...editForm, duration_sec: parseInt(e.target.value) })}
                        className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    ) : (
                      <span className="text-gray-400">{log.duration_sec}s</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === log.id ? (
                      <select
                        value={editForm.is_failed ? 'failed' : 'passed'}
                        onChange={(e) => setEditForm({ ...editForm, is_failed: e.target.value === 'failed' })}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                        log.is_failed 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {log.is_failed ? 'Failed' : 'Passed'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === log.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(log.id)}
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(log)}
                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteLog(log.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm">
        Showing {filteredLogs.length} of {logs.length} logs
      </div>

      {/* Add Manual Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-effect border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Modal Header */}
            <div className="sticky top-0 glass-effect border-b border-white/10 px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white tracking-tight">Add Manual Test Log</h3>
                <p className="text-sm text-gray-400 mt-1">Add backdated test logs for downtime recovery</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              {/* Tester Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Select Tester <span className="text-red-400">*</span>
                </label>
                <select
                  value={manualLogForm.tester_id}
                  onChange={(e) => setManualLogForm({ ...manualLogForm, tester_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-all"
                >
                  <option value="">Choose a tester...</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.full_name} ({profile.phone_number})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={manualLogForm.category}
                  onChange={(e) => setManualLogForm({ ...manualLogForm, category: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-all"
                >
                  <option value="M-pesa">M-pesa</option>
                  <option value="Safaricom">Safaricom</option>
                  <option value="USSD">USSD</option>
                  <option value="STK">STK</option>
                </select>
              </div>

              {/* Test Result */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Test Result <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setManualLogForm({ ...manualLogForm, is_failed: false })}
                    className={`px-6 py-4 rounded-2xl font-medium transition-all duration-200 ${
                      !manualLogForm.is_failed
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    ✅ Pass
                  </button>
                  <button
                    onClick={() => setManualLogForm({ ...manualLogForm, is_failed: true })}
                    className={`px-6 py-4 rounded-2xl font-medium transition-all duration-200 ${
                      manualLogForm.is_failed
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    ❌ Fail
                  </button>
                </div>
              </div>

              {/* Airtel Money Message (for Pass) */}
              {!manualLogForm.is_failed && (
                <div className="animate-scale-in">
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Airtel Money Message <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualLogForm.transaction_id}
                    onChange={(e) => setManualLogForm({ ...manualLogForm, transaction_id: e.target.value })}
                    placeholder="Enter Airtel money message (required)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              )}

              {/* Failed with Prompt (for Fail) */}
              {manualLogForm.is_failed && (
                <div className="animate-scale-in">
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Failed with Prompt?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setManualLogForm({ ...manualLogForm, failed_with_prompt: true })}
                      className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
                        manualLogForm.failed_with_prompt
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setManualLogForm({ ...manualLogForm, failed_with_prompt: false })}
                      className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
                        !manualLogForm.failed_with_prompt
                          ? 'bg-gray-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Test Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={manualLogForm.test_date}
                    onChange={(e) => setManualLogForm({ ...manualLogForm, test_date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Test Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={manualLogForm.test_time}
                    onChange={(e) => setManualLogForm({ ...manualLogForm, test_time: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={manualLogForm.duration_seconds}
                  onChange={(e) => setManualLogForm({ ...manualLogForm, duration_seconds: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={addManualLog}
                  className="flex-1 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/30"
                >
                  Add Log
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 text-gray-400 rounded-2xl font-medium transition-all duration-200 border border-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
