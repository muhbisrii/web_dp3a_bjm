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

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
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

  // ====== DETEKSI HALAMAN LOGIN / REGISTER ======
  const isAuthPage = !user; // jika belum login → true

  return (
    <>
      {/* Background global hanya muncul jika user SUDAH login */}
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
