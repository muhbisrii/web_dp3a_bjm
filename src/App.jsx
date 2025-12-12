import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Tambah signOut
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
import Statistik from './components/Statistik'; 

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  // STATE HALAMAN PUBLIK
  const [publicView, setPublicView] = useState('landing');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      
      // === PERBAIKAN LOGIKA DISINI ===
      // Cek: Apakah user ada? DAN Apakah emailnya sudah diverifikasi?
      if (currentUser && currentUser.emailVerified) {
        
        // 1. Jika User Login & Sudah Verifikasi -> Masuk Dashboard
        setUser(currentUser);
        
        // Ambil data detail dari Firestore
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        
        setPublicView('auth');

      } else if (currentUser && !currentUser.emailVerified) {
        
        // 2. Jika User Login TAPI Belum Verifikasi -> Anggap Belum Login
        // Ini penting agar halaman Register "Waiting Verification" tidak tertutup
        // Kita biarkan user tetap null di state aplikasi utama
        setUser(null);
        setUserData(null);
        
        // Opsional: Kita bisa paksa logout di sini jika mau ketat, 
        // tapi untuk Register flow (auto-detect), lebih baik biarkan null saja
        // tanpa signOut, agar Register.jsx bisa jalan logic interval-nya.
      } else {
        
        // 3. Tidak ada user login
        setUser(null);
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
  if (!user && publicView !== 'auth') {
    if (publicView === 'help') return <Help onBack={() => setPublicView('landing')} />;
    if (publicView === 'about') return <About onBack={() => setPublicView('landing')} />;
    if (publicView === 'stats') return <Statistik onBack={() => setPublicView('landing')} />;

    // Default Landing Page
    return (
      <Landing
        onStart={() => setPublicView('auth')} 
        onHelp={() => setPublicView('help')} 
        onAbout={() => setPublicView('about')} 
        onStats={() => setPublicView('stats')} 
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
          />
        );
      }
      return (
        <Login
          key="login"
          onSwitchToRegister={() => setIsRegistering(true)}
          onBack={() => setPublicView('landing')} // Tambahkan prop ini jika Login.jsx mendukung
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

  const isAuthPage = !user;

  return (
    <>
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