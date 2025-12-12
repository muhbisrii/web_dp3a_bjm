import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'; // Import signOut
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { User, Lock } from 'lucide-react';

export default function Login({ onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // 1. Coba Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. CEK APAKAH EMAIL SUDAH DIVERIFIKASI?
      if (!user.emailVerified) {
        // Jika belum, paksa Logout
        await signOut(auth);
        setError("Akun belum aktif. Silakan cek email Anda untuk verifikasi.");
        setLoading(false);
        return; // Stop, jangan lanjut login
      }

      // Jika sudah verified, Firebase listener di App.js Anda akan otomatis mengarahkan ke dashboard

    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Email atau password salah.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Terlalu banyak percobaan. Coba lagi nanti.");
      } else {
        setError("Gagal Login: " + err.message);
      }
      setLoading(false);
    }
  };

  return (
    // Background diubah jadi slate-100 tanpa gambar
    <div className="relative w-full min-h-screen overflow-hidden font-sans bg-slate-100">

      {/* ==== CONTAINER LOGIN ==== */}
      <div className="relative z-40 min-h-screen w-full flex items-center justify-center p-4">

        <div className="bg-white w-full max-w-4xl h-[600px] md:h-[550px] rounded-[30px] shadow-2xl overflow-hidden flex flex-row relative">

          {/* PANEL KIRI (DESKTOP ONLY) - Panel Biru */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden md:flex w-[50%] h-full bg-gradient-to-br from-[#4f46e5] to-[#6366f1] 
            text-white flex-col items-center justify-center text-center p-12 absolute left-0 top-0 z-20"
            style={{
              borderTopRightRadius: '100px',
              borderBottomRightRadius: '100px'
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* Logo Desktop */}
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
          <div className="w-full md:w-[50%] h-full absolute right-0 top-0 flex flex-col justify-center p-8 md:p-12 bg-white z-10">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              
              {/* === HEADER MOBILE (Hanya muncul di HP) === */}
              <div className="flex flex-col items-center justify-center text-center mb-6 md:hidden">
                  <img 
                    src="/logo-dp3a.png" 
                    alt="Logo DP3A" 
                    className="h-10 w-auto mb-2 object-contain" 
                    onError={(e) => e.target.src='/pemkot.png'} 
                  />
                  <h3 className="text-lg font-bold text-[#4f46e5]">Portal DP3A</h3>
                  <p className="text-xs text-slate-500">Layanan Pengaduan Kota Banjarmasin</p>
              </div>

              <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center md:text-left">Halo, Warga!</h2>
              <p className="text-slate-500 mb-6 text-center md:text-left">Silakan masuk ke akun Anda.</p>

              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
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

                <div className="text-right">
                  <button type="button" className="text-sm text-[#4f46e5] font-medium hover:underline">
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
                  {loading ? "Memeriksa..." : "MASUK"}
                </motion.button>
              </form>

              <div className="mt-8 text-center pt-6 border-t border-slate-100">
                <p className="text-slate-500 text-sm mb-3">Belum punya akun?</p>
                <button
                  onClick={onSwitchToRegister}
                  className="text-[#4f46e5] font-bold border border-[#4f46e5] px-6 py-2 rounded-lg hover:bg-indigo-50 transition-all w-full md:w-auto"
                >
                  Daftar Sekarang
                </button>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}