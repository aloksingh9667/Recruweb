import { useState } from "react";
import { Link } from "wouter";
import {
  Briefcase, Facebook, Twitter, Linkedin, Instagram, Youtube,
  Phone, Mail, MapPin, Send, CheckCircle, ArrowRight, Sparkles,
} from "lucide-react";

const footerLinks = {
  "Find Jobs": [
    { label: "Jobs in Delhi NCR", href: "/jobs?location=Delhi" },
    { label: "Jobs in Mumbai", href: "/jobs?location=Mumbai" },
    { label: "Jobs in Bangalore", href: "/jobs?location=Bangalore" },
    { label: "Jobs in Hyderabad", href: "/jobs?location=Hyderabad" },
    { label: "Jobs in Pune", href: "/jobs?location=Pune" },
    { label: "Work From Home Jobs", href: "/jobs?type=Remote" },
    { label: "Fresher Jobs", href: "/jobs?experience=Fresher" },
    { label: "Walk-in Jobs", href: "/jobs?type=walk-in" },
  ],
  "Top Categories": [
    { label: "IT & Software", href: "/jobs?category=IT" },
    { label: "Banking & Finance", href: "/jobs?category=Finance" },
    { label: "Marketing", href: "/jobs?category=Marketing" },
    { label: "Sales", href: "/jobs?category=Sales" },
    { label: "Healthcare", href: "/jobs?category=Healthcare" },
    { label: "Data Science", href: "/jobs?category=Data" },
    { label: "Engineering", href: "/jobs?category=Engineering" },
    { label: "HR & Admin", href: "/jobs?category=HR" },
  ],
  "Employer Services": [
    { label: "Post a Job", href: "/employer/jobs/new" },
    { label: "Employer Dashboard", href: "/employer/dashboard" },
    { label: "Resume Search", href: "/employer/dashboard" },
    { label: "Talent Alerts", href: "/employer/dashboard" },
    { label: "Recruiter Login", href: "/login" },
  ],
  "Career Tools": [
    { label: "AI Resume Builder", href: "/candidate/resume-builder" },
    { label: "Interview Preparation", href: "/interview-prep" },
    { label: "AI Job Match", href: "/candidate/job-match" },
    { label: "Career Assessment", href: "/interview-prep" },
    { label: "Career Advice Blog", href: "/help" },
  ],
  "Company": [
    { label: "About Recruweb", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/help" },
    { label: "Privacy Policy", href: "/help" },
    { label: "Terms & Conditions", href: "/help" },
  ],
};

const socialLinks = [
  { Icon: Facebook, href: "#", label: "Facebook", bg: "hover:bg-blue-600", ring: "hover:ring-blue-500/30" },
  { Icon: Twitter, href: "#", label: "Twitter", bg: "hover:bg-sky-500", ring: "hover:ring-sky-400/30" },
  { Icon: Linkedin, href: "#", label: "LinkedIn", bg: "hover:bg-blue-700", ring: "hover:ring-blue-600/30" },
  { Icon: Instagram, href: "#", label: "Instagram", bg: "hover:bg-pink-600", ring: "hover:ring-pink-500/30" },
  { Icon: Youtube, href: "#", label: "YouTube", bg: "hover:bg-red-600", ring: "hover:ring-red-500/30" },
];

function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const data = await res.json();
      if (!res.ok && res.status !== 409) throw new Error(data.message);
      setStatus("done");
      setTimeout(() => { setStatus("idle"); setEmail(""); }, 4000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-indigo-900/80 to-purple-900/60 rounded-2xl p-5 mb-6 border border-indigo-500/20 overflow-hidden">
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
          <p className="text-white font-semibold text-sm">Stay in the loop</p>
        </div>
        <p className="text-gray-400 text-xs mb-4 leading-relaxed">
          Get the latest jobs, hiring tips & career news delivered weekly.
        </p>
        {status === "done" ? (
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" /> Subscribed! Thank you.
          </div>
        ) : (
          <form onSubmit={subscribe} className="flex gap-2">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 h-9 px-3 text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="h-9 px-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all duration-200 disabled:opacity-60 shadow-lg shadow-indigo-500/30"
            >
              {status === "loading"
                ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><Send className="w-3 h-3" /><span>Send</span></>}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="text-red-400 text-xs mt-2">Already subscribed or something went wrong.</p>
        )}
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">

      {/* Top CTA Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-700 py-10">
        {/* Animated background blobs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000" />

        <div className="relative container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-white font-bold text-xl md:text-2xl">
              Ready to find your next opportunity?
            </h3>
            <p className="text-blue-200 text-sm mt-1">
              Join 1 Crore+ professionals who trust Recruweb for their career growth.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0 justify-center">
            <Link
              href="/register"
              className="group relative inline-flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-700 font-semibold rounded-xl text-sm overflow-hidden hover:shadow-xl hover:shadow-white/20 active:scale-95 transition-all duration-200"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">Create Free Account</span>
              <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/employer/jobs/new"
              className="group inline-flex items-center gap-2 px-6 py-2.5 border-2 border-white/70 text-white font-semibold rounded-xl text-sm hover:bg-white/15 hover:border-white active:scale-95 transition-all duration-200"
            >
              Post a Job
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10">

          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Recruweb</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              India's fastest growing job portal connecting talent with top companies since 2024.
            </p>

            {/* Contact */}
            <div className="space-y-2.5 mb-5">
              <div className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span>+91 11 4444 9999</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span>support@recruweb.in</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-gray-400">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="leading-relaxed">A-88, Sector 2, Noida, UP 201301</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2 mb-6">
              {socialLinks.map(({ Icon, href, label, bg, ring }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 ring-2 ring-transparent ${bg} ${ring} hover:border-transparent hover:scale-110 active:scale-95`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <NewsletterBox />
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group flex items-center gap-1 text-gray-500 hover:text-indigo-400 text-sm transition-colors duration-150"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform duration-150">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App Download + Badges */}
        <div className="mt-10 pt-8 border-t border-gray-800/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-3 text-sm">Download the Recruweb App</p>
            <div className="flex gap-3">
              {[
                { label: "Google Play", sublabel: "GET IT ON", icon: "▶" },
                { label: "App Store", sublabel: "Download on the", icon: "⌘" },
              ].map(({ label, sublabel, icon }) => (
                <button
                  key={label}
                  className="group flex items-center gap-3 px-4 py-2.5 bg-gray-800/80 rounded-xl hover:bg-gray-700 active:scale-95 transition-all duration-200 border border-gray-700 hover:border-gray-600 hover:shadow-lg hover:shadow-black/30"
                >
                  <span className="text-xl text-white group-hover:scale-110 transition-transform">{icon}</span>
                  <div className="text-left">
                    <div className="text-[10px] text-gray-500">{sublabel}</div>
                    <div className="text-white text-sm font-semibold">{label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center md:justify-end">
            <span className="flex items-center gap-1.5 bg-emerald-900/40 text-emerald-400 border border-emerald-700/30 px-3 py-1.5 rounded-lg text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ISO 27001 Certified
            </span>
            <span className="flex items-center gap-1.5 bg-blue-900/40 text-blue-400 border border-blue-700/30 px-3 py-1.5 rounded-lg text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              NASSCOM Member
            </span>
            <span className="flex items-center gap-1.5 bg-purple-900/40 text-purple-400 border border-purple-700/30 px-3 py-1.5 rounded-lg text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              DIPP Recognized Startup
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800/60 py-5">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Recruweb Resources Pvt. Ltd. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/help" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link>
            <Link href="/help" className="hover:text-indigo-400 transition-colors">Terms of Use</Link>
            <Link href="/help" className="hover:text-indigo-400 transition-colors">Cookie Policy</Link>
            <Link href="/help" className="hover:text-indigo-400 transition-colors">Grievance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
