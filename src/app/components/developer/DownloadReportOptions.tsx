import { useState, useRef, useEffect } from 'react';
import { Download, FileJson, FileSpreadsheet, ChevronDown } from 'lucide-react';

interface DownloadReportOptionsProps {
  stats: any;
  testerPerformance: any[];
  categoryBreakdown: any[];
  timeSeriesData: any[];
}

export function DownloadReportOptions({ 
  stats, 
  testerPerformance, 
  categoryBreakdown, 
  timeSeriesData 
}: DownloadReportOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportJSON = () => {
    const report = {
      generated_at: new Date().toISOString(),
      overall_stats: stats,
      tester_performance: testerPerformance,
      category_breakdown: categoryBreakdown,
      time_series: timeSeriesData
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_report_${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const exportCSV = () => {
    const csvLines = [
      '=== ADVANCED ANALYTICS REPORT ===',
      `Generated: ${new Date().toLocaleString('en-US')}`,
      '',
      '=== OVERALL STATISTICS ===',
      `Total Tests,${stats.totalTests}`,
      `Failed Tests,${stats.failedTests}`,
      `Success Rate,${stats.successRate}%`,
      `Average Duration,${stats.avgDuration} seconds`,
      '',
      '=== TESTER PERFORMANCE ===',
      'Tester Name,Total Tests,Failed Tests,Success Rate (%),Avg Duration (sec)',
      ...testerPerformance.map(t => 
        `"${t.name}",${t.total},${t.failed},${t.successRate},${t.avgDuration}`
      ),
      '',
      '=== CATEGORY BREAKDOWN ===',
      'Category,Total Tests,Failed Tests,Success Rate (%)',
      ...categoryBreakdown.map(c => {
        const successRate = ((c.total - c.failed) / c.total * 100).toFixed(1);
        return `${c.category},${c.total},${c.failed},${successRate}`;
      }),
      '',
      '=== TIME SERIES (LAST 7 DAYS) ===',
      'Date,Total Tests,Failures,Success Rate (%)',
      ...timeSeriesData.map(d => {
        const successRate = d.tests > 0 ? (((d.tests - d.failures) / d.tests) * 100).toFixed(1) : '0';
        return `${d.date},${d.tests},${d.failures},${successRate}`;
      })
    ];

    const csvContent = csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_report_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const exportDetailedCSV = () => {
    // This would be for detailed tester performance with all metrics
    const csvLines = [
      '=== DETAILED TESTER PERFORMANCE REPORT ===',
      `Generated: ${new Date().toLocaleString('en-US')}`,
      '',
      'Tester Name,Total Tests,Passed Tests,Failed Tests,Success Rate (%),Total Duration (sec),Avg Duration (sec)',
      ...testerPerformance.map(t => 
        `"${t.name}",${t.total},${t.total - t.failed},${t.failed},${t.successRate},${t.totalDuration},${t.avgDuration}`
      )
    ];

    const csvContent = csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tester_performance_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-2xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <Download className="w-5 h-5" />
        <span>Export Report</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 glass-effect rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-scale-in">
          <div className="p-2 space-y-2">
            {/* CSV Summary */}
            <button
              onClick={exportCSV}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all duration-200 text-left group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm mb-0.5">CSV Summary Report</h4>
                <p className="text-gray-400 text-xs">All analytics in CSV format</p>
              </div>
            </button>

            {/* Detailed CSV */}
            <button
              onClick={exportDetailedCSV}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all duration-200 text-left group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm mb-0.5">Detailed Tester CSV</h4>
                <p className="text-gray-400 text-xs">Tester performance breakdown</p>
              </div>
            </button>

            {/* Divider */}
            <div className="border-t border-white/10 my-1" />

            {/* JSON Export */}
            <button
              onClick={exportJSON}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all duration-200 text-left group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all">
                <FileJson className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm mb-0.5">JSON Export</h4>
                <p className="text-gray-400 text-xs">Structured data for developers</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
