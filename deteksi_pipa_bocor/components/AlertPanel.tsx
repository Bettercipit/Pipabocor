'use client';
import { Bell, AlertTriangle, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertPanelProps {
  alerts: any[];
  onResolve: (id: number) => void;
  onViewAnalytics: () => void;
}

export default function AlertPanel({ alerts, onResolve, onViewAnalytics }: AlertPanelProps) {
  return (
    <div className="w-80 h-screen bg-white/20 backdrop-blur-3xl p-8 border-l border-sky-100 flex flex-col">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={20} className="text-sky-400" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>
          <h3 className="font-black text-sky-900 tracking-tight uppercase text-sm">Peringatan Aliran</h3>
        </div>
        <button onClick={() => alert("Menu opsi lainnya sedang dikembangkan...")} className="text-sky-300 hover:text-sky-600 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {alerts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 px-4 glass-card rounded-3xl border-dashed border-sky-200 bg-transparent"
            >
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-emerald-500 opacity-40" />
              </div>
              <p className="text-[10px] font-black text-sky-900/40 uppercase tracking-widest leading-loose">
                Status Sistem:<br/>Murni & Optimal
              </p>
            </motion.div>
          ) : (
            alerts.map((alert) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                className="p-5 glass-card rounded-[1.5rem] border-rose-100 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 blur-2xl group-hover:bg-rose-500/10 transition-colors" />
                
                <div className="flex gap-4 relative z-10">
                  <div className="p-2.5 bg-rose-500/10 rounded-xl h-fit border border-rose-100">
                    <AlertTriangle size={16} className="text-rose-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Mendesak</span>
                      <span className="text-[9px] font-bold text-sky-400">{new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-[11px] font-bold text-sky-900 leading-relaxed mb-3">
                      {alert.message}
                    </p>
                    <div className="flex gap-2">
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onResolve(alert.id)}
                        className="flex-1 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-[9px] font-black text-rose-600 uppercase rounded-lg transition-colors border border-rose-100"
                      >
                        Pahami
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="pt-6 mt-6 border-t border-sky-100">
        <p className="text-[10px] font-bold text-sky-900/40 uppercase tracking-widest text-center mb-4">Kualitas Air: Optimal</p>
        <button 
          onClick={onViewAnalytics}
          className="w-full py-4 glass-card rounded-2xl text-[10px] font-black text-sky-500 uppercase tracking-[0.2em] hover:bg-sky-50 transition-colors border border-sky-100"
        >
          Diagnostik Lengkap
        </button>
      </div>
    </div>
  );
}
