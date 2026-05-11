import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  Briefcase, Bookmark, BookmarkCheck, MapPin, IndianRupee,
  Clock, Building2, ExternalLink, Trash2, Send, Star,
  CheckCircle2, AlertCircle, Eye, LayoutDashboard, TrendingUp,
  Sparkles, Target, ChevronDown, ChevronUp, Info, Wand2,
} from "lucide-react";

/* ── Status config ── */
const STATUS = {
  pending:     { label: "Pending",     bg: "bg-gray-100 dark:bg-gray-800",         text: "text-gray-700 dark:text-gray-300",   dot: "bg-gray-400"   },
  reviewed:    { label: "Reviewed",    bg: "bg-blue-50 dark:bg-blue-900/30",        text: "text-blue-700 dark:text-blue-300",   dot: "bg-blue-500"   },
  shortlisted: { label: "Shortlisted", bg: "bg-amber-50 dark:bg-amber-900/30",      text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500"  },
  rejected:    { label: "Rejected",    bg: "bg-red-50 dark:bg-red-900/30",          text: "text-red-700 dark:text-red-300",     dot: "bg-red-500"    },
  hired:       { label: "Hired 🎉",    bg: "bg-green-50 dark:bg-green-900/30",      text: "text-green-700 dark:text-green-300", dot: "bg-green-500"  },
};

function StatusBadge({ status }) {
  const cfg = STATUS[status] || STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ── Company gradient helper (matches Jobs page) ── */
const GRADS = [
  "from-violet-500 to-purple-600","from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600","from-orange-500 to-amber-600",
  "from-pink-500 to-rose-600","from-indigo-500 to-blue-600",
];
function companyGrad(name="") { return GRADS[name.charCodeAt(0) % GRADS.length]; }
function companyInitials(name="") { return name.split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase() || "CO"; }

/* ── Skeleton ── */
function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex gap-4">
      <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
      </div>
      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
    </div>
  );
}

/* ── Application Card ── */
function AppCard({ app }) {
  const jobId = app.jobId?._id || app.jobId?.id || app.jobId;
  const title   = app.job?.title || app.jobId?.title || "Unknown Job";
  const company = app.job?.employer?.company || app.jobId?.employer?.company || app.job?.company || "Company";
  const location = app.job?.location || app.jobId?.location || "";
  const salary   = app.job?.salaryRange || app.jobId?.salaryRange || "";
  const grad = companyGrad(company);

  return (
    <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-5 flex gap-4 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200">
      {/* Logo */}
      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${grad} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}>
        {companyInitials(company)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <Link href={`/jobs/${jobId}`}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-sm sm:text-base leading-snug line-clamp-1">
                {title}
              </h3>
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">{company}</span>
            </p>
          </div>
          <StatusBadge status={app.status} />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">
          {location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{location}</span>}
          {salary && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{salary}</span>}
          {app.createdAt && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
            </span>
          )}
        </div>

        {app.coverLetter && (
          <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500 line-clamp-1 italic">
            "{app.coverLetter}"
          </p>
        )}
      </div>

      <Link href={`/jobs/${jobId}`} className="shrink-0 self-start mt-0.5 p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" title="View job">
        <ExternalLink className="w-4 h-4" />
      </Link>
    </div>
  );
}

/* ── Match Score Ring (SVG arc) ── */
function ScoreRing({ score }) {
  const r = 26, circ = 2 * Math.PI * r;
  const fill = circ - (score / 100) * circ;
  const color = score >= 70 ? "#16a34a" : score >= 40 ? "#d97706" : "#dc2626";
  const bg    = score >= 70 ? "#dcfce7" : score >= 40 ? "#fef3c7" : "#fee2e2";
  const label = score >= 70 ? "Strong" : score >= 40 ? "Moderate" : "Weak";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={fill}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <span className="text-lg font-black -mt-12" style={{ color }}>{score}</span>
      <span className="text-[10px] font-bold mt-5 px-2 py-0.5 rounded-full" style={{ color, background: bg }}>{label}</span>
    </div>
  );
}

