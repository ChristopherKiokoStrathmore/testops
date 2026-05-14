import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CategoryStats {
  avgDuration: number;
  passRate: number;
  totalTests: number;
}

interface PassRateChartProps {
  stats: Record<string, CategoryStats>;
}

const COLORS = {
  'M-pesa': '#10b981',
  'Safaricom': '#22c55e',
  'USSD': '#14b8a6',
  'STK': '#06b6d4',
};

export function PassRateChart({ stats }: PassRateChartProps) {
  const data = Object.entries(stats).map(([category, stat]) => ({
    category,
    passRate: stat.passRate,
  }));

  return (
    <div className="glass-effect border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="category" 
            stroke="#6B7280"
            tick={{ fill: '#9CA3AF', fontSize: 13 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis 
            stroke="#6B7280"
            tick={{ fill: '#9CA3AF', fontSize: 13 }}
            label={{ 
              value: 'Pass Rate (%)', 
              angle: -90, 
              position: 'insideLeft', 
              fill: '#9CA3AF',
              style: { fontSize: 13, fontWeight: 500 }
            }}
            domain={[0, 100]}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              color: '#fff',
              backdropFilter: 'blur(20px)',
              padding: '12px 16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
            labelStyle={{
              color: '#fff',
              fontWeight: '600',
              marginBottom: '4px',
            }}
            itemStyle={{
              color: '#fff',
            }}
            formatter={(value: number) => [`${value}%`, 'Pass Rate']}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)', radius: 8 }}
          />
          <Bar dataKey="passRate" radius={[12, 12, 0, 0]} maxBarSize={60}>
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
