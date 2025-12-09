import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError("Email atau password salah.");
      } else {
        setError("Gagal Login: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 relative overflow-hidden font-sans">
      
      {/* CARD UTAMA */}
      <div className="bg-white w-full max-w-4xl h-[550px] rounded-[30px] shadow-2xl overflow-hidden flex flex-row relative">
        
        {/* --- BAGIAN KIRI (BRANDING / PANEL BIRU) --- */}
        <motion.div 
          initial={{ x: '-100%' }} 
          animate={{ x: 0 }} 
          transition={{ duration: 0.6, ease: [0.6, 0.01, -0.05, 0.95] }}
          className="hidden md:flex w-[50%] h-full bg-gradient-to-br from-[#4f46e5] to-[#6366f1] text-white flex-col items-center justify-center text-center p-12 absolute left-0 top-0 z-20"
          style={{ 
            borderTopRightRadius: '100px', 
            borderBottomRightRadius: '100px',
            boxShadow: '10px 0 30px rgba(0,0,0,0.1)'
          }}
        >
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3, duration: 0.5 }}
            >
                {/* AREA LOGO GABUNGAN */}
                <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 flex items-center justify-center space-x-4 w-full max-w-xs mx-auto">
                    <img 
                        src="/logo-kiri.png" 
                        alt="Logo Kiri" 
                        onError={(e) => e.target.style.display = 'none'} 
                        className="h-12 w-auto object-contain" 
                    />
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Coat_of_arms_of_South_Kalimantan.svg/1200px-Coat_of_arms_of_South_Kalimantan.svg.png" 
                        alt="Logo Pemkot" 
                        className="h-14 w-auto object-contain drop-shadow-sm" 
                    />
                    {/* LOGO DP3A DIKANAN DIHAPUS */}
                </div>

                <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Portal DP3A</h2>
                <p className="text-indigo-100 text-lg font-medium mb-2">Layanan Pengaduan Masyarakat<br/>Kota Banjarmasin</p>

                <p className="text-indigo-200 text-sm italic font-light max-w-xs mx-auto">
                  "Melindungi Perempuan, Menjaga Anak, Membangun Keluarga Sejahtera."
                </p>
                
                <div className="w-16 h-1 bg-white/30 rounded-full mx-auto mt-8 mb-8"></div>
            </motion.div>

            <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </motion.div>

        {/* --- BAGIAN KANAN (FORM LOGIN) --- */}
        <div className="w-full md:w-[50%] h-full absolute right-0 top-0 flex flex-col justify-center p-8 md:p-12 bg-white z-10">
            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2, duration: 0.5 }}
            >
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Halo, Warga!</h2>
                    <p className="text-slate-500">Silakan masuk ke akun Anda.</p>
                </div>

                {error && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm animate-pulse flex items-center">
                    <span className="mr-2">⚠️</span> {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none transition-all placeholder:text-slate-400" placeholder="Email Pengguna" required />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none transition-all placeholder:text-slate-400" placeholder="Kata Sandi" required />
                    </div>

                    <div className="text-right"><button type="button" className="text-sm text-[#4f46e5] font-medium hover:underline">Lupa Password?</button></div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex justify-center items-center mt-2">
                      {loading ? <span className="animate-pulse">Memuat...</span> : 'MASUK'}
                    </motion.button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                    <p className="text-slate-500 text-sm mb-2">Belum punya akun?</p>
                    <button onClick={onSwitchToRegister} className="text-[#4f46e5] font-bold hover:text-[#4338ca] transition-colors text-sm border border-[#4f46e5] px-6 py-2 rounded-lg hover:bg-indigo-50">Daftar Sekarang</button>
                </div>
            </motion.div>
        </div>

      </div>
    </div>
  );
}
