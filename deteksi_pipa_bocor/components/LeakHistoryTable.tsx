'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, MapPin, Droplets, ShieldAlert, Zap } from 'lucide-react';

interface LeakRecord {
  id: number;
  sensor_1: number;
  sensor_2: number;
  sensor_3: number;
  status: 'Bocor Kecil' | 'Bocor Besar';
  confidence: number;
  lokasi_estimasi: string;
  timestamp: string;
}

interface LeakHistoryTableProps {
  leakHistory: LeakRecord[];
  onDelete: (id: number) => void;
  onDeleteAll: () => void;
}

export default function LeakHistoryTable({ leakHistory, onDelete, onDeleteAll }: LeakHistoryTableProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [newEntryId, setNewEntryId] = useState<number | null>(null);
  const prevCountRef = useRef<number>(0);
  const prevTopIdRef = useRef<number | null>(null);

  // Deteksi entry baru secara otomatis dan pasang badge "BARU"
  useEffect(() => {
    if (leakHistory.length > 0) {
      const topId = leakHistory[0]?.id;
      if (leakHistory.length > prevCountRef.current && topId !== prevTopIdRef.current) {
        setNewEntryId(topId);
        setTimeout(() => setNewEntryId(null), 4000);
      }
      prevCountRef.current = leakHistory.length;
      prevTopIdRef.current = topId;
    }
  }, [leakHistory]);

  const handleConfirmDelete = () => {
    if (confirmDeleteId !== null) {
      onDelete(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const formatLokasi = (lokasi: string | null | undefined) => {
    if (!lokasi || lokasi === '-' || lokasi === 'null') return { segmen: '-', jarak: '-' };
    const match = lokasi.match(/^(Segmen \d)\s*\((.+)\)$/);
    if (match) return { segmen: match[1], jarak: match[2] };
    return { segmen: lokasi, jarak: '' };
  };

  const formatJarak = (lokasi: string | null | undefined) => {
    if (!lokasi || lokasi === '-' || lokasi === 'null') return 'Tidak diketahui';
    const match = lokasi.match(/(\d+\.?\d*)\s*cm/);
    if (match) {
      const cm = parseFloat(match[1]);
      const m = (cm / 100).toFixed(2);
      return `± ${m} m (${cm} cm)`;
    }
    return lokasi;
  };

  return (
    <section className="glass-card rounded-[2.5rem] p-10 border border-rose-100 shadow-xl shadow-rose-900/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-gradient-to-br from-rose-400 to-red-600 rounded-xl shadow-lg shadow-rose-400/20">
              <ShieldAlert size={18} className="text-white" />
            </div>
            <h3 className="text-lg font-black text-sky-900 tracking-tight uppercase">
              Riwayat Kebocoran
            </h3>
          </div>
          <p className="text-[12px] font-black text-rose-400 uppercase tracking-widest ml-14">
            {leakHistory.length} Kejadian Tersimpan — Otomatis Terdeteksi
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tombol Hapus Semua */}
          {leakHistory.length > 0 && (
            <button
              onClick={() => setConfirmDeleteAll(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl text-[12px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-100 transition-colors"
            >
              <Trash2 size={11} />
              Hapus Semua
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[12px] font-black text-rose-500 uppercase tracking-widest">Auto-Detect Live</span>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Semua */}
      <AnimatePresence>
        {confirmDeleteAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-sky-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl border border-rose-200 max-w-sm w-full mx-4"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-rose-100 rounded-2xl">
                  <AlertTriangle size={22} className="text-rose-500" />
                </div>
                <div>
                  <p className="text-[12px] font-black text-sky-900">Hapus Semua Data?</p>
                  <p className="text-[12px] text-rose-400 font-bold">{leakHistory.length} kejadian akan dihapus</p>
                </div>
              </div>
              <p className="text-[12px] text-sky-700 mb-6 leading-relaxed">
                Seluruh <strong>{leakHistory.length} data kebocoran</strong> akan dihapus secara permanen dari database dan tidak dapat dikembalikan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteAll(false)}
                  className="flex-1 py-3 rounded-2xl border border-sky-100 text-[12px] font-black text-sky-500 uppercase tracking-widest hover:bg-sky-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => { onDeleteAll(); setConfirmDeleteAll(false); }}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-[12px] font-black text-white uppercase tracking-widest hover:from-rose-600 hover:to-red-700 shadow-lg shadow-rose-500/20 transition-all"
                >
                  Hapus Semua
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Hapus Satu */}
      <AnimatePresence>
        {confirmDeleteId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-sky-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl border border-rose-100 max-w-sm w-full mx-4"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-rose-100 rounded-2xl">
                  <AlertTriangle size={22} className="text-rose-500" />
                </div>
                <div>
                  <p className="text-[12px] font-black text-sky-900">Hapus Data?</p>
                  <p className="text-[12px] text-sky-400 font-bold">ID: #{confirmDeleteId}</p>
                </div>
              </div>
              <p className="text-[12px] text-sky-700 mb-6 leading-relaxed">
                Data kejadian kebocoran ini akan dihapus secara permanen dari database dan tidak dapat dikembalikan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-3 rounded-2xl border border-sky-100 text-[12px] font-black text-sky-500 uppercase tracking-widest hover:bg-sky-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-[12px] font-black text-white uppercase tracking-widest hover:from-rose-600 hover:to-red-700 shadow-lg shadow-rose-500/20 transition-all"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabel */}
      {leakHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="p-5 bg-emerald-50 rounded-3xl">
            <Droplets size={32} className="text-emerald-400" />
          </div>
          <p className="text-[12px] font-black text-sky-900/40 uppercase tracking-widest">Belum Ada Kebocoran</p>
          <p className="text-[12px] text-sky-300 font-bold">Sistem otomatis mencatat setiap kejadian bocor di sini</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[1.2fr_1fr_1.8fr_0.8fr_0.8fr_0.8fr_0.9fr_0.5fr] gap-3 px-6 py-3 mb-2">
            {['Waktu', 'Status', 'Estimasi Lokasi', 'S1', 'S2', 'S3', 'Akurasi', 'Hapus'].map((h) => (
              <span key={h} className="text-[12px] font-black text-sky-400 uppercase tracking-widest">{h}</span>
            ))}
          </div>

          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {leakHistory.map((record) => {
                const { segmen } = formatLokasi(record.lokasi_estimasi);
                const jarakFormatted = formatJarak(record.lokasi_estimasi);
                const isBesar = record.status === 'Bocor Besar';
                const isNew = record.id === newEntryId;

                return (
                  <motion.div
                    key={record.id}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -80 }}
                    transition={{ duration: 0.35 }}
                    className={`grid grid-cols-[1.2fr_1fr_1.8fr_0.8fr_0.8fr_0.8fr_0.9fr_0.5fr] gap-3 items-center px-6 py-4 rounded-2xl border transition-colors relative overflow-hidden
                      ${isBesar
                        ? 'bg-rose-50/60 border-rose-100 hover:bg-rose-50'
                        : 'bg-amber-50/60 border-amber-100 hover:bg-amber-50'
                      }
                      ${isNew ? 'ring-2 ring-rose-400 ring-offset-1' : ''}
                    `}
                  >
                    {/* Flash animasi untuk entry baru */}
                    {isNew && (
                      <motion.div
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-rose-400/20 pointer-events-none rounded-2xl"
                      />
                    )}

                    {/* Waktu + Badge BARU */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] font-black text-sky-900/50 font-mono tracking-tighter leading-tight">
                        {new Date(record.timestamp).toLocaleString('id-ID', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </span>
                      {isNew && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1 bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit"
                        >
                          <Zap size={8} />
                          BARU TERDETEKSI
                        </motion.div>
                      )}
                    </div>

                    {/* Status */}
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border w-fit
                      ${isBesar
                        ? 'bg-rose-100 border-rose-200 text-rose-700'
                        : 'bg-amber-100 border-amber-200 text-amber-700'
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isNew ? 'animate-pulse' : ''} ${isBesar ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      <span className="text-[12px] font-black uppercase tracking-wide whitespace-nowrap">
                        {record.status}
                      </span>
                    </div>

                    {/* Estimasi Lokasi */}
                    <div className="flex items-center gap-2">
                      <MapPin size={11} className={isBesar ? 'text-rose-500' : 'text-amber-500'} />
                      <div>
                        <p className={`text-[12px] font-black ${isBesar ? 'text-rose-700' : 'text-amber-700'}`}>
                          {segmen}
                        </p>
                        <p className="text-[12px] font-bold text-sky-900/40 leading-tight">
                          {jarakFormatted}
                        </p>
                      </div>
                    </div>

                    {/* Sensor Values */}
                    <span className="text-[12px] font-black text-sky-800">{Number(record.sensor_1).toFixed(2)}</span>
                    <span className="text-[12px] font-black text-sky-800">{Number(record.sensor_2).toFixed(2)}</span>
                    <span className="text-[12px] font-black text-sky-800">{Number(record.sensor_3).toFixed(2)}</span>

                    {/* Akurasi */}
                    <div className={`text-[12px] font-black px-2.5 py-1.5 rounded-lg text-center w-fit
                      ${isBesar
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-200'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-200'
                      }`}>
                      {Math.round((record.confidence ?? 0) * 100)}%
                    </div>

                    {/* Tombol Hapus */}
                    <button
                      onClick={() => setConfirmDeleteId(record.id)}
                      className="p-2 rounded-xl border border-sky-100 text-sky-300 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all group"
                    >
                      <Trash2 size={13} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </section>
  );
}
