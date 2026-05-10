import { useState, useRef, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { useLocation } from "wouter";
import {
  X, Send, Mic, MicOff, Volume2, VolumeX,
  Search, Brain, FileText, HelpCircle, Minimize2,
} from "lucide-react";

const QUICK_ACTIONS = [
  { icon: Search,     label: "Find Jobs",      color: "#6366f1", bg: "#eef2ff", msg: "Help me find relevant jobs on Recruweb. What positions are available?" },
  { icon: Brain,      label: "Interview Prep", color: "#8b5cf6", bg: "#f5f3ff", msg: "Help me prepare for my upcoming interview. Give me common questions and tips." },
  { icon: FileText,   label: "Resume Tips",    color: "#0891b2", bg: "#ecfeff", msg: "Give me tips to improve my resume and make it ATS-friendly." },
  { icon: HelpCircle, label: "Support",        color: "#10b981", bg: "#ecfdf5", msg: "I need help with the Recruweb platform. What can you help me with?" },
];

const SUGGESTIONS = [
  "Jobs in Delhi NCR for React developer",
  "How to crack TCS interview?",
  "Tips for fresher resume",
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#6366f1", display: "inline-block",
          animation: "chatBounce 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.18}s`, opacity: 0.7,
        }} />
      ))}
    </div>
  );
}

