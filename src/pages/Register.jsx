import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion } from 'framer-motion';
import { User, CreditCard, Mail, Phone, Lock, CheckCircle } from 'lucide-react';

export default function Register({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({ email: '', nama: '', nik: '', noHp: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirm) return setError("Password tidak sama!");
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = cred.user;
      
      const isPetugas = formData.email.toLowerCase().includes('petugas') || formData.email.toLowerCase().includes('admin');
      const role = isPetugas ? 'admin' : 'Masyarakat'; 

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: formData.email,
        name: formData.nama,
        nik: String(formData.nik),
        no_hp: String(formData.noHp),
        role: role, 
        createdAt: serverTimestamp() 
      });
      alert(`Pendaftaran Berhasil sebagai ${role}! Login otomatis.`);
    } catch (err) {
      setError("Gagal Mendaftar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Variabel animasi untuk efek menyatu (Kebalikan dari Login)
  const pageTransition = {
    initial: { opacity: 0, x: 100 }, // Masuk dari kanan
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }
  };

  return (
    <motion.div 
      className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 relative overflow-hidden font-sans"
      {...pageTransition}
    >
      
      {/* CARD UTAMA */}
      <div className="bg-white w-full max-w-4xl h-[550px] rounded-[30px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        
        {/* --- BAGIAN KIRI (FORM REGISTER) --- */}
        <div className="w-full md:w-[60%] h-full absolute left-0 top-0 flex flex-col justify-center bg-white z-10">
            <div className="h-full overflow-y-auto p-8 md:p-12 custom-scrollbar">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-slate-800 mb-1">Formulir Pendaftaran</h2>
                        <p className="text-slate-500 text-sm">Lengkapi data diri Anda dengan benar.</p>
                    </div>

                    {error && (
                      <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm animate-pulse flex items-center">
                        <span className="mr-2">⚠️</span> {error}
                      </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-700 text-xs font-bold mb-1 ml-1">Nama Lengkap</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                                    <input name="nama" onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none transition-all text-sm" required placeholder="Sesuai KTP" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-700 text-xs font-bold mb-1 ml-1">NIK</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                                    <input name="nik" type="number" onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none transition-all text-sm" required placeholder="16 Digit" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-700 text-xs font-bold mb-1 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                                    <input name="email" type="email" onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none transition-all text-sm" required placeholder="email@contoh.com" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-700 text-xs font-bold mb-1 ml-1">No HP</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                                    <input name="noHp" type="number" onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none transition-all text-sm" required placeholder="08xxx" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-700 text-xs font-bold mb-1 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                                    <input name="password" type="password" onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none transition-all text-sm" required placeholder="Min 6 kar" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-700 text-xs font-bold mb-1 ml-1">Konfirmasi</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                                    <input name="confirm" type="password" onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none transition-all text-sm" required placeholder="Ulangi Pass" />
                                </div>
                            </div>
                        </div>

                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex justify-center items-center mt-6 cursor-pointer relative z-50">
                          {loading ? <span className="animate-pulse">Memproses...</span> : 'DAFTAR SEKARANG'}
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center pt-4 border-t border-slate-100 pb-4">
                        <span className="text-slate-500 text-sm">Sudah punya akun? </span>
                        <button onClick={onSwitchToLogin} className="text-[#4f46e5] font-bold hover:text-[#4338ca] hover:underline text-sm transition-colors cursor-pointer relative z-50">Login di sini</button>
                    </div>
                </motion.div>
            </div>
        </div>

        {/* --- BAGIAN KANAN (BRANDING / PANEL BIRU) --- */}
        <motion.div 
          initial={{ x: '-100%' }} 
          animate={{ x: 0 }} 
          exit={{ x: '-100%', transition: { duration: 0.6, ease: [0.6, 0.01, -0.05, 0.95] } }} 
          transition={{ duration: 0.6, ease: [0.6, 0.01, -0.05, 0.95] }}
          className="hidden md:flex w-[40%] h-full bg-gradient-to-br from-[#4f46e5] to-[#6366f1] text-white flex-col items-center justify-center text-center p-12 absolute right-0 top-0 z-20"
          style={{ 
            borderTopLeftRadius: '100px', 
            borderBottomLeftRadius: '100px',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.1)'
          }}
        >
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
               transition={{ delay: 0.3, duration: 0.5 }}
            >
                {/* AREA LOGO GABUNGAN */}
                <div className="bg-white p-4 rounded-2xl shadow-lg mb-8 flex items-center justify-center space-x-3 w-full max-w-xs mx-auto">
                    <img src="/logo-kiri.png" alt="Logo" onError={(e) => e.target.style.display = 'none'} className="h-8 w-auto object-contain" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Coat_of_arms_of_South_Kalimantan.svg/1200px-Coat_of_arms_of_South_Kalimantan.svg.png" alt="Pemkot" className="h-10 w-auto object-contain drop-shadow-sm" />
                    <img src="/logo-dp3a-text.png" alt="DP3A" onError={(e) => e.target.style.display = 'none'} className="h-6 w-auto object-contain" />
                </div>

                <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Buat Akun</h2>
                <p className="text-indigo-100 text-base font-medium mb-2">Bergabunglah bersama kami.</p>
                
                {/* KATA-KATA TAMBAHAN */}
                <p className="text-indigo-200 text-sm italic font-light max-w-xs mx-auto">
                  "Melindungi Perempuan, Menjaga Anak, Membangun Keluarga Sejahtera."
                </p>

                <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mt-8 mb-8"></div>
                
                <div className="space-y-4 text-left max-w-xs mx-auto text-sm text-indigo-50">
                    <div className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-300"/> Pelaporan Cepat</div>
                    <div className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-300"/> Identitas Aman</div>
                    <div className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-300"/> Status Real-time</div>
                </div>
            </motion.div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </motion.div>

      </div>
    </motion.div>
  );
}