import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  Search, MapPin, Building2, ChevronRight, TrendingUp, Users, Briefcase,
  Star, Clock, BookOpen, Award, Zap, ArrowRight, CheckCircle, Play,
  Code, BarChart2, Megaphone, HeartPulse, GraduationCap, DollarSign,
  ShieldCheck, Truck, Palette, Wrench, Brain, Target, Sparkles,
  UserCheck, FileText, Rocket, Trophy, Globe, BadgeCheck,
} from "lucide-react";

const POPULAR_SEARCHES = ["Software Engineer", "Product Manager", "Data Analyst", "Marketing Manager", "HR Executive", "React Developer", "Python Developer", "Sales Manager"];

const JOB_CATEGORIES = [
  { name: "IT & Software", count: "28,450+", icon: Code, color: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/40 dark:text-blue-400", hover: "hover:bg-blue-100 dark:hover:bg-blue-900/40" },
  { name: "Data Science", count: "12,300+", icon: BarChart2, color: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800/40 dark:text-purple-400", hover: "hover:bg-purple-100 dark:hover:bg-purple-900/40" },
  { name: "Marketing", count: "9,870+", icon: Megaphone, color: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800/40 dark:text-orange-400", hover: "hover:bg-orange-100 dark:hover:bg-orange-900/40" },
  { name: "Healthcare", count: "7,640+", icon: HeartPulse, color: "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-800/40 dark:text-red-400", hover: "hover:bg-red-100 dark:hover:bg-red-900/40" },
  { name: "Finance", count: "11,200+", icon: DollarSign, color: "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:border-green-800/40 dark:text-green-400", hover: "hover:bg-green-100 dark:hover:bg-green-900/40" },
  { name: "Education", count: "5,430+", icon: GraduationCap, color: "bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800/40 dark:text-yellow-400", hover: "hover:bg-yellow-100 dark:hover:bg-yellow-900/40" },
  { name: "Design", count: "4,120+", icon: Palette, color: "bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-900/20 dark:border-pink-800/40 dark:text-pink-400", hover: "hover:bg-pink-100 dark:hover:bg-pink-900/40" },
  { name: "Engineering", count: "15,900+", icon: Wrench, color: "bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-900/20 dark:border-teal-800/40 dark:text-teal-400", hover: "hover:bg-teal-100 dark:hover:bg-teal-900/40" },
  { name: "Sales", count: "18,730+", icon: TrendingUp, color: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/40 dark:text-indigo-400", hover: "hover:bg-indigo-100 dark:hover:bg-indigo-900/40" },
  { name: "HR & Admin", count: "6,200+", icon: Users, color: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800/40 dark:text-rose-400", hover: "hover:bg-rose-100 dark:hover:bg-rose-900/40" },
  { name: "Security", count: "3,850+", icon: ShieldCheck, color: "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800/40 dark:border-slate-700/40 dark:text-slate-400", hover: "hover:bg-slate-100 dark:hover:bg-slate-800/60" },
  { name: "Logistics", count: "5,610+", icon: Truck, color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/40 dark:text-amber-400", hover: "hover:bg-amber-100 dark:hover:bg-amber-900/40" },
];

const TOP_COMPANIES = [
  { name: "TCS", logo: "TC", jobs: 1240, industry: "IT Services", color: "bg-blue-600" },
  { name: "Infosys", logo: "IN", jobs: 980, industry: "IT Services", color: "bg-indigo-600" },
  { name: "Wipro", logo: "WI", jobs: 765, industry: "IT Services", color: "bg-blue-500" },
  { name: "HCL Tech", logo: "HC", jobs: 654, industry: "Technology", color: "bg-green-600" },
  { name: "Cognizant", logo: "CG", jobs: 543, industry: "IT Services", color: "bg-blue-700" },
  { name: "Accenture", logo: "AC", jobs: 876, industry: "Consulting", color: "bg-purple-600" },
  { name: "Amazon", logo: "AM", jobs: 432, industry: "E-commerce", color: "bg-orange-500" },
  { name: "Flipkart", logo: "FK", jobs: 321, industry: "E-commerce", color: "bg-yellow-500" },
  { name: "Zomato", logo: "ZO", jobs: 234, industry: "FoodTech", color: "bg-red-500" },
  { name: "Paytm", logo: "PT", jobs: 189, industry: "FinTech", color: "bg-blue-400" },
  { name: "Byju's", logo: "BY", jobs: 456, industry: "EdTech", color: "bg-indigo-500" },
  { name: "Ola", logo: "OL", jobs: 167, industry: "Mobility", color: "bg-yellow-600" },
];

const FEATURED_JOBS = [
  { title: "Senior React Developer", company: "TCS Digital", location: "Noida", salary: "₹15-25 LPA", type: "Full-time", exp: "3-6 yrs", hot: true, tags: ["React", "Node.js", "AWS"] },
  { title: "Data Scientist", company: "Infosys BPM", location: "Bangalore", salary: "₹12-18 LPA", type: "Full-time", exp: "2-5 yrs", hot: false, tags: ["Python", "ML", "TensorFlow"] },
  { title: "Product Manager", company: "Flipkart", location: "Bangalore", salary: "₹20-35 LPA", type: "Full-time", exp: "4-8 yrs", hot: true, tags: ["Strategy", "Agile", "SQL"] },
  { title: "UI/UX Designer", company: "Zomato", location: "Delhi", salary: "₹10-16 LPA", type: "Full-time", exp: "2-4 yrs", hot: false, tags: ["Figma", "Sketch", "Prototyping"] },
  { title: "DevOps Engineer", company: "Amazon India", location: "Hyderabad", salary: "₹18-28 LPA", type: "Full-time", exp: "3-7 yrs", hot: true, tags: ["AWS", "Docker", "Kubernetes"] },
  { title: "Marketing Manager", company: "Paytm", location: "Noida", salary: "₹12-20 LPA", type: "Full-time", exp: "3-6 yrs", hot: false, tags: ["Digital", "SEO", "Analytics"] },
];

const INTERVIEW_COMPANIES = [
  { name: "Amazon", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  { name: "Microsoft", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { name: "Google", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { name: "Accenture", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  { name: "TCS", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  { name: "Infosys", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  { name: "Wipro", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" },
  { name: "HCL", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
];

const INTERVIEW_ROLES = ["Frontend Dev", "Backend Dev", "Data Scientist", "Product Manager", "DevOps", "System Design", "DSA", "HR Round"];

const AI_TOOLS = [
  { title: "AI Resume Builder", desc: "Generate ATS-optimized resume in seconds", icon: "📄", href: "/candidate/resume-builder", badge: "New", color: "from-blue-500 to-indigo-600" },
  { title: "Smart Job Match", desc: "AI finds jobs that fit your profile perfectly", icon: "🎯", href: "/candidate/job-match", badge: "AI", color: "from-purple-500 to-pink-600" },
  { title: "Interview Prep AI", desc: "Practice with AI-powered mock interviews", icon: "🎤", href: "/interview-prep", badge: "Hot", color: "from-orange-500 to-red-600" },
  { title: "Career Counselor", desc: "Get personalized career guidance from AI", icon: "🤖", href: "/candidate/dashboard", badge: "Beta", color: "from-green-500 to-teal-600" },
];

const SERVICES = [
  { title: "Resume Writing", price: "₹1,299", desc: "Professional resume written by experts", icon: "✍️" },
  { title: "LinkedIn Makeover", price: "₹999", desc: "Optimize your LinkedIn for recruiters", icon: "💼" },
  { title: "Interview Coaching", price: "₹2,499", desc: "1:1 session with industry experts", icon: "🏆" },
  { title: "Career Counselling", price: "₹499", desc: "Personalized career roadmap session", icon: "🗺️" },
];

const TICKER_ITEMS = [
  "🔥 1,200+ new jobs added today",
  "✨ TCS hiring 500+ freshers",
  "💰 Google offering ₹40 LPA for Senior Engineers",
  "🚀 Infosys campus drive for 2025 batch",
  "📍 1,800+ remote jobs available now",
  "🎯 Accenture hiring across 12 cities",
  "⚡ Zomato expanding to 50 new cities",
  "🌟 Amazon India mass hiring in Hyderabad",
];

const HOW_IT_WORKS = [
  { step: "01", icon: UserCheck, title: "Create Your Profile", desc: "Sign up free and build your professional profile with our AI-powered resume builder in minutes.", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" },
  { step: "02", icon: Search, title: "Discover Opportunities", desc: "Browse 5 Lakh+ jobs filtered by role, location, salary, and experience level that match your goals.", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400" },
  { step: "03", icon: Rocket, title: "Apply & Get Hired", desc: "Apply in one click, track your applications, and prepare with our AI interview coach. Land your dream job!", color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400" },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: stats } = useQuery({
    queryKey: ["jobStats"],
    queryFn: () => fetchApi("/jobs/stats/summary"),
  });

  const { data: liveJobsData } = useQuery({
    queryKey: ["liveJobs"],
    queryFn: () => fetchApi("/jobs?limit=6"),
  });
  const liveJobs = liveJobsData?.jobs ?? [];

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery);
    if (locationQuery.trim()) params.set("location", locationQuery);
    setLocation(`/jobs?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">

      {/* ── TICKER BAR ── */}
      <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
        <div className="flex gap-8 animate-[scroll_40s_linear_infinite] whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-sm font-medium shrink-0 flex items-center gap-2">
              {item} <span className="text-primary-foreground/40 mx-2">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 py-16 md:py-24">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1.5px, transparent 0)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>India's #1 Job Portal — 5 Lakh+ Active Jobs</span>
              <BadgeCheck className="w-3.5 h-3.5 text-green-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
              Find The Job<br />
              <span className="text-yellow-300 drop-shadow-lg">You Deserve</span>
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect with 50,000+ top companies. Your next career move starts here.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto border border-white/20">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Skills, job title or company"
                  className="border-0 bg-transparent text-gray-900 dark:text-white h-12 focus-visible:ring-0 text-base placeholder:text-gray-400"
                />
              </div>
              <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-600 self-stretch my-2" />
              <div className="flex items-center gap-2 px-3">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                <Input
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="City or remote"
                  className="border-0 bg-transparent text-gray-900 dark:text-white h-12 focus-visible:ring-0 text-base w-36 placeholder:text-gray-400"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg">
                Search Jobs
              </Button>
            </form>

            {/* Popular Searches */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="text-white/60 text-sm">Popular:</span>
              {POPULAR_SEARCHES.map((s) => (
                <button key={s} onClick={() => { setSearchQuery(s); setLocation(`/jobs?search=${encodeURIComponent(s)}`); }}
                  className="text-sm bg-white/10 hover:bg-white/25 text-white border border-white/20 rounded-full px-3 py-0.5 transition-all hover:scale-105 cursor-pointer">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Briefcase, num: stats?.totalJobs ? `${stats.totalJobs.toLocaleString()}+` : "5L+", label: "Active Jobs" },
              { icon: Building2, num: "50K+", label: "Companies" },
              { icon: Users, num: "1Cr+", label: "Job Seekers" },
              { icon: Award, num: "95%", label: "Success Rate" },
            ].map(({ icon: Icon, num, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center text-white hover:bg-white/15 transition-colors">
                <Icon className="w-5 h-5 text-yellow-300 mx-auto mb-1" />
                <div className="text-2xl font-bold">{num}</div>
                <div className="text-blue-200 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-14 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 text-primary text-sm font-medium mb-3">
              <Rocket className="w-3.5 h-3.5" /> Simple 3-Step Process
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Get Hired in 3 Easy Steps</h2>
            <p className="text-gray-500 dark:text-gray-400">Your dream job is just a few clicks away</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 dark:from-blue-800/50 dark:via-purple-800/50 dark:to-green-800/50" />
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="flex flex-col items-center text-center group">
                <div className={`relative w-20 h-20 rounded-2xl ${color} flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all`}>
                  <Icon className="w-9 h-9" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-full flex items-center justify-center text-xs font-black text-gray-700 dark:text-gray-300 shadow-sm">
                    {step}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/register">
              <Button className="gap-2 px-8 shadow-md">
                Start Your Journey <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-14 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Browse by Category</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Explore opportunities across all domains</p>
            </div>
            <Link href="/jobs" className="flex items-center gap-1 text-primary hover:underline font-medium text-sm">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {JOB_CATEGORIES.map(({ name, count, icon: Icon, color, hover }) => (
              <Link key={name} href={`/jobs?category=${encodeURIComponent(name)}`}>
                <div className={`group flex flex-col items-center p-4 rounded-xl border-2 ${color} ${hover} hover:shadow-md transition-all cursor-pointer text-center hover:scale-105 hover:-translate-y-1`}>
                  <div className="w-11 h-11 rounded-xl bg-white/80 dark:bg-white/10 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-xs leading-tight">{name}</div>
                  <div className="text-[11px] opacity-70 mt-0.5">{count} jobs</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE JOBS FROM DB + FEATURED JOBS ── */}
      <section className="py-14 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {liveJobs.length > 0 ? "Latest Job Openings" : "Featured Jobs"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Handpicked opportunities from top employers</p>
            </div>
            <Link href="/jobs" className="flex items-center gap-1 text-primary hover:underline font-medium text-sm">
              All jobs <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(liveJobs.length > 0 ? liveJobs : FEATURED_JOBS).map((job, idx) => {
              const isLive = liveJobs.length > 0;
              const title = isLive ? job.title : job.title;
              const company = isLive ? (job.company || job.companyName || "Company") : job.company;
              const location = isLive ? job.location : job.location;
              const salary = isLive ? (job.salary || job.salaryRange) : job.salary;
              const type = isLive ? (job.type || job.employmentType) : job.type;
              const exp = isLive ? job.experience : job.exp;
              const tags = isLive ? (job.skills || []).slice(0, 3) : job.tags;
              const hot = isLive ? idx < 2 : job.hot;
              const id = isLive ? job._id || job.id : null;
              return (
                <Link key={isLive ? id : title} href={id ? `/jobs/${id}` : "/jobs"}>
                  <div className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden">
                    {/* Gradient top accent */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {hot && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        🔥 HOT
                      </div>
                    )}
                    {isLive && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        LIVE
                      </div>
                    )}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/15 to-indigo-500/15 rounded-xl flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/10">
                        {(company || "").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 pr-8">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight group-hover:text-primary transition-colors">{title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{company}</p>
                      </div>
                    </div>
                    {tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {tags.map((tag) => (
                          <span key={tag} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[11px] px-2 py-0.5 rounded-md font-medium">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 dark:text-gray-400">
                      {location && <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary/60" />{location}</div>}
                      {exp && <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary/60" />{exp}</div>}
                      {salary && <div className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-green-500" /><span className="text-green-600 dark:text-green-400 font-medium">{salary}</span></div>}
                      {type && <div className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-primary/60" /><span className="capitalize">{type}</span></div>}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <span className="text-xs text-primary font-medium group-hover:underline">View Details →</span>
                      <span className="text-[10px] text-gray-400">Apply Now</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/jobs">
              <Button variant="outline" className="gap-2 px-8 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                View All Jobs <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TOP COMPANIES ── */}
      <section className="py-14 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Top Companies Hiring</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Join industry leaders and innovative startups</p>
            </div>
            <Link href="/jobs" className="flex items-center gap-1 text-primary hover:underline font-medium text-sm">
              All companies <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {TOP_COMPANIES.map(({ name, logo, jobs, industry, color }) => (
              <Link key={name} href={`/jobs?search=${encodeURIComponent(name)}`}>
                <div className="group flex flex-col items-center p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all cursor-pointer">
                  <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center text-white font-bold text-lg mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                    {logo}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm text-center">{name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">{industry}</div>
                  <div className="mt-2 inline-flex items-center gap-1 bg-primary/5 text-primary text-[10px] font-medium px-2 py-0.5 rounded-full border border-primary/10">
                    <Briefcase className="w-3 h-3" /> {jobs} jobs
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI TOOLS ── */}
      <section className="py-14 bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-4 py-1.5 text-blue-300 text-sm font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> AI-Powered Career Tools
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Supercharge Your Job Search</h2>
            <p className="text-gray-400">Use artificial intelligence to find jobs, build resumes, and ace interviews</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {AI_TOOLS.map(({ title, desc, icon, href, badge, color }) => (
              <Link key={title} href={href}>
                <div className={`group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${color} hover:scale-105 hover:-translate-y-1 transition-all cursor-pointer shadow-lg`}>
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                  <div className="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</div>
                  <div className="text-4xl mb-4 relative z-10">{icon}</div>
                  <h3 className="font-bold text-white text-sm mb-1 relative z-10">{title}</h3>
                  <p className="text-white/70 text-xs leading-relaxed relative z-10">{desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-white text-xs font-medium relative z-10">
                    Try Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERVIEW PREP ── */}
      <section className="py-14 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Interview Preparation</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Prepare smarter with company-specific and role-specific questions</p>
            </div>
            <Link href="/interview-prep" className="flex items-center gap-1 text-primary hover:underline font-medium text-sm">
              All questions <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> By Company
              </h3>
              <div className="flex flex-wrap gap-2">
                {INTERVIEW_COMPANIES.map(({ name, color }) => (
                  <Link key={name} href="/interview-prep">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium cursor-pointer hover:shadow-md hover:scale-105 transition-all ${color}`}>
                      {name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" /> By Role
              </h3>
              <div className="flex flex-wrap gap-2">
                {INTERVIEW_ROLES.map((role) => (
                  <Link key={role} href="/interview-prep">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium cursor-pointer hover:shadow-md hover:scale-105 transition-all bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary border border-gray-200 dark:border-gray-700">
                      {role}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="text-5xl shrink-0">🎤</div>
            <div className="flex-1 text-white">
              <h3 className="font-bold text-xl mb-1">AI Mock Interviews</h3>
              <p className="text-purple-100 text-sm leading-relaxed">Practice with our AI interviewer that adapts to your role, asks follow-ups, and gives detailed feedback on your answers.</p>
            </div>
            <Link href="/interview-prep">
              <Button className="bg-white text-purple-700 hover:bg-purple-50 font-semibold shrink-0 px-6">
                Start Practice
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="py-10 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[
              { icon: "🏆", label: "India's #1 Job Portal" },
              { icon: "🔒", label: "100% Verified Jobs" },
              { icon: "⚡", label: "Instant Job Alerts" },
              { icon: "🤖", label: "AI-Powered Matching" },
              { icon: "📱", label: "Available on App" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREMIUM SERVICES ── */}
      <section className="py-14 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Premium Career Services</h2>
            <p className="text-gray-500 dark:text-gray-400">Get expert help to stand out from the competition</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map(({ title, price, desc, icon }) => (
              <div key={title} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all text-center group cursor-pointer">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 leading-relaxed">{desc}</p>
                <div className="text-primary font-bold text-lg mb-3">{price}</div>
                <button className="w-full py-2 px-4 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition-colors group-hover:bg-primary group-hover:text-white">
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR EMPLOYERS ── */}
      <section className="py-14 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row items-center gap-8 shadow-2xl">
            <div className="flex-1 text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-sm font-medium mb-4">
                <Building2 className="w-3.5 h-3.5" /> For Employers
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Hire Top Talent Faster</h2>
              <p className="text-blue-100 leading-relaxed mb-6">Post jobs and connect with 1 Crore+ active job seekers. Use AI-powered tools to find the perfect candidate.</p>
              <div className="space-y-2 mb-6">
                {["AI-powered candidate matching", "Access to 1Cr+ verified profiles", "Detailed analytics dashboard", "Free job posting to start"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-blue-100">
                    <CheckCircle className="w-4 h-4 text-green-300 shrink-0" /> {f}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/register">
                  <Button className="bg-white text-primary hover:bg-gray-100 font-semibold px-6 shadow-md">Post a Job Free</Button>
                </Link>
                <Link href="/employer/dashboard">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-6">View Pricing</Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-72 grid grid-cols-2 gap-3">
              {[
                { label: "Resume Views", val: "10Cr+", sub: "per month", emoji: "👁️" },
                { label: "Applications", val: "50L+", sub: "per month", emoji: "📝" },
                { label: "Companies", val: "50K+", sub: "active", emoji: "🏢" },
                { label: "Time to Hire", val: "7 days", sub: "average", emoji: "⚡" },
              ].map(({ label, val, sub, emoji }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center text-white hover:bg-white/15 transition-colors">
                  <div className="text-xl mb-1">{emoji}</div>
                  <div className="text-xl font-bold">{val}</div>
                  <div className="text-[10px] text-blue-200 mt-0.5">{sub}</div>
                  <div className="text-xs text-blue-100 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-14 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Success Stories</h2>
            <p className="text-gray-500 dark:text-gray-400">Real people, real career growth across India</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Priya Sharma", role: "Software Engineer → Tech Lead", company: "at TCS Digital", quote: "Found my dream job in just 2 weeks! The AI job matching tool was spot-on.", avatar: "PS", color: "bg-blue-500", location: "Delhi NCR" },
              { name: "Rahul Gupta", role: "Fresher → Data Analyst", company: "at Infosys", quote: "The resume builder helped me get 5x more interview calls. Highly recommend!", avatar: "RG", color: "bg-green-500", location: "Bangalore" },
              { name: "Anita Singh", role: "HR Executive → HR Manager", company: "at Wipro", quote: "Interview prep feature boosted my confidence. Got an offer within 3 weeks.", avatar: "AS", color: "bg-purple-500", location: "Hyderabad" },
            ].map(({ name, role, company, quote, avatar, color, location }) => (
              <div key={name} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 italic">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>{avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{role} <span className="text-primary">{company}</span></div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <MapPin className="w-3 h-3" />{location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APP DOWNLOAD CTA ── */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold mb-3">
                📱 Mobile App
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Get the Recruweb App</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Apply to jobs on the go. Get instant alerts. Available on iOS and Android.</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {[
                  { label: "Google Play", sub: "Get it on" },
                  { label: "App Store", sub: "Download on the" },
                ].map(({ label, sub }) => (
                  <button key={label} className="flex items-center gap-3 px-5 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-colors text-left">
                    <Play className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="text-[10px] text-gray-400">{sub}</div>
                      <div className="text-sm font-semibold">{label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6">
              {[
                { val: "4.8★", label: "Play Store" },
                { val: "4.7★", label: "App Store" },
                { val: "5M+", label: "Downloads" },
              ].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{val}</div>
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
