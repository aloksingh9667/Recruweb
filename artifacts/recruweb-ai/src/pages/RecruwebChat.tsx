import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type QuickAction = { label: string; icon: string; message: string };

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Find Jobs", icon: "🔍", message: "Help me find jobs matching my skills in software development" },
  { label: "Interview Prep", icon: "🎤", message: "Help me prepare for a frontend developer interview" },
  { label: "Resume Tips", icon: "📄", message: "How can I improve my resume for ATS systems?" },
  { label: "Salary Guide", icon: "💰", message: "What is the average salary for a software engineer in Noida?" },
  { label: "Career Switch", icon: "🚀", message: "I want to switch careers — how do I plan it?" },
  { label: "Platform Help", icon: "💬", message: "How do I apply for jobs on Recruweb?" },
];

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: `Hello! I'm your **Recruweb AI Career Assistant**, powered by Gemini AI.\n\nI can help you with:\n\n• 🔍 **Job Search** — find roles matching your skills\n• 🎤 **Interview Prep** — practice with real questions\n• 📄 **Resume Optimization** — beat ATS filters\n• 💡 **Career Guidance** — tailored for the Indian job market\n• 💬 **Platform Support** — anything about Recruweb\n\nWhat would you like help with today?`,
  timestamp: new Date(),
};

