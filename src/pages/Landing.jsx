import React, { useState } from "react";
import { Menu, X, ChevronRight, MapPin, Phone, Mail, Clock, Instagram, Youtube } from "lucide-react"; 
import BannerSlider from "../components/BannerSlider"; // Pastikan path ini benar sesuai lokasi BannerSlider.jsx Anda
import "./Landing.css";

export default function Landing({ onStart, onAbout, onHelp }) {
  // State untuk mengatur sidebar mobile
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleAbout = () => {
    if (onAbout) onAbout();
    setSidebarOpen(false);
  };

  const handleHelp = () => {
    if (onHelp) onHelp();
    setSidebarOpen(false);
  };

  const handleLogin = () => {
    if (onStart) onStart();
    setSidebarOpen(false);
  };

  return (
    <div className="landing-container">
      {/* ===========================
          NAVBAR SECTION
      =========================== */}
      <nav className="landing-navbar">
        <div className="nav-left">
          <img src="/pemkot.png" alt="logo" className="logo" />
          <div className="nav-divider"></div>
          <div className="nav-text">
            <h1 className="portal-title">Portal DP3A</h1>
            <p className="portal-subtitle">Layanan Pengaduan Masyarakat</p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="nav-right desktop-menu">
          <ul className="nav-links">
            <li className="nav-item" onClick={handleAbout}>Tentang Aplikasi</li>
            <li className="nav-item" onClick={handleHelp}>Bantuan</li>
          </ul>
          <button className="hero-btn navbar-btn" onClick={onStart}>
            Login / Register
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          <Menu size={28} color="#333" />
        </button>

        {/* Sidebar Overlay */}
        <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>

        {/* Sidebar Content */}
        <div className={`mobile-sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <div className="sidebar-header">
            <h3 className="sidebar-title">Menu Utama</h3>
            <button onClick={() => setSidebarOpen(false)} className="close-btn">
              <X size={24} />
            </button>
          </div>
          <ul className="sidebar-list">
            <li onClick={handleAbout}><span>Tentang Aplikasi</span><ChevronRight size={16} className="text-slate-400"/></li>
            <li onClick={handleHelp}><span>Bantuan</span><ChevronRight size={16} className="text-slate-400"/></li>
            <li className="sidebar-btn-container">
              <button className="sidebar-login-btn" onClick={handleLogin}>Login / Register</button>
            </li>
          </ul>
          <div className="sidebar-footer">
            <p>© 2025 DPPPA Banjarmasin</p>
          </div>
        </div>
      </nav>

      {/* ===========================
          BANNER SLIDER (IKLAN)
      =========================== */}
      {/* Bagian slider diletakkan di sini, tepat di bawah navbar */}
      <BannerSlider />

      {/* ===========================
          HERO SECTION
      =========================== */}
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
            Layanan Pengaduan Perempuan & Anak Kota Banjarmasin.
            Bersama kita lindungi perempuan dan anak dari kekerasan.
          </p>
          <button className="hero-btn cta-btn" onClick={onStart}>
            Login / Register
          </button>
        </div>
      </section>

      {/* ===========================
          FOOTER (KONTAK, MAPS & SOSMED)
      =========================== */}
      <footer className="landing-footer">
        <div className="footer-content">
          
          {/* MAPS SECTION */}
          <div className="footer-map">
            <iframe 
              title="Lokasi Kantor DP3A Banjarmasin"
              src="https://maps.google.com/maps?q=Dinas%20Pemberdayaan%20Perempuan%20dan%20Perlindungan%20Anak%20Kota%20Banjarmasin&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%" 
              height="250" 
              style={{ border: 0, borderRadius: "12px" }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          {/* INFORMASI KONTAK */}
          <div className="footer-info">
            <h3 className="footer-title">KONTAK KAMI</h3>
            <p className="footer-agency">Dinas Pemberdayaan Perempuan dan Perlindungan Anak (DP3A)</p>
            
            <div className="contact-item">
              <MapPin className="contact-icon" size={20} />
              <span>Jl. Sultan Adam No.18 Rt. 28 Rw. 03 Surgi Mufti, Banjarmasin (Gedung Disdukcapil Lt. 3)</span>
            </div>

            <div className="contact-item">
              <Phone className="contact-icon" size={20} />
              <span>(0511) 3307-788 / 0895-0388-6767</span>
            </div>

            <div className="contact-item">
              <Mail className="contact-icon" size={20} />
              <span>dpppa@banjarmasinkota.go.id</span>
            </div>

            <div className="contact-item">
              <Clock className="contact-icon" size={20} />
              <span>Senin - Jumat: 08.00 - 16.00 WITA</span>
            </div>

            {/* --- SOSIAL MEDIA --- */}
            <div className="footer-socials">
              <p className="social-label">Ikuti Kami:</p>
              <div className="social-icons">
                <a 
                  href="https://www.instagram.com/dpppa.banjarmasin?igsh=MWM1bTNzNXI2cjllZg==" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="social-link instagram"
                  aria-label="Instagram DPPPA Banjarmasin"
                >
                  <Instagram size={22} />
                </a>
                
                <a 
                  href="https://youtube.com/@dpppakotabanjarmasin?si=MY5B0asTqG1Pp8Tr" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="social-link youtube"
                  aria-label="YouTube DPPPA Banjarmasin"
                >
                  <Youtube size={22} />
                </a>
              </div>
            </div>

          </div>

        </div>
        
        <div className="footer-bottom">
          <p>© 2025 Pemerintah Kota Banjarmasin - Portal DP3A</p>
        </div>
      </footer>

    </div>
  );
}