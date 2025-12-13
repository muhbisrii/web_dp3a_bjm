import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth'; 
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { User, Lock, AlertCircle, Send, ArrowLeft, Mail, Sparkles } from 'lucide-react';

import "./Landing.css"; 

// --- DEFINISI ANIMASI DI LUAR KOMPONEN ---

// 1. Animasi Floating (Mengambang Halus)
const floatingAnimation = {
  y: [0, -12, 0],
  transition: { 
    duration: 6, 
    repeat: Infinity, 
    ease: "easeInOut" 
  }
};

// 2. VARIANT BARU: Container untuk mengatur urutan muncul (Stagger)
const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3, // Tunggu sebentar sebelum mulai
      staggerChildren: 0.2 // Jeda 0.2 detik antar elemen anak
    }
  }
};

// 3. VARIANT BARU: Animasi Fade In Up untuk setiap elemen
const fadeInUpVariants = {
  hidden: { y: 30, opacity: 0 }, // Mulai dari bawah sedikit dan transparan
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring", // Menggunakan physics spring biar modern
      damping: 20,
      stiffness: 100,
      duration: 0.8
    }
  }
};

// --- KOMPONEN PARTIKEL (Memi) ---
const FallingParticles = React.memo(() => (
  <div className="particle-container pointer-events-none">
    <div className="particle-base particle-circle bg-white/20" 
         style={{ left: '10%', width: '20px', height: '20px', animationDuration: '20s', animationDelay: '0s' }}></div>
    <Sparkles className="particle-svg h-8 w-8 text-white/40 absolute" 
              style={{ left: '25%', top: '-10%', animation: 'float-down 18s linear infinite', animationDelay: '2s' }} />
    <div className="particle-base particle-line bg-white/20" 
         style={{ left: '50%', width: '4px', height: '80px', animationDuration: '15s', animationDelay: '5s' }}></div>
    <div className="particle-base particle-circle bg-white/30" 
         style={{ left: '70%', width: '30px', height: '30px', animationDuration: '22s', animationDelay: '1s' }}></div>
    <Sparkles className="particle-svg h-12 w-12 text-white/50 absolute" 
              style={{ left: '85%', top: '-20%', animation: 'float-down 14s linear infinite', animationDelay: '4s' }} />
  </div>
));

