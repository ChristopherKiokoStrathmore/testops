import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CategoryStats {
  avgDuration: number;
  failureRate: number;
  totalTests: number;
}

interface FailureChartProps {
  stats: Record<string, CategoryStats>;
}

const COLORS = {
  'M-pesa': '#10b981',
  'Safaricom': '#22c55e',
  'USSD': '#14b8a6',
  'STK': '#06b6d4',
};

export function FailureChart({ stats }: FailureChartProps) {
  const data = Object.entries(stats).map(([category, stat]) => ({
    category,
    failureRate: stat.failureRate,
  }));

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="category" 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
          />
          <YAxis 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
            label={{ value: 'Failure Rate (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff',
            }}
            labelStyle={{
              color: '#fff',
              fontWeight: '600',
              marginBottom: '4px',
            }}
            itemStyle={{
              color: '#fff',
            }}
            formatter={(value: number) => [`${value}%`, 'Failure Rate']}
          />
          <Bar dataKey="failureRate" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.category as keyof typeof COLORS]} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
