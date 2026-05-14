import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface CategoryStats {
  avgDuration: number;
  passRate: number;
  totalTests: number;
}

interface CategoryComparisonDashboardProps {
  stats: Record<string, CategoryStats>;
}

export function CategoryComparisonDashboard({ stats }: CategoryComparisonDashboardProps) {
  const radarData = Object.entries(stats).map(([category, stat]) => ({
    category,
    passRate: stat.passRate,
    efficiency: stat.avgDuration > 0 ? Math.min(100, (60 / stat.avgDuration) * 100) : 0,
    volume: Math.min(100, (stat.totalTests / 10) * 100),
  }));

  return (
    <div className="glass-effect border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
      <div className="mb-6">
        <h4 className="text-white font-semibold flex items-center gap-2 tracking-tight">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Category Performance Comparison
        </h4>
        <p className="text-gray-500 text-sm mt-2">Multi-dimensional analysis across all categories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis 
                dataKey="category" 
                stroke="#6B7280" 
                tick={{ fill: '#9CA3AF', fontSize: 13 }} 
              />
              <PolarRadiusAxis 
                stroke="#6B7280" 
                tick={{ fill: '#9CA3AF', fontSize: 13 }} 
                domain={[0, 100]} 
              />
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
              />
              <Radar 
                name="Pass Rate" 
                dataKey="passRate" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.5} 
                strokeWidth={2}
              />
              <Radar 
                name="Efficiency" 
                dataKey="efficiency" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.3} 
                strokeWidth={2}
              />
              <Radar 
                name="Volume" 
                dataKey="volume" 
                stroke="#06b6d4" 
                fill="#06b6d4" 
                fillOpacity={0.3} 
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Metrics */}
        <div className="space-y-4">
          {Object.entries(stats).map(([category, stat], index) => (
            <div key={index} className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-white font-semibold tracking-tight">{category}</h5>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                  stat.passRate >= 80 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : stat.passRate >= 60 
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {stat.passRate}%
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Tests</p>
                  <p className="text-xl font-semibold text-white tracking-tight">{stat.totalTests}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Avg Time</p>
                  <p className="text-xl font-semibold text-white tracking-tight">{stat.avgDuration}<span className="text-sm text-gray-500">s</span></p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Pass Rate</p>
                  <p className="text-xl font-semibold text-emerald-400 tracking-tight">{stat.passRate}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
