import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MessageSquare, HelpCircle, Search, ChevronRight, AlertCircle, ExternalLink } from "lucide-react";

const FAQ_CATEGORIES = [
  {
    id: "candidates",
    label: "For Candidates",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    items: [
      { q: "How do I create a candidate account?", a: "Click 'Sign Up' on the homepage, select 'Job Seeker', fill in your details and verify your email. Your account will be active immediately." },
      { q: "How do I upload my resume?", a: "Go to My Profile → Edit Profile → scroll to the Resume section → click 'Upload Resume'. We accept PDF and DOCX formats up to 5MB." },
      { q: "Can I apply to multiple jobs?", a: "Yes! You can apply to as many jobs as you like. Each application is tracked separately in your Applications dashboard." },
      { q: "How do I know if my application was shortlisted?", a: "Check your Applications page — the status will update from 'Pending' to 'Shortlisted' or 'Interview Scheduled' when the employer acts on it." },
      { q: "What is AI Job Match?", a: "AI Job Match uses Gemini AI to analyze your profile and recommend the best-fit jobs from our listings. Go to AI Tools → Job Match AI." },
      { q: "How does the AI Resume Builder work?", a: "It reads your profile data and generates a complete, formatted resume in your chosen style — Modern, ATS-Friendly, or Creative. You can download it as a text file." },
      { q: "Can I save jobs and apply later?", a: "Yes! Click the bookmark icon on any job listing or job detail page. Access saved jobs from Jobs → Saved Jobs." },
    ],
  },
  {
    id: "employers",
    label: "For Employers",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    items: [
      { q: "How do I post a job?", a: "Register as an Employer, complete your company profile, then go to Employer → Post a Job. Fill in all the details and submit. Your job will be live immediately." },
      { q: "How do I view applications for my job?", a: "Go to Employer → Manage Jobs → click 'View Applications' next to any job listing." },
      { q: "Can I filter applications by skills?", a: "Yes. In the applications view, use the filter bar to search by skills, keywords, experience level, or education. You can also use AI Resume Filtering to rank candidates automatically." },
      { q: "How do I download a candidate's resume?", a: "Open any application, click the candidate name to view their profile, then click 'Download Full Resume'. Resumes are securely stored and only accessible to you." },
      { q: "How do I shortlist or reject a candidate?", a: "In the Applications view, use the Status dropdown next to each candidate to change from Pending → Reviewed → Shortlisted / Rejected / Interview Scheduled / Hired." },
      { q: "What is AI Resume Filtering?", a: "AI Resume Filter uses Gemini AI to rank all applicants for a job based on how well their profile matches the job requirements. It saves time screening large applicant pools." },
    ],
  },
  {
    id: "account",
    label: "Account & Security",
    color: "bg-green-50 text-green-700 border-green-200",
    items: [
      { q: "How do I change my password?", a: "Go to Profile → Settings → Change Password. You'll need to enter your current password to set a new one." },
      { q: "How do I delete my account?", a: "Contact us at support@recruweb.in with your registered email. We'll process deletion within 48 hours and remove all your data." },
      { q: "Is my data secure?", a: "Yes. Resumes are stored privately on Cloudinary with signed, time-limited access URLs. Passwords are hashed with bcrypt. We never share your data with third parties." },
      { q: "I forgot my password. What do I do?", a: "Currently contact support@recruweb.in with your account email and we'll help you reset it. A self-service reset is coming soon." },
    ],
  },
];

export default function HelpPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const allFaqs = FAQ_CATEGORIES.flatMap(c => c.items.map(item => ({ ...item, category: c.label })));
  const filteredFaqs = search
    ? allFaqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
    : null;

  const handleContact = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <HelpCircle className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground mt-2">Find answers to common questions or reach our support team</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: MessageSquare, label: "Live Chat", desc: "AI Assistant", action: () => document.querySelector("[aria-label='Open AI Assistant']")?.click() },
          { icon: Mail, label: "Email Support", desc: "support@recruweb.in", action: () => window.location = "mailto:support@recruweb.in" },
          { icon: Phone, label: "Phone", desc: "+91-98765-43210", action: () => {} },
          { icon: AlertCircle, label: "Report Issue", desc: "Bug / Problem", action: () => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" }) },
        ].map(({ icon: Icon, label, desc, action }) => (
          <Card key={label} className="hover:shadow-md transition-shadow cursor-pointer" onClick={action}>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search FAQs */}
      <div className="mb-8">
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search frequently asked questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Search Results */}
      {filteredFaqs && (
        <div className="mb-10">
          <p className="text-sm text-muted-foreground mb-3">{filteredFaqs.length} result(s) for "{search}"</p>
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No results found. Try different keywords or contact support.</div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {filteredFaqs.map((f, i) => (
                <AccordionItem key={i} value={`search-${i}`} className="border rounded-xl px-4">
                  <AccordionTrigger className="text-sm font-medium text-left">
                    <div>
                      <Badge variant="outline" className="text-[10px] mr-2">{f.category}</Badge>
                      {f.q}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      )}

      {/* FAQ Categories */}
      {!search && (
        <div className="space-y-8 mb-12">
          {FAQ_CATEGORIES.map(cat => (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className={`${cat.color} text-sm px-3 py-1`}>{cat.label}</Badge>
              </div>
              <Accordion type="single" collapsible className="space-y-2">
                {cat.items.map((item, i) => (
                  <AccordionItem key={i} value={`${cat.id}-${i}`} className="border rounded-xl px-4">
                    <AccordionTrigger className="text-sm font-medium text-left">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      )}

      {/* Contact Form */}
      <Card id="contact-form">
        <CardHeader>
          <CardTitle className="text-lg">Send us a message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContact} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Your Name</label>
                <Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Ravi Kumar" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email Address</label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="ravi@example.com" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Subject</label>
              <Input value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} placeholder="Issue with my application..." required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Message</label>
              <Textarea value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} rows={4} placeholder="Describe your issue in detail..." required />
            </div>
            <Button type="submit" disabled={sending} className="gap-2">
              <Mail className="w-4 h-4" />
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
