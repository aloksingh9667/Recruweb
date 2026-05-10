import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  Search, MapPin, ChevronDown, Briefcase, Building2, ChevronRight,
  Star, Users, TrendingUp, Code, BarChart2, Megaphone, HeartPulse,
  GraduationCap, DollarSign, Palette, Wrench, ShieldCheck, Truck,
  Play, ArrowRight, Clock,
} from "lucide-react";

const QUICK_FILTERS = ["Remote", "MNC", "Project Mgmt", "Fresher", "Analytics", "HR", "Finance", "Sales", "IT", "Data Science"];

const JOB_CATEGORIES = [
  "Engineering", "Sales", "Startup", "Software A.", "Banking & Finance",
  "Marketing", "Healthcare", "Design", "HR & Talent", "Operations",
];

const EXPERIENCE_OPTIONS = [
  "Select experience", "Fresher", "1 year", "2 years", "3 years", "4 years",
  "5 years", "6 years", "7 years", "8 years", "9 years", "10+ years",
];

const TOP_COMPANY_LOGOS = [
  { name: "HCLTech", color: "bg-green-600", abbr: "HCL" },
  { name: "Cognizant", color: "bg-blue-600", abbr: "CTS" },
  { name: "TCS", color: "bg-blue-800", abbr: "TCS" },
  { name: "Infosys", color: "bg-indigo-600", abbr: "INF" },
  { name: "Wipro", color: "bg-blue-400", abbr: "WIP" },
  { name: "Accenture", color: "bg-purple-600", abbr: "ACC" },
  { name: "IBM", color: "bg-blue-900", abbr: "IBM" },
  { name: "Capgemini", color: "bg-teal-600", abbr: "CAP" },
  { name: "Tech M", color: "bg-red-600", abbr: "TM" },
  { name: "LTI", color: "bg-orange-600", abbr: "LTI" },
  { name: "Hexaware", color: "bg-pink-600", abbr: "HEX" },
  { name: "Mphasis", color: "bg-violet-600", abbr: "MPH" },
];

const FEATURED_COMPANIES = [
  { name: "Bbasst Financial", rating: 4.3, reviews: "12.2k", tagline: "India's leading NBFC", desc: "Pioneering experience with best salary package", jobs: 342, logo: "BF", color: "bg-blue-600" },
  { name: "Nagarro", rating: 4.4, reviews: "6.3k", tagline: "Leaders in digital solutions", desc: "We are a digital product company with 18000+ experts", jobs: 213, logo: "NG", color: "bg-purple-600" },
  { name: "Empowerment", rating: 4.2, reviews: "3.1k", tagline: "HR & financial decision maker", desc: "Global professional services organization", jobs: 87, logo: "EM", color: "bg-green-600" },
  { name: "Ganpati", rating: 4.5, reviews: "2.8k", tagline: "Global professionals decisions", desc: "Trusted global professional decisions partner", jobs: 156, logo: "GP", color: "bg-orange-600" },
];

const POPULAR_ROLES = [
  { title: "Full Stack Developer", count: "15.2k", icon: Code },
  { title: "Mobile / App Dev.", count: "8.4k", icon: Briefcase },
  { title: "Front End Developer", count: "12.1k", icon: Palette },
  { title: "DevOps Engineer", count: "6.8k", icon: Wrench },
  { title: "Engineering Manager", count: "3.2k", icon: Users },
  { title: "Technical Lead", count: "9.7k", icon: TrendingUp },
  { title: "Data Scientist", count: "11.3k", icon: BarChart2 },
  { title: "Product Manager", count: "5.6k", icon: ShieldCheck },
];

