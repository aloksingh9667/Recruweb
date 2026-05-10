import { useState, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText, Sparkles, Download, Copy, Check, AlertCircle,
  Loader2, Target, TrendingUp, Star, Plus, Trash2, Eye,
  EyeOff, ChevronDown, Briefcase, GraduationCap, User,
  Award, Globe, Phone, Mail, MapPin,
} from "lucide-react";

const TEMPLATES = [
  { id:"professional", name:"Professional", desc:"Clean corporate layout, ideal for traditional industries", icon:"💼", badge:"Most Popular", color:"from-blue-500 to-indigo-600" },
  { id:"ats", name:"ATS-Friendly", desc:"Keyword-rich, optimized for applicant tracking systems", icon:"🎯", badge:"Best for MNCs", color:"from-emerald-500 to-teal-600" },
  { id:"creative", name:"Creative", desc:"Bold design showcasing your personality", icon:"🎨", badge:"Creative Roles", color:"from-purple-500 to-pink-600" },
];

const defaultForm = {
  fullName:"", jobTitle:"", email:"", phone:"", location:"", linkedin:"", website:"",
  summary:"",
  experience:[{ company:"", position:"", duration:"", description:"" }],
  education:[{ institution:"", degree:"", year:"", grade:"" }],
  skills:"", certifications:"", languages:"",
};

