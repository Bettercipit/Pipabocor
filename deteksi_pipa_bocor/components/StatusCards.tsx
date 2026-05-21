'use client';
import { Activity, Droplet, AlertCircle, ShieldCheck, TrendingUp, TrendingDown, Waves } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatusCards({ latestData }: { latestData: any }) {
  // Pastikan data adalah angka (MySQL mengembalikan float sebagai string)
  const s1 = Number(latestData?.sensor_1 || 0);
  const s2 = Number(latestData?.sensor_2 || 0);
  const s3 = Number(latestData?.sensor_3 || 0);
  const diff = s1 - s3;

  const stats = [
    {
      label: 'Prediksi ML',
      value: latestData?.status || 'Normal',
      sub: `Akurasi: ${Math.round(Number(latestData?.confidence || 0) * 100)}%`,
      icon: ShieldCheck,
      color: latestData?.status === 'Normal' ? 'text-emerald-500' : 'text-rose-500',
      bg: latestData?.status === 'Normal' ? 'bg-emerald-500/10' : 'bg-rose-500/10',
      border: latestData?.status === 'Normal' ? 'border-emerald-200' : 'border-rose-200'
    },
    {
      label: 'Aliran Masuk (S1)',
      value: s1.toFixed(2),
      sub: 'Liter/menit',
      icon: Droplet,
      color: 'text-sky-500',
      bg: 'bg-sky-500/10',
      border: 'border-sky-200',
      trend: <TrendingUp size={12} className="text-emerald-500" />
    },
    {
      label: 'Aliran Tengah (S2)',
      value: s2.toFixed(2),
      sub: 'Liter/menit',
      icon: Waves,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-200',
      trend: <Activity size={12} className="text-sky-400" />
    },
    {
      label: 'Aliran Keluar (S3)',
      value: s3.toFixed(2),
      sub: 'Liter/menit',
      icon: Activity,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-200',
      trend: <TrendingDown size={12} className="text-rose-500" />
    },
    {
      label: 'Kehilangan Fluida',
      value: diff.toFixed(2),
      sub: 'ΔF (S1 - S3)',
      icon: AlertCircle,
      color: diff > 1 ? 'text-amber-500' : 'text-sky-800/40',
      bg: diff > 1 ? 'bg-amber-500/10' : 'bg-sky-500/5',
      border: diff > 1 ? 'border-amber-200' : 'border-sky-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`relative overflow-hidden p-6 glass-card rounded-[2rem] border ${stat.border} flex flex-col justify-between`}
        >
          <div className={`absolute -right-4 -top-4 w-20 h-20 blur-3xl opacity-30 ${stat.bg}`} />
          
          <div className="flex items-center justify-between mb-6">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            {stat.trend && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/50 border border-sky-100 text-[12px] font-bold text-sky-600">
                {stat.trend}
                LIVE
              </div>
            )}
          </div>
          
          <div>
            <p className="text-[12px] font-black text-sky-900/40 uppercase tracking-widest mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-2xl font-black tracking-tight ${stat.color}`}>{stat.value}</h3>
              <span className="text-[12px] text-sky-800/60 font-bold uppercase tracking-tight">{stat.sub}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
