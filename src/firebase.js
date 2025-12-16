import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // BAGIAN INI SUDAH DIAMANKAN (Mengambil dari .env)
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  
  // Bagian di bawah ini aman untuk publik (bukan rahasia)
  authDomain: "pengaduan-dpppa-bjm.firebaseapp.com",
  projectId: "pengaduan-dpppa-bjm",
  storageBucket: "pengaduan-dpppa-bjm.firebasestorage.app",
  messagingSenderId: "177772980316",
  appId: "1:177772980316:web:e1fa0abb1fc036425a5e99"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);