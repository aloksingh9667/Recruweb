import { useState, useRef, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { useLocation } from "wouter";
import { X, Send, Mic, MicOff, Volume2, VolumeX, Minimize2, Sparkles, ChevronDown, RotateCcw } from "lucide-react";

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "linear-gradient(135deg,#6366f1,#a855f7)",
          display: "inline-block",
          animation: "chatBounce 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.18}s`,
        }} />
      ))}
    </div>
  );
}

function formatMessage(content) {
  return content.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 3 }} />;
    if (/^[•\-*]/.test(line)) {
      const text = line.replace(/^[•\-*]\s*/, "");
      const html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <div key={i} style={{ display: "flex", gap: 7, marginBottom: 2 }}>
          <span style={{ marginTop: 6, width: 4, height: 4, borderRadius: "50%", background: "currentColor", opacity: 0.4, flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      );
    }
    const html = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    return <p key={i} style={{ fontSize: 12.5, lineHeight: 1.6, marginBottom: 1 }} dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

export function AIChatbot() {
  const [open, setOpen]           = useState(false);
  const [minimized, setMin]       = useState(false);
  const [messages, setMessages]   = useState([{
    role: "assistant", ts: Date.now(),
    content: "Hi! 👋 I'm your **AI Career Assistant**.\n\nAsk me about jobs, resumes, interviews, or anything career-related!",
  }]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [suggestions, setSuggestions] = useState([
    "Find jobs for freshers", "How to write a good resume?", "Interview tips for IT jobs",
  ]);
  const [isListening, setListen]  = useState(false);
  const [voiceEnabled, setVoice]  = useState(false);
  const [isSpeaking, setSpeaking] = useState(false);
  const [popupVisible, setVis]    = useState(false);
  const [fabHover, setFabHover]   = useState(false);
  const [voiceBanner, setVoiceBanner] = useState("");

  const endRef        = useRef(null);
  const inputRef      = useRef(null);
  const recRef        = useRef(null);
  const sendRef       = useRef(null);
  const transcriptRef = useRef("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => setVis(true), 10);
      setTimeout(() => inputRef.current?.focus(), 200);
    } else setVis(false);
  }, [open, minimized]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false; rec.interimResults = true; rec.lang = "en-IN";
    rec.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      const text = final || interim;
      transcriptRef.current = text; setInput(text); setVoiceBanner(text);
    };
    rec.onend = () => {
      setListen(false);
      const t = transcriptRef.current.trim();
      if (t) { transcriptRef.current = ""; setVoiceBanner(""); setTimeout(() => sendRef.current(t), 120); }
      else setVoiceBanner("");
    };
    rec.onerror = () => { setListen(false); setVoiceBanner(""); };
    recRef.current = rec;
  }, []);

  const speakText = useCallback((text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*•#🔍🎯📄💬👋✨]/g, "").replace(/\n/g, " ").trim();
    const utt = new SpeechSynthesisUtterance(clean.slice(0, 250));
    utt.lang = "en-IN"; utt.rate = 1.05;
    const v = (window.speechSynthesis.getVoices() || []).find(v => v.name.includes("Google") || v.lang.startsWith("en")) || null;
    if (v) utt.voice = v;
    utt.onstart = () => setSpeaking(true);
    utt.onend   = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, [voiceEnabled]);

  const sendMessage = useCallback(async (text) => {
    const msg = (typeof text === "string" ? text : input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg, ts: Date.now() }]);
    setLoading(true);
    setSuggestions([]);

    const jobKeywords = ["find job", "search job", "job in", "jobs in", "vacancy", "hiring", "show jobs"];
    const hasJobIntent = jobKeywords.some(t => msg.toLowerCase().includes(t));

    try {
      const data = await fetchApi("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-6),
          systemHint: `You are Recruweb's AI career assistant for India's job market. Help with job search, interview prep, resume tips, platform support. Always use Indian context (INR, Indian cities/companies like TCS, Infosys). Be concise, friendly, max 100 words. Use bullet points for lists.`,
        }),
      });

      const reply = data.response;
      setMessages(prev => [...prev, { role: "assistant", content: reply, ts: Date.now() }]);
      speakText(reply);
      if (data.suggestions?.length) setSuggestions(data.suggestions.slice(0, 3));

      if (hasJobIntent) {
        const kw = msg.replace(/(find|search|show|list|get|me|jobs?|in|for|at|the|all)/gi, "").trim();
        setTimeout(() => {
          setMessages(prev => [...prev, { role: "assistant", ts: Date.now(), content: "🔍 Taking you to the Jobs page!" }]);
          setTimeout(() => setLocation(`/jobs?search=${encodeURIComponent(kw.slice(0, 50))}`), 900);
        }, 700);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", ts: Date.now(), content: "⚠️ Connection error. Please try again." }]);
      setSuggestions(["Try again", "Find jobs in my city", "Resume tips"]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, speakText, setLocation]);

  sendRef.current = sendMessage;

  const toggleVoice = () => {
    if (!recRef.current) { alert("Voice input needs Chrome/Edge."); return; }
    if (isListening) { recRef.current.stop(); setListen(false); setVoiceBanner(""); }
    else { transcriptRef.current = ""; setInput(""); setVoiceBanner(""); recRef.current.start(); setListen(true); }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", ts: Date.now(), content: "Chat cleared! How can I help you?" }]);
    setSuggestions(["Find me a job", "Resume tips", "Interview prep"]);
    setInput("");
  };

  const openChat  = () => { setOpen(true); setMin(false); };
  const closeChat = () => { setVis(false); setTimeout(() => setOpen(false), 200); };
  const minimize  = () => { setVis(false); setTimeout(() => setMin(true), 200); };

  return (
    <>
      <style>{`
        @keyframes chatBounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-5px);opacity:1}}
        @keyframes chatUp{from{opacity:0;transform:translateY(20px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes chatDown{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(20px) scale(.95)}}
        @keyframes fabIn{0%{transform:scale(.5) rotate(-20deg);opacity:0}70%{transform:scale(1.08) rotate(4deg)}100%{transform:scale(1) rotate(0);opacity:1}}
        @keyframes pulse2{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.65);opacity:0}}
        @keyframes glow{0%,100%{opacity:.6}50%{opacity:1}}
        @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes chipIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
        .chat-enter{animation:chatUp .28s cubic-bezier(.34,1.56,.64,1) both}
        .chat-exit{animation:chatDown .18s ease-in both}
        .fab-in{animation:fabIn .45s cubic-bezier(.34,1.56,.64,1) both}
        .msg-in{animation:msgIn .2s ease both}
        .chip-in{animation:chipIn .15s ease both}
        .msgs-scroll::-webkit-scrollbar{width:3px}
        .msgs-scroll::-webkit-scrollbar-thumb{background:rgba(99,102,241,.2);border-radius:4px}
      `}</style>

      {/* FAB */}
      {(!open || minimized) && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
          {open && minimized && (
            <button onClick={() => { setMin(false); setOpen(true); }}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl shadow-xl text-white text-xs font-semibold"
              style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed,#a855f7)", boxShadow: "0 6px 20px rgba(99,102,241,.4)" }}>
              <Sparkles size={11} />AI Assistant
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", animation: "glow 1.5s ease-in-out infinite" }} />
            </button>
          )}
          {!minimized && (
            <button onClick={openChat} onMouseEnter={() => setFabHover(true)} onMouseLeave={() => setFabHover(false)}
              className="fab-in relative flex items-center justify-center shadow-2xl"
              style={{
                width: 56, height: 56, borderRadius: 18,
                background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#a855f7 100%)",
                boxShadow: fabHover ? "0 0 0 8px rgba(99,102,241,.14),0 16px 36px rgba(99,102,241,.5)" : "0 8px 24px rgba(99,102,241,.38)",
                transform: fabHover ? "scale(1.08) translateY(-2px)" : "scale(1)",
                transition: "all .25s cubic-bezier(.34,1.56,.64,1)",
              }} aria-label="Open AI Assistant">
              <span style={{ position:"absolute",inset:0,borderRadius:18,border:"2px solid rgba(168,85,247,.5)",animation:"pulse2 2.2s ease-out infinite" }} />
              <span style={{ position:"absolute",inset:0,borderRadius:18,border:"2px solid rgba(168,85,247,.3)",animation:"pulse2 2.2s ease-out infinite",animationDelay:".7s" }} />
              <span style={{ position:"absolute",top:4,right:4,width:9,height:9,borderRadius:"50%",background:"#4ade80",border:"2px solid white",animation:"glow 1.5s ease-in-out infinite",zIndex:2 }} />
              <svg width="25" height="25" viewBox="0 0 32 32" fill="none">
                <rect x="5" y="10" width="22" height="16" rx="6" fill="rgba(255,255,255,.95)"/>
                <circle cx="11.5" cy="17.5" r="2.6" fill="#6366f1"/><circle cx="20.5" cy="17.5" r="2.6" fill="#6366f1"/>
                <circle cx="11.5" cy="17.5" r="1" fill="white"/><circle cx="20.5" cy="17.5" r="1" fill="white"/>
                <rect x="14" y="5" width="4" height="6" rx="2" fill="rgba(255,255,255,.9)"/>
                <circle cx="16" cy="4" r="2" fill="rgba(255,255,255,.88)"/>
                <rect x="2" y="14.5" width="3" height="6" rx="1.5" fill="rgba(255,255,255,.7)"/>
                <rect x="27" y="14.5" width="3" height="6" rx="1.5" fill="rgba(255,255,255,.7)"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* CHAT WINDOW */}
      {open && !minimized && (
        <div
          className={`fixed z-50 flex flex-col overflow-hidden ${popupVisible ? "chat-enter" : "chat-exit"}`}
          style={{
            bottom: "1.25rem", right: "1.25rem",
            width: "min(360px, calc(100vw - 1.5rem))",
            height: "min(520px, calc(100dvh - 5rem))",
            borderRadius: 20,
            boxShadow: "0 24px 60px rgba(0,0,0,.2),0 0 0 1px rgba(99,102,241,.12),inset 0 1px 0 rgba(255,255,255,.5)",
            background: "#fff",
            display: "flex", flexDirection: "column",
          }}
        >
          {/* HEADER */}
          <div style={{
            background: "linear-gradient(135deg,#3730a3 0%,#5b21b6 55%,#9333ea 100%)",
            padding: "11px 14px 10px",
            display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,.15)", border: "1.5px solid rgba(255,255,255,.28)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0, position:"relative" }}>
              <svg width="19" height="19" viewBox="0 0 32 32" fill="none">
                <rect x="5" y="10" width="22" height="16" rx="6" fill="white" opacity=".95"/>
                <circle cx="11.5" cy="17.5" r="2.4" fill="#6366f1"/><circle cx="20.5" cy="17.5" r="2.4" fill="#6366f1"/>
                <circle cx="11.5" cy="17.5" r=".9" fill="white"/><circle cx="20.5" cy="17.5" r=".9" fill="white"/>
                <rect x="14" y="5" width="4" height="6" rx="2" fill="white" opacity=".9"/>
                <circle cx="16" cy="4" r="2" fill="white" opacity=".88"/>
              </svg>
              <span style={{ position:"absolute",top:1,right:1,width:8,height:8,borderRadius:"50%",background:"#4ade80",border:"1.5px solid rgba(255,255,255,.8)",animation:"glow 1.5s ease-in-out infinite" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display:"flex", alignItems:"center", gap: 6 }}>
                <p style={{ color:"#fff", fontWeight: 700, fontSize: 13.5, lineHeight: 1.2 }}>Recruweb AI</p>
                <span style={{ background:"rgba(255,255,255,.18)", color:"#fff", fontSize: 8, fontWeight: 800, padding:"1.5px 6px", borderRadius: 20, border:"1px solid rgba(255,255,255,.25)", letterSpacing:".08em" }}>GEMINI</span>
              </div>
              <p style={{ color:"rgba(255,255,255,.65)", fontSize: 10.5, marginTop: 2 }}>Career Assistant · Online</p>
            </div>
            <div style={{ display:"flex", gap: 4, flexShrink: 0 }}>
              {[
                { title: voiceEnabled ? "Mute" : "Enable voice", icon: voiceEnabled ? <Volume2 size={12}/> : <VolumeX size={12}/>, onClick: () => { setVoice(v => !v); if (isSpeaking) { window.speechSynthesis?.cancel(); setSpeaking(false); }}, active: voiceEnabled },
                { title: "Clear", icon: <RotateCcw size={11}/>, onClick: clearChat },
                { title: "Minimize", icon: <ChevronDown size={12}/>, onClick: minimize },
                { title: "Close", icon: <X size={12}/>, onClick: closeChat },
              ].map(({ title, icon, onClick, active }) => (
                <button key={title} onClick={onClick} title={title} style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: active ? "rgba(74,222,128,.2)" : "rgba(255,255,255,.1)",
                  border: "1px solid rgba(255,255,255,.18)", color: "#fff",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", transition:"background .12s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.22)"}
                  onMouseLeave={e => e.currentTarget.style.background = active ? "rgba(74,222,128,.2)" : "rgba(255,255,255,.1)"}
                >{icon}</button>
              ))}
            </div>
          </div>

          {/* MESSAGES */}
          <div className="msgs-scroll" style={{ flex: 1, overflowY: "auto", padding: "12px 12px 6px", display:"flex", flexDirection:"column", gap: 10, background:"linear-gradient(180deg,#f8f7ff 0%,#fafafe 100%)" }}>
            {messages.map((msg, i) => (
              <div key={i} className="msg-in" style={{ display:"flex", gap: 7, flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems:"flex-end" }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0, marginBottom: 1,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  ...(msg.role === "user"
                    ? { background:"linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow:"0 2px 6px rgba(79,70,229,.3)" }
                    : { background:"#fff", border:"1.5px solid #e5e7eb", boxShadow:"0 1px 4px rgba(0,0,0,.06)" }),
                }}>
                  {msg.role === "user"
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                    : <svg width="12" height="12" viewBox="0 0 32 32" fill="none"><rect x="5" y="10" width="22" height="16" rx="6" fill="#6366f1"/><circle cx="11.5" cy="17.5" r="2" fill="white"/><circle cx="20.5" cy="17.5" r="2" fill="white"/></svg>
                  }
                </div>
                <div style={{ maxWidth: "80%" }}>
                  <div style={{
                    padding: "9px 12px", borderRadius: msg.role === "user" ? "14px 3px 14px 14px" : "3px 14px 14px 14px",
                    ...(msg.role === "user"
                      ? { background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"#fff", boxShadow:"0 3px 12px rgba(79,70,229,.25)" }
                      : { background:"#fff", color:"#1f2937", border:"1px solid #ede9fe", boxShadow:"0 1px 6px rgba(0,0,0,.06)" }),
                  }}>
                    <div style={{ display:"flex", flexDirection:"column", gap: 1 }}>{formatMessage(msg.content)}</div>
                  </div>
                  <span style={{ fontSize: 9.5, opacity: 0.4, marginTop: 2, display:"block", textAlign: msg.role === "user" ? "right" : "left" }}>
                    {new Date(msg.ts).getHours()}:{String(new Date(msg.ts).getMinutes()).padStart(2, "0")}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="msg-in" style={{ display:"flex", gap: 7, alignItems:"flex-end" }}>
                <div style={{ width:26, height:26, borderRadius:8, background:"#fff", border:"1.5px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="12" height="12" viewBox="0 0 32 32" fill="none"><rect x="5" y="10" width="22" height="16" rx="6" fill="#6366f1"/><circle cx="11.5" cy="17.5" r="2" fill="white"/><circle cx="20.5" cy="17.5" r="2" fill="white"/></svg>
                </div>
                <div style={{ background:"#fff", border:"1px solid #ede9fe", borderRadius:"3px 14px 14px 14px", padding:"10px 12px", boxShadow:"0 1px 6px rgba(0,0,0,.06)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap: 5 }}>
                    <TypingDots />
                    <span style={{ fontSize: 10.5, color:"#9ca3af" }}>Thinking…</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stop speaking */}
            {isSpeaking && (
              <div style={{ display:"flex", justifyContent:"center" }}>
                <button onClick={() => { window.speechSynthesis?.cancel(); setSpeaking(false); }}
                  style={{ fontSize: 10.5, color:"#6366f1", background:"rgba(99,102,241,.08)", border:"1px solid rgba(99,102,241,.2)", borderRadius: 20, padding:"4px 12px", cursor:"pointer" }}>
                  ⏹ Stop speaking
                </button>
              </div>
            )}

            {/* Voice banner */}
            {voiceBanner && (
              <div style={{ textAlign:"center", fontSize: 11, color:"#6366f1", background:"rgba(99,102,241,.07)", border:"1px solid rgba(99,102,241,.15)", borderRadius: 10, padding:"5px 10px" }}>
                🎙 "{voiceBanner}"
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* SUGGESTIONS */}
          {suggestions.length > 0 && !loading && (
            <div style={{ padding: "6px 10px 4px", background:"linear-gradient(180deg,transparent,rgba(248,247,255,.95))", display:"flex", gap: 5, flexWrap:"wrap", flexShrink: 0 }}>
              {suggestions.map((s, i) => (
                <button key={i} className="chip-in" onClick={() => sendMessage(s)}
                  style={{
                    animationDelay: `${i * 0.07}s`,
                    fontSize: 11, fontWeight: 500, padding: "5px 10px", borderRadius: 20,
                    background:"rgba(99,102,241,.07)", border:"1px solid rgba(99,102,241,.18)",
                    color:"#4f46e5", cursor:"pointer", transition:"all .15s",
                    whiteSpace:"nowrap", maxWidth:"100%", overflow:"hidden", textOverflow:"ellipsis",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(99,102,241,.14)"; e.currentTarget.style.borderColor="rgba(99,102,241,.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(99,102,241,.07)"; e.currentTarget.style.borderColor="rgba(99,102,241,.18)"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* INPUT */}
          <div style={{ padding: "8px 10px 10px", borderTop:"1px solid rgba(99,102,241,.1)", background:"#fff", flexShrink: 0 }}>
            <div style={{ display:"flex", gap: 7, alignItems:"flex-end", background:"#f8f7ff", border:"1.5px solid rgba(99,102,241,.2)", borderRadius: 14, padding:"7px 7px 7px 12px", transition:"border-color .15s" }}
              onFocusCapture={e => e.currentTarget.style.borderColor="rgba(99,102,241,.5)"}
              onBlurCapture={e => e.currentTarget.style.borderColor="rgba(99,102,241,.2)"}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight, 80)+"px"; }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask me anything..."
                rows={1}
                style={{ flex:1, background:"transparent", border:"none", outline:"none", resize:"none", fontSize:12.5, lineHeight:1.5, color:"#1f2937", height:22, maxHeight:80, fontFamily:"inherit" }}
              />
              <div style={{ display:"flex", gap: 4, alignItems:"center", flexShrink: 0 }}>
                {recRef.current && (
                  <button onClick={toggleVoice} title={isListening ? "Stop" : "Voice"} style={{
                    width: 28, height: 28, borderRadius: 9, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s",
                    background: isListening ? "rgba(239,68,68,.12)" : "transparent", color: isListening ? "#ef4444" : "#9ca3af",
                  }}>
                    {isListening ? <MicOff size={14}/> : <Mic size={14}/>}
                  </button>
                )}
                <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{
                  width: 32, height: 32, borderRadius: 10, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s",
                  background: input.trim() && !loading ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "rgba(0,0,0,.06)",
                  color: input.trim() && !loading ? "#fff" : "#9ca3af",
                  boxShadow: input.trim() && !loading ? "0 2px 8px rgba(79,70,229,.35)" : "none",
                }}>
                  <Send size={13}/>
                </button>
              </div>
            </div>
            <p style={{ textAlign:"center", fontSize: 9.5, color:"#9ca3af", marginTop: 4 }}>Powered by Google Gemini · Press Enter to send</p>
          </div>
        </div>
      )}
    </>
  );
}
