import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Link, useLocation, useSearch } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Search, MapPin, Briefcase, IndianRupee, Clock, Bookmark,
  BookmarkCheck, SlidersHorizontal, X, ChevronDown, ChevronUp,
  Star, Building2, Users, Send, Zap, TrendingUp, Filter,
  Sparkles, CheckCircle2, XCircle, Tag, Lightbulb, ChevronRight,
} from "lucide-react";
import { formatDistanceToNow, subDays, subHours } from "date-fns";

/* ─── constants ─── */
const LOCATIONS   = ["Mumbai","Bangalore","Delhi","Hyderabad","Pune","Chennai","Kolkata","Noida","Gurgaon","Remote"];
const CATEGORIES  = ["IT/Software","Marketing","Sales","HR","Finance","Operations","Design","Data Science","Other"];
const WORK_MODES  = ["Work from home","Work from office","Hybrid"];
const EXP_OPTIONS = [
  { label:"Fresher (0-1 yr)", min:0, max:1 },
  { label:"1-3 years", min:1, max:3 },
  { label:"3-5 years", min:3, max:5 },
  { label:"5-7 years", min:5, max:7 },
  { label:"7-10 years", min:7, max:10 },
  { label:"10+ years", min:10, max:99 },
];
const SALARY_OPTIONS = [
  { label:"0-3 Lakhs", min:0, max:3 },
  { label:"3-6 Lakhs", min:3, max:6 },
  { label:"6-10 Lakhs", min:6, max:10 },
  { label:"10-15 Lakhs", min:10, max:15 },
  { label:"15-25 Lakhs", min:15, max:25 },
  { label:"25-50 Lakhs", min:25, max:50 },
  { label:"50+ Lakhs", min:50, max:999 },
];
const DATE_OPTIONS = [
  { label:"Any time", value:"any" },
  { label:"Last 24 hours", value:"1day" },
  { label:"Last 3 days", value:"3days" },
  { label:"Last week", value:"1week" },
  { label:"Last month", value:"1month" },
];
const JOB_TYPES = ["full-time","part-time","contract","internship","remote"];

const COMPANY_GRADIENTS = [
  "from-blue-500 to-indigo-600","from-violet-500 to-purple-600","from-emerald-500 to-teal-600",
  "from-orange-500 to-red-500","from-pink-500 to-rose-600","from-cyan-500 to-blue-600",
  "from-amber-500 to-orange-600","from-green-500 to-emerald-600",
];

function parseSalaryLPA(s) {
  if (!s) return null;
  const nums = s.match(/\d+(\.\d+)?/g);
  if (!nums) return null;
  const avg = nums.reduce((a,n) => a + parseFloat(n), 0) / nums.length;
  if (s.toLowerCase().includes("lpa") || s.includes("L")) return avg;
  if (avg > 1000) return avg / 100000;
  return avg;
}
function parseExpYears(s) {
  if (!s) return null;
  const n = s.match(/\d+/g);
  return n ? parseFloat(n[0]) : null;
}
function companyInitials(name) {
  if (!name) return "?";
  return name.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase();
}
function companyGradient(name) {
  if (!name) return COMPANY_GRADIENTS[0];
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) & 0xfffff;
  return COMPANY_GRADIENTS[Math.abs(h) % COMPANY_GRADIENTS.length];
}
function parseParamsToState(search) {
  const p = new URLSearchParams(search);
  const loc = p.get("location") || "";
  const cat = p.get("category") || "";
  const type = p.get("type") || "";
  const sort = p.get("sort") || "date";
  const exp = p.get("experience") || "";
  const q = p.get("search") || "";
  return {
    locations: loc ? [loc] : [],
    jobTypes: (type && type !== "Remote" && type !== "walk-in") ? [type] : [],
    categories: cat ? [cat] : [],
    workModes: type === "Remote" ? ["Work from home"] : [],
    experience: exp === "Fresher" ? ["Fresher (0-1 yr)"] : exp ? [exp] : [],
    sort, q, locationInput: loc,
  };
}

