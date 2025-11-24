import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // <--- WAJIB DITAMBAHKAN untuk Login

// Konfigurasi Persis Punya Anda
const firebaseConfig = {
  apiKey: "AIzaSyA_717QoIkhbnoqjBaHNytJq8U1SXZ5o30",
  authDomain: "pengaduan-dpppa-bjm.firebaseapp.com",
  projectId: "pengaduan-dpppa-bjm",
  storageBucket: "pengaduan-dpppa-bjm.firebasestorage.app",
  messagingSenderId: "177772980316",
  appId: "1:177772980316:web:e1fa0abb1fc036425a5e99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app); // <--- WAJIB DITAMBAHKAN agar App.js bisa Login