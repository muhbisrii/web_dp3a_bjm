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
import siteConfig from './siteConfig';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // === Detect initial path synchronously so auth listener won't override it ===
  const initialPath = (typeof window !== 'undefined') ? window.location.pathname.replace(/\/+$/, '') : '/';
  const initialIsRegistering = initialPath === '/register';
  const initialPublicView = (function () {
    if (initialPath === '' || initialPath === '/') return 'landing';
    if (initialPath === '/login' || initialPath === '/register' || initialPath === '/dashboard') return 'auth';
    if (initialPath === '/help') return 'help';
    if (initialPath === '/about') return 'about';
    if (initialPath === '/stats' || initialPath === '/statistik') return 'stats';
    return 'landing';
  })();

  const [isRegistering, setIsRegistering] = useState(initialIsRegistering);
  // REF untuk melacak status register secara real-time di dalam listener auth
  const isRegisteringRef = useRef(initialIsRegistering);
  // REF untuk menyimpan view awal yang dideteksi dari URL (deep-link)
  const initialViewRef = useRef((function () {
    if (initialPath === '' || initialPath === '/') return 'landing';
    if (initialPath === '/login') return 'auth';
    if (initialPath === '/register') return 'auth-register';
    if (initialPath === '/help') return 'help';
    if (initialPath === '/about') return 'about';
    if (initialPath === '/stats' || initialPath === '/statistik') return 'stats';
    if (initialPath === '/dashboard') return 'auth';
    return null;
  })());

  // STATE HALAMAN PUBLIK
  const [publicView, setPublicView] = useState(initialPublicView);

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
        // setelah login sukses, arahkan URL ke dashboard agar aplikasi user menampilkan halaman dashboard
        try {
          if (isAdminBypass) {
            window.history.replaceState(null, '', '/admin');
          } else {
            window.history.replaceState(null, '', '/dashboard');
          }
        } catch (e) {}

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

  // deep-link handled synchronously above; no on-mount effect needed

  // === Sinkronisasi URL dengan state internal agar navigasi/history bekerja ===
  useEffect(() => {
    try {
      // Jangan timpa URL auth (login/register) ketika user sudah login
      if (publicView === 'auth' && user) {
        return;
      }

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
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const site = siteConfig[hostname] || siteConfig.default;

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
          site={site}
        />
      );
    }

    if (userData?.role === "admin" || userData?.role === "Admin") {
      return <AdminDashboard key="admin" user={userData} site={site} onRequestLogoutRedirect={() => { setPublicView('auth'); setIsRegistering(false); try { window.history.replaceState(null, '', '/login'); } catch(e){} }} />;
    }

    return (
      <UserHome
        key="user"
        user={userData || { uid: user.uid, email: user.email }}
        site={site}
        onRequestLogoutRedirect={() => {
          // Ensure the public view becomes the auth (login) page after logout
          setPublicView('auth');
          setIsRegistering(false);
          try { window.history.replaceState(null, '', '/login'); } catch (e) {}
        }}
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