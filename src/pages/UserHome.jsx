import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  signOut, 
  updateProfile, 
  updatePassword, 
  deleteUser, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from 'firebase/auth'; 
import { db, auth } from '../firebase';
import { 
  LogOut, User, Search, Phone, Home, FileText, Menu, ChevronRight, Send, X, MapPin, Clock, AlertCircle, Calendar, Tag, Copy, Settings, CheckCircle, FileBarChart, MessageSquare, Check, AlertTriangle, Lock, Trash2, Edit3, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- KOMPONEN ANIMASI MENGETIK ---
const TypewriterText = ({ text }) => {
  const [key, setKey] = useState(0); 
  useEffect(() => {
    const interval = setInterval(() => { setKey((prev) => prev + 1); }, 10000); 
    return () => clearInterval(interval);
  }, []);
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.03, delayChildren: 0.5 } } };
  const letterVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  return (
    <motion.div key={key} className="text-[10px] md:text-sm font-bold text-white block leading-tight max-w-[200px] md:max-w-none" variants={containerVariants} initial="hidden" animate="visible">
      {text.split("").map((char, index) => (<motion.span key={index} variants={letterVariants}>{char}</motion.span>))}
    </motion.div>
  );
};

// --- KOMPONEN PARTIKEL JATUH ---
  const HeroParticles = () => {
  const particles = [
    { type: 'circle', left: '5%',  delay: 0, duration: 15 },
    { type: 'line',   left: '15%', delay: 2, duration: 22, rotate: 360 },
    { type: 'x',      left: '25%', delay: 5, duration: 18, rotate: -180 }, 
    { type: 'circle', left: '35%', delay: 1, duration: 20 },
    { type: 'line',   left: '45%', delay: 7, duration: 25, rotate: 180 }, 
    { type: 'x',      left: '55%', delay: 3, duration: 16, rotate: 360 },
    { type: 'circle', left: '65%', delay: 6, duration: 19 },
    { type: 'line',   left: '75%', delay: 4, duration: 21, rotate: -360 },
    { type: 'x',      left: '85%', delay: 9, duration: 17, rotate: 180 },
    { type: 'circle', left: '95%', delay: 2, duration: 23 },
  ];
    return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p, i) => (
        <motion.div key={i} initial={{ y: -50, opacity: 0, rotate: 0 }} animate={{ y: 450, opacity: [0, 1, 1, 0], rotate: p.rotate || 0 }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }} className="absolute text-[#5B3BFF]/30 font-bold flex items-center justify-center" style={{ left: p.left, top: -30 }}>
          {p.type === 'circle' ? <div className="w-3 h-3 rounded-full bg-[#5B3BFF]/30" /> : p.type === 'line' ? <div className="w-[2px] h-7 bg-[#5B3BFF]/30 rounded-full" /> : <X size={18} />}
        </motion.div>
      ))}
    </div>
  );
};

