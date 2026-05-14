import { Clock, Users, CheckCircle, XCircle, FileDown } from 'lucide-react';
import { TestLog } from '../lib/supabase';

interface HourlyBreakdownProps {
  logs: TestLog[];
}

export function HourlyBreakdown({ logs }: HourlyBreakdownProps) {
  const downloadCSV = () => {
    const stats = calculateHourlyStats();
    
    if (stats.length === 0) {
      alert('No hourly data available to export');
      return;
    }

    // CSV Headers
    const headers = [
      'Hour',
      'Time',
      'Unique Testers',
      'Total Tests',
      'Passed',
      'Failed',
      'Pass Rate (%)',
      'M-pesa Tests',
      'Safaricom Tests',
      'USSD Tests',
      'STK Tests'
    ];

    // CSV Rows
    const rows = stats.map(stat => [
      stat!.hour,
      stat!.time,
      stat!.uniqueTesters,
      stat!.totalTests,
      stat!.passed,
      stat!.failed,
      stat!.passRate,
      stat!.mpesaTests,
      stat!.safaricomTests,
      stat!.ussdTests,
      stat!.stkTests
    ]);

    // Add summary at the top
    const totalTests = stats.reduce((sum, s) => sum + s!.totalTests, 0);
    const totalPassed = stats.reduce((sum, s) => sum + s!.passed, 0);
    const totalFailed = stats.reduce((sum, s) => sum + s!.failed, 0);
    const overallPassRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

    const csvLines = [
      '=== HOURLY BREAKDOWN REPORT ===',
      `Generated: ${new Date().toLocaleString('en-US')}`,
      '',
      '=== SUMMARY ===',
      `Total Hours with Data,${stats.length}`,
      `Total Tests,${totalTests}`,
      `Total Passed,${totalPassed}`,
      `Total Failed,${totalFailed}`,
      `Overall Pass Rate,${overallPassRate}%`,
      '',
      '=== HOURLY BREAKDOWN ===',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ];

    const csvContent = csvLines.join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Hourly_Breakdown_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate hourly statistics
  const calculateHourlyStats = () => {
    const hourlyMap = new Map<number, {
      uniqueTesters: Set<string>;
      totalTests: number;
      passed: number;
      failed: number;
      mpesaTests: number;
      safaricomTests: number;
      ussdTests: number;
      stkTests: number;
    }>();

    // Process each log
    logs.forEach((log) => {
      const date = new Date(log.created_at || '');
      const hour = date.getHours();
      const phone = log.profiles?.phone_number;

      if (!hourlyMap.has(hour)) {
        hourlyMap.set(hour, {
          uniqueTesters: new Set(),
          totalTests: 0,
          passed: 0,
          failed: 0,
          mpesaTests: 0,
          safaricomTests: 0,
          ussdTests: 0,
          stkTests: 0,
        });
      }

      const hourData = hourlyMap.get(hour)!;
      
      // Add tester phone to unique set
      if (phone) {
        hourData.uniqueTesters.add(phone);
      }
      
      hourData.totalTests++;
      if (log.is_failed) {
        hourData.failed++;
      } else {
        hourData.passed++;
      }

      // Count by category
      if (log.category === 'M-pesa') hourData.mpesaTests++;
      else if (log.category === 'Safaricom') hourData.safaricomTests++;
      else if (log.category === 'USSD') hourData.ussdTests++;
      else if (log.category === 'STK') hourData.stkTests++;
    });

    // Convert to array and calculate pass rates
    const hourlyStats = Array.from({ length: 24 }, (_, hour) => {
      const data = hourlyMap.get(hour);
      if (!data) return null;

      const passRate = data.totalTests > 0 ? Math.round((data.passed / data.totalTests) * 100) : 0;

      return {
        hour,
        time: hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`,
        uniqueTesters: data.uniqueTesters.size,
        totalTests: data.totalTests,
        passed: data.passed,
        failed: data.failed,
        passRate,
        mpesaTests: data.mpesaTests,
        safaricomTests: data.safaricomTests,
        ussdTests: data.ussdTests,
        stkTests: data.stkTests,
      };
    }).filter(Boolean);

    return hourlyStats;
  };

  const hourlyStats = calculateHourlyStats();

  if (hourlyStats.length === 0) {
    return (
      <div className="glass-effect border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
        <div className="mb-6">
          <h4 className="text-white font-semibold flex items-center gap-2 tracking-tight">
            <Clock className="w-5 h-5 text-blue-400" />
            Hourly Breakdown
          </h4>
          <p className="text-gray-500 text-sm mt-2">Detailed test statistics for each hour</p>
        </div>
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No hourly data available for the selected period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h4 className="text-white font-semibold flex items-center gap-2 tracking-tight">
            <Clock className="w-5 h-5 text-blue-400" />
            Hourly Breakdown
          </h4>
          <p className="text-gray-500 text-sm mt-2">Detailed test statistics for each hour of the day</p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-2xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/30"
        >
          <FileDown className="w-4 h-4" />
          <span>Download CSV</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Hour
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Testers</span>
                </div>
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total Tests
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Passed</span>
                </div>
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Failed</span>
                </div>
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Pass Rate
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                M-pesa
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">
                Safaricom
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-teal-400 uppercase tracking-wider">
                USSD
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                STK
              </th>
            </tr>
          </thead>
          <tbody>
            {hourlyStats.map((stat, index) => (
              <tr 
                key={stat!.hour}
                className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                  index % 2 === 0 ? 'bg-white/[0.02]' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-white font-medium">{stat!.time}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                    <span className="text-purple-400 font-semibold">{stat!.uniqueTesters}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-white font-medium">{stat!.totalTests}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-emerald-400 font-semibold">{stat!.passed}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-red-400 font-semibold">{stat!.failed}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-semibold ${
                    stat!.passRate >= 80 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : stat!.passRate >= 60
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {stat!.passRate}%
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-gray-400 font-medium text-sm">{stat!.mpesaTests}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-gray-400 font-medium text-sm">{stat!.safaricomTests}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-gray-400 font-medium text-sm">{stat!.ussdTests}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-gray-400 font-medium text-sm">{stat!.stkTests}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-xs text-gray-500 mb-1 font-medium">Total Hours with Data</p>
          <p className="text-2xl font-semibold text-white tracking-tight">{hourlyStats.length}</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-xs text-gray-500 mb-1 font-medium">Peak Hour</p>
          <p className="text-2xl font-semibold text-white tracking-tight">
            {hourlyStats.reduce((max, stat) => 
              stat!.totalTests > max!.totalTests ? stat : max
            )!.time}
          </p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-xs text-gray-500 mb-1 font-medium">Best Pass Rate</p>
          <p className="text-2xl font-semibold text-emerald-400 tracking-tight">
            {Math.max(...hourlyStats.map(s => s!.passRate))}%
          </p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-xs text-gray-500 mb-1 font-medium">Avg Tests/Hour</p>
          <p className="text-2xl font-semibold text-white tracking-tight">
            {Math.round(hourlyStats.reduce((sum, s) => sum + s!.totalTests, 0) / hourlyStats.length)}
          </p>
        </div>
      </div>
    </div>
  );
}
