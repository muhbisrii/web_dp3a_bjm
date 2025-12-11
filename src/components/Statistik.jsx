import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Pastikan path firebase sesuai struktur folder Anda
import { 
  ArrowLeft, BarChart3, Clock, Settings, 
  CheckCircle, XCircle, Loader2, Activity 
} from "lucide-react";
import { motion } from "framer-motion";

export default function Statistik({ onBack }) {
  // --- STATE ---
  const [stats, setStats] = useState({ 
    total: 0, 
    menunggu: 0, 
    diproses: 0, 
    selesai: 0, 
    ditolak: 0 
  });
  const [loading, setLoading] = useState(true);

  // --- LOGIKA FETCH DATA REALTIME (SAMA DENGAN ADMIN) ---
  useEffect(() => {
    // Query ke koleksi "laporan"
    const q = query(collection(db, "laporan"));
    
    // Listener Realtime
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      
      // Inisialisasi counter
      const counts = { total: 0, menunggu: 0, diproses: 0, selesai: 0, ditolak: 0 };
      
      // Loop data untuk menghitung status
      data.forEach(item => {
        counts.total++;
        // Normalisasi status ke lowercase untuk pencocokan yang akurat
        const status = item.status ? item.status.toLowerCase() : 'menunggu';
        
        if (status === 'menunggu') counts.menunggu++;
        else if (status === 'diproses') counts.diproses++;
        else if (status === 'selesai') counts.selesai++;
        else if (status === 'ditolak') counts.ditolak++;
      });

      setStats(counts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching stats:", error);
      setLoading(false);
    });

    // Cleanup listener saat component di-unmount
    return () => unsubscribe();
  }, []);

  // --- ANIMASI ---
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const containerVar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  // --- COMPONENT KARTU STATISTIK ---
  const StatCard = ({ title, count, icon: Icon, colorBg, colorText, borderColor }) => (
    <motion.div 
      variants={fadeInUp}
      className={`p-6 rounded-2xl bg-white dark:bg-slate-800 border ${borderColor} dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group hover:-translate-y-1`}
    >
      <div className={`p-4 rounded-full ${colorBg} ${colorText} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={32} strokeWidth={2} />
      </div>
      <h4 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-2">{count}</h4>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300">
      
      {/* HEADER NAVIGASI */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Kembali ke Beranda</span>
          </button>
          <div className="flex items-center space-x-2">
            <Activity size={20} className="text-blue-600 animate-pulse" />
            <span className="text-sm font-bold text-slate-800 dark:text-white">Data Real-Time</span>
          </div>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* 1. BAGIAN JUDUL & VEKTOR */}
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
                Statistik <span className="text-blue-600">Pelayanan</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                Transparansi data pengaduan masyarakat Dinas Pemberdayaan Perempuan dan Perlindungan Anak Kota Banjarmasin.
              </p>
            </motion.div>

            {/* GAMBAR VEKTOR (Sesuai Permintaan) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-10 flex justify-center"
            >
              <img 
                src="/vektor.png" 
                alt="Ilustrasi Statistik" 
                className="w-full max-w-md md:max-w-lg object-contain drop-shadow-xl"
              />
            </motion.div>
          </div>

          {/* 2. BAGIAN RINGKASAN DATA */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white uppercase tracking-wider">Ringkasan Statistik</h2>
              <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
            </div>

            {loading ? (
              // Loading State
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 size={48} className="animate-spin mb-4 text-blue-600" />
                <p>Mengambil data terbaru...</p>
              </div>
            ) : (
              // Grid Kartu Statistik
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
                variants={containerVar}
                initial="hidden"
                animate="visible"
              >
                <StatCard 
                  title="Total Laporan" 
                  count={stats.total} 
                  icon={BarChart3} 
                  colorBg="bg-slate-100 dark:bg-slate-700" 
                  colorText="text-slate-700 dark:text-slate-200"
                  borderColor="border-slate-200"
                />
                <StatCard 
                  title="Menunggu" 
                  count={stats.menunggu} 
                  icon={Clock} 
                  colorBg="bg-amber-100 dark:bg-amber-900/30" 
                  colorText="text-amber-600 dark:text-amber-400"
                  borderColor="border-amber-200"
                />
                <StatCard 
                  title="Diproses" 
                  count={stats.diproses} 
                  icon={Settings} 
                  colorBg="bg-blue-100 dark:bg-blue-900/30" 
                  colorText="text-blue-600 dark:text-blue-400"
                  borderColor="border-blue-200"
                />
                <StatCard 
                  title="Selesai" 
                  count={stats.selesai} 
                  icon={CheckCircle} 
                  colorBg="bg-emerald-100 dark:bg-emerald-900/30" 
                  colorText="text-emerald-600 dark:text-emerald-400"
                  borderColor="border-emerald-200"
                />
                <StatCard 
                  title="Ditolak" 
                  count={stats.ditolak} 
                  icon={XCircle} 
                  colorBg="bg-red-100 dark:bg-red-900/30" 
                  colorText="text-red-600 dark:text-red-400"
                  borderColor="border-red-200"
                />
              </motion.div>
            )}
          </div>

          <div className="text-center mt-12 text-sm text-slate-400 dark:text-slate-500">
            <p>Data diperbarui secara otomatis dari server DP3A Kota Banjarmasin.</p>
          </div>

        </div>
      </main>
    </div>
  );
}