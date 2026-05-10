import { Link } from "wouter";
import { Briefcase, Facebook, Twitter, Linkedin, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react";

const footerLinks = {
  "Find Jobs": [
    { label: "Jobs in Delhi NCR", href: "/jobs?location=Delhi" },
    { label: "Jobs in Mumbai", href: "/jobs?location=Mumbai" },
    { label: "Jobs in Bangalore", href: "/jobs?location=Bangalore" },
    { label: "Jobs in Hyderabad", href: "/jobs?location=Hyderabad" },
    { label: "Jobs in Pune", href: "/jobs?location=Pune" },
    { label: "Work From Home Jobs", href: "/jobs?type=Remote" },
    { label: "Fresher Jobs", href: "/jobs?experience=Fresher" },
    { label: "Walk-in Jobs", href: "/jobs" },
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
    { label: "Job Branding", href: "/employer/dashboard" },
    { label: "Talent Alerts", href: "/employer/dashboard" },
    { label: "Recruiter Login", href: "/login" },
  ],
  "Career Tools": [
    { label: "AI Resume Builder", href: "/candidate/resume-builder" },
    { label: "Interview Preparation", href: "/interview-prep" },
    { label: "AI Job Match", href: "/candidate/job-match" },
    { label: "Career Assessment", href: "/interview-prep" },
    { label: "Salary Calculator", href: "/interview-prep" },
    { label: "Career Advice Blog", href: "/help" },
  ],
  "Company": [
    { label: "About Recruweb", href: "/help" },
    { label: "Contact Us", href: "/help" },
    { label: "Privacy Policy", href: "/help" },
    { label: "Terms & Conditions", href: "/help" },
    { label: "Grievance Redressal", href: "/help" },
    { label: "Sitemap", href: "/" },
  ],
};

const socialLinks = [
  { Icon: Facebook, href: "#", label: "Facebook", color: "hover:text-blue-500" },
  { Icon: Twitter, href: "#", label: "Twitter", color: "hover:text-sky-400" },
  { Icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-600" },
  { Icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-500" },
  { Icon: Youtube, href: "#", label: "YouTube", color: "hover:text-red-500" },
];

const appBadges = [
  { label: "Google Play", sublabel: "GET IT ON", icon: "▶" },
  { label: "App Store", sublabel: "Download on the", icon: "⌘" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Top CTA Banner */}
      <div className="bg-primary/90 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-bold text-xl">Ready to find your next opportunity?</h3>
            <p className="text-blue-100 text-sm">Join 1 Crore+ professionals who trust Recruweb for their career growth.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/register" className="px-6 py-2.5 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm">
              Create Free Account
            </Link>
            <Link href="/employer/jobs/new" className="px-6 py-2.5 border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors text-sm">
              Post a Job
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl">Recruweb</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              India's fastest growing job portal connecting talent with top companies since 2024.
            </p>

            {/* Contact */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span>+91 11 4444 9999</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span>support@recruweb.in</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-primary mt-0.5" />
                <span>A-88, Sector 2, Noida, UP 201301</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, href, label, color }) => (
                <a key={label} href={href} aria-label={label} className={`w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 transition-colors ${color}`}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white font-semibold mb-4 text-sm">{heading}</h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-gray-400 hover:text-primary text-sm transition-colors hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App Download */}
        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-3">Download the Recruweb App</p>
            <div className="flex gap-3">
              {appBadges.map(({ label, sublabel, icon }) => (
                <button key={label} className="flex items-center gap-3 px-4 py-2.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700">
                  <span className="text-2xl text-white">{icon}</span>
                  <div className="text-left">
                    <div className="text-[10px] text-gray-400">{sublabel}</div>
                    <div className="text-white text-sm font-semibold">{label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="bg-green-800/50 text-green-400 px-2 py-1 rounded font-medium">ISO 27001 Certified</span>
            <span className="bg-blue-800/50 text-blue-400 px-2 py-1 rounded font-medium">NASSCOM Member</span>
            <span className="bg-purple-800/50 text-purple-400 px-2 py-1 rounded font-medium">DIPP Recognized Startup</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-5">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Recruweb Resources Pvt. Ltd. All rights reserved. CIN: U74140UP2024PTC123456</p>
          <div className="flex gap-4">
            <Link href="/help" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/help" className="hover:text-primary transition-colors">Terms of Use</Link>
            <Link href="/help" className="hover:text-primary transition-colors">Cookie Policy</Link>
            <Link href="/help" className="hover:text-primary transition-colors">Grievance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
