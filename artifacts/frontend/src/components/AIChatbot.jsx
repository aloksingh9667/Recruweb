import { useState, useRef, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { useLocation } from "wouter";
import {
  X, Send, Mic, MicOff, Volume2, VolumeX, Search, Brain,
  ChevronRight, Briefcase, HelpCircle, Sparkles, Minimize2,
  FileText, Zap,
} from "lucide-react";

const QUICK_ACTIONS = [
  { icon: Search,      label: "Find Jobs",      color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", msg: "Help me find relevant jobs. What kind of jobs are available on Recruweb?" },
  { icon: Brain,       label: "Interview Prep", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", msg: "Help me prepare for my upcoming interview. Give me common interview questions and tips." },
  { icon: FileText,    label: "Resume Tips",    color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", msg: "Give me tips to improve my resume and make it ATS-friendly." },
  { icon: HelpCircle,  label: "Support",        color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", msg: "I need help with the Recruweb platform. What can you help me with?" },
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
        <span
          key={i}
          style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--color-primary, #4F46E5)",
            display: "inline-block",
            animation: "chatBounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.18}s`,
            opacity: 0.7,
          }}
        />
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
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" />
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
    content: "Namaste! 👋 I'm your **Recruweb AI Career Assistant**, powered by Gemini AI.\n\nI can help you:\n• 🔍 **Find the right jobs** based on your skills\n• 🎤 **Prepare for interviews** with role-specific questions\n• 📄 **Improve your resume** for ATS systems\n• 💬 **Platform support** for any queries\n\nHow can I help you today?"
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [fabHover, setFabHover] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
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
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";
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

  const sendMessageRef = useRef(null);

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
    setShowSuggestions(false);
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
    if (!recognitionRef.current) return alert("Voice input not supported. Use Chrome.");
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  const openChat = () => { setOpen(true); setMinimized(false); };
  const closeChat = () => { setPopupVisible(false); setTimeout(() => setOpen(false), 260); };
  const minimizeChat = () => { setPopupVisible(false); setTimeout(() => setMinimized(true), 260); };

  return (
    <>
      <style>{`
        @keyframes chatBounce {
          0%,80%,100% { transform: translateY(0); opacity:.5 }
          40% { transform: translateY(-5px); opacity:1 }
        }
        @keyframes chatSlideUp {
          from { opacity:0; transform: translateY(24px) scale(0.94); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        @keyframes chatSlideDown {
          from { opacity:1; transform: translateY(0) scale(1); }
          to   { opacity:0; transform: translateY(24px) scale(0.94); }
        }
        @keyframes fabPop {
          0%   { transform: scale(0.6) rotate(-20deg); opacity:0 }
          70%  { transform: scale(1.12) rotate(6deg) }
          100% { transform: scale(1) rotate(0deg); opacity:1 }
        }
        @keyframes pulseRing {
          0%   { transform:scale(1); opacity:.5 }
          100% { transform:scale(1.7); opacity:0 }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(18px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(18px) rotate(-360deg); }
        }
        @keyframes shimmer {
          0%,100% { opacity:.6 }
          50%      { opacity:1 }
        }
        @keyframes waveBar {
          0%,100% { transform: scaleY(0.4); }
          50%      { transform: scaleY(1); }
        }
        .chat-popup-enter { animation: chatSlideUp 0.28s cubic-bezier(.34,1.56,.64,1) forwards; }
        .chat-popup-exit  { animation: chatSlideDown 0.22s ease-in forwards; }
        .fab-enter { animation: fabPop 0.45s cubic-bezier(.34,1.56,.64,1) forwards; }
        .msg-in { animation: chatSlideUp 0.22s ease-out forwards; }
      `}</style>

      {/* ── FAB ── */}
      {(!open || minimized) && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

          {/* Tooltip */}
          <div style={{
            opacity: fabHover ? 1 : 0, pointerEvents: "none",
            transform: fabHover ? "translateY(0)" : "translateY(4px)",
            transition: "all 0.2s ease",
          }}
            className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap"
          >
            AI Career Assistant ✨
          </div>

          {/* Minimized pill */}
          {open && minimized && (
            <button
              onClick={() => { setMinimized(false); setOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              <span style={{ width:8,height:8,borderRadius:"50%",background:"#4ade80",animation:"shimmer 1.5s ease-in-out infinite",display:"inline-block" }} />
              AI Assistant
            </button>
          )}

          {/* Main FAB */}
          {!minimized && (
            <button
              onClick={openChat}
              onMouseEnter={() => setFabHover(true)}
              onMouseLeave={() => setFabHover(false)}
              className="fab-enter relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl"
              style={{
                background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)",
                boxShadow: fabHover
                  ? "0 0 0 8px rgba(99,102,241,.18), 0 20px 40px rgba(99,102,241,.45)"
                  : "0 0 0 0px rgba(99,102,241,0), 0 8px 24px rgba(99,102,241,.35)",
                transform: fabHover ? "scale(1.08) translateY(-2px)" : "scale(1)",
                transition: "all 0.25s cubic-bezier(.34,1.56,.64,1)",
                borderRadius: 20,
              }}
              aria-label="Open AI Career Assistant"
            >
              {/* Pulse rings */}
              <span style={{
                position:"absolute", inset:0, borderRadius:20,
                border:"2px solid rgba(139,92,246,.5)",
                animation:"pulseRing 2s ease-out infinite",
              }} />
              <span style={{
                position:"absolute", inset:0, borderRadius:20,
                border:"2px solid rgba(139,92,246,.3)",
                animation:"pulseRing 2s ease-out infinite",
                animationDelay:"0.7s",
              }} />

              {/* Online dot */}
              <span style={{
                position:"absolute", top:6, right:6,
                width:10, height:10, borderRadius:"50%",
                background:"#4ade80",
                border:"2px solid white",
                animation:"shimmer 1.5s ease-in-out infinite",
              }} />

              {/* Icon stack */}
              <div style={{ position:"relative", width:28, height:28 }}>
                {/* Sparkle orbiting */}
                <span style={{
                  position:"absolute", top:"50%", left:"50%",
                  marginTop:-4, marginLeft:-4,
                  width:8, height:8,
                  animation:"orbit 3s linear infinite",
                  fontSize:8,
                  color:"rgba(255,255,255,.8)",
                }}>✦</span>
                {/* Bot face */}
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="4" y="8" width="20" height="15" rx="5" fill="rgba(255,255,255,.95)"/>
                  <circle cx="10" cy="15" r="2.5" fill="#6366f1"/>
                  <circle cx="18" cy="15" r="2.5" fill="#6366f1"/>
                  <rect x="10" y="19" width="8" height="2" rx="1" fill="#6366f1" opacity=".5"/>
                  <rect x="12.5" y="4" width="3" height="5" rx="1.5" fill="rgba(255,255,255,.9)"/>
                  <circle cx="14" cy="3.5" r="1.5" fill="rgba(255,255,255,.9)"/>
                  <rect x="1.5" y="13" width="2.5" height="5" rx="1.25" fill="rgba(255,255,255,.7)"/>
                  <rect x="24.5" y="13" width="2.5" height="5" rx="1.25" fill="rgba(255,255,255,.7)"/>
                </svg>
              </div>
            </button>
          )}
        </div>
      )}

      {/* ── Chat Popup ── */}
      {open && !minimized && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden ${popupVisible ? "chat-popup-enter" : "chat-popup-exit"}`}
          style={{
            width: 390, maxWidth: "calc(100vw - 1.5rem)",
            height: 580, maxHeight: "calc(100dvh - 5rem)",
            borderRadius: 20,
            boxShadow: "0 32px 64px rgba(0,0,0,.22), 0 0 0 1px rgba(255,255,255,.08)",
            background: "var(--background, #fff)",
            border: "1px solid rgba(99,102,241,.15)",
          }}
        >
          {/* ── Header ── */}
          <div style={{
            background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 60%,#a855f7 100%)",
            padding: "12px 14px",
            display: "flex", alignItems: "center", gap: 10,
            flexShrink: 0, position: "relative", overflow: "hidden",
          }}>
            {/* Header shimmer overlay */}
            <div style={{
              position:"absolute", inset:0, opacity:.12,
              background:"radial-gradient(ellipse at 20% 50%,#fff 0%,transparent 60%), radial-gradient(ellipse at 80% 20%,#fff 0%,transparent 50%)",
              pointerEvents:"none",
            }} />

            {/* Bot avatar */}
            <div style={{
              width:40, height:40, borderRadius:12,
              background:"rgba(255,255,255,.2)",
              backdropFilter:"blur(8px)",
              border:"1.5px solid rgba(255,255,255,.3)",
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0, position:"relative",
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
                position:"absolute", top:2, right:2,
                width:8, height:8, borderRadius:"50%",
                background:"#4ade80", border:"1.5px solid rgba(255,255,255,.8)",
                animation:"shimmer 1.5s ease-in-out infinite",
              }}/>
            </div>

            {/* Title */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <p style={{ color:"#fff", fontWeight:700, fontSize:14, lineHeight:1.2 }}>Recruweb AI Assistant</p>
                <span style={{
                  background:"rgba(255,255,255,.22)", color:"#fff",
                  fontSize:9, fontWeight:700, padding:"2px 6px",
                  borderRadius:20, border:"1px solid rgba(255,255,255,.3)",
                  letterSpacing:".04em", textTransform:"uppercase",
                }}>GEMINI</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                <span style={{ width:6,height:6,borderRadius:"50%",background:"#4ade80",flexShrink:0,animation:"shimmer 1.5s ease-in-out infinite" }}/>
                <p style={{ color:"rgba(255,255,255,.8)", fontSize:11 }}>Online · AI Career Assistant</p>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display:"flex", gap:4, flexShrink:0 }}>
              {[
                {
                  title: voiceEnabled ? "Mute responses" : "Unmute responses",
                  icon: voiceEnabled
                    ? <Volume2 size={14}/>
                    : <VolumeX size={14}/>,
                  onClick: () => { setVoiceEnabled(v => !v); if(isSpeaking) { window.speechSynthesis?.cancel(); setIsSpeaking(false); } },
                  active: voiceEnabled,
                },
                {
                  title: "Minimize",
                  icon: <Minimize2 size={14}/>,
                  onClick: minimizeChat,
                },
                {
                  title: "Close",
                  icon: <X size={14}/>,
                  onClick: closeChat,
                },
              ].map(({ title, icon, onClick, active }) => (
                <button key={title} onClick={onClick} title={title} style={{
                  width:28, height:28, borderRadius:8,
                  background: active ? "rgba(74,222,128,.25)" : "rgba(255,255,255,.12)",
                  border: "1px solid rgba(255,255,255,.15)",
                  color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", transition:"background .15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = active ? "rgba(74,222,128,.35)" : "rgba(255,255,255,.22)"}
                  onMouseLeave={e => e.currentTarget.style.background = active ? "rgba(74,222,128,.25)" : "rgba(255,255,255,.12)"}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* ── Messages ── */}
          <div style={{
            flex:1, overflowY:"auto", padding:"14px 14px 8px",
            display:"flex", flexDirection:"column", gap:12,
            background:"#f8f7ff",
          }}
            className="dark:bg-gray-900/30"
          >
            {messages.map((msg, i) => (
              <div key={i} className="msg-in" style={{ display:"flex", gap:8, flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems:"flex-start" }}>

                {/* Avatar */}
                <div style={{
                  width:30, height:30, borderRadius:10, flexShrink:0, marginTop:2,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  ...(msg.role === "user"
                    ? { background:"linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow:"0 2px 8px rgba(79,70,229,.3)" }
                    : { background:"#fff", border:"1.5px solid #e5e7eb", boxShadow:"0 1px 4px rgba(0,0,0,.06)" }
                  ),
                }}>
                  {msg.role === "user"
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 28 28" fill="none"><rect x="4" y="8" width="20" height="15" rx="5" fill="#6366f1"/><circle cx="10" cy="15" r="2" fill="white"/><circle cx="18" cy="15" r="2" fill="white"/><rect x="10.5" y="19" width="7" height="1.5" rx=".75" fill="white" opacity=".6"/></svg>
                  }
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth:"80%",
                  padding:"9px 13px",
                  borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                  ...(msg.role === "user"
                    ? {
                        background:"linear-gradient(135deg,#4f46e5,#7c3aed)",
                        color:"#fff",
                        boxShadow:"0 4px 12px rgba(79,70,229,.25)",
                      }
                    : {
                        background:"#fff",
                        color:"inherit",
                        border:"1px solid #e5e7eb",
                        boxShadow:"0 1px 6px rgba(0,0,0,.06)",
                      }
                  ),
                }}
                  className={msg.role !== "user" ? "dark:bg-gray-800 dark:border-gray-700" : ""}
                >
                  <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                    {formatMessage(msg.content)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="msg-in" style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                <div style={{ width:30,height:30,borderRadius:10,background:"#fff",border:"1.5px solid #e5e7eb",boxShadow:"0 1px 4px rgba(0,0,0,.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <svg width="14" height="14" viewBox="0 0 28 28" fill="none"><rect x="4" y="8" width="20" height="15" rx="5" fill="#6366f1"/><circle cx="10" cy="15" r="2" fill="white"/><circle cx="18" cy="15" r="2" fill="white"/></svg>
                </div>
                <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:"4px 16px 16px 16px", padding:"10px 14px", boxShadow:"0 1px 6px rgba(0,0,0,.06)" }}
                  className="dark:bg-gray-800 dark:border-gray-700"
                >
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Stop speaking */}
            {isSpeaking && (
              <div style={{ display:"flex", justifyContent:"center" }}>
                <button
                  onClick={() => { window.speechSynthesis?.cancel(); setIsSpeaking(false); }}
                  style={{ display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#6366f1",background:"rgba(99,102,241,.08)",border:"1px solid rgba(99,102,241,.2)",padding:"4px 12px",borderRadius:20,cursor:"pointer" }}
                >
                  <VolumeX size={11}/> Stop speaking
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick Actions ── */}
          {showSuggestions && messages.length === 1 && (
            <div style={{ padding:"10px 12px 6px", background:"#f3f4ff", borderTop:"1px solid #e5e7eb", flexShrink:0 }}
              className="dark:bg-gray-900/40 dark:border-gray-700"
            >
              <p style={{ fontSize:9, color:"#9ca3af", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", marginBottom:8, paddingLeft:2 }}>
                Quick Actions
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:8 }}>
                {QUICK_ACTIONS.map(({ icon: Icon, label, color, bg, border, msg }) => (
                  <button
                    key={label}
                    onClick={() => { setShowSuggestions(false); sendMessage(msg); }}
                    style={{
                      display:"flex", alignItems:"center", gap:7,
                      padding:"7px 10px", borderRadius:10,
                      background:bg, border:`1.5px solid ${border}`,
                      color:color, fontSize:12, fontWeight:600,
                      cursor:"pointer", transition:"all .15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow=`0 4px 12px ${color}22`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}
                  >
                    <Icon size={13} style={{ flexShrink:0 }} />
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => { setShowSuggestions(false); sendMessage(s); }}
                    style={{
                      display:"flex", alignItems:"center", gap:4,
                      fontSize:10, color:"#6b7280",
                      background:"#fff", border:"1px solid #e5e7eb",
                      padding:"3px 9px", borderRadius:20,
                      cursor:"pointer", transition:"all .15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background="#f5f3ff"; e.currentTarget.style.color="#6366f1"; e.currentTarget.style.borderColor="#c4b5fd"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="#fff"; e.currentTarget.style.color="#6b7280"; e.currentTarget.style.borderColor="#e5e7eb"; }}
                  >
                    <ChevronRight size={9}/>{s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Input ── */}
          <div style={{ padding:"10px 12px 12px", borderTop:"1px solid #e5e7eb", background:"#fff", flexShrink:0 }}
            className="dark:bg-gray-900 dark:border-gray-700"
          >
            {/* Voice waveform */}
            {isListening && (
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, padding:"6px 10px", background:"#fef2f2", borderRadius:10, border:"1px solid #fecaca" }}>
                <div style={{ display:"flex", gap:2, alignItems:"center" }}>
                  {[1,2,3,4,5,4,3].map((h,i) => (
                    <div key={i} style={{
                      width:2.5, height: h * 4,
                      background:"#ef4444", borderRadius:2,
                      animation:`waveBar 0.8s ease-in-out infinite`,
                      animationDelay:`${i*0.1}s`,
                    }}/>
                  ))}
                </div>
                <span style={{ fontSize:11, color:"#ef4444", fontWeight:600 }}>Listening… speak now</span>
              </div>
            )}

            <div style={{ display:"flex", gap:7, alignItems:"flex-end" }}>
              {/* Mic */}
              <button
                onClick={toggleVoice}
                title={isListening ? "Stop" : "Voice input"}
                style={{
                  width:36, height:36, borderRadius:11, flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background: isListening ? "#ef4444" : "#f3f4ff",
                  border: `1.5px solid ${isListening ? "#ef4444" : "#c4b5fd"}`,
                  color: isListening ? "#fff" : "#6366f1",
                  cursor:"pointer", transition:"all .15s",
                  animation: isListening ? "shimmer 0.8s ease-in-out infinite" : "none",
                }}
              >
                {isListening ? <MicOff size={15}/> : <Mic size={15}/>}
              </button>

              {/* Textarea */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={isListening ? "🎤 Listening…" : "Ask about jobs, interview tips…"}
                rows={1}
                disabled={loading}
                style={{
                  flex:1, resize:"none", borderRadius:12,
                  border:"1.5px solid #e5e7eb",
                  background:"#f9fafb",
                  padding:"8px 12px", fontSize:13,
                  outline:"none", maxHeight:80, overflowY:"auto",
                  fontFamily:"inherit", lineHeight:1.5,
                  transition:"border-color .15s, box-shadow .15s",
                  fieldSizing:"content",
                }}
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                onFocus={e => { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,.12)"; }}
                onBlur={e => { e.target.style.borderColor="#e5e7eb"; e.target.style.boxShadow="none"; }}
              />

              {/* Send */}
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{
                  width:36, height:36, borderRadius:11, flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background: input.trim() && !loading ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "#e5e7eb",
                  border:"none", color: input.trim() && !loading ? "#fff" : "#9ca3af",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  transition:"all .2s",
                  boxShadow: input.trim() && !loading ? "0 4px 12px rgba(79,70,229,.35)" : "none",
                  transform: input.trim() && !loading ? "none" : "none",
                }}
              >
                {loading
                  ? <div style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite" }}/>
                  : <Send size={14}/>
                }
              </button>
            </div>

            {/* Footer hint */}
            <p style={{ fontSize:10, color:"#9ca3af", textAlign:"center", marginTop:7, display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
              <Zap size={9} style={{ color:"#a78bfa" }}/>
              {voiceEnabled ? "Voice responses ON" : "AI powered · Jobs · Interview Prep · Support"}
              <Sparkles size={9} style={{ color:"#a78bfa" }}/>
            </p>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
