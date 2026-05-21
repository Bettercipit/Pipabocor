'use client';
import { motion } from 'framer-motion';
import { Activity, BarChart3, PieChart, Target } from 'lucide-react';

export default function AnalyticsView() {
  const metrics = [
    { label: 'Akurasi Model', value: '98.4%', trend: '+0.2%', icon: Target },
    { label: 'Waktu Inferensi', value: '45ms', trend: '-2ms', icon: Activity },
    { label: 'Positif Benar', value: '1,240', trend: 'Tinggi', icon: BarChart3 },
    { label: 'Beban Pemrosesan', value: '12%', trend: 'Stabil', icon: PieChart },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 glass-card rounded-3xl border-sky-100"
          >
            <div className="p-3 bg-sky-500/10 rounded-2xl w-fit mb-4">
              <m.icon size={20} className="text-sky-500" />
            </div>
            <p className="text-[10px] font-black text-sky-900/40 uppercase tracking-widest mb-1">{m.label}</p>
            <h4 className="text-2xl font-black text-sky-900">{m.value}</h4>
            <span className="text-[10px] font-bold text-emerald-500 mt-2 block">{m.trend} dari garis dasar</span>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] p-10 border-sky-100">
        <h3 className="text-lg font-black text-sky-900 tracking-tight mb-8">Simulasi Matriks Kebingungan ML</h3>
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3,4,5,6,7,8,9].map((n) => (
            <div key={n} className="aspect-square bg-sky-50 rounded-2xl border border-sky-100 flex items-center justify-center">
              <span className="text-sky-900/20 font-black text-4xl">{n * 10}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