/* ── Resume Templates ── */
function ProfessionalTemplate({ data }) {
  return (
    <div className="font-serif text-gray-900 text-[12.5px] leading-relaxed">
      <div className="border-b-2 border-gray-800 pb-3 mb-4">
        <h1 className="text-[22px] font-bold tracking-wide">{data.fullName||"Your Name"}</h1>
        {data.jobTitle && <p className="text-gray-600 font-medium mt-0.5 text-[13px]">{data.jobTitle}</p>}
        <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-gray-600">
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>☎ {data.phone}</span>}
          {data.location && <span>📍 {data.location}</span>}
          {data.linkedin && <span>in {data.linkedin}</span>}
        </div>
      </div>
      {data.summary && <div className="mb-4"><h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Professional Summary</h2><p className="text-gray-700">{data.summary}</p></div>}
      {data.experience?.some(e=>e.company||e.position) && (
        <div className="mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Work Experience</h2>
          {data.experience.filter(e=>e.company||e.position).map((exp,i)=>(
            <div key={i} className="mb-3">
              <div className="flex justify-between items-start">
                <div><div className="font-bold">{exp.position}</div><div className="text-gray-600 font-medium">{exp.company}</div></div>
                <div className="text-gray-500 text-[11px] shrink-0">{exp.duration}</div>
              </div>
              {exp.description && <p className="text-gray-700 mt-1 text-[11px]">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      {data.education?.some(e=>e.institution||e.degree) && (
        <div className="mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Education</h2>
          {data.education.filter(e=>e.institution||e.degree).map((edu,i)=>(
            <div key={i} className="flex justify-between items-start mb-2">
              <div><div className="font-bold">{edu.degree}</div><div className="text-gray-600">{edu.institution}</div></div>
              <div className="text-right text-[11px] text-gray-500"><div>{edu.year}</div>{edu.grade&&<div>{edu.grade}</div>}</div>
            </div>
          ))}
        </div>
      )}
      {data.skills && <div className="mb-4"><h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Skills</h2><div className="flex flex-wrap gap-1">{data.skills.split(",").map((s,i)=><span key={i} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">{s.trim()}</span>)}</div></div>}
      {data.certifications && <div className="mb-3"><h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Certifications</h2><p>{data.certifications}</p></div>}
    </div>
  );
}

function ATSTemplate({ data }) {
  return (
    <div className="font-sans text-gray-900 text-[12.5px] leading-relaxed">
      <div className="bg-indigo-700 text-white p-4 -mx-1 -mt-1 mb-4 rounded-t">
        <h1 className="text-[20px] font-bold">{data.fullName||"Your Name"}</h1>
        {data.jobTitle && <p className="text-indigo-100 text-[13px] mt-0.5">{data.jobTitle}</p>}
        <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-indigo-100">
          {data.email&&<span>{data.email}</span>}{data.phone&&<span>{data.phone}</span>}{data.location&&<span>{data.location}</span>}
        </div>
      </div>
      {data.summary && <div className="mb-4"><h2 className="text-[10px] font-bold uppercase text-indigo-700 border-l-4 border-indigo-700 pl-2 mb-2">PROFESSIONAL SUMMARY</h2><p className="text-gray-700 text-[11px]">{data.summary}</p></div>}
      {data.skills && <div className="mb-4"><h2 className="text-[10px] font-bold uppercase text-indigo-700 border-l-4 border-indigo-700 pl-2 mb-2">KEY SKILLS</h2><div className="grid grid-cols-3 gap-1">{data.skills.split(",").map((s,i)=><span key={i} className="flex items-center gap-1 text-[11px] text-gray-700"><span className="w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0" />{s.trim()}</span>)}</div></div>}
      {data.experience?.some(e=>e.company||e.position) && (
        <div className="mb-4">
          <h2 className="text-[10px] font-bold uppercase text-indigo-700 border-l-4 border-indigo-700 pl-2 mb-2">WORK EXPERIENCE</h2>
          {data.experience.filter(e=>e.company||e.position).map((exp,i)=>(
            <div key={i} className="mb-3 pl-2">
              <div className="flex justify-between"><span className="font-bold text-[11px]">{exp.position} | {exp.company}</span><span className="text-gray-500 text-[11px]">{exp.duration}</span></div>
              {exp.description&&<p className="text-gray-700 mt-1 text-[11px]">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      {data.education?.some(e=>e.institution||e.degree) && (
        <div className="mb-4">
          <h2 className="text-[10px] font-bold uppercase text-indigo-700 border-l-4 border-indigo-700 pl-2 mb-2">EDUCATION</h2>
          {data.education.filter(e=>e.institution||e.degree).map((edu,i)=>(
            <div key={i} className="flex justify-between mb-2 pl-2"><div><div className="font-bold text-[11px]">{edu.degree}</div><div className="text-gray-600 text-[11px]">{edu.institution}</div></div><div className="text-[11px] text-gray-500 text-right"><div>{edu.year}</div>{edu.grade&&<div>{edu.grade}</div>}</div></div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreativeTemplate({ data }) {
  return (
    <div className="font-sans text-[12.5px] leading-relaxed flex gap-4">
      <div className="w-[38%] bg-gradient-to-b from-violet-700 to-indigo-800 text-white p-4 rounded-lg shrink-0">
        <div className="mb-5">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold mb-3">{(data.fullName||"YN").slice(0,2).toUpperCase()}</div>
          <h1 className="text-[15px] font-bold leading-tight">{data.fullName||"Your Name"}</h1>
          {data.jobTitle&&<p className="text-violet-200 text-[11px] mt-1">{data.jobTitle}</p>}
        </div>
        <div className="mb-4"><h3 className="text-[9px] font-bold uppercase tracking-widest text-violet-300 mb-2">Contact</h3><div className="space-y-1 text-[11px] text-violet-100">{data.email&&<div>{data.email}</div>}{data.phone&&<div>{data.phone}</div>}{data.location&&<div>{data.location}</div>}</div></div>
        {data.skills&&<div className="mb-4"><h3 className="text-[9px] font-bold uppercase tracking-widest text-violet-300 mb-2">Skills</h3><div className="space-y-1">{data.skills.split(",").slice(0,10).map((s,i)=><div key={i} className="text-[11px] text-violet-100 flex items-center gap-1.5"><span className="w-1 h-1 bg-violet-300 rounded-full" />{s.trim()}</div>)}</div></div>}
        {data.languages&&<div><h3 className="text-[9px] font-bold uppercase tracking-widest text-violet-300 mb-2">Languages</h3><p className="text-[11px] text-violet-100">{data.languages}</p></div>}
      </div>
      <div className="flex-1 min-w-0">
        {data.summary&&<div className="mb-4"><h2 className="text-[12px] font-bold text-violet-700 mb-2 flex items-center gap-2"><span className="w-5 h-0.5 bg-violet-700" />About Me</h2><p className="text-gray-700 text-[11px]">{data.summary}</p></div>}
        {data.experience?.some(e=>e.company||e.position)&&<div className="mb-4"><h2 className="text-[12px] font-bold text-violet-700 mb-2 flex items-center gap-2"><span className="w-5 h-0.5 bg-violet-700" />Experience</h2>{data.experience.filter(e=>e.company||e.position).map((exp,i)=><div key={i} className="mb-3 pl-3 border-l-2 border-violet-200"><div className="font-bold text-[11px]">{exp.position}</div><div className="text-violet-600 text-[11px] font-medium">{exp.company} · {exp.duration}</div>{exp.description&&<p className="text-gray-600 mt-1 text-[11px]">{exp.description}</p>}</div>)}</div>}
        {data.education?.some(e=>e.institution||e.degree)&&<div className="mb-4"><h2 className="text-[12px] font-bold text-violet-700 mb-2 flex items-center gap-2"><span className="w-5 h-0.5 bg-violet-700" />Education</h2>{data.education.filter(e=>e.institution||e.degree).map((edu,i)=><div key={i} className="mb-2 pl-3 border-l-2 border-violet-200"><div className="font-bold text-[11px]">{edu.degree}</div><div className="text-gray-600 text-[11px]">{edu.institution} · {edu.year}</div>{edu.grade&&<div className="text-[11px] text-gray-500">{edu.grade}</div>}</div>)}</div>}
        {data.certifications&&<div><h2 className="text-[12px] font-bold text-violet-700 mb-2 flex items-center gap-2"><span className="w-5 h-0.5 bg-violet-700" />Certifications</h2><p className="text-gray-700 text-[11px]">{data.certifications}</p></div>}
      </div>
    </div>
  );
}

function CVPreview({ template, data }) {
  if (template==="ats") return <ATSTemplate data={data} />;
  if (template==="creative") return <CreativeTemplate data={data} />;
  return <ProfessionalTemplate data={data} />;
}

/* ── Animated Score Ring ── */
function ScoreRing({ score }) {
  const r = 44, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition:"stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>{score}</span>
          <span className="text-[10px] text-gray-500 font-semibold">/ 100</span>
        </div>
      </div>
    </div>
  );
}

/* ── Section wrapper ── */
function Section({ title, icon: Icon, color = "indigo", children, action }) {
  const [open, setOpen] = useState(true);
  const colors = { indigo:"border-indigo-200 dark:border-indigo-800", violet:"border-violet-200 dark:border-violet-800", emerald:"border-emerald-200 dark:border-emerald-800" };
  return (
    <div className={`bg-white dark:bg-gray-900 border rounded-2xl overflow-hidden shadow-sm transition-all duration-200 ${colors[color]||colors.indigo}`} style={{ animation:"sectionIn .35s ease both" }}>
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => setOpen(o=>!o)} className="flex items-center gap-2.5 flex-1 text-left">
          {Icon && <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /></div>}
          <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{title}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ml-auto mr-2 ${open?"rotate-180":""}`} />
        </button>
        {action}
      </div>
      <div className={`transition-all duration-300 ${open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

/* ── Tab button ── */
function TabBtn({ active, onClick, icon: Icon, label, badge }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-semibold transition-all duration-200 border-b-2 whitespace-nowrap ${active ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
      <Icon className="w-4 h-4 shrink-0" /><span className="hidden sm:inline">{label}</span><span className="sm:hidden">{label.split(" ")[0]}</span>
      {badge && <span className="text-[9px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-1.5 py-0.5 rounded-full font-bold">{badge}</span>}
    </button>
  );
}

/* ─── MAIN ─── */
export default function ResumeBuilder() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(window.location.search).get("tab")==="analyze" ? "analyze" : "builder");
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [formData, setFormData] = useState(defaultForm);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef(null);

  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState("");
  const [genError, setGenError] = useState("");
  const [copied, setCopied] = useState(false);

  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzeError, setAnalyzeError] = useState("");

  const upd = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const updExp = (i, f, v) => { const e = [...formData.experience]; e[i]={...e[i],[f]:v}; setFormData(p=>({...p,experience:e})); };
  const updEdu = (i, f, v) => { const e = [...formData.education]; e[i]={...e[i],[f]:v}; setFormData(p=>({...p,education:e})); };

  const downloadPDF = () => {
    const el = document.getElementById("cv-preview-print");
    if (!el) return;
    const w = window.open("","_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>${formData.fullName||"Resume"}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:13px;color:#111;background:white;padding:20px}@media print{@page{margin:15mm}}</style></head><body>${el.innerHTML}<script>window.onload=()=>{window.print();window.close()}<\/script></body></html>`);
    w.document.close();
  };

  const downloadTXT = () => {
    const lines = [];
    lines.push(formData.fullName||"Your Name");
    if (formData.jobTitle) lines.push(formData.jobTitle);
    lines.push([formData.email,formData.phone,formData.location].filter(Boolean).join(" | "));
    if (formData.summary) { lines.push("","PROFESSIONAL SUMMARY",formData.summary); }
    if (formData.experience?.some(e=>e.company)) {
      lines.push("","WORK EXPERIENCE");
      formData.experience.filter(e=>e.company).forEach(e => { lines.push(`${e.position} at ${e.company} (${e.duration})`); if (e.description) lines.push(e.description); });
    }
    if (formData.education?.some(e=>e.institution)) {
      lines.push("","EDUCATION");
      formData.education.filter(e=>e.institution).forEach(e => lines.push(`${e.degree} - ${e.institution} (${e.year})`));
    }
    if (formData.skills) { lines.push("","SKILLS",formData.skills); }
    const blob = new Blob([lines.join("\n")], { type:"text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`${(formData.fullName||"resume").replace(/\s+/g,"_")}_CV.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const generateResume = async () => {
    setGenerating(true); setGenError(""); setGeneratedResume("");
    try { const d = await fetchApi("/ai/resume-generate",{method:"POST",body:JSON.stringify({template:selectedTemplate})}); setGeneratedResume(d.resume); }
    catch (err) { setGenError(err.message); }
    finally { setGenerating(false); }
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) return;
    setAnalyzing(true); setAnalyzeError(""); setAnalysis(null);
    try { const d = await fetchApi("/ai/resume-analyze",{method:"POST",body:JSON.stringify({resumeText,targetRole})}); setAnalysis(d); }
    catch (err) { setAnalyzeError(err.message); }
    finally { setAnalyzing(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 dark:from-gray-950 dark:via-indigo-950/10 dark:to-gray-950">
      <style>{`
        @keyframes sectionIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes headerIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes previewIn { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
        @keyframes scoreIn { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
        .header-anim { animation: headerIn .4s ease both; }
        .preview-anim { animation: previewIn .3s ease both; }
        .score-anim { animation: scoreIn .5s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8">

        {/* ── Header ── */}
        <div className="header-anim mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-900/30">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">CV & Resume Builder</h1>
              <p className="text-sm text-muted-foreground">Build, customize and analyze your professional resume</p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm mb-5 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <TabBtn active={activeTab==="builder"} onClick={() => setActiveTab("builder")} icon={FileText} label="CV Builder" />
            <TabBtn active={activeTab==="ai-generate"} onClick={() => setActiveTab("ai-generate")} icon={Sparkles} label="AI Generate" badge="AI" />
            <TabBtn active={activeTab==="analyze"} onClick={() => setActiveTab("analyze")} icon={Target} label="Analyze Resume" />
          </div>
        </div>

        {/* ══════════════ CV BUILDER TAB ══════════════ */}
        {activeTab === "builder" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {/* Left — Form */}
            <div className="space-y-4">

              {/* Template Selector */}
              <Section title="Choose Template" icon={Star}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TEMPLATES.map((t, idx) => (
                    <button key={t.id} onClick={() => setSelectedTemplate(t.id)} className={`relative p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${selectedTemplate===t.id ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm scale-[1.02]" : "border-border hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800"}`} style={{ animationDelay:`${idx*80}ms` }}>
                      {selectedTemplate===t.id && <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-lg mb-2 shadow-sm`}>{t.icon}</div>
                      <p className="font-bold text-xs sm:text-sm mb-0.5">{t.name}</p>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight mb-2">{t.desc}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${t.color} text-white`}>{t.badge}</span>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Personal Info */}
              <Section title="Personal Information" icon={User}>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs font-semibold">Full Name *</Label><Input placeholder="Rahul Sharma" value={formData.fullName} onChange={e=>upd("fullName",e.target.value)} className="mt-1 h-9 text-sm" /></div>
                    <div><Label className="text-xs font-semibold">Job Title</Label><Input placeholder="Software Engineer" value={formData.jobTitle} onChange={e=>upd("jobTitle",e.target.value)} className="mt-1 h-9 text-sm" /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs font-semibold flex items-center gap-1"><Mail className="w-3 h-3" />Email *</Label><Input type="email" placeholder="you@email.com" value={formData.email} onChange={e=>upd("email",e.target.value)} className="mt-1 h-9 text-sm" /></div>
                    <div><Label className="text-xs font-semibold flex items-center gap-1"><Phone className="w-3 h-3" />Phone</Label><Input placeholder="+91 98765 43210" value={formData.phone} onChange={e=>upd("phone",e.target.value)} className="mt-1 h-9 text-sm" /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs font-semibold flex items-center gap-1"><MapPin className="w-3 h-3" />Location</Label><Input placeholder="Noida, UP" value={formData.location} onChange={e=>upd("location",e.target.value)} className="mt-1 h-9 text-sm" /></div>
                    <div><Label className="text-xs font-semibold flex items-center gap-1"><Globe className="w-3 h-3" />LinkedIn</Label><Input placeholder="linkedin.com/in/rahul" value={formData.linkedin} onChange={e=>upd("linkedin",e.target.value)} className="mt-1 h-9 text-sm" /></div>
                  </div>
                </div>
              </Section>

              {/* Summary */}
              <Section title="Professional Summary" icon={FileText}>
                <Textarea placeholder="Brief 2-3 line summary of your background, skills, and career goals..." value={formData.summary} onChange={e=>upd("summary",e.target.value)} rows={4} className="text-sm resize-none" />
              </Section>

              {/* Experience */}
              <Section title="Work Experience" icon={Briefcase} action={
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 shrink-0" onClick={() => setFormData(p=>({...p,experience:[...p.experience,{company:"",position:"",duration:"",description:""}]}))}>
                  <Plus className="w-3 h-3" />Add
                </Button>
              }>
                <div className="space-y-4">
                  {formData.experience.map((exp, i) => (
                    <div key={i} className={`space-y-2.5 relative ${i > 0 ? "pt-4 border-t border-dashed border-gray-200 dark:border-gray-700" : ""}`}>
                      {formData.experience.length > 1 && (
                        <button onClick={() => setFormData(p=>({...p,experience:p.experience.filter((_,j)=>j!==i)}))} className="absolute top-4 right-0 text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div><Label className="text-xs">Company</Label><Input placeholder="TCS Digital" value={exp.company} onChange={e=>updExp(i,"company",e.target.value)} className="mt-1 h-8 text-xs" /></div>
                        <div><Label className="text-xs">Position</Label><Input placeholder="Software Engineer" value={exp.position} onChange={e=>updExp(i,"position",e.target.value)} className="mt-1 h-8 text-xs" /></div>
                      </div>
                      <div><Label className="text-xs">Duration</Label><Input placeholder="Jan 2022 - Present" value={exp.duration} onChange={e=>updExp(i,"duration",e.target.value)} className="mt-1 h-8 text-xs" /></div>
                      <div><Label className="text-xs">Description</Label><Textarea placeholder="Key responsibilities and achievements..." value={exp.description} onChange={e=>updExp(i,"description",e.target.value)} rows={3} className="mt-1 text-xs resize-none" /></div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Education */}
              <Section title="Education" icon={GraduationCap} action={
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 shrink-0" onClick={() => setFormData(p=>({...p,education:[...p.education,{institution:"",degree:"",year:"",grade:""}]}))}>
                  <Plus className="w-3 h-3" />Add
                </Button>
              }>
                <div className="space-y-3">
                  {formData.education.map((edu, i) => (
                    <div key={i} className={`space-y-2 relative ${i > 0 ? "pt-3 border-t border-dashed border-gray-200 dark:border-gray-700" : ""}`}>
                      {formData.education.length > 1 && (
                        <button onClick={() => setFormData(p=>({...p,education:p.education.filter((_,j)=>j!==i)}))} className="absolute top-3 right-0 text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div><Label className="text-xs">Institution</Label><Input placeholder="Delhi University" value={edu.institution} onChange={e=>updEdu(i,"institution",e.target.value)} className="mt-1 h-8 text-xs" /></div>
                        <div><Label className="text-xs">Degree</Label><Input placeholder="B.Tech Computer Science" value={edu.degree} onChange={e=>updEdu(i,"degree",e.target.value)} className="mt-1 h-8 text-xs" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label className="text-xs">Year</Label><Input placeholder="2018 - 2022" value={edu.year} onChange={e=>updEdu(i,"year",e.target.value)} className="mt-1 h-8 text-xs" /></div>
                        <div><Label className="text-xs">Grade/CGPA</Label><Input placeholder="8.5 CGPA" value={edu.grade} onChange={e=>updEdu(i,"grade",e.target.value)} className="mt-1 h-8 text-xs" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Skills */}
              <Section title="Skills & Additional Info" icon={Award}>
                <div className="space-y-3">
                  <div><Label className="text-xs font-semibold">Technical Skills <span className="text-muted-foreground font-normal">(comma-separated)</span></Label><Textarea placeholder="React, Node.js, Python, SQL, AWS, Docker..." value={formData.skills} onChange={e=>upd("skills",e.target.value)} rows={2} className="mt-1 text-xs resize-none" /></div>
                  <div><Label className="text-xs font-semibold">Certifications</Label><Textarea placeholder="AWS Solutions Architect, Google Analytics..." value={formData.certifications} onChange={e=>upd("certifications",e.target.value)} rows={2} className="mt-1 text-xs resize-none" /></div>
                  <div><Label className="text-xs font-semibold">Languages</Label><Input placeholder="Hindi (Native), English (Professional)" value={formData.languages} onChange={e=>upd("languages",e.target.value)} className="mt-1 h-8 text-xs" /></div>
                </div>
              </Section>

              {/* Download Actions */}
              <div className="flex gap-3">
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 transition-all font-semibold" onClick={downloadPDF}>
                  <Download className="w-4 h-4" />Download PDF
                </Button>
                <Button variant="outline" className="flex-1 gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold" onClick={downloadTXT}>
                  <Download className="w-4 h-4" />TXT/DOC
                </Button>
              </div>
            </div>

            {/* Right — Preview */}
            <div className="lg:sticky lg:top-4 lg:self-start">
              {/* Mobile preview toggle */}
              <button onClick={() => setShowPreview(v=>!v)} className="lg:hidden w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-dashed border-indigo-300 text-indigo-600 font-semibold text-sm mb-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                {showPreview ? <><EyeOff className="w-4 h-4" />Hide Preview</> : <><Eye className="w-4 h-4" />Show Preview</>}
              </button>

              <div className={`${showPreview ? "block" : "hidden lg:block"} preview-anim`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm flex items-center gap-2 text-gray-800 dark:text-gray-200"><Eye className="w-4 h-4 text-indigo-600" />Live Preview</h3>
                  <div className="flex gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${TEMPLATES.find(t=>t.id===selectedTemplate)?.color} text-white`}>
                      {TEMPLATES.find(t=>t.id===selectedTemplate)?.name}
                    </span>
                  </div>
                </div>

                <div id="cv-preview-print" ref={previewRef} className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 sm:p-6 overflow-auto max-h-[70vh] lg:max-h-[calc(100vh-220px)]">
                  <CVPreview template={selectedTemplate} data={formData} />
                </div>

                <div className="flex gap-2 mt-3">
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs font-semibold" size="sm" onClick={downloadPDF}><Download className="w-3.5 h-3.5" />PDF</Button>
                  <Button variant="outline" className="flex-1 gap-1.5 text-xs border-indigo-200 text-indigo-600 font-semibold" size="sm" onClick={downloadTXT}><Download className="w-3.5 h-3.5" />TXT</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ AI GENERATE TAB ══════════════ */}
        {activeTab === "ai-generate" && (
          <div className="space-y-5 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden" style={{ animation:"sectionIn .35s ease both" }}>
              <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-5 sm:p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
                  <div>
                    <h2 className="font-black text-lg">AI Resume Generator</h2>
                    <p className="text-indigo-100 text-sm">Powered by Google Gemini</p>
                  </div>
                </div>
                <p className="text-sm text-indigo-100 mt-2">AI generates a complete resume from your profile. Complete your profile first for best results.</p>
              </div>

              <div className="p-4 sm:p-5">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Choose a template style</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => setSelectedTemplate(t.id)} className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${selectedTemplate===t.id ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm" : "border-border hover:border-indigo-300"}`}>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-xl shadow-sm mb-2.5`}>{t.icon}</div>
                      <p className="font-bold text-sm mb-0.5">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                    </button>
                  ))}
                </div>

                {genError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0" />{genError}
                  </div>
                )}

                <div className="flex gap-3 flex-wrap">
                  <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" onClick={generateResume} disabled={generating}>
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {generating ? "Generating..." : "Generate with AI"}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate("/candidate/profile")}>Complete Profile First</Button>
                </div>
              </div>
            </div>

            {generatedResume && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden" style={{ animation:"sectionIn .35s ease both" }}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-bold text-base">Generated Resume</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => { navigator.clipboard.writeText(generatedResume); setCopied(true); setTimeout(()=>setCopied(false),2000); }}>
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}{copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button size="sm" className="gap-1.5 text-xs" onClick={() => { const blob=new Blob([generatedResume],{type:"text/plain"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`resume-${selectedTemplate}.txt`; a.click(); URL.revokeObjectURL(url); }}>
                      <Download className="w-3.5 h-3.5" />Download
                    </Button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed p-5 bg-gray-50 dark:bg-gray-800/50 max-h-[500px] overflow-y-auto">{generatedResume}</pre>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ ANALYZE TAB ══════════════ */}
        {activeTab === "analyze" && (
          <div className="space-y-5 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden" style={{ animation:"sectionIn .35s ease both" }}>
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Target className="w-5 h-5" /></div>
                  <div>
                    <h2 className="font-black text-lg">ATS Resume Analyzer</h2>
                    <p className="text-emerald-100 text-sm">Get your ATS score, strengths & improvement tips</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                <div>
                  <Label className="font-semibold text-sm">Target Role <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input placeholder="e.g. Senior Software Engineer, Product Manager" value={targetRole} onChange={e=>setTargetRole(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="font-semibold text-sm">Resume Text *</Label>
                  <Textarea placeholder="Paste your full resume text here..." value={resumeText} onChange={e=>setResumeText(e.target.value)} rows={10} className="mt-1.5 font-mono text-xs resize-none" />
                </div>

                {analyzeError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />{analyzeError}
                  </div>
                )}

                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold w-full sm:w-auto" onClick={analyzeResume} disabled={analyzing || !resumeText.trim()}>
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                  {analyzing ? "Analyzing..." : "Analyze My Resume"}
                </Button>
              </div>
            </div>

            {/* Results */}
            {analysis && (
              <div className="space-y-4" style={{ animation:"sectionIn .4s ease both" }}>
                {/* Score card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-5 sm:p-6">
                  <div className="flex items-center gap-5 flex-wrap">
                    <div className="score-anim">
                      <ScoreRing score={analysis.score} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xl font-black text-gray-800 dark:text-gray-200">Resume Score</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${analysis.score>=80 ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : analysis.score>=60 ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
                          {analysis.atsRating} ATS
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${analysis.score>=80 ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : analysis.score>=60 ? "bg-gradient-to-r from-amber-400 to-amber-600" : "bg-gradient-to-r from-red-400 to-red-600"}`} style={{ width:`${analysis.score}%` }} />
                      </div>
                      <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                    </div>
                  </div>
                </div>

                {/* Breakdown cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { title:"Strengths", items:analysis.strengths, icon:Star, color:"emerald", dotColor:"bg-emerald-500", bg:"from-emerald-50 to-emerald-50/0 dark:from-emerald-900/20" },
                    { title:"Improvements", items:analysis.improvements, icon:TrendingUp, color:"amber", dotColor:"bg-amber-500", bg:"from-amber-50 to-amber-50/0 dark:from-amber-900/20" },
                    { title:"Suggestions", items:analysis.suggestions, icon:Sparkles, color:"indigo", dotColor:"bg-indigo-500", bg:"from-indigo-50 to-indigo-50/0 dark:from-indigo-900/20" },
                  ].map(({ title, items, icon:Icon, color, dotColor, bg }, i) => (
                    <div key={title} className={`bg-gradient-to-b ${bg} border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm`} style={{ animation:`sectionIn .4s ease ${i*100}ms both` }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className={`w-4 h-4 text-${color}-500`} />
                        <h3 className={`font-bold text-sm text-${color}-700 dark:text-${color}-400`}>{title}</h3>
                      </div>
                      <ul className="space-y-2">
                        {(items||[]).map((s,j) => (
                          <li key={j} className="text-xs flex items-start gap-2 text-gray-700 dark:text-gray-300">
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-1.5 shrink-0`} />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
