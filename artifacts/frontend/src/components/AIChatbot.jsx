import { useState, useRef, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { useLocation } from "wouter";
import {
  X, Send, Mic, MicOff, Volume2, VolumeX,
  Minimize2, Sparkles, ChevronDown, RotateCcw,
} from "lucide-react";

const FOLLOW_UP_CHIPS = [
  ["Show me jobs in Bangalore", "Jobs in Delhi NCR", "Remote jobs"],
  ["TCS interview questions", "Amazon interview tips", "Infosys prep"],
  ["Fresher resume format", "How to add skills", "LinkedIn tips"],
  ["How to apply?", "Reset password", "Upload resume"],
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "linear-gradient(135deg,#6366f1,#a855f7)",
          display: "inline-block",
          animation: "chatBounce 1.4s ease-in-out infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

function formatMessage(content) {
  return content.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 4 }} />;
    if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
      const text = line.replace(/^[•\-*]\s*/, "");
      const html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 2 }}>
          <span style={{ marginTop: 7, width: 5, height: 5, borderRadius: "50%", background: "currentColor", opacity: 0.45, flexShrink: 0 }} />
          <span style={{ fontSize: 13, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      );
    }
    const html = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    return <p key={i} style={{ fontSize: 13, lineHeight: 1.65, marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

function MsgTime({ ts }) {
  const d = new Date(ts);
  return (
    <span style={{ fontSize: 10, opacity: 0.45, marginTop: 3, display: "block" }}>
      {d.getHours()}:{String(d.getMinutes()).padStart(2, "0")}
    </span>
  );
}

export function AIChatbot() {
  const [open, setOpen]         = useState(false);
  const [minimized, setMin]     = useState(false);
  const [messages, setMessages] = useState([{
    role: "assistant", ts: Date.now(),
    content: "Hi there! 👋 I'm your **Recruweb AI Career Assistant**, powered by Gemini.\n\nI'm here to help you:\n• 🔍 **Find the right jobs** for your skills & experience\n• 🎯 **Ace interviews** with role-specific prep tips\n• 📄 **Boost your resume** for ATS and recruiters\n• 💬 **Answer any questions** about the platform\n\nJust type your question below and I'll help you out!",
  }]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [isListening, setListen]= useState(false);
  const [isSpeaking, setSpeaking]= useState(false);
  const [voiceEnabled, setVoice]= useState(false);
  const [showWelcome, setWelcome]= useState(true);
  const [popupVisible, setVis]  = useState(false);
  const [fabHover, setFabHover] = useState(false);
  const [chipSet, setChipSet]   = useState(0);
  const [voiceBanner, setVoiceBanner] = useState("");

  const endRef      = useRef(null);
  const inputRef    = useRef(null);
  const recRef      = useRef(null);
  const sendRef     = useRef(null);
  const transcriptRef = useRef("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => setVis(true), 10);
      setTimeout(() => inputRef.current?.focus(), 250);
    } else setVis(false);
  }, [open, minimized]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-IN";

    rec.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      const text = final || interim;
      transcriptRef.current = text;
      setInput(text);
      setVoiceBanner(text);
    };

    rec.onend = () => {
      setListen(false);
      const transcript = transcriptRef.current.trim();
      if (transcript) {
        transcriptRef.current = "";
        setVoiceBanner("");
        setTimeout(() => sendRef.current(transcript), 120);
      } else {
        setVoiceBanner("");
      }
    };

    rec.onerror = () => { setListen(false); setVoiceBanner(""); };
    recRef.current = rec;
  }, []);

  const speakText = useCallback((text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*•#🔍🎯📄💬👋✨]/g, "").replace(/\n/g, " ").trim();
    const utt = new SpeechSynthesisUtterance(clean.slice(0, 280));
    utt.lang = "en-IN"; utt.rate = 1.05; utt.pitch = 1;
    const v = (window.speechSynthesis.getVoices() || []).find(v => v.name.includes("Google") || v.lang.startsWith("en")) || null;
    if (v) utt.voice = v;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, [voiceEnabled]);

  const sendMessage = useCallback(async (text) => {
    const msg = (typeof text === "string" ? text : input).trim();
    if (!msg || loading) return;
    setInput("");
    setWelcome(false);
    setMessages(prev => [...prev, { role: "user", content: msg, ts: Date.now() }]);
    setLoading(true);
    setChipSet(c => (c + 1) % FOLLOW_UP_CHIPS.length);

    const jobKeywords = ["find job", "search job", "job in", "jobs in", "job for", "jobs for", "vacancy", "opening", "hiring", "show jobs"];
    const hasJobIntent = jobKeywords.some(t => msg.toLowerCase().includes(t));

    try {
      const data = await fetchApi("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-8),
          systemHint: `You are Recruweb's friendly AI career assistant for India's job market. Help with: job search (recommend visiting /jobs page), interview prep with company-specific questions, resume tips with ATS optimization, platform support. Always use Indian context (INR salary, Indian cities, Indian companies like TCS, Infosys, Wipro, Flipkart). Be concise and friendly, max 130 words. Use bullet points for lists. Respond only in English.`,
        }),
      });
      const reply = data.response;
      setMessages(prev => [...prev, { role: "assistant", content: reply, ts: Date.now() }]);
      speakText(reply);
      if (hasJobIntent) {
        const kw = msg.replace(/(find|search|show|list|get|me|jobs?|in|for|at|the|all)/gi, "").trim();
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: "assistant", ts: Date.now(),
            content: "🔍 Taking you to the Jobs page now!",
          }]);
          setTimeout(() => setLocation(`/jobs?search=${encodeURIComponent(kw.slice(0, 50))}`), 1000);
        }, 800);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant", ts: Date.now(),
        content: "⚠️ Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, speakText, setLocation]);

  sendRef.current = sendMessage;

  const toggleVoice = () => {
    if (!recRef.current) {
      alert("Voice input requires Chrome or Edge browser.");
      return;
    }
    if (isListening) {
      recRef.current.stop();
      setListen(false);
      setVoiceBanner("");
    } else {
      transcriptRef.current = "";
      setInput("");
      setVoiceBanner("");
      recRef.current.start();
      setListen(true);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant", ts: Date.now(),
      content: "Chat cleared! How can I help you today?",
    }]);
    setWelcome(true);
    setInput("");
  };

  const openChat  = () => { setOpen(true); setMin(false); };
  const closeChat = () => { setVis(false); setTimeout(() => setOpen(false), 240); };
  const minimize  = () => { setVis(false); setTimeout(() => setMin(true), 240); };

  return (
    <>
      <style>{`
        @keyframes chatBounce { 0%,80%,100%{transform:translateY(0);opacity:.45} 40%{transform:translateY(-6px);opacity:1} }
        @keyframes chatUp   { from{opacity:0;transform:translateY(24px) scale(.94)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes chatDown { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(24px) scale(.94)} }
        @keyframes fabIn    { 0%{transform:scale(.5) rotate(-20deg);opacity:0} 70%{transform:scale(1.1) rotate(5deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes pulse2   { 0%{transform:scale(1);opacity:.55} 100%{transform:scale(1.7);opacity:0} }
        @keyframes glow     { 0%,100%{opacity:.65} 50%{opacity:1} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes waveBar  { 0%,100%{transform:scaleY(.3)} 50%{transform:scaleY(1)} }
        @keyframes msgIn    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes chipSlide{ from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes sparkle  { 0%,100%{opacity:.6;transform:scale(1) rotate(0)} 50%{opacity:1;transform:scale(1.15) rotate(20deg)} }
        .chat-enter { animation: chatUp .3s cubic-bezier(.34,1.56,.64,1) both; }
        .chat-exit  { animation: chatDown .22s ease-in both; }
        .fab-in     { animation: fabIn .5s cubic-bezier(.34,1.56,.64,1) both; }
        .msg-in     { animation: msgIn .22s ease both; }
        .chip-in    { animation: chipSlide .2s ease both; }
        .msgs-scroll::-webkit-scrollbar { width: 4px; }
        .msgs-scroll::-webkit-scrollbar-track { background: transparent; }
        .msgs-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,.2); border-radius: 4px; }
        .msgs-scroll::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,.4); }
      `}</style>

      {/* ── FAB ── */}
      {(!open || minimized) && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5">
          {/* Tooltip */}
          <div style={{
            opacity: fabHover ? 1 : 0,
            transform: fabHover ? "translateY(0) scale(1)" : "translateY(6px) scale(.95)",
            transition: "all .2s ease",
            pointerEvents: "none",
            background: "rgba(15,10,30,.9)",
            backdropFilter: "blur(12px)",
            color: "#fff",
            fontSize: 12, fontWeight: 600,
            padding: "7px 14px",
            borderRadius: 20,
            boxShadow: "0 4px 16px rgba(0,0,0,.25)",
            border: "1px solid rgba(255,255,255,.08)",
            whiteSpace: "nowrap",
          }}>
            ✨ AI Career Assistant
          </div>

          {/* Minimized pill */}
          {open && minimized && (
            <button onClick={() => { setMin(false); setOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed,#a855f7)", boxShadow: "0 8px 24px rgba(99,102,241,.4)" }}>
              <Sparkles size={13} />
              AI Assistant
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", animation: "glow 1.5s ease-in-out infinite" }} />
            </button>
          )}

          {/* Main FAB button */}
          {!minimized && (
            <button
              onClick={openChat}
              onMouseEnter={() => setFabHover(true)}
              onMouseLeave={() => setFabHover(false)}
              className="fab-in relative flex items-center justify-center shadow-2xl"
              style={{
                width: 62, height: 62, borderRadius: 20,
                background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#a855f7 100%)",
                boxShadow: fabHover
                  ? "0 0 0 10px rgba(99,102,241,.14), 0 20px 45px rgba(99,102,241,.5)"
                  : "0 0 0 0px transparent, 0 10px 28px rgba(99,102,241,.38)",
                transform: fabHover ? "scale(1.1) translateY(-3px)" : "scale(1)",
                transition: "all .28s cubic-bezier(.34,1.56,.64,1)",
              }}
              aria-label="Open AI Career Assistant"
            >
              {/* Pulse rings */}
              <span style={{ position:"absolute",inset:0,borderRadius:20,border:"2px solid rgba(168,85,247,.5)",animation:"pulse2 2.2s ease-out infinite" }} />
              <span style={{ position:"absolute",inset:0,borderRadius:20,border:"2px solid rgba(168,85,247,.3)",animation:"pulse2 2.2s ease-out infinite",animationDelay:".75s" }} />
              {/* Online dot */}
              <span style={{ position:"absolute",top:5,right:5,width:10,height:10,borderRadius:"50%",background:"#4ade80",border:"2.5px solid white",animation:"glow 1.5s ease-in-out infinite",zIndex:2 }} />
              {/* Bot icon */}
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect x="5" y="10" width="22" height="16" rx="6" fill="rgba(255,255,255,.95)"/>
                <circle cx="11.5" cy="17.5" r="2.8" fill="#6366f1"/>
                <circle cx="20.5" cy="17.5" r="2.8" fill="#6366f1"/>
                <circle cx="11.5" cy="17.5" r="1.1" fill="white"/>
                <circle cx="20.5" cy="17.5" r="1.1" fill="white"/>
                <rect x="11" y="22" width="10" height="2.2" rx="1.1" fill="#6366f1" opacity=".35"/>
                <rect x="14" y="5" width="4" height="6" rx="2" fill="rgba(255,255,255,.9)"/>
                <circle cx="16" cy="4" r="2" fill="rgba(255,255,255,.88)"/>
                <rect x="2" y="14.5" width="3" height="6" rx="1.5" fill="rgba(255,255,255,.7)"/>
                <rect x="27" y="14.5" width="3" height="6" rx="1.5" fill="rgba(255,255,255,.7)"/>
              </svg>
              {/* Sparkle */}
              <span style={{ position:"absolute",top:3,left:4,animation:"sparkle 2.5s ease-in-out infinite" }}>
                <Sparkles size={10} color="rgba(255,255,255,.75)" />
              </span>
            </button>
          )}
        </div>
      )}

      {/* ── CHAT WINDOW ── */}
      {open && !minimized && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden ${popupVisible ? "chat-enter" : "chat-exit"}`}
          style={{
            width: 400, maxWidth: "calc(100vw - 1.5rem)",
            height: 590, maxHeight: "calc(100dvh - 4.5rem)",
            borderRadius: 24,
            boxShadow: "0 32px 70px rgba(0,0,0,.22), 0 0 0 1px rgba(99,102,241,.14), inset 0 1px 0 rgba(255,255,255,.5)",
            background: "#fff",
          }}
        >
          {/* HEADER */}
          <div style={{
            background: "linear-gradient(135deg,#3730a3 0%,#5b21b6 55%,#9333ea 100%)",
            padding: "14px 16px 13px",
            display: "flex", alignItems: "center", gap: 12,
            flexShrink: 0, position: "relative", overflow: "hidden",
          }}>
            {/* Background shimmer */}
            <div style={{ position:"absolute",inset:0,opacity:.12,background:"radial-gradient(ellipse at 15% 50%,#fff 0%,transparent 55%)",pointerEvents:"none" }} />
            <div style={{ position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,.05)",pointerEvents:"none" }} />

            {/* Bot avatar */}
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "rgba(255,255,255,.16)", backdropFilter: "blur(10px)",
              border: "1.5px solid rgba(255,255,255,.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, position: "relative",
            }}>
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <rect x="5" y="10" width="22" height="16" rx="6" fill="white" opacity=".95"/>
                <circle cx="11.5" cy="17.5" r="2.6" fill="#6366f1"/>
                <circle cx="20.5" cy="17.5" r="2.6" fill="#6366f1"/>
                <circle cx="11.5" cy="17.5" r="1" fill="white"/>
                <circle cx="20.5" cy="17.5" r="1" fill="white"/>
                <rect x="14" y="5" width="4" height="6" rx="2" fill="white" opacity=".9"/>
                <circle cx="16" cy="4" r="2" fill="white" opacity=".88"/>
              </svg>
              <span style={{ position:"absolute",top:2,right:2,width:9,height:9,borderRadius:"50%",background:"#4ade80",border:"2px solid rgba(255,255,255,.8)",animation:"glow 1.5s ease-in-out infinite" }} />
            </div>

            {/* Name + status */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                <p style={{ color:"#fff",fontWeight:700,fontSize:14.5,lineHeight:1.2 }}>Recruweb AI Assistant</p>
                <span style={{ background:"rgba(255,255,255,.18)",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:20,border:"1px solid rgba(255,255,255,.25)",letterSpacing:".08em" }}>GEMINI</span>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:5,marginTop:4 }}>
                <span style={{ width:6,height:6,borderRadius:"50%",background:"#4ade80",flexShrink:0,animation:"glow 1.5s ease-in-out infinite" }} />
                <p style={{ color:"rgba(255,255,255,.7)",fontSize:11 }}>Online · Powered by Gemini AI</p>
              </div>
            </div>

            {/* Control buttons */}
            <div style={{ display:"flex",gap:5,flexShrink:0 }}>
              {[
                { title: voiceEnabled ? "Mute AI voice" : "Enable AI voice", icon: voiceEnabled ? <Volume2 size={13}/> : <VolumeX size={13}/>, onClick: () => { setVoice(v => !v); if (isSpeaking) { window.speechSynthesis?.cancel(); setSpeaking(false); } }, active: voiceEnabled },
                { title: "Clear chat", icon: <RotateCcw size={12}/>, onClick: clearChat },
                { title: "Minimize", icon: <ChevronDown size={13}/>, onClick: minimize },
                { title: "Close", icon: <X size={13}/>, onClick: closeChat },
              ].map(({ title, icon, onClick, active }) => (
                <button key={title} onClick={onClick} title={title} style={{
                  width: 28, height: 28, borderRadius: 9,
                  background: active ? "rgba(74,222,128,.2)" : "rgba(255,255,255,.1)",
                  border: "1px solid rgba(255,255,255,.18)",
                  color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "background .15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.22)"}
                  onMouseLeave={e => e.currentTarget.style.background = active ? "rgba(74,222,128,.2)" : "rgba(255,255,255,.1)"}
                >{icon}</button>
              ))}
            </div>
          </div>

          {/* MESSAGES */}
          <div
            className="msgs-scroll"
            style={{
              flex: 1, overflowY: "auto", padding: "16px 14px 8px",
              display: "flex", flexDirection: "column", gap: 12,
              background: "linear-gradient(180deg,#f8f7ff 0%,#fafafe 100%)",
            }}
          >
            {messages.map((msg, i) => (
              <div key={i} className="msg-in" style={{
                display: "flex", gap: 9,
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-end",
              }}>
                {/* Avatar */}
                <div style={{
                  width: 30, height: 30, borderRadius: 10, flexShrink: 0, marginBottom: 2,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  ...(msg.role === "user"
                    ? { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 2px 8px rgba(79,70,229,.3)" }
                    : { background: "#fff", border: "1.5px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }
                  ),
                }}>
                  {msg.role === "user"
                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 32 32" fill="none"><rect x="5" y="10" width="22" height="16" rx="6" fill="#6366f1"/><circle cx="11.5" cy="17.5" r="2.2" fill="white"/><circle cx="20.5" cy="17.5" r="2.2" fill="white"/></svg>
                  }
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: "79%",
                  ...(msg.role === "user"
                    ? {}
                    : { display: "flex", flexDirection: "column" }
                  ),
                }}>
                  <div style={{
                    padding: "10px 13px",
                    borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                    ...(msg.role === "user"
                      ? { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", boxShadow: "0 4px 14px rgba(79,70,229,.25)" }
                      : { background: "#fff", color: "#1f2937", border: "1px solid #ede9fe", boxShadow: "0 1px 8px rgba(0,0,0,.06)" }
                    ),
                  }}>
                    <div style={{ display:"flex",flexDirection:"column",gap:2 }}>
                      {formatMessage(msg.content)}
                    </div>
                  </div>
                  {msg.ts && <MsgTime ts={msg.ts} />}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="msg-in" style={{ display:"flex",gap:9,alignItems:"flex-end" }}>
                <div style={{ width:30,height:30,borderRadius:10,background:"#fff",border:"1.5px solid #e5e7eb",boxShadow:"0 1px 4px rgba(0,0,0,.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <svg width="14" height="14" viewBox="0 0 32 32" fill="none"><rect x="5" y="10" width="22" height="16" rx="6" fill="#6366f1"/><circle cx="11.5" cy="17.5" r="2.2" fill="white"/><circle cx="20.5" cy="17.5" r="2.2" fill="white"/></svg>
                </div>
                <div style={{ background:"#fff",border:"1px solid #ede9fe",borderRadius:"4px 16px 16px 16px",padding:"11px 14px",boxShadow:"0 1px 8px rgba(0,0,0,.06)" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <TypingDots />
                    <span style={{ fontSize:11,color:"#9ca3af" }}>Thinking…</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stop speaking */}
            {isSpeaking && (
              <div style={{ display:"flex",justifyContent:"center" }}>
                <button onClick={() => { window.speechSynthesis?.cancel(); setSpeaking(false); }}
                  style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#6366f1",background:"rgba(99,102,241,.08)",border:"1px solid rgba(99,102,241,.18)",padding:"5px 14px",borderRadius:20,cursor:"pointer" }}>
                  <VolumeX size={11}/> Stop speaking
                </button>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* FOLLOW-UP CHIPS — shown after AI responds */}
          {!showWelcome && messages.length > 1 && !loading && (
            <div style={{ padding:"7px 12px 5px",borderTop:"1px solid #f0ebfe",background:"#faf9ff",flexShrink:0 }}>
              <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                {FOLLOW_UP_CHIPS[chipSet % FOLLOW_UP_CHIPS.length].map((chip, i) => (
                  <button key={chip} className="chip-in" onClick={() => sendMessage(chip)}
                    style={{
                      animationDelay:`${i*.05}s`,
                      fontSize:11,color:"#5b21b6",
                      background:"rgba(99,102,241,.07)",
                      border:"1px solid rgba(99,102,241,.2)",
                      padding:"4px 11px",borderRadius:20,
                      cursor:"pointer",transition:"all .15s",fontWeight:500,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(99,102,241,.14)"; e.currentTarget.style.borderColor="rgba(99,102,241,.45)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(99,102,241,.07)"; e.currentTarget.style.borderColor="rgba(99,102,241,.2)"; }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INPUT BAR */}
          <div style={{ padding:"10px 12px 14px",borderTop:"1px solid #ede9fe",background:"#fff",flexShrink:0 }}>

            {/* Voice detected banner */}
            {isListening && (
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8,padding:"7px 11px",background:"linear-gradient(135deg,#fef2f2,#ffe4e6)",borderRadius:10,border:"1px solid #fecaca" }}>
                <div style={{ display:"flex",gap:2.5,alignItems:"center",flexShrink:0 }}>
                  {[1,2,3,4,5,4,3,2].map((h,i) => (
                    <div key={i} style={{ width:2.5,height:h*4,background:"#ef4444",borderRadius:2,animation:"waveBar .8s ease-in-out infinite",animationDelay:`${i*.1}s` }} />
                  ))}
                </div>
                <span style={{ fontSize:12,color:"#dc2626",fontWeight:600,flex:1 }}>
                  {voiceBanner || "Listening… speak now"}
                </span>
                <button onClick={toggleVoice} style={{ fontSize:10,color:"#ef4444",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",padding:"2px 8px",borderRadius:10,cursor:"pointer",fontWeight:600 }}>
                  Stop
                </button>
              </div>
            )}

            <div style={{ display:"flex",gap:8,alignItems:"flex-end" }}>
              {/* Mic button */}
              <button onClick={toggleVoice} title={isListening ? "Stop listening" : "Voice input — auto-sends after speaking"}
                style={{
                  width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background: isListening ? "#ef4444" : "rgba(99,102,241,.09)",
                  border: `1.5px solid ${isListening ? "#ef4444" : "rgba(99,102,241,.25)"}`,
                  color: isListening ? "#fff" : "#6366f1",
                  cursor:"pointer",transition:"all .18s",
                  boxShadow: isListening ? "0 0 0 4px rgba(239,68,68,.18)" : "none",
                }}>
                {isListening ? <MicOff size={15}/> : <Mic size={15}/>}
              </button>

              {/* Text input */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={isListening ? "🎤 Voice input active…" : "Ask about jobs, resume, interviews…"}
                rows={1}
                disabled={loading || isListening}
                style={{
                  flex: 1, resize: "none", borderRadius: 13,
                  border: "1.5px solid #e5e7eb",
                  background: isListening ? "#fef9ff" : "#f8f7ff",
                  padding: "9px 13px", fontSize: 13,
                  outline: "none", maxHeight: 80, overflowY: "auto",
                  fontFamily: "inherit", lineHeight: 1.5,
                  transition: "border-color .15s, box-shadow .15s",
                  color: "#1f2937",
                }}
                onFocus={e => { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,.1)"; }}
                onBlur={e => { e.target.style.borderColor="#e5e7eb"; e.target.style.boxShadow="none"; }}
              />

              {/* Send button */}
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading || isListening}
                style={{
                  width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background: (input.trim() && !loading && !isListening) ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "#e5e7eb",
                  border: "none",
                  color: (input.trim() && !loading && !isListening) ? "#fff" : "#9ca3af",
                  cursor: (input.trim() && !loading && !isListening) ? "pointer" : "not-allowed",
                  transition: "all .18s",
                  boxShadow: (input.trim() && !loading && !isListening) ? "0 4px 14px rgba(79,70,229,.32)" : "none",
                  transform: (input.trim() && !loading && !isListening) ? "scale(1)" : "scale(.97)",
                }}>
                {loading
                  ? <div style={{ width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite" }} />
                  : <Send size={15}/>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
