import React, { useState } from "react";
import { Menu, X, ChevronRight } from "lucide-react"; // Import ikon
import "./Landing.css";

export default function Landing({ onStart, onAbout, onHelp }) {
  // State untuk mengatur apakah Sidebar terbuka atau tertutup
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleAbout = () => {
    if (onAbout) onAbout();
    setSidebarOpen(false); // Tutup sidebar setelah klik
  };

  const handleHelp = () => {
    if (onHelp) onHelp();
    setSidebarOpen(false); // Tutup sidebar setelah klik
  };

  const handleLogin = () => {
    if (onStart) onStart();
    setSidebarOpen(false);
  };

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-navbar">
        
        {/* Bagian Kiri: Logo & Judul */}
        <div className="nav-left">
          <img src="/pemkot.png" alt="logo" className="logo" />
          <div className="nav-divider"></div>
          <div className="nav-text">
            <h1 className="portal-title">Portal DP3A</h1>
            <p className="portal-subtitle">
              Layanan Pengaduan Masyarakat
            </p>
          </div>
        </div>

        {/* --- TAMPILAN LAPTOP (Desktop Menu) --- */}
        {/* Class 'desktop-menu' akan kita sembunyikan di HP via CSS */}
        <div className="nav-right desktop-menu">
          <ul className="nav-links">
            <li className="nav-item" onClick={handleAbout}>Tentang Aplikasi</li>
            <li className="nav-item" onClick={handleHelp}>Bantuan</li>
          </ul>
          <button className="hero-btn navbar-btn" onClick={onStart}>
            Login / Register
          </button>
        </div>

        {/* --- TAMPILAN HP (Hamburger Button) --- */}
        {/* Tombol ini hanya muncul di HP */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={28} color="#333" />
        </button>

        {/* --- SIDEBAR MOBILE (Overlay & Drawer) --- */}
        {/* Background gelap transparan */}
        <div 
          className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        ></div>

        {/* Isi Sidebar */}
        <div className={`mobile-sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <div className="sidebar-header">
            <h3 className="sidebar-title">Menu Utama</h3>
            <button onClick={() => setSidebarOpen(false)} className="close-btn">
              <X size={24} />
            </button>
          </div>

          <ul className="sidebar-list">
            <li onClick={handleAbout}>
              <span>Tentang Aplikasi</span>
              <ChevronRight size={16} className="text-slate-400"/>
            </li>
            <li onClick={handleHelp}>
              <span>Bantuan</span>
              <ChevronRight size={16} className="text-slate-400"/>
            </li>
            <li className="sidebar-btn-container">
              <button className="sidebar-login-btn" onClick={handleLogin}>
                Login / Register
              </button>
            </li>
          </ul>
          
          <div className="sidebar-footer">
            <p>&copy; 2025 DPPPA Banjarmasin</p>
          </div>
        </div>

      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-left-img">
          {/* Pastikan file vektor.jpg ada di folder public */}
          <img src="/vektor.jpg" alt="illustration" className="hero-img" />
        </div>

        <div className="hero-right-text">
          <h3 className="hero-subtitle">DPPPA KOTA BANJARMASIN</h3>
          <h2 className="hero-title">
            Portal <span>DP3A</span>
          </h2>
          <p className="hero-desc">
            Layanan Pengaduan Perempuan & Anak Kota Banjarmasin
          </p>
          <button className="hero-btn cta-btn" onClick={onStart}>
            Login / Register
          </button>
        </div>
      </section>
    </div>
  );
}