import { useState } from "react";
import { fetchApi } from "@/lib/api";
import {
  Brain, Loader2, Zap, ChevronDown, ChevronUp, Target, Lightbulb,
  BookOpen, Mic, RotateCcw, CheckCircle, AlertCircle, Sparkles,
  Clock, TrendingUp, Shield, Code2, Users, MessageSquare,
} from "lucide-react";

/* ── Constants ── */
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
  behavioral: {
    label: "Behavioral",
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
    icon: Users,
    desc: "Past experience & soft skills",
  },
  technical: {
    label: "Technical",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    icon: Code2,
    desc: "Role-specific knowledge",
  },
  situational: {
    label: "Situational",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    icon: Target,
    desc: "Hypothetical scenarios",
  },
};

const DIFF_CONFIG = {
  easy: { label: "Easy", color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
  medium: { label: "Medium", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  hard: { label: "Hard", color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
};

/* ── Skeleton loader ── */
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

/* ── Type badge ── */
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

/* ── Difficulty badge ── */
function DiffBadge({ difficulty }) {
  const cfg = DIFF_CONFIG[difficulty] || DIFF_CONFIG.medium;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
      {cfg.label}
    </span>
  );
}

/* ── Question card ── */
function QuestionCard({ q, index, expanded, onToggle }) {
  const typeCfg = TYPE_CONFIG[q.type] || TYPE_CONFIG.behavioral;
  return (
    <div
      className="bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300"
      style={{
        borderColor: expanded ? typeCfg.border : "#f3f4f6",
        boxShadow: expanded ? `0 4px 24px ${typeCfg.color}15` : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Question header */}
      <button
        className="w-full text-left p-5 transition-colors duration-200"
        style={{ background: expanded ? `${typeCfg.bg}80` : "white" }}
        onClick={onToggle}
      >
        <div className="flex items-start gap-4">
          {/* Number */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
            style={{ background: typeCfg.bg, color: typeCfg.color, border: `1.5px solid ${typeCfg.border}` }}
          >
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

      {/* Expanded answer */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 space-y-3" style={{ borderTop: `1px solid ${typeCfg.border}40` }}>
          {/* Ideal Answer */}
          <div className="rounded-xl p-4" style={{ background: typeCfg.bg, border: `1px solid ${typeCfg.border}` }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: typeCfg.color }}>
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: typeCfg.color }}>
                Ideal Answer
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
          </div>

          {/* Coaching Tip */}
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

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
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

  const generate = async () => {
    if (!jobTitle.trim()) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    setTips([]);
    setOverview("");
    setExpanded({});
    setFilter("all");
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

  const selectRole = (role) => {
    setJobTitle(role);
    setActiveRole(role);
  };

  const toggleExpand = (i) =>
    setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  const expandAll = () => {
    const all = {};
    filtered.forEach((_, i) => { all[i] = true; });
    setExpanded(all);
  };

  const collapseAll = () => setExpanded({});

  const typeCounts = questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
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
        @keyframes shimmer { from{transform:translateX(-100%)} to{transform:translateX(100%)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .fade-up { animation: fadeUp .45s cubic-bezier(.34,1.56,.64,1) both; }
        .scale-in { animation: scaleIn .35s ease both; }
        .float-anim { animation: float 3s ease-in-out infinite; }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">

        {/* ══ HERO HEADER ══ */}
        <div className="text-center mb-10 fade-up">
          {/* Icon */}
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

          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 leading-tight">
            AI Interview Prep
          </h1>
          <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
            Get tailored interview questions with expert model answers and coaching tips — customized to your exact role.
          </p>

          {/* Stats strip */}
          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            {[
              { icon: MessageSquare, label: "Role-specific Questions", color: "#6366f1" },
              { icon: Target, label: "Ideal Answers Included", color: "#10b981" },
              { icon: Lightbulb, label: "Coaching Tips Per Q", color: "#f59e0b" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <Icon className="w-3.5 h-3.5" style={{ color }} />{label}
              </div>
            ))}
          </div>
        </div>

        {/* ══ CONFIG CARD ══ */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6 fade-up" style={{ animationDelay: "80ms" }}>
          {/* Card header */}
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
            {/* Quick role chips */}
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

            {/* Job title + company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Job Title <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="e.g. Senior Software Engineer"
                  value={jobTitle}
                  onChange={e => { setJobTitle(e.target.value); setActiveRole(""); }}
                  onKeyDown={e => e.key === "Enter" && generate()}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Company Name <span className="text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="e.g. Google, TCS, Wipro..."
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                />
              </div>
            </div>

            {/* JD textarea */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Job Description
                <span className="text-xs font-normal text-gray-400">(paste for more tailored questions)</span>
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all resize-none leading-relaxed"
                placeholder="Paste the job description here to get highly tailored questions based on the exact requirements..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Question count */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Number of Questions
              </label>
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

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={generate}
              disabled={loading || !jobTitle.trim()}
              className="w-full py-4 rounded-xl text-sm font-black text-white transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50"
              style={{
                background: loading
                  ? "linear-gradient(135deg,#818cf8,#a78bfa)"
                  : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                boxShadow: loading ? "none" : "0 6px 24px rgba(99,102,241,0.4)",
                transform: loading ? "scale(0.99)" : "scale(1)",
              }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Generating {count} questions with Gemini AI...</>
              ) : (
                <><Zap className="w-4 h-4" />Generate {count} Interview Questions</>
              )}
            </button>
          </div>
        </div>

        {/* ══ LOADING SKELETONS ══ */}
        {loading && (
          <div className="space-y-3 fade-up">
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
              <span className="text-sm text-gray-500 font-medium">Gemini AI is crafting your personalized questions...</span>
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} delay={i * 100} />
            ))}
          </div>
        )}

        {/* ══ RESULTS ══ */}
        {!loading && hasResults && (
          <div className="space-y-5 scale-in">

            {/* Overview banner */}
            {overview && (
              <div className="rounded-2xl p-5 border"
                style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)", borderColor: "rgba(139,92,246,0.3)" }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(139,92,246,0.3)" }}>
                    <Brain className="w-4.5 h-4.5 text-violet-300 w-[18px] h-[18px]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-violet-300 uppercase tracking-widest mb-1">What to Expect</p>
                    <p className="text-sm text-violet-100 leading-relaxed">{overview}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
                <div className="text-2xl font-black text-indigo-600">{questions.length}</div>
                <div className="text-xs text-gray-500 mt-0.5">Total Questions</div>
              </div>
              {Object.entries(typeCounts).map(([type, n]) => {
                const cfg = TYPE_CONFIG[type];
                const Icon = cfg?.icon || Target;
                return (
                  <div key={type} className="bg-white rounded-2xl p-4 text-center shadow-sm border"
                    style={{ borderColor: cfg?.border || "#e5e7eb" }}>
                    <div className="text-2xl font-black" style={{ color: cfg?.color || "#6366f1" }}>{n}</div>
                    <div className="text-xs text-gray-500 mt-0.5 capitalize">{type}</div>
                  </div>
                );
              })}
            </div>

            {/* Filter + controls bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex gap-2 flex-wrap">
                {["all", "behavioral", "technical", "situational"].map(f => {
                  const available = f === "all" ? true : (typeCounts[f] > 0);
                  if (!available) return null;
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
                  <QuestionCard
                    q={q}
                    index={i}
                    expanded={!!expanded[i]}
                    onToggle={() => toggleExpand(i)}
                  />
                </div>
              ))}
            </div>

            {/* Interview tips */}
            {tips.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-gray-900 text-sm flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                    <Lightbulb className="w-3.5 h-3.5 text-white" />
                  </div>
                  Pro Interview Tips
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5"
                        style={{ background: "#f59e0b", color: "white" }}>
                        {i + 1}
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed font-medium">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={generate}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                <RotateCcw className="w-4 h-4" /> Generate Fresh Set
              </button>
              <button
                onClick={() => { setQuestions([]); setTips([]); setOverview(""); }}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                <Target className="w-4 h-4" /> Change Role
              </button>
            </div>
          </div>
        )}

        {/* ══ EMPTY STATE ══ */}
        {!loading && !hasResults && !error && (
          <div className="text-center py-16 fade-up" style={{ animationDelay: "120ms" }}>
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#f0f4ff,#faf5ff)" }}>
                <Mic className="w-12 h-12 text-indigo-200" />
              </div>
            </div>
            <h3 className="text-lg font-black text-gray-700 mb-2">Ready when you are</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
              Select a role or type a job title above, then hit generate to get your personalized interview questions.
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
      </div>
    </div>
  );
}
