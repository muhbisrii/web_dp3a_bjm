import React from "react";
import "./Pages.css"; 

export default function About({ onBack }) {
  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <button onClick={onBack} className="back-btn">
          &#8592;
        </button>
        <h1 className="header-title">Tentang Aplikasi</h1>
      </header>

      <div className="content-scroll centered-content">
        
        {/* Logo Wrapper (Menampung 3 Logo Berjajar) */}
        <div className="logos-row">
          {/* 1. Logo Generik/Kiri (Opsional/Placeholder jika tidak ada file) */}
           {/* Gunakan class 'logo-side' agar ukurannya pas */}
          <div className="logo-placeholder-circle">
             {/* Ikon Vektor Keluarga/Anak (Bisa diganti img jika ada) */}
             <span>&#128106;</span> 
          </div>

          {/* 2. Logo Pemkot (Tengah) - Mengambil dari file yang Anda pakai di Landing */}
          <img src="/pemkot.png" alt="Pemko Banjarmasin" className="logo-center" />

          {/* 3. Logo DP3A (Kanan) - Sesuai request */}
          <img src="/logo-dp3a.png" alt="DP3A" className="logo-side" />
        </div>

        {/* Judul & Versi */}
        <h2 className="app-name">Layanan Pengaduan DPPPA Banjarmasin</h2>
        <p className="app-version">Versi 1.0.0 (Build 1)</p>

        {/* Deskripsi */}
        <div className="app-description">
          <p>
            Aplikasi ini dibuat untuk memudahkan masyarakat Kota Banjarmasin dalam 
            melaporkan kejadian kekerasan terhadap perempuan dan anak. Dikelola oleh 
            Dinas Pemberdayaan Perempuan dan Perlindungan Anak Kota Banjarmasin.
          </p>
        </div>

        {/* Footer Copyright */}
        <div className="app-footer">
          <p>&copy; 2025 - DPPPA Kota Banjarmasin</p>
        </div>

      </div>
    </div>
  );
}