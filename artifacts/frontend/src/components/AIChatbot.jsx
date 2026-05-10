import { useState, useRef, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  MessageCircle, X, Send, Bot, User, Loader2, Minimize2,
  Mic, MicOff, Volume2, VolumeX, Search, Brain, Headphones,
  ChevronRight, Briefcase, HelpCircle, Sparkles
} from "lucide-react";

const QUICK_ACTIONS = [
  { icon: Search, label: "Find Jobs", color: "bg-blue-50 text-blue-600 border-blue-200", msg: "Help me find relevant jobs. What kind of jobs are available?" },
  { icon: Brain, label: "Interview Prep", color: "bg-purple-50 text-purple-600 border-purple-200", msg: "Help me prepare for my upcoming interview. Give me common interview questions and tips." },
  { icon: Briefcase, label: "Resume Tips", color: "bg-green-50 text-green-600 border-green-200", msg: "Give me tips to improve my resume and make it ATS-friendly." },
  { icon: HelpCircle, label: "Support", color: "bg-orange-50 text-orange-600 border-orange-200", msg: "I need help with the Recruweb platform. What can you help me with?" },
];

const SUGGESTIONS = [
  "Jobs in Delhi NCR for React developer",
  "How to crack TCS interview?",
  "Tips for fresher resume",
  "Top paying IT jobs in Bangalore",
  "How to negotiate salary?",
  "Difference between CTC and in-hand salary",
];

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Namaste! 👋 I'm your Recruweb AI assistant. I can help you:\n• 🔍 **Find the right jobs** based on your skills\n• 🎤 **Prepare for interviews** with role-specific questions\n• 📄 **Improve your resume** for ATS systems\n• 💬 **Customer support** for any platform queries\n\nHow can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (open && !minimized && inputRef.current) inputRef.current.focus();
  }, [open, minimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in your browser. Please use Chrome.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*•#]/g, "").replace(/\n/g, " ").trim();
    const utterance = new SpeechSynthesisUtterance(clean.slice(0, 300));
    utterance.lang = "en-IN";
    utterance.rate = 1.05;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.includes("en-IN") || v.name.includes("Google")) || voices[0];
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setShowSuggestions(false);
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    // Check for job search intent and navigate
    const jobSearchTerms = ["find job", "search job", "job in", "jobs in", "job for", "jobs for", "vacancy", "opening", "hiring"];
    const hasJobIntent = jobSearchTerms.some(t => msg.toLowerCase().includes(t));

    try {
      const systemHint = `You are Recruweb's AI assistant for India's job portal. You help with:
1. Job search - suggest users to search on /jobs page, mention job categories, locations
2. Interview preparation - give role-specific questions and tips
3. Resume improvement - ATS tips, formatting, keywords
4. Platform support - explain Recruweb features
Keep responses concise, friendly, use Indian context (INR, Indian companies). Use bullet points. Max 150 words.`;

      const data = await fetchApi("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-6),
          systemHint
        }),
      });
      const reply = data.response;
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      speakText(reply);

      // Auto-navigate for job search
      if (hasJobIntent) {
        const keywords = msg.replace(/(find|search|show|list|get|me|jobs?|in|for|at|the)/gi, "").trim();
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: `🔍 Let me take you to the jobs page to find relevant opportunities!`
          }]);
          setTimeout(() => setLocation(`/jobs?search=${encodeURIComponent(keywords.slice(0, 50))}`), 1500);
        }, 1000);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, voiceEnabled]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleQuickAction = (msg) => {
    setShowSuggestions(false);
    sendMessage(msg);
  };

  const formatMessage = (content) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("•") || line.startsWith("-")) {
        return <li key={i} className="ml-3 text-sm leading-relaxed">{line.slice(1).trim()}</li>;
      }
      const bold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: bold || "&nbsp;" }} />;
    });
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimized(false); }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-primary animate-pulse" />
          </div>
          <span className="absolute -top-12 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            AI Career Assistant 🤖
          </span>
        </button>
      )}

      {/* Minimized bar */}
      {open && minimized && (
        <button
          onClick={() => setMinimized(false)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Bot className="w-4 h-4" />
          <span className="text-sm font-medium">AI Assistant</span>
          <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat window */}
      {open && !minimized && (
        <div className="fixed bottom-6 right-6 z-50 w-[390px] max-w-[calc(100vw-1.5rem)] h-[560px] max-h-[calc(100dvh-5rem)] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-gradient-to-r from-primary to-indigo-600 text-white shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">Recruweb AI Assistant</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                <p className="text-xs opacity-80">Online · Powered by Gemini AI</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Voice toggle */}
              <button
                onClick={() => { setVoiceEnabled(!voiceEnabled); if (isSpeaking) stopSpeaking(); }}
                title={voiceEnabled ? "Disable voice responses" : "Enable voice responses"}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${voiceEnabled ? "bg-green-400/30 hover:bg-green-400/50" : "hover:bg-white/20"}`}
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setMinimized(true)} className="w-7 h-7 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center">
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/20">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === "user" ? "bg-primary text-white" : "bg-white dark:bg-gray-700 border shadow-sm"
                }`}>
                  {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-primary" />}
                </div>
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl space-y-1 ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-white dark:bg-gray-800 text-foreground rounded-tl-sm shadow-sm border"
                }`}>
                  {formatMessage(msg.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white dark:bg-gray-700 border shadow-sm flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-white dark:bg-gray-800 border px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            {isSpeaking && (
              <div className="flex justify-center">
                <button onClick={stopSpeaking} className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors">
                  <VolumeX className="w-3 h-3" /> Stop speaking
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions & Suggestions */}
          {showSuggestions && messages.length === 1 && (
            <div className="px-3 pb-2 bg-gray-50/50 dark:bg-gray-900/20 border-t">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide px-1 pt-2 pb-1.5">Quick actions</p>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {QUICK_ACTIONS.map(({ icon: Icon, label, color, msg }) => (
                  <button
                    key={label}
                    onClick={() => handleQuickAction(msg)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all hover:shadow-sm ${color} dark:bg-opacity-10`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />{label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {SUGGESTIONS.slice(0, 3).map(s => (
                  <button
                    key={s}
                    onClick={() => handleQuickAction(s)}
                    className="text-[11px] px-2.5 py-1 rounded-full border bg-white dark:bg-gray-800 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <ChevronRight className="w-2.5 h-2.5" />{s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t bg-background shrink-0">
            <div className="flex gap-2 items-end">
              {/* Voice Input button */}
              <button
                onClick={toggleVoiceInput}
                title={isListening ? "Stop listening" : "Voice input"}
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all border ${
                  isListening
                    ? "bg-red-500 text-white border-red-500 animate-pulse"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground border-border"
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "🎤 Listening..." : "Ask about jobs, interview tips..."}
                rows={1}
                className="flex-1 resize-none rounded-xl border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary max-h-24 overflow-y-auto"
                style={{ fieldSizing: "content" }}
                disabled={loading || isListening}
              />
              <Button
                size="sm"
                className="rounded-xl h-9 w-9 p-0 shrink-0"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {isListening && (
              <div className="flex items-center gap-2 mt-1.5 px-1">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-0.5 bg-red-500 rounded-full animate-bounce" style={{ height: `${8 + Math.random() * 12}px`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <span className="text-xs text-red-500 font-medium">Listening... speak now</span>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground text-center mt-1.5">
              {voiceEnabled ? "🔊 Voice responses ON" : "💬 AI powered · Jobs · Interview Prep · Support"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
