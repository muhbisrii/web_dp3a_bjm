import React, { useState, useEffect } from "react";
import { 
  Menu, X, ChevronRight, MapPin, Phone, Mail, Clock, 
  Instagram, Youtube, Facebook, Hash, PlayCircle, Loader2,
  Sun, Moon, Calendar, ArrowRight,
  Download, Smartphone 
} from "lucide-react"; 
import { motion } from "framer-motion"; 
import BannerSlider from "../components/BannerSlider"; 
import "./Landing.css";

export default function Landing({ onStart, onAbout, onHelp }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- LOGIKA DARK MODE ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // --- VARIAN ANIMASI ---
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const fadeInDown = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setSidebarOpen(false);
    }
  };

  const handleNavWithDelay = (action) => {
    setSidebarOpen(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (action) action();
    }, 1200);
  };

  const handleAbout = () => handleNavWithDelay(onAbout);
  const handleHelp = () => handleNavWithDelay(onHelp);
  const handleLogin = () => handleNavWithDelay(onStart);

  // --- DATA BERITA ---
  const newsData = [
    {
      id: 1,
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj20v8yoRstj0ilYUFdsD4loc1CtBU1ByrKSpqCoKGPGOofhG6SLycEzaMGyT2Ttf8LZ_5dQXbiXTXX53xU9k106H1v7r6_fEUwl801XLLII4odZBS1heQj2krmxLMi2sN1T8f8RQF-unT72tUQS052sAxFwTlwBsQYK5S_oXjMBwUjFfNLymKq-W_7edo/w640-h480-rw/IMG_1178.HEIC",
      title: "Kampanye 16 Hari Anti Kekerasan",
      date: "Desember 02, 2025",
      desc: "DPPPA Kota Banjarmasin menggelar kampanye serentak sebagai bentuk komitmen mengakhiri kekerasan terhadap perempuan dan anak.",
      link: "https://dpppa.banjarmasinkota.go.id/2025/12/kampanye-16-hari-anti-kekerasan.html"
    },
    {
      id: 2,
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgTAPaBvpAkHgDWXQgvlNgkcFOvQw40xa44c92AoFz5bNVb5BYApdPMl469VUr9BvyiWmWa1gwvyZoa3oxGYlZzq-9wYlsAxS7NhwJVyRWGhSsuSRn8NDLjIAxWH5F59DhIeqtXykHz1aoFB4PpMAU_6M46dDUim3IVE2Zp3I-rWtr4oTGsBIlBe-LJymg/w512-h640-rw/SnapInsta.to_588512863_18175237591367406_4792646108763604928_n.jpg",
      title: "Pendampingan Unit Penyedia Layanan",
      date: "November 28, 2025",
      desc: "Optimalisasi peran unit layanan dalam penanganan kasus melalui pendampingan teknis yang berkelanjutan.",
      link: "https://dpppa.banjarmasinkota.go.id/2025/11/pendampingan-unit-penyedia-layanan.html"
    },
    {
      id: 3,
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhvumMWDBTpXCnXcdl09GwmGNnFkKzCy9NM7NI1IIXMFFKrhgrGsIOwNxR3X6Nw4KMchCI9oBaHSZmyPtzFXICGPNLTzIWzclMCCEghc__8-7lV1Eq-MeYOrMuhzhVAERFcXBWUvlPhqcXg4Z1lnvpygeCJTZU3ZyTCmgrv_4fhUkR0dJ7kTN9wevWZ_UQ/w640-h428-rw/WhatsApp%20Image%202025-11-26%20at%2013.32.07.jpeg",
      title: "Penetapan Peraturan Daerah Kota",
      date: "November 28, 2025",
      desc: "Penetapan regulasi daerah terbaru untuk memperkuat landasan hukum perlindungan anak dan pemberdayaan perempuan di Banjarmasin.",
      link: "https://dpppa.banjarmasinkota.go.id/2025/11/penetapan-peraturan-daerah-kota.html"
    },
    {
      id: 4,
      image: "https://blogger.googleusercontent.com/img/a/AVvXsEi0FZHQJsvepzuR_FKi9bZK70KxoxfSbB51nRnv1cE1XKXbCqJC4z4opIdnH38VNtm8IyAT9b2cqxSkRvJ-tP7MxKnmBrKAbCC6W6nkYrsFaqjS9_UjZgw44n3FUqemYtQfsD3OJl8xmxvm-yFqlCj-vS-b5WYx4rPb9C9v6-BKTkKrYAFYPs6q0if0gH8=w600-h640-rw",
      title: "Bimbingan Teknis Anggaran Responsif",
      date: "November 28, 2025",
      desc: "Pelaksanaan Bimtek penyusunan anggaran responsif gender (ARG) guna memastikan pembangunan yang inklusif dan tepat sasaran.",
      link: "https://dpppa.banjarmasinkota.go.id/2025/11/bimbingan-teknis-anggaran-responsif.html"
    }
  ];

  const sidebarVideos = [
    { id: "qOep768DpOg", title: "Kegiatan DP3A" },
    { id: "Qc5l3FLxzF0", title: "Sosialisasi" }
  ];

  const mainTags = [
    "Kekerasan Anak", "KDRT", "Perempuan", "Konseling", 
    "Hukum", "Banjarmasin", "Pengaduan", "Sosialisasi", "Edukasi"
  ];

  return (
    <div className="landing-container overflow-hidden">
      
      {isLoading && (
        <div className="loading-overlay-screen">
          <div className="loading-content">
            <Loader2 size={48} className="animate-spin text-white mb-4" />
            <p className="text-white font-semibold text-lg">Memuat Halaman...</p>
            <p className="text-white/70 text-sm">Mohon Tunggu Sebentar</p>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <motion.nav 
        className="landing-navbar"
        initial="hidden" animate="visible" variants={fadeInDown}
      >
        <div className="nav-left">
          <img src="/pemkot.png" alt="logo" className="logo" />
          <div className="nav-divider"></div>
          <div className="nav-text flex flex-col justify-center">
            {/* Judul Utama */}
            <h1 className="portal-title text-base sm:text-xl font-bold leading-tight">Portal DP3A</h1>
            
            {/* UPDATE: Subtitle dipaksa tampil (block) dengan ukuran font kecil di HP */}
            <p className="portal-subtitle text-[10px] sm:text-sm font-medium leading-none block text-slate-600 dark:text-slate-300">
              Layanan Pengaduan Masyarakat
            </p>
          </div>
        </div>

        <div className="nav-right desktop-menu">
          <ul className="nav-links">
            <li className="nav-item" onClick={handleAbout}>Tentang Aplikasi</li>
            <li className="nav-item" onClick={() => scrollToSection('berita')}>Berita</li>
            <li className="nav-item" onClick={() => scrollToSection('profil')}>Profil Dinas</li>
            <li className="nav-item" onClick={() => scrollToSection('kontak')}>Kontak</li>
            <li className="nav-item" onClick={handleHelp}>Bantuan</li>
          </ul>
          <button onClick={toggleTheme} className="theme-toggle-btn desktop-theme-btn" title={isDarkMode ? "Mode Terang" : "Mode Gelap"}>
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
          </button>
          <button className="hero-btn navbar-btn" onClick={handleLogin}>Login / Register</button>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <button onClick={toggleTheme} className="theme-toggle-btn mobile-theme-btn">
            {isDarkMode ? <Sun size={22} className="text-yellow-400" /> : <Moon size={22} />}
          </button>
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={28} className="menu-icon-color" />
          </button>
        </div>

        <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>

        <div className={`mobile-sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <div className="sidebar-header">
            <h3 className="sidebar-title">Menu Utama</h3>
            <button onClick={() => setSidebarOpen(false)} className="close-btn"><X size={24} /></button>
          </div>
          <ul className="sidebar-list">
            <li onClick={handleAbout}><span>Tentang Aplikasi</span><ChevronRight size={16} className="text-slate-400"/></li>
            <li onClick={() => scrollToSection('berita')}><span>Berita</span><ChevronRight size={16} className="text-slate-400"/></li>
            <li onClick={() => scrollToSection('profil')}><span>Profil Dinas</span><ChevronRight size={16} className="text-slate-400"/></li>
            <li onClick={() => scrollToSection('kontak')}><span>Kontak</span><ChevronRight size={16} className="text-slate-400"/></li>
            <li onClick={handleHelp}><span>Bantuan</span><ChevronRight size={16} className="text-slate-400"/></li>
            <li className="sidebar-btn-container"><button className="sidebar-login-btn" onClick={handleLogin}>Login / Register</button></li>
          </ul>
          <div className="sidebar-footer"><p>© 2025 DPPPA Banjarmasin</p></div>
        </div>
      </motion.nav>

      {/* BANNER SLIDER */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false }} transition={{ duration: 0.8 }}>
        <BannerSlider />
      </motion.div>

      {/* ===========================
          HERO SECTION (UPDATED FOR MOBILE)
      =========================== */}
      <section className="landing-hero">
        <motion.div 
          className="hero-box-container"
          initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} variants={staggerContainer}
        >
          <motion.div className="hero-left-img" variants={fadeInUp}>
            <img src="/vektor.png" alt="illustration" className="hero-img" />
          </motion.div>
          
          <motion.div 
            className="hero-right-text flex flex-col items-center sm:items-start text-center sm:text-left" 
            variants={fadeInUp}
          >
            {/* BADGE APLIKASI */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-100 dark:border-green-700 text-sm font-bold mb-4">
              <Smartphone size={16} />
              <span>Tersedia Aplikasi Android</span>
            </div>

            <h3 className="hero-subtitle">DPPPA KOTA BANJARMASIN</h3>
            <h2 className="hero-title">Portal <span>DP3A</span></h2>
            <p className="hero-desc">Layanan Pengaduan Perempuan & Anak Kota Banjarmasin. Bersama kita lindungi perempuan dan anak dari kekerasan.</p>
            
            {/* GROUP TOMBOL */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto items-center sm:items-start justify-center sm:justify-start">
              
              {/* Tombol Login */}
              <motion.button 
                className="flex items-center justify-center px-8 py-3 rounded-full font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all w-full sm:w-auto min-w-[200px]"
                onClick={handleLogin} 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                Login / Register
              </motion.button>

              {/* Tombol Download APK */}
              <motion.a 
                href="https://drive.google.com/file/d/1pt5h3CA_VBF-TZazCutiNt4MqSS-UPl2/view?usp=drivesdk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all w-full sm:w-auto min-w-[200px]"
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                style={{ textDecoration: 'none' }}
              >
                <Download size={20} />
                Download APK
              </motion.a>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 italic w-full text-center sm:text-left">
              *Klik "Download APK" untuk mengunduh & instal manual.
            </p>

          </motion.div>
        </motion.div>
      </section>

      {/* ===========================
          BERITA TERKINI SECTION
      =========================== */}
      <motion.section 
        className="news-section"
        id="berita" 
        initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} variants={fadeInUp}
      >
        <div className="profile-container">
          <div className="section-header text-center mb-10">
            <h2 className="profile-title">Berita Terkini</h2>
            <div className="title-underline mx-auto"></div>
            <p className="text-slate-500 mt-2 text-sm dark:text-slate-400">Informasi terbaru seputar kegiatan dan layanan DPPPA</p>
          </div>

          <div className="news-grid">
            {newsData.map((item) => (
              <motion.div 
                key={item.id} 
                className="news-card group"
                whileHover={{ y: -5 }}
              >
                <div className="news-image-wrapper">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="news-image" 
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top"
                    }}
                  />
                  <div className="news-overlay">
                    <a href={item.link} target="_blank" rel="noreferrer" className="read-more-btn">Baca Berita</a>
                  </div>
                </div>
                <div className="news-content">
                  <div className="news-date">
                    <Calendar size={14} className="mr-1" />
                    {item.date}
                  </div>
                  <h3 className="news-title">
                    <a href={item.link} target="_blank" rel="noreferrer">{item.title}</a>
                  </h3>
                  <p className="news-desc">{item.desc}</p>
                  <a href={item.link} target="_blank" rel="noreferrer" className="news-link">
                    Selengkapnya <ArrowRight size={14} className="ml-1" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* PROFIL & SIDEBAR SECTION */}
      <motion.section 
        className="profile-section" id="profil"
        initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.8 }} variants={fadeInUp}
      >
        <div className="profile-container">
          <div className="profile-layout">
            <div className="profile-main">
              <div className="section-header">
                <h2 className="profile-title">Profil DPPPA Kota Banjarmasin</h2>
                <div className="title-underline"></div>
              </div>
              <div className="video-wrapper">
                <iframe src="https://drive.google.com/file/d/1MbKQxv8B4xjPFyl2XIwjAgMjwLPgwCmw/preview" title="Video Profil DPPPA" allow="autoplay" allowFullScreen></iframe>
              </div>
              <p className="profile-desc">
                Dinas Pemberdayaan Perempuan dan Perlindungan Anak (DPPPA) Kota Banjarmasin merupakan unsur pelaksana urusan pemerintahan yang menjadi kewenangan daerah di bidang pemberdayaan perempuan dan perlindungan anak.
                <br /><br />
                Kami berkomitmen mewujudkan kesetaraan gender, perlindungan hak perempuan, serta pemenuhan hak anak demi terciptanya masyarakat kota yang inklusif, aman, dan sejahtera.
              </p>
            </div>

            <div className="profile-sidebar">
              <div className="sidebar-widget">
                <h3 className="widget-title flex items-start">
                  <PlayCircle size={24} className="inline mr-2 text-red-600 mt-1 flex-shrink-0" />
                  <span className="text-sm md:text-base leading-tight">Komunikasi FISIP ULM x DPPPA Kota Banjarmasin</span>
                </h3>
                <div className="sidebar-video-list">
                  {sidebarVideos.map((video, index) => (
                    <div key={index} className="sidebar-video-item">
                      <iframe src={`https://www.youtube.com/embed/${video.id}`} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sidebar-widget">
                <h3 className="widget-title"><Hash size={20} className="inline mr-2" />Tag Utama</h3>
                <div className="tags-cloud">
                  {mainTags.map((tag, index) => (
                    <motion.span key={index} className="tag-item" whileHover={{ scale: 1.1, backgroundColor: "#4f46e5", color: "#fff" }}>{tag}</motion.span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FOOTER */}
      <motion.footer 
        className="landing-footer" id="kontak"
        initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={fadeInUp}
      >
        <div className="footer-content">
          <div className="footer-map">
            <iframe title="Lokasi Kantor DP3A Banjarmasin" src="https://maps.google.com/maps?q=Dinas%20Pemberdayaan%20Perempuan%20dan%20Perlindungan%20Anak%20Kota%20Banjarmasin&t=&z=15&ie=UTF8&iwloc=&output=embed" width="100%" height="250" style={{ border: 0, borderRadius: "12px" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
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
      </motion.footer>
    </div>
  );
}