import { useState, useRef, useEffect } from 'react';
import { FileDown, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { TestLog } from '../lib/supabase';
import { PDFReport } from './PDFReport';

interface DownloadOptionsProps {
  logs: TestLog[];
  dateRange: string;
}

export function DownloadOptions({ logs, dateRange }: DownloadOptionsProps) {
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

  const generateCSV = () => {
    if (logs.length === 0) {
      alert('No data available to export');
      return;
    }

    // CSV Headers
    const headers = [
      'Date',
      'Time',
      'Tester Name',
      'Tester Phone',
      'Category',
      'Result',
      'Airtel Money Message',
      'Duration (sec)',
    ];

    // CSV Rows
    const rows = logs.map(log => {
      const date = new Date(log.created_at || '');
      const dateStr = date.toLocaleDateString('en-US');
      const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const testerName = log.profiles?.full_name || 'Unknown';
      const testerPhone = log.profiles?.phone_number || 'Unknown';
      const result = log.is_failed ? 'FAIL' : 'PASS';
      const transactionId = log.transaction_id || 'N/A';

      return [
        dateStr,
        timeStr,
        testerName,
        testerPhone,
        log.category,
        result,
        transactionId,
        log.duration_sec || 0,
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `FinTech_Testing_Data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsOpen(false);
  };

  const generateDetailedCSV = () => {
    if (logs.length === 0) {
      alert('No data available to export');
      return;
    }

    // Calculate summary statistics
    const totalTests = logs.length;
    const passedTests = logs.filter(log => !log.is_failed).length;
    const failedTests = logs.filter(log => log.is_failed).length;
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    const uniqueTesters = new Set(logs.map(log => log.profiles?.phone_number).filter(Boolean)).size;

    // Category breakdown
    const categories = ['M-pesa', 'Safaricom', 'USSD', 'STK'];
    const categoryStats = categories.map(cat => {
      const categoryLogs = logs.filter(log => log.category === cat);
      const total = categoryLogs.length;
      const passed = categoryLogs.filter(log => !log.is_failed).length;
      const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
      return { category: cat, total, passed, failed: total - passed, passRate };
    });

    // Build CSV content with summary section
    const csvLines = [
      '=== FINTECH TESTING MANAGEMENT REPORT ===',
      `Report Period: ${dateRange}`,
      `Generated: ${new Date().toLocaleString('en-US')}`,
      '',
      '=== EXECUTIVE SUMMARY ===',
      `Total Tests,${totalTests}`,
      `Passed Tests,${passedTests}`,
      `Failed Tests,${failedTests}`,
      `Overall Pass Rate,${passRate}%`,
      `Unique Testers,${uniqueTesters}`,
      '',
      '=== CATEGORY BREAKDOWN ===',
      'Category,Total Tests,Passed,Failed,Pass Rate',
      ...categoryStats.map(stat => 
        `${stat.category},${stat.total},${stat.passed},${stat.failed},${stat.passRate}%`
      ),
      '',
      '=== DETAILED TEST LOGS ===',
      'Date,Time,Hour,Tester Name,Tester Phone,Category,Result,Airtel Money Message,Duration (sec)',
      ...logs.map(log => {
        const date = new Date(log.created_at || '');
        const dateStr = date.toLocaleDateString('en-US');
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const hour = date.getHours();
        const testerName = log.profiles?.full_name || 'Unknown';
        const testerPhone = log.profiles?.phone_number || 'Unknown';
        const result = log.is_failed ? 'FAIL' : 'PASS';
        const transactionId = log.transaction_id || 'N/A';

        return `"${dateStr}","${timeStr}",${hour},"${testerName}","${testerPhone}","${log.category}","${result}","${transactionId}",${log.duration_sec || 0}`;
      })
    ];

    const csvContent = csvLines.join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `FinTech_Testing_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-teal-700 text-white rounded-2xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 border border-emerald-400/20"
      >
        <FileDown className="w-5 h-5" />
        <span>Download Report</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 glass-effect rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-scale-in">
          {/* PDF Option */}
          <div className="p-2">
            <PDFReport logs={logs} dateRange={dateRange} />
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-1" />

          {/* CSV Options */}
          <div className="p-2 space-y-2">
            <button
              onClick={generateDetailedCSV}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all duration-200 text-left group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm mb-0.5">Detailed CSV Report</h4>
                <p className="text-gray-400 text-xs">Summary stats + all test logs</p>
              </div>
            </button>

            <button
              onClick={generateCSV}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all duration-200 text-left group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm mb-0.5">Simple CSV Export</h4>
                <p className="text-gray-400 text-xs">Raw test logs data only</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
