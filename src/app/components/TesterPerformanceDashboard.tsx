import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users } from 'lucide-react';

interface TesterStats {
  testerName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
}

interface TesterPerformanceDashboardProps {
  testerStats: TesterStats[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#22c55e', '#f97316'];

export function TesterPerformanceDashboard({ testerStats }: TesterPerformanceDashboardProps) {
  const pieData = testerStats.map((tester) => ({
    name: tester.testerName,
    shortName: tester.testerName.split(' ')[0], // Use first name only for labels
    value: tester.totalTests,
  }));

  return (
    <div className="glass-effect border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div>
          <h4 className="text-white font-semibold mb-6 text-center tracking-tight">Tests by Tester</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  color: '#fff',
                  backdropFilter: 'blur(20px)',
                  padding: '12px 16px',
                }}
                labelStyle={{
                  color: '#fff',
                  fontWeight: '600',
                  marginBottom: '4px',
                }}
                itemStyle={{
                  color: '#fff',
                }}
                formatter={(value: number, name: string) => [`${value} tests`, name]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => <span style={{ color: '#fff', fontSize: '13px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tester Stats Table */}
        <div>
          <h4 className="text-white font-semibold mb-6 tracking-tight">Tester Performance</h4>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {testerStats.map((tester, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3 gap-3">
                  <span className="text-white font-semibold text-sm tracking-tight flex-1 min-w-0">{tester.testerName}</span>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                    tester.passRate >= 80 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : tester.passRate >= 60 
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {tester.passRate}% Pass
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span className="font-medium">Total: {tester.totalTests}</span>
                  <span className="text-emerald-400 font-medium">Passed: {tester.passedTests}</span>
                  <span className="text-red-400 font-medium">Failed: {tester.failedTests}</span>
                </div>
                {/* Progress Bar */}
                <div className="bg-white/5 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${tester.passRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
