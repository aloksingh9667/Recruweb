import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import {
  Search, MapPin, ChevronDown, Briefcase, Building2, ChevronRight,
  Star, Users, TrendingUp, Code, BarChart2, Megaphone,
  GraduationCap, Palette, Wrench, ShieldCheck,
  ArrowRight, Clock, Zap, Award, CheckCircle,
  IndianRupee, Quote,
} from "lucide-react";

const EXPERIENCE_OPTIONS = [
  "Select experience", "Fresher", "1 year", "2 years", "3 years",
  "4 years", "5 years", "6 years", "7 years", "8 years", "9 years", "10+ years",
];

const QUICK_FILTERS = ["Remote", "MNC", "Fresher", "Analytics", "HR", "Finance", "Sales", "IT", "Data Science"];

const TOP_COMPANIES = [
  { name: "HCLTech", abbr: "HCL", color: "#16a34a" },
  { name: "Cognizant", abbr: "CTS", color: "#2563eb" },
  { name: "TCS", abbr: "TCS", color: "#1e40af" },
  { name: "Infosys", abbr: "INF", color: "#4338ca" },
  { name: "Wipro", abbr: "WIP", color: "#0891b2" },
  { name: "Accenture", abbr: "ACC", color: "#7c3aed" },
  { name: "IBM", abbr: "IBM", color: "#1e3a8a" },
  { name: "Capgemini", abbr: "CAP", color: "#0d9488" },
  { name: "Tech M", abbr: "TM", color: "#dc2626" },
  { name: "Mphasis", abbr: "MPH", color: "#7c3aed" },
  { name: "LTI", abbr: "LTI", color: "#ea580c" },
  { name: "Hexaware", abbr: "HEX", color: "#db2777" },
];

const POPULAR_ROLES = [
  { title: "Full Stack Developer", count: "15.2k", icon: Code, color: "#6366f1" },
  { title: "Front End Developer", count: "12.1k", icon: Palette, color: "#8b5cf6" },
  { title: "Data Scientist", count: "11.3k", icon: BarChart2, color: "#3b82f6" },
  { title: "Mobile / App Dev", count: "8.4k", icon: Briefcase, color: "#06b6d4" },
  { title: "DevOps Engineer", count: "6.8k", icon: Wrench, color: "#10b981" },
  { title: "Product Manager", count: "5.6k", icon: ShieldCheck, color: "#f59e0b" },
  { title: "Technical Lead", count: "9.7k", icon: TrendingUp, color: "#ef4444" },
  { title: "Engineering Manager", count: "3.2k", icon: Users, color: "#ec4899" },
];

const INTERVIEW_COMPANIES = [
  { name: "Cognizant", q: "2.1k" }, { name: "Accenture", q: "3.4k" },
  { name: "Wipro", q: "1.9k" }, { name: "IBM", q: "2.7k" },
  { name: "TCS", q: "4.2k" }, { name: "Flipkart", q: "1.3k" },
];

const INTERVIEW_ROLES = [
  { role: "Software Engineer", q: "12.4k" }, { role: "Business Analyst", q: "8.2k" },
  { role: "Data Scientist", q: "7.3k" }, { role: "Sales & Marketing", q: "5.1k" },
  { role: "Quality Analyst", q: "3.8k" }, { role: "Business Dev Exec.", q: "4.6k" },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Software Engineer at TCS",
    location: "Bangalore",
    avatar: "PS",
    color: "#6366f1",
    rating: 5,
    text: "Recruweb's AI assistant helped me tailor my resume perfectly. Got 3 interview calls within a week! The job matching feature is spot on.",
  },
  {
    name: "Rahul Verma",
    role: "Data Analyst at Infosys",
    location: "Hyderabad",
    avatar: "RV",
    color: "#8b5cf6",
    rating: 5,
    text: "Found my dream job in just 2 weeks. The interview prep section with company-specific questions gave me the confidence I needed.",
  },
  {
    name: "Ananya Patel",
    role: "Product Manager at Flipkart",
    location: "Mumbai",
    avatar: "AP",
    color: "#06b6d4",
    rating: 5,
    text: "The Resume Analyzer feature is incredible — it gave me actionable tips to beat ATS filters. Highly recommend Recruweb to every job seeker!",
  },
  {
    name: "Karan Singh",
    role: "DevOps Engineer at HCL",
    location: "Noida",
    avatar: "KS",
    color: "#10b981",
    rating: 5,
    text: "Recruweb's walk-in job alerts saved me so much time. The platform is super clean and easy to use. Found a job 40% above my previous salary!",
  },
];

