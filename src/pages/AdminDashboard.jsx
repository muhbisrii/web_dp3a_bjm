import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { 
  LogOut, LayoutDashboard, FileText, User, Search, Clock, Settings, 
  CheckCircle, XCircle, Menu, MapPin, BarChart3, Trash2, ArrowLeft, MessageSquare, X, Send, Filter, Calendar, RefreshCcw, AlertTriangle, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- KOMPONEN ANIMASI MENGETIK (TYPEWRITER) ---
const TypewriterText = ({ text }) => {
  const [key, setKey] = useState(0); 

  useEffect(() => {
    const interval = setInterval(() => {
      setKey((prev) => prev + 1); 
    }, 10000); // Ulangi setiap 10 detik
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.5 },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <motion.div
      key={key} 
      className="text-sm font-bold text-white hidden sm:block leading-tight"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {text.split("").map((char, index) => (
        <motion.span key={index} variants={letterVariants}>
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
};

// --- KOMPONEN PARTIKEL JATUH (ADMIN STYLE) ---
const AdminParticles = () => {
  const particles = [
    { type: 'circle', left: '5%',  delay: 0, duration: 20 },
    { type: 'x',      left: '20%', delay: 5, duration: 25, rotate: 180 },
    { type: 'circle', left: '40%', delay: 2, duration: 22 },
    { type: 'x',      left: '60%', delay: 8, duration: 28, rotate: -180 },
    { type: 'circle', left: '80%', delay: 4, duration: 24 },
    { type: 'x',      left: '95%', delay: 1, duration: 30, rotate: 90 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ y: -50, opacity: 0, rotate: 0 }}
          animate={{ 
            y: 300, 
            opacity: [0, 0.5, 0.5, 0],
            rotate: p.rotate || 0 
          }} 
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
          className="absolute text-white font-bold flex items-center justify-center"
          style={{ left: p.left, top: -20 }}
        >
          {p.type === 'circle' ? (
            <div className="w-2 h-2 rounded-full bg-white" />
          ) : (
            <X size={14} className="text-white" />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default function AdminDashboard({ user, site, onRequestLogoutRedirect }) {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [laporan, setLaporan] = useState([]);
  const [stats, setStats] = useState({ total: 0, menunggu: 0, diproses: 0, selesai: 0, ditolak: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedLaporanId, setSelectedLaporanId] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [loadingResponse, setLoadingResponse] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null, data: null, title: '', message: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // --- ROUTING: sync activeTab <-> URL for admin pages ---
  const pathForTab = (t) => {
    switch (t) {
      case 'dashboard': return '/admin';
      case 'complaints': return '/admin/complaints';
      default: return '/admin';
    }
  };

  const navigateTo = (t, { replace = true } = {}) => {
    setActiveTab(t);
    setSidebarOpen(false);
    try {
      const p = pathForTab(t);
      if (replace) window.history.replaceState(null, '', p);
      else window.history.pushState(null, '', p);
    } catch (e) { /* ignore */ }
  };

  // initialize activeTab from pathname when component mounts
  useEffect(() => {
    try {
      const path = window.location.pathname.replace(/\/+$/, '');
      if (path === '/admin' || path === '/admin/dashboard') navigateTo('dashboard');
      else if (path === '/admin/complaints') navigateTo('complaints');
    } catch (e) {}
  }, []);

  useEffect(() => {
    const q = query(collection(db, "laporan"), orderBy("dibuatPada", "desc")); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLaporan(data);
      const counts = { total: 0, menunggu: 0, diproses: 0, selesai: 0, ditolak: 0 };
      data.forEach(item => {
        counts.total++;
        const status = item.status ? item.status.toLowerCase() : 'menunggu';
        if (status === 'menunggu') counts.menunggu++;
        else if (status === 'diproses') counts.diproses++;
        else if (status === 'selesai') counts.selesai++;
        else if (status === 'ditolak') counts.ditolak++;
      });
      setStats(counts);
    });
    return () => unsubscribe();
  }, []);

  const filteredLaporan = laporan.filter(item => {
    const matchesSearch = (item.judul?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                          (item.nama_pelapor?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                          (item.lokasi?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Semua' || item.status === filterStatus;
    let matchesYear = true, matchesMonth = true, matchesDate = true;
    if (item.tanggalKejadian) {
        const parts = item.tanggalKejadian.split('/');
        if (parts.length === 3) {
            const day = parts[0], month = parts[1], year = parts[2];
            if (filterYear !== '' && year !== filterYear) matchesYear = false;
            if (filterMonth !== '' && parseInt(month) !== parseInt(filterMonth)) matchesMonth = false;
            if (filterDate !== '') { const [fYear, fMonth, fDay] = filterDate.split('-'); if (item.tanggalKejadian !== `${fDay}/${fMonth}/${fYear}`) matchesDate = false; }
        }
    }
    return matchesSearch && matchesStatus && matchesYear && matchesMonth && matchesDate;
  });

  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const confirmLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Admin sign out error:', err);
    }
    try {
      if (typeof onRequestLogoutRedirect === 'function') onRequestLogoutRedirect();
      else window.history.replaceState(null, '', '/login');
    } catch (e) {}
  };

  const requestUpdateStatus = (id, newStatus) => {
    setConfirmModal({ isOpen: true, type: 'status', id: id, data: newStatus, title: 'Konfirmasi Ubah Status', message: `Apakah Anda yakin ingin mengubah status laporan ini menjadi "${newStatus}"?` });
  };
  const requestDelete = (id) => {
    setConfirmModal({ isOpen: true, type: 'delete', id: id, title: 'Hapus Laporan Permanen?', message: 'PERINGATAN: Tindakan ini tidak dapat dibatalkan. Data laporan akan hilang selamanya.' });
  };
  
  const handleConfirmAction = async () => {
    setIsProcessing(true);
    try {
        if (confirmModal.type === 'status') {
            await updateDoc(doc(db, "laporan", confirmModal.id), { status: confirmModal.data });
            setSuccessModal({ isOpen: true, title: 'Status Diperbarui!', message: `Status laporan berhasil diubah menjadi ${confirmModal.data}.` });
        } else if (confirmModal.type === 'delete') {
            await deleteDoc(doc(db, "laporan", confirmModal.id));
            setSuccessModal({ isOpen: true, title: 'Laporan Dihapus!', message: 'Data laporan telah berhasil dihapus dari database.' });
        }
        setConfirmModal({ isOpen: false, type: '', id: null, data: null, title: '', message: '' });
    } catch (err) { alert("Terjadi kesalahan: " + err.message); } finally { setIsProcessing(false); }
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    setLoadingResponse(true);
    try {
        await updateDoc(doc(db, "laporan", selectedLaporanId), { tanggapanPetugas: responseText, tanggapanPada: serverTimestamp(), status: 'Diproses' });
        setIsResponseModalOpen(false);
        setSuccessModal({ isOpen: true, title: 'Tanggapan Terkirim!', message: 'Respon Anda telah berhasil dikirim ke pelapor.' });
    } catch (err) { alert("Gagal mengirim tanggapan: " + err.message); } finally { setLoadingResponse(false); }
  };

  const openResponseModal = (id, currentResponse) => { setSelectedLaporanId(id); setResponseText(currentResponse || ''); setIsResponseModalOpen(true); };
  const resetFilters = () => { setFilterStatus('Semua'); setFilterYear(''); setFilterMonth(''); setFilterDate(''); setSearchTerm(''); };

  // --- ANIMASI VARIANTS ---
  const pageVariants = { 
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }, 
    exit: { opacity: 0, y: -15 } 
  };

  const cardFloatVariant = (delay) => ({
    animate: {
      y: [0, -6, 0], // Mengambang 6px
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay }
    }
  });

  const StatCard = ({ title, count, icon: Icon, colorBg, colorText, delay = 0 }) => (
    <motion.div 
      variants={cardFloatVariant(delay)}
      animate="animate"
      className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-white/50 flex items-center transform transition hover:scale-[1.02] hover:shadow-md"
    >
      <div className={`p-3 rounded-lg mr-4 ${colorBg} ${colorText} shadow-sm`}><Icon size={24} /></div>
      <div>
        <h4 className="text-2xl font-bold text-slate-800">{count}</h4>
        <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
      </div>
    </motion.div>
  );

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : 'menunggu';
    switch(s) { 
        case 'selesai': return 'bg-emerald-100 text-emerald-700 border border-emerald-200'; 
        case 'diproses': return 'bg-blue-100 text-blue-700 border border-blue-200'; 
        case 'ditolak': return 'bg-red-100 text-red-700 border border-red-200'; 
        default: return 'bg-amber-100 text-amber-700 border border-amber-200'; 
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-200 font-sans overflow-hidden relative">
      
      {/* BACKGROUND PATTERN */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      {/* SIDEBAR */}
      <aside className={`fixed md:relative z-50 w-64 h-full bg-gradient-to-b from-[#7C4DFF] to-[#5B3BFF] text-white flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} shadow-2xl`}>
        <div className="p-6 border-b border-slate-800">
           <div className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 backdrop-blur-sm">
             <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400 font-bold border border-slate-600"><User size={20} /></div>
             <div className="overflow-hidden"><p className="text-white text-sm font-semibold truncate">{user.name || "Petugas"}</p><p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Administrator</p></div>
           </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <p className="px-4 text-[10px] font-bold text-slate-200 uppercase tracking-wider mb-2">Menu Utama</p>
          <button onClick={() => navigateTo('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm' : 'bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm text-white/80 hover:bg-slate-700 hover:text-white'}`}><LayoutDashboard size={20} /><span className="text-sm font-medium">Ringkasan Statistik</span></button>
          <button onClick={() => navigateTo('complaints')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'complaints' ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm' : 'bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm text-white/80 hover:bg-slate-700 hover:text-white'}`}><FileText size={20} /><span className="text-sm font-medium">Data Pengaduan</span></button>
        </nav>
          <div className="p-4 border-t border-slate-800">
            <button onClick={handleLogoutClick} className="w-full flex items-center space-x-3 px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm text-[#FF3B3B] hover:bg-slate-700 transition-colors"><LogOut size={20} /><span className="text-sm font-medium">Keluar Sistem</span></button>
          </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"></div>}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <header className="h-16 md:h-20 bg-gradient-to-br from-[#7C4DFF] to-[#5B3BFF] border-b border-slate-800 flex items-center justify-between px-4 md:px-6 shadow-md z-10 text-white">
           <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden text-white p-2 bg-slate-800/50 rounded-md border border-slate-700/50 backdrop-blur-sm hover:bg-slate-700 transition-colors"><Menu/></button>
             <div className="flex items-center gap-3 bg-slate-800/50 p-2 md:p-3 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <img src={site?.logo || "/logo-dp3a.png"} alt="Logo" onError={(e) => e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Coat_of_arms_of_South_Kalimantan.svg/1200px-Coat_of_arms_of_South_Kalimantan.svg.png"} className="h-8 md:h-10 w-auto object-contain hidden sm:block" />
                <div className="pl-1">
                  <TypewriterText text={site?.name || "Dinas Pemberdayaan Perempuan dan Perlindungan Anak"} />
                  <h1 className="text-sm font-bold text-white sm:hidden">Admin Panel {site?.short || 'DP3A'}</h1>
                  <p className="text-xs text-slate-200 hidden sm:block mt-0.5">{site?.subtitle || 'Kota Banjarmasin'} - Panel Manajemen Petugas</p>
                </div>
             </div>
           </div>
           <div className="hidden md:flex items-center space-x-4">
             <div className="text-right bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 backdrop-blur-sm">
               <p className="text-xs text-white/80">Tanggal Hari Ini</p>
               <p className="text-sm font-bold text-white">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
             </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <AnimatePresence mode="wait">
          
          {/* === DASHBOARD TAB === */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 md:space-y-8">
               
               {/* HERO BOX ADMIN (HITAM) DENGAN PARTIKEL */}
               <div className="relative">
                 <div className="bg-gradient-to-br from-[#7C4DFF] to-[#5B3BFF] p-6 md:p-8 rounded-2xl shadow-lg border border-white/30 relative overflow-hidden text-white">
                   {/* Partikel Jatuh di dalam Box */}
                   <AdminParticles /> 
                   
                          <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-1 text-white">Ringkasan Statistik</h2>
                            <p className="text-white/90 text-sm font-medium">Pantau status laporan pengaduan masyarakat secara real-time.</p>
                          </div>
                 </div>
               </div>

               {/* GRID STATISTIK MENGAMBANG (RESPONSIF) */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                  <StatCard title="Total Laporan" count={stats.total} icon={BarChart3} colorBg="bg-slate-800" colorText="text-white" delay={0} />
                  <StatCard title="Menunggu" count={stats.menunggu} icon={Clock} colorBg="bg-amber-100" colorText="text-amber-600" delay={0.5} />
                  <StatCard title="Diproses" count={stats.diproses} icon={Settings} colorBg="bg-blue-100" colorText="text-blue-600" delay={1} />
                  <StatCard title="Selesai" count={stats.selesai} icon={CheckCircle} colorBg="bg-emerald-100" colorText="text-emerald-600" delay={1.5} />
                  <StatCard title="Ditolak" count={stats.ditolak} icon={XCircle} colorBg="bg-red-100" colorText="text-red-600" delay={2} />
               </div>

               {/* TABEL LAPORAN TERBARU */}
               <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/60 flex flex-col overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div><h3 className="font-bold text-slate-800 text-lg">Laporan Masuk Terbaru</h3><p className="text-sm text-slate-500">Pengaduan terakhir yang diterima sistem.</p></div>
                    <button onClick={() => navigateTo('complaints')} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors w-full md:w-auto justify-center">Lihat Semua Data <ArrowLeft className="ml-1 rotate-180" size={16}/></button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200"><tr><th className="px-4 md:px-6 py-3 md:py-4">Tanggal</th><th className="px-4 md:px-6 py-3 md:py-4">Pelapor</th><th className="px-4 md:px-6 py-3 md:py-4">Judul & Lokasi</th><th className="px-4 md:px-6 py-3 md:py-4">Status</th></tr></thead>
                       <tbody className="divide-y divide-slate-100">
                          {laporan.slice(0, 5).map((item) => (
                             <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                               <td className="px-4 md:px-6 py-3 md:py-4 text-slate-600 whitespace-nowrap"><div className="flex items-center"><Clock size={14} className="mr-2 text-slate-400"/> {item.tanggalKejadian}</div></td>
                               <td className="px-4 md:px-6 py-3 md:py-4"><div className="font-medium text-slate-800">{item.nama_pelapor || "Anonim"}</div><div className="text-xs text-slate-400 truncate max-w-[120px]">{item.emailPelapor}</div></td>
                               <td className="px-4 md:px-6 py-3 md:py-4 max-w-xs"><div className="font-bold text-slate-800 truncate">{item.judul}</div><div className="text-xs text-slate-500 flex items-center mt-1 truncate"><MapPin size={10} className="mr-1 flex-shrink-0"/> {item.lokasi}</div></td>
                               <td className="px-4 md:px-6 py-3 md:py-4"><span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase ${getStatusBadge(item.status)}`}>{item.status || "Menunggu"}</span></td>
                             </tr>
                          ))}
                          {laporan.length === 0 && <tr><td colSpan="4" className="text-center py-12 text-slate-400">Belum ada data pengaduan.</td></tr>}
                       </tbody>
                    </table>
                  </div>
               </div>
            </motion.div>
          )}

          {/* === DATA PENGADUAN TAB (PERBAIKAN: NO SWIPE) === */}
          {activeTab === 'complaints' && (
             <motion.div key="complaints" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <div className="flex flex-col gap-4">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                     <div><h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">Data Pengaduan Masuk</h2><p className="text-slate-500 text-sm">Kelola semua data laporan yang masuk dari masyarakat.</p></div>
                     <button onClick={resetFilters} className="text-sm text-red-500 hover:text-red-700 flex items-center font-bold bg-red-50/80 px-3 py-2 rounded-lg backdrop-blur-sm border border-red-100 w-full md:w-auto justify-center"><RefreshCcw size={14} className="mr-2"/> Reset Filter</button>
                   </div>
                   
                   {/* FILTER GRID RESPONSIF */}
                   <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div className="relative md:col-span-2"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="text" placeholder="Cari Judul, Pelapor..." className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
                      <div className="relative"><Filter className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none bg-white/50"><option value="Semua">Semua Status</option><option value="Menunggu">Menunggu</option><option value="Diproses">Diproses</option><option value="Selesai">Selesai</option><option value="Ditolak">Ditolak</option></select></div>
                      <div className="grid grid-cols-2 gap-2"><select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white/50"><option value="">Tahun</option><option value="2024">2024</option><option value="2025">2025</option><option value="2026">2026</option></select><select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white/50"><option value="">Bulan</option><option value="1">Januari</option><option value="2">Februari</option><option value="3">Maret</option><option value="4">April</option><option value="5">Mei</option><option value="6">Juni</option><option value="7">Juli</option><option value="8">Agustus</option><option value="9">September</option><option value="10">Oktober</option><option value="11">November</option><option value="12">Desember</option></select></div>
                      <div className="relative"><Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-500 bg-white/50"/></div>
                   </div>
                </div>

                {/* TABEL DATA PENGADUAN - PERBAIKAN FIT LAYAR */}
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/60 overflow-hidden">
                   <div className="overflow-x-auto">
                     <table className="w-full text-xs md:text-sm text-left">
                        <thead className="bg-slate-50/50 text-slate-500 uppercase font-bold border-b border-slate-200">
                           <tr>
                              <th className="p-2 text-center w-8">No</th>
                              <th className="p-2 w-24">Tanggal</th>
                              <th className="p-2 w-32">Pelapor</th>
                              <th className="p-2">Judul & Kategori</th>
                              <th className="p-2 w-32">Lokasi</th>
                              <th className="p-2 text-center w-24">Status</th>
                              <th className="p-2 text-center w-40">Aksi</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {filteredLaporan.map((item, index) => (
                              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                 <td className="p-2 text-center text-slate-500">{index + 1}</td>
                                 <td className="p-2 text-slate-600"><div className="flex flex-col"><div className="flex items-center"><Clock size={12} className="mr-1 text-slate-400"/> {item.tanggalKejadian}</div></div></td>
                                 <td className="p-2"><div className="font-medium text-slate-800 break-words">{item.nama_pelapor || "Anonim"}</div><div className="text-[10px] text-slate-400 truncate max-w-[100px]">{item.emailPelapor}</div></td>
                                 <td className="p-2">
                                    <div className="font-bold text-slate-800 line-clamp-2">{item.judul}</div>
                                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200 uppercase">{item.kategori}</span>
                                    {item.tanggapanPetugas && <div className="mt-1 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center w-fit"><MessageSquare size={10} className="mr-1"/> Ditanggapi</div>}
                                 </td>
                                 <td className="p-2 text-slate-600"><div className="flex items-start text-xs line-clamp-2"><MapPin size={12} className="mr-1 text-slate-400 flex-shrink-0 mt-0.5"/> {item.lokasi}</div></td>
                                 <td className="p-2 text-center"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase inline-block shadow-sm ${getStatusBadge(item.status)}`}>{item.status || "Menunggu"}</span></td>
                                 <td className="p-2 text-center">
                                    <div className="flex justify-center items-center space-x-1">
                                         <button onClick={() => openResponseModal(item.id, item.tanggapanPetugas)} title="Beri Tanggapan" className="w-7 h-7 flex items-center justify-center bg-amber-50 text-amber-600 rounded hover:bg-amber-500 hover:text-white transition-all"><MessageSquare size={12}/></button>
                                         <div className="w-px h-4 bg-slate-300"></div>
                                         <button onClick={() => requestUpdateStatus(item.id, 'Diproses')} title="Proses" className="w-7 h-7 flex items-center justify-center bg-blue-50 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition-all"><Settings size={12}/></button>
                                         <button onClick={() => requestUpdateStatus(item.id, 'Selesai')} title="Selesai" className="w-7 h-7 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle size={12}/></button>
                                         <button onClick={() => requestUpdateStatus(item.id, 'Ditolak')} title="Tolak" className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-600 rounded hover:bg-red-600 hover:text-white transition-all"><XCircle size={12}/></button>
                                         <div className="w-px h-4 bg-slate-300"></div>
                                         <button onClick={() => requestDelete(item.id)} title="Hapus" className="w-7 h-7 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 rounded transition-all"><Trash2 size={12}/></button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                           {filteredLaporan.length === 0 && <tr><td colSpan="7" className="text-center py-16 text-slate-400 bg-slate-50/50"><div className="flex flex-col items-center"><Search size={32} className="mb-2 opacity-50"/><p>Tidak ada data yang ditemukan.</p></div></td></tr>}
                        </tbody>
                     </table>
                   </div>
                </div>
             </motion.div>
          )}
          
          </AnimatePresence>
        </main>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {isResponseModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-slate-800">Beri Tanggapan</h3><button onClick={() => setIsResponseModalOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button></div>
                    <form onSubmit={handleSendResponse}>
                        <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-32 resize-none text-slate-700 mb-4" placeholder="Tulis tanggapan atau tindak lanjut..." required></textarea>
                        <div className="flex justify-end space-x-3"><button type="button" onClick={() => setIsResponseModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold">Batal</button><button type="submit" disabled={loadingResponse} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-md flex items-center">{loadingResponse ? 'Mengirim...' : <><Send size={16} className="mr-2"/> Kirim Tanggapan</>}</button></div>
                    </form>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
      {confirmModal.isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
                <div className={`p-6 text-center ${confirmModal.type === 'delete' || confirmModal.data === 'Ditolak' ? 'bg-red-50' : 'bg-blue-50'}`}>
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm ${confirmModal.type === 'delete' || confirmModal.data === 'Ditolak' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}><AlertTriangle size={32} strokeWidth={2.5} /></div>
                    <h3 className={`text-xl font-bold mb-1 ${confirmModal.type === 'delete' || confirmModal.data === 'Ditolak' ? 'text-red-700' : 'text-blue-700'}`}>{confirmModal.title}</h3>
                    <p className="text-slate-600 text-sm px-4">{confirmModal.message}</p>
                </div>
                <div className="p-4 bg-white flex space-x-3">
                    <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">Batal</button>
                    <button onClick={handleConfirmAction} disabled={isProcessing} className={`flex-1 py-3 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center ${confirmModal.type === 'delete' || confirmModal.data === 'Ditolak' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{isProcessing ? 'Memproses...' : 'Ya, Lanjutkan'}</button>
                </div>
            </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {successModal.isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden text-center p-8">
                <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4 shadow-sm"><Check size={40} strokeWidth={3} /></div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{successModal.title}</h3>
                <p className="text-slate-500 mb-6">{successModal.message}</p>
                <button onClick={() => setSuccessModal({ isOpen: false, message: '' })} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition">Tutup</button>
            </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {showLogoutConfirm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 text-center bg-red-50">
                    <div className="h-16 w-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><AlertTriangle size={32} strokeWidth={2.5} /></div>
                    <h3 className="text-xl font-bold text-red-700 mb-1">Konfirmasi Keluar</h3>
                    <p className="text-slate-600 text-sm px-4">Apakah Anda yakin ingin keluar dari sistem admin ini?</p>
                </div>
                <div className="p-4 bg-white flex space-x-3">
                    <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">Batal</button>
                    <button onClick={confirmLogout} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md transition">Ya, Keluar</button>
                </div>
            </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

    </div>
  );
}