'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function FlowChart({ data }: { data: any[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 glass-card rounded-[2.5rem] h-[500px] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/5 blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
        <div>
          <h3 className="text-xl font-black text-sky-900 tracking-tight">Hydraulic Analytics Engine</h3>
          <p className="text-[12px] text-sky-400 font-black uppercase tracking-widest mt-1">Real-time Stream Synchronization</p>
        </div>
        
        <div className="flex gap-4 p-1.5 bg-sky-50 rounded-2xl border border-sky-100">
          {[
            { label: 'S1', color: '#0ea5e9' },
            { label: 'S2', color: '#6366f1' },
            { label: 'S3', color: '#22d3ee' }
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 px-3 py-1.5">
              <div className="w-2 h-2 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: s.color, boxShadow: `0 0 10px ${s.color}40` }} />
              <span className="text-[12px] font-black text-sky-800/40 uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-[340px]">
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorS1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorS3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(14,165,233,0.05)" />
            <XAxis 
              dataKey="timestamp" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#0c4a6e', opacity: 0.4, fontSize: 12, fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#0c4a6e', opacity: 0.4, fontSize: 12, fontWeight: 700 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid rgba(14,165,233,0.2)', 
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 30px rgba(12, 74, 110, 0.1)'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 700, color: '#0c4a6e' }}
            />
            <Area 
              type="monotone" 
              dataKey="sensor_1" 
              stroke="#0ea5e9" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorS1)" 
            />
            <Area 
              type="monotone" 
              dataKey="sensor_2" 
              stroke="#6366f1" 
              strokeWidth={3}
              strokeDasharray="5 5"
              fill="transparent" 
            />
            <Area 
              type="monotone" 
              dataKey="sensor_3" 
              stroke="#22d3ee" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorS3)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
