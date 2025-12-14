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
  // REF untuk menyimpan view awal yang dideteksi dari URL (deep-link)
  const initialViewRef = useRef(null);

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
        // Prioritaskan situasi register (jika proses registrasi sedang berlangsung)
        if (isRegisteringRef.current) {
          setPublicView('auth');
          setIsRegistering(false); // Kembalikan ke form Login

        // Jika ada deep-link awal yang meminta area auth atau halaman spesifik,
        // hormati initialViewRef yang sudah diisi pada mount.
        } else if (initialViewRef.current) {
          if (initialViewRef.current === 'auth' || initialViewRef.current === 'auth-register') {
            setPublicView('auth');
            setIsRegistering(initialViewRef.current === 'auth-register');
          } else {
            setPublicView(initialViewRef.current);
          }

        } else {
          // default: landing
          setPublicView('landing');
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // === Deep-linking support: baca path awal dan set view yang sesuai ===
  useEffect(() => {
    try {
      const path = window.location.pathname.replace(/\/+$/, ''); // hapus trailing slash
      if (path === '' || path === '/') {
        initialViewRef.current = 'landing';
        setPublicView('landing');
      } else if (path === '/login') {
        initialViewRef.current = 'auth';
        setPublicView('auth');
        setIsRegistering(false);
      } else if (path === '/register') {
        initialViewRef.current = 'auth-register';
        setPublicView('auth');
        setIsRegistering(true);
      } else if (path === '/help') {
        initialViewRef.current = 'help';
        setPublicView('help');
      } else if (path === '/about') {
        initialViewRef.current = 'about';
        setPublicView('about');
      } else if (path === '/stats' || path === '/statistik') {
        initialViewRef.current = 'stats';
        setPublicView('stats');
      } else if (path === '/dashboard') {
        initialViewRef.current = 'auth';
        // Jika user belum terautentikasi, arahkan ke auth (login),
        setPublicView('auth');
      }
    } catch (e) {
      // ignore in non-browser env
    }
  }, []);

  // === Sinkronisasi URL dengan state internal agar navigasi/history bekerja ===
  useEffect(() => {
    try {
      if (publicView === 'landing') {
        window.history.replaceState(null, '', '/');
      } else if (publicView === 'help') {
        window.history.replaceState(null, '', '/help');
      } else if (publicView === 'about') {
        window.history.replaceState(null, '', '/about');
      } else if (publicView === 'stats') {
        window.history.replaceState(null, '', '/stats');
      } else if (publicView === 'auth') {
        // auth area: login vs register
        if (isRegistering) {
          window.history.replaceState(null, '', '/register');
        } else {
          window.history.replaceState(null, '', '/login');
        }
      }
    } catch (e) {
      // ignore (SSR tests etc.)
    }
  }, [publicView, isRegistering]);

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