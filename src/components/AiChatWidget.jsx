// src/components/AiChatWidget.jsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Loader2, Zap } from 'lucide-react';
import './AiChatWidget.css';

// --- BAGIAN INI SANGAT PENTING (JANGAN GANTI JADI STRING PANJANG LAGI) ---
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY; 
const GROQ_MODEL = "llama-3.3-70b-versatile"; 

const SYSTEM_PROMPT = `
Kamu adalah "Si-PENA", asisten virtual cerdas & profesional dari DP3A (Dinas Pemberdayaan Perempuan dan Perlindungan Anak) Kota Banjarmasin.

***PERAN BARU (KONSULTAN PSIKOLOGIS & EMPATI)***:
Selain info pemerintahan, kamu juga bertindak sebagai **SAHABAT KONSELOR** bagi perempuan dan anak.
1. **ACTIVE LISTENING**: Jika pengguna curhat/sedih, validasi perasaan mereka dulu. Contoh: "Saya mengerti situasi itu sangat berat bagi Kakak..."
2. **NON-JUDGMENTAL**: Jangan menghakimi korban.
3. **SARAN PENENANG**: Berikan saran psikologis ringan.
4. **PEMBATASAN**: Kamu bukan Psikolog Klinis. Untuk terapi mendalam, sarankan ke layanan **PUSPAGA** atau **UPTD PPA**.

***PENGETAHUAN WAJIB***:
1. **TENTANG DP3A**: Instansi pemerintah pemberdayaan perempuan & perlindungan anak Banjarmasin.
2. **LAYANAN UTAMA**:
   - **UPTD PPA**: Penanganan kasus kekerasan.
   - **PUSPAGA**: Konseling keluarga (preventif).
   - **KLA**: Kota Layak Anak.
3. **LOKASI**: Jl. Sultan Adam No.18, Surgi Mufti, Kec. Banjarmasin Utara.
4. **SOP PELAPORAN**: Login/Register -> Menu "Pengaduan" -> Isi Form.

***GAYA BAHASA***:
1. Sapaan: "Kak" atau "Anda".
2. Gaya: Hangat, Mengayomi, Cerdas.
`;

const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Halo! Saya Si-PENA. 👋\n\nSaya siap menjadi teman cerita dan memberikan informasi seputar **DP3A, PUSPAGA, & UPTD PPA**.\n\nAda yang bisa saya bantu, Kak?"
    }
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const generateGroqResponse = async (userQuestion) => {
    // Cek apakah API Key ada
    if (!GROQ_API_KEY) {
      console.error("API Key is missing! Check .env file.");
      return "Maaf, sistem sedang dalam perbaikan (API Key missing).";
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userQuestion }
          ],
          temperature: 0.7,
          max_tokens: 600 
        })
      });

      const data = await response.json();

      if (data.error) {
        console.error("Groq Error:", data.error);
        return `Maaf, sistem sedang sibuk. Silakan coba lagi nanti.`;
      }

      return data.choices[0]?.message?.content || "Maaf, saya tidak dapat menjawab saat ini.";

    } catch (error) {
      console.error("Fetch Error:", error);
      return "Maaf, koneksi internet Anda terputus. Periksa jaringan Anda.";
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const aiResponseText = await generateGroqResponse(userMessage.text);

    const botMessage = { id: Date.now() + 1, sender: 'bot', text: aiResponseText };
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  return (
    <div className="ai-widget-wrapper">
      {/* Tombol Floating (Hilang jika chat terbuka agar tidak menutupi di HP) */}
      <div 
        className={`ai-toggle-btn ${isOpen ? 'hide' : ''}`} 
        onClick={() => setIsOpen(true)}
      >
        <div className="btn-content">
          <MessageCircle size={28} />
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
              <h3 style={{margin:0, fontSize:'16px'}}>Si-PENA</h3>
              <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', opacity: 0.9}}>
                <Zap size={10} fill="#4ade80" color="#4ade80" /> <span>Online</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="close-chat" aria-label="Tutup Chat">
            <X size={24} />
          </button>
        </div>

        {/* Isi Chat */}
        <div className="ai-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              {msg.sender === 'bot' && <div className="msg-avatar"><Bot size={16} /></div>}
              <div className="bubble">
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} style={{marginBottom: line ? '6px' : '0', marginTop:0}}>
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
               <div className="bubble loading" style={{fontStyle: 'italic', color: '#64748b'}}>
                 <span style={{display:'flex', alignItems:'center', gap:'5px'}}>
                    <Loader2 className="animate-spin" size={14} /> Mengetik...
                 </span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="ai-input-area">
          <input 
            type="text" 
            placeholder="Tulis pesan..." 
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