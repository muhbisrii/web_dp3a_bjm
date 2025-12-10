import React, { useState } from "react";
import "./Pages.css"; // Import CSS gabungan

export default function Help({ onBack }) {
  // State untuk mengatur accordion (buka/tutup pertanyaan)
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Data pertanyaan sesuai screenshot
  const faqData = [
    {
      question: "Bagaimana cara membuat laporan?",
      answer: "Anda dapat membuat laporan dengan menekan tombol 'Login / Register' di halaman utama, masuk ke akun, lalu isi formulir pengaduan."
    },
    {
      question: "Apa saja yang bisa saya laporkan?",
      answer: "Kekerasan fisik, psikis, seksual, penelantaran, serta eksploitasi terhadap perempuan dan anak di wilayah Banjarmasin."
    },
    {
      question: "Apakah data saya aman?",
      answer: "Ya, identitas pelapor dan korban dilindungi serta dirahasiakan sesuai dengan undang-undang perlindungan saksi dan korban."
    },
    {
      question: "Berapa lama laporan saya ditanggapi?",
      answer: "Laporan akan diverifikasi oleh petugas admin dalam waktu 1x24 jam pada hari kerja."
    }
  ];

  return (
    <div className="page-container">
      {/* Header dengan Shadow a la Parak Acil */}
      <header className="page-header">
        <button onClick={onBack} className="back-btn">
          &#8592;
        </button>
        <h1 className="header-title">Pusat Bantuan</h1>
      </header>

      <div className="content-scroll">
        
        {/* Section FAQ */}
        <section className="section-block">
          <h2 className="section-title">Pertanyaan Sering Diajukan (FAQ)</h2>
          
          <div className="faq-list">
            {faqData.map((item, index) => (
              <div key={index} className="faq-item">
                <button 
                  className={`faq-question ${activeIndex === index ? "active" : ""}`} 
                  onClick={() => toggleFAQ(index)}
                >
                  {item.question}
                  <span className="arrow-icon">&#8250;</span>
                </button>
                {activeIndex === index && (
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section Kontak */}
        <section className="section-block mt-4">
          <h2 className="section-title">Butuh Bantuan Lebih Lanjut?</h2>
          <p className="section-desc">
            Jika Anda mengalami kendala teknis atau pertanyaan lain, silakan hubungi kami melalui:
          </p>

          <div className="contact-list">
            {/* Email */}
            <div className="contact-item">
              <div className="icon-box email-icon">&#9993;</div>
              <div className="contact-info">
                <span className="contact-label">Email</span>
                <span className="contact-value">dpppa@banjarmasinkota.go.id</span>
              </div>
            </div>

            {/* Telepon */}
            <div className="contact-item">
              <div className="icon-box phone-icon">&#128222;</div>
              <div className="contact-info">
                <span className="contact-label">Telepon Kantor</span>
                <span className="contact-value">(0511) 3307-788</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}