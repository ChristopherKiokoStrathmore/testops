import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, Users, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DownloadReportOptions } from './DownloadReportOptions';

export function AdvancedAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [testerPerformance, setTesterPerformance] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Overall Stats
      const { data: logs } = await supabase
        .from('test_logs')
        .select('*');

      const totalTests = logs?.length || 0;
      const failedTests = logs?.filter(l => l.is_failed).length || 0;
      const avgDuration = logs?.reduce((sum, l) => sum + l.duration_sec, 0) / (totalTests || 1);

      setStats({
        totalTests,
        failedTests,
        successRate: ((totalTests - failedTests) / (totalTests || 1) * 100).toFixed(1),
        avgDuration: avgDuration.toFixed(1)
      });

      // Tester Performance
      const { data: testerData } = await supabase
        .from('test_logs')
        .select(`
          tester_id,
          is_failed,
          duration_sec,
          profiles!tester_id (full_name)
        `);

      const testerMap = new Map();
      testerData?.forEach((log: any) => {
        const name = log.profiles?.full_name || 'Unknown';
        if (!testerMap.has(name)) {
          testerMap.set(name, { name, total: 0, failed: 0, avgDuration: 0, totalDuration: 0 });
        }
        const tester = testerMap.get(name);
        tester.total += 1;
        if (log.is_failed) tester.failed += 1;
        tester.totalDuration += log.duration_sec;
      });

      const testerPerf = Array.from(testerMap.values()).map(t => ({
        ...t,
        avgDuration: (t.totalDuration / t.total).toFixed(1),
        successRate: ((t.total - t.failed) / t.total * 100).toFixed(1)
      }));
      setTesterPerformance(testerPerf);

      // Category Breakdown
      const categoryMap = new Map();
      logs?.forEach(log => {
        if (!categoryMap.has(log.category)) {
          categoryMap.set(log.category, { category: log.category, total: 0, failed: 0 });
        }
        const cat = categoryMap.get(log.category);
        cat.total += 1;
        if (log.is_failed) cat.failed += 1;
      });
      setCategoryBreakdown(Array.from(categoryMap.values()));

      // Time Series (Last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const timeSeriesMap = new Map(last7Days.map(d => [d, { date: d, tests: 0, failures: 0 }]));
      logs?.forEach(log => {
        const date = log.created_at.split('T')[0];
        if (timeSeriesMap.has(date)) {
          const day = timeSeriesMap.get(date);
          day.tests += 1;
          if (log.is_failed) day.failures += 1;
        }
      });
      setTimeSeriesData(Array.from(timeSeriesMap.values()));

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b'];



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
          <h2 className="text-2xl font-semibold text-white tracking-tight">Advanced Analytics</h2>
          <p className="text-gray-400 text-sm mt-1">Deep dive into all testing data</p>
        </div>
        <DownloadReportOptions
          stats={stats}
          testerPerformance={testerPerformance}
          categoryBreakdown={categoryBreakdown}
          timeSeriesData={timeSeriesData}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-effect border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Tests</p>
          <p className="text-3xl font-semibold text-white tracking-tight">{stats.totalTests}</p>
        </div>

        <div className="glass-effect border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Success Rate</p>
          <p className="text-3xl font-semibold text-white tracking-tight">{stats.successRate}%</p>
        </div>

        <div className="glass-effect border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Failed Tests</p>
          <p className="text-3xl font-semibold text-white tracking-tight">{stats.failedTests}</p>
        </div>

        <div className="glass-effect border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Avg Duration</p>
          <p className="text-3xl font-semibold text-white tracking-tight">{stats.avgDuration}s</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tester Performance */}
        <div className="glass-effect border border-white/10 rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 tracking-tight">Tester Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={testerPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }}
                labelStyle={{ color: '#fff', fontWeight: '600' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="total" fill="#10b981" name="Total Tests" />
              <Bar dataKey="failed" fill="#ef4444" name="Failed Tests" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="glass-effect border border-white/10 rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 tracking-tight">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }}
                labelStyle={{ color: '#fff', fontWeight: '600' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time Series Chart */}
      <div className="glass-effect border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 tracking-tight">Test Trends (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }}
              labelStyle={{ color: '#fff', fontWeight: '600' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="tests" stroke="#10b981" strokeWidth={2} name="Total Tests" />
            <Line type="monotone" dataKey="failures" stroke="#ef4444" strokeWidth={2} name="Failures" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Tester Stats Table */}
      <div className="glass-effect border border-white/10 rounded-3xl overflow-hidden">
        <div className="bg-white/5 border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold text-white tracking-tight">Detailed Tester Statistics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Tester</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Total Tests</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Failed</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Success Rate</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Avg Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {testerPerformance.map((tester, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{tester.name}</td>
                  <td className="px-6 py-4 text-gray-400">{tester.total}</td>
                  <td className="px-6 py-4 text-red-400">{tester.failed}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                      parseFloat(tester.successRate) >= 90 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : parseFloat(tester.successRate) >= 70
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {tester.successRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{tester.avgDuration}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
