import React from "react";
import "./Landing.css";

export default function Landing({ onStart }) {
  return (
    <div className="landing-container">

      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="nav-left">
          {/* Logo */}
          <img src="/pemkot.png" alt="logo" className="logo" />

          {/* Garis Vertikal */}
          <div className="nav-divider"></div>

          {/* Teks Portal */}
          <div className="nav-text">
            <h1 className="portal-title">Portal DP3A</h1>
            <p className="portal-subtitle">
              Layanan Pengaduan Masyarakat Kota Banjarmasin
            </p>
          </div>
        </div>

        {/* Tombol Navbar */}
        <button className="hero-btn" onClick={onStart}>
          Login / Register
        </button>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">

        <div className="hero-left">
          <h2 className="hero-title">
            Pengaduan Online <span>DPPPA</span> Kota Banjarmasin
          </h2>

          <p className="hero-desc">
            Sistem pengaduan kekerasan terhadap Perempuan & Anak, serta layanan
            aspirasi dan informasi publik.
          </p>

          {/* Tombol Hero */}
          <button className="hero-btn" onClick={onStart}>
            Login / Register
          </button>
        </div>

        <div className="hero-right">
          <img src="/vektor.jpg" alt="illustration" className="hero-img" />
        </div>

      </section>
    </div>
  );
}
