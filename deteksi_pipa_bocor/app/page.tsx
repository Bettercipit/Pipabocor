'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import StatusCards from '@/components/StatusCards';
import FlowChart from '@/components/FlowChart';
import AlertPanel from '@/components/AlertPanel';
import LeakHistoryTable from '@/components/LeakHistoryTable';
import { Globe, BellRing, Send, Download, Cpu, Activity, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for fallback
const mockReadings = [
  { timestamp: '10:00', sensor_1: 10.2, sensor_2: 9.8, sensor_3: 9.5, status: 'Normal', confidence: 0.98 },
  { timestamp: '10:05', sensor_1: 10.5, sensor_2: 10.1, sensor_3: 9.9, status: 'Normal', confidence: 0.97 },
  { timestamp: '10:10', sensor_1: 10.1, sensor_2: 8.2, sensor_3: 7.1, status: 'Bocor Kecil', confidence: 0.85 },
];

export default function Dashboard() {
  const [data, setData] = useState<any>({ readings: [], alerts: [] });
  const [leakHistory, setLeakHistory] = useState<any[]>([]);
  const [lastNotificationId, setLastNotificationId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  const SUPABASE_URL = "https://aukvdeuzgmwfnfwbtsse.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1a3ZkZXV6Z213Zm5md2J0c3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjQ4NjYsImV4cCI6MjA5NDkwMDg2Nn0.vS7SChFVtvX-WNrHLhu3WX5PnN4iFvGzxQjkXPvpTHw";
  const supabaseHeaders = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

  const fetchData = async () => {
    try {
      const readingsRes = await axios.get(`${SUPABASE_URL}/rest/v1/sensor_readings?select=*&order=id.desc&limit=20`, { headers: supabaseHeaders });
      const alertsRes = await axios.get(`${SUPABASE_URL}/rest/v1/alerts?select=*&order=id.desc&limit=5`, { headers: supabaseHeaders });
      
      if (readingsRes.data && readingsRes.data.length > 0) {
        const readings = readingsRes.data.reverse();
        setData({ readings, alerts: alertsRes.data });
        const latestAlert = alertsRes.data[0];
        if (latestAlert && latestAlert.id !== lastNotificationId) {
          setLastNotificationId(latestAlert.id);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 5000);
        }
      } else {
        setData({ readings: mockReadings, alerts: [] });
      }
    } catch (error) {
      setData({ readings: mockReadings, alerts: [] });
    }
  };

  const fetchLeakHistory = async () => {
    try {
      const res = await axios.get(`${SUPABASE_URL}/rest/v1/sensor_readings?select=*&status=neq.Normal&order=id.desc`, { headers: supabaseHeaders });
      if (res.data) setLeakHistory(res.data);
    } catch (error) {
      // Jika error, tetap tampilkan tabel kosong
    }
  };

  const handleDeleteLeak = async (id: number) => {
    try {
      await axios.delete(`${SUPABASE_URL}/rest/v1/sensor_readings?id=eq.${id}`, { headers: supabaseHeaders });
      setLeakHistory((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Gagal menghapus data:', error);
    }
  };

  const handleDeleteAllLeaks = async () => {
    try {
      await axios.delete(`${SUPABASE_URL}/rest/v1/sensor_readings?status=neq.Normal`, { headers: supabaseHeaders });
      setLeakHistory([]);
    } catch (error) {
      console.error('Gagal menghapus semua data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchLeakHistory();
    const interval = setInterval(() => {
      fetchData();
      fetchLeakHistory();
    }, 2000);
    return () => clearInterval(interval);
  }, [lastNotificationId]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Waktu,S1,S2,S3,Status,Akurasi\n"
      + data.readings.map((r: any) => `${r.timestamp},${r.sensor_1},${r.sensor_2},${r.sensor_3},${r.status},${r.confidence}`).join("\n");
    window.open(encodeURI(csvContent));
  };

  const latest = data.readings[data.readings.length - 1] || {};

  return (
    <main className="min-h-screen bg-[#f0f9ff] relative font-outfit">

      {/* Pop-up Notifikasi Otomatis (Aksi ML) */}
      <AnimatePresence>
        {showToast && (latest.status !== 'Normal') && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: '-50%' }}
            animate={{ opacity: 1, y: 30, x: '-50%' }}
            exit={{ opacity: 0, y: -100, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[100] w-full max-w-lg px-6"
          >
            <div className="bg-white rounded-[2rem] border-2 border-rose-100 shadow-2xl p-6 flex items-center gap-5">
              <div className="p-4 bg-rose-500 rounded-2xl animate-bounce shadow-lg shadow-rose-500/20">
                <BellRing size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-black text-rose-500 uppercase tracking-widest mb-1">Peringatan AI</p>
                <p className="text-[12px] font-bold text-sky-900 leading-tight">Peringatan Kebocoran Pipa ({latest.status})</p>
              </div>
              <Send size={16} className="text-sky-300" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col min-h-screen">
        {/* New Integrated Header (Replacing Sidebar) */}
        <header className="h-24 px-10 flex items-center justify-between bg-white/40 backdrop-blur-md border-b border-sky-100 sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl shadow-lg shadow-sky-400/20">
                <Droplets size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-sky-900 uppercase leading-none tracking-tight">
                  Pipe<span className="text-sky-500">Guard</span>
                </h1>
                <p className="text-[12px] text-sky-400 font-black uppercase tracking-widest mt-1">Sistem Deteksi Bocor</p>
              </div>
            </div>
            <div className="h-10 w-px bg-sky-100 mx-2" />
            <div>
              <h2 className="text-[12px] font-black text-sky-900 tracking-tight uppercase">Monitoring Aliran</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Globe size={12} className="text-sky-500" />
                <span className="text-[12px] font-black text-sky-400 uppercase tracking-widest">Real-time System</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[12px] font-black text-emerald-600 uppercase tracking-widest">ML: Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row">
          <div className="flex-1 overflow-y-auto px-10 py-10 space-y-10 custom-scrollbar">
            <StatusCards latestData={latest} />
            <FlowChart data={data.readings} />

            <section className="glass-card rounded-[2.5rem] p-10 border border-sky-100 shadow-xl shadow-sky-900/5">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-black text-sky-900 tracking-tight uppercase">Log Deteksi Real-time</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Activity size={12} className="text-sky-500" />
                    <p className="text-[12px] font-black text-sky-400 uppercase tracking-widest">Analisis ML Aktif Setiap 3 Detik</p>
                  </div>
                </div>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 text-[12px] font-black text-sky-500 uppercase tracking-widest border border-sky-200 px-4 py-2 rounded-xl hover:bg-sky-50 transition-colors"
                >
                  <Download size={14} /> Ekspor Log
                </button>
              </div>
              <div className="space-y-1">
                {data.readings.slice(-6).reverse().map((r: any, i: number) => (
                  <div key={i} className="grid grid-cols-7 items-center py-4 px-6 rounded-2xl hover:bg-sky-50/50 transition-colors border border-transparent hover:border-sky-100">
                    <span className="text-[12px] font-black text-sky-900/40 font-mono tracking-tighter">{r.timestamp}</span>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${r.status === 'Normal' ? 'bg-emerald-500' : 'bg-rose-500'} shadow-sm`} />
                      <span className={`text-[12px] font-black uppercase tracking-widest ${r.status === 'Normal' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {r.status}
                      </span>
                    </div>
                    <span className="text-[12px] font-bold text-sky-900/60 uppercase">S1: <span className="text-sky-900 font-black">{r.sensor_1}</span></span>
                    <span className="text-[12px] font-bold text-sky-900/60 uppercase">S2: <span className="text-sky-900 font-black">{r.sensor_2}</span></span>
                    <span className="text-[12px] font-bold text-sky-900/60 uppercase">S3: <span className="text-sky-900 font-black">{r.sensor_3}</span></span>
                    <span className="text-[12px] font-bold text-rose-500/80 uppercase col-span-1">
                      {r.lokasi_estimasi && r.lokasi_estimasi !== '-' ? r.lokasi_estimasi : ''}
                    </span>
                    <div className="flex justify-end">
                      <span className="text-[12px] font-black text-sky-600 bg-sky-500/10 px-3 py-1 rounded-lg border border-sky-100">
                        {Math.round((r.confidence ?? 0) * 100)}% Match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tabel Riwayat Kebocoran Permanen */}
            <LeakHistoryTable
              leakHistory={leakHistory}
              onDelete={handleDeleteLeak}
              onDeleteAll={handleDeleteAllLeaks}
            />
          </div>

          </div>
      </div>
    </main>
  );
}
