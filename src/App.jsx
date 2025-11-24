import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase'; 
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  LogOut, 
  Send, 
  FileText, 
  User, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Trash2
} from 'lucide-react';

// ==========================================
// 1. LOGIN
// ==========================================
function Login({ onSwitchToRegister }) {
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
      if (err.code === 'auth/wrong-password') setError("Password salah.");
      else if (err.code === 'auth/user-not-found') setError("Email tidak terdaftar.");
      else setError("Gagal Login: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">DP3A</h1>
          <p className="text-slate-500 text-sm">Sistem Informasi Pengaduan Masyarakat</p>
        </div>
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="nama@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" required />
          </div>
          <button disabled={loading} type="submit" className={`w-full py-3 px-4 rounded-lg text-white font-semibold shadow-md transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {loading ? 'Memuat...' : 'MASUK'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Belum punya akun? <button onClick={onSwitchToRegister} className="font-bold text-blue-600 hover:underline">Daftar Sekarang</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. REGISTER
// ==========================================
function Register({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [noHp, setNoHp] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== konfirmasiPassword) { setError("Password tidak sama!"); return; }
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        name: nama,
        nik: String(nik).trim(),
        no_hp: String(noHp).trim(),
        role: "Masyarakat",
        createdAt: serverTimestamp() 
      });
      alert("Pendaftaran Berhasil! Login otomatis.");
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError("Email sudah terdaftar.");
      else if (err.code === 'auth/weak-password') setError("Password terlalu lemah.");
      else setError("Gagal Mendaftar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 my-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-green-600">Buat Akun Baru</h2>
          <p className="text-slate-500 text-sm">Bergabung untuk mendapatkan layanan pengaduan</p>
        </div>
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama</label><input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">NIK</label><input type="number" value={nik} onChange={(e) => setNik(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">No HP</label><input type="number" value={noHp} onChange={(e) => setNoHp(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password</label><input type="password" value={konfirmasiPassword} onChange={(e) => setKonfirmasiPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required /></div>
          <button disabled={loading} type="submit" className={`w-full py-3 px-4 rounded-lg text-white font-semibold mt-4 ${loading ? 'bg-slate-400' : 'bg-green-600 hover:bg-green-700'}`}>{loading ? 'Memproses...' : 'DAFTAR'}</button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">Sudah punya akun? <button onClick={onSwitchToLogin} className="font-bold text-blue-600 hover:underline">Masuk</button></p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. ADMIN DASHBOARD
// ==========================================
function AdminDashboard({ user }) {
  const [laporan, setLaporan] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "laporan"), orderBy("dibuatPada", "desc")); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLaporan(data);
    });
    return () => unsubscribe();
  }, []);

  const tandaiSelesai = async (id) => {
    if (window.confirm('Yakin tandai laporan ini selesai?')) {
      await updateDoc(doc(db, "laporan", id), { status: "Selesai" });
    }
  };

  const hapusLaporan = async (id) => {
    if (window.confirm('Yakin ingin MENGHAPUS laporan ini permanen?')) {
      try {
        await deleteDoc(doc(db, "laporan", id));
      } catch (err) {
        alert("Gagal menghapus: " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">A</div>
              <span className="font-bold text-xl text-slate-800">Admin DP3A</span>
            </div>
            <button onClick={() => signOut(auth)} className="p-2 rounded-full hover:bg-slate-100 text-slate-600"><LogOut size={20} /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center"><FileText className="mr-2 text-blue-600" /> Daftar Laporan Masuk</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pelapor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Laporan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {laporan.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><User size={18} /></div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{item.nama_pelapor || "Warga"}</div>
                          {/* MEMBACA DATA DARI HP (CamelCase) */}
                          <div className="text-sm text-slate-500">{item.emailPelapor || item.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900">{item.judul}</div>
                      <div className="text-xs inline-block bg-slate-100 text-slate-600 rounded px-2 py-0.5 mt-1">{item.kategori}</div>
                      {/* MEMBACA DATA DARI HP (CamelCase) */}
                      <div className="text-xs text-slate-400 mt-1">{item.tanggalKejadian || item.tanggal}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item.status === 'Selesai' ? 'Selesai' : 'Menunggu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                      {item.status !== 'Selesai' && (
                        <button onClick={() => tandaiSelesai(item.id)} className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md text-xs font-medium transition">Selesai</button>
                      )}
                      <button onClick={() => hapusLaporan(item.id)} className="text-red-600 hover:bg-red-100 p-2 rounded-md transition"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

// ==========================================
// 4. USER HOME (SESUAI DATABASE HP)
// ==========================================
function UserHome({ user }) {
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('Kekerasan Fisik');
  const [lokasi, setLokasi] = useState('');
  const [kronologi, setKronologi] = useState('');
  const [tanggal, setTanggal] = useState(''); 

  const kirimLaporan = async (e) => {
    e.preventDefault();
    try {
      if(!tanggal) {
        alert("Mohon isi Tanggal Kejadian");
        return;
      }

      // FORMAL TANGGAL AGAR SAMA DENGAN HP (DD/MM/YYYY)
      // Input HTML Date menghasilkan YYYY-MM-DD, kita ubah.
      const [year, month, day] = tanggal.split('-');
      const formattedDate = `${day}/${month}/${year}`;

      await addDoc(collection(db, "laporan"), {
        userId: user.uid,
        
        // --- SESUAI DATABASE HP ---
        emailPelapor: user.email, // CamelCase
        tanggalKejadian: formattedDate, // CamelCase & Format DD/MM/YYYY
        
        kategori: kategori,
        lokasi: lokasi,
        kronologi: kronologi,
        status: "Menunggu",
        fotoBukti: null, // Sesuai struktur HP
        tanggapanPetugas: "", // Sesuai struktur HP
        ditanggapiPada: null, // Sesuai struktur HP
        
        // Field tambahan Web (Agar Admin mudah baca)
        judul: judul,
        nama_pelapor: user.name || user.email, 
        dibuatPada: serverTimestamp(), 
      });

      alert('Laporan Berhasil Dikirim!');
      setJudul(''); setLokasi(''); setKronologi(''); setTanggal('');
    } catch (err) {
      alert('Gagal kirim: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <header className="bg-white shadow-sm sticky top-0 z-10">
         <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
           <div><h1 className="text-xl font-bold text-blue-600">DP3A Mobile</h1><p className="text-xs text-slate-500">Layanan Pengaduan</p></div>
           <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block"><div className="text-sm font-bold text-slate-800">{user.name || "Warga"}</div><div className="text-xs text-slate-500">Masyarakat</div></div>
             <button onClick={() => signOut(auth)} className="bg-slate-100 p-2 rounded-full text-slate-600 hover:text-red-600"><LogOut size={18} /></button>
           </div>
         </div>
      </header>

      <div className="max-w-lg mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center justify-center">
              <Send className="text-blue-600 w-6 h-6 mr-2" /> Formulir Pengaduan
            </h2>
            <p className="text-sm text-slate-500 mt-1">Silakan isi data kejadian dengan lengkap.</p>
          </div>
          
          <form onSubmit={kirimLaporan} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Laporan</label>
              <input type="text" value={judul} onChange={e=>setJudul(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none transition text-sm" placeholder="Judul singkat..." required />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Kejadian</label>
              <input 
                type="date" 
                value={tanggal} 
                onChange={e=>setTanggal(e.target.value)} 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none transition text-sm" 
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lokasi Kejadian</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input type="text" value={lokasi} onChange={e=>setLokasi(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none transition text-sm" placeholder="Nama Jalan / Lokasi" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori</label>
              <select value={kategori} onChange={e=>setKategori(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none transition text-sm">
                <option>Kekerasan Fisik</option>
                <option>Kekerasan Seksual</option>
                <option>Penelantaran</option>
                <option>Kekerasan Psikis</option>
                <option>Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kronologi Kejadian</label>
              <textarea value={kronologi} onChange={e=>setKronologi(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none transition text-sm h-32" placeholder="Ceritakan detail kejadian secara lengkap..." required></textarea>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-blue-700 transition flex justify-center items-center shadow-md mt-6">
              <Send size={18} className="mr-2" /> KIRIM PENGADUAN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. MAIN APP
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const q = query(collection(db, "users"), where("uid", "==", authUser.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) setUser(querySnapshot.docs[0].data());
        else setUser({ email: authUser.email, role: "Masyarakat", uid: authUser.uid });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!user) return isRegistering ? <Register onSwitchToLogin={() => setIsRegistering(false)} /> : <Login onSwitchToRegister={() => setIsRegistering(true)} />;
  return (user.role && user.role.toLowerCase() === 'admin') ? <AdminDashboard user={user} /> : <UserHome user={user} />;
}