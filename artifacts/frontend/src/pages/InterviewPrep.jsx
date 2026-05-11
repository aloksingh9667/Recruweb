import { useState, useRef, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import {
  Brain, Loader2, Zap, ChevronDown, ChevronUp, Target, Lightbulb,
  BookOpen, Mic, RotateCcw, CheckCircle, AlertCircle, Sparkles,
  Code2, Users, MessageSquare, Play, ArrowRight, ArrowLeft,
  ThumbsUp, ThumbsDown, Trophy, Eye, BarChart2,
  XCircle, Pen, RefreshCw, ChevronRight, Clock, Timer,
  Pause, Flame,
} from "lucide-react";

/* ═══════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════ */
const QUICK_ROLES = [
  { label: "Software Engineer", icon: "💻" },
  { label: "Product Manager", icon: "📋" },
  { label: "Data Analyst", icon: "📊" },
  { label: "UI/UX Designer", icon: "🎨" },
  { label: "Marketing Manager", icon: "📣" },
  { label: "Business Analyst", icon: "📈" },
  { label: "DevOps Engineer", icon: "⚙️" },
  { label: "Sales Executive", icon: "🤝" },
];

const TYPE_CONFIG = {
  behavioral: { label: "Behavioral", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", icon: Users },
  technical:  { label: "Technical",  color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", icon: Code2 },
  situational:{ label: "Situational",color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", icon: Target },
};

const DIFF_CONFIG = {
  easy:   { label: "Easy",   color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
  medium: { label: "Medium", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  hard:   { label: "Hard",   color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
};

/* ═══════════════════════════════════════
   SKELETON
═══════════════════════════════════════ */
function SkeletonCard({ delay = 0 }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
      style={{ animation: `pulse 1.5s ease-in-out ${delay}ms infinite` }}>
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded-full w-4/5" />
          <div className="h-4 bg-gray-100 rounded-full w-3/5" />
          <div className="flex gap-2 mt-3">
            <div className="h-5 w-20 bg-gray-100 rounded-full" />
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   BADGES
═══════════════════════════════════════ */
function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.behavioral;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
      <Icon className="w-2.5 h-2.5" />{cfg.label}
    </span>
  );
}

function DiffBadge({ difficulty }) {
  const cfg = DIFF_CONFIG[difficulty] || DIFF_CONFIG.medium;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
      {cfg.label}
    </span>
  );
}

/* ═══════════════════════════════════════
   QUESTION CARD (review mode)
═══════════════════════════════════════ */
function QuestionCard({ q, index, expanded, onToggle }) {
  const typeCfg = TYPE_CONFIG[q.type] || TYPE_CONFIG.behavioral;
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300"
      style={{
        borderColor: expanded ? typeCfg.border : "#f3f4f6",
        boxShadow: expanded ? `0 4px 24px ${typeCfg.color}15` : "0 1px 4px rgba(0,0,0,0.04)",
      }}>
      <button className="w-full text-left p-5 transition-colors duration-200"
        style={{ background: expanded ? `${typeCfg.bg}80` : "white" }}
        onClick={onToggle}>
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
            style={{ background: typeCfg.bg, color: typeCfg.color, border: `1.5px solid ${typeCfg.border}` }}>
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-snug mb-2.5">{q.question}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <TypeBadge type={q.type} />
              <DiffBadge difficulty={q.difficulty} />
            </div>
          </div>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${expanded ? "rotate-180" : ""}`}
            style={{ background: expanded ? typeCfg.color : "#f3f4f6" }}>
            <ChevronDown className="w-3.5 h-3.5" style={{ color: expanded ? "white" : "#9ca3af" }} />
          </div>
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-5 pt-1 space-y-3" style={{ borderTop: `1px solid ${typeCfg.border}40` }}>
          <div className="rounded-xl p-4" style={{ background: typeCfg.bg, border: `1px solid ${typeCfg.border}` }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: typeCfg.color }}>
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: typeCfg.color }}>Ideal Answer</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
          </div>
          {q.tip && (
            <div className="flex items-start gap-2.5 rounded-xl p-3 bg-amber-50 border border-amber-200">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed font-medium">{q.tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   COUNTDOWN RING WIDGET
═══════════════════════════════════════ */
const RADIUS = 28;
const CIRC = 2 * Math.PI * RADIUS;

function CountdownRing({ timeLeft, totalTime, paused }) {
  const pct = totalTime > 0 ? timeLeft / totalTime : 0;
  const offset = CIRC * (1 - pct);

  const color =
    pct > 0.5 ? "#10b981" :
    pct > 0.25 ? "#f59e0b" : "#ef4444";

  const urgent = pct <= 0.25 && !paused;

  return (
    <div className="relative flex items-center justify-center"
      style={{ width: 72, height: 72, animation: urgent ? "urgentPulse 0.8s ease-in-out infinite" : "none" }}>
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90 absolute inset-0">
        <circle cx="32" cy="32" r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.4s ease" }}
        />
      </svg>
      <div className="flex flex-col items-center justify-center z-10">
        <span className="text-base font-black leading-none" style={{ color }}>
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
        {paused
          ? <Pause className="w-2.5 h-2.5 mt-0.5" style={{ color }} />
          : <Clock className="w-2.5 h-2.5 mt-0.5" style={{ color }} />
        }
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   PRACTICE MODE COMPONENT
═══════════════════════════════════════ */
const TIME_OPTIONS = [
  { label: "1 min", seconds: 60 },
  { label: "2 min", seconds: 120 },
  { label: "3 min", seconds: 180 },
];

function PracticeMode({ questions, jobTitle, onExit }) {
  /* phase: "lobby" | "active" | "finished" */
  const [phase, setPhase] = useState("lobby");
  const [timedMode, setTimedMode] = useState(false);
  const [timePerQ, setTimePerQ] = useState(120);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [ratings, setRatings] = useState({});
  const [timeLeft, setTimeLeft] = useState(timePerQ);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);

  const textareaRef = useRef(null);
  const intervalRef = useRef(null);

  const q = questions[currentIdx];
  const total = questions.length;
  const answered = Object.keys(ratings).length;
  const goodCount = Object.values(ratings).filter(r => r === "good").length;
  const progress = (currentIdx / total) * 100;
  const typeCfg = TYPE_CONFIG[q?.type] || TYPE_CONFIG.behavioral;
  const isRated = ratings[currentIdx] !== undefined;

  /* ── Timer logic ── */
  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setTimeExpired(true);
          setRevealed(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [stopTimer]);

  /* Reset timer + textarea on question change */
  useEffect(() => {
    setUserAnswer("");
    setRevealed(false);
    setTimeExpired(false);
    setTimerPaused(false);
    setTimeLeft(timePerQ);
    if (textareaRef.current) textareaRef.current.focus();
    if (phase === "active" && timedMode) startTimer();
    return () => stopTimer();
  }, [currentIdx, phase]); // eslint-disable-line

  /* Pause timer when revealed */
  useEffect(() => {
    if (revealed) {
      stopTimer();
      setTimerPaused(true);
    }
  }, [revealed, stopTimer]);

  /* Cleanup on unmount */
  useEffect(() => () => stopTimer(), [stopTimer]);

  const handleReveal = () => setRevealed(true);

  const handleRate = (rating) => {
    setRatings(prev => ({ ...prev, [currentIdx]: rating }));
    setTimeout(() => {
      if (currentIdx < total - 1) setCurrentIdx(i => i + 1);
      else setPhase("finished");
    }, 350);
  };

  const handleSkip = () => {
    stopTimer();
    if (currentIdx < total - 1) setCurrentIdx(i => i + 1);
    else setPhase("finished");
  };

  const handleNext = () => {
    stopTimer();
    if (currentIdx < total - 1) setCurrentIdx(i => i + 1);
    else setPhase("finished");
  };

  const handlePrev = () => {
    stopTimer();
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
  };

  const startPractice = (timed) => {
    setTimedMode(timed);
    setCurrentIdx(0);
    setUserAnswer("");
    setRevealed(false);
    setRatings({});
    setTimeLeft(timePerQ);
    setTimeExpired(false);
    setTimerPaused(false);
    setPhase("active");
    if (timed) startTimer();
  };

  const handleRestart = () => {
    stopTimer();
    setPhase("lobby");
  };

  /* ════════════════════════════════
     LOBBY SCREEN
  ════════════════════════════════ */
  if (phase === "lobby") {
    return (
      <div className="max-w-2xl mx-auto scale-in">
        {/* Back */}
        <button onClick={onExit}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium mb-6 px-3 py-1.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Questions
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl"
            style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
            <Play className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Choose Practice Mode</h2>
          <p className="text-gray-500 text-sm">{total} questions · {jobTitle}</p>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Free Practice */}
          <button onClick={() => startPractice(false)}
            className="group text-left p-6 rounded-2xl border-2 bg-white hover:border-indigo-400 hover:shadow-xl transition-all duration-300"
            style={{ borderColor: "#e5e7eb" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <Pen className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-black text-gray-900 text-base mb-1">Free Practice</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Answer at your own pace. No time pressure — ideal for deep thinking and thorough answers.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-600">
              Start Free <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Timed Practice */}
          <div className="p-6 rounded-2xl border-2 bg-white border-orange-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)" }}>
              <Flame className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-black text-gray-900 text-base mb-1">Timed Mock Interview</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Race against the clock like a real interview. Timer auto-reveals when time's up.
            </p>

            {/* Time picker */}
            <div className="mb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Time per question</p>
              <div className="flex gap-2">
                {TIME_OPTIONS.map(opt => (
                  <button key={opt.seconds} onClick={() => setTimePerQ(opt.seconds)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all"
                    style={{
                      background: timePerQ === opt.seconds ? "linear-gradient(135deg,#f59e0b,#ef4444)" : "white",
                      borderColor: timePerQ === opt.seconds ? "transparent" : "#e5e7eb",
                      color: timePerQ === opt.seconds ? "white" : "#374151",
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => startPractice(true)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)", boxShadow: "0 4px 14px rgba(245,158,11,0.35)" }}>
              <Timer className="w-4 h-4" /> Start Timed ({TIME_OPTIONS.find(o => o.seconds === timePerQ)?.label})
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════
     RESULTS SCREEN
  ════════════════════════════════ */
  if (phase === "finished") {
    const pct = Math.round((goodCount / total) * 100);
    const grade =
      pct >= 80 ? { label: "Excellent!", color: "#10b981", icon: "🏆", msg: "You're interview-ready! Outstanding performance." } :
      pct >= 60 ? { label: "Good Job!", color: "#6366f1", icon: "⭐", msg: "Solid performance. A bit more practice and you'll nail it." } :
      pct >= 40 ? { label: "Keep Practicing", color: "#f59e0b", icon: "💪", msg: "You're on the right track. Review the answers and try again." } :
                  { label: "Needs Work", color: "#ef4444", icon: "📚", msg: "Go through the ideal answers carefully and practice again." };

    const byType = questions.reduce((acc, q, i) => {
      const r = ratings[i];
      if (!acc[q.type]) acc[q.type] = { good: 0, total: 0 };
      acc[q.type].total++;
      if (r === "good") acc[q.type].good++;
      return acc;
    }, {});

    return (
      <div className="scale-in max-w-2xl mx-auto">
        {/* Trophy banner */}
        <div className="rounded-3xl p-8 text-center mb-6 border overflow-hidden relative"
          style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)", borderColor: "rgba(139,92,246,0.3)" }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
            style={{ background: "radial-gradient(circle,#a78bfa,#7c3aed)" }} />
          <div className="relative">
            <div className="text-5xl mb-3">{grade.icon}</div>
            <h2 className="text-2xl font-black text-white mb-1">{grade.label}</h2>
            <p className="text-violet-200 text-sm max-w-xs mx-auto mb-1">{grade.msg}</p>
            {timedMode && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full bg-orange-500/30 text-orange-200 border border-orange-400/30 mt-1">
                <Timer className="w-3 h-3" /> Timed Mode · {TIME_OPTIONS.find(o => o.seconds === timePerQ)?.label}/q
              </span>
            )}
            {/* Score ring */}
            <div className="flex items-center justify-center mt-6 gap-8">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke={grade.color} strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
                    strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{pct}%</span>
                  <span className="text-[9px] text-white/60 font-medium">score</span>
                </div>
              </div>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-white/80">{goodCount} Got it right</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-white/80">{total - answered} Skipped</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-white/80">{answered - goodCount} Needs work</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown by type */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" /> Performance by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(byType).map(([type, data]) => {
              const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.behavioral;
              const Icon = cfg.icon;
              const typePct = data.total > 0 ? Math.round((data.good / data.total) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold capitalize text-gray-700">
                      <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />{type}
                      <span className="text-gray-400 font-normal">({data.total} q)</span>
                    </div>
                    <span className="text-xs font-black" style={{ color: cfg.color }}>{typePct}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${typePct}%`, background: cfg.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Missed questions review */}
        {answered - goodCount > 0 && (
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 mb-5">
            <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Review These Questions
            </h3>
            <div className="space-y-3">
              {questions.map((q, i) => {
                if (ratings[i] !== "needs_work") return null;
                const cfg = TYPE_CONFIG[q.type] || TYPE_CONFIG.behavioral;
                return (
                  <div key={i} className="p-4 rounded-xl border" style={{ background: cfg.bg, borderColor: cfg.border }}>
                    <p className="text-xs font-bold mb-1.5" style={{ color: cfg.color }}>Q{i + 1} · {q.type}</p>
                    <p className="text-sm font-semibold text-gray-800 mb-2">{q.question}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{q.answer}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleRestart}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
            <RefreshCw className="w-4 h-4" /> Practice Again
          </button>
          <button onClick={onExit}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to All Questions
          </button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════
     ACTIVE PRACTICE CARD
  ════════════════════════════════ */
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onExit}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors px-3 py-1.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200">
          <ArrowLeft className="w-3.5 h-3.5" /> Exit
        </button>
        <div className="flex items-center gap-3">
          {/* Timed mode badge */}
          {timedMode && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: "linear-gradient(135deg,#f59e0b22,#ef444422)", color: "#d97706", border: "1px solid #fde68a" }}>
              <Flame className="w-2.5 h-2.5" /> Timed
            </span>
          )}
          <span className="text-xs font-bold text-gray-500">{currentIdx + 1} / {total}</span>
          {/* Dot tracker */}
          <div className="flex gap-1">
            {questions.map((_, i) => {
              const r = ratings[i];
              const isCurrent = i === currentIdx;
              return (
                <div key={i} className="rounded-full transition-all duration-300"
                  style={{
                    width: isCurrent ? "20px" : "8px",
                    height: "8px",
                    background: r === "good" ? "#10b981" : r === "needs_work" ? "#ef4444" : isCurrent ? "#6366f1" : "#e5e7eb",
                  }} />
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
      </div>

      {/* Main question card */}
      <div key={currentIdx} className="bg-white rounded-3xl border shadow-xl overflow-hidden mb-4 scale-in"
        style={{ borderColor: typeCfg.border, boxShadow: `0 8px 40px ${typeCfg.color}18` }}>

        {/* Question zone */}
        <div className="p-6 sm:p-7" style={{ background: `linear-gradient(135deg,${typeCfg.bg},white)` }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shadow-md shrink-0"
                style={{ background: `linear-gradient(135deg,${typeCfg.color},${typeCfg.color}99)` }}>
                {currentIdx + 1}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <TypeBadge type={q.type} />
                <DiffBadge difficulty={q.difficulty} />
              </div>
            </div>

            {/* Timer ring */}
            {timedMode && (
              <div className="shrink-0">
                <CountdownRing timeLeft={timeLeft} totalTime={timePerQ} paused={timerPaused} />
              </div>
            )}
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">{q.question}</p>

          {/* Time expired notice */}
          {timeExpired && (
            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
              <Timer className="w-3.5 h-3.5" /> Time's up! See the ideal answer below.
            </div>
          )}
        </div>

        {/* Answer zone */}
        <div className="p-6 sm:p-7 space-y-4 border-t border-gray-100">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Pen className="w-3 h-3" /> Your Answer
            </label>
            <textarea
              ref={textareaRef}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all resize-none leading-relaxed"
              placeholder="Type your answer here... (use the STAR method: Situation, Task, Action, Result)"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              rows={4}
              disabled={revealed}
            />
          </div>

          {/* Reveal / Answer */}
          {!revealed ? (
            <button onClick={handleReveal}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border-2 hover:scale-[1.01]"
              style={{ borderColor: typeCfg.color, color: typeCfg.color, background: typeCfg.bg }}>
              <Eye className="w-4 h-4" /> Reveal Ideal Answer
            </button>
          ) : (
            <div className="space-y-3 scale-in">
              <div className="rounded-xl p-4 border" style={{ background: typeCfg.bg, borderColor: typeCfg.border }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: typeCfg.color }}>
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: typeCfg.color }}>Ideal Answer</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
              </div>

              {q.tip && (
                <div className="flex items-start gap-2.5 rounded-xl p-3 bg-amber-50 border border-amber-200">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">{q.tip}</p>
                </div>
              )}

              {!isRated ? (
                <div className="pt-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">How did you do?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleRate("good")}
                      className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 border-2 border-emerald-400"
                      style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "white", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}>
                      <ThumbsUp className="w-4 h-4" /> Got It!
                    </button>
                    <button onClick={() => handleRate("needs_work")}
                      className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 border-2 border-red-300"
                      style={{ background: "white", color: "#ef4444" }}>
                      <ThumbsDown className="w-4 h-4" /> Needs Work
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 py-1">
                  {ratings[currentIdx] === "good" ? (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-bold">
                      <CheckCircle className="w-4 h-4" /> Marked as Got It
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-500 bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold">
                      <XCircle className="w-4 h-4" /> Marked for Review
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nav row */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={handlePrev} disabled={currentIdx === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-white disabled:opacity-30 transition-all">
          <ArrowLeft className="w-4 h-4" /> Prev
        </button>

        <div className="flex items-center gap-1 text-xs text-gray-400">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span className="font-bold text-emerald-500">{goodCount}</span> got it ·
          <span className="font-bold text-red-400 ml-1">{Object.values(ratings).filter(r => r === "needs_work").length}</span> needs work
        </div>

        {currentIdx < total - 1 ? (
          <button onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => setPhase("finished")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}>
            Finish <Trophy className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Skip */}
      <div className="text-center mt-3">
        <button onClick={handleSkip}
          className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors underline underline-offset-2">
          Skip this question
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
export default function InterviewPrep() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [tips, setTips] = useState([]);
  const [overview, setOverview] = useState("");
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});
  const [filter, setFilter] = useState("all");
  const [activeRole, setActiveRole] = useState("");
  const [practiceMode, setPracticeMode] = useState(false);

  const generate = async () => {
    if (!jobTitle.trim()) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    setTips([]);
    setOverview("");
    setExpanded({});
    setFilter("all");
    setPracticeMode(false);
    try {
      const data = await fetchApi("/ai/interview-prep", {
        method: "POST",
        body: JSON.stringify({ jobTitle, jobDescription, count, company }),
      });
      setQuestions(data.questions || []);
      setTips(data.tips || []);
      setOverview(data.overview || "");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (role) => { setJobTitle(role); setActiveRole(role); };
  const toggleExpand = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));
  const expandAll = () => { const all = {}; filtered.forEach((_, i) => { all[i] = true; }); setExpanded(all); };
  const collapseAll = () => setExpanded({});

  const typeCounts = questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1; return acc;
  }, {});

  const filtered = filter === "all" ? questions : questions.filter(q => q.type === filter);
  const anyExpanded = Object.values(expanded).some(Boolean);
  const hasResults = questions.length > 0;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#f8faff 0%,#f0f4ff 50%,#fdf4ff 100%)" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .fade-up { animation: fadeUp .45s cubic-bezier(.34,1.56,.64,1) both; }
        .scale-in { animation: scaleIn .35s ease both; }
        .float-anim { animation: float 3s ease-in-out infinite; }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">

        {/* ══ PRACTICE MODE ══ */}
        {practiceMode && hasResults && (
          <PracticeMode
            questions={questions}
            jobTitle={jobTitle}
            onExit={() => setPracticeMode(false)}
          />
        )}

        {/* ══ NORMAL MODE ══ */}
        {!practiceMode && (
          <>
            {/* HERO */}
            <div className="text-center mb-10 fade-up">
              <div className="relative inline-block mb-5">
                <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-2xl float-anim"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7)" }}>
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                  style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)" }}>
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 text-indigo-600 bg-indigo-50 border border-indigo-100">
                <Zap className="w-3.5 h-3.5" /> Powered by Gemini AI
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 leading-tight">AI Interview Prep</h1>
              <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
                Get tailored interview questions with expert answers — then practice them one by one with self-assessment.
              </p>
              <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
                {[
                  { icon: MessageSquare, label: "Role-specific Questions", color: "#6366f1" },
                  { icon: Target, label: "Ideal Answers Included", color: "#10b981" },
                  { icon: Play, label: "Interactive Practice Mode", color: "#f59e0b" },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Icon className="w-3.5 h-3.5" style={{ color }} />{label}
                  </div>
                ))}
              </div>
            </div>

            {/* CONFIG CARD */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6 fade-up" style={{ animationDelay: "80ms" }}>
              <div className="px-6 sm:px-8 py-5 border-b border-gray-100"
                style={{ background: "linear-gradient(135deg,#6366f108,#8b5cf605)" }}>
                <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                    <Target className="w-3.5 h-3.5 text-white" />
                  </div>
                  Configure Your Prep Session
                </h2>
                <p className="text-sm text-gray-500 mt-0.5 ml-9">Personalized questions based on your target role and JD</p>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Quick roles */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Select Role</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_ROLES.map(({ label, icon }) => {
                      const sel = activeRole === label;
                      return (
                        <button key={label} onClick={() => selectRole(label)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all duration-200"
                          style={{
                            background: sel ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#f9fafb",
                            borderColor: sel ? "transparent" : "#e5e7eb",
                            color: sel ? "white" : "#374151",
                            transform: sel ? "scale(1.03)" : "scale(1)",
                            boxShadow: sel ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                          }}>
                          <span>{icon}</span>{label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title + Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Job Title <span className="text-red-400">*</span></label>
                    <input className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      placeholder="e.g. Senior Software Engineer"
                      value={jobTitle}
                      onChange={e => { setJobTitle(e.target.value); setActiveRole(""); }}
                      onKeyDown={e => e.key === "Enter" && generate()} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Company <span className="text-xs font-normal text-gray-400">(optional)</span></label>
                    <input className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      placeholder="e.g. Google, TCS, Wipro..."
                      value={company}
                      onChange={e => setCompany(e.target.value)} />
                  </div>
                </div>

                {/* JD */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Job Description
                    <span className="text-xs font-normal text-gray-400">(paste for tailored questions)</span>
                  </label>
                  <textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all resize-none leading-relaxed"
                    placeholder="Paste the job description here for highly tailored questions..."
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                    rows={4} />
                </div>

                {/* Count */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Number of Questions</label>
                  <div className="flex gap-3">
                    {[5, 10, 15].map(n => (
                      <button key={n} onClick={() => setCount(n)}
                        className="flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200"
                        style={{
                          background: count === n ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "white",
                          borderColor: count === n ? "transparent" : "#e5e7eb",
                          color: count === n ? "white" : "#374151",
                          boxShadow: count === n ? "0 4px 12px rgba(99,102,241,0.25)" : "none",
                        }}>
                        {n} Questions
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
                  </div>
                )}

                <button onClick={generate} disabled={loading || !jobTitle.trim()}
                  className="w-full py-4 rounded-xl text-sm font-black text-white transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50"
                  style={{
                    background: loading ? "linear-gradient(135deg,#818cf8,#a78bfa)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    boxShadow: loading ? "none" : "0 6px 24px rgba(99,102,241,0.4)",
                  }}>
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Generating {count} questions with Gemini AI...</>
                    : <><Zap className="w-4 h-4" />Generate {count} Interview Questions</>
                  }
                </button>
              </div>
            </div>

            {/* LOADING */}
            {loading && (
              <div className="space-y-3 fade-up">
                <div className="flex items-center gap-3 mb-4 px-1">
                  <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                  <span className="text-sm text-gray-500 font-medium">Gemini AI is crafting your personalized questions...</span>
                </div>
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} delay={i * 100} />)}
              </div>
            )}

            {/* RESULTS */}
            {!loading && hasResults && (
              <div className="space-y-5 scale-in">

                {/* Overview */}
                {overview && (
                  <div className="rounded-2xl p-5 border" style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)", borderColor: "rgba(139,92,246,0.3)" }}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(139,92,246,0.3)" }}>
                        <Brain className="w-[18px] h-[18px] text-violet-300" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-violet-300 uppercase tracking-widest mb-1">What to Expect</p>
                        <p className="text-sm text-violet-100 leading-relaxed">{overview}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Practice Mode CTA Banner */}
                <div className="rounded-2xl p-5 border overflow-hidden relative"
                  style={{ background: "linear-gradient(135deg,#065f46,#047857,#059669)", borderColor: "rgba(16,185,129,0.3)" }}>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none"
                    style={{ background: "radial-gradient(circle,#6ee7b7,#10b981)" }} />
                  <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: "rgba(255,255,255,0.15)" }}>
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-black text-white text-sm">Practice Mode Available!</p>
                        <p className="text-emerald-200 text-xs mt-0.5">Answer each question, reveal ideal answers, and rate yourself to track your readiness.</p>
                      </div>
                    </div>
                    <button onClick={() => setPracticeMode(true)}
                      className="shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:scale-[1.02]"
                      style={{ background: "white", color: "#059669" }}>
                      <Play className="w-4 h-4" /> Start Practice
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
                    <div className="text-2xl font-black text-indigo-600">{questions.length}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Total Questions</div>
                  </div>
                  {Object.entries(typeCounts).map(([type, n]) => {
                    const cfg = TYPE_CONFIG[type];
                    return (
                      <div key={type} className="bg-white rounded-2xl p-4 text-center shadow-sm border"
                        style={{ borderColor: cfg?.border || "#e5e7eb" }}>
                        <div className="text-2xl font-black" style={{ color: cfg?.color || "#6366f1" }}>{n}</div>
                        <div className="text-xs text-gray-500 mt-0.5 capitalize">{type}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Filter + controls */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex gap-2 flex-wrap">
                    {["all", "behavioral", "technical", "situational"].map(f => {
                      if (f !== "all" && !typeCounts[f]) return null;
                      const sel = filter === f;
                      const cfg = f !== "all" ? TYPE_CONFIG[f] : null;
                      return (
                        <button key={f} onClick={() => setFilter(f)}
                          className="text-xs px-3 py-1.5 rounded-xl border font-semibold capitalize transition-all duration-200"
                          style={{
                            background: sel ? (cfg ? cfg.color : "#1f2937") : "white",
                            borderColor: sel ? "transparent" : "#e5e7eb",
                            color: sel ? "white" : "#374151",
                            boxShadow: sel ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                          }}>
                          {f === "all" ? `All (${questions.length})` : `${f} (${typeCounts[f]})`}
                        </button>
                      );
                    })}
                  </div>
                  <div className="sm:ml-auto flex items-center gap-2">
                    <button onClick={anyExpanded ? collapseAll : expandAll}
                      className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium transition-all flex items-center gap-1.5">
                      {anyExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {anyExpanded ? "Collapse All" : "Expand All"}
                    </button>
                    <button onClick={generate}
                      className="text-xs px-3 py-1.5 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-medium transition-all flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5" /> Regenerate
                    </button>
                  </div>
                </div>

                {/* Question list */}
                <div className="space-y-3">
                  {filtered.map((q, i) => (
                    <div key={i} className="fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                      <QuestionCard q={q} index={i} expanded={!!expanded[i]} onToggle={() => toggleExpand(i)} />
                    </div>
                  ))}
                </div>

                {/* Tips */}
                {tips.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-black text-gray-900 text-sm flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                        <Lightbulb className="w-3.5 h-3.5 text-white" />
                      </div>
                      Pro Interview Tips
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5"
                            style={{ background: "#f59e0b", color: "white" }}>{i + 1}</div>
                          <p className="text-xs text-amber-800 leading-relaxed font-medium">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button onClick={() => setPracticeMode(true)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}>
                    <Play className="w-4 h-4" /> Start Practice Mode
                  </button>
                  <button onClick={generate}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                    <RotateCcw className="w-4 h-4" /> Generate Fresh Set
                  </button>
                  <button onClick={() => { setQuestions([]); setTips([]); setOverview(""); }}
                    className="sm:w-auto px-5 py-3 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                    <Target className="w-4 h-4" /> Change Role
                  </button>
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !hasResults && !error && (
              <div className="text-center py-16 fade-up" style={{ animationDelay: "120ms" }}>
                <div className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center mb-6"
                  style={{ background: "linear-gradient(135deg,#f0f4ff,#faf5ff)" }}>
                  <Mic className="w-12 h-12 text-indigo-200" />
                </div>
                <h3 className="text-lg font-black text-gray-700 mb-2">Ready when you are</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                  Select a role or type a job title above, then hit generate to get personalized interview questions.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {QUICK_ROLES.slice(0, 4).map(({ label, icon }) => (
                    <button key={label} onClick={() => selectRole(label)}
                      className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 font-medium transition-all shadow-sm">
                      <span>{icon}</span>{label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