export default function UserHome({ user, site, onRequestLogoutRedirect }) {
  const [view, setView] = useState('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, menunggu: 0, diproses: 0, selesai: 0 });
  const [laporanUser, setLaporanUser] = useState([]); 
  const [form, setForm] = useState({ judul: '', kategori: 'Kekerasan Fisik', lokasi: '', kronologi: '', tanggal: '' });
  
  // States Lacak & Modal
  const [searchToken, setSearchToken] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [successModal, setSuccessModal] = useState({ isOpen: false, token: '' });
  const [isCopied, setIsCopied] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteLaporanConfirm, setShowDeleteLaporanConfirm] = useState(false);
  const [laporanToDelete, setLaporanToDelete] = useState(null);
  const [detailLaporan, setDetailLaporan] = useState({ isOpen: false, data: null });

  // States Profile
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', nik: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [deletePassword, setDeletePassword] = useState(''); // State password untuk hapus akun
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // State loading hapus akun

  // Notifikasi In-App
  const [profileStatus, setProfileStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', phone: user.phone || '', nik: user.nik || '' });
    }
  }, [user]);

  // --- ROUTING: sync view <-> URL for user pages ---
  const pathForView = (v) => {
    switch (v) {
      case 'home': return '/dashboard';
      case 'profile': return '/profile';
      case 'form': return '/form';
      case 'history': return '/history';
      case 'tracking': return '/tracking';
      case 'contact': return '/contact';
      default: return '/dashboard';
    }
  };

  const navigateTo = (v, { replace = true } = {}) => {
    setView(v);
    try {
      const path = pathForView(v);
      if (replace) window.history.replaceState(null, '', path);
      else window.history.pushState(null, '', path);
    } catch (e) { /* ignore */ }
  };

  // initialize view from pathname when component mounts (user pages)
  useEffect(() => {
    try {
      const path = window.location.pathname.replace(/\/+$/, '');
      if (path === '/dashboard' || path === '/home') navigateTo('home');
      else if (path === '/profile') navigateTo('profile');
      else if (path === '/form') navigateTo('form');
      else if (path === '/history') navigateTo('history');
      else if (path === '/tracking') navigateTo('tracking');
      else if (path === '/contact') navigateTo('contact');
    } catch (e) {}
  }, []);

  useEffect(() => {
     if (!user || !user.uid) return;
     const q = query(collection(db, "laporan"), where("userId", "==", user.uid));
     const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => (b.dibuatPada?.seconds || 0) - (a.dibuatPada?.seconds || 0));
        setLaporanUser(data);
        const total = snapshot.size;
        const menunggu = snapshot.docs.filter(d => d.data().status === 'Menunggu').length;
        const diproses = snapshot.docs.filter(d => d.data().status === 'Diproses').length;
        const selesai = snapshot.docs.filter(d => d.data().status === 'Selesai').length;
        setStats({ total, menunggu, diproses, selesai });
     });
     return () => unsubscribe();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoadingProfile(true);
    setProfileStatus(null);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { name: profileForm.name, phone: profileForm.phone, nik: profileForm.nik });
      if (auth.currentUser && profileForm.name !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: profileForm.name });
      }
      setProfileStatus({ type: 'success', message: 'Profil berhasil diperbarui!' });
      setTimeout(() => setProfileStatus(null), 3000);
    } catch (error) { setProfileStatus({ type: 'error', message: "Gagal: " + error.message }); } 
    finally { setIsLoadingProfile(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Konfirmasi password baru tidak cocok!' }); return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password baru minimal 6 karakter.' }); return;
    }
    setIsLoadingPassword(true);
    const currentUser = auth.currentUser;
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, passwordForm.newPassword);
      setPasswordStatus({ type: 'success', message: 'Password berhasil diubah!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordStatus(null), 3000);
    } catch (error) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setPasswordStatus({ type: 'error', message: 'Password lama salah. Silakan periksa kembali.' });
      } else { setPasswordStatus({ type: 'error', message: 'Gagal mengubah password: ' + error.message }); }
    } finally { setIsLoadingPassword(false); }
  };

  // --- LOGIKA HAPUS AKUN YANG BENAR (RE-AUTH + DELETE FIRESTORE + DELETE AUTH) ---
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
        alert("Mohon masukkan password Anda untuk konfirmasi.");
        return;
    }
    setIsDeleting(true);
    const currentUser = auth.currentUser;

    try {
        // 1. RE-AUTHENTICATE (Wajib agar Firebase mengizinkan hapus akun)
        const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
        await reauthenticateWithCredential(currentUser, credential);

        // 2. HAPUS DATA DI FIRESTORE
        await deleteDoc(doc(db, "users", user.uid));
        
        // (Opsional) Hapus juga laporan user jika ingin benar-benar bersih
        // const q = query(collection(db, "laporan"), where("userId", "==", user.uid));
        // const snapshot = await getDocs(q);
        // snapshot.forEach(async (doc) => await deleteDoc(doc.ref));

        // 3. HAPUS USER DARI AUTHENTICATION
        await deleteUser(currentUser);
        
        // Tidak perlu alert, karena App.jsx akan mendeteksi user null dan redirect ke landing page

    } catch (error) {
        setIsDeleting(false);
        console.error(error);
        if (error.code === 'auth/wrong-password') {
            alert("Password salah. Gagal menghapus akun.");
        } else {
            alert("Gagal menghapus akun: " + error.message);
        }
    }
  };

  const kirimLaporan = async (e) => {
    e.preventDefault();
    try {
      if(!form.tanggal) { alert("Mohon isi tanggal!"); return; }
      const [y, m, d] = form.tanggal.split('-');
      const docRef = await addDoc(collection(db, "laporan"), {
        userId: user.uid, emailPelapor: user.email, tanggalKejadian: `${d}/${m}/${y}`, ...form, status: "Menunggu", nama_pelapor: user.name || user.email, dibuatPada: serverTimestamp(), 
      });
      setSuccessModal({ isOpen: true, token: docRef.id });
      setForm({ judul: '', kategori: 'Kekerasan Fisik', lokasi: '', kronologi: '', tanggal: '' });
    } catch (err) { alert('Gagal: ' + err.message); }
  };

  const closeSuccessModal = () => { setSuccessModal({ isOpen: false, token: '' }); setIsCopied(false); navigateTo('history'); };
  const handleCopyToken = () => { navigator.clipboard.writeText(successModal.token); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); };
  
  const handleLacak = async (e) => {
    e.preventDefault();
    if(!searchToken) return;
    setTrackLoading(true); setTrackError(''); setTrackResult(null);
    try {
        const docRef = doc(db, "laporan", searchToken.trim());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) { setTrackResult({ id: docSnap.id, ...docSnap.data() }); } 
        else { setTrackError("Token tidak ditemukan. Mohon periksa kembali."); }
    } catch (err) { setTrackError("Terjadi kesalahan: " + err.message); } 
    finally { setTrackLoading(false); }
  };

  const getStatusColor = (status) => {
    const s = status ? status.toLowerCase() : 'menunggu';
    switch(s) {
        case 'selesai': return 'bg-[#F3EDFF] text-[#5B3BFF] border-[#E1D8FF]';
        case 'diproses': return 'bg-[#F3EDFF] text-[#5B3BFF] border-[#E1D8FF]';
        case 'ditolak': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const confirmLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error signing out:', err);
    }
    // After sign out, request App to show the auth/login page (if provided)
    try {
      if (typeof onRequestLogoutRedirect === 'function') {
        onRequestLogoutRedirect();
      } else {
        window.history.replaceState(null, '', '/login');
      }
    } catch (e) { /* ignore */ }
  };

  const openDetailLaporan = (item) => { setDetailLaporan({ isOpen: true, data: item }); };
  const closeDetailLaporan = () => { setDetailLaporan({ isOpen: false, data: null }); };

  const requestDeleteLaporan = (id) => { setLaporanToDelete(id); setShowDeleteLaporanConfirm(true); };
  const cancelDeleteLaporan = () => { setLaporanToDelete(null); setShowDeleteLaporanConfirm(false); };

  const confirmDeleteLaporan = async () => {
    if (!laporanToDelete) return;
    try {
      await deleteDoc(doc(db, "laporan", laporanToDelete));
      setShowDeleteLaporanConfirm(false);
      setLaporanToDelete(null);
    } catch (err) {
      alert('Gagal menghapus pengaduan: ' + err.message);
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }) => {
    const isActive = view === id;
    return (
    <button onClick={() => {navigateTo(id); setSidebarOpen(false);}} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm' : 'bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm text-white/80 hover:bg-slate-700 hover:text-white'}`}>
      <Icon size={20} /> <span className="text-sm font-medium">{label}</span>
    </button>
  )};

  const pageVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }, exit: { opacity: 0, y: -20, transition: { duration: 0.3 } } };
  const floatingVariant = { animate: { y: [0, -10, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } } };
  const cardFloatVariant = (delay) => ({ animate: { y: [0, -8, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay } } });

  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-[#F3EDFF] to-[#F7F2FF] font-sans overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <aside className={`fixed md:relative z-30 w-64 h-full bg-gradient-to-b from-[#7C4DFF] to-[#5B3BFF] text-white flex flex-col transition-transform duration-300 shadow-xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-800">
           <div onClick={() => { navigateTo('profile'); setSidebarOpen(false); }} className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 backdrop-blur-sm cursor-pointer hover:bg-slate-700 transition-colors group">
              <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold border border-slate-600 group-hover:border-white transition-colors"><User size={20} /></div>
              <div className="overflow-hidden"><p className="text-white text-sm font-semibold truncate group-hover:text-white/90 transition-colors">{user.name}</p><p className="text-[10px] text-white/80 font-medium uppercase tracking-wider">Edit Profil</p></div>
           </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <p className="px-4 text-[10px] font-bold text-slate-200 uppercase tracking-wider mb-2">Menu Utama</p>
            <SidebarItem id="home" icon={Home} label="Beranda" />
            <SidebarItem id="form" icon={FileText} label="Buat Pengaduan" />
            <SidebarItem id="history" icon={Clock} label="Pengaduan Saya" />
            <SidebarItem id="tracking" icon={Search} label="Lacak Pengaduan" />
            <SidebarItem id="contact" icon={Phone} label="Kontak Dinas" />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogoutClick} className="w-full flex items-center space-x-3 px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-700 transition-colors ring-1 ring-white/5 text-[#FF3B3B]"><LogOut size={20} /><span className="text-sm font-medium">Keluar Akun</span></button>
        </div>
      </aside>

      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm"></div>}

      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
           <header className="h-16 md:h-20 bg-gradient-to-br from-[#7C4DFF] to-[#5B3BFF] border-b border-slate-800 flex items-center justify-between px-4 md:px-6 shadow-md z-10 text-white">
           <div className="flex items-center gap-3">
             <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden text-white p-2 bg-slate-800/50 rounded-md border border-slate-700/50 backdrop-blur-sm hover:bg-slate-700 transition-colors"><Menu size={24}/></button>
             <div className="flex items-center gap-2 md:gap-3 bg-slate-800/50 p-2 md:p-3 rounded-xl border border-slate-700/50 backdrop-blur-sm">
             <img src={site?.logo || "/logo-dp3a.png"} alt="Logo" onError={(e) => e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Coat_of_arms_of_South_Kalimantan.svg/1200px-Coat_of_arms_of_South_Kalimantan.svg.png"} className="h-8 md:h-10 w-auto object-contain" />
             <div className="pl-1"><TypewriterText text={site?.name || "Dinas Pemberdayaan Perempuan dan Perlindungan Anak"} /><p className="text-[10px] md:text-xs text-slate-200 mt-0.5">{site?.subtitle || "Kota Banjarmasin"}</p></div>
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
          <div className="max-w-5xl mx-auto pb-20 md:pb-10">
            <AnimatePresence mode="wait">
            
            {view === 'home' && (
              <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 md:space-y-8">
                  <motion.div variants={floatingVariant} animate="animate" className="relative bg-gradient-to-br from-[#7C4DFF] to-[#5B3BFF] rounded-2xl md:rounded-3xl p-6 md:p-12 text-white shadow-xl overflow-hidden">
                    <HeroParticles />
                    <div className="absolute top-0 right-0 w-40 md:w-64 h-40 md:h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10 max-w-3xl">
                      <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 flex items-center gap-2">Halo, {user.name} <motion.span style={{ originX: 0.7, originY: 0.7 }} animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }} className="inline-block">👋</motion.span></h2>
                      <p className="text-white/90 text-sm md:text-lg mb-6 md:mb-8 leading-relaxed">Suara Anda berharga. Kami hadir untuk mendampingi dan memastikan setiap laporan ditindaklanjuti dengan aman.</p>
                      <button onClick={() => navigateTo('form')} className="w-full md:w-auto px-6 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-700 text-white font-bold shadow-lg transition-colors flex items-center justify-center">Buat Laporan Baru <ChevronRight className="ml-2 w-5 h-5"/></button>
                    </div>
                 </motion.div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                      {[{ label: 'Total Laporan', val: stats.total, color: 'text-slate-800', bgIcon: 'bg-slate-100', icon: FileBarChart, delay: 0 },
                        { label: 'Menunggu', val: stats.menunggu, color: 'text-amber-600', bgIcon: 'bg-amber-50', icon: Clock, delay: 1 },
                        { label: 'Diproses', val: stats.diproses, color: 'text-[#5B3BFF]', bgIcon: 'bg-[#F3EDFF]', icon: Settings, delay: 0.5 },
                        { label: 'Selesai', val: stats.selesai, color: 'text-[#5B3BFF]', bgIcon: 'bg-[#F3EDFF]', icon: CheckCircle, delay: 1.5 }
                      ].map((item, idx) => (
                        <motion.div key={idx} variants={cardFloatVariant(item.delay)} animate="animate" className="bg-white/80 backdrop-blur-md p-4 md:p-5 rounded-2xl shadow-sm border border-white/60 flex flex-col">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wide ${item.color.replace('text-', 'text-opacity-70 ')}`}>{item.label}</span>
                            <div className={`p-1.5 md:p-2 ${item.bgIcon} rounded-lg ${item.color}`}><item.icon size={16}/></div>
                          </div>
                          <span className={`text-2xl md:text-3xl font-bold ${item.color} mt-auto`}>{item.val}</span>
                        </motion.div>
                      ))}
                 </div>
              </motion.div>
            )}

            {view === 'profile' && (
                <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Pengaturan Akun</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                <div className="p-2 bg-[#F3EDFF] rounded-lg text-[#5B3BFF]"><Edit3 size={20}/></div>
                                <h3 className="text-lg font-bold text-slate-700">Edit Informasi Pribadi</h3>
                            </div>
                            
                            {profileStatus && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl mb-4 text-sm font-medium flex items-center ${profileStatus.type === 'success' ? 'bg-[#F3EDFF] text-[#5B3BFF] border border-[#E1D8FF]' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                                    {profileStatus.type === 'success' ? <CheckCircle size={18} className="mr-2"/> : <AlertCircle size={18} className="mr-2"/>}
                                    {profileStatus.message}
                                </motion.div>
                            )}

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div><label className="text-xs font-bold text-slate-500 uppercase">Nama Lengkap</label><input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="w-full mt-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#5B3BFF] outline-none text-sm bg-white/50" required /></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase">NIK</label><input type="text" value={profileForm.nik} onChange={(e) => setProfileForm({...profileForm, nik: e.target.value})} className="w-full mt-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm bg-white/50" placeholder="Nomor Induk Kependudukan" /></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase">No. Handphone</label><input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} className="w-full mt-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm bg-white/50" placeholder="08..." /></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase">Email (Tidak dapat diubah)</label><input type="email" value={user.email} disabled className="w-full mt-1 p-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 text-sm cursor-not-allowed" /></div>
                                <div className="pt-4 flex justify-end">
                                    <button type="submit" disabled={isLoadingProfile} className="px-6 py-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm text-white font-bold shadow-md transition text-sm flex items-center">{isLoadingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                                </div>
                            </form>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                    <div className="p-2 bg-[#F3EDFF] rounded-lg text-[#5B3BFF]"><Lock size={20}/></div>
                                    <h3 className="text-lg font-bold text-slate-700">Keamanan Akun</h3>
                                </div>

                                {passwordStatus && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl mb-4 text-sm font-medium flex items-center ${passwordStatus.type === 'success' ? 'bg-[#F3EDFF] text-[#5B3BFF] border border-[#E1D8FF]' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                                        {passwordStatus.type === 'success' ? <CheckCircle size={18} className="mr-2"/> : <AlertCircle size={18} className="mr-2"/>}
                                        {passwordStatus.message}
                                    </motion.div>
                                )}

                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div><label className="text-xs font-bold text-slate-500 uppercase">Password Lama</label><input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full mt-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#5B3BFF] outline-none text-sm bg-white/50" placeholder="Masukkan password saat ini" required /></div>
                                    <div><label className="text-xs font-bold text-slate-500 uppercase">Password Baru</label><input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full mt-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm bg-white/50" placeholder="Minimal 6 karakter" required /></div>
                                    <div><label className="text-xs font-bold text-slate-500 uppercase">Konfirmasi Password Baru</label><input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full mt-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm bg-white/50" placeholder="Ulangi password baru" required /></div>
                                    <div className="pt-4 flex justify-end">
                                        <button type="submit" disabled={isLoadingPassword} className="px-6 py-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm text-white font-bold shadow-md transition text-sm flex items-center">{isLoadingPassword ? 'Memproses...' : 'Ubah Password'}</button>
                                    </div>
                                </form>
                            </div>
                            <div className="bg-red-50/80 backdrop-blur-md rounded-2xl shadow-sm border border-red-100 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-red-100 rounded-lg text-red-600"><Shield size={20}/></div>
                                    <h3 className="text-lg font-bold text-red-800">Zona Bahaya</h3>
                                </div>
                                <p className="text-sm text-red-600 mb-6">Menghapus akun Anda bersifat permanen dan tidak dapat dibatalkan.</p>
                                <button onClick={() => setShowDeleteConfirm(true)} className="w-full py-3 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm text-red-600 font-bold hover:bg-slate-700 hover:text-white transition shadow-sm flex items-center justify-center"><Trash2 size={18} className="mr-2"/> Hapus Akun Permanen</button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* VIEWS LAIN (FORM, HISTORY, TRACKING, CONTACT) */}
            {view === 'form' && (
               <motion.div key="form" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 overflow-hidden">
                  <div className="bg-slate-50/50 px-6 py-4 md:px-8 md:py-6 border-b border-slate-200"><h2 className="text-xl md:text-2xl font-bold text-slate-800">Formulir Pengaduan</h2><p className="text-slate-500 text-xs md:text-sm mt-1">Isi detail kejadian dengan sebenar-benarnya.</p></div>
                  <div className="p-6 md:p-8">
                    <form onSubmit={kirimLaporan} className="space-y-5">
                      <div className="space-y-2"><label className="text-sm font-bold text-slate-700">Judul Laporan</label><input value={form.judul} onChange={(e)=>setForm({...form, judul:e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5B3BFF] outline-none transition-all bg-white/50 text-sm" placeholder="Contoh: Kekerasan di Sekolah..." required/></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2"><label className="text-sm font-bold text-slate-700">Kategori</label><select value={form.kategori} onChange={(e)=>setForm({...form, kategori:e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5B3BFF] outline-none bg-white/50 text-sm"><option>Kekerasan Anak</option><option>Kekerasan Perempuan</option><option>Kekerasan Remaja</option><option>Masalah Keluarga</option><option>Lainnya</option></select></div>
                        <div className="space-y-2"><label className="text-sm font-bold text-slate-700">Tanggal Kejadian</label><input type="date" value={form.tanggal} onChange={(e)=>setForm({...form, tanggal:e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5B3BFF] outline-none bg-white/50 text-sm" required/></div>
                      </div>
                      <div className="space-y-2"><label className="text-sm font-bold text-slate-700">Lokasi Kejadian</label><input value={form.lokasi} onChange={(e)=>setForm({...form, lokasi:e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5B3BFF] outline-none bg-white/50 text-sm" placeholder="Nama Jalan, Gedung, dll..." required/></div>
                      <div className="space-y-2"><label className="text-sm font-bold text-slate-700">Kronologi Lengkap</label><textarea value={form.kronologi} onChange={(e)=>setForm({...form, kronologi:e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5B3BFF] outline-none h-32 resize-none bg-white/50 text-sm" placeholder="Ceritakan detail kejadian..." required></textarea></div>
                      <div className="pt-4 flex flex-col md:flex-row items-center justify-end gap-3">
                        <button type="button" onClick={() => navigateTo('home')} className="w-full md:w-auto px-6 py-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-sm text-white font-bold hover:bg-slate-700 transition text-sm">Batal</button>
                        <button type="submit" className="w-full md:w-auto px-6 py-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-sm text-white font-bold shadow-md transition flex items-center justify-center text-sm"><Send size={18} className="mr-2"/> Kirim Laporan</button>
                      </div>
                    </form>
                  </div>
               </motion.div>
            )}
            
            {view === 'history' && (
               <motion.div key="history" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2"><div><h2 className="text-2xl font-bold text-slate-800">Pengaduan Saya</h2><p className="text-slate-500 text-sm">Daftar laporan yang pernah Anda kirimkan.</p></div><button onClick={() => navigateTo('form')} className="w-full md:w-auto px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-sm hover:bg-slate-700 text-white text-sm font-bold transition shadow-sm flex items-center justify-center"><FileText size={16} className="mr-2"/> Buat Baru</button></div>
                            {laporanUser.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-20 bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm text-center px-4"><div className="bg-slate-100 p-6 rounded-full mb-4"><Search size={40} className="text-slate-400"/></div><h3 className="text-xl font-bold text-slate-700">Belum Ada Riwayat</h3><p className="text-slate-500 mt-2 text-sm">Anda belum mengirimkan pengaduan apapun.</p><button onClick={() => navigateTo('form')} className="mt-6 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm text-[#5B3BFF] font-bold hover:bg-slate-700 transition text-sm">Buat Pengaduan Pertama</button></div>
                 ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {laporanUser.map((item) => (
                            <div key={item.id} className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.status === 'Selesai' ? 'bg-[#5B3BFF]' : item.status === 'Diproses' ? 'bg-[#5B3BFF]' : item.status === 'Ditolak' ? 'bg-red-500' : 'bg-amber-400'}`}></div>
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase border ${getStatusColor(item.status)}`}>{item.status || "Menunggu"}</span>
                                        <span className="text-[10px] md:text-xs text-slate-400 flex items-center"><Calendar size={12} className="mr-1"/> {item.dibuatPada?.seconds ? new Date(item.dibuatPada.seconds * 1000).toLocaleDateString('id-ID') : 'Baru saja'}</span>
                                        <span className="text-[10px] md:text-xs text-slate-400 flex items-center bg-slate-100 px-2 py-0.5 rounded cursor-pointer hover:bg-slate-200 ml-auto md:ml-0" onClick={() => {navigator.clipboard.writeText(item.id); alert('Token disalin!')}} title="Salin Token"><Copy size={10} className="mr-1"/> ID: {item.id.substring(0,8)}...</span>
                                    </div>
                                    <h3 className="text-base md:text-lg font-bold text-slate-800 leading-tight">{item.judul}</h3>
                                    <div className="text-xs md:text-sm text-slate-500 space-y-1"><div className="flex items-center"><Tag size={14} className="mr-2 flex-shrink-0"/> {item.kategori}</div><div className="flex items-center"><MapPin size={14} className="mr-2 flex-shrink-0"/> {item.lokasi}</div></div>
                                    {item.tanggapanPetugas && (
                                        <div className="mt-2 bg-[#F3EDFF] p-3 rounded-xl border border-[#E1D8FF]">
                                            <p className="text-[10px] font-bold text-[#1B6BFF] flex items-center mb-1"><MessageSquare size={10} className="mr-1"/> TANGGAPAN PETUGAS</p>
                                            <p className="text-xs md:text-sm text-slate-700">{item.tanggapanPetugas}</p>
                                        </div>
                                    )}
                                    <div className="mt-4 flex items-center gap-3">
                                      <button onClick={() => openDetailLaporan(item)} className="px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 text-white text-sm font-medium hover:bg-slate-700 transition">Detail</button>
                                      <button onClick={() => requestDeleteLaporan(item.id)} className="px-3 py-2 bg-red-50 rounded-lg border border-red-100 text-red-600 text-sm font-medium hover:bg-red-100 transition flex items-center"><Trash2 size={14} className="mr-2"/> Tarik Pengaduan</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
               </motion.div>
            )}

            {view === 'tracking' && (
               <motion.div key="tracking" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-xl mx-auto">
                  <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-lg border border-white/60 text-center">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Lacak Status Pengaduan</h2>
                    <p className="text-slate-500 mb-6 text-sm md:text-base">Masukkan Token ID pengaduan Anda untuk melihat status terkini.</p>
                    <form onSubmit={handleLacak} className="mb-6"><div className="relative"><input type="text" value={searchToken} onChange={(e) => setSearchToken(e.target.value)} placeholder="Tempel Token ID..." className="w-full p-3 md:p-4 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#5B3BFF] outline-none text-center font-mono text-base md:text-lg bg-white/50" required /><Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"/></div><button type="submit" disabled={trackLoading} className="w-full mt-4 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm text-white font-bold transition shadow-md text-sm md:text-base">{trackLoading ? 'Mencari...' : 'Lacak Sekarang'}</button></form>
                    {trackError && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center justify-center text-sm"><AlertCircle size={18} className="mr-2"/> {trackError}</div>}
                    {trackResult && (
                        <div className="mt-6 text-left bg-slate-50/80 p-5 rounded-2xl border border-slate-200 animate-fade-in">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4"><div><p className="text-[10px] text-slate-500 font-bold uppercase">Judul Laporan</p><h3 className="text-base md:text-lg font-bold text-slate-800">{trackResult.judul}</h3></div><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(trackResult.status)}`}>{trackResult.status || "Menunggu"}</span></div>
                            <div className="space-y-3 text-xs md:text-sm text-slate-600 mb-4">
                                <div className="flex justify-between border-b border-slate-200 pb-2"><span>Tanggal:</span><span className="font-semibold">{trackResult.tanggalKejadian}</span></div>
                                <div className="flex justify-between border-b border-slate-200 pb-2"><span>Kategori:</span><span className="font-semibold">{trackResult.kategori}</span></div>
                                <div className="flex justify-between border-b border-slate-200 pb-2"><span>Lokasi:</span><span className="font-semibold">{trackResult.lokasi}</span></div>
                            </div>
                            {trackResult.tanggapanPetugas && (
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                            <p className="text-[10px] font-bold text-[#5B3BFF] flex items-center mb-1"><MessageSquare size={10} className="mr-1"/> TANGGAPAN PETUGAS</p>
                                    <p className="text-xs md:text-sm text-slate-700">{trackResult.tanggapanPetugas}</p>
                                </div>
                            )}
                            <div className="mt-4 pt-4 text-center"><button onClick={() => {setSearchToken(''); setTrackResult(null);}} className="text-xs md:text-sm px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-sm text-white font-medium hover:bg-slate-700">Cari Laporan Lain</button></div>
                        </div>
                    )}
                  </div>
               </motion.div>
            )}
            
            {view === 'contact' && (
               <motion.div key="contact" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="bg-white/80 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-lg border border-white/60">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Kontak Kami</h2><p className="text-slate-500 mb-6 pb-4 border-b border-slate-100 text-sm md:text-base">Informasi kontak Dinas Pemberdayaan Perempuan dan Perlindungan Anak Kota Banjarmasin.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6">
                    <div className="space-y-3"><h3 className="font-bold text-slate-800 text-base md:text-lg flex items-center"><MapPin className="w-5 h-5 mr-2 text-slate-500"/> Alamat Kantor</h3><div className="text-slate-600 text-sm leading-relaxed pl-7"><p>Jl. Sultan Adam No. 18</p><p>Banjarmasin, Kalimantan Selatan 70122</p></div></div>
                    <div className="space-y-3"><h3 className="font-bold text-slate-800 text-base md:text-lg flex items-center"><Phone className="w-5 h-5 mr-2 text-slate-500"/> Kontak</h3><div className="space-y-2 pl-7 text-sm"><div className="flex flex-col md:flex-row md:items-center text-slate-600"><span className="w-20 font-medium text-slate-500">Telepon:</span><span>(0511) 3307-788</span></div><div className="flex flex-col md:flex-row md:items-center text-slate-600"><span className="w-20 font-medium text-slate-500">Email:</span><span>dpppa@banjarmasinkota.go.id</span></div></div></div></div>
                  <div className="bg-red-50 rounded-lg p-5 border border-red-100"><h3 className="font-bold text-red-700 mb-2 flex items-center text-sm md:text-base"><AlertCircle className="w-5 h-5 mr-2"/> Hotline Darurat (24 Jam)</h3><p className="text-red-600 text-lg md:text-xl font-bold pl-7">(0511) 3307-999</p></div>
               </motion.div>
            )}

            </AnimatePresence>
          </div>
        </main>
      </div>

      <AnimatePresence>
      {successModal.isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-sm md:max-w-md rounded-3xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-br from-[#7C4DFF] to-[#5B3BFF] p-6 text-center flex flex-col items-center justify-center">
                    <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="h-16 w-16 md:h-20 md:w-20 bg-[#1B6BFF] rounded-full flex items-center justify-center text-white shadow-lg mb-4"><Check size={40} strokeWidth={4} /></motion.div>
                    <h3 className="text-xl md:text-2xl font-bold text-white">Laporan Terkirim!</h3>
                    <p className="text-slate-400 text-xs md:text-sm mt-1">Terima kasih atas laporan Anda.</p>
                </div>
                <div className="p-6 md:p-8">
                    <p className="text-slate-500 text-center mb-4 text-xs md:text-sm">Simpan Token ID ini untuk melacak status laporan Anda.</p>
                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 md:p-4 flex items-center justify-between mb-6">
                        <span className="font-mono text-base md:text-lg font-bold text-slate-700 tracking-wider truncate mr-2">{successModal.token}</span>
                        <button onClick={handleCopyToken} className={`p-2 rounded-lg transition-all flex items-center flex-shrink-0 ${isCopied ? 'bg-[#F3EDFF] text-[#5B3BFF]' : 'bg-slate-800/50 text-white hover:bg-slate-700 shadow-sm'}`}>{isCopied ? <Check size={18} /> : <Copy size={18} />}</button>
                    </div>
                    <button onClick={closeSuccessModal} className="w-full py-3 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm text-white font-bold hover:bg-slate-700 transition shadow-lg text-sm">Tutup & Lihat Riwayat</button>
                </div>
            </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

        <AnimatePresence>
        {detailLaporan.isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-[#7C4DFF] to-[#5B3BFF] text-white">
              <h3 className="text-xl font-bold">Detail Pengaduan</h3>
              <p className="text-sm text-white/80 mt-1">ID: {detailLaporan.data?.id}</p>
            </div>
            <div className="p-6 space-y-3">
              <h4 className="text-lg font-bold text-slate-800">{detailLaporan.data?.judul}</h4>
              <div className="text-sm text-slate-600 space-y-2">
                <div><strong>Kategori:</strong> {detailLaporan.data?.kategori}</div>
                <div><strong>Tanggal Kejadian:</strong> {detailLaporan.data?.tanggalKejadian || detailLaporan.data?.tanggal}</div>
                <div><strong>Lokasi:</strong> {detailLaporan.data?.lokasi}</div>
                <div><strong>Kronologi:</strong><div className="mt-1 p-3 bg-slate-50 rounded-md border border-slate-100 text-sm text-slate-700">{detailLaporan.data?.kronologi}</div></div>
                {detailLaporan.data?.tanggapanPetugas && (<div className="mt-2 bg-[#F3EDFF] p-3 rounded-xl border border-[#E1D8FF]"><p className="text-xs font-bold text-[#1B6BFF]">Tanggapan Petugas</p><p className="text-sm text-slate-700 mt-1">{detailLaporan.data?.tanggapanPetugas}</p></div>)}
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button onClick={closeDetailLaporan} className="px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 text-white font-medium">Tutup</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
        </AnimatePresence>

        <AnimatePresence>
        {showDeleteLaporanConfirm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-900/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center bg-red-50">
              <div className="h-14 w-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm"><Trash2 size={28} strokeWidth={2.5} /></div>
              <h3 className="text-lg font-bold text-red-700 mb-1">Tarik Pengaduan?</h3>
              <p className="text-slate-600 text-xs md:text-sm px-2">Apakah Anda yakin ingin menarik pengaduan ini? Tindakan ini akan menghapus laporan dari sistem.</p>
            </div>
            <div className="p-4 bg-white flex flex-col gap-3">
              <button onClick={confirmDeleteLaporan} className="w-full py-2.5 bg-red-50 rounded-xl border border-red-100 text-red-600 font-bold hover:bg-red-100">Ya, Tarik Pengaduan</button>
              <button onClick={cancelDeleteLaporan} className="w-full py-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50 text-white font-bold hover:bg-slate-700">Batal</button>
            </div>
          </motion.div>
        </motion.div>
        )}
        </AnimatePresence>

      <AnimatePresence>
      {showLogoutConfirm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-xs md:max-w-sm rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 text-center bg-red-50">
                    <div className="h-14 w-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm"><AlertTriangle size={28} strokeWidth={2.5} /></div>
                    <h3 className="text-lg font-bold text-red-700 mb-1">Konfirmasi Keluar</h3>
                    <p className="text-slate-600 text-xs md:text-sm px-2">Apakah Anda yakin ingin keluar?</p>
                </div>
                <div className="p-4 bg-white flex space-x-3">
                    <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm text-white font-bold hover:bg-slate-700 transition text-sm">Batal</button>
                    <button onClick={confirmLogout} className="flex-1 py-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm text-[#FF3B3B] font-bold hover:bg-slate-700 shadow-md transition text-sm">Ya, Keluar</button>
                </div>
            </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {showDeleteConfirm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-900/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 text-center bg-red-50">
                    <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><Trash2 size={32} strokeWidth={2.5} /></div>
                    <h3 className="text-xl font-bold text-red-700 mb-1">Hapus Akun Permanen?</h3>
                    <p className="text-slate-600 text-xs md:text-sm px-4">Tindakan ini tidak dapat dibatalkan. Masukkan password Anda untuk konfirmasi.</p>
                </div>
                <div className="p-6 bg-white flex flex-col gap-3">
                    <input 
                      type="password" 
                      placeholder="Masukkan Password Anda" 
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm mb-2"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                    />
                    <button onClick={handleDeleteAccount} disabled={isDeleting} className="w-full py-3 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm text-[#FF3B3B] font-bold hover:bg-slate-700 shadow-md transition text-sm">{isDeleting ? 'Menghapus...' : 'Ya, Hapus Akun Saya'}</button>
                    <button onClick={() => {setShowDeleteConfirm(false); setDeletePassword('');}} className="w-full py-3 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm text-white font-bold hover:bg-slate-700 transition text-sm">Batal</button>
                </div>
            </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

    </div>
  );
}