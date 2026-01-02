import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, signOut } from 'firebase/auth';
import { setDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CreditCard, Mail, Phone, Lock, CheckCircle, Loader2, RefreshCw, ArrowRight } from 'lucide-react';

export default function Register({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({ email: '', nama: '', nik: '', noHp: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // VIEW STATE: 'form' (Isi data) | 'waiting' (Nunggu klik email) | 'success' (Sudah verif)
  const [view, setView] = useState('form'); 

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- 1. PROSES DAFTAR ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirm) {
      return setError("Password dan Konfirmasi tidak cocok!");
    }
    
    setLoading(true);

    try {
      // A. Buat User Firebase
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = cred.user;
      
      // B. Update Nama Profil
      await updateProfile(user, { displayName: formData.nama });

      // C. Tentukan Role
      const isPetugas = formData.email.toLowerCase().includes('petugas') || formData.email.toLowerCase().includes('admin');
      const role = isPetugas ? 'admin' : 'Masyarakat'; 

      // D. Kirim Email Verifikasi
      await sendEmailVerification(user);

      // E. Simpan ke Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: formData.email,
        name: formData.nama,
        nik: String(formData.nik),
        no_hp: String(formData.noHp),
        role: role, 
        isVerified: false, 
        createdAt: serverTimestamp() 
      });

      // F. PENTING: Ubah tampilan ke "Waiting" (Jangan Logout dulu agar bisa auto-detect)
      setView('waiting'); 
      
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Email sudah terdaftar. Silakan Login.");
      } else {
        setError("Gagal: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 2. AUTO DETECT VERIFIKASI (Setiap 3 Detik) ---
  useEffect(() => {
    let interval;
    
    if (view === 'waiting') {
      interval = setInterval(async () => {
        const user = auth.currentUser;
        
        if (user) {
          // Refresh status user dari server firebase
          await user.reload(); 
          
          if (user.emailVerified) {
            // JIKA SUDAH KLIK LINK DI EMAIL:
            clearInterval(interval);
            
            // 1. Update status di Firestore
            try {
              await updateDoc(doc(db, "users", user.uid), { isVerified: true });
            } catch(e) { console.log("Firestore update error", e); }

            // 2. Pindah ke tampilan sukses
            setView('success');

            // 3. Tunggu 3 detik, lalu Logout & ke Halaman Login
            setTimeout(async () => {
              await signOut(auth);
              onSwitchToLogin(); 
            }, 3000);
          }
        }
      }, 3000); // Cek setiap 3 detik
    }

    return () => clearInterval(interval);
  }, [view, onSwitchToLogin]);


  // Animasi Masuk Halaman
  const pageTransition = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.5 }
  };

  return (
    <motion.div 
      className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 relative overflow-hidden font-sans"
      {...pageTransition}
    >
      
      {/* KARTU UTAMA */}
      <div className="bg-white w-full max-w-4xl h-[600px] md:h-[550px] rounded-[30px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        
        {/* --- KONTEN KIRI (BERUBAH-UBAH) --- */}
        <div className="w-full md:w-[60%] h-full absolute left-0 top-0 flex flex-col justify-center bg-white z-10 transition-all">
            <div className="h-full overflow-y-auto p-8 md:p-12 custom-scrollbar relative">
                
                <AnimatePresence mode='wait'>
                  
                  {/* === TAMPILAN 1: FORMULIR DAFTAR === */}
                  {view === 'form' && (
                    <motion.div 
                      key="form"
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-slate-800 mb-1">Daftar Akun</h2>
                            <p className="text-slate-500 text-sm">Lengkapi data diri Anda dengan benar.</p>
                        </div>

                        {error && (
                          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm flex items-center">
                            <span className="mr-2">⚠️</span> {error}
                          </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-4">
                            {/* NAMA & NIK */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 ml-1">Nama</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
                                        {/* Updated Focus Color */}
                                        <input name="nama" onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4338ca] outline-none text-sm" required placeholder="Sesuai KTP" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 ml-1">NIK</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
                                        {/* Updated Focus Color */}
                                        <input name="nik" type="number" onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4338ca] outline-none text-sm" required placeholder="16 Digit" />
                                    </div>
                                </div>
                            </div>

                            {/* EMAIL & HP */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
                                        {/* Updated Focus Color */}
                                        <input name="email" type="email" onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4338ca] outline-none text-sm" required placeholder="email@anda.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 ml-1">No HP</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
                                        {/* Updated Focus Color */}
                                        <input name="noHp" type="number" onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4338ca] outline-none text-sm" required placeholder="08xxx" />
                                    </div>
                                </div>
                            </div>

                            {/* PASSWORD & CONFIRM */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 ml-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
                                        {/* Updated Focus Color */}
                                        <input name="password" type="password" onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4338ca] outline-none text-sm" required placeholder="Min 6 kar" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 ml-1">Konfirmasi</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
                                        {/* Updated Focus Color */}
                                        <input name="confirm" type="password" onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4338ca] outline-none text-sm" required placeholder="Ulangi Pass" />
                                    </div>
                                </div>
                            </div>

                            {/* Updated Button Color: BG #4338ca, Hover #312e81 */}
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-[#4338ca] hover:bg-[#312e81] text-white font-bold py-3.5 rounded-xl shadow-lg mt-4 transition-all flex justify-center items-center">
                              {loading ? <span className="animate-pulse">Sedang Memproses...</span> : 'DAFTAR SEKARANG'}
                            </motion.button>
                        </form>

                        <div className="mt-4 text-center pt-2 border-t border-slate-100">
                            <span className="text-slate-500 text-sm">Sudah punya akun? </span>
                            {/* Updated Link Color */}
                            <button onClick={onSwitchToLogin} className="text-[#4338ca] font-bold hover:underline text-sm">Login di sini</button>
                        </div>
                    </motion.div>
                  )}

                  {/* === TAMPILAN 2: MENUNGGU VERIFIKASI (AUTO DETECT) === */}
                  {view === 'waiting' && (
                    <motion.div 
                      key="waiting"
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center px-4"
                    >
                      <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-6 relative">
                        <Mail className="text-yellow-500 w-10 h-10" />
                        <span className="absolute top-0 right-0 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                        </span>
                      </div>
                      
                      <h2 className="text-2xl font-bold text-slate-800 mb-2">Cek Email Anda!</h2>
                      <p className="text-slate-600 mb-6 text-sm leading-relaxed max-w-sm">
                        Kami telah mengirim email verifikasi ke <strong>{formData.email}</strong>.
                        <br/><br/>
                        {/* Updated Warning Color Text */}
                        <span className="font-semibold text-[#4338ca] bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                          Jangan tutup halaman ini.
                        </span>
                        <br/>Silakan buka Tab Baru atau HP Anda, cek Inbox/Spam, lalu klik linknya.
                      </p>

                      <div className="flex items-center justify-center space-x-2 text-slate-400 text-xs animate-pulse">
                        <Loader2 className="animate-spin w-4 h-4" />
                        <span>Mendeteksi verifikasi otomatis...</span>
                      </div>
                    </motion.div>
                  )}

                  {/* === TAMPILAN 3: SUKSES VERIFIKASI === */}
                  {view === 'success' && (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center px-4"
                    >
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="text-green-600 w-12 h-12" />
                      </div>
                      
                      <h2 className="text-3xl font-bold text-slate-800 mb-2">Berhasil!</h2>
                      <p className="text-slate-600 mb-6 text-sm">
                        Email Anda telah terverifikasi.<br/>
                        Mengarahkan ke Login dalam 3 detik...
                      </p>

                      {/* Loading Bar Hijau */}
                      <div className="w-48 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-green-500"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 3 }}
                        />
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>

            </div>
        </div>

        {/* --- KONTEN KANAN (BRANDING) --- */}
        {/* Updated Gradient: from #4338ca */}
        <div className="hidden md:flex w-[40%] h-full bg-gradient-to-br from-[#4338ca] to-[#4f46e5] text-white flex-col items-center justify-center text-center p-12 absolute right-0 top-0 z-20"
          style={{ borderTopLeftRadius: '100px', borderBottomLeftRadius: '100px', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' }}
        >
            <div className="bg-white p-4 rounded-2xl shadow-lg mb-8 flex items-center justify-center space-x-3 w-full max-w-xs mx-auto">
                <img src="/logo-kiri.png" alt="Logo" onError={(e) => e.target.style.display = 'none'} className="h-8 w-auto object-contain" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Coat_of_arms_of_South_Kalimantan.svg/1200px-Coat_of_arms_of_South_Kalimantan.svg.png" alt="Pemkot" className="h-10 w-auto object-contain drop-shadow-sm" />
                <img src="/logo-dp3a-text.png" alt="DP3A" onError={(e) => e.target.style.display = 'none'} className="h-6 w-auto object-contain" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Portal DP3A</h2>
            <p className="text-indigo-100 text-base font-medium mb-2">Layanan Pengaduan Terpadu</p>
            <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mt-8 mb-8"></div>
            <div className="space-y-4 text-left max-w-xs mx-auto text-sm text-indigo-50">
                <div className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-300"/> Verifikasi Aman</div>
                <div className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-300"/> Data Terenkripsi</div>
                <div className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-300"/> Respon Cepat</div>
            </div>
        </div>

      </div>
    </motion.div>
  );
}