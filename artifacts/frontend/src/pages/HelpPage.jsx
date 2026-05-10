import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, HelpCircle, MessageSquare, Mail, Phone, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const FAQ_DATA = [
  {
    id: "candidates",
    label: "For Job Seekers",
    emoji: "🎯",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-400",
    items: [
      { q: "How do I create a candidate account?", a: "Click 'Sign Up' on the homepage, select 'Job Seeker', fill in your details. Your account will be active immediately. You can start applying to jobs right away." },
      { q: "How do I upload my resume?", a: "Go to My Profile → Edit Profile → scroll to the Resume section → click 'Upload Resume'. We accept PDF and DOCX formats up to 5MB. Your resume is stored securely." },
      { q: "Can I apply to multiple jobs at once?", a: "Yes! You can apply to as many jobs as you like. Each application is independently tracked in your Applications dashboard with its current status." },
      { q: "How do I know if my application was shortlisted?", a: "Check your Applications page — the status updates automatically from 'Pending' to 'Shortlisted', 'Interview Scheduled', or 'Hired' when the employer takes action." },
      { q: "What is AI Job Match?", a: "AI Job Match uses Gemini AI to analyze your profile and skills, then recommends the best-fit jobs from our listings — ranked by how well they match you. Go to AI Tools → Job Match AI." },
      { q: "How does the AI Resume Builder work?", a: "It generates a complete, ATS-optimized resume in your chosen style (Professional, ATS-Friendly, or Creative) based on your profile. Download it as PDF or text file instantly." },
      { q: "Can I save jobs and apply later?", a: "Yes! Click the bookmark icon on any job listing. Access all saved jobs from the Saved Jobs section in your account menu." },
      { q: "How do I track my applications?", a: "Go to 'My Applications' from your candidate dashboard. You'll see all applications with their current status, when you applied, and any recruiter feedback." },
    ],
  },
  {
    id: "employers",
    label: "For Employers",
    emoji: "🏢",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    border: "border-violet-200 dark:border-violet-800",
    textColor: "text-violet-700 dark:text-violet-400",
    items: [
      { q: "How do I post a job?", a: "Register as an Employer, complete your company profile, then go to Employer → Post a Job. Fill in all details across 5 steps — company info, location, role details, description, and contact. Your job will be live immediately." },
      { q: "How do I view applications for my job posting?", a: "Go to Employer → Manage Jobs → click 'View Applications' next to any listing. You can see all applicants, their profiles, and change their status." },
      { q: "Can I filter and rank applications?", a: "Yes! Use our AI Resume Filter to automatically rank candidates by how well their profile matches your job requirements. Saves hours of manual screening." },
      { q: "How do I shortlist or reject a candidate?", a: "In the Applications view, use the Status dropdown next to each candidate: Pending → Reviewed → Shortlisted → Interview Scheduled → Hired / Rejected. Candidates are notified automatically." },
      { q: "Can I edit a job posting after publishing?", a: "Yes. Go to Employer → Manage Jobs → click the Edit (pencil) icon next to any job. Update any details and save. Changes are reflected immediately to all job seekers." },
      { q: "How many jobs can I post?", a: "Currently there is no limit on the number of job postings for registered employers. Post as many openings as your company has available." },
    ],
  },
  {
    id: "account",
    label: "Account & Security",
    emoji: "🔐",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-700 dark:text-emerald-400",
    items: [
      { q: "How do I change my password?", a: "Go to Profile → Settings → Change Password. Enter your current password, then set and confirm the new one. The change takes effect immediately." },
      { q: "Is my personal data secure?", a: "Absolutely. Passwords are hashed with bcrypt and never stored in plain text. Resumes are stored with secure access URLs. We never share your data with third parties." },
      { q: "I forgot my password. What do I do?", a: "Contact us at support@recruweb.in with your registered email address. Our support team will help you reset your password within a few hours." },
      { q: "How do I delete my account?", a: "Send a deletion request to support@recruweb.in from your registered email. We process account deletions within 48 hours and permanently remove all your data." },
      { q: "Can I change my account type from candidate to employer?", a: "Account types cannot be changed directly. Please create a new account with the correct type, or contact our support team for assistance." },
    ],
  },
  {
    id: "technical",
    label: "Technical Issues",
    emoji: "⚙️",
    color: "from-orange-500 to-red-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
    textColor: "text-orange-700 dark:text-orange-400",
    items: [
      { q: "The page is not loading or showing an error.", a: "Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R). If the issue persists, clear your browser cache and cookies. You can also try a different browser." },
      { q: "My resume upload is failing.", a: "Ensure your file is in PDF or DOCX format and under 5MB. If the upload still fails, try compressing the PDF or contact support@recruweb.in." },
      { q: "I'm not receiving email notifications.", a: "Check your spam/junk folder. Add no-reply@recruweb.in to your contacts. If still missing, verify your email address is correct in your profile settings." },
      { q: "The AI chatbot is not responding.", a: "The AI assistant requires an active internet connection. Try refreshing the page. If it still doesn't respond, wait a moment and try again — the AI service may be briefly busy." },
    ],
  },
];

function AccordionItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-all duration-200 ${open ? "shadow-sm" : ""}`}
      style={{ animation: `faqIn .35s ease ${index * 40}ms both` }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-start justify-between gap-4 px-5 py-4 text-left transition-colors ${open ? "bg-indigo-50 dark:bg-indigo-900/20" : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
      >
        <span className={`text-sm font-semibold leading-snug flex-1 transition-colors ${open ? "text-indigo-700 dark:text-indigo-400" : "text-gray-800 dark:text-gray-200"}`}>
          {q}
        </span>
        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${open ? "bg-indigo-600 rotate-180" : "bg-gray-100 dark:bg-gray-800"}`}>
          <ChevronDown className={`w-3.5 h-3.5 transition-colors ${open ? "text-white" : "text-gray-500"}`} />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96" : "max-h-0"}`}>
        <div className="px-5 py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const inputRef = useRef(null);

  const allFaqs = FAQ_DATA.flatMap(c => c.items.map(item => ({ ...item, catId: c.id, catLabel: c.label, catColor: c.color })));

  const filteredFaqs = search.trim()
    ? allFaqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
    : null;

  const activeCategory = FAQ_DATA.find(c => c.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 dark:from-gray-950 dark:via-indigo-950/10 dark:to-gray-950">
      <style>{`
        @keyframes faqIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heroIn { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes searchGlow { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0)} 50%{box-shadow:0 0 0 4px rgba(99,102,241,.15)} }
        .hero-in { animation: heroIn .5s ease both; }
        .search-focus:focus-within { animation: searchGlow 2s ease infinite; }
      `}</style>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#818cf8,transparent 70%)" }} />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#a78bfa,transparent 70%)" }} />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-14 sm:py-20 text-center hero-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm mb-5">
            <HelpCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Frequently Asked Questions</h1>
          <p className="text-white/60 text-sm sm:text-base mb-8">Find instant answers to the most common questions about Recruweb</p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto search-focus">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl shadow-xl px-4 py-3.5 transition-all duration-200 focus-within:shadow-2xl focus-within:shadow-indigo-500/20">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search questions, e.g. 'upload resume', 'forgot password'..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 outline-none min-w-0"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            {[
              { val: `${allFaqs.length}+`, label: "Answered Questions" },
              { val: FAQ_DATA.length, label: "Categories" },
              { val: "24h", label: "Support Response" },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <div className="text-lg font-black text-white">{val}</div>
                <div className="text-[11px] text-white/50">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">

        {/* ── Search results ── */}
        {filteredFaqs && (
          <div style={{ animation: "faqIn .3s ease both" }}>
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{filteredFaqs.length}</span> result{filteredFaqs.length !== 1 ? "s" : ""} for "<em>{search}</em>"
              </span>
            </div>
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-bold text-gray-700 dark:text-gray-300">No results found</h3>
                <p className="text-sm text-gray-500 mt-1 mb-5">Try different keywords or browse categories below</p>
                <button onClick={() => setSearch("")} className="text-sm font-semibold text-indigo-600 hover:underline">Browse all FAQs</button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFaqs.map((f, i) => (
                  <div key={i} style={{ animation: `faqIn .3s ease ${i * 30}ms both` }}>
                    <div className="mb-1.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${f.catColor} text-white`}>{f.catLabel}</span>
                    </div>
                    <AccordionItem q={f.q} a={f.a} index={i} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Category Tabs + FAQ ── */}
        {!filteredFaqs && (
          <>
            {/* Tab strip */}
            <div className="flex gap-2 flex-wrap mb-8">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === "all" ? "bg-indigo-600 text-white shadow-sm" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400"}`}
              >
                All Questions
              </button>
              {FAQ_DATA.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${activeTab === cat.id ? `bg-gradient-to-r ${cat.color} text-white shadow-sm` : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400"}`}
                >
                  <span>{cat.emoji}</span>
                  <span className="hidden sm:inline">{cat.label}</span>
                  <span className="sm:hidden">{cat.label.split(" ")[0]}</span>
                </button>
              ))}
            </div>

            {/* All categories view */}
            {activeTab === "all" ? (
              <div className="space-y-8">
                {FAQ_DATA.map(cat => (
                  <div key={cat.id} style={{ animation: "faqIn .4s ease both" }}>
                    {/* Category header */}
                    <div className={`flex items-center gap-3 px-4 py-3 ${cat.bg} border ${cat.border} rounded-2xl mb-3`}>
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-lg shadow-sm`}>{cat.emoji}</div>
                      <div>
                        <h2 className={`font-bold text-sm ${cat.textColor}`}>{cat.label}</h2>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{cat.items.length} questions</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {cat.items.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} index={i} />)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ animation: "faqIn .35s ease both" }}>
                {activeCategory && (
                  <>
                    <div className={`flex items-center gap-3 px-4 py-3 ${activeCategory.bg} border ${activeCategory.border} rounded-2xl mb-4`}>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeCategory.color} flex items-center justify-center text-xl shadow-sm`}>{activeCategory.emoji}</div>
                      <div>
                        <h2 className={`font-bold ${activeCategory.textColor}`}>{activeCategory.label}</h2>
                        <p className="text-[11px] text-gray-500">{activeCategory.items.length} questions</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {activeCategory.items.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} index={i} />)}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Still need help? ── */}
        <div className="mt-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-center text-white" style={{ animation: "faqIn .5s ease .2s both" }}>
          <div className="text-3xl mb-3">💬</div>
          <h3 className="text-xl font-black mb-2">Still have questions?</h3>
          <p className="text-indigo-100 text-sm mb-6 max-w-md mx-auto">Can't find what you're looking for? Our support team is happy to help you out.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
            <Link href="/contact">
              <button className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-bold text-sm rounded-xl hover:bg-indigo-50 transition-all shadow-sm">
                <Mail className="w-4 h-4" /> Contact Support
              </button>
            </Link>
            <a href="mailto:support@recruweb.in" className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold text-sm rounded-xl hover:bg-white/30 transition-all border border-white/30">
              <Mail className="w-4 h-4" /> support@recruweb.in
            </a>
            <a href="tel:+919876543210" className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold text-sm rounded-xl hover:bg-white/30 transition-all border border-white/30">
              <Phone className="w-4 h-4" /> +91-98765-43210
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