const SPONSORED_COMPANIES = [
  { name: "Lohsen", rating: 4.1, reviews: "1.2k", jobs: 45, color: "bg-blue-500", logo: "LO" },
  { name: "Tirupati Group", rating: 4.3, reviews: "2.1k", jobs: 89, color: "bg-green-600", logo: "TG" },
  { name: "Bounteous C Accolite", rating: 4.5, reviews: "3.4k", jobs: 124, color: "bg-purple-600", logo: "BA" },
  { name: "Eire", rating: 4.2, reviews: "891", jobs: 34, color: "bg-orange-500", logo: "EI" },
  { name: "Stellium", rating: 4.0, reviews: "567", jobs: 23, color: "bg-red-500", logo: "ST" },
  { name: "DVM Group", rating: 4.4, reviews: "1.8k", jobs: 67, color: "bg-teal-600", logo: "DV" },
  { name: "Aptean", rating: 4.3, reviews: "2.3k", jobs: 92, color: "bg-indigo-600", logo: "AP" },
  { name: "Areva Solutions", rating: 4.1, reviews: "445", jobs: 18, color: "bg-pink-600", logo: "AR" },
];

const SPONSORED_TABS = ["All", "Services", "Technology", "Banking & Finance", "FMCG", "Consulting"];

const INTERVIEW_COMPANIES = [
  { name: "Cognizant", q: "2.1k" }, { name: "Accenture", q: "3.4k" }, { name: "Wipro", q: "1.9k" },
  { name: "IBM", q: "2.7k" }, { name: "TCS", q: "4.2k" }, { name: "Flipkart", q: "1.3k" },
];

const INTERVIEW_ROLES = [
  { role: "Business Analyst", q: "8.2k" }, { role: "Software Engineer", q: "12.4k" },
  { role: "Sales & Marketing", q: "5.1k" }, { role: "Data Scientist", q: "7.3k" },
  { role: "Quality Analyst", q: "3.8k" }, { role: "Business Dev Exec.", q: "4.6k" },
];

const EVENTS = [
  { title: "Top 5 Kotlin Projects in Data JS 25", date: "12 May 2026", participants: "1.2k", img: "🎯" },
  { title: "Google 101 Roadmap in Year 2025+", date: "18 May 2026", participants: "2.4k", img: "🚀" },
];