function formatMessage(content) {
  return content.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-1" />;
    if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
      const text = line.replace(/^[•\-*]\s*/, "");
      const html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <div key={i} className="flex items-start gap-1.5 text-sm leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-current opacity-40 shrink-0" />
          <span dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      );
    }
    const html = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    return <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Namaste! 👋 I'm your **Recruweb AI Career Assistant**, powered by Gemini AI.\n\nI can help with:\n• 🔍 **Job search** — find the right roles for your skills\n• 🎤 **Interview prep** — role & company-specific tips\n• 📄 **Resume review** — ATS optimization advice\n• 💬 **Platform support** — any queries about Recruweb\n\nWhat would you like help with today?",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [fabHover, setFabHover] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const sendMessageRef = useRef(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => setPopupVisible(true), 10);
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setPopupVisible(false);
    }
  }, [open, minimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-IN";
    rec.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setInput(final || interim);
    };
    rec.onend = () => {
      setIsListening(false);
      setInput(prev => { if (prev.trim()) setTimeout(() => sendMessageRef.current(prev), 100); return prev; });
    };
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
  }, []);

  const speakText = useCallback((text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*•#🔍🎤📄💬👋]/g, "").replace(/\n/g, " ").trim();
    const utt = new SpeechSynthesisUtterance(clean.slice(0, 300));
    utt.lang = "en-IN"; utt.rate = 1.05; utt.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => v.name.includes("Google") || v.lang.includes("en")) || voices[0];
    if (v) utt.voice = v;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, [voiceEnabled]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text !== undefined ? text : input).trim();
    if (!msg || loading) return;
    setInput("");
    setShowWelcome(false);
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    const jobKeywords = ["find job", "search job", "job in", "jobs in", "job for", "jobs for", "vacancy", "opening", "hiring"];
    const hasJobIntent = jobKeywords.some(t => msg.toLowerCase().includes(t));
    try {
      const data = await fetchApi("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-6),
          systemHint: `You are Recruweb's friendly AI career assistant for India's job market. Help with: job search (suggest /jobs page), interview prep (role-specific questions), resume tips (ATS optimization), platform support. Use Indian context (INR, Indian companies, cities). Be concise, friendly, max 120 words. Use bullet points.`,
        }),
      });
      const reply = data.response;
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      speakText(reply);
      if (hasJobIntent) {
        const kw = msg.replace(/(find|search|show|list|get|me|jobs?|in|for|at|the)/gi, "").trim();
        setTimeout(() => {
          setMessages(prev => [...prev, { role: "assistant", content: "🔍 Taking you to the jobs page now!" }]);
          setTimeout(() => setLocation(`/jobs?search=${encodeURIComponent(kw.slice(0, 50))}`), 1200);
        }, 900);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, speakText, setLocation]);

  sendMessageRef.current = sendMessage;

  const toggleVoice = () => {
    if (!recognitionRef.current) return alert("Voice input not supported. Please use Chrome.");
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  const openChat = () => { setOpen(true); setMinimized(false); };
  const closeChat = () => { setPopupVisible(false); setTimeout(() => setOpen(false), 260); };
  const minimizeChat = () => { setPopupVisible(false); setTimeout(() => setMinimized(true), 260); };

  return (
    <>
      <style>{`
        @keyframes chatBounce { 0%,80%,100%{transform:translateY(0);opacity:.5} 40%{transform:translateY(-5px);opacity:1} }
        @keyframes chatUp { from{opacity:0;transform:translateY(20px) scale(.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes chatDown { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(20px) scale(.95)} }
        @keyframes fabPop { 0%{transform:scale(.6) rotate(-15deg);opacity:0} 70%{transform:scale(1.08) rotate(4deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes pulse2 { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.65);opacity:0} }
        @keyframes glow { 0%,100%{opacity:.7} 50%{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes waveBar { 0%,100%{transform:scaleY(.35)} 50%{transform:scaleY(1)} }
        @keyframes msgIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .chat-enter { animation: chatUp .28s cubic-bezier(.34,1.56,.64,1) both; }
        .chat-exit  { animation: chatDown .22s ease-in both; }
        .fab-in     { animation: fabPop .45s cubic-bezier(.34,1.56,.64,1) both; }
        .msg-in     { animation: msgIn .2s ease both; }
      `}</style>

      {/* ── FAB ── */}
      {(!open || minimized) && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5">
          {/* Tooltip */}
          <div style={{
            opacity: fabHover ? 1 : 0, pointerEvents: "none",
            transform: fabHover ? "translateY(0)" : "translateY(5px)",
            transition: "all .2s ease",
          }} className="bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
            AI Career Assistant ✨
          </div>

          {/* Minimized pill */}
          {open && minimized && (
            <button onClick={() => { setMinimized(false); setOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <span style={{ width:7,height:7,borderRadius:"50%",background:"#4ade80",animation:"glow 1.5s ease-in-out infinite" }} />
              AI Assistant
            </button>
          )}

          {/* Main FAB */}
          {!minimized && (
            <button
              onClick={openChat}
              onMouseEnter={() => setFabHover(true)}
              onMouseLeave={() => setFabHover(false)}
              className="fab-in relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl"
              style={{
                background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)",
                boxShadow: fabHover
                  ? "0 0 0 8px rgba(99,102,241,.16), 0 20px 40px rgba(99,102,241,.45)"
                  : "0 0 0 0px rgba(99,102,241,0), 0 8px 24px rgba(99,102,241,.35)",
                transform: fabHover ? "scale(1.08) translateY(-2px)" : "scale(1)",
                transition: "all .25s cubic-bezier(.34,1.56,.64,1)",
                borderRadius: 20,
              }}
              aria-label="Open AI Career Assistant"
            >
              <span style={{ position:"absolute",inset:0,borderRadius:20,border:"2px solid rgba(139,92,246,.45)",animation:"pulse2 2s ease-out infinite" }} />
              <span style={{ position:"absolute",inset:0,borderRadius:20,border:"2px solid rgba(139,92,246,.25)",animation:"pulse2 2s ease-out infinite",animationDelay:".7s" }} />
              <span style={{ position:"absolute",top:6,right:6,width:9,height:9,borderRadius:"50%",background:"#4ade80",border:"2px solid white",animation:"glow 1.5s ease-in-out infinite" }} />
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="8" width="20" height="15" rx="5" fill="rgba(255,255,255,.95)"/>
                <circle cx="10" cy="15" r="2.5" fill="#6366f1"/>
                <circle cx="18" cy="15" r="2.5" fill="#6366f1"/>
                <rect x="10" y="19" width="8" height="2" rx="1" fill="#6366f1" opacity=".45"/>
                <rect x="12.5" y="4" width="3" height="5" rx="1.5" fill="rgba(255,255,255,.9)"/>
                <circle cx="14" cy="3.5" r="1.5" fill="rgba(255,255,255,.9)"/>
                <rect x="1.5" y="13" width="2.5" height="5" rx="1.25" fill="rgba(255,255,255,.65)"/>
                <rect x="24.5" y="13" width="2.5" height="5" rx="1.25" fill="rgba(255,255,255,.65)"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* ── CHAT POPUP ── */}
      {open && !minimized && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden ${popupVisible ? "chat-enter" : "chat-exit"}`}
          style={{
            width: 380, maxWidth: "calc(100vw - 1.5rem)",
            height: 560, maxHeight: "calc(100dvh - 5rem)",
            borderRadius: 22,
            boxShadow: "0 28px 60px rgba(0,0,0,.2), 0 0 0 1px rgba(99,102,241,.12)",
            background: "#fff",
            border: "1px solid rgba(99,102,241,.12)",
          }}
        >
          {/* ── HEADER ── */}
          <div style={{
            background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 60%,#a855f7 100%)",
            padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 12,
            flexShrink: 0, position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0, opacity: .1,
              background: "radial-gradient(ellipse at 20% 50%,#fff 0%,transparent 60%)",
              pointerEvents: "none",
            }} />
            {/* Bot avatar */}
            <div style={{
              width: 42, height: 42, borderRadius: 13,
              background: "rgba(255,255,255,.18)", backdropFilter: "blur(8px)",
              border: "1.5px solid rgba(255,255,255,.28)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, position: "relative",
            }}>
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="8" width="20" height="15" rx="5" fill="white" opacity=".95"/>
                <circle cx="10" cy="15" r="2.2" fill="#6366f1"/>
                <circle cx="18" cy="15" r="2.2" fill="#6366f1"/>
                <rect x="10.5" y="19" width="7" height="1.8" rx=".9" fill="#6366f1" opacity=".5"/>
                <rect x="12.5" y="4" width="3" height="5" rx="1.5" fill="white" opacity=".9"/>
                <circle cx="14" cy="3.5" r="1.5" fill="white" opacity=".9"/>
              </svg>
              <span style={{
                position: "absolute", top: 2, right: 2,
                width: 8, height: 8, borderRadius: "50%",
                background: "#4ade80", border: "1.5px solid rgba(255,255,255,.8)",
                animation: "glow 1.5s ease-in-out infinite",
              }} />
            </div>
            {/* Title + status */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>Recruweb AI Assistant</p>
                <span style={{
                  background: "rgba(255,255,255,.2)", color: "#fff",
                  fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                  border: "1px solid rgba(255,255,255,.28)", letterSpacing: ".05em", textTransform: "uppercase",
                }}>GEMINI</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", flexShrink: 0, animation: "glow 1.5s ease-in-out infinite" }} />
                <p style={{ color: "rgba(255,255,255,.72)", fontSize: 11 }}>Online · AI Career Assistant</p>
              </div>
            </div>
            {/* Controls */}
            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
              {[
                { title: voiceEnabled ? "Mute" : "Unmute", icon: voiceEnabled ? <Volume2 size={13}/> : <VolumeX size={13}/>, onClick: () => { setVoiceEnabled(v => !v); if (isSpeaking) { window.speechSynthesis?.cancel(); setIsSpeaking(false); } }, active: voiceEnabled },
                { title: "Minimize", icon: <Minimize2 size={13}/>, onClick: minimizeChat },
                { title: "Close", icon: <X size={13}/>, onClick: closeChat },
              ].map(({ title, icon, onClick, active }) => (
                <button key={title} onClick={onClick} title={title} style={{
                  width: 28, height: 28, borderRadius: 9,
                  background: active ? "rgba(74,222,128,.22)" : "rgba(255,255,255,.1)",
                  border: "1px solid rgba(255,255,255,.15)",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "background .15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.22)"}
                  onMouseLeave={e => e.currentTarget.style.background = active ? "rgba(74,222,128,.22)" : "rgba(255,255,255,.1)"}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* ── MESSAGES ── */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "16px 14px 8px",
            display: "flex", flexDirection: "column", gap: 14,
            background: "#f9f8ff",
          }} className="dark:bg-gray-900/40">
            {messages.map((msg, i) => (
              <div key={i} className="msg-in" style={{
                display: "flex", gap: 9,
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-start",
              }}>
                {/* Avatar */}
                <div style={{
                  width: 30, height: 30, borderRadius: 10, flexShrink: 0, marginTop: 2,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  ...(msg.role === "user"
                    ? { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 2px 8px rgba(79,70,229,.28)" }
                    : { background: "#fff", border: "1.5px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }
                  ),
                }}>
                  {msg.role === "user"
                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                    : <svg width="13" height="13" viewBox="0 0 28 28" fill="none"><rect x="4" y="8" width="20" height="15" rx="5" fill="#6366f1"/><circle cx="10" cy="15" r="2" fill="white"/><circle cx="18" cy="15" r="2" fill="white"/></svg>
                  }
                </div>
                {/* Bubble */}
                <div style={{
                  maxWidth: "78%", padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                  ...(msg.role === "user"
                    ? { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", boxShadow: "0 4px 12px rgba(79,70,229,.22)" }
                    : { background: "#fff", color: "inherit", border: "1px solid #ede9fe", boxShadow: "0 1px 6px rgba(0,0,0,.05)" }
                  ),
                }} className={msg.role !== "user" ? "dark:bg-gray-800 dark:border-gray-700" : ""}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {formatMessage(msg.content)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="msg-in" style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <div style={{ width:30,height:30,borderRadius:10,background:"#fff",border:"1.5px solid #e5e7eb",boxShadow:"0 1px 4px rgba(0,0,0,.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <svg width="13" height="13" viewBox="0 0 28 28" fill="none"><rect x="4" y="8" width="20" height="15" rx="5" fill="#6366f1"/><circle cx="10" cy="15" r="2" fill="white"/><circle cx="18" cy="15" r="2" fill="white"/></svg>
                </div>
                <div style={{ background:"#fff",border:"1px solid #ede9fe",borderRadius:"4px 16px 16px 16px",padding:"11px 14px",boxShadow:"0 1px 6px rgba(0,0,0,.05)" }}
                  className="dark:bg-gray-800 dark:border-gray-700">
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Stop speaking */}
            {isSpeaking && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button onClick={() => { window.speechSynthesis?.cancel(); setIsSpeaking(false); }}
                  style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#6366f1",background:"rgba(99,102,241,.08)",border:"1px solid rgba(99,102,241,.18)",padding:"4px 12px",borderRadius:20,cursor:"pointer" }}>
                  <VolumeX size={11}/> Stop speaking
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── QUICK ACTIONS (shown only before first user message) ── */}
          {showWelcome && messages.length === 1 && (
            <div style={{
              padding: "12px 14px 8px",
              borderTop: "1px solid #ede9fe",
              background: "#faf9ff",
              flexShrink: 0,
            }} className="dark:bg-gray-900/50 dark:border-gray-700">
              <p style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 9 }}>
                Quick Actions
              </p>
              {/* 4 pill buttons in a row */}
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
                {QUICK_ACTIONS.map(({ icon: Icon, label, color, bg, msg }) => (
                  <button key={label}
                    onClick={() => { setShowWelcome(false); sendMessage(msg); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "6px 12px", borderRadius: 20,
                      background: bg, border: `1.5px solid ${color}30`,
                      color: color, fontSize: 12, fontWeight: 600,
                      cursor: "pointer", transition: "all .15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 4px 10px ${color}20`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    <Icon size={12} style={{ flexShrink: 0 }} />
                    {label}
                  </button>
                ))}
              </div>
              {/* 3 suggestion chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {SUGGESTIONS.map(s => (
                  <button key={s}
                    onClick={() => { setShowWelcome(false); sendMessage(s); }}
                    style={{
                      fontSize: 10, color: "#6b7280",
                      background: "#fff", border: "1px solid #e5e7eb",
                      padding: "4px 10px", borderRadius: 20,
                      cursor: "pointer", transition: "all .15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f5f3ff"; e.currentTarget.style.color = "#6366f1"; e.currentTarget.style.borderColor = "#c4b5fd"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── INPUT BAR ── */}
          <div style={{
            padding: "10px 12px 13px",
            borderTop: "1px solid #ede9fe",
            background: "#fff",
            flexShrink: 0,
          }} className="dark:bg-gray-900 dark:border-gray-700">
            {/* Voice waveform */}
            {isListening && (
              <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8,padding:"6px 10px",background:"#fef2f2",borderRadius:10,border:"1px solid #fecaca" }}>
                <div style={{ display:"flex",gap:2,alignItems:"center" }}>
                  {[1,2,3,4,5,4,3].map((h,i) => (
                    <div key={i} style={{ width:2.5,height:h*4,background:"#ef4444",borderRadius:2,animation:"waveBar .8s ease-in-out infinite",animationDelay:`${i*.1}s` }} />
                  ))}
                </div>
                <span style={{ fontSize:11,color:"#ef4444",fontWeight:600 }}>Listening… speak now</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
              {/* Mic */}
              <button onClick={toggleVoice} title={isListening ? "Stop" : "Voice input"}
                style={{
                  width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isListening ? "#ef4444" : "#f0eeff",
                  border: `1.5px solid ${isListening ? "#ef4444" : "#c4b5fd"}`,
                  color: isListening ? "#fff" : "#6366f1",
                  cursor: "pointer", transition: "all .15s",
                }}>
                {isListening ? <MicOff size={14}/> : <Mic size={14}/>}
              </button>

              {/* Textarea */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={isListening ? "🎤 Listening…" : "Ask me anything about jobs, resume…"}
                rows={1}
                disabled={loading}
                style={{
                  flex: 1, resize: "none", borderRadius: 12,
                  border: "1.5px solid #e5e7eb",
                  background: "#f9f8ff",
                  padding: "8px 12px", fontSize: 13,
                  outline: "none", maxHeight: 80, overflowY: "auto",
                  fontFamily: "inherit", lineHeight: 1.5,
                  transition: "border-color .15s, box-shadow .15s",
                }}
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,.1)"; }}
                onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
              />

              {/* Send */}
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                style={{
                  width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: input.trim() && !loading ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "#e5e7eb",
                  border: "none",
                  color: input.trim() && !loading ? "#fff" : "#9ca3af",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  transition: "all .2s",
                  boxShadow: input.trim() && !loading ? "0 4px 12px rgba(79,70,229,.3)" : "none",
                }}>
                {loading
                  ? <div style={{ width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite" }} />
                  : <Send size={14}/>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
