'use client';
import { motion } from 'framer-motion';
import { Settings, Bell, Server, Cpu, Save } from 'lucide-react';

export default function SettingsView() {
  const sections = [
    { icon: Bell, label: 'Saluran Notifikasi', desc: 'Email, WhatsApp, dan peringatan SMS' },
    { icon: Cpu, label: 'Sampling ESP32', desc: 'Sesuaikan frekuensi pooling sensor' },
    { icon: Server, label: 'Cadangan Database', desc: 'Jadwalkan pencadangan sistem periodik' },
  ];

  return (
    <div className="max-w-4xl space-y-10">
      <div className="glass-card rounded-[2.5rem] p-10 border-sky-100">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-xl font-black text-sky-900 tracking-tight">Konfigurasi Umum</h3>
          <button className="flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-colors">
            <Save size={18} /> Simpan Perubahan
          </button>
        </div>

        <div className="space-y-6">
          {sections.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-6 bg-sky-50/50 border border-sky-100 rounded-3xl group hover:border-sky-300 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-5">
                <div className="p-3 bg-white rounded-2xl border border-sky-100 shadow-sm group-hover:shadow-sky-500/10 transition-all">
                  <s.icon size={22} className="text-sky-500" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-sky-900 uppercase tracking-tight">{s.label}</h4>
                  <p className="text-xs text-sky-800/40 font-bold uppercase tracking-widest mt-1">{s.desc}</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-sky-200 rounded-full relative">
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