export default function Login({ onSwitchToRegister, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // State Lupa Password
  const [isForgotPassword, setIsForgotPassword] = useState(false); 
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setLoading(true);

    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await minLoadingTime;
      const user = userCredential.user;

      const isVerified = user.emailVerified;
      const isAdminBypass = user.email === "petugas@dp3a.com";

      if (!isVerified && !isAdminBypass) {
        setError("Akun belum aktif. Klik tombol di bawah untuk mendapatkan link verifikasi.");
        setNeedsVerification(true);
        setLoading(false);
        return; 
      }
      
    } catch (err) {
      await minLoadingTime;
      console.error("Login Error:", err.code);

      if (err.code === 'auth/user-not-found') {
        setError("Email ini belum terdaftar.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Email atau password salah.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Password salah.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Terlalu banyak percobaan. Coba lagi nanti.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Format email tidak valid.");
      } else {
        setError("Gagal Login: " + err.message);
      }
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Harap masukkan email Anda terlebih dahulu.");
      return;
    }
    
    setLoading(true);
    setError("");
    setResetEmailSent(false);
    
    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1500));

    try {
      await sendPasswordResetEmail(auth, email);
      await minLoadingTime;
      setResetEmailSent(true);
    } catch (err) {
      await minLoadingTime;
      if (err.code === 'auth/user-not-found') {
        setError("Email tidak ditemukan.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Format email tidak valid.");
      } else {
        setError("Gagal: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1500));
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        await minLoadingTime;
        setVerificationSent(true);
        setError(""); 
      }
    } catch (err) {
      await minLoadingTime;
      setError("Gagal mengirim email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white p-4 py-10 font-sans overflow-y-auto">

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="custom-loading-screen">
          <div className="custom-loader-content">
            <div className="sipd-loader">
              <div className="sipd-rect sipd-shape"></div>
              <div className="sipd-square sipd-shape"></div>
              <div className="sipd-square sipd-shape"></div>
            </div>
            <p className="loading-text-main">
              {isForgotPassword ? "Mengirim link reset..." : "Mohon tunggu..."}
            </p>
          </div>
        </div>
      )}

      {/* CARD LOGIN */}
      <div className="bg-white w-full max-w-4xl h-auto min-h-[550px] md:h-[550px] rounded-[30px] shadow-2xl overflow-hidden flex flex-row border border-slate-100">

        {/* PANEL KIRI (DESKTOP ONLY) */}
        <div className="hidden md:flex w-[50%] h-full bg-gradient-to-br from-[#4f46e5] to-[#6366f1] 
          text-white flex-col items-center justify-center text-center p-12 relative overflow-hidden"
          style={{ borderTopRightRadius: '100px', borderBottomRightRadius: '100px' }}
        >
          {/* BACKGROUND PARTICLES */}
          <FallingParticles />
          
          {/* WRAPPER UTAMA: Menangani Floating */}
          <motion.div
            animate={floatingAnimation} 
            className="w-full relative z-10" 
          >
            {/* INNER WRAPPER: Menangani urutan Fade In (Stagger) */}
            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Elemen 1: Box Logo */}
              <motion.div variants={fadeInUpVariants} className="bg-white p-4 rounded-2xl shadow-lg mb-6 flex items-center justify-center w-full max-w-[200px] mx-auto">
                <img src="/logo-dp3a.png" className="h-20 w-auto object-contain" alt="Logo DP3A" onError={(e) => e.target.src='/pemkot.png'} />
              </motion.div>
              
              {/* Elemen 2: Judul */}
              <motion.h2 variants={fadeInUpVariants} className="text-3xl font-extrabold mb-3">
                Portal DP3A
              </motion.h2>
              
              {/* Elemen 3: Subjudul */}
              <motion.p variants={fadeInUpVariants} className="text-indigo-100 text-lg">
                Layanan Pengaduan Masyarakat<br />Kota Banjarmasin
              </motion.p>
              
              {/* Elemen 4: Quote */}
              <motion.p variants={fadeInUpVariants} className="text-indigo-200 text-sm italic mt-4 max-w-xs mx-auto">
                "Melindungi Perempuan, Menjaga Anak, Membangun Keluarga Sejahtera."
              </motion.p>
            </motion.div>
          </motion.div>
        </div>

        {/* PANEL KANAN (FORM AREA) */}
        <div className="w-full md:w-[50%] h-full flex flex-col justify-center p-6 md:p-12 bg-white relative overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-full"
          >
            {/* Header Mobile (BOX BIRU MENGAMBANG) */}
            {/* Juga diterapkan animasi stagger di sini agar konsisten */}
            <motion.div 
              animate={floatingAnimation}
              className="w-full bg-gradient-to-br from-[#4f46e5] to-[#6366f1] p-6 rounded-2xl shadow-lg mb-8 md:hidden flex flex-col items-center text-center relative overflow-hidden"
            >
                <FallingParticles />

                <motion.div 
                  variants={staggerContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="relative z-10 flex flex-col items-center"
                >
                  <motion.div variants={fadeInUpVariants} className="bg-white p-3 rounded-xl shadow-sm mb-3">
                    <img src="/logo-dp3a.png" alt="Logo DP3A" className="h-14 w-auto object-contain" onError={(e) => e.target.src='/pemkot.png'} />
                  </motion.div>
                  <motion.h3 variants={fadeInUpVariants} className="text-xl font-bold text-white tracking-wide">
                    Portal DP3A
                  </motion.h3>
                  <motion.p variants={fadeInUpVariants} className="text-xs text-indigo-100 font-medium mt-1">
                    Layanan Pengaduan Kota Banjarmasin
                  </motion.p>
                </motion.div>
            </motion.div>

            {/* HEADER JUDUL FORM */}
            <h2 className="text-2xl font-bold text-slate-800 mb-1 text-center md:text-left">
              {isForgotPassword ? "Lupa Kata Sandi?" : "Halo, Warga!"}
            </h2>
            <p className="text-slate-500 mb-5 text-center md:text-left text-sm">
              {isForgotPassword 
                ? "Masukkan email Anda untuk reset password." 
                : "Silakan masuk ke akun Anda."}
            </p>

            {/* ALERT BOXES */}
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm flex flex-col">
                <span className="flex items-center gap-2 font-semibold">
                  <AlertCircle size={16} /> Perhatian:
                </span>
                <span>{error}</span>
                {needsVerification && (
                  <button 
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 py-2 px-4 rounded-md text-xs font-bold w-fit transition-colors flex items-center gap-2"
                  >
                    {loading ? "Mengirim..." : <> <Send size={12}/> Kirim Link Verifikasi!</>}
                  </button>
                )}
              </div>
            )}

            {verificationSent && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded text-sm">
                Link verifikasi terkirim ke <b>{email}</b>.
              </div>
            )}
            
            {resetEmailSent && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded text-sm">
                Link reset password telah dikirim ke <b>{email}</b>. Cek inbox/spam.
              </div>
            )}

            {/* --- FORM AREA --- */}
            {!isForgotPassword ? (
              // FORM LOGIN
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] outline-none transition-all"
                    placeholder="Email Pengguna"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] outline-none transition-all"
                    placeholder="Kata Sandi"
                    required
                  />
                </div>

                <div className="flex justify-between items-center text-sm">
                  <button type="button" onClick={onBack} className="text-slate-400 hover:text-slate-600">
                    ← Kembali
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsForgotPassword(true); setError(""); setResetEmailSent(false); }}
                    className="text-[#4f46e5] font-medium hover:underline"
                  >
                    Lupa Password?
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3.5 rounded-xl shadow-lg mt-2 transition-all"
                >
                  MASUK
                </motion.button>
              </form>
            ) : (
              // FORM LUPA PASSWORD
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] outline-none transition-all"
                    placeholder="Masukkan Email Terdaftar"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || resetEmailSent}
                  className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3.5 rounded-xl shadow-lg mt-2 transition-all"
                >
                   {loading ? "Mengirim..." : "Kirim Link Reset"}
                </motion.button>

                <div className="text-center pt-2">
                    <button 
                        type="button"
                        onClick={() => { setIsForgotPassword(false); setError(""); setResetEmailSent(false); }}
                        className="text-slate-500 text-sm hover:text-[#4f46e5] flex items-center justify-center gap-1 mx-auto"
                    >
                        <ArrowLeft size={14} /> Batal, kembali ke Login
                    </button>
                </div>
              </form>
            )}

            {!isForgotPassword && (
                <div className="mt-6 text-center pt-4 border-t border-slate-100 pb-2">
                    <p className="text-slate-500 text-sm mb-2">Belum punya akun?</p>
                    <button
                        onClick={onSwitchToRegister}
                        className="text-[#4f46e5] font-bold border border-[#4f46e5] px-6 py-2 rounded-lg hover:bg-indigo-50 transition-all w-full md:w-auto text-sm"
                    >
                        Daftar Sekarang
                    </button>
                </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}