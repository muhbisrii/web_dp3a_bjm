import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { AnimatePresence } from 'framer-motion';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserHome from './pages/UserHome';
import Landing from './pages/Landing';
import Help from './pages/Help';
import About from './pages/About';

// Components
import Statistik from './components/Statistik'; // <-- Import Baru (Lokasi di folder components)

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  // STATE BARU: Mengatur tampilan halaman publik
  // Nilai: 'landing' | 'help' | 'about' | 'stats' | 'auth'
  const [publicView, setPublicView] = useState('landing');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
        // Jika user sudah login, otomatis set view ke mode auth/dashboard
        setPublicView('auth');
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  // =============== LOGIKA HALAMAN PUBLIK (Sebelum Login) ===============
  // Jika user belum login DAN publicView bukan 'auth', tampilkan halaman info
  if (!user && publicView !== 'auth') {
    
    // 1. Tampilkan Halaman Bantuan
    if (publicView === 'help') {
      return <Help onBack={() => setPublicView('landing')} />;
    }
    
    // 2. Tampilkan Halaman Tentang
    if (publicView === 'about') {
      return <About onBack={() => setPublicView('landing')} />;
    }

    // 3. Tampilkan Halaman Statistik (NEW)
    if (publicView === 'stats') {
      return <Statistik onBack={() => setPublicView('landing')} />;
    }

    // 4. Default: Tampilkan Landing Page
    return (
      <Landing
        onStart={() => setPublicView('auth')}  // Menuju Login/Register
        onHelp={() => setPublicView('help')}   // Menuju Halaman Bantuan
        onAbout={() => setPublicView('about')} // Menuju Halaman Tentang
        onStats={() => setPublicView('stats')} // Menuju Halaman Statistik (BARU)
      />
    );
  }

  // ================= LOGIKA UTAMA (Login/Register/Dashboard) =================
  const renderContent = () => {
    // 1. Jika User Belum Login (Tampilkan Login / Register)
    if (!user) {
      if (isRegistering) {
        return (
          <Register
            key="register"
            onSwitchToLogin={() => setIsRegistering(false)}
            // Opsional: Tambah tombol kembali ke Landing dari Register
            // onBack={() => setPublicView('landing')} 
          />
        );
      }
      return (
        <Login
          key="login"
          onSwitchToRegister={() => setIsRegistering(true)}
          // Opsional: Jika di Login.jsx Anda punya tombol back
          // onBack={() => setPublicView('landing')} 
        />
      );
    }

    // 2. Jika User Login sebagai ADMIN
    if (userData?.role === "admin" || userData?.role === "Admin") {
      return <AdminDashboard key="admin" user={userData} />;
    }

    // 3. Jika User Login sebagai USER BIASA
    return (
      <UserHome
        key="user"
        user={userData || { uid: user.uid, email: user.email }}
      />
    );
  };

  // Deteksi apakah sedang di halaman auth (Login/Register) untuk background
  const isAuthPage = !user;

  return (
    <>
      {/* Background global blobs hanya muncul jika SUDAH login (UserHome/Admin) 
          atau jika ingin ditampilkan di login page juga, sesuaikan kondisinya. */}
      {!isAuthPage && (
        <div className="bg-blobs-container">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </>
  );
}

export default App;