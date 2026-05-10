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
  { label: "Career Switch", icon: "🚀", message: "I want to switch from backend to product management, how?" },
  { label: "Platform Help", icon: "💬", message: "How do I apply for jobs on Recruweb?" },
];

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `Hello! 👋 I'm your **Recruweb AI Career Assistant** — powered by Gemini AI.\n\nI'm here to help you:\n\n• 🔍 **Find the right jobs** based on your skills and experience\n• 🎤 **Ace your interviews** with role-specific preparation\n• 📄 **Optimize your resume** for ATS systems\n• 💬 **Navigate Recruweb** and answer platform questions\n• 💡 **Career guidance** tailored to the Indian job market\n\nHow can I help you today?`,
  timestamp: new Date(),
};

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-end gap-3 mb-4"
    >
      <div className="w-8 h-8 rounded-full ai-badge-bg flex items-center justify-center flex-shrink-0 shadow-md">
        <span className="text-white text-sm">✦</span>
      </div>
      <div className="chat-bubble-ai px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-5">
          <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground inline-block"></span>
          <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground inline-block"></span>
          <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground inline-block"></span>
        </div>
      </div>
    </motion.div>
  );
}

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isUser = message.role === "user";

  const formatContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`(.*?)`/g, "<code class='bg-muted px-1 rounded text-xs font-mono'>$1</code>");
      return (
        <span key={i}>
          {i > 0 && <br />}
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
        </span>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.03 }}
      className={`flex items-end gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full ai-badge-bg flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-white text-sm">✦</span>
        </div>
      )}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-white text-xs font-bold">U</span>
        </div>
      )}

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? "chat-bubble-user" : "chat-bubble-ai"} px-4 py-3 shadow-sm`}>
        <div className={`text-sm leading-relaxed ${isUser ? "text-white" : "text-foreground"}`}>
          {formatContent(message.content)}
        </div>
        <div className={`text-[10px] mt-1.5 ${isUser ? "text-white/60" : "text-muted-foreground"} text-right`}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </motion.div>
  );
}

function AIBadge({ isListening }: { isListening: boolean }) {
  return (
    <div className="relative flex items-center justify-center w-10 h-10">
      {isListening && (
        <span className="absolute inset-0 rounded-full ai-badge-bg animate-pulse-ring opacity-40" />
      )}
      <div className="relative w-10 h-10 rounded-full ai-badge-bg flex items-center justify-center shadow-lg">
        <span className="text-white text-lg">✦</span>
      </div>
    </div>
  );
}

export default function RecruwebChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setShowQuickActions(false);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(`${BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Sorry, I couldn't get a response. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const startVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser. Please use Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceTranscript("");
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      const current = final || interim;
      setVoiceTranscript(current);
      setInput(current);
    };

    recognition.onend = () => {
      setIsListening(false);
      setVoiceTranscript("");
      // Auto submit after voice ends if there's content
      setInput((currentInput) => {
        const trimmed = currentInput.trim();
        if (trimmed) {
          setTimeout(() => sendMessage(trimmed), 200);
        }
        return currentInput;
      });
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setVoiceTranscript("");
      if (event.error !== "no-speech") {
        console.error("Speech recognition error:", event.error);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setShowQuickActions(true);
    setInput("");
  };

  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  return (
    <div className={`flex flex-col h-screen max-h-screen overflow-hidden bg-background`}>
      {/* Header */}
      <div className="glass-panel border-b border-border px-4 py-3 flex items-center gap-3 z-10 flex-shrink-0">
        <AIBadge isListening={isListening} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base text-foreground leading-tight">Recruweb AI Assistant</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full ai-badge-bg text-white shadow-sm">
              GEMINI AI
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            <span className="text-[11px] text-muted-foreground">Online · Ready to help</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            title="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button
            onClick={clearChat}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            title="Clear chat"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H3.5C3.22386 4 3 3.77614 3 3.5ZM3.5 5C3.22386 5 3 5.22386 3 5.5V12C3 12.5523 3.44772 13 4 13H11C11.5523 13 12 12.5523 12 12V5.5C12 5.22386 11.7761 5 11.5 5H3.5ZM4 6H11V12H4V6Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <MessageBubble key={msg.id} message={msg} index={index} />
          ))}
        </AnimatePresence>

        {isLoading && (
          <AnimatePresence>
            <TypingIndicator />
          </AnimatePresence>
        )}

        {/* Quick Actions */}
        <AnimatePresence>
          {showQuickActions && messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <p className="text-xs text-muted-foreground text-center mb-3 font-medium uppercase tracking-wide">
                Quick Start
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.message)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left group shadow-xs"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">{action.icon}</span>
                    <span className="text-xs font-medium text-foreground leading-tight">{action.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Voice indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800"
          >
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  animate={{ scaleY: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  className="block w-1 h-4 bg-red-500 rounded-full"
                />
              ))}
            </div>
            <span className="text-sm text-red-600 dark:text-red-400 font-medium flex-1 truncate">
              {voiceTranscript || "Listening... speak now"}
            </span>
            <span className="text-xs text-red-400">Tap mic to stop</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="glass-panel border-t border-border px-4 py-3 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* Voice Button */}
          <button
            type="button"
            onClick={startVoice}
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
              isListening
                ? "bg-red-500 text-white animate-mic-pulse"
                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            }`}
            title={isListening ? "Stop listening" : "Voice input"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={autoResizeTextarea}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "🎤 Listening..." : "Ask me anything about jobs, interviews, or your career..."}
              rows={1}
              disabled={isLoading}
              className="w-full resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all overflow-hidden leading-relaxed min-h-[40px]"
              style={{ height: "40px" }}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-10 h-10 rounded-xl ai-badge-bg text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-sm active:scale-95"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </form>

        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Press <kbd className="font-mono bg-muted px-1 rounded text-[10px]">Enter</kbd> to send · <kbd className="font-mono bg-muted px-1 rounded text-[10px]">Shift+Enter</kbd> for new line · Mic auto-submits
        </p>
      </div>
    </div>
  );
}
