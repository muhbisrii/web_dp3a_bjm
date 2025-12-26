// src/components/AiChatWidget.jsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Loader2, Zap, Trash2 } from 'lucide-react';
import './AiChatWidget.css';

// --- KONFIGURASI GROQ ---
// Pastikan variabel ini ada di file .env Anda: VITE_GROQ_API_KEY=gsk_...
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile"; 

// --- OTAK AI (SYSTEM PROMPT TETAP SAMA) ---
const SYSTEM_PROMPT = `
Kamu adalah "Si-PENA", asisten virtual cerdas & profesional dari DP3A Kota Banjarmasin.

***PERAN BARU (KONSULTAN PSIKOLOGIS & EMPATI)***:
Selain info pemerintahan, kamu juga bertindak sebagai **SAHABAT KONSELOR**.
1. **ACTIVE LISTENING**: Validasi perasaan pengguna.
2. **NON-JUDGMENTAL**: Jangan menghakimi.
3. **SARAN PENENANG**: Berikan saran psikologis ringan jika perlu.
4. **PEMBATASAN**: Kamu bukan Psikolog Klinis. Sarankan ke PUSPAGA atau UPTD PPA untuk kasus berat.

***PENGETAHUAN WAJIB***:
1. **DP3A**: Dinas Pemberdayaan Perempuan dan Perlindungan Anak Banjarmasin.
2. **LAYANAN**: UPTD PPA (Penanganan Kasus), PUSPAGA (Konseling Keluarga), KLA (Kota Layak Anak).
3. **LOKASI**: Jl. Sultan Adam No.18, Surgi Mufti.
4. **PEJABAT**: Jika ditanya nama Kepala Dinas, jawab secara umum bahwa dipimpin pejabat yang ditunjuk Walikota.

***GAYA BAHASA***:
1. Panggil "Kak" atau "Anda". Jangan "Bunda" kecuali diminta.
2. Hangat, Mengayomi, Informatif.
`;

const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  // --- STATE DENGAN SESSION STORAGE (Agar chat tidak hilang saat pindah menu) ---
  const [messages, setMessages] = useState(() => {
    const savedChat = sessionStorage.getItem("sipena_chat_history");
    return savedChat ? JSON.parse(savedChat) : [
      {
        id: 1,
        sender: 'bot',
        text: "Halo! Saya Si-PENA. 👋\n\nSaya siap menjadi teman cerita atau memberikan informasi seputar **DP3A & Layanan Pengaduan**.\n\nApa yang bisa saya bantu hari ini, Kak?"
      }
    ];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    sessionStorage.setItem("sipena_chat_history", JSON.stringify(messages));
    scrollToBottom();
  }, [messages, isOpen]);

  // --- LOGIKA AI (DIPERBAIKI AGAR TIDAK ERROR) ---
  const generateGroqResponse = async (userQuestion, currentHistory) => {
    if (!GROQ_API_KEY) {
      console.error("API Key hilang! Pastikan .env sudah benar.");
      return "Maaf, konfigurasi sistem belum lengkap (API Key Missing).";
    }

    try {
      // 1. FILTER HISTORY: 
      // Kita HAPUS pesan pertama (id: 1) dari memori yang dikirim ke AI.
      // Mengapa? Karena pesan pertama adalah 'assistant' tanpa 'user' sebelumnya.
      // Ini sering menyebabkan Error 400 pada model Llama.
      const cleanHistory = currentHistory
        .filter(msg => msg.id !== 1) // Hapus sapaan awal
        .slice(-6) // Hanya ingat 6 pesan terakhir agar ringan
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      // 2. REQUEST KE GROQ
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT }, // Instruksi otak utama
            ...cleanHistory,                             // Memori percakapan sebelumnya
            { role: "user", content: userQuestion }      // Pertanyaan baru user
          ],
          temperature: 0.7, 
          max_tokens: 600 
        })
      });

      const data = await response.json();

      // Cek Error spesifik dari API
      if (data.error) {
        console.error("Groq API Error:", data.error); 
        // Kembalikan pesan error yang lebih spesifik untuk debugging (opsional)
        return `Maaf, ada gangguan teknis: ${data.error.message}`;
      }

      return data.choices[0]?.message?.content || "Maaf, saya tidak dapat menjawab saat ini.";

    } catch (error) {
      console.error("Fetch Error:", error);
      return "Maaf, koneksi internet Anda terputus atau server sibuk.";
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: input };
    
    // Update UI dulu agar user melihat pertanyaannya
    const updatedMessages = [...messages, userMessage]; 
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Kirim pesan + riwayat (messages yg lama) ke fungsi AI
    // Note: kita kirim 'messages' (state lama) karena userMessage baru ditambahkan manual di dalam payload generateGroqResponse
    const aiResponseText = await generateGroqResponse(userMessage.text, messages);

    const botMessage = { id: Date.now() + 1, sender: 'bot', text: aiResponseText };
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleResetChat = () => {
    const defaultMsg = [{
      id: 1, // Reset ke ID 1 agar konsisten
      sender: 'bot',
      text: "Obrolan telah dihapus. Halo lagi! Ada yang ingin ditanyakan, Kak?"
    }];
    setMessages(defaultMsg);
    sessionStorage.removeItem("sipena_chat_history");
  };

  return (
    <div className="ai-widget-wrapper">
      {/* Tombol Floating */}
      <div className={`ai-toggle-btn ${isOpen ? 'hide' : ''}`} onClick={() => setIsOpen(true)}>
        <div className="btn-content">
          <MessageCircle size={28} />
          <span className="btn-text">Tanya Si-PENA</span>
        </div>
        <div className="btn-pulse"></div>
      </div>

      {/* Jendela Chat */}
      <div className={`ai-chat-box ${isOpen ? 'open' : ''}`}>

        {/* Header Biru */}
        <div className="ai-header" style={{background: 'linear-gradient(135deg, #2563eb, #1e40af)'}}> 
          <div className="header-info">
            <div className="bot-avatar">
              <Bot size={20} />
            </div>
            <div>
              <h3>Si-PENA (AI)</h3>
              <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', opacity: 0.9}}>
                <Zap size={12} fill="white" /> <span>Online • Memori Aktif</span>
              </div>
            </div>
          </div>
          <div className="header-actions" style={{display:'flex', gap:'8px'}}>
            <button onClick={handleResetChat} className="close-chat" title="Hapus Riwayat" style={{background:'rgba(255,255,255,0.2)'}}>
               <Trash2 size={16} />
            </button>
            <button onClick={() => setIsOpen(false)} className="close-chat">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="ai-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              {msg.sender === 'bot' && <div className="msg-avatar"><Bot size={16} /></div>}
              <div className="bubble">
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} style={{marginBottom: line ? '8px' : '0'}}>
                     {line.split("**").map((chunk, j) => 
                        j % 2 === 1 ? <strong key={j}>{chunk}</strong> : chunk
                      )}
                  </p>
                ))}
              </div>
              {msg.sender === 'user' && <div className="msg-avatar"><User size={16} /></div>}
            </div>
          ))}

          {isLoading && (
            <div className="message bot">
               <div className="msg-avatar"><Bot size={16} /></div>
               <div className="bubble loading">
                 <Loader2 className="animate-spin" size={16} /> Sedang mengetik...
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="ai-input-area">
          <input 
            type="text" 
            placeholder="Tanya tentang DP3A atau curhat..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage} disabled={!input.trim() || isLoading}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChatWidget;