/* ─── sub-components ─── */
function CheckItem({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group select-none">
      <div onClick={onChange} className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${checked ? "bg-indigo-600 border-indigo-600 scale-110" : "border-gray-300 dark:border-gray-600 group-hover:border-indigo-400"}`}>
        {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 12 12"><path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" /></svg>}
      </div>
      <span className={`text-sm transition-colors ${checked ? "text-indigo-700 dark:text-indigo-400 font-medium" : "text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"}`}>{label}</span>
    </label>
  );
}

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-1">
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full py-2 text-left">
        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{title}</span>
        <span className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="space-y-0">{children}</div>
      </div>
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-13 h-13 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" style={{width:52,height:52}} />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/5" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-lg w-1/3" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-lg w-3/4" />
          <div className="flex gap-2">
            <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full w-20" />
            <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NaukriJobCard({ job, isSaved, onSaveToggle, onApply, hasApplied, isCandidate, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  const grad = companyGradient(job.company || job.employer?.company);
  const initials = companyInitials(job.company || job.employer?.company);
  const postedAgo = job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : "";
  const skills = job.skills?.slice(0, 4) || [];
  const jobId = job.id || job._id;

  return (
    <div
      className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        animation: `jobCardIn .4s ease both`,
        animationDelay: `${Math.min(index * 60, 400)}ms`,
        boxShadow: hovered ? "0 8px 30px rgba(99,102,241,.13), 0 2px 8px rgba(0,0,0,.06)" : "0 1px 4px rgba(0,0,0,.04)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gradient top border on hover */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${grad} transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`} />

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Company Logo */}
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${grad} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 ${hovered ? "scale-110" : "scale-100"}`}>
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <Link href={`/jobs/${jobId}`}>
                  <h3 className="font-semibold text-indigo-700 dark:text-indigo-400 text-sm sm:text-base hover:underline cursor-pointer leading-snug line-clamp-1 transition-colors group-hover:text-indigo-800 dark:group-hover:text-indigo-300">
                    {job.title}
                  </h3>
                </Link>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="font-medium">{job.company || job.employer?.company || "Company"}</span>
                  <span className="flex items-center gap-0.5 text-amber-500">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span className="text-xs text-gray-500">{(3.5 + (jobId?.charCodeAt?.(0) || 0) % 15 / 10).toFixed(1)}</span>
                  </span>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isCandidate && (
                  <button onClick={() => onSaveToggle(jobId, isSaved)} className={`p-1.5 rounded-full transition-all duration-200 ${isSaved ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 scale-110" : "text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"}`} title={isSaved ? "Saved" : "Save job"}>
                    {isSaved ? <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                )}
                {isCandidate ? (
                  hasApplied ? (
                    <span className="text-[10px] sm:text-xs px-2 sm:px-3 h-7 sm:h-8 flex items-center font-semibold text-green-700 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg gap-1">
                      ✓ Applied
                    </span>
                  ) : (
                    <Button size="sm" onClick={() => onApply(job)} className="h-7 sm:h-8 text-[10px] sm:text-xs px-2.5 sm:px-4 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 transition-all">
                      Apply
                    </Button>
                  )
                ) : (
                  <Link href={`/jobs/${jobId}`}>
                    <Button size="sm" variant="outline" className="h-7 sm:h-8 text-[10px] sm:text-xs px-2.5 sm:px-4 font-semibold rounded-lg border-indigo-300 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                      View
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 shrink-0" />{job.experienceRequired || "0-5 yrs"}</span>
              <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3 shrink-0" />{job.salaryRange || "Not disclosed"}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{job.location}</span>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {skills.map((s, i) => (
                  <span key={i} className="text-[10px] sm:text-[11px] bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full transition-all group-hover:border-indigo-200 dark:group-hover:border-indigo-800/50">
                    {s}
                  </span>
                ))}
                {(job.skills?.length || 0) > 4 && (
                  <span className="text-[10px] sm:text-[11px] text-indigo-500 px-1.5 py-0.5">+{job.skills.length - 4} more</span>
                )}
              </div>
            )}

            {/* Footer row */}
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold capitalize bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                  {job.employmentType?.replace("-"," ") || "Full time"}
                </span>
                <span className="text-[10px] sm:text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" />Actively hiring
                </span>
              </div>
              <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3" />{postedAgo}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Filter Panel (shared between desktop sidebar + mobile drawer) ─── */
