import { useState, useEffect } from 'react';
import { TestLog, supabase } from '../lib/supabase';
import { Download } from 'lucide-react';

interface MasterSheetProps {
  logs: TestLog[];
}

interface EnrichedLog extends TestLog {
  tester_name?: string;
}

export function MasterSheet({ logs }: MasterSheetProps) {
  const [enrichedLogs, setEnrichedLogs] = useState<EnrichedLog[]>([]);

  useEffect(() => {
    enrichLogsWithTesterNames();
  }, [logs]);

  const enrichLogsWithTesterNames = async () => {
    if (logs.length === 0) {
      setEnrichedLogs([]);
      return;
    }

    const testerIds = [...new Set(logs.map(log => log.tester_id))];
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', testerIds);

    const testerMap = new Map(
      profiles?.map(p => [p.id, p.full_name]) || []
    );

    const enriched = logs.map(log => ({
      ...log,
      tester_name: testerMap.get(log.tester_id) || 'Unknown',
    }));

    setEnrichedLogs(enriched);
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Time', 'Tester', 'Category', 'Duration (s)', 'Failed'];
    const rows = enrichedLogs.map(log => {
      const date = new Date(log.created_at || '');
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        log.tester_name || 'Unknown',
        log.category,
        log.duration_sec.toString(),
        log.is_failed ? 'Yes' : 'No',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Header with Download Button */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h4 className="text-white font-semibold">All Test Logs</h4>
          <p className="text-gray-400 text-sm">{enrichedLogs.length} records</p>
        </div>
        <button
          onClick={downloadCSV}
          disabled={enrichedLogs.length === 0}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Tester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Duration (s)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {enrichedLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No test logs available for the selected period
                </td>
              </tr>
            ) : (
              enrichedLogs.map((log, index) => {
                const date = new Date(log.created_at || '');
                return (
                  <tr key={log.id || index} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div>
                        <div>{date.toLocaleDateString()}</div>
                        <div className="text-gray-500 text-xs">{date.toLocaleTimeString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {log.tester_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.category === 'M-pesa' ? 'bg-emerald-900/50 text-emerald-300' :
                        log.category === 'Safaricom' ? 'bg-green-900/50 text-green-300' :
                        log.category === 'USSD' ? 'bg-teal-900/50 text-teal-300' :
                        'bg-cyan-900/50 text-cyan-300'
                      }`}>
                        {log.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {log.duration_sec}s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.is_failed ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-300">
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-300">
                          Passed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
