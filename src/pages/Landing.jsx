import React, { useState } from "react";
import { 
  Menu, X, ChevronRight, MapPin, Phone, Mail, Clock, 
  Instagram, Youtube, Facebook, Hash, PlayCircle 
} from "lucide-react"; 
import BannerSlider from "../components/BannerSlider"; 
import "./Landing.css";

export default function Landing({ onStart, onAbout, onHelp }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // --- FUNGSI SCROLL OTOMATIS ---
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setSidebarOpen(false); // Tutup sidebar jika di mode HP
    }
  };

  const handleAbout = () => { if (onAbout) onAbout(); setSidebarOpen(false); };
  const handleHelp = () => { if (onHelp) onHelp(); setSidebarOpen(false); };
  const handleLogin = () => { if (onStart) onStart(); setSidebarOpen(false); };

  // Data Video Sidebar
  const sidebarVideos = [
    { id: "qOep768DpOg", title: "Kegiatan DP3A" },
    { id: "Qc5l3FLxzF0", title: "Sosialisasi" }
  ];

  // Data Tags
  const mainTags = [
    "Kekerasan Anak", "KDRT", "Perempuan", "Konseling", 
    "Hukum", "Banjarmasin", "Pengaduan", "Sosialisasi", "Edukasi"
  ];

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

        {/* --- DESKTOP MENU (LAPTOP) --- */}
        <div className="nav-right desktop-menu">
          <ul className="nav-links">
            {/* 1. Tentang Aplikasi */}
            <li className="nav-item" onClick={handleAbout}>Tentang Aplikasi</li>
            
            {/* 2. Profil Dinas (Scroll ke bawah) */}
            <li className="nav-item" onClick={() => scrollToSection('profil')}>Profil Dinas</li>
            
            {/* 3. Kontak (Scroll ke bawah) */}
            <li className="nav-item" onClick={() => scrollToSection('kontak')}>Kontak</li>
            
            {/* 4. Bantuan */}
            <li className="nav-item" onClick={handleHelp}>Bantuan</li>
          </ul>
          <button className="hero-btn navbar-btn" onClick={onStart}>Login / Register</button>
        </div>

        {/* --- MOBILE MENU BUTTON --- */}
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          <Menu size={28} color="#333" />
        </button>

        {/* --- MOBILE SIDEBAR --- */}
        <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>

        <div className={`mobile-sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <div className="sidebar-header">
            <h3 className="sidebar-title">Menu Utama</h3>
            <button onClick={() => setSidebarOpen(false)} className="close-btn"><X size={24} /></button>
          </div>
          <ul className="sidebar-list">
            <li onClick={handleAbout}>
              <span>Tentang Aplikasi</span><ChevronRight size={16} className="text-slate-400"/>
            </li>
            
            {/* Menu Mobile: Profil Dinas */}
            <li onClick={() => scrollToSection('profil')}>
              <span>Profil Dinas</span><ChevronRight size={16} className="text-slate-400"/>
            </li>

            {/* Menu Mobile: Kontak */}
            <li onClick={() => scrollToSection('kontak')}>
              <span>Kontak</span><ChevronRight size={16} className="text-slate-400"/>
            </li>

            <li onClick={handleHelp}>
              <span>Bantuan</span><ChevronRight size={16} className="text-slate-400"/>
            </li>
            
            <li className="sidebar-btn-container">
              <button className="sidebar-login-btn" onClick={handleLogin}>Login / Register</button>
            </li>
          </ul>
          <div className="sidebar-footer"><p>© 2025 DPPPA Banjarmasin</p></div>
        </div>
      </nav>

      {/* ===========================
          BANNER SLIDER
      =========================== */}
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
          <h2 className="hero-title">Portal <span>DP3A</span></h2>
          <p className="hero-desc">Layanan Pengaduan Perempuan & Anak Kota Banjarmasin. Bersama kita lindungi perempuan dan anak dari kekerasan.</p>
          <button className="hero-btn cta-btn" onClick={onStart}>Login / Register</button>
        </div>
      </section>

      {/* ===========================
          PROFIL & SIDEBAR SECTION
      =========================== */}
      {/* ID ditambahkan di sini untuk target scroll */}
      <section className="profile-section" id="profil">
        <div className="profile-container">
          
          <div className="profile-layout">
            
            {/* KOLOM KIRI: PROFIL UTAMA */}
            <div className="profile-main">
              <div className="section-header">
                <h2 className="profile-title">Profil DPPPA Kota Banjarmasin</h2>
                <div className="title-underline"></div>
              </div>
              
              <div className="video-wrapper">
                <iframe 
                  src="https://drive.google.com/file/d/1MbKQxv8B4xjPFyl2XIwjAgMjwLPgwCmw/preview" 
                  title="Video Profil DPPPA"
                  allow="autoplay"
                  allowFullScreen
                ></iframe>
              </div>

              <p className="profile-desc">
                Dinas Pemberdayaan Perempuan dan Perlindungan Anak (DPPPA) Kota Banjarmasin merupakan unsur pelaksana urusan pemerintahan yang menjadi kewenangan daerah di bidang pemberdayaan perempuan dan perlindungan anak.
                <br /><br />
                Kami berkomitmen mewujudkan kesetaraan gender, perlindungan hak perempuan, serta pemenuhan hak anak demi terciptanya masyarakat kota yang inklusif, aman, dan sejahtera.
              </p>
            </div>

            {/* KOLOM KANAN: SIDEBAR WIDGETS */}
            <div className="profile-sidebar">
              
              {/* WIDGET 1: VIDEO YOUTUBE */}
              <div className="sidebar-widget">
                <h3 className="widget-title flex items-start">
                  <PlayCircle size={24} className="inline mr-2 text-red-600 mt-1 flex-shrink-0" />
                  <span className="text-sm md:text-base leading-tight">
                    Komunikasi FISIP ULM x DPPPA Kota Banjarmasin
                  </span>
                </h3>
                <div className="sidebar-video-list">
                  {sidebarVideos.map((video, index) => (
                    <div key={index} className="sidebar-video-item">
                      <iframe 
                        src={`https://www.youtube.com/embed/${video.id}`} 
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  ))}
                </div>
              </div>

              {/* WIDGET 2: TAGS */}
              <div className="sidebar-widget">
                <h3 className="widget-title">
                  <Hash size={20} className="inline mr-2" />
                  Tag Utama
                </h3>
                <div className="tags-cloud">
                  {mainTags.map((tag, index) => (
                    <span key={index} className="tag-item">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ===========================
          FOOTER
      =========================== */}
      {/* ID ditambahkan di sini untuk target scroll */}
      <footer className="landing-footer" id="kontak">
        <div className="footer-content">
          <div className="footer-map">
            <iframe 
              title="Lokasi Kantor DP3A Banjarmasin"
              src="https://maps.google.com/maps?q=Dinas%20Pemberdayaan%20Perempuan%20dan%20Perlindungan%20Anak%20Kota%20Banjarmasin&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%" height="250" style={{ border: 0, borderRadius: "12px" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="footer-info">
            <h3 className="footer-title">KONTAK KAMI</h3>
            <p className="footer-agency">Dinas Pemberdayaan Perempuan dan Perlindungan Anak (DP3A)</p>
            <div className="contact-item"><MapPin className="contact-icon" size={20} /><span>Jl. Sultan Adam No.18 Rt. 28 Rw. 03 Surgi Mufti, Banjarmasin (Gedung Disdukcapil Lt. 3)</span></div>
            <div className="contact-item"><Phone className="contact-icon" size={20} /><span>(0511) 3307-788 / 0895-0388-6767</span></div>
            <div className="contact-item"><Mail className="contact-icon" size={20} /><span>dpppa@banjarmasinkota.go.id</span></div>
            <div className="contact-item"><Clock className="contact-icon" size={20} /><span>Senin - Jumat: 08.00 - 16.00 WITA</span></div>
            <div className="footer-socials">
              <p className="social-label">Ikuti Kami:</p>
              <div className="social-icons">
                <a href="https://web.facebook.com/people/DPPPA-KOTA-BANJARMASIN/100063900066891/" target="_blank" rel="noreferrer" className="social-link facebook"><Facebook size={22} /></a>
                <a href="https://www.instagram.com/dpppa.banjarmasin?igsh=MWM1bTNzNXI2cjllZg==" target="_blank" rel="noreferrer" className="social-link instagram"><Instagram size={22} /></a>
                <a href="https://youtube.com/@dpppakotabanjarmasin?si=MY5B0asTqG1Pp8Tr" target="_blank" rel="noreferrer" className="social-link youtube"><Youtube size={22} /></a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom"><p>© 2025 Pemerintah Kota Banjarmasin - Portal DP3A</p></div>
      </footer>
    </div>
  );
}