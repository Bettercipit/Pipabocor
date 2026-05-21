'use client';
import { Home, Droplets, Zap, BellRing, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
  return (
    <div className="w-72 h-screen bg-white/40 backdrop-blur-3xl flex flex-col border-r border-sky-100 relative overflow-hidden">
      {/* Decorative gradient blob - Water Blue */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-400/20 blur-[100px] pointer-events-none" />
      
      <div className="p-8 relative z-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl shadow-lg shadow-sky-400/20">
            <Droplets size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-sky-900 uppercase leading-none">
              Pipe<span className="text-sky-500">Guard</span>
            </h1>
            <p className="text-[10px] text-sky-400 font-bold tracking-[0.2em] mt-1 uppercase">Deteksi Pipa Bocor</p>
          </div>
        </div>

        <nav className="space-y-1">
            <div className="flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-sky-500/10 border border-sky-200 shadow-sm text-sky-600">
              <Home size={18} className="text-sky-500" />
              <span className="text-sm font-bold tracking-wide">Ringkasan Utama</span>
            </div>
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4 relative z-10">
        {/* Status AI Terintegrasi */}
        <div className="p-5 bg-white/60 rounded-3xl border border-sky-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-sky-500/10 rounded-lg">
              <Zap size={14} className="text-sky-500" />
            </div>
            <span className="text-[10px] font-black text-sky-800/40 uppercase tracking-widest">Kecerdasan AI</span>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-sky-900/60 leading-tight">
              Model ML menganalisis aliran secara otomatis setiap 3 detik.
            </p>
            <div className="h-1.5 w-full bg-sky-100 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '98%' }}
                    className="h-full bg-sky-500"
                />
            </div>
          </div>
        </div>

        {/* Notifikasi Otomatis Widget */}
        <div className="p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <BellRing size={14} className="text-emerald-500" />
            </div>
            <span className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest">Auto-Notify</span>
          </div>
          <p className="text-[9px] text-emerald-800/60 font-bold leading-tight">
            WhatsApp & Email akan dikirim secara otomatis jika kebocoran terdeteksi oleh ML.
          </p>
        </div>

        <div className="flex items-center gap-4 px-2 pt-4">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-500">
            <User size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-sky-900 leading-none">Admin Daniel</p>
            <p className="text-[10px] text-sky-400 mt-1 uppercase font-bold">Pengawas Riset</p>
          </div>
        </div>
      </div>
    </div>
  );
}
