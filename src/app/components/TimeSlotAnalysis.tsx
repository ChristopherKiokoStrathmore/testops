import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Clock } from 'lucide-react';

interface TimeSlotData {
  timeSlot: string;
  totalTests: number;
  passRate: number;
}

interface TimeSlotAnalysisProps {
  timeSlotData: TimeSlotData[];
}

export function TimeSlotAnalysis({ timeSlotData }: TimeSlotAnalysisProps) {
  return (
    <div className="glass-effect border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
      <div className="mb-6">
        <h4 className="text-white font-semibold flex items-center gap-2 tracking-tight">
          <Clock className="w-5 h-5 text-blue-400" />
          Performance by Time Slot
        </h4>
        <p className="text-gray-500 text-sm mt-2">Pass rate trends across different time slots (Morning, Afternoon, Evening, Night)</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={timeSlotData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="timeSlot" 
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
          />
          <Line 
            type="monotone" 
            dataKey="passRate" 
            stroke="#10b981" 
            strokeWidth={3}
            name="Pass Rate"
            dot={{ fill: '#10b981', r: 6, strokeWidth: 2, stroke: '#000' }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Time Slot Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
        {timeSlotData.map((slot, index) => (
          <div key={index} className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200">
            <p className="text-xs text-gray-500 mb-2 font-medium">{slot.timeSlot}</p>
            <p className="text-2xl font-semibold text-white tracking-tight">{slot.totalTests}</p>
            <p className="text-xs text-emerald-400 font-medium mt-1">{slot.passRate}% pass</p>
          </div>
        ))}
      </div>
    </div>
  );
}
