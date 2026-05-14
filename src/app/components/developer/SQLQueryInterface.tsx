import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Play, Download, AlertTriangle } from 'lucide-react';

export function SQLQueryInterface() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const commonQueries = [
    {
      name: 'All Users',
      sql: 'SELECT * FROM profiles ORDER BY created_at DESC;'
    },
    {
      name: 'Recent Test Logs',
      sql: 'SELECT * FROM test_logs ORDER BY created_at DESC LIMIT 50;'
    },
    {
      name: 'Failed Tests Today',
      sql: `SELECT * FROM test_logs WHERE is_failed = true AND created_at >= CURRENT_DATE ORDER BY created_at DESC;`
    },
    {
      name: 'Test Summary by Tester',
      sql: `SELECT 
  p.full_name,
  COUNT(*) as total_tests,
  SUM(CASE WHEN is_failed THEN 1 ELSE 0 END) as failed_tests,
  AVG(duration_sec) as avg_duration
FROM test_logs tl
JOIN profiles p ON p.id = tl.tester_id
GROUP BY p.full_name
ORDER BY total_tests DESC;`
    }
  ];

  const executeQuery = async () => {
    if (!query.trim()) {
      alert('Please enter a SQL query');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const { data, error } = await supabase.rpc('execute_sql', { query_text: query });

      if (error) {
        setError(error.message);
      } else {
        setResults(data);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while executing the query');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!results || results.length === 0) return;

    const headers = Object.keys(results[0]);
    const csv = [
      headers.join(','),
      ...results.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white tracking-tight">SQL Query Interface</h2>
        <p className="text-gray-400 text-sm mt-1">Execute custom SQL queries on the database</p>
      </div>

      {/* Warning */}
      <div className="glass-effect border border-yellow-500/30 rounded-3xl p-4 bg-yellow-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-yellow-400 font-semibold text-sm mb-1">Use with Caution</h4>
            <p className="text-gray-400 text-xs">
              This interface executes SQL queries directly on the database. Be careful with UPDATE and DELETE statements.
              Always test with SELECT queries first.
            </p>
          </div>
        </div>
      </div>

      {/* Common Queries */}
      <div className="glass-effect border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 tracking-tight">Common Queries</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {commonQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(q.sql)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white transition-all duration-200 hover:scale-105 active:scale-95 text-left"
            >
              {q.name}
            </button>
          ))}
        </div>
      </div>

      {/* Query Editor */}
      <div className="glass-effect border border-white/10 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white tracking-tight">Query Editor</h3>
          <div className="flex gap-2">
            {results && (
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 border border-blue-500/30"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
            <button
              onClick={executeQuery}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {loading ? 'Running...' : 'Execute'}
            </button>
          </div>
        </div>
        
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your SQL query here..."
          className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all font-mono text-sm resize-none"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass-effect border border-red-500/30 rounded-3xl p-6 bg-red-500/5 animate-scale-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-400 font-semibold text-sm mb-2">Query Error</h4>
              <pre className="text-gray-400 text-xs font-mono whitespace-pre-wrap">{error}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="glass-effect border border-white/10 rounded-3xl overflow-hidden animate-scale-in">
          <div className="bg-white/5 border-b border-white/10 px-6 py-4">
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Query Results ({results.length} rows)
            </h3>
          </div>
          <div className="overflow-x-auto max-h-96">
            {results.length > 0 ? (
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10 sticky top-0">
                  <tr>
                    {Object.keys(results[0]).map((key) => (
                      <th key={key} className="text-left px-6 py-3 text-sm font-semibold text-gray-400">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {results.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      {Object.values(row).map((value: any, cellIdx) => (
                        <td key={cellIdx} className="px-6 py-3 text-sm text-gray-400">
                          {value === null ? (
                            <span className="text-gray-600 italic">null</span>
                          ) : typeof value === 'boolean' ? (
                            <span className={value ? 'text-emerald-400' : 'text-red-400'}>
                              {value.toString()}
                            </span>
                          ) : (
                            value.toString()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                Query executed successfully but returned no results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
