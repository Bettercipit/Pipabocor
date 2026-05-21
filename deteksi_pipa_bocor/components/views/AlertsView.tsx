'use client';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, MapPin, ShieldAlert } from 'lucide-react';

export default function AlertsView() {
  const alerts = [
    { id: 1, type: 'Bocor Besar', location: 'Seksi A-12', time: '10:15 AM', status: 'Belum Teratasi' },
    { id: 2, type: 'Bocor Kecil', location: 'Seksi B-05', time: '09:45 AM', status: 'Teratasi' },
    { id: 3, type: 'Error Sensor', location: 'Katup Input', time: '08:20 AM', status: 'Teratasi' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 p-6 bg-rose-50 border border-rose-100 rounded-[2rem]">
        <div className="p-4 bg-rose-500 rounded-2xl shadow-lg shadow-rose-500/20">
          <ShieldAlert size={24} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-black text-rose-900 tracking-tight uppercase">Mode Tanggap Darurat</h3>
          <p className="text-xs text-rose-600 font-bold uppercase tracking-widest">3 Masalah aktif memerlukan perhatian segera</p>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden border-sky-100">
        <table className="w-full text-left">
          <thead className="bg-sky-50/50 border-b border-sky-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-sky-900/40 uppercase tracking-widest">Tipe</th>
              <th className="px-8 py-5 text-[10px] font-black text-sky-900/40 uppercase tracking-widest">Lokasi</th>
              <th className="px-8 py-5 text-[10px] font-black text-sky-900/40 uppercase tracking-widest">Waktu</th>
              <th className="px-8 py-5 text-[10px] font-black text-sky-900/40 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-100">
            {alerts.map((a, i) => (
              <motion.tr 
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="hover:bg-sky-50/30 transition-colors"
              >
                <td className="px-8 py-6 flex items-center gap-3">
                  <AlertTriangle size={16} className={a.type === 'Bocor Besar' ? 'text-rose-500' : 'text-amber-500'} />
                  <span className="text-sm font-bold text-sky-900">{a.type}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-800/60">
                    <MapPin size={12} /> {a.location}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-800/60">
                    <Clock size={12} /> {a.time}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    a.status === 'Belum Teratasi' ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    {a.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