/* ── Match Score Panel (on-demand, cached 30 min) ── */
function MatchScorePanel({ jobId }) {
  const [open, setOpen] = useState(false);

  const { data, isFetching, isError, refetch, isFetched } = useQuery({
    queryKey: ["matchScore", jobId],
    queryFn: () => fetchApi("/ai/match-score", {
      method: "POST",
      body: JSON.stringify({ jobId }),
    }),
    enabled: false,          // only fires when refetch() is called
    staleTime: 30 * 60 * 1000, // cache 30 min client-side
    retry: 1,
  });

  const handleCheck = () => {
    if (!isFetched) refetch();
    setOpen(true);
  };

  return (
    <div className="mt-3">
      {/* Trigger button */}
      {!open && (
        <button
          onClick={handleCheck}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
        >
          {isFetching ? (
            <span className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Target className="w-3 h-3" />
          )}
          {isFetching ? "Analysing…" : "Check Match"}
          <Sparkles className="w-3 h-3" />
        </button>
      )}

      {/* Result panel */}
      {open && (
        <div className="mt-2 rounded-xl border border-violet-200 dark:border-violet-800/60 overflow-hidden"
          style={{ background: "linear-gradient(135deg,#f5f3ff 0%,#ede9fe 100%)" }}>

          {/* Header row */}
          <div className="flex items-center justify-between px-3 py-2 cursor-pointer select-none"
            onClick={() => setOpen(false)}
            style={{ background: "rgba(139,92,246,0.07)" }}>
            <span className="text-xs font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> AI Match Score
              {data?.cached && (
                <span className="text-[9px] font-medium text-violet-400 border border-violet-200 rounded-full px-1.5 py-px">cached</span>
              )}
            </span>
            <ChevronUp className="w-3.5 h-3.5 text-violet-400" />
          </div>

          {isFetching ? (
            <div className="px-4 py-6 flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
              <p className="text-xs text-violet-500">Gemini is analysing your profile…</p>
            </div>
          ) : isError ? (
            <div className="px-4 py-3 flex items-center gap-2 text-xs text-red-500">
              <AlertCircle className="w-4 h-4" />
              Could not fetch score. Try again shortly.
              <button onClick={() => refetch()} className="underline font-semibold">Retry</button>
            </div>
          ) : data ? (
            <div className="p-3 flex gap-3 flex-wrap sm:flex-nowrap">
              {/* Score ring */}
              <div className="shrink-0 flex flex-col items-center justify-center min-w-[72px]">
                <ScoreRing score={data.score} />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Verdict */}
                {data.verdict && (
                  <p className="text-[11px] font-semibold text-violet-800 dark:text-violet-300 italic">
                    "{data.verdict}"
                  </p>
                )}
                {/* Strengths */}
                {data.strengths?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Strengths</p>
                    <div className="flex flex-wrap gap-1">
                      {data.strengths.map((s, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Gaps */}
                {data.gaps?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Gaps to bridge</p>
                    <div className="flex flex-wrap gap-1">
                      {data.gaps.map((g, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40">
                          ✗ {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Tip */}
                <p className="text-[9px] text-violet-400 flex items-center gap-1 pt-0.5">
                  <Info className="w-2.5 h-2.5 shrink-0" />
                  Based on your profile · Update profile for better accuracy · Cached 30 min
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Re-open collapsed panel */}
      {!open && isFetched && data && (
        <button onClick={() => setOpen(true)}
          className="mt-1 text-[10px] text-violet-500 hover:underline flex items-center gap-1">
          <ChevronDown className="w-3 h-3" /> Show match result
        </button>
      )}
    </div>
  );
}

/* ── Saved Job Card ── */
function SavedCard({ job, onUnsave, onApply, hasApplied }) {
  const jobId = job._id || job.id;
  const company = job.company || job.employer?.company || "Company";
  const grad = companyGrad(company);

  return (
    <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-5 flex gap-4 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200">
      {/* Logo */}
      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${grad} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}>
        {companyInitials(company)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <Link href={`/jobs/${jobId}`}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-sm sm:text-base leading-snug line-clamp-1">
                {job.title}
              </h3>
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">{company}</span>
              {job.companyRating && (
                <span className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span className="text-[11px] text-gray-500">{job.companyRating}</span>
                </span>
              )}
            </p>
          </div>

          {/* Unsave button */}
          <button
            onClick={() => onUnsave(jobId)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
            title="Remove from saved"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">
          {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
          {job.salaryRange && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{job.salaryRange}</span>}
          {job.experienceRequired && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.experienceRequired}</span>}
          {job.createdAt && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {job.skills.slice(0, 4).map((s, i) => (
              <span key={i} className="text-[10px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-[10px] text-indigo-500 px-1 py-0.5">+{job.skills.length - 4} more</span>
            )}
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-2 mt-3">
          {hasApplied ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> Applied
            </span>
          ) : (
            <button
              onClick={() => onApply(job)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
            >
              <Send className="w-3 h-3" /> Apply now
            </button>
          )}
          <Link href={`/jobs/${jobId}`}>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <Eye className="w-3 h-3" /> View
            </button>
          </Link>
        </div>

        {/* Match Score Panel */}
        <MatchScorePanel jobId={jobId} />
      </div>
    </div>
  );
}

/* ── Stats row ── */
function StatsRow({ applications, savedCount }) {
  const counts = { pending:0, reviewed:0, shortlisted:0, hired:0, rejected:0 };
  applications.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: "Total Applied",  val: applications.length, icon: Send,         color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
        { label: "Shortlisted",    val: counts.shortlisted,  icon: TrendingUp,   color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-900/20"  },
        { label: "Hired",          val: counts.hired,         icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50 dark:bg-green-900/20"  },
        { label: "Saved Jobs",     val: savedCount,           icon: Bookmark,     color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20"},
      ].map(({ label, val, icon: Icon, color, bg }) => (
        <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
          <div className={`${color}`}><Icon className="w-5 h-5" /></div>
          <div>
            <p className={`text-2xl font-black ${color}`}>{val}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Shared Apply Dialog with AI Cover Letter ── */
function ApplyDialog({ job, coverLetter, setCoverLetter, onClose, onSubmit, isPending }) {
  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();
  const jobId = job._id || job.id;
  const company = job.company || job.employer?.company || "Company";

  const generateCoverLetter = async () => {
    setAiLoading(true);
    try {
      const res = await fetchApi("/ai/cover-letter", {
        method: "POST",
        body: JSON.stringify({ jobId }),
      });
      setCoverLetter(res.coverLetter || "");
      toast({ title: "Cover letter generated ✓", description: "Feel free to edit before submitting." });
    } catch (err) {
      toast({ title: "AI error", description: err.message || "Could not generate. Try again.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${companyGrad(company)} text-white font-bold text-sm flex items-center justify-center shrink-0`}>
            {companyInitials(company)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-snug">{job.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{company} · {job.location}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">✕</button>
        </div>

        {/* Cover Letter Label + AI button */}
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <button
            type="button"
            onClick={generateCoverLetter}
            disabled={aiLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/50 disabled:opacity-60 transition-colors"
          >
            {aiLoading
              ? <span className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              : <Wand2 className="w-3 h-3" />
            }
            {aiLoading ? "Generating…" : "Write with AI"}
            {!aiLoading && <Sparkles className="w-3 h-3" />}
          </button>
        </div>

        <textarea
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-4 py-3 outline-none focus:border-indigo-400 transition-colors resize-none"
          rows={5}
          placeholder="Briefly explain why you're a great fit for this role…"
          value={coverLetter}
          onChange={e => setCoverLetter(e.target.value)}
        />
        {aiLoading && (
          <p className="text-[11px] text-violet-500 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Gemini is writing your cover letter…
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
          >
            {isPending
              ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              : <><Send className="w-4 h-4" /> Submit Application</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN ── */
export default function CandidateDashboard() {
  const [tab, setTab] = useState("applications");
  const [applyDialogJob, setApplyDialogJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /* Queries */
  const { data: rawApps, isLoading: appsLoading } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => fetchApi("/applications/my"),
  });
  const applications = Array.isArray(rawApps)
    ? rawApps
    : (rawApps?.applications ?? rawApps?.data ?? []);

  const { data: savedJobsRaw, isLoading: savedLoading } = useQuery({
    queryKey: ["savedJobs"],
    queryFn: () => fetchApi("/jobs/saved/my"),
  });
  const savedJobs = Array.isArray(savedJobsRaw)
    ? savedJobsRaw
    : (savedJobsRaw?.jobs ?? []);

  const appliedIds = new Set(
    applications.map(a => a.jobId?._id || a.jobId?.id || a.jobId)
  );

  /* Mutations */
  const unsaveMutation = useMutation({
    mutationFn: (jobId) => fetchApi(`/jobs/${jobId}/save`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
      toast({ title: "Removed from saved" });
    },
    onError: err => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const applyMutation = useMutation({
    mutationFn: ({ jobId, coverLetter }) =>
      fetchApi("/applications", { method: "POST", body: JSON.stringify({ jobId, coverLetter }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
      toast({ title: "Application submitted!", description: "Your application has been sent." });
      setApplyDialogJob(null);
      setCoverLetter("");
    },
    onError: err => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const tabs = [
    { id: "applications", label: "My Applications", icon: Briefcase, count: applications.length },
    { id: "saved",        label: "Saved Jobs",       icon: Bookmark,  count: savedJobs.length  },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 dark:from-gray-950 dark:via-indigo-950/10 dark:to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">My Dashboard</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Track your applications and saved jobs</p>
          </div>
          <Link href="/jobs" className="ml-auto text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            Browse jobs <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Stats */}
        {!appsLoading && !savedLoading && (
          <StatsRow applications={applications} savedCount={savedJobs.length} />
        )}

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl mb-5 w-fit">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                tab === id
                  ? "bg-white dark:bg-gray-900 text-indigo-700 dark:text-indigo-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                tab === id
                  ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500"
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Applications tab ── */}
        {tab === "applications" && (
          <div>
            {appsLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl">
                <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-3">No applications yet</p>
                <Link href="/jobs" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  <Briefcase className="w-4 h-4" /> Find jobs to apply
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <AppCard key={app.id || app._id} app={app} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Saved Jobs tab ── */}
        {tab === "saved" && (
          <div>
            {savedLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
            ) : savedJobs.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl">
                <BookmarkCheck className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">No saved jobs yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Click the bookmark icon on any job to save it here</p>
                <Link href="/jobs" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  <Briefcase className="w-4 h-4" /> Browse jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedJobs.map(job => (
                  <SavedCard
                    key={job._id || job.id}
                    job={job}
                    hasApplied={appliedIds.has(job._id || job.id)}
                    onUnsave={(id) => unsaveMutation.mutate(id)}
                    onApply={(job) => { setApplyDialogJob(job); setCoverLetter(""); }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Quick Apply Dialog ── */}
      {applyDialogJob && (
        <ApplyDialog
          job={applyDialogJob}
          coverLetter={coverLetter}
          setCoverLetter={setCoverLetter}
          onClose={() => setApplyDialogJob(null)}
          onSubmit={() => applyMutation.mutate({ jobId: applyDialogJob._id || applyDialogJob.id, coverLetter })}
          isPending={applyMutation.isPending}
        />
      )}
    </div>
  );
}
