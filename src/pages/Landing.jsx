import React from "react";
import "./Landing.css";

// Tambahkan props onAbout dan onHelp di sini
export default function Landing({ onStart, onAbout, onHelp }) {
  
  // Tidak perlu lagi alert, langsung panggil fungsi dari props
  const handleAbout = () => {
    if (onAbout) onAbout();
  };

  const handleHelp = () => {
    if (onHelp) onHelp();
  };

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav 
        className="landing-navbar" 
        style={{ 
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)", 
          position: "sticky", 
          top: 0, 
          zIndex: 1000,
          backgroundColor: "#ffffff"
        }}
      >
        
        {/* Bagian Kiri: Logo & Judul */}
        <div className="nav-left">
          <img src="/pemkot.png" alt="logo" className="logo" />
          <div className="nav-divider"></div>
          <div className="nav-text">
            <h1 className="portal-title">Portal DP3A</h1>
            <p className="portal-subtitle">
              Layanan Pengaduan Perempuan & Anak Kota Banjarmasin
            </p>
          </div>
        </div>

        {/* Bagian Kanan: Menu & Tombol Login */}
        <div className="nav-right">
          <ul className="nav-links">
            {/* Panggil fungsi handleAbout saat diklik */}
            <li className="nav-item" onClick={handleAbout}>
              Tentang Aplikasi
            </li>
            {/* Panggil fungsi handleHelp saat diklik */}
            <li className="nav-item" onClick={handleHelp}>
              Bantuan
            </li>
          </ul>

          <button className="hero-btn navbar-btn" onClick={onStart}>
            Login / Register
          </button>
        </div>

      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        
        <div className="hero-left-img">
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