const PREMIUM_SERVICES = [
  { icon: "✍️", title: "Resume Writing", desc: "Make a great impression with a well-crafted resume" },
  { icon: "🎯", title: "Resume Marketing", desc: "Get your resume noticed by top recruiters" },
  { icon: "📊", title: "Priority Applicant", desc: "Get featured & be seen first by employers" },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [companyQuery, setCompanyQuery] = useState("");
  const [experience, setExperience] = useState("Select experience");
  const [locationQuery, setLocationQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
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

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 pt-10 pb-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-1">
            Find your dream job now
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base mb-6">
            {stats?.totalJobs ? `${stats.totalJobs.toLocaleString()}+` : "5 lakh+"} jobs for you to explore
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md flex flex-col md:flex-row overflow-hidden">
            {/* Skills */}
            <div className="flex-[2] flex items-center gap-2 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Enter skills / designations / companies"
                className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white placeholder:text-gray-400 outline-none"
              />
              {searchQuery && <button type="button" onClick={() => setSearchQuery("")} className="text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>}
            </div>

            {/* Experience */}
            <div className="flex items-center gap-2 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 min-w-[160px]">
              <div className="relative flex-1">
                <select
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-700 dark:text-white outline-none appearance-none cursor-pointer pr-5"
                >
                  {EXPERIENCE_OPTIONS.map(opt => (
                    <option key={opt} value={opt} className="bg-white dark:bg-gray-800">{opt}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Location */}
            <div className="flex-1 flex items-center gap-2 px-4 py-3 border-b md:border-b-0 border-gray-200 dark:border-gray-700">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                value={locationQuery}
                onChange={e => setLocationQuery(e.target.value)}
                placeholder="Enter location"
                className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white placeholder:text-gray-400 outline-none"
              />
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white font-semibold text-sm px-8 py-3 transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {/* Quick Filter Chips */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {QUICK_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => { setSearchQuery(f); setLocation(`/jobs?search=${encodeURIComponent(f)}`); }}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:text-primary transition-colors bg-white dark:bg-gray-800"
              >
                {f}
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {JOB_CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setLocation(`/jobs?category=${encodeURIComponent(c)}`)}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors bg-white dark:bg-gray-800"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP COMPANIES HIRING NOW ── */}
      <section className="py-10 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Top companies hiring now</h2>
            <Link href="/jobs" className="text-primary text-sm hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3">
            {TOP_COMPANY_LOGOS.map(({ name, color, abbr }) => (
              <Link key={name} href={`/jobs?search=${encodeURIComponent(name)}`}>
                <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                  <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all`}>
                    {abbr}
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight">{name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COMPANIES ACTIVELY HIRING ── */}
      <section className="py-10 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Featured companies actively hiring</h2>
            <Link href="/jobs" className="text-primary text-sm hover:underline flex items-center gap-1">
              View all companies <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_COMPANIES.map(({ name, rating, reviews, tagline, desc, jobs, logo, color }) => (
              <Link key={name} href={`/jobs?search=${encodeURIComponent(name)}`}>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white font-bold shrink-0`}>
                      {logo}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{name}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{rating}</span>
                        <span className="text-xs text-gray-400">({reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-primary font-medium mb-1">{tagline}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{desc}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{jobs} active jobs</span>
                    <span className="text-xs text-primary font-medium hover:underline">View jobs →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE JOBS FROM DB ── */}
      {liveJobs.length > 0 && (
        <section className="py-10 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                Latest job openings
                <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
                </span>
              </h2>
              <Link href="/jobs" className="text-primary text-sm hover:underline flex items-center gap-1">
                View all jobs <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {liveJobs.slice(0, 8).map((job) => (
                <Link key={job._id || job.id} href={`/jobs/${job._id || job.id}`}>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm mb-3">
                      {(job.company || job.companyName || "Co").slice(0, 2).toUpperCase()}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-1 line-clamp-2">{job.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{job.company || job.companyName || "Company"}</p>
                    <div className="space-y-1">
                      {job.location && <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><MapPin className="w-3 h-3" />{job.location}</div>}
                      {job.experience && <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Clock className="w-3 h-3" />{job.experience}</div>}
                      {(job.salary || job.salaryRange) && <div className="text-xs text-green-600 dark:text-green-400 font-medium">{job.salary || job.salaryRange}</div>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CAMPUS BANNER ── */}
      <section className="py-6 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded">🎓 campus</span>
                <span className="text-sm font-medium">Introducing a career platform for college students & fresh grads</span>
              </div>
              <p className="text-blue-100 text-xs">Create profile, apply, get updates to kick-start your career in just a few steps.</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-blue-200">
                <span>📍 Fresher</span><span>🏢 MNC</span><span>💊 Healthcare</span><span>💻 Info & Internet</span>
              </div>
            </div>
            <Link href="/register">
              <button className="bg-white text-primary font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
                Explore now
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── DISCOVER JOBS ACROSS POPULAR ROLES ── */}
      <section className="py-10 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Left illustration */}
            <div className="lg:w-72 shrink-0 text-center">
              <div className="w-48 h-48 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <div className="text-7xl">🔍</div>
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Discover jobs across popular roles</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select a role and we'll show you relevant jobs for it!</p>
            </div>

            {/* Right role grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {POPULAR_ROLES.map(({ title, count, icon: Icon }) => (
                <Link key={title} href={`/jobs?search=${encodeURIComponent(title)}`}>
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer bg-white dark:bg-gray-800 group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/8 dark:bg-primary/15 rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-gray-800 dark:text-white group-hover:text-primary transition-colors">{title}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-primary">{count}</div>
                      <div className="text-[10px] text-gray-400">jobs</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SPONSORED COMPANIES ── */}
      <section className="py-10 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Sponsored companies</h2>
            <Link href="/jobs" className="text-primary text-sm hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {/* Tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {SPONSORED_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs px-4 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-white border-primary"
                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SPONSORED_COMPANIES.map(({ name, rating, reviews, jobs, color, logo }) => (
              <Link key={name} href={`/jobs?search=${encodeURIComponent(name)}`}>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-white font-bold text-xs`}>{logo}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] text-gray-600 dark:text-gray-400">{rating} ({reviews})</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-primary font-medium">{jobs} openings</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ── */}
      <section className="py-10 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Upcoming events and challenges</h2>
            <Link href="/jobs" className="text-primary text-sm hover:underline flex items-center gap-1">View more <ChevronRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EVENTS.map(({ title, date, participants, img }) => (
              <div key={title} className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 hover:shadow-sm transition-all cursor-pointer">
                <div className="w-24 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-4xl shrink-0">
                  {img}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm leading-tight mb-1">{title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{date}</p>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{participants} Registered</span>
                    <button className="text-primary font-medium hover:underline">View details →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERVIEW PREPARATION ── */}
      <section className="py-10 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Prepare for your next interview</h2>
            <Link href="/interview-prep" className="text-primary text-sm hover:underline flex items-center gap-1">View all <ChevronRight className="w-3.5 h-3.5" /></Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Practice with company-specific and role-specific questions</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* By Company */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">Interview questions by company</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INTERVIEW_COMPANIES.map(({ name, q }) => (
                  <Link key={name} href="/interview-prep">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-800 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer text-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-xs mx-auto mb-2">
                        {name.slice(0, 2)}
                      </div>
                      <p className="text-xs font-medium text-gray-800 dark:text-white">{name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{q} questions</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            {/* By Role */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">Interview questions by role</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {INTERVIEW_ROLES.map(({ role, q }) => (
                  <Link key={role} href="/interview-prep">
                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
                      <div className="text-xs font-medium text-gray-800 dark:text-white">{role}</div>
                      <span className="text-[10px] text-primary font-medium ml-2 shrink-0">{q} Q&A</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/interview-prep">
                <div className="mt-2 text-center py-2 text-xs text-primary hover:underline cursor-pointer">View all roles →</div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ACCELERATE JOB SEARCH ── */}
      <section className="py-10 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 text-primary text-xs font-semibold px-2 py-1 rounded mb-3">
                💡 recruweb
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Accelerate your job search with premium services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                {PREMIUM_SERVICES.map(({ icon, title, desc }) => (
                  <div key={title} className="text-center">
                    <div className="text-3xl mb-2">{icon}</div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-white mb-1">{title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0">
              <Link href="/register">
                <button className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors">
                  Learn more
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STAND OUT WITH VIDEO PROFILE ── */}
      <section className="py-10 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Stand out among recruiters with a video profile</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Showcase your personality and skills beyond your resume. Get shortlisted faster with a compelling video introduction.</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Available for both iOS & Android</p>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg hover:bg-gray-800 transition-colors">
                  <Play className="w-3.5 h-3.5" /> Google Play
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg hover:bg-gray-800 transition-colors">
                  <Play className="w-3.5 h-3.5" /> App Store
                </button>
              </div>
            </div>
            <div className="w-64 h-44 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center text-7xl shrink-0">
              👩‍💻
            </div>
          </div>
        </div>
      </section>

      {/* ── APP DOWNLOAD ── */}
      <section className="py-10 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Apply on the go</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Never miss a job opportunity. Get real-time alerts and apply from anywhere.</p>
              <div className="flex gap-3">
                {["Google Play", "App Store"].map(store => (
                  <button key={store} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-gray-800 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium">
                    <Play className="w-4 h-4" /> {store}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-8">
              {[{ val: "4.8★", label: "Play Store" }, { val: "4.7★", label: "App Store" }, { val: "5M+", label: "Downloads" }].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold text-primary">{val}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
