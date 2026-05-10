import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Building2, Linkedin, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CONTACT_INFO = [
  {
    icon: Phone,
    title: "Phone",
    lines: ["+91-98765-43210", "+91-11-4567-8900"],
    sub: "Mon–Sat, 9 AM – 7 PM IST",
    color: "from-blue-500 to-indigo-600",
    href: "tel:+919876543210",
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["support@recruweb.in", "hr@recruweb.in"],
    sub: "Response within 24 hours",
    color: "from-violet-500 to-purple-600",
    href: "mailto:support@recruweb.in",
  },
  {
    icon: MapPin,
    title: "Head Office",
    lines: ["Level 4, DLF Cyber Hub,", "Gurugram, Haryana 122002"],
    sub: "India",
    color: "from-emerald-500 to-teal-600",
    href: "https://maps.google.com",
  },
  {
    icon: Clock,
    title: "Working Hours",
    lines: ["Mon – Fri: 9:00 AM – 7:00 PM", "Saturday: 10:00 AM – 4:00 PM"],
    sub: "Indian Standard Time (IST)",
    color: "from-orange-500 to-red-500",
    href: null,
  },
];

const OFFICES = [
  { city: "Gurugram", address: "Level 4, DLF Cyber Hub, Gurugram, HR 122002", phone: "+91-124-456-7890" },
  { city: "Bangalore", address: "WeWork Galaxy, 43 Residency Rd, Bangalore 560025", phone: "+91-80-4567-8910" },
  { city: "Mumbai", address: "Nirlon Knowledge Park, Goregaon East, Mumbai 400063", phone: "+91-22-6789-1234" },
];

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "", type: "general" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const upd = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
    setTimeout(() => {
      setSent(false);
      setForm({ name: "", email: "", phone: "", subject: "", message: "", type: "general" });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 dark:from-gray-950 dark:via-indigo-950/10 dark:to-gray-950">
      <style>{`
        @keyframes contactIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heroIn { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mapPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        .contact-in { animation: contactIn .4s ease both; }
        .hero-in { animation: heroIn .5s ease both; }
        .card-in-1 { animation: contactIn .4s ease .05s both; }
        .card-in-2 { animation: contactIn .4s ease .1s both; }
        .card-in-3 { animation: contactIn .4s ease .15s both; }
        .card-in-4 { animation: contactIn .4s ease .2s both; }
      `}</style>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#818cf8,transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#a78bfa,transparent 70%)" }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-14 sm:py-20 text-center hero-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm mb-5">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Get in Touch</h1>
          <p className="text-white/60 text-sm sm:text-base max-w-md mx-auto">
            Have a question, feedback, or need support? We'd love to hear from you.
          </p>

          {/* Quick contact pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <a href="tel:+919876543210" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-semibold transition-all">
              <Phone className="w-3.5 h-3.5" />+91-98765-43210
            </a>
            <a href="mailto:support@recruweb.in" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-semibold transition-all">
              <Mail className="w-3.5 h-3.5" />support@recruweb.in
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-12">

        {/* ── Contact Info Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 sm:mb-12">
          {CONTACT_INFO.map((item, i) => (
            <div
              key={item.title}
              className={`contact-in bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 card-in-${i + 1} ${item.href ? "cursor-pointer" : ""}`}
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => item.href && window.open(item.href, "_blank")}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm mb-4`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-2">{item.title}</h3>
              {item.lines.map((line, j) => (
                <p key={j} className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-snug">{line}</p>
              ))}
              <p className="text-[11px] text-gray-400 mt-2">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Main Grid: Form + Map ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">

          {/* Contact Form */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-sm overflow-hidden contact-in">
            {/* Form header */}
            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-1">
                <Send className="w-5 h-5" />
                <h2 className="font-black text-lg">Send Us a Message</h2>
              </div>
              <p className="text-indigo-100 text-sm">We'll get back to you within 24 hours</p>
            </div>

            <div className="p-5 sm:p-6">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center" style={{ animation: "contactIn .4s ease both" }}>
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-black text-gray-800 dark:text-gray-200 mb-1">Message Sent!</h3>
                  <p className="text-sm text-gray-500">We'll respond to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Inquiry type */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">Inquiry Type</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { val: "general", label: "General" },
                        { val: "support", label: "Tech Support" },
                        { val: "employer", label: "For Employers" },
                        { val: "partnership", label: "Partnership" },
                      ].map(({ val, label }) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => upd("type", val)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border ${form.type === val ? "bg-indigo-600 text-white border-indigo-600 scale-105" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:text-indigo-600"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">Your Name *</label>
                      <input
                        required
                        placeholder="Rahul Kumar"
                        value={form.name}
                        onChange={e => upd("name", e.target.value)}
                        className="w-full h-10 px-3.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">Email Address *</label>
                      <input
                        required
                        type="email"
                        placeholder="rahul@example.com"
                        value={form.email}
                        onChange={e => upd("email", e.target.value)}
                        className="w-full h-10 px-3.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">Phone Number <span className="font-normal text-gray-400">(optional)</span></label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={e => upd("phone", e.target.value)}
                      className="w-full h-10 px-3.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">Subject *</label>
                    <input
                      required
                      placeholder="Brief description of your query"
                      value={form.subject}
                      onChange={e => upd("subject", e.target.value)}
                      className="w-full h-10 px-3.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">Message *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us more about how we can help you..."
                      value={form.message}
                      onChange={e => upd("message", e.target.value)}
                      className="w-full px-3.5 py-3 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 transition-all resize-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 transition-all duration-200 disabled:opacity-60"
                  >
                    {sending ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10" /></svg>
                        Sending...
                      </>
                    ) : (
                      <><Send className="w-4 h-4" />Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right column: Map + Offices */}
          <div className="lg:col-span-2 space-y-5">

            {/* Map embed */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm contact-in" style={{ animationDelay: "100ms" }}>
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-sm text-gray-800 dark:text-gray-200">Our Location</span>
              </div>
              <iframe
                title="Recruweb Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.2648567987!2d77.08947!3d28.4948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d19d582e38859%3A0x2cf5fe8e5c64b1e!2sDLF%20Cyber%20Hub!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Recruweb Technologies Pvt. Ltd.</p>
                <p className="text-xs text-gray-500 mt-0.5">Level 4, DLF Cyber Hub, Gurugram, Haryana 122002, India</p>
                <a
                  href="https://maps.google.com/maps?q=DLF+Cyber+Hub+Gurugram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  <MapPin className="w-3 h-3" />Get directions
                </a>
              </div>
            </div>

            {/* Office locations */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-sm overflow-hidden contact-in" style={{ animationDelay: "160ms" }}>
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-600" />
                <span className="font-bold text-sm text-gray-800 dark:text-gray-200">Our Offices</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {OFFICES.map((office, i) => (
                  <div key={office.city} className="flex items-start gap-3 px-4 py-3.5" style={{ animation: `contactIn .35s ease ${i * 80 + 200}ms both` }}>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{office.city.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{office.city}</p>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{office.address}</p>
                      <a href={`tel:${office.phone.replace(/[-\s]/g, "")}`} className="text-[11px] text-indigo-600 hover:underline font-medium mt-0.5 block">{office.phone}</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social links */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-sm p-5 contact-in" style={{ animationDelay: "220ms" }}>
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3">Follow Us</p>
              <div className="flex gap-3">
                {[
                  { icon: Linkedin, label: "LinkedIn", color: "#0077b5", href: "https://linkedin.com" },
                  { icon: Twitter, label: "Twitter", color: "#1da1f2", href: "https://twitter.com" },
                  { icon: Mail, label: "Email", color: "#6366f1", href: "mailto:support@recruweb.in" },
                ].map(({ icon: Icon, label, color, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:shadow-sm text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all"
                  >
                    <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                    <span className="hidden sm:inline lg:hidden xl:inline">{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
