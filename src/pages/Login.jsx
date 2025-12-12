import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'; 
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { User, Lock, AlertCircle, Send } from 'lucide-react';

export default function Login({ onSwitchToRegister, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // === LOGIKA BARU: BYPASS UNTUK ADMIN ===
      // Jika email belum diverifikasi DAN emailnya BUKAN admin, maka tahan.
      // Artinya: Jika emailnya 'petugas@dp3a.com', dia akan lolos meskipun belum verifikasi.
      if (!user.emailVerified && user.email !== "petugas@dp3a.com") {
        setError("Akun belum aktif. Klik tombol di bawah untuk mendapatkan link verifikasi.");
        setNeedsVerification(true);
        setLoading(false);
        return; 
      }
      
      // Jika lolos (Verified User atau Admin), App.jsx akan menangani sisanya
      
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError("Email atau password salah.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Terlalu banyak percobaan. Silakan coba lagi nanti.");
      } else {
        setError("Gagal Login: " + err.message);
      }
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setVerificationSent(true);
        setError(""); 
      }
    } catch (err) {
      setError("Gagal mengirim email. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white p-4 py-10 font-sans overflow-y-auto">

      {/* CARD LOGIN */}
      <div className="bg-white w-full max-w-4xl h-auto min-h-[550px] md:h-[550px] rounded-[30px] shadow-2xl overflow-hidden flex flex-row border border-slate-100">

        {/* PANEL KIRI (DESKTOP ONLY) */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:flex w-[50%] h-full bg-gradient-to-br from-[#4f46e5] to-[#6366f1] 
          text-white flex-col items-center justify-center text-center p-12 relative"
          style={{ borderTopRightRadius: '100px', borderBottomRightRadius: '100px' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="bg-white p-4 rounded-2xl shadow-lg mb-6 flex items-center justify-center w-full max-w-[200px] mx-auto">
              <img 
                src="/logo-dp3a.png" 
                className="h-20 w-auto object-contain" 
                alt="Logo DP3A" 
                onError={(e) => e.target.src='/pemkot.png'} 
              />
            </div>
            <h2 className="text-3xl font-extrabold mb-3">Portal DP3A</h2>
            <p className="text-indigo-100 text-lg">Layanan Pengaduan Masyarakat<br />Kota Banjarmasin</p>
            <p className="text-indigo-200 text-sm italic mt-4 max-w-xs mx-auto">
              "Melindungi Perempuan, Menjaga Anak, Membangun Keluarga Sejahtera."
            </p>
          </motion.div>
        </motion.div>

        {/* PANEL FORM (MOBILE & DESKTOP KANAN) */}
        <div className="w-full md:w-[50%] h-full flex flex-col justify-center p-6 md:p-12 bg-white relative overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-full"
          >
            
            {/* === HEADER MOBILE (BOX BIRU) === */}
            <div className="w-full bg-gradient-to-br from-[#4f46e5] to-[#6366f1] p-6 rounded-2xl shadow-lg mb-4 md:hidden flex flex-col items-center text-center">
                <div className="bg-white p-3 rounded-xl shadow-sm mb-3">
                  <img 
                    src="/logo-dp3a.png" 
                    alt="Logo DP3A" 
                    className="h-14 w-auto object-contain" 
                    onError={(e) => e.target.src='/pemkot.png'} 
                  />
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">Portal DP3A</h3>
                <p className="text-xs text-indigo-100 font-medium mt-1">Layanan Pengaduan Kota Banjarmasin</p>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-1 text-center md:text-left">Halo, Warga!</h2>
            <p className="text-slate-500 mb-5 text-center md:text-left text-sm">Silakan masuk ke akun Anda.</p>

            {/* === AREA PESAN ERROR / SUKSES === */}
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm flex flex-col animate-pulse">
                <span className="flex items-center gap-2 font-semibold">
                  <AlertCircle size={16} /> Perhatian:
                </span>
                <span>{error}</span>
                
                {needsVerification && (
                  <button 
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 py-2 px-4 rounded-md text-xs font-bold w-fit transition-colors flex items-center gap-2 shadow-sm"
                  >
                    {loading ? "Mengirim..." : <> <Send size={12}/> Kirim Link Verifikasi!</>}
                  </button>
                )}
              </div>
            )}

            {verificationSent && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded text-sm">
                <strong>Berhasil!</strong> Link verifikasi telah dikirim ke <b>{email}</b>. Silakan cek Inbox atau folder Spam Anda.
              </div>
            )}

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
                <button type="button" className="text-[#4f46e5] font-medium hover:underline">
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
                {loading ? "Memuat..." : "MASUK"}
              </motion.button>
            </form>

            <div className="mt-6 text-center pt-4 border-t border-slate-100 pb-2">
              <p className="text-slate-500 text-sm mb-2">Belum punya akun?</p>
              <button
                onClick={onSwitchToRegister}
                className="text-[#4f46e5] font-bold border border-[#4f46e5] px-6 py-2 rounded-lg hover:bg-indigo-50 transition-all w-full md:w-auto text-sm"
              >
                Daftar Sekarang
              </button>
            </div>

          </motion.div>
        </div>

      </div>

    </div>
  );
}