function FilterPanel({ filters, setFilters, locationSearch, setLocationSearch, toggle, clearAll, activeFilterCount }) {
  const visibleLocations = LOCATIONS.filter(l => l.toLowerCase().includes(locationSearch.toLowerCase()));
  return (
    <div className="px-4 py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-sm text-gray-800 dark:text-gray-200">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">Clear all</button>
        )}
      </div>

      <div className="space-y-0 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
        <FilterSection title="Work Mode">
          {WORK_MODES.map(m => <CheckItem key={m} checked={filters.workModes.includes(m)} onChange={() => toggle("workModes", m)} label={m} />)}
        </FilterSection>
        <FilterSection title="Experience">
          {EXP_OPTIONS.map(o => <CheckItem key={o.label} checked={filters.experience.includes(o.label)} onChange={() => toggle("experience", o.label)} label={o.label} />)}
        </FilterSection>
        <FilterSection title="Salary (per annum)">
          {SALARY_OPTIONS.map(o => <CheckItem key={o.label} checked={filters.salary.includes(o.label)} onChange={() => toggle("salary", o.label)} label={o.label} />)}
        </FilterSection>
        <FilterSection title="Location">
          <div className="mb-2 flex items-center gap-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1">
            <Search className="w-3 h-3 text-gray-400" />
            <input type="text" placeholder="Search..." value={locationSearch} onChange={e => setLocationSearch(e.target.value)} className="text-xs bg-transparent outline-none flex-1 text-gray-700 dark:text-gray-300 placeholder:text-gray-400" />
          </div>
          {visibleLocations.map(l => <CheckItem key={l} checked={filters.locations.includes(l)} onChange={() => toggle("locations", l)} label={l} />)}
        </FilterSection>
        <FilterSection title="Job Type">
          {JOB_TYPES.map(t => <CheckItem key={t} checked={filters.jobTypes.includes(t)} onChange={() => toggle("jobTypes", t)} label={t.replace("-"," ").replace(/\b\w/g, c => c.toUpperCase())} />)}
        </FilterSection>
        <FilterSection title="Department" defaultOpen={false}>
          {CATEGORIES.map(c => <CheckItem key={c} checked={filters.categories.includes(c)} onChange={() => toggle("categories", c)} label={c} />)}
        </FilterSection>
        <FilterSection title="Date Posted" defaultOpen={false}>
          {DATE_OPTIONS.map(o => (
            <label key={o.value} className="flex items-center gap-2.5 py-1.5 cursor-pointer group select-none">
              <div onClick={() => setFilters(f => ({ ...f, datePosted: o.value }))} className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${filters.datePosted === o.value ? "border-indigo-600 scale-110" : "border-gray-300 dark:border-gray-600 group-hover:border-indigo-400"}`}>
                {filters.datePosted === o.value && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
              </div>
              <span className={`text-sm transition-colors ${filters.datePosted === o.value ? "text-indigo-700 dark:text-indigo-400 font-medium" : "text-gray-700 dark:text-gray-300"}`}>{o.label}</span>
            </label>
          ))}
        </FilterSection>
      </div>
    </div>
  );
}

/* ─── Resume Tips Panel ─── */
function ResumeTipsPanel({ category }) {
  const [open, setOpen] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const prevCategoryRef = useRef(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["resumeTips", category],
    queryFn: () => fetchApi("/ai/resume-tips-by-role", { method: "POST", body: JSON.stringify({ category }) }),
    enabled: !!category && !dismissed,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (prevCategoryRef.current && prevCategoryRef.current !== category) {
      setDismissed(false);
      setOpen(true);
    }
    prevCategoryRef.current = category;
  }, [category]);

  if (dismissed || !category) return null;

  const TipSkeleton = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg w-2/3" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {[1,2,3].map(i => (
          <div key={i} className="h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="mb-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 overflow-hidden shadow-sm"
      style={{ background: "linear-gradient(135deg,#eef2ff 0%,#f5f3ff 100%)" }}
    >
      <style>{`
        .dark .tips-panel { background: linear-gradient(135deg,rgba(49,46,129,0.25) 0%,rgba(76,29,149,0.18) 100%) !important; border-color: rgba(99,102,241,0.3) !important; }
        @keyframes tipsIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .tips-anim { animation: tipsIn .3s ease both; }
      `}</style>

      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-4 py-3 cursor-pointer select-none"
        style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))" }}
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-indigo-800 dark:text-indigo-300">
            AI Resume Tips
          </span>
          <span className="ml-2 text-xs text-indigo-500 dark:text-indigo-400 font-medium">
            for {category} jobs
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }}>
            GEMINI
          </span>
          <button
            onClick={e => { e.stopPropagation(); setDismissed(true); }}
            className="ml-1 p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-400 hover:text-indigo-600 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <ChevronDown className={`w-4 h-4 text-indigo-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="px-4 pb-4 pt-2 tips-anim dark:tips-panel">
          {isLoading ? (
            <TipSkeleton />
          ) : data ? (
            <div className="space-y-3">
              {/* Headline */}
              {data.headline && (
                <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 shrink-0" />{data.headline}
                </p>
              )}

              {/* Tips grid */}
              {data.tips?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {data.tips.map((tip, i) => (
                    <div key={i} className="bg-white/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40 rounded-xl p-3 flex gap-2.5">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", minWidth: 20 }}>
                        <span className="text-white text-[10px] font-black">{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug">{tip.title}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Keywords + Do/Don't */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                {/* ATS Keywords */}
                {data.keywords?.length > 0 && (
                  <div className="bg-white/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 rounded-xl p-3">
                    <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> ATS Keywords to Include
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {data.keywords.map((kw, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Do list */}
                {data.doList?.length > 0 && (
                  <div className="bg-white/60 dark:bg-indigo-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-3">
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Do This
                    </p>
                    <ul className="space-y-1">
                      {data.doList.map((item, i) => (
                        <li key={i} className="text-[11px] text-gray-600 dark:text-gray-400 flex gap-1.5">
                          <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Don't list */}
                {data.dontList?.length > 0 && (
                  <div className="bg-white/60 dark:bg-indigo-950/30 border border-red-100 dark:border-red-900/40 rounded-xl p-3">
                    <p className="text-[11px] font-bold text-red-500 dark:text-red-400 mb-2 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Avoid These
                    </p>
                    <ul className="space-y-1">
                      {data.dontList.map((item, i) => (
                        <li key={i} className="text-[11px] text-gray-600 dark:text-gray-400 flex gap-1.5">
                          <span className="text-red-400 shrink-0 mt-0.5">✗</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] text-indigo-400">
                  Powered by Gemini AI · Tips tailored for {category} roles in India
                </p>
                <a href="/candidate/resume-builder" className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                  Build my resume <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <button onClick={() => refetch()} className="text-xs text-indigo-600 hover:underline">
              Tap to load tips for {category}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function Jobs() {
  const [woLocation] = useLocation();
  const woSearch = useSearch();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isCandidate = user?.role === "candidate";
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const init = parseParamsToState(window.location.search);
  const [searchInput, setSearchInput] = useState(init.q);
  const [locationInput, setLocationInput] = useState(init.locationInput);
  const [activeSearch, setActiveSearch] = useState(init.q);
  const [filters, setFilters] = useState({ locations: init.locations, jobTypes: init.jobTypes, categories: init.categories, workModes: init.workModes, experience: init.experience, salary: [], datePosted: "any" });
  const [locationSearch, setLocationSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [applyDialogJob, setApplyDialogJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    const s = parseParamsToState(woSearch || window.location.search);
    setFilters({ locations: s.locations, jobTypes: s.jobTypes, categories: s.categories, workModes: s.workModes, experience: s.experience, salary: [], datePosted: "any" });
    setSearchInput(s.q); setActiveSearch(s.q); setLocationInput(s.locationInput);
  }, [woSearch]);

  const { data, isLoading } = useQuery({
    queryKey: ["jobs-all"],
    queryFn: () => fetchApi("/jobs?limit=100"),
    staleTime: 60000,
  });

  const { data: savedJobsRaw } = useQuery({ queryKey: ["savedJobs"], queryFn: () => fetchApi("/jobs/saved/my"), enabled: isCandidate });
  const savedJobIds = useMemo(() => {
    const list = Array.isArray(savedJobsRaw) ? savedJobsRaw : (savedJobsRaw?.jobs ?? []);
    return new Set(list.map(j => j._id || j.id));
  }, [savedJobsRaw]);

  const { data: myApplicationsRaw } = useQuery({ queryKey: ["myApplications"], queryFn: () => fetchApi("/applications/my"), enabled: isCandidate });
  const appliedJobIds = useMemo(() => {
    const apps = myApplicationsRaw?.applications ?? (Array.isArray(myApplicationsRaw) ? myApplicationsRaw : []);
    return new Set(apps.map(a => a.jobId?._id || a.jobId?.id || a.jobId));
  }, [myApplicationsRaw]);

  const saveMutation = useMutation({
    mutationFn: ({ jobId, isSaved }) => isSaved ? fetchApi(`/jobs/${jobId}/save`, { method:"DELETE" }) : fetchApi(`/jobs/${jobId}/save`, { method:"POST" }),
    onSuccess: (_, { isSaved }) => { queryClient.invalidateQueries({ queryKey:["savedJobs"] }); toast({ title: isSaved ? "Removed from saved" : "Job saved!" }); },
    onError: err => toast({ title:"Error", description:err.message, variant:"destructive" }),
  });

  const applyMutation = useMutation({
    mutationFn: ({ jobId, coverLetter }) => fetchApi("/applications", { method:"POST", body:JSON.stringify({ jobId, coverLetter }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey:["myApplications"] }); toast({ title:"Application submitted!", description:"Your application has been sent." }); setApplyDialogJob(null); setCoverLetter(""); },
    onError: err => toast({ title:"Failed", description:err.message, variant:"destructive" }),
  });

  const handleSaveToggle = useCallback((jobId, isSaved) => {
    if (!isCandidate) { toast({ title:"Login required", description:"Please log in as a candidate.", variant:"destructive" }); return; }
    saveMutation.mutate({ jobId, isSaved });
  }, [isCandidate, saveMutation, toast]);

  const handleApply = useCallback((job) => {
    if (!isCandidate) { toast({ title:"Login required", description:"Please log in as a candidate.", variant:"destructive" }); return; }
    setApplyDialogJob(job); setCoverLetter("");
  }, [isCandidate, toast]);

  const toggle = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value] }));
  }, []);

  const activeFilterCount = useMemo(() =>
    filters.locations.length + filters.jobTypes.length + filters.categories.length + filters.workModes.length + filters.experience.length + filters.salary.length + (filters.datePosted !== "any" ? 1 : 0),
  [filters]);

  const clearAll = () => setFilters({ locations:[], jobTypes:[], categories:[], workModes:[], experience:[], salary:[], datePosted:"any" });

  const filteredJobs = useMemo(() => {
    let jobs = data?.jobs || [];
    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      jobs = jobs.filter(j => j.title?.toLowerCase().includes(q) || (j.company||j.employer?.company||"").toLowerCase().includes(q) || j.description?.toLowerCase().includes(q) || j.skills?.some(s => s.toLowerCase().includes(q)));
    }
    if (filters.locations.length) jobs = jobs.filter(j => filters.locations.some(l => j.location?.toLowerCase().includes(l.toLowerCase())));
    if (filters.jobTypes.length) jobs = jobs.filter(j => filters.jobTypes.includes(j.employmentType));
    if (filters.categories.length) jobs = jobs.filter(j => filters.categories.includes(j.category));
    if (filters.workModes.length) jobs = jobs.filter(j => {
      const loc = j.location?.toLowerCase()||"", type = j.employmentType?.toLowerCase()||"";
      return filters.workModes.some(m => {
        if (m==="Work from home") return loc.includes("remote")||type==="remote";
        if (m==="Work from office") return !loc.includes("remote")&&type!=="remote";
        if (m==="Hybrid") return loc.includes("hybrid")||j.description?.toLowerCase().includes("hybrid");
        return false;
      });
    });
    if (filters.salary.length) jobs = jobs.filter(j => { const lpa = parseSalaryLPA(j.salaryRange); if (!lpa) return true; return filters.salary.some(s => { const o = SALARY_OPTIONS.find(x => x.label===s); return o && lpa>=o.min && lpa<=o.max; }); });
    if (filters.experience.length) jobs = jobs.filter(j => { const e = parseExpYears(j.experienceRequired); if (e===null) return true; return filters.experience.some(x => { const o = EXP_OPTIONS.find(y => y.label===x); return o && e>=o.min && e<=o.max; }); });
    if (filters.datePosted !== "any") {
      const now = new Date();
      const cutoff = { "1day":subHours(now,24), "3days":subDays(now,3), "1week":subDays(now,7), "1month":subDays(now,30) }[filters.datePosted];
      if (cutoff) jobs = jobs.filter(j => j.createdAt && new Date(j.createdAt) >= cutoff);
    }
    if (sortBy==="date") jobs = [...jobs].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
    else if (sortBy==="salary") jobs = [...jobs].sort((a,b) => (parseSalaryLPA(b.salaryRange)||0)-(parseSalaryLPA(a.salaryRange)||0));
    return jobs;
  }, [data, activeSearch, filters, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 dark:from-gray-950 dark:via-indigo-950/10 dark:to-gray-950">
      <style>{`
        @keyframes jobCardIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes searchBarIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes drawerIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .search-bar-anim { animation: searchBarIn .4s ease both; }
        .filter-drawer { animation: drawerIn .28s cubic-bezier(.4,0,.2,1) both; }
        .overlay-fade { animation: fadeIn .2s ease both; }
      `}</style>

      {/* Apply Dialog */}
      <Dialog open={!!applyDialogJob} onOpenChange={open => { if (!open) setApplyDialogJob(null); }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Send className="w-5 h-5 text-indigo-600" />Apply for {applyDialogJob?.title}</DialogTitle>
            <DialogDescription>{applyDialogJob?.company||applyDialogJob?.employer?.company} · {applyDialogJob?.location}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium block mb-1.5">Cover Letter <span className="text-muted-foreground font-normal">(optional)</span></label>
              <Textarea placeholder="Tell us why you're a great fit..." value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={5} className="resize-none" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setApplyDialogJob(null)}>Cancel</Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={() => applyMutation.mutate({ jobId: applyDialogJob.id||applyDialogJob._id, coverLetter })} disabled={applyMutation.isPending}>
                <Send className="w-4 h-4" />{applyMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 overlay-fade lg:hidden" onClick={() => setMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-y-auto filter-drawer lg:hidden">
            <div className="flex items-center justify-between px-4 pt-5 pb-3 border-b dark:border-gray-800">
              <span className="font-bold text-base">Filters</span>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5" /></button>
            </div>
            <FilterPanel filters={filters} setFilters={setFilters} locationSearch={locationSearch} setLocationSearch={setLocationSearch} toggle={toggle} clearAll={clearAll} activeFilterCount={activeFilterCount} />
            <div className="p-4 border-t dark:border-gray-800">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setMobileFilterOpen(false)}>
                View {filteredJobs.length} Jobs
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ── Sticky search bar ── */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/80 dark:border-gray-800 sticky top-[56px] z-20 search-bar-anim">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3">
          <form onSubmit={e => { e.preventDefault(); setActiveSearch(searchInput); }} className="flex gap-2">
            {/* Search input */}
            <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/40 transition-all duration-200">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input type="text" placeholder="Skills, designation, company..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 text-gray-900 dark:text-gray-100 min-w-0" />
              {searchInput && <button type="button" onClick={() => { setSearchInput(""); setActiveSearch(""); }}><X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" /></button>}
            </div>

            {/* Location input — hidden on very small screens */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 min-w-[150px] focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/40 transition-all duration-200">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <input type="text" placeholder="Location" value={locationInput} onChange={e => setLocationInput(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 text-gray-900 dark:text-gray-100 min-w-0" />
            </div>

            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 rounded-xl font-semibold shadow-sm hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 transition-all shrink-0">
              <Search className="w-4 h-4 sm:mr-1.5" /><span className="hidden sm:inline">Search</span>
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-5">
        <div className="flex gap-5">

          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-56 xl:w-60 shrink-0 self-start sticky top-[120px]">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
              <FilterPanel filters={filters} setFilters={setFilters} locationSearch={locationSearch} setLocationSearch={setLocationSearch} toggle={toggle} clearAll={clearAll} activeFilterCount={activeFilterCount} />
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Mobile filter button */}
                <button onClick={() => setMobileFilterOpen(true)} className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-all bg-white dark:bg-gray-900 shadow-sm">
                  <Filter className="w-4 h-4" />Filters
                  {activeFilterCount > 0 && <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
                </button>

                <div>
                  {isLoading ? (
                    <span className="text-sm text-gray-400">Searching...</span>
                  ) : (
                    <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredJobs.length}</span>
                      {" "}job{filteredJobs.length !== 1 ? "s" : ""} found
                      {activeSearch && <span className="text-gray-500 font-normal text-sm"> for "<em>{activeSearch}</em>"</span>}
                    </h2>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-500 hidden sm:block">Sort by:</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-2 py-1.5 outline-none text-gray-700 dark:text-gray-300 cursor-pointer">
                  <option value="date">Newest</option>
                  <option value="salary">Salary</option>
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[...filters.locations.map(l=>({key:"locations",val:l})), ...filters.jobTypes.map(t=>({key:"jobTypes",val:t})), ...filters.categories.map(c=>({key:"categories",val:c})), ...filters.salary.map(s=>({key:"salary",val:s})), ...filters.experience.map(e=>({key:"experience",val:e})), ...filters.workModes.map(m=>({key:"workModes",val:m}))].map(({key,val}) => (
                  <span key={`${key}-${val}`} className="flex items-center gap-1 text-[11px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-full px-2.5 py-1 font-medium">
                    {val} <X className="w-3 h-3 cursor-pointer ml-0.5 hover:text-indigo-900" onClick={() => toggle(key, val)} />
                  </span>
                ))}
              </div>
            )}

            {/* Resume Tips Panel — shown when a category is selected */}
            {filters.categories.length > 0 && (
              <ResumeTipsPanel category={filters.categories[0]} />
            )}

            {/* Job list */}
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <JobCardSkeleton key={i} />)}
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="space-y-3">
                {filteredJobs.map((job, i) => (
                  <NaukriJobCard
                    key={job.id || job._id}
                    job={job}
                    index={i}
                    isSaved={savedJobIds.has(job.id || job._id)}
                    onSaveToggle={handleSaveToggle}
                    onApply={handleApply}
                    hasApplied={appliedJobIds.has(job.id || job._id)}
                    isCandidate={isCandidate}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl py-16 sm:py-24 text-center px-4" style={{ animation:"jobCardIn .4s ease both" }}>
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">No jobs found</h3>
                <p className="text-sm text-gray-500 mt-1 mb-5">Try adjusting your filters or search terms</p>
                <Button variant="outline" size="sm" onClick={() => { clearAll(); setSearchInput(""); setActiveSearch(""); }} className="border-indigo-300 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all font-semibold">
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