const PREMIUM_SERVICES = [
  { icon: "✍️", title: "Resume Writing", desc: "ATS-optimized resume by experts", color: "#6366f1" },
  { icon: "🎯", title: "Resume Marketing", desc: "Get noticed by top recruiters", color: "#8b5cf6" },
  { icon: "⚡", title: "Priority Applicant", desc: "Be seen first by employers", color: "#3b82f6" },
];

function useCountUp(target, duration = 2000, startOnMount = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!startOnMount) return;
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration, startOnMount]);
  return count;
}

function StatCard({ icon: Icon, value, suffix, label, color }) {
  const num = useCountUp(value, 1800);
  return (
    <div className="flex flex-col items-center text-center px-3 py-4 sm:p-5">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-2 sm:mb-3" style={{ background: `${color}18` }}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} />
      </div>
      <div className="text-xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{num.toLocaleString()}{suffix}</div>
      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">{label}</div>
    </div>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [experience, setExperience] = useState("Select experience");
  const [locationQuery, setLocationQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: stats } = useQuery({
    queryKey: ["jobStats"],
    queryFn: () => fetchApi("/jobs/stats/summary"),
  });

  const { data: liveJobsData } = useQuery({
    queryKey: ["liveJobs"],
    queryFn: () => fetchApi("/jobs?limit=8"),
  });
  const liveJobs = liveJobsData?.jobs ?? [];

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery);
    if (locationQuery.trim()) params.set("location", locationQuery);
    if (experience !== "Select experience") params.set("experience", experience);
    setLocation(`/jobs?${params.toString()}`);
  };

  const totalJobs = stats?.totalJobs ?? 15;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes floatSlow { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(5deg)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmerBg { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes scrollLeft {
          0%{transform:translateX(0)}
          100%{transform:translateX(-50%)}
        }
        .anim-fadeup { animation: fadeSlideUp .65s ease both; }
        .anim-fadeup-1 { animation: fadeSlideUp .65s .1s ease both; }
        .anim-fadeup-2 { animation: fadeSlideUp .65s .2s ease both; }
        .anim-fadeup-3 { animation: fadeSlideUp .65s .35s ease both; }
        .float-slow { animation: float 5s ease-in-out infinite; }
        .float-medium { animation: float 4s ease-in-out infinite .8s; }
        .float-fast { animation: floatSlow 3.5s ease-in-out infinite 1.5s; }
        .scroll-left { animation: scrollLeft 28s linear infinite; }
        .scroll-left:hover { animation-play-state: paused; }
        .card-hover { transition: transform .22s ease, box-shadow .22s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,.1); }
      `}</style>

      {/* ══════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        minHeight: 540,
      }}>
        {/* Animated background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="float-slow absolute top-10 left-[8%] w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle,#818cf8,transparent 70%)" }} />
          <div className="float-medium absolute bottom-8 right-[10%] w-80 h-80 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle,#a78bfa,transparent 70%)" }} />
          <div className="float-fast absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
            style={{ background: "radial-gradient(circle,#c4b5fd,transparent 60%)" }} />

          {/* Floating cards decoration */}
          <div className="float-slow hidden lg:flex absolute top-12 right-[5%] flex-col gap-2 opacity-60">
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3 w-52">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-green-500/80 flex items-center justify-center text-white text-xs font-bold">GI</div>
                <div>
                  <div className="text-white text-xs font-semibold">Machine Learning Eng.</div>
                  <div className="text-white/50 text-[10px]">Google India · Hyderabad</div>
                </div>
              </div>
              <div className="text-green-300 text-[10px] font-medium">₹30-50 LPA · Just now</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3 w-52">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-blue-500/80 flex items-center justify-center text-white text-xs font-bold">CG</div>
                <div>
                  <div className="text-white text-xs font-semibold">Software Engineer (Java)</div>
                  <div className="text-white/50 text-[10px]">Cognizant · Chennai</div>
                </div>
              </div>
              <div className="text-green-300 text-[10px] font-medium">₹8-15 LPA · 2h ago</div>
            </div>
          </div>

          <div className="float-medium hidden lg:flex absolute bottom-16 left-[4%] flex-col gap-2 opacity-60">
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3 w-48">
              <div className="text-white/70 text-[10px] mb-1">✅ New match found</div>
              <div className="text-white text-xs font-semibold">React Developer</div>
              <div className="text-white/50 text-[10px]">92% match score</div>
            </div>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-10 pb-12 sm:pt-16 sm:pb-20 text-center">
          <div className="anim-fadeup inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-medium px-4 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            {totalJobs}+ Live jobs available right now
          </div>

          <h1 className="anim-fadeup-1 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-3 sm:mb-4">
            Find Your{" "}
            <span style={{ background: "linear-gradient(90deg,#a78bfa,#818cf8,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Dream Job
            </span>
            <br />in India
          </h1>

          <p className="anim-fadeup-2 text-white/60 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-xl mx-auto px-2">
            Connect with top employers — MNCs, startups, and everything in between. Your next career move starts here.
          </p>

          {/* Search Bar — mobile: stacked, desktop: row */}
          <form onSubmit={handleSearch} className="anim-fadeup-3 max-w-3xl mx-auto">
            {/* Mobile layout: card-style stacked fields */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Skills field */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <Search className="w-4 h-4 text-indigo-400 shrink-0" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Skills, designation, company…"
                  className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white placeholder:text-gray-400 outline-none min-w-0"
                />
                {searchQuery && <button type="button" onClick={() => setSearchQuery("")} className="text-gray-300 hover:text-gray-500 text-lg leading-none shrink-0">×</button>}
              </div>

              {/* Experience + Location in a 2-col row on mobile */}
              <div className="flex border-b border-gray-100 dark:border-gray-700">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 border-r border-gray-100 dark:border-gray-700 min-w-0">
                  <div className="relative flex-1 min-w-0">
                    <select
                      value={experience}
                      onChange={e => setExperience(e.target.value)}
                      className="w-full bg-transparent text-sm text-gray-700 dark:text-white outline-none appearance-none cursor-pointer pr-4 truncate"
                    >
                      {EXPERIENCE_OPTIONS.map(opt => (
                        <option key={opt} value={opt} className="bg-white dark:bg-gray-800">{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2 px-4 py-3 min-w-0">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    value={locationQuery}
                    onChange={e => setLocationQuery(e.target.value)}
                    placeholder="Location"
                    className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white placeholder:text-gray-400 outline-none min-w-0"
                  />
                </div>
              </div>

              {/* Search button — full width on mobile, inline on md */}
              <button
                type="submit"
                className="w-full font-bold text-sm py-3.5 transition-all text-white"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
              >
                Search Jobs
              </button>
            </div>
          </form>

          {/* Quick filters */}
          <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {QUICK_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setLocation(`/jobs?search=${encodeURIComponent(f)}`)}
                className="text-[11px] sm:text-xs px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-white/20 text-white/70 hover:bg-white/15 hover:text-white hover:border-white/40 transition-all"
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 dark:divide-gray-800">
            <StatCard icon={Briefcase}  value={totalJobs}  suffix="+"  label="Live Jobs"        color="#6366f1" />
            <StatCard icon={Building2}  value={50000}      suffix="+"  label="Companies"        color="#8b5cf6" />
            <StatCard icon={Users}      value={1000000}    suffix="+"  label="Job Seekers"      color="#3b82f6" />
            <StatCard icon={CheckCircle} value={95}        suffix="%"  label="Success Rate"     color="#10b981" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          LIVE JOBS FROM DATABASE
      ══════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Latest Job Openings</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">Real opportunities updated live from our database</p>
            </div>
            <Link href="/jobs">
              <button className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
                View all <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </Link>
          </div>

          {liveJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {liveJobs.map((job, idx) => {
                const colors = ["#6366f1","#8b5cf6","#3b82f6","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899"];
                const c = colors[idx % colors.length];
                const abbr = (job.company || job.companyName || "Co").slice(0,2).toUpperCase();
                return (
                  <Link key={job._id || job.id} href={`/jobs/${job._id || job.id}`}>
                    <div className="card-hover bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 h-full flex flex-col cursor-pointer group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ background: `linear-gradient(135deg,${c},${c}bb)` }}>
                          {abbr}
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${c}15`, color: c }}>
                          {job.type || "Full-time"}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {job.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{job.company || job.companyName}</p>
                      <div className="mt-auto space-y-1.5">
                        {job.location && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <MapPin className="w-3 h-3 shrink-0" />{job.location}
                          </div>
                        )}
                        {job.experience && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3 shrink-0" />{job.experience}
                          </div>
                        )}
                        {(job.salary || job.salaryRange) && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: c }}>
                            <IndianRupee className="w-3 h-3 shrink-0" />{(job.salary || job.salaryRange).replace("₹", "")}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="h-44 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          )}

          <div className="flex justify-center mt-8">
            <Link href="/jobs">
              <button className="flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                Browse All Jobs <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TOP COMPANIES — AUTO-SCROLL MARQUEE
      ══════════════════════════════════════════════════ */}
      <section className="py-14 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 mb-8 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Top Companies Hiring Now</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">India's leading employers are looking for talent like you</p>
        </div>
        <div className="relative">
          <div className="flex gap-5 scroll-left" style={{ width: "max-content" }}>
            {[...TOP_COMPANIES, ...TOP_COMPANIES].map(({ name, abbr, color }, i) => (
              <Link key={`${name}-${i}`} href={`/jobs?search=${encodeURIComponent(name)}`}>
                <div className="flex flex-col items-center gap-2 w-20 cursor-pointer group">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all"
                    style={{ background: color }}>
                    {abbr}
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 text-center leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{name}</span>
                </div>
              </Link>
            ))}
          </div>
          {/* Fade edges */}
          <div className="absolute inset-y-0 left-0 w-16 pointer-events-none" style={{ background: "linear-gradient(90deg,white,transparent)" }} />
          <div className="absolute inset-y-0 right-0 w-16 pointer-events-none dark:hidden" style={{ background: "linear-gradient(-90deg,white,transparent)" }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          POPULAR ROLES
      ══════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-10 items-start">
            <div className="lg:w-64 shrink-0 w-full">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-2 sm:mb-3">
                Discover Jobs by Popular Role
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-5 leading-relaxed">
                Select a role and we'll show you the most relevant open positions right now.
              </p>
              <div className="w-40 h-40 rounded-3xl hidden sm:flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#6366f115,#8b5cf615)" }}>
                <div className="text-7xl">🔍</div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {POPULAR_ROLES.map(({ title, count, icon: Icon, color }) => (
                <Link key={title} href={`/jobs?search=${encodeURIComponent(title)}`}>
                  <div className="card-hover flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${color}15` }}>
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold" style={{ color }}>{count}</div>
                      <div className="text-[10px] text-gray-400">jobs</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURES STRIP
      ══════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-16 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-7 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Everything You Need to Land Your Next Job</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Powered by Gemini AI for smarter career decisions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: "🤖", title: "AI Career Assistant",
                desc: "Chat with our Gemini-powered AI to get job suggestions, interview tips, and resume advice — all personalized for you.",
                color: "#6366f1", link: null, label: "Try it now ↗",
              },
              {
                icon: "📄", title: "AI Resume Analyzer",
                desc: "Upload your resume and get instant ATS score, keyword gaps, and actionable suggestions to beat automated filters.",
                color: "#8b5cf6", link: "/candidate/resume-builder?tab=analyze", label: "Analyze Resume →",
              },
              {
                icon: "🎯", title: "AI Job Match",
                desc: "Our smart algorithm matches you to jobs that fit your skills, experience, and salary expectations.",
                color: "#3b82f6", link: "/candidate/job-match", label: "See Matches →",
              },
            ].map(({ icon, title, desc, color, link, label }) => (
              <div key={title} className="card-hover relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-7">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
                  style={{ background: color }} />
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-base mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{desc}</p>
                {link && (
                  <Link href={link}>
                    <span className="text-sm font-semibold" style={{ color }}>{label}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
              <Award className="w-3.5 h-3.5" /> Trusted by 10 Lakh+ Job Seekers
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">What Our Users Say</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Real stories from real people who found their dream jobs on Recruweb</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map(({ name, role, location, avatar, color, rating, text }) => (
              <div key={name} className="card-hover bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 flex flex-col">
                <div className="flex items-start gap-1 mb-3">
                  <Quote className="w-5 h-5 opacity-20 shrink-0" style={{ color }} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1 mb-4">"{text}"</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{ background: `linear-gradient(135deg,${color},${color}aa)` }}>
                    {avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{name}</div>
                    <div className="text-[11px] text-gray-400">{role}</div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <MapPin className="w-2.5 h-2.5" />{location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          INTERVIEW PREP
      ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Prepare for Your Next Interview</h2>
            <Link href="/interview-prep" className="hidden md:flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Practice with company-specific and role-specific questions</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">By Company</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {INTERVIEW_COMPANIES.map(({ name, q }) => (
                  <Link key={name} href="/interview-prep">
                    <div className="card-hover border border-gray-100 dark:border-gray-700 rounded-2xl p-4 bg-white dark:bg-gray-800 cursor-pointer text-center group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs mx-auto mb-2"
                        style={{ background: "#6366f115" }}>
                        {name.slice(0, 2)}
                      </div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-white group-hover:text-indigo-600 transition-colors">{name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{q} questions</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">By Role</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {INTERVIEW_ROLES.map(({ role, q }) => (
                  <Link key={role} href="/interview-prep">
                    <div className="card-hover flex items-center justify-between p-3.5 border border-gray-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 cursor-pointer group">
                      <span className="text-sm font-medium text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{role}</span>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold shrink-0 ml-2">{q}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          PREMIUM SERVICES CTA
      ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden p-10"
            style={{ background: "linear-gradient(135deg,#0f0c29 0%,#302b63 60%,#24243e 100%)" }}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="float-slow absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle,#a78bfa,transparent 70%)" }} />
            </div>
            <div className="relative flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" /> Premium Services
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                  Accelerate Your Job Search
                </h2>
                <p className="text-white/60 text-sm mb-6 leading-relaxed">
                  Get ahead of the competition with expert resume writing, priority placement, and AI-powered career coaching.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  {PREMIUM_SERVICES.map(({ icon, title, desc, color }) => (
                    <div key={title} className="text-center">
                      <div className="text-2xl mb-1.5">{icon}</div>
                      <div className="text-white text-xs font-bold">{title}</div>
                      <div className="text-white/50 text-[10px] mt-0.5 max-w-[100px] mx-auto">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="shrink-0">
                <Link href="/register">
                  <button className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg,#818cf8,#6366f1)" }}>
                    <span className="text-white">Get Started Free</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FRESHER / CAMPUS CTA
      ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-hover relative overflow-hidden rounded-2xl p-8"
              style={{ background: "linear-gradient(135deg,#e0e7ff 0%,#ede9fe 100%)" }}>
              <div className="relative">
                <div className="text-4xl mb-3">🎓</div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">Fresh Graduate?</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  Discover entry-level jobs, internships, and campus programs at India's top companies. Start your career right.
                </p>
                <Link href="/jobs?experience=Fresher">
                  <button className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                    Fresher Jobs <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
            <div className="card-hover relative overflow-hidden rounded-2xl p-8"
              style={{ background: "linear-gradient(135deg,#dcfce7 0%,#d1fae5 100%)" }}>
              <div className="relative">
                <div className="text-4xl mb-3">🚶</div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">Walk-in Interviews</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  No waiting for callbacks. Walk into an interview and land a job today. Updated daily with fresh walk-in listings.
                </p>
                <Link href="/jobs?type=walk-in">
                  <button className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}>
                    Walk-in Jobs <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          APP DOWNLOAD
      ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Apply on the Go</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                Never miss a job opportunity. Get real-time alerts, apply instantly, and track your applications — all from your phone.
              </p>
              <div className="flex gap-3">
                {["Google Play", "App Store"].map(store => (
                  <button key={store} className="flex items-center gap-2 px-5 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-semibold">
                    📱 {store}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-10">
              {[{ val: "4.8★", label: "Play Store" }, { val: "4.7★", label: "App Store" }, { val: "5M+", label: "Downloads" }].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{val}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
