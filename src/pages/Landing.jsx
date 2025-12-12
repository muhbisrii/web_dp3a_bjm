import React, { useState, useEffect } from "react";
import { 
  Menu, X, ChevronRight, MapPin, Phone, Mail, Clock, 
  Instagram, Youtube, Facebook, Hash, PlayCircle, 
  Sun, Moon, Calendar, ArrowRight,
  Download, Smartphone, Zap,
  ChevronUp, ChevronDown, Loader2
} from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion"; 
import BannerSlider from "../components/BannerSlider"; 
import "./Landing.css";

export default function Landing({ onStart, onAbout, onHelp, onStats }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  
  // --- STATE UNTUK LOAD MORE BERITA ---
  const [visibleNewsCount, setVisibleNewsCount] = useState(3);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State Loading Halaman

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

  // --- DATA BERITA (HEADER TRENDING) ---
  const newsData = [
    {
      id: 1,
      title: "Kampanye 16 Hari Anti Kekerasan Terhadap Perempuan dan Anak",
      link: "https://dpppa.banjarmasinkota.go.id/2025/12/kampanye-16-hari-anti-kekerasan.html"
    },
    {
      id: 2,
      title: "Pendampingan Unit Penyedia Layanan Teknis Berkelanjutan",
      link: "https://dpppa.banjarmasinkota.go.id/2025/11/pendampingan-unit-penyedia-layanan.html"
    },
    {
      id: 3,
      title: "Penetapan Peraturan Daerah Kota Banjarmasin Terbaru",
      link: "https://dpppa.banjarmasinkota.go.id/2025/11/penetapan-peraturan-daerah-kota.html"
    },
    {
      id: 4,
      title: "Bimbingan Teknis Anggaran Responsif Gender (ARG)",
      link: "https://dpppa.banjarmasinkota.go.id/2025/11/bimbingan-teknis-anggaran-responsif.html"
    },
    {
      id: 5,
      title: "Manajemen Sumber Daya Keluarga",
      link: "https://dpppa.banjarmasinkota.go.id/2025/11/manajamen-sumber-daya-keluarga.html"
    }
  ];

  // --- DATA BERITA LENGKAP (GRID) ---
  const fullNewsData = [
    {
      id: 1,
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj20v8yoRstj0ilYUFdsD4loc1CtBU1ByrKSpqCoKGPGOofhG6SLycEzaMGyT2Ttf8LZ_5dQXbiXTXX53xU9k106H1v7r6_fEUwl801XLLII4odZBS1heQj2krmxLMi2sN1T8f8RQF-unT72tUQS052sAxFwTlwBsQYK5S_oXjMBwUjFfNLymKq-W_7edo/w640-h480-rw/IMG_1178.HEIC",
      title: "Kampanye 16 Hari Anti Kekerasan Terhadap Perempuan dan Anak",
      date: "Desember 02, 2025",
      desc: "DPPPA Kota Banjarmasin menggelar kampanye serentak sebagai bentuk komitmen mengakhiri kekerasan terhadap perempuan dan anak.",
      link: "https://dpppa.banjarmasinkota.go.id/2025/12/kampanye-16-hari-anti-kekerasan.html"
    },
    {
      id: 2,
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgTAPaBvpAkHgDWXQgvlNgkcFOvQw40xa44c92AoFz5bNVb5BYApdPMl469VUr9BvyiWmWa1gwvyZoa3oxGYlZzq-9wYlsAxS7NhwJVyRWGhSsuSRn8NDLjIAxWH5F59DhIeqtXykHz1aoFB4PpMAU_6M46dDUim3IVE2Zp3I-rWtr4oTGsBIlBe-LJymg/w512-h640-rw/SnapInsta.to_588512863_18175237591367406_4792646108763604928_n.jpg",
      title: "Pendampingan Unit Penyedia Layanan Teknis Berkelanjutan",
      date: "November 28, 2025",
      desc: "Optimalisasi peran unit layanan dalam penanganan kasus melalui pendampingan teknis yang berkelanjutan.",
      link: "https://dpppa.banjarmasinkota.go.id/2025/11/pendampingan-unit-penyedia-layanan.html"
    },
    {
      id: 3,
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhvumMWDBTpXCnXcdl09GwmGNnFkKzCy9NM7NI1IIXMFFKrhgrGsIOwNxR3X6Nw4KMchCI9oBaHSZmyPtzFXICGPNLTzIWzclMCCEghc__8-7lV1Eq-MeYOrMuhzhVAERFcXBWUvlPhqcXg4Z1lnvpygeCJTZU3ZyTCmgrv_4fhUkR0dJ7kTN9wevWZ_UQ/w640-h428-rw/WhatsApp%20Image%202025-11-26%20at%2013.32.07.jpeg",
      title: "Penetapan Peraturan Daerah Kota Banjarmasin Terbaru",
      date: "November 28, 2025",
      desc: "Penetapan regulasi daerah terbaru untuk memperkuat landasan hukum perlindungan anak dan pemberdayaan perempuan di Banjarmasin.",
      link: "https://dpppa.banjarmasinkota.go.id/2025/11/penetapan-peraturan-daerah-kota.html"
    },
    {
      id: 4,
      image: "https://blogger.googleusercontent.com/img/a/AVvXsEi0FZHQJsvepzuR_FKi9bZK70KxoxfSbB51nRnv1cE1XKXbCqJC4z4opIdnH38VNtm8IyAT9b2cqxSkRvJ-tP7MxKnmBrKAbCC6W6nkYrsFaqjS9_UjZgw44n3FUqemYtQfsD3OJl8xmxvm-yFqlCj-vS-b5WYx4rPb9C9v6-BKTkKrYAFYPs6q0if0gH8=w600-h640-rw",
      title: "Bimbingan Teknis Anggaran Responsif Gender (ARG)",
      date: "November 28, 2025",
      desc: "Pelaksanaan Bimtek penyusunan anggaran responsif gender (ARG) guna memastikan pembangunan yang inklusif dan tepat sasaran.",
      link: "https://dpppa.banjarmasinkota.go.id/2025/11/bimbingan-teknis-anggaran-responsif.html"
    },
    {
      id: 5,
      image: "https://blogger.googleusercontent.com/img/a/AVvXsEjR_5mFERuq7ZPghwlyf5-reuHDIj8vqOsmee5ihqazMav4EDFkni-WdG1JQrgMS_04cqdcN4_4d4u-Elgo2WjpgXuz65UUe7_TDkfXZaKPa9eQwPJQ4DqAoNhmx17H4U3krOZra-vpEATsOy1wXxRwfF32hpcGlTOwEIIcMOSvInJnIYZkIycoPAAhdKM=w640-h330-rw",
      title: "Manajemen Sumber Daya Keluarga",
      date: "November 25, 2025",
      desc: "Kegiatan sosialisasi dan peningkatan kapasitas tentang pentingnya manajemen sumber daya keluarga untuk ketahanan keluarga.",
      link: "https://dpppa.banjarmasinkota.go.id/2025/11/manajamen-sumber-daya-keluarga.html"
    }
  ];

  // --- LOGIKA TRENDING ---
  useEffect(() => {
    const interval = setInterval(() => {
      handleNextNews();
    }, 4000); 
    return () => clearInterval(interval);
  }, []);

  const handleNextNews = () => {
    setCurrentNewsIndex((prevIndex) => (prevIndex + 1) % newsData.length);
  };

  const handlePrevNews = () => {
    setCurrentNewsIndex((prevIndex) => (prevIndex === 0 ? newsData.length - 1 : prevIndex - 1));
  };

  const currentNews = newsData[currentNewsIndex];

  // --- LOGIKA LOAD MORE BERITA ---
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleNewsCount((prev) => prev + 3);
      setIsLoadingMore(false);
    }, 1500);
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

  // --- HANDLER NAVIGASI & LOADING ---
  const handleNavWithDelay = (action) => {
    setSidebarOpen(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (action) action();
    }, 2000);
  };

  const handleAbout = () => handleNavWithDelay(onAbout);
  const handleHelp = () => handleNavWithDelay(onHelp);
  const handleLogin = () => handleNavWithDelay(onStart);
  const handleStats = () => handleNavWithDelay(onStats);

  const sidebarVideos = [
    { id: "qOep768DpOg", title: "Kegiatan DP3A" },
    { id: "Qc5l3FLxzF0", title: "Sosialisasi" }
  ];

  const mainTags = [
    "Kekerasan Anak", "KDRT", "Perempuan", "Konseling", 
    "Hukum", "Banjarmasin", "Pengaduan", "Sosialisasi", "Edukasi"
  ];

  return (
    <div className="landing-container overflow-hidden bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* LOADING OVERLAY (ANIMASI KOTAK BERGERAK) */}
      {isLoading && (
        <div className="custom-loading-screen">
          <div className="custom-loader-content">
            <div className="sipd-loader">
              <div className="sipd-rect sipd-shape"></div>
              <div className="sipd-square sipd-shape"></div>
              <div className="sipd-square sipd-shape"></div>
            </div>
            <p className="loading-text-main">
              Mohon tunggu... Sedang memproses halaman. 
              <span className="loading-link"> Selengkapnya</span>
            </p>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <motion.nav 
        className="landing-navbar bg-white dark:bg-[#0f172a] shadow-lg border-b border-gray-200 dark:border-slate-800"
        initial="hidden" animate="visible" variants={fadeInDown}
      >
        <div className="nav-left flex items-center">
          <img src="/pemkot.png" alt="logo" className="logo w-10 h-10 sm:w-12 sm:h-12" />
          
          <div className="nav-divider h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div> 

          <div className="nav-text flex flex-col justify-center text-left">
            <h1 
              className="text-sm font-bold sm:text-lg text-slate-800 dark:text-white leading-none !block"
              style={{ display: 'block', opacity: 1, visibility: 'visible' }}
            >
              Portal DP3A
            </h1>
            <p 
              className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 leading-tight mt-0.5 !block"
              style={{ display: 'block', opacity: 1, visibility: 'visible' }}
            >
              Layanan Pengaduan Masyarakat
            </p>
          </div>
        </div>

        {/* MENU DESKTOP */}
        <div className="nav-right desktop-menu flex items-center">
          <ul className="nav-links flex gap-4 text-[14px] font-normal mr-5 items-center text-slate-600 dark:text-slate-300">
            <li className="nav-item cursor-pointer hover:text-blue-600 transition-colors" onClick={handleAbout}>Tentang Aplikasi</li>
            <li className="nav-item cursor-pointer hover:text-blue-600 transition-colors" onClick={handleStats}>Statistik Layanan</li>
            <li className="nav-item cursor-pointer hover:text-blue-600 transition-colors" onClick={() => scrollToSection('berita')}>Berita</li>
            <li className="nav-item cursor-pointer hover:text-blue-600 transition-colors" onClick={() => scrollToSection('profil')}>Profil Dinas</li>
            <li className="nav-item cursor-pointer hover:text-blue-600 transition-colors" onClick={() => scrollToSection('kontak')}>Kontak</li>
            <li className="nav-item cursor-pointer hover:text-blue-600 transition-colors" onClick={handleHelp}>Bantuan</li>
          </ul>
          
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="theme-toggle-btn p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors" title={isDarkMode ? "Mode Terang" : "Mode Gelap"}>
              {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-600" />}
            </button>
            <button 
              className="px-4 py-2 bg-[#00AEEF] hover:bg-sky-600 text-white text-[13px] font-medium rounded-lg shadow-sm transition-all" 
              onClick={handleLogin}
            >
              Login / Register
            </button>
          </div>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex items-center gap-3 md:hidden">
          <button onClick={toggleTheme} className="theme-toggle-btn mobile-theme-btn">
            {isDarkMode ? <Sun size={22} className="text-yellow-400" /> : <Moon size={22} className="text-slate-600" />}
          </button>
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={28} />
          </button>
        </div>

        <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>

        {/* SIDEBAR MOBILE */}
        <div className={`mobile-sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <div className="sidebar-header">
            <h3 className="sidebar-title">Menu Utama</h3>
            <button onClick={() => setSidebarOpen(false)} className="close-btn"><X size={24} /></button>
          </div>
          <ul className="sidebar-list">
            <li onClick={handleAbout}><span>Tentang Aplikasi</span><ChevronRight size={16} /></li>
            <li onClick={handleStats}><span>Statistik Layanan</span><ChevronRight size={16} /></li>
            <li onClick={() => { scrollToSection('berita'); setSidebarOpen(false); }}><span>Berita</span><ChevronRight size={16} /></li>
            <li onClick={() => { scrollToSection('profil'); setSidebarOpen(false); }}><span>Profil Dinas</span><ChevronRight size={16} /></li>
            <li onClick={() => { scrollToSection('kontak'); setSidebarOpen(false); }}><span>Kontak</span><ChevronRight size={16} /></li>
            <li onClick={handleHelp}><span>Bantuan</span><ChevronRight size={16} /></li>
            <li className="sidebar-btn-container"><button className="sidebar-login-btn" onClick={handleLogin}>Login / Register</button></li>
          </ul>
          <div className="sidebar-footer"><p>© 2025 DPPPA Banjarmasin</p></div>
        </div>
      </motion.nav>

      {/* BANNER SLIDER */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false }} transition={{ duration: 0.8 }} className="relative z-0">
        <BannerSlider />
      </motion.div>

      {/* BOX TRENDING */}
      <div className="w-full py-6 relative z-10 -mt-10 mb-4 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="trending-box rounded-xl p-4 flex items-center shadow-lg relative overflow-hidden transition-colors duration-300 h-16">
            <div className="text-[#1A73E8] font-bold text-sm md:text-base mr-4 shrink-0 flex items-center">
              <Zap size={18} className="mr-2 fill-current" />
              Trending:
            </div>
            <div className="flex-1 h-[24px] md:h-[28px] overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.a
                  key={currentNews.id}
                  href={currentNews.link}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="trending-text absolute truncate w-full text-xs md:text-sm font-medium block leading-normal transition-colors"
                >
                  {currentNews.title}
                </motion.a>
              </AnimatePresence>
            </div>
            <div className="flex flex-col gap-1 ml-4 shrink-0 justify-center">
               <button onClick={handlePrevNews} className="trending-arrow transition-colors p-0.5" title="Berita Sebelumnya"><ChevronUp size={16} /></button>
               <button onClick={handleNextNews} className="trending-arrow transition-colors p-0.5" title="Berita Selanjutnya"><ChevronDown size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* ===========================
          HERO SECTION (ANIMASI FLOATING)
      =========================== */}
      <section className="landing-hero relative z-0">
        <motion.div 
          className="hero-box-container"
          initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} variants={staggerContainer}
        >
          <motion.div className="hero-left-img" variants={fadeInUp}>
            {/* --- GAMBAR VEKTOR MENGAMBANG --- */}
            <motion.img 
              src="/vektor.png" 
              alt="illustration" 
              className="hero-img"
              animate={{ y: [0, -20, 0] }} // Gerak naik turun 20px
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </motion.div>
          
          <motion.div 
            className="hero-right-text flex flex-col items-center sm:items-start text-center sm:text-left" 
            variants={fadeInUp}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-100 dark:border-green-700 text-sm font-bold mb-4">
              <Smartphone size={16} />
              <span>Tersedia Aplikasi Android</span>
            </div>

            <h3 className="hero-subtitle">DPPPA KOTA BANJARMASIN</h3>
            <h2 className="hero-title">Portal <span>DP3A</span></h2>
            <p className="hero-desc">Layanan Pengaduan Perempuan & Anak Kota Banjarmasin. Bersama kita lindungi perempuan dan anak dari kekerasan.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto items-center sm:items-start justify-center sm:justify-start">
              <motion.button 
                className="flex items-center justify-center px-8 py-3 rounded-full font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all w-full sm:w-auto min-w-[200px]"
                onClick={handleLogin} 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                Login / Register
              </motion.button>

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

      {/* BERITA SECTION */}
      <motion.section 
        className="news-section relative z-0" id="berita" 
        initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} variants={fadeInUp}
      >
        <div className="profile-container">
          <div className="section-header text-center mb-10">
            <h2 className="profile-title">Berita Terkini</h2>
            <div className="title-underline mx-auto"></div>
            <p className="text-slate-500 mt-2 text-sm dark:text-slate-400">Informasi terbaru seputar kegiatan dan layanan DPPPA</p>
          </div>

          <div className="news-grid">
            {fullNewsData.slice(0, visibleNewsCount).map((item) => (
              <motion.div 
                key={item.id} 
                className="news-card group"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
              >
                <div className="news-image-wrapper">
                  <img src={item.image} alt={item.title} className="news-image" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                  <div className="news-overlay"><a href={item.link} target="_blank" rel="noreferrer" className="read-more-btn">Baca Berita</a></div>
                </div>
                <div className="news-content">
                  <div className="news-date"><Calendar size={14} className="mr-1" />{item.date}</div>
                  <h3 className="news-title"><a href={item.link} target="_blank" rel="noreferrer">{item.title}</a></h3>
                  <p className="news-desc">{item.desc}</p>
                  <a href={item.link} target="_blank" rel="noreferrer" className="news-link">Selengkapnya <ArrowRight size={14} className="ml-1" /></a>
                </div>
              </motion.div>
            ))}
          </div>

          {visibleNewsCount < fullNewsData.length && (
            <div className="text-center mt-10">
              <button onClick={handleLoadMore} disabled={isLoadingMore} className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all flex items-center justify-center mx-auto">
                {isLoadingMore ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                {isLoadingMore ? "Memuat..." : "Muat postingan lainnya!"}
              </button>
            </div>
          )}
        </div>
      </motion.section>

      {/* PROFIL & SIDEBAR */}
      <motion.section 
        className="profile-section relative z-0" id="profil"
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
        className="landing-footer relative z-0" id="kontak"
        initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={fadeInUp}
      >
        <div className="footer-content">
          <div className="footer-map"><iframe title="Lokasi Kantor DP3A Banjarmasin" src="https://maps.google.com/maps?q=Dinas%20Pemberdayaan%20Perempuan%20dan%20Perlindungan%20Anak%20Kota%20Banjarmasin&t=&z=15&ie=UTF8&iwloc=&output=embed" width="100%" height="250" style={{ border: 0, borderRadius: "12px" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe></div>
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