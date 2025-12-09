import React, { useState, useRef } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { User, Lock, Volume2, VolumeX, Play, ArrowLeft } from 'lucide-react';

export default function Login({ onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showVideoOnly, setShowVideoOnly] = useState(false);

  const videoRef = useRef(null);

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

  const toggleMute = () => {
    const newMute = !muted;
    setMuted(newMute);
    if (videoRef.current) videoRef.current.muted = newMute;
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden font-sans">

      {/* === VIDEO FIX: FULL NO CROP === */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          src="/dpppa.mp4"
          autoPlay
          loop
          muted={muted}
          playsInline
          className={`
            w-full h-full
            object-contain
            mx-auto my-auto
            ${showVideoOnly ? '' : 'blur-lg brightness-75'}
          `}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        ></video>
      </div>
      {/* === END VIDEO FIX === */}

      {!showVideoOnly && (
        <div className="absolute inset-0 bg-black/30"></div>
      )}

      {/* ==== TOMBOL MUTE ==== */}
      <button
        onClick={toggleMute}
        className="absolute top-6 right-6 z-50 bg-white/80 backdrop-blur-lg p-3 rounded-full shadow-lg hover:bg-white"
      >
        {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      {/* ==== TOMBOL MODE VIDEO / LOGIN ==== */}
      <button
        onClick={() => setShowVideoOnly(!showVideoOnly)}
        className="absolute top-6 left-6 z-50 bg-white/80 backdrop-blur-lg p-3 rounded-full shadow-lg hover:bg-white flex items-center gap-2"
      >
        {showVideoOnly ? (
          <>
            <ArrowLeft size={20} /> <span>Kembali ke Login</span>
          </>
        ) : (
          <>
            <Play size={20} /> <span>Lihat Video</span>
          </>
        )}
      </button>

      {/* ==== MODE FULL VIDEO ==== */}
      {showVideoOnly ? null : (
        <div className="relative z-30 min-h-screen w-full flex items-center justify-center p-4">

          {/* ==== CARD LOGIN ==== */}
          <div className="bg-white w-full max-w-4xl h-[550px] rounded-[30px] shadow-2xl overflow-hidden flex flex-row relative">

            {/* ==== PANEL KIRI ==== */}
            <motion.div 
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              transition={{ duration: 0.6 }}
              className="hidden md:flex w-[50%] h-full bg-gradient-to-br from-[#4f46e5] to-[#6366f1] text-white flex-col items-center justify-center text-center p-12 absolute left-0 top-0 z-20"
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
                <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 flex items-center justify-center space-x-4 w-full max-w-xs mx-auto">
                  <img src="/logo-kiri.png" className="h-12 w-auto" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Coat_of_arms_of_South_Kalimantan.svg/1200px-Coat_of_arms_of_South_Kalimantan.svg.png" className="h-14 w-auto" />
                </div>

                <h2 className="text-3xl font-extrabold mb-3">Portal DP3A</h2>
                <p className="text-indigo-100 text-lg">Layanan Pengaduan Masyarakat<br/>Kota Banjarmasin</p>

                <p className="text-indigo-200 text-sm italic mt-4 max-w-xs mx-auto">
                  "Melindungi Perempuan, Menjaga Anak, Membangun Keluarga Sejahtera."
                </p>
              </motion.div>
            </motion.div>

            {/* ==== FORM LOGIN ==== */}
            <div className="w-full md:w-[50%] h-full absolute right-0 top-0 flex flex-col justify-center p-8 md:p-12 bg-white z-10">
              <motion.div 
                initial={{ opacity: 0, x: 50 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Halo, Warga!</h2>
                <p className="text-slate-500 mb-6">Silakan masuk ke akun Anda.</p>

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
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" 
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
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" 
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
                    className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3.5 rounded-xl shadow-lg mt-2"
                  >
                    {loading ? "Memuat..." : "MASUK"}
                  </motion.button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                  <p className="text-slate-500 text-sm mb-2">Belum punya akun?</p>
                  <button 
                    onClick={onSwitchToRegister} 
                    className="text-[#4f46e5] font-bold border border-[#4f46e5] px-6 py-2 rounded-lg hover:bg-indigo-50"
                  >
                    Daftar Sekarang
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
