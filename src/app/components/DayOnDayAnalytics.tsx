import { useState, useEffect } from 'react';
import { supabase, TestLog } from '../lib/supabase';
import { TrendingUp, TrendingDown, Minus, Activity, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DayStats {
  date: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
  uniqueTesters: number;
  avgDuration: number;
}

interface CategoryDayStats {
  category: string;
  today: number;
  yesterday: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export function DayOnDayAnalytics() {
  const [todayStats, setTodayStats] = useState<DayStats | null>(null);
  const [yesterdayStats, setYesterdayStats] = useState<DayStats | null>(null);
  const [last7Days, setLast7Days] = useState<DayStats[]>([]);
  const [categoryComparison, setCategoryComparison] = useState<CategoryDayStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDayOnDayData();
  }, []);

  const loadDayOnDayData = async () => {
    setIsLoading(true);
    try {
      // Get today's data
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Get yesterday's data
      const yesterdayStart = new Date();
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date();
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);

      // Get last 7 days data
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Fetch all data
      const { data: todayData } = await supabase
        .from('test_logs')
        .select('*, profiles(full_name)')
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());

      const { data: yesterdayData } = await supabase
        .from('test_logs')
        .select('*, profiles(full_name)')
        .gte('created_at', yesterdayStart.toISOString())
        .lte('created_at', yesterdayEnd.toISOString());

      const { data: last7DaysData } = await supabase
        .from('test_logs')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Calculate stats
      if (todayData) {
        setTodayStats(calculateDayStats(todayData, 'Today'));
      }
      if (yesterdayData) {
        setYesterdayStats(calculateDayStats(yesterdayData, 'Yesterday'));
      }
      if (last7DaysData) {
        const dailyStats = groupByDay(last7DaysData);
        setLast7Days(dailyStats);
      }
      if (todayData && yesterdayData) {
        setCategoryComparison(calculateCategoryComparison(todayData, yesterdayData));
      }
    } catch (error) {
      console.error('Error loading day-on-day data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDayStats = (logs: TestLog[], label: string): DayStats => {
    const totalTests = logs.length;
    const passedTests = logs.filter(log => !log.is_failed).length;
    const failedTests = logs.filter(log => log.is_failed).length;
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    const uniqueTesters = new Set(logs.map(log => log.tester_id)).size;
    const totalDuration = logs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0);
    const avgDuration = totalTests > 0 ? Math.round(totalDuration / totalTests) : 0;

    return {
      date: label,
      totalTests,
      passedTests,
      failedTests,
      passRate,
      uniqueTesters,
      avgDuration,
    };
  };

  const groupByDay = (logs: TestLog[]): DayStats[] => {
    const dayMap = new Map<string, TestLog[]>();

    logs.forEach(log => {
      const date = new Date(log.created_at || '');
      const dateKey = date.toISOString().split('T')[0];
      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, []);
      }
      dayMap.get(dateKey)!.push(log);
    });

    const stats: DayStats[] = [];
    dayMap.forEach((dayLogs, dateKey) => {
      const date = new Date(dateKey);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      stats.push(calculateDayStats(dayLogs, formattedDate));
    });

    return stats.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const calculateCategoryComparison = (todayLogs: TestLog[], yesterdayLogs: TestLog[]): CategoryDayStats[] => {
    const categories = ['M-pesa', 'Safaricom', 'USSD', 'STK'];
    
    return categories.map(category => {
      const todayTests = todayLogs.filter(log => log.category === category);
      const yesterdayTests = yesterdayLogs.filter(log => log.category === category);

      const todayPassRate = todayTests.length > 0 
        ? Math.round((todayTests.filter(log => !log.is_failed).length / todayTests.length) * 100)
        : 0;

      const yesterdayPassRate = yesterdayTests.length > 0
        ? Math.round((yesterdayTests.filter(log => !log.is_failed).length / yesterdayTests.length) * 100)
        : 0;

      const change = todayPassRate - yesterdayPassRate;
      let trend: 'up' | 'down' | 'neutral' = 'neutral';
      if (change > 0) trend = 'up';
      else if (change < 0) trend = 'down';

      return {
        category,
        today: todayPassRate,
        yesterday: yesterdayPassRate,
        change,
        trend,
      };
    });
  };

  const calculateChange = (today: number, yesterday: number): { value: number; percentage: number } => {
    const value = today - yesterday;
    const percentage = yesterday > 0 ? Math.round((value / yesterday) * 100) : (today > 0 ? 100 : 0);
    return { value, percentage };
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-5 h-5 text-emerald-400" />;
    if (change < 0) return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getTrendColor = (change: number, isGood: boolean = true) => {
    if (change === 0) return 'text-gray-400';
    if (isGood) {
      return change > 0 ? 'text-emerald-400' : 'text-red-400';
    } else {
      return change > 0 ? 'text-red-400' : 'text-emerald-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!todayStats || !yesterdayStats) {
    return (
      <div className="glass-effect rounded-3xl p-8 border border-white/10">
        <p className="text-gray-400 text-center">Insufficient data for day-on-day comparison</p>
      </div>
    );
  }

  const totalTestsChange = calculateChange(todayStats.totalTests, yesterdayStats.totalTests);
  const passRateChange = calculateChange(todayStats.passRate, yesterdayStats.passRate);
  const testersChange = calculateChange(todayStats.uniqueTesters, yesterdayStats.uniqueTesters);
  const durationChange = calculateChange(todayStats.avgDuration, yesterdayStats.avgDuration);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white tracking-tight">Day-on-Day Analytics</h3>
            <p className="text-sm text-gray-400 mt-0.5">Comparing Today vs Yesterday</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tests */}
        <div className="glass-effect rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group hover:scale-[1.02]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            {getTrendIcon(totalTestsChange.value)}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-400 font-medium">Total Tests</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white tracking-tight">{todayStats.totalTests}</p>
              <span className="text-sm text-gray-500">today</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`font-semibold ${getTrendColor(totalTestsChange.value)}`}>
                {totalTestsChange.value > 0 ? '+' : ''}{totalTestsChange.value}
              </span>
              <span className="text-gray-500">vs yesterday ({yesterdayStats.totalTests})</span>
            </div>
            {totalTestsChange.percentage !== 0 && (
              <div className={`text-xs font-medium ${getTrendColor(totalTestsChange.value)}`}>
                {totalTestsChange.percentage > 0 ? '+' : ''}{totalTestsChange.percentage}% change
              </div>
            )}
          </div>
        </div>

        {/* Pass Rate */}
        <div className="glass-effect rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group hover:scale-[1.02]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            {getTrendIcon(passRateChange.value)}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-400 font-medium">Pass Rate</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white tracking-tight">{todayStats.passRate}%</p>
              <span className="text-sm text-gray-500">today</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`font-semibold ${getTrendColor(passRateChange.value)}`}>
                {passRateChange.value > 0 ? '+' : ''}{passRateChange.value}%
              </span>
              <span className="text-gray-500">vs yesterday ({yesterdayStats.passRate}%)</span>
            </div>
            <div className="flex gap-3 text-xs mt-3 pt-3 border-t border-white/10">
              <div>
                <span className="text-gray-500">Passed: </span>
                <span className="text-emerald-400 font-semibold">{todayStats.passedTests}</span>
              </div>
              <div>
                <span className="text-gray-500">Failed: </span>
                <span className="text-red-400 font-semibold">{todayStats.failedTests}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Testers */}
        <div className="glass-effect rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group hover:scale-[1.02]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            {getTrendIcon(testersChange.value)}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-400 font-medium">Active Testers</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white tracking-tight">{todayStats.uniqueTesters}</p>
              <span className="text-sm text-gray-500">today</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`font-semibold ${getTrendColor(testersChange.value)}`}>
                {testersChange.value > 0 ? '+' : ''}{testersChange.value}
              </span>
              <span className="text-gray-500">vs yesterday ({yesterdayStats.uniqueTesters})</span>
            </div>
            {testersChange.percentage !== 0 && (
              <div className={`text-xs font-medium ${getTrendColor(testersChange.value)}`}>
                {testersChange.percentage > 0 ? '+' : ''}{testersChange.percentage}% change
              </div>
            )}
          </div>
        </div>

        {/* Avg Duration */}
        <div className="glass-effect rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group hover:scale-[1.02]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            {getTrendIcon(-durationChange.value)} {/* Inverted: lower is better */}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-400 font-medium">Avg Duration</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white tracking-tight">{todayStats.avgDuration}s</p>
              <span className="text-sm text-gray-500">today</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`font-semibold ${getTrendColor(durationChange.value, false)}`}>
                {durationChange.value > 0 ? '+' : ''}{durationChange.value}s
              </span>
              <span className="text-gray-500">vs yesterday ({yesterdayStats.avgDuration}s)</span>
            </div>
            {durationChange.percentage !== 0 && (
              <div className={`text-xs font-medium ${getTrendColor(durationChange.value, false)}`}>
                {Math.abs(durationChange.percentage)}% {durationChange.value > 0 ? 'slower' : 'faster'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Comparison */}
      <div className="glass-effect rounded-3xl p-8 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-6 tracking-tight">Category Performance: Today vs Yesterday</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryComparison.map((cat) => (
            <div key={cat.category} className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-white font-medium">{cat.category}</h5>
                {cat.trend === 'up' && <TrendingUp className="w-5 h-5 text-emerald-400" />}
                {cat.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-400" />}
                {cat.trend === 'neutral' && <Minus className="w-5 h-5 text-gray-400" />}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Today</span>
                  <span className="text-2xl font-bold text-white">{cat.today}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Yesterday</span>
                  <span className="text-lg font-semibold text-gray-500">{cat.yesterday}%</span>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className={`text-center text-sm font-semibold ${getTrendColor(cat.change)}`}>
                    {cat.change > 0 ? '+' : ''}{cat.change}% change
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      {last7Days.length > 1 && (
        <div className="glass-effect rounded-3xl p-8 border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-6 tracking-tight">7-Day Trend Analysis</h4>
          
          {/* Pass Rate Trend */}
          <div className="mb-8">
            <p className="text-sm text-gray-400 mb-4 font-medium">Pass Rate Trend (%)</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  style={{ fontSize: '12px' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="passRate" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  name="Pass Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Test Volume Trend */}
          <div>
            <p className="text-sm text-gray-400 mb-4 font-medium">Test Volume Trend</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }}
                />
                <Bar dataKey="passedTests" fill="#10b981" name="Passed" radius={[8, 8, 0, 0]} />
                <Bar dataKey="failedTests" fill="#ef4444" name="Failed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Insights */}
      <div className="glass-effect rounded-3xl p-8 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-6 tracking-tight flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          Quick Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Insight 1 */}
          {passRateChange.value > 5 && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium mb-1">Strong Improvement</p>
                  <p className="text-sm text-gray-300">
                    Pass rate increased by {passRateChange.value}% compared to yesterday. Great work!
                  </p>
                </div>
              </div>
            </div>
          )}

          {passRateChange.value < -5 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <TrendingDown className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium mb-1">Needs Attention</p>
                  <p className="text-sm text-gray-300">
                    Pass rate decreased by {Math.abs(passRateChange.value)}% compared to yesterday.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Insight 2 */}
          {totalTestsChange.value > 10 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium mb-1">Increased Activity</p>
                  <p className="text-sm text-gray-300">
                    {totalTestsChange.value} more tests completed today than yesterday.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Insight 3 */}
          {durationChange.value < -10 && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium mb-1">Faster Testing</p>
                  <p className="text-sm text-gray-300">
                    Average test duration improved by {Math.abs(durationChange.value)} seconds.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Best Category */}
          {categoryComparison.length > 0 && (() => {
            const bestCategory = categoryComparison.reduce((best, current) => 
              current.today > best.today ? current : best
            );
            return bestCategory.today > 80 && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium mb-1">Top Performer</p>
                    <p className="text-sm text-gray-300">
                      {bestCategory.category} has the highest pass rate today at {bestCategory.today}%.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
