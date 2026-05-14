import { useState, useEffect, useRef } from 'react';
import { PassRateChart } from './PassRateChart';
import { TesterPerformanceDashboard } from './TesterPerformanceDashboard';
import { TimeSlotAnalysis } from './TimeSlotAnalysis';
import { HourlyBreakdown } from './HourlyBreakdown';
import { CategoryComparisonDashboard } from './CategoryComparisonDashboard';
import { MasterSheet } from './MasterSheet';
import { DownloadOptions } from './DownloadOptions';
import { DayOnDayAnalytics } from './DayOnDayAnalytics';
import { supabase, TestLog } from '../lib/supabase';
import { Calendar, TrendingUp, CheckCircle, Download, X, Users, Clock, Target } from 'lucide-react';

type DateRange = 'daily' | 'weekly' | 'monthly';

interface CategoryStats {
  passRate: number;
  totalTests: number;
}

interface TesterStats {
  testerName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
}

interface TimeSlotData {
  timeSlot: string;
  totalTests: number;
  passRate: number;
}

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [stats, setStats] = useState<Record<string, CategoryStats>>({
    'M-pesa': { passRate: 0, totalTests: 0 },
    'Safaricom': { passRate: 0, totalTests: 0 },
    'USSD': { passRate: 0, totalTests: 0 },
    'STK': { passRate: 0, totalTests: 0 },
  });
  const [testerStats, setTesterStats] = useState<TesterStats[]>([]);
  const [timeSlotData, setTimeSlotData] = useState<TimeSlotData[]>([]);
  const [allLogs, setAllLogs] = useState<TestLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDateFilter = () => {
    let startDate = new Date(selectedDate);
    let endDate = new Date(selectedDate);

    switch (dateRange) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        startDate = new Date(selectedDate);
        startDate.setDate(selectedDate.getDate() - 7);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'monthly':
        startDate = new Date(selectedDate);
        startDate.setDate(selectedDate.getDate() - 30);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  };

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const { startDate, endDate } = getDateFilter();

      const { data, error } = await supabase
        .from('test_logs')
        .select('*, profiles(full_name, phone_number)')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setAllLogs(data);
        calculateStats(data);
        calculateTesterStats(data);
        calculateTimeSlotStats(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (logs: TestLog[]) => {
    const categories = ['M-pesa', 'Safaricom', 'USSD', 'STK'];
    const newStats: Record<string, CategoryStats> = {};

    categories.forEach((category) => {
      const categoryLogs = logs.filter((log) => log.category === category);
      const totalTests = categoryLogs.length;
      const passedTests = categoryLogs.filter((log) => !log.is_failed).length;

      newStats[category] = {
        passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
        totalTests,
      };
    });

    setStats(newStats);
  };

  const calculateTesterStats = (logs: TestLog[]) => {
    const testerMap = new Map<string, { passed: number; failed: number; total: number }>();

    logs.forEach((log) => {
      const testerName = (log.profiles as any)?.full_name || 'Unknown';
      const existing = testerMap.get(testerName) || { passed: 0, failed: 0, total: 0 };
      
      testerMap.set(testerName, {
        passed: existing.passed + (log.is_failed ? 0 : 1),
        failed: existing.failed + (log.is_failed ? 1 : 0),
        total: existing.total + 1,
      });
    });

    const stats: TesterStats[] = Array.from(testerMap.entries()).map(([name, data]) => ({
      testerName: name,
      totalTests: data.total,
      passedTests: data.passed,
      failedTests: data.failed,
      passRate: data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0,
    }));

    stats.sort((a, b) => b.totalTests - a.totalTests);
    setTesterStats(stats);
  };

  const calculateTimeSlotStats = (logs: TestLog[]) => {
    const timeSlotMap = new Map<string, { passed: number; failed: number; count: number }>();

    logs.forEach((log) => {
      // Calculate time slot from created_at timestamp
      const date = new Date(log.created_at || '');
      const hour = date.getHours();
      
      let slot = 'Morning';
      if (hour >= 6 && hour < 12) slot = 'Morning';
      else if (hour >= 12 && hour < 18) slot = 'Afternoon';
      else if (hour >= 18 && hour < 22) slot = 'Evening';
      else slot = 'Night';
      
      const existing = timeSlotMap.get(slot) || { passed: 0, failed: 0, count: 0 };
      
      timeSlotMap.set(slot, {
        passed: existing.passed + (log.is_failed ? 0 : 1),
        failed: existing.failed + (log.is_failed ? 1 : 0),
        count: existing.count + 1,
      });
    });

    const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'];
    const stats: TimeSlotData[] = timeSlots.map((slot) => {
      const data = timeSlotMap.get(slot) || { passed: 0, failed: 0, count: 0 };
      return {
        timeSlot: slot,
        totalTests: data.count,
        passRate: data.count > 0 ? Math.round((data.passed / data.count) * 100) : 0,
      };
    });

    setTimeSlotData(stats);
  };

  const formatDisplayDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return selectedDate.toLocaleDateString('en-US', options);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const resetToToday = () => {
    setSelectedDate(new Date());
    setShowDatePicker(false);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="glass-effect border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-white tracking-tight">Analytics</h2>
                <p className="text-gray-500 text-sm mt-0.5">Performance insights and metrics</p>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-3">
              {/* Calendar Icon with Date Picker */}
              <div className="relative" ref={datePickerRef}>
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-200"
                  title="Select Date"
                >
                  <Calendar className="w-5 h-5 text-gray-400 hover:text-emerald-400 transition-colors" />
                </button>

                {/* Date Picker Modal */}
                {showDatePicker && (
                  <div className="absolute right-0 mt-2 glass-effect rounded-2xl shadow-2xl apple-shadow-lg border border-white/10 p-6 w-80 z-50 animate-scale-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold tracking-tight">Select Date</h3>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Current Selection */}
                    <div className="mb-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Selected Date</p>
                      <p className="text-white font-medium tracking-tight">{formatDisplayDate()}</p>
                    </div>

                    {/* Date Input */}
                    <div className="mb-4">
                      <label className="block text-sm text-gray-400 mb-2 font-medium">
                        Choose a date:
                      </label>
                      <input
                        type="date"
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(e) => handleDateSelect(new Date(e.target.value))}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full bg-white/5 text-white px-4 py-3 rounded-2xl border border-white/10 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                      />
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={resetToToday}
                        className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => handleDateSelect(new Date(new Date().setDate(new Date().getDate() - 1)))}
                        className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-sm font-medium transition-all duration-200 border border-white/10"
                      >
                        Yesterday
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Range Buttons */}
              <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/10">
                <button
                  onClick={() => setDateRange('daily')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    dateRange === 'daily'
                      ? 'bg-emerald-500 text-white shadow-lg scale-[1.02]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setDateRange('weekly')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    dateRange === 'weekly'
                      ? 'bg-emerald-500 text-white shadow-lg scale-[1.02]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setDateRange('monthly')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    dateRange === 'monthly'
                      ? 'bg-emerald-500 text-white shadow-lg scale-[1.02]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Display Banner - Scrolls with page */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-between bg-white/5 rounded-2xl px-5 py-3 border border-white/10">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-gray-300 font-medium">
              {dateRange === 'daily' && `Showing data for ${formatDisplayDate()}`}
              {dateRange === 'weekly' && `Showing data for 7 days ending ${formatDisplayDate()}`}
              {dateRange === 'monthly' && `Showing data for 30 days ending ${formatDisplayDate()}`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <DownloadOptions 
              logs={allLogs} 
              dateRange={
                dateRange === 'daily' 
                  ? formatDisplayDate() 
                  : dateRange === 'weekly' 
                  ? `7 days ending ${formatDisplayDate()}` 
                  : `30 days ending ${formatDisplayDate()}`
              }
            />
            {selectedDate.toDateString() !== new Date().toDateString() && (
              <button
                onClick={resetToToday}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Reset to Today
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Day-on-Day Analytics - Featured Section */}
            <div>
              <DayOnDayAnalytics />
            </div>

            {/* Pass Rate Chart */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 tracking-tight">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Pass Rate Analysis
              </h3>
              <PassRateChart stats={stats} />
            </div>

            {/* Tester Performance Dashboard */}
            {testerStats.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 tracking-tight">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Tester Performance
                </h3>
                <TesterPerformanceDashboard testerStats={testerStats} />
              </div>
            )}

            {/* Time Slot Analysis */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 tracking-tight">
                <Clock className="w-5 h-5 text-blue-400" />
                Time Slot Analysis
              </h3>
              <TimeSlotAnalysis timeSlotData={timeSlotData} />
            </div>

            {/* Hourly Breakdown Table */}
            <div>
              <HourlyBreakdown logs={allLogs} />
            </div>

            {/* Category Comparison */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 tracking-tight">
                <Target className="w-5 h-5 text-purple-400" />
                Category Comparison
              </h3>
              <CategoryComparisonDashboard stats={stats} />
            </div>

            {/* Master Sheet */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 tracking-tight">
                <Download className="w-5 h-5 text-blue-400" />
                Master Sheet
              </h3>
              <MasterSheet logs={allLogs} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
