import React, { useState, useEffect, useRef } from 'react'; // Tambah useRef
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
import Statistik from './components/Statistik'; 

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isRegistering, setIsRegistering] = useState(false);
  // REF untuk melacak status register secara real-time di dalam listener auth
  const isRegisteringRef = useRef(false);

  // STATE HALAMAN PUBLIK
  const [publicView, setPublicView] = useState('landing');

  // Sinkronisasi State ke Ref
  useEffect(() => {
    isRegisteringRef.current = isRegistering;
  }, [isRegistering]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      
      const isVerified = currentUser?.emailVerified;
      const isAdminBypass = currentUser?.email === "petugas@dp3a.com";

      if (currentUser && (isVerified || isAdminBypass)) {
        // 1. LOGIN SUKSES
        setUser(currentUser);
        
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

      } else if (currentUser && !isVerified && !isAdminBypass) {
        // 2. LOGIN TAPI BELUM VERIFIKASI
        setUser(null);
        setUserData(null);
        setPublicView('auth'); 

      } else {
        // 3. USER LOGOUT (currentUser == null)
        setUser(null);
        setUserData(null);
        
        // === LOGIKA PERBAIKAN UTAMA ===
        // Jika logout terjadi saat sedang proses Register (isRegisteringRef.current == true),
        // berarti user baru saja selesai daftar -> Arahkan ke Login ('auth').
        // Jika tidak, berarti user logout dari Dashboard -> Arahkan ke Landing ('landing').
        
        if (isRegisteringRef.current) {
          setPublicView('auth');
          setIsRegistering(false); // Kembalikan ke form Login
        } else {
          setPublicView('landing');
        }
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
          // Tombol Kembali ke Landing Page
          onBack={() => setPublicView('landing')} 
        />
      );
    }

    if (userData?.role === "admin" || userData?.role === "Admin") {
      return <AdminDashboard key="admin" user={userData} />;
    }

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