/* ── Text-to-Speech helper ── */
function speak(text: string, enabled: boolean) {
  if (!enabled || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/[*_`#>~]/g, "").replace(/\n+/g, " ").trim();
  const utt = new SpeechSynthesisUtterance(clean);
  utt.lang = "en-IN";
  utt.rate = 1.05;
  utt.pitch = 1;
  // pick a decent voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) => v.lang.startsWith("en") && /Google|Microsoft|Samantha|Alex/i.test(v.name)
  );
  if (preferred) utt.voice = preferred;
  window.speechSynthesis.speak(utt);
}

/* ── Markdown-lite formatter ── */
function FormatText({ text, light }: { text: string; light?: boolean }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const html = line
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(
            /`(.*?)`/g,
            `<code class="px-1 py-0.5 rounded text-[11px] font-mono ${light ? "bg-white/20" : "bg-muted"} ">$1</code>`
          );
        return (
          <span key={i}>
            {i > 0 && <br />}
            <span dangerouslySetInnerHTML={{ __html: html }} />
          </span>
        );
      })}
    </>
  );
}

/* ── Typing dots ── */
function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-end gap-2.5 mb-3"
    >
      <BotAvatar />
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
              className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Bot Avatar (animated gem) ── */
function BotAvatar({ size = "sm" }: { size?: "sm" | "lg" }) {
  const dim = size === "lg" ? "w-12 h-12" : "w-8 h-8";
  return (
    <div
      className={`${dim} rounded-full flex-shrink-0 flex items-center justify-center shadow-md relative overflow-hidden`}
      style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%)" }}
    >
      <motion.span
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="text-white select-none"
        style={{ fontSize: size === "lg" ? 22 : 15 }}
      >
        ✦
      </motion.span>
      {/* glow ring */}
      <motion.span
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.3, 1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)" }}
      />
    </div>
  );
}

/* ── Single message bubble ── */
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`flex items-end gap-2.5 mb-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-slate-600 to-slate-800 shadow-md text-white text-xs font-bold">
          U
        </div>
      ) : (
        <BotAvatar />
      )}

      {/* bubble */}
      <div
        className={`max-w-[78%] px-4 py-3 shadow-sm text-sm leading-relaxed ${
          isUser
            ? "rounded-2xl rounded-br-sm text-white"
            : "rounded-2xl rounded-bl-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
        }`}
        style={
          isUser
            ? { background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)" }
            : {}
        }
      >
        <FormatText text={msg.content} light={isUser} />
        <div
          className={`text-[10px] mt-1.5 text-right ${
            isUser ? "text-indigo-200" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Voice waveform bars ── */
function VoiceWave() {
  return (
    <div className="flex gap-0.5 items-center h-5">
      {[0, 1, 2, 3, 4, 3, 2, 1].map((h, i) => (
        <motion.span
          key={i}
          animate={{ scaleY: [0.3 + h * 0.15, 1, 0.3 + h * 0.15] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }}
          className="block w-1 rounded-full bg-red-400"
          style={{ height: 16 }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════ */
export default function RecruwebChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [ttsOn, setTtsOn] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showQuick, setShowQuick] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const ttsRef = useRef(ttsOn);
  ttsRef.current = ttsOn;

  /* scroll to bottom */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* dark mode */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  /* load voices */
  useEffect(() => {
    if (window.speechSynthesis?.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }
    window.speechSynthesis?.getVoices();
    // speak welcome on first load
    setTimeout(() => speak(WELCOME.content, true), 800);
  }, []);

  /* ── Send message ── */
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setShowQuick(false);
      setInput("");
      if (inputRef.current) {
        inputRef.current.style.height = "44px";
      }

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const history = messages
          .filter((m) => m.id !== "welcome")
          .slice(-12)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch(`${BASE}/api/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history }),
        });

        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        const reply = data.response || "Sorry, I couldn't get a response. Please try again.";

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        speak(reply, ttsRef.current);
      } catch {
        const errMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "⚠️ I'm having trouble connecting right now. The backend server may still be starting up. Please try again in a moment.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 80);
      }
    },
    [messages, isLoading]
  );

  /* ── Voice input ── */
  const toggleVoice = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input is not supported. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const rec = new SR();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = true;

    let finalText = "";

    rec.onstart = () => {
      setIsListening(true);
      setVoiceText("");
      finalText = "";
      // stop TTS while listening
      window.speechSynthesis?.cancel();
    };

    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      const current = finalText || interim;
      setVoiceText(current);
      // live-type into input as you speak
      setInput(current);
      if (inputRef.current) {
        inputRef.current.value = current;
        inputRef.current.style.height = "auto";
        inputRef.current.style.height =
          Math.min(inputRef.current.scrollHeight, 120) + "px";
      }
    };

    rec.onend = () => {
      setIsListening(false);
      setVoiceText("");
      // auto-submit the recognised text
      setInput((curr) => {
        const t = curr.trim();
        if (t) setTimeout(() => sendMessage(t), 120);
        return curr;
      });
    };

    rec.onerror = (e: any) => {
      setIsListening(false);
      setVoiceText("");
      if (e.error !== "no-speech") console.error("STT error:", e.error);
    };

    recognitionRef.current = rec;
    rec.start();
  }, [isListening, sendMessage]);

  /* ── Auto-resize textarea ── */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    window.speechSynthesis?.cancel();
    setMessages([WELCOME]);
    setShowQuick(true);
    setInput("");
  };

  const stopSpeaking = () => window.speechSynthesis?.cancel();

  /* ════════════════════════════ RENDER ════════════════════════════ */
  return (
    <div
      className="flex flex-col h-screen max-h-screen overflow-hidden"
      style={{
        background: darkMode
          ? "linear-gradient(160deg,#0f1123 0%,#1a1f3a 100%)"
          : "linear-gradient(160deg,#f0f0ff 0%,#f8f7ff 50%,#fff 100%)",
      }}
    >
      {/* ── HEADER ── */}
      <header
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b z-10"
        style={{
          background: darkMode ? "rgba(15,17,35,0.85)" : "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderColor: darkMode ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)",
        }}
      >
        {/* animated gem badge */}
        <div className="relative">
          <BotAvatar size="lg" />
          {/* online ring */}
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 flex items-center justify-center">
            <motion.span
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-300 block"
            />
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-bold text-[15px] text-slate-900 dark:text-white leading-tight">
              Recruweb AI Assistant
            </h1>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm"
              style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }}
            >
              GEMINI
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Online · Career AI Assistant
          </p>
        </div>

        {/* controls */}
        <div className="flex items-center gap-1.5">
          {/* TTS toggle */}
          <button
            onClick={() => {
              setTtsOn((v) => !v);
              if (ttsOn) window.speechSynthesis?.cancel();
            }}
            title={ttsOn ? "Speaker on" : "Speaker off"}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm ${
              ttsOn
                ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300"
                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {ttsOn ? "🔊" : "🔇"}
          </button>
          {/* stop speaking */}
          <button
            onClick={stopSpeaking}
            title="Stop speaking"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm"
          >
            ⏹
          </button>
          {/* dark mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          {/* clear */}
          <button
            onClick={clearChat}
            title="New chat"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </AnimatePresence>

        {isLoading && (
          <AnimatePresence>
            <TypingBubble key="typing" />
          </AnimatePresence>
        )}

        {/* quick actions */}
        <AnimatePresence>
          {showQuick && messages.length === 1 && (
            <motion.div
              key="quick"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 mb-2"
            >
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mb-3 font-medium tracking-wider uppercase">
                Quick Start
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUICK_ACTIONS.map((a) => (
                  <motion.button
                    key={a.label}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendMessage(a.message)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left group transition-all shadow-sm"
                    style={{
                      background: darkMode ? "rgba(30,32,60,0.6)" : "rgba(255,255,255,0.8)",
                      borderColor: darkMode ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)",
                    }}
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">{a.icon}</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                      {a.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── VOICE BANNER ── */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2.5 flex items-center gap-3 border-t"
            style={{
              background: darkMode ? "rgba(239,68,68,0.12)" : "rgba(254,226,226,0.8)",
              borderColor: darkMode ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.2)",
            }}
          >
            <VoiceWave />
            <span className="text-sm font-medium text-red-600 dark:text-red-400 flex-1 truncate">
              {voiceText || "Listening… speak now"}
            </span>
            <button
              onClick={toggleVoice}
              className="text-xs text-red-500 dark:text-red-400 font-semibold px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 transition-colors"
            >
              Stop
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── INPUT AREA ── */}
      <div
        className="px-4 pt-3 pb-4 flex-shrink-0 border-t"
        style={{
          background: darkMode ? "rgba(15,17,35,0.9)" : "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
          borderColor: darkMode ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)",
        }}
      >
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex items-end gap-2">
          {/* mic button */}
          <motion.button
            type="button"
            onClick={toggleVoice}
            whileTap={{ scale: 0.93 }}
            className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center transition-all shadow-sm ${
              isListening
                ? "bg-red-500 text-white shadow-red-200 dark:shadow-red-900"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600"
            }`}
            style={isListening ? { boxShadow: "0 0 0 8px rgba(239,68,68,0.15)" } : {}}
            title={isListening ? "Stop (auto-submits)" : "Voice input (auto-submits on stop)"}
          >
            {isListening ? (
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
                🎤
              </motion.span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}
          </motion.button>

          {/* textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKey}
              placeholder={
                isListening
                  ? "🎤 Speaking… (will auto-submit)"
                  : "Ask about jobs, resume, interview prep…"
              }
              rows={1}
              disabled={isLoading}
              className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm leading-relaxed focus:outline-none transition-all disabled:opacity-50"
              style={{
                minHeight: 44,
                maxHeight: 120,
                background: darkMode ? "rgba(30,32,60,0.7)" : "rgba(248,247,255,0.9)",
                borderColor: isListening
                  ? "#ef4444"
                  : darkMode
                  ? "rgba(99,102,241,0.25)"
                  : "rgba(99,102,241,0.2)",
                color: darkMode ? "#e2e8f0" : "#1e1b4b",
                boxShadow: isListening
                  ? "0 0 0 3px rgba(239,68,68,0.1)"
                  : "0 0 0 3px rgba(99,102,241,0)",
              }}
            />
          </div>

          {/* send button */}
          <motion.button
            type="submit"
            disabled={!input.trim() || isLoading}
            whileTap={{ scale: 0.93 }}
            className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)" }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
              />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </motion.button>
        </form>

        <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center mt-2 leading-relaxed">
          <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-[10px]">Enter</kbd> send
          {" · "}
          <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-[10px]">Shift+Enter</kbd> newline
          {" · "}
          🎤 Voice auto-types &amp; submits
          {" · "}
          {ttsOn ? "🔊 AI reads aloud" : "🔇 Speaker off"}
        </p>
      </div>
    </div>
  );
}
