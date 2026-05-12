import { useState, useRef, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Sparkles, Download, Check, Loader2, Target, Plus, Trash2,
  User, Briefcase, GraduationCap, Award, Globe, Phone, Mail, MapPin,
  ChevronRight, ChevronLeft, ArrowRight, Zap, RefreshCw, Eye, Edit3,
  Star, CheckCircle, SkipForward, Rocket, Brain, Palette, AlignLeft,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   TEMPLATES META
═══════════════════════════════════════════════════════ */
const TEMPLATES = [
  {
    id: "professional",
    name: "Professional",
    desc: "Clean corporate layout for traditional industries",
    icon: "💼",
    badge: "Most Popular",
    badgeColor: "#6366f1",
    gradient: "linear-gradient(135deg,#6366f1,#4f46e5)",
    accent: "#6366f1",
    preview: "classic",
  },
  {
    id: "ats",
    name: "ATS-Friendly",
    desc: "Keyword-rich, beats automated tracking systems",
    icon: "🎯",
    badge: "Best for MNCs",
    badgeColor: "#059669",
    gradient: "linear-gradient(135deg,#10b981,#059669)",
    accent: "#10b981",
    preview: "ats",
  },
  {
    id: "creative",
    name: "Creative",
    desc: "Bold sidebar design that showcases personality",
    icon: "🎨",
    badge: "Creative Roles",
    badgeColor: "#7c3aed",
    gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
    accent: "#8b5cf6",
    preview: "creative",
  },
  {
    id: "executive",
    name: "Executive",
    desc: "Minimal, authoritative — ideal for leadership roles",
    icon: "👔",
    badge: "Senior Roles",
    badgeColor: "#b45309",
    gradient: "linear-gradient(135deg,#f59e0b,#b45309)",
    accent: "#f59e0b",
    preview: "executive",
  },
];

/* ═══════════════════════════════════════════════════════
   DEFAULT FORM
═══════════════════════════════════════════════════════ */
const defaultForm = {
  fullName: "", jobTitle: "", email: "", phone: "", location: "", linkedin: "", website: "",
  summary: "",
  experience: [{ company: "", position: "", duration: "", description: "" }],
  education: [{ institution: "", degree: "", year: "", grade: "" }],
  skills: "", certifications: "", languages: "",
};

/* ═══════════════════════════════════════════════════════
   WIZARD STEPS
═══════════════════════════════════════════════════════ */
const WIZARD_STEPS = [
  {
    id: "personal", label: "Personal Info", icon: User, color: "#6366f1",
    question: "Let's start with your basic details",
    subtitle: "These appear at the top of your resume. Skip anything you'd rather leave out.",
  },
  {
    id: "summary", label: "Summary", icon: AlignLeft, color: "#8b5cf6",
    question: "Write a compelling professional summary",
    subtitle: "2-3 sentences about who you are, what you do, and your biggest strengths.",
  },
  {
    id: "experience", label: "Experience", icon: Briefcase, color: "#3b82f6",
    question: "Tell us about your work history",
    subtitle: "Add your jobs, internships, or freelance projects. Skip if you're a fresher.",
  },
  {
    id: "education", label: "Education", icon: GraduationCap, color: "#10b981",
    question: "Where did you study?",
    subtitle: "Add your degrees, diplomas, or courses.",
  },
  {
    id: "skills", label: "Skills", icon: Award, color: "#f59e0b",
    question: "What are your top skills?",
    subtitle: "Add your technical and soft skills. These help beat ATS filters.",
  },
  {
    id: "extras", label: "Extras", icon: Star, color: "#ec4899",
    question: "Any certifications, languages or links?",
    subtitle: "Optional but adds great value to your resume.",
  },
];

/* ═══════════════════════════════════════════════════════
   RESUME TEMPLATE COMPONENTS
═══════════════════════════════════════════════════════ */
function ProfessionalTemplate({ data, mini = false }) {
  const s = mini ? "text-[7px]" : "text-[12.5px]";
  const h1s = mini ? "text-[11px]" : "text-[22px]";
  const hs = mini ? "text-[6px]" : "text-[10px]";
  const ts = mini ? "text-[7px]" : "text-[11px]";
  return (
    <div className={`font-serif text-gray-900 ${s} leading-relaxed bg-white h-full`}>
      <div className="border-b-[2px] border-gray-800 pb-2 mb-3">
        <h1 className={`${h1s} font-bold tracking-wide`}>{data.fullName || "Your Name"}</h1>
        {data.jobTitle && <p className={`text-gray-600 font-medium mt-0.5 ${ts}`}>{data.jobTitle}</p>}
        <div className={`flex flex-wrap gap-2 mt-1.5 ${ts} text-gray-600`}>
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>☎ {data.phone}</span>}
          {data.location && <span>📍 {data.location}</span>}
          {data.linkedin && <span>🔗 {data.linkedin}</span>}
        </div>
      </div>
      {data.summary && <div className="mb-3"><h2 className={`${hs} font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-0.5 mb-1.5`}>Professional Summary</h2><p className="text-gray-700">{data.summary}</p></div>}
      {data.experience?.some(e => e.company || e.position) && (
        <div className="mb-3">
          <h2 className={`${hs} font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-0.5 mb-1.5`}>Work Experience</h2>
          {data.experience.filter(e => e.company || e.position).map((exp, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between items-start">
                <div><div className="font-bold">{exp.position}</div><div className="text-gray-600">{exp.company}</div></div>
                <div className={`text-gray-500 ${ts} shrink-0 ml-2`}>{exp.duration}</div>
              </div>
              {exp.description && <p className={`text-gray-700 mt-0.5 ${ts}`}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      {data.education?.some(e => e.institution || e.degree) && (
        <div className="mb-3">
          <h2 className={`${hs} font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-0.5 mb-1.5`}>Education</h2>
          {data.education.filter(e => e.institution || e.degree).map((edu, i) => (
            <div key={i} className="flex justify-between mb-1.5">
              <div><div className="font-bold">{edu.degree}</div><div className="text-gray-600">{edu.institution}</div></div>
              <div className={`text-right ${ts} text-gray-500`}><div>{edu.year}</div>{edu.grade && <div>{edu.grade}</div>}</div>
            </div>
          ))}
        </div>
      )}
      {data.skills && <div className="mb-3"><h2 className={`${hs} font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-0.5 mb-1.5`}>Skills</h2><div className="flex flex-wrap gap-1">{data.skills.split(",").filter(Boolean).map((s, i) => <span key={i} className={`bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded ${ts}`}>{s.trim()}</span>)}</div></div>}
      {data.certifications && <div className="mb-2"><h2 className={`${hs} font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-0.5 mb-1.5`}>Certifications</h2><p>{data.certifications}</p></div>}
      {data.languages && <div><h2 className={`${hs} font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-0.5 mb-1.5`}>Languages</h2><p>{data.languages}</p></div>}
    </div>
  );
}

function ATSTemplate({ data, mini = false }) {
  const ts = mini ? "text-[7px]" : "text-[11px]";
  const h1s = mini ? "text-[11px]" : "text-[20px]";
  const hs = mini ? "text-[6px]" : "text-[10px]";
  return (
    <div className={`font-sans text-gray-900 ${ts} leading-relaxed bg-white h-full`}>
      <div className="bg-emerald-700 text-white p-3 mb-3 rounded-t">
        <h1 className={`${h1s} font-bold`}>{data.fullName || "Your Name"}</h1>
        {data.jobTitle && <p className={`text-emerald-100 ${ts} mt-0.5`}>{data.jobTitle}</p>}
        <div className={`flex flex-wrap gap-2 mt-1 ${ts} text-emerald-100`}>
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
        </div>
      </div>
      {data.summary && <div className="mb-3 px-1"><h2 className={`${hs} font-bold uppercase text-emerald-700 border-l-4 border-emerald-700 pl-2 mb-1.5`}>PROFESSIONAL SUMMARY</h2><p className="text-gray-700">{data.summary}</p></div>}
      {data.skills && <div className="mb-3 px-1"><h2 className={`${hs} font-bold uppercase text-emerald-700 border-l-4 border-emerald-700 pl-2 mb-1.5`}>KEY SKILLS</h2><div className="grid grid-cols-3 gap-1">{data.skills.split(",").filter(Boolean).map((s, i) => <span key={i} className="flex items-center gap-1 text-gray-700"><span className="w-1.5 h-1.5 bg-emerald-600 rounded-full shrink-0" />{s.trim()}</span>)}</div></div>}
      {data.experience?.some(e => e.company || e.position) && (
        <div className="mb-3 px-1">
          <h2 className={`${hs} font-bold uppercase text-emerald-700 border-l-4 border-emerald-700 pl-2 mb-1.5`}>WORK EXPERIENCE</h2>
          {data.experience.filter(e => e.company || e.position).map((exp, i) => (
            <div key={i} className="mb-2 pl-2">
              <div className="flex justify-between"><span className="font-bold">{exp.position} | {exp.company}</span><span className="text-gray-500">{exp.duration}</span></div>
              {exp.description && <p className="text-gray-700 mt-0.5">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      {data.education?.some(e => e.institution || e.degree) && (
        <div className="mb-3 px-1">
          <h2 className={`${hs} font-bold uppercase text-emerald-700 border-l-4 border-emerald-700 pl-2 mb-1.5`}>EDUCATION</h2>
          {data.education.filter(e => e.institution || e.degree).map((edu, i) => (
            <div key={i} className="flex justify-between mb-1.5 pl-2"><div><div className="font-bold">{edu.degree}</div><div className="text-gray-600">{edu.institution}</div></div><div className={`${ts} text-gray-500 text-right`}><div>{edu.year}</div>{edu.grade && <div>{edu.grade}</div>}</div></div>
          ))}
        </div>
      )}
      {data.languages && <div className="px-1"><h2 className={`${hs} font-bold uppercase text-emerald-700 border-l-4 border-emerald-700 pl-2 mb-1.5`}>LANGUAGES</h2><p>{data.languages}</p></div>}
    </div>
  );
}

function CreativeTemplate({ data, mini = false }) {
  const ts = mini ? "text-[7px]" : "text-[11px]";
  const h1s = mini ? "text-[10px]" : "text-[15px]";
  const hs = mini ? "text-[5px]" : "text-[9px]";
  const h2s = mini ? "text-[8px]" : "text-[12px]";
  return (
    <div className={`font-sans ${ts} leading-relaxed flex gap-3 bg-white h-full`}>
      <div className="w-[36%] bg-gradient-to-b from-violet-700 to-indigo-800 text-white p-3 rounded-lg shrink-0">
        <div className="mb-4">
          <div className={`${mini ? "w-7 h-7 text-xs" : "w-12 h-12 text-base"} bg-white/20 rounded-full flex items-center justify-center font-bold mb-2`}>
            {(data.fullName || "YN").slice(0, 2).toUpperCase()}
          </div>
          <h1 className={`${h1s} font-bold leading-tight`}>{data.fullName || "Your Name"}</h1>
          {data.jobTitle && <p className={`text-violet-200 ${ts} mt-0.5`}>{data.jobTitle}</p>}
        </div>
        <div className="mb-3"><h3 className={`${hs} font-bold uppercase tracking-widest text-violet-300 mb-1.5`}>Contact</h3><div className="space-y-0.5 text-violet-100">{data.email && <div>{data.email}</div>}{data.phone && <div>{data.phone}</div>}{data.location && <div>{data.location}</div>}</div></div>
        {data.skills && <div className="mb-3"><h3 className={`${hs} font-bold uppercase tracking-widest text-violet-300 mb-1.5`}>Skills</h3><div className="space-y-1">{data.skills.split(",").slice(0, 10).filter(Boolean).map((s, i) => <div key={i} className="text-violet-100 flex items-center gap-1.5"><span className="w-1 h-1 bg-violet-300 rounded-full shrink-0" />{s.trim()}</div>)}</div></div>}
        {data.languages && <div><h3 className={`${hs} font-bold uppercase tracking-widest text-violet-300 mb-1`}>Languages</h3><p className="text-violet-100">{data.languages}</p></div>}
      </div>
      <div className="flex-1 min-w-0 py-1">
        {data.summary && <div className="mb-3"><h2 className={`${h2s} font-bold text-violet-700 mb-1.5 flex items-center gap-1.5`}><span className="w-4 h-0.5 bg-violet-700 shrink-0" />About Me</h2><p className="text-gray-700">{data.summary}</p></div>}
        {data.experience?.some(e => e.company || e.position) && <div className="mb-3"><h2 className={`${h2s} font-bold text-violet-700 mb-1.5 flex items-center gap-1.5`}><span className="w-4 h-0.5 bg-violet-700 shrink-0" />Experience</h2>{data.experience.filter(e => e.company || e.position).map((exp, i) => <div key={i} className="mb-2 pl-2 border-l-2 border-violet-200"><div className="font-bold">{exp.position}</div><div className="text-violet-600 font-medium">{exp.company}{exp.duration ? ` · ${exp.duration}` : ""}</div>{exp.description && <p className="text-gray-600 mt-0.5">{exp.description}</p>}</div>)}</div>}
        {data.education?.some(e => e.institution || e.degree) && <div className="mb-3"><h2 className={`${h2s} font-bold text-violet-700 mb-1.5 flex items-center gap-1.5`}><span className="w-4 h-0.5 bg-violet-700 shrink-0" />Education</h2>{data.education.filter(e => e.institution || e.degree).map((edu, i) => <div key={i} className="mb-2 pl-2 border-l-2 border-violet-200"><div className="font-bold">{edu.degree}</div><div className="text-gray-600">{edu.institution}{edu.year ? ` · ${edu.year}` : ""}</div>{edu.grade && <div className="text-gray-500">{edu.grade}</div>}</div>)}</div>}
        {data.certifications && <div><h2 className={`${h2s} font-bold text-violet-700 mb-1.5 flex items-center gap-1.5`}><span className="w-4 h-0.5 bg-violet-700 shrink-0" />Certifications</h2><p className="text-gray-700">{data.certifications}</p></div>}
      </div>
    </div>
  );
}

function ExecutiveTemplate({ data, mini = false }) {
  const ts = mini ? "text-[7px]" : "text-[11.5px]";
  const h1s = mini ? "text-[12px]" : "text-[24px]";
  const hs = mini ? "text-[6px]" : "text-[9px]";
  return (
    <div className={`font-sans text-gray-900 ${ts} leading-relaxed bg-white h-full`}>
      <div className="text-center border-b-4 border-amber-600 pb-3 mb-3">
        <h1 className={`${h1s} font-black tracking-[0.15em] uppercase`}>{data.fullName || "YOUR NAME"}</h1>
        {data.jobTitle && <p className={`text-amber-700 font-semibold tracking-widest uppercase ${mini ? "text-[7px]" : "text-[11px]"} mt-1`}>{data.jobTitle}</p>}
        <div className={`flex flex-wrap justify-center gap-3 mt-2 ${ts} text-gray-500`}>
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>|</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>|</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin && <span>|</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
        </div>
      </div>
      {data.summary && <div className="mb-3 text-center"><p className="text-gray-600 italic">{data.summary}</p><div className="w-16 h-0.5 bg-amber-600 mx-auto mt-2" /></div>}
      {data.experience?.some(e => e.company || e.position) && (
        <div className="mb-3">
          <h2 className={`${hs} font-black uppercase tracking-[0.2em] text-amber-700 mb-2`}>Professional Experience</h2>
          {data.experience.filter(e => e.company || e.position).map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline border-b border-gray-200 pb-0.5 mb-1">
                <div><span className="font-black">{exp.position}</span>{exp.company && <span className="text-gray-600"> — {exp.company}</span>}</div>
                <span className="text-gray-500 shrink-0 ml-2">{exp.duration}</span>
              </div>
              {exp.description && <p className="text-gray-700 pl-2">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      {data.skills && (
        <div className="mb-3">
          <h2 className={`${hs} font-black uppercase tracking-[0.2em] text-amber-700 mb-2`}>Core Competencies</h2>
          <div className="flex flex-wrap gap-1.5">{data.skills.split(",").filter(Boolean).map((s, i) => <span key={i} className={`border border-amber-600 text-amber-800 px-2 py-0.5 rounded ${ts}`}>{s.trim()}</span>)}</div>
        </div>
      )}
      {data.education?.some(e => e.institution || e.degree) && (
        <div className="mb-3">
          <h2 className={`${hs} font-black uppercase tracking-[0.2em] text-amber-700 mb-2`}>Education</h2>
          {data.education.filter(e => e.institution || e.degree).map((edu, i) => (
            <div key={i} className="flex justify-between mb-1.5">
              <div><div className="font-bold">{edu.degree}</div><div className="text-gray-600">{edu.institution}</div></div>
              <div className={`text-right ${ts} text-gray-500`}><div>{edu.year}</div>{edu.grade && <div>{edu.grade}</div>}</div>
            </div>
          ))}
        </div>
      )}
      {(data.certifications || data.languages) && (
        <div className="grid grid-cols-2 gap-4">
          {data.certifications && <div><h2 className={`${hs} font-black uppercase tracking-[0.2em] text-amber-700 mb-1.5`}>Certifications</h2><p>{data.certifications}</p></div>}
          {data.languages && <div><h2 className={`${hs} font-black uppercase tracking-[0.2em] text-amber-700 mb-1.5`}>Languages</h2><p>{data.languages}</p></div>}
        </div>
      )}
    </div>
  );
}

function CVPreview({ template, data, mini = false }) {
  if (template === "ats") return <ATSTemplate data={data} mini={mini} />;
  if (template === "creative") return <CreativeTemplate data={data} mini={mini} />;
  if (template === "executive") return <ExecutiveTemplate data={data} mini={mini} />;
  return <ProfessionalTemplate data={data} mini={mini} />;
}

/* ═══════════════════════════════════════════════════════
   MINI TEMPLATE PREVIEW CARD
═══════════════════════════════════════════════════════ */
function TemplatePreviewCard({ template, selected, onSelect }) {
  const sampleData = {
    fullName: "Rahul Sharma", jobTitle: "Software Engineer",
    email: "rahul@email.com", phone: "+91 98765 43210", location: "Noida, UP",
    linkedin: "linkedin.com/in/rahul",
    summary: "Experienced developer with 3 years building scalable web applications.",
    experience: [{ company: "TCS", position: "SDE II", duration: "2022–Present", description: "Built microservices architecture." }, { company: "Infosys", position: "SDE I", duration: "2020–2022", description: "Developed REST APIs." }],
    education: [{ institution: "Delhi University", degree: "B.Tech CS", year: "2020", grade: "8.5 CGPA" }],
    skills: "React, Node.js, Python, AWS, Docker",
    certifications: "AWS Solutions Architect",
    languages: "Hindi, English",
  };

  return (
    <button
      onClick={onSelect}
      className="relative group text-left transition-all duration-300 rounded-2xl overflow-hidden"
      style={{
        border: selected ? `2px solid ${template.accent}` : "2px solid rgba(0,0,0,0.08)",
        transform: selected ? "scale(1.02)" : "scale(1)",
        boxShadow: selected ? `0 8px 30px ${template.accent}30` : "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Template miniature preview */}
      <div className="relative bg-white overflow-hidden" style={{ height: "180px", padding: "10px" }}>
        <div style={{ transform: "scale(0.52)", transformOrigin: "top left", width: "192%", height: "192%" }}>
          <CVPreview template={template.id} data={sampleData} mini />
        </div>
        {/* Overlay gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background: "linear-gradient(to bottom,transparent,rgba(255,255,255,0.95))" }} />
      </div>

      {/* Card info */}
      <div className="p-3 border-t border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-sm text-gray-900">{template.name}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{template.desc}</div>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white ml-2 shrink-0"
            style={{ background: template.gradient }}>
            {template.badge}
          </span>
        </div>
      </div>

      {/* Selected tick */}
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: template.accent }}>
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   WIZARD STEP COMPONENT
═══════════════════════════════════════════════════════ */
function StepProgress({ steps, currentStep, skipped }) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        const isSkipped = skipped.includes(step.id);
        return (
          <div key={step.id} className="flex items-center">
            <div
              className="flex items-center justify-center rounded-full transition-all duration-300"
              style={{
                width: isActive ? "32px" : "24px",
                height: isActive ? "32px" : "24px",
                background: isDone || isSkipped ? (isSkipped ? "#d1d5db" : step.color) : isActive ? step.color : "#e5e7eb",
                opacity: isSkipped ? 0.5 : 1,
              }}
            >
              {isDone && !isSkipped ? (
                <Check className="w-3 h-3 text-white" />
              ) : (
                <Icon className={`text-white ${isActive ? "w-4 h-4" : "w-3 h-3"}`}
                  style={{ color: isActive || isDone ? "white" : "#9ca3af" }} />
              )}
            </div>
            {i < steps.length - 1 && (
              <div className="h-0.5 mx-1 transition-all duration-300"
                style={{ width: "16px", background: i < currentStep ? "#6366f1" : "#e5e7eb" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PERSONAL INFO STEP
═══════════════════════════════════════════════════════ */
function PersonalStep({ form, setForm }) {
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const fields = [
    { key: "fullName", label: "Full Name", placeholder: "e.g. Rahul Sharma", required: true, icon: User },
    { key: "jobTitle", label: "Job Title / Headline", placeholder: "e.g. Software Engineer", icon: Briefcase },
    { key: "email", label: "Email", placeholder: "you@email.com", required: true, icon: Mail },
    { key: "phone", label: "Phone", placeholder: "+91 98765 43210", icon: Phone },
    { key: "location", label: "Location", placeholder: "Noida, Delhi NCR", icon: MapPin },
    { key: "linkedin", label: "LinkedIn URL", placeholder: "linkedin.com/in/yourname", icon: Globe },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map(({ key, label, placeholder, required, icon: Icon }) => (
        <div key={key}>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 text-indigo-400" />
            {label} {required && <span className="text-red-400">*</span>}
          </label>
          <input
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
            placeholder={placeholder}
            value={form[key]}
            onChange={e => upd(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SUMMARY STEP
═══════════════════════════════════════════════════════ */
function SummaryStep({ form, setForm }) {
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="space-y-3">
      <textarea
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all resize-none leading-relaxed"
        placeholder="e.g. Results-driven Full Stack Developer with 3+ years of experience building scalable web applications. Proficient in React, Node.js, and cloud technologies. Passionate about clean code and delivering impactful user experiences."
        value={form.summary}
        onChange={e => upd("summary", e.target.value)}
        rows={5}
      />
      <div className="flex flex-wrap gap-2">
        {["3+ years experience", "team player", "results-driven", "passionate about", "skilled in"].map(t => (
          <button key={t} onClick={() => upd("summary", (form.summary ? form.summary + " " : "") + t)}
            className="text-xs px-3 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-200 hover:bg-violet-100 transition-colors">
            + {t}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EXPERIENCE STEP
═══════════════════════════════════════════════════════ */
function ExperienceStep({ form, setForm }) {
  const updExp = (i, k, v) => {
    const e = [...form.experience]; e[i] = { ...e[i], [k]: v };
    setForm(p => ({ ...p, experience: e }));
  };
  const addExp = () => setForm(p => ({ ...p, experience: [...p.experience, { company: "", position: "", duration: "", description: "" }] }));
  const removeExp = (i) => setForm(p => ({ ...p, experience: p.experience.filter((_, j) => j !== i) }));

  return (
    <div className="space-y-5">
      {form.experience.map((exp, i) => (
        <div key={i} className="relative p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
          {form.experience.length > 1 && (
            <button onClick={() => removeExp(i)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="text-xs font-bold text-blue-500 uppercase tracking-widest">Position {i + 1}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Company Name</label>
              <input className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                placeholder="e.g. TCS" value={exp.company} onChange={e => updExp(i, "company", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Job Title / Position</label>
              <input className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                placeholder="e.g. Senior Developer" value={exp.position} onChange={e => updExp(i, "position", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Duration</label>
            <input className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              placeholder="e.g. Jan 2022 – Present" value={exp.duration} onChange={e => updExp(i, "duration", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Key Responsibilities & Achievements</label>
            <textarea className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none"
              placeholder="Describe your key achievements, responsibilities, and impact..."
              value={exp.description} onChange={e => updExp(i, "description", e.target.value)} rows={3} />
          </div>
        </div>
      ))}
      <button onClick={addExp}
        className="w-full py-3 rounded-xl border-2 border-dashed border-blue-200 text-blue-500 text-sm font-semibold hover:bg-blue-50 flex items-center justify-center gap-2 transition-all">
        <Plus className="w-4 h-4" /> Add Another Position
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EDUCATION STEP
═══════════════════════════════════════════════════════ */
function EducationStep({ form, setForm }) {
  const updEdu = (i, k, v) => {
    const e = [...form.education]; e[i] = { ...e[i], [k]: v };
    setForm(p => ({ ...p, education: e }));
  };
  const addEdu = () => setForm(p => ({ ...p, education: [...p.education, { institution: "", degree: "", year: "", grade: "" }] }));
  const removeEdu = (i) => setForm(p => ({ ...p, education: p.education.filter((_, j) => j !== i) }));

  return (
    <div className="space-y-5">
      {form.education.map((edu, i) => (
        <div key={i} className="relative p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
          {form.education.length > 1 && (
            <button onClick={() => removeEdu(i)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Qualification {i + 1}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">College / University</label>
              <input className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
                placeholder="e.g. Delhi University" value={edu.institution} onChange={e => updEdu(i, "institution", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Degree / Course</label>
              <input className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
                placeholder="e.g. B.Tech Computer Science" value={edu.degree} onChange={e => updEdu(i, "degree", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Year</label>
              <input className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
                placeholder="2020 – 2024" value={edu.year} onChange={e => updEdu(i, "year", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Grade / CGPA</label>
              <input className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
                placeholder="8.5 CGPA" value={edu.grade} onChange={e => updEdu(i, "grade", e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button onClick={addEdu}
        className="w-full py-3 rounded-xl border-2 border-dashed border-emerald-200 text-emerald-500 text-sm font-semibold hover:bg-emerald-50 flex items-center justify-center gap-2 transition-all">
        <Plus className="w-4 h-4" /> Add Another Qualification
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SKILLS STEP
═══════════════════════════════════════════════════════ */
function SkillsStep({ form, setForm }) {
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const suggestedSkills = ["React", "Node.js", "Python", "Java", "SQL", "AWS", "Docker", "Git", "TypeScript", "MongoDB", "Machine Learning", "Excel", "Communication", "Leadership"];
  const currentSkills = form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
  const toggleSkill = (skill) => {
    if (currentSkills.includes(skill)) {
      upd("skills", currentSkills.filter(s => s !== skill).join(", "));
    } else {
      upd("skills", [...currentSkills, skill].join(", "));
    }
  };
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Your Skills <span className="text-xs font-normal text-gray-400">(comma-separated)</span></label>
        <textarea
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100 transition-all resize-none"
          placeholder="React, Node.js, Python, AWS, Team Leadership, Communication..."
          value={form.skills}
          onChange={e => upd("skills", e.target.value)}
          rows={3}
        />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Quick Add Popular Skills:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedSkills.map(skill => {
            const added = currentSkills.includes(skill);
            return (
              <button key={skill} onClick={() => toggleSkill(skill)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all duration-200 font-medium"
                style={{
                  background: added ? "#f59e0b" : "#fef3c7",
                  borderColor: added ? "#d97706" : "#fde68a",
                  color: added ? "white" : "#92400e",
                }}>
                {added ? <span className="flex items-center gap-1"><Check className="w-2.5 h-2.5" />{skill}</span> : `+ ${skill}`}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EXTRAS STEP
═══════════════════════════════════════════════════════ */
function ExtrasStep({ form, setForm }) {
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-pink-400" /> Certifications
        </label>
        <input className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all"
          placeholder="AWS Solutions Architect, Google Cloud, PMP..."
          value={form.certifications} onChange={e => upd("certifications", e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-pink-400" /> Languages Known
        </label>
        <input className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all"
          placeholder="Hindi (Native), English (Professional), French (Basic)..."
          value={form.languages} onChange={e => upd("languages", e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-pink-400" /> Website / Portfolio
        </label>
        <input className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all"
          placeholder="yourportfolio.com"
          value={form.website} onChange={e => upd("website", e.target.value)} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function ResumeBuilder() {
  const { user } = useAuth();

  /* ── Phase: welcome | template | wizard | preview ── */
  const [phase, setPhase] = useState("welcome");
  const [startMode, setStartMode] = useState(null); // "fresh" | "existing" | "ai"
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [wizardStep, setWizardStep] = useState(0);
  const [skippedSteps, setSkippedSteps] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [loadingProfile, setLoadingProfile] = useState(false);

  /* AI improve */
  const [improving, setImproving] = useState(false);
  const [improveError, setImproveError] = useState("");
  const [improveSuccess, setImproveSuccess] = useState(false);

  const improveResume = async () => {
    setImproving(true); setImproveError(""); setImproveSuccess(false);
    try {
      const result = await fetchApi("/ai/resume-improve", {
        method: "POST",
        body: JSON.stringify({
          fullName: formData.fullName,
          jobTitle: formData.jobTitle,
          summary: formData.summary,
          experience: formData.experience,
          skills: formData.skills,
        }),
      });
      setFormData(prev => ({
        ...prev,
        summary: result.summary || prev.summary,
        jobTitle: result.jobTitle || prev.jobTitle,
        experience: prev.experience.map((exp, i) => ({
          ...exp,
          description: result.experience?.[i]?.description || exp.description,
        })),
      }));
      setImproveSuccess(true);
      setTimeout(() => setImproveSuccess(false), 4000);
    } catch (err) {
      setImproveError(err.message || "AI improve failed. Please try again.");
    } finally {
      setImproving(false);
    }
  };

  /* AI analyze */
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzeError, setAnalyzeError] = useState("");
  const [activeMainTab, setActiveMainTab] = useState("builder"); // "builder" | "analyze"

  /* Download */
  const previewRef = useRef(null);

  /* Load profile data */
  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const profile = await fetchApi("/candidates/profile");
      setFormData(prev => ({
        ...prev,
        fullName: profile.name || prev.fullName,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
        location: profile.location || prev.location,
        jobTitle: profile.currentTitle || prev.jobTitle,
        summary: profile.bio || prev.summary,
        skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : (profile.skills || prev.skills),
        education: (profile.education && profile.education.length)
          ? profile.education.map(e => ({ institution: e.school || e.institution || "", degree: e.degree || "", year: e.year || "", grade: e.grade || "" }))
          : prev.education,
        experience: (profile.experience && profile.experience.length)
          ? profile.experience.map(e => ({ company: e.company || "", position: e.title || e.position || "", duration: e.duration || e.period || "", description: e.description || "" }))
          : prev.experience,
      }));
    } catch (e) {
      // silently continue
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleStartMode = async (mode) => {
    setStartMode(mode);
    if (mode === "existing") await loadProfile();
    setPhase("template");
  };

  const handleTemplateSelect = () => setPhase("wizard");

  const handleNext = () => {
    if (wizardStep < WIZARD_STEPS.length - 1) setWizardStep(s => s + 1);
    else setPhase("preview");
  };

  const handleBack = () => {
    if (wizardStep > 0) setWizardStep(s => s - 1);
    else setPhase("template");
  };

  const handleSkip = () => {
    const stepId = WIZARD_STEPS[wizardStep].id;
    setSkippedSteps(p => p.includes(stepId) ? p : [...p, stepId]);
    handleNext();
  };

  const downloadPDF = () => {
    const el = document.getElementById("cv-preview-print");
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    const isCreative = selectedTemplate === "creative";

    let cssText = "";
    try {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules || [])) {
            cssText += rule.cssText + "\n";
          }
        } catch (_) {}
      }
    } catch (_) {}

    w.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${formData.fullName || "Resume"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=EB+Garamond:wght@400;600;700&display=swap" rel="stylesheet">
  <style>${cssText}<\/style>
  <style>
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { background: white; margin: 0 auto; max-width: 860px; padding: ${isCreative ? "0" : "32px"}; font-family: Inter, Arial, sans-serif; }
    @media print { @page { margin: 10mm; size: A4; } body { padding: 0; max-width: 100%; } }
  </style>
</head>
<body>
  ${el.innerHTML}
  <script>
    document.fonts.ready.then(function() {
      setTimeout(function() { window.print(); setTimeout(function(){ window.close(); }, 500); }, 400);
    });
  <\/script>
</body>
</html>`);
    w.document.close();
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) return;
    setAnalyzing(true); setAnalyzeError(""); setAnalysis(null);
    try {
      const d = await fetchApi("/ai/resume-analyze", { method: "POST", body: JSON.stringify({ resumeText, targetRole }) });
      setAnalysis(d);
    } catch (err) { setAnalyzeError(err.message); }
    finally { setAnalyzing(false); }
  };

  const currentStepDef = WIZARD_STEPS[wizardStep];

  /* ════════════════════════════
     RENDER
  ════════════════════════════ */
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#f8faff 0%,#f0f4ff 50%,#fdf4ff 100%)" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
        @keyframes slideRight { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        .fade-up { animation: fadeUp .45s cubic-bezier(.34,1.56,.64,1) both; }
        .fade-in { animation: fadeIn .3s ease both; }
        .scale-in { animation: scaleIn .35s cubic-bezier(.34,1.56,.64,1) both; }
        .slide-right { animation: slideRight .35s ease both; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">

        {/* ── Top Tab Bar ── */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">Resume Builder</h1>
            <p className="text-sm text-gray-500">Build, customize & download your professional resume</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActiveMainTab("builder")}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: activeMainTab === "builder" ? "#6366f1" : "white", color: activeMainTab === "builder" ? "white" : "#6b7280", border: "1px solid", borderColor: activeMainTab === "builder" ? "#6366f1" : "#e5e7eb" }}>
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />Builder</span>
            </button>
            <button onClick={() => setActiveMainTab("analyze")}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: activeMainTab === "analyze" ? "#8b5cf6" : "white", color: activeMainTab === "analyze" ? "white" : "#6b7280", border: "1px solid", borderColor: activeMainTab === "analyze" ? "#8b5cf6" : "#e5e7eb" }}>
              <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" />Analyze <span className="text-[9px] bg-white/30 px-1.5 py-0.5 rounded-full font-bold">AI</span></span>
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            ANALYZE TAB
        ════════════════════════════════════════════════ */}
        {activeMainTab === "analyze" && (
          <div className="fade-in max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-violet-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}>
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">AI Resume Analyzer</h2>
                  <p className="text-sm text-gray-500">Get instant ATS score + improvement tips powered by Gemini</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Paste Your Resume Text</label>
                  <Textarea placeholder="Paste your complete resume text here..." value={resumeText} onChange={e => setResumeText(e.target.value)} rows={8} className="resize-none rounded-xl text-sm border-gray-200" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Target Role <span className="font-normal text-gray-400">(Optional)</span></label>
                  <Input placeholder="e.g. Software Engineer, Data Analyst, Product Manager..." value={targetRole} onChange={e => setTargetRole(e.target.value)} className="rounded-xl border-gray-200" />
                </div>
                <button onClick={analyzeResume} disabled={analyzing || !resumeText.trim()}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}>
                  {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing with Gemini AI...</> : <><Sparkles className="w-4 h-4" />Analyze My Resume</>}
                </button>
                {analyzeError && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{analyzeError}</div>}
                {analysis && (
                  <div className="space-y-4 scale-in mt-2">
                    <div className="p-4 rounded-2xl border" style={{ background: "linear-gradient(135deg,#f0f4ff,#faf5ff)", borderColor: "#c4b5fd" }}>
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 shrink-0">
                          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="44" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                            <circle cx="50" cy="50" r="44" fill="none"
                              stroke={analysis.score >= 80 ? "#10b981" : analysis.score >= 60 ? "#f59e0b" : "#ef4444"}
                              strokeWidth="10" strokeDasharray={`${2 * Math.PI * 44}`}
                              strokeDashoffset={`${2 * Math.PI * 44 * (1 - analysis.score / 100)}`}
                              strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s ease" }} />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black" style={{ color: analysis.score >= 80 ? "#10b981" : analysis.score >= 60 ? "#f59e0b" : "#ef4444" }}>{analysis.score}</span>
                            <span className="text-[9px] text-gray-400 font-semibold">/100</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">ATS Score</div>
                          <div className="text-sm text-gray-500 mt-0.5">{analysis.summary || "Analysis complete"}</div>
                        </div>
                      </div>
                    </div>
                    {analysis.improvements?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-2 text-sm">Improvements Suggested:</h3>
                        <ul className="space-y-2">
                          {analysis.improvements.map((imp, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                              <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />{imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.keywords?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-2 text-sm">Missing Keywords:</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords.map((kw, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════
            BUILDER — WELCOME PHASE
        ════════════════════════════════════════════════ */}
        {activeMainTab === "builder" && phase === "welcome" && (
          <div className="max-w-2xl mx-auto fade-up">
            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center shadow-2xl"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                <Rocket className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Create Your Perfect Resume</h2>
              <p className="text-gray-500 text-base max-w-md mx-auto">Choose how you'd like to get started. Our wizard will guide you step by step.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  mode: "fresh", icon: FileText, emoji: "✨",
                  title: "Start Fresh",
                  desc: "Build a new resume from scratch. We'll ask you questions one by one.",
                  gradient: "linear-gradient(135deg,#6366f1,#4f46e5)",
                  glow: "#6366f1",
                  tag: "Recommended",
                },
                {
                  mode: "existing", icon: RefreshCw, emoji: "👤",
                  title: "Use My Profile Data",
                  desc: "Auto-fill from your Recruweb profile. We'll pre-fill what we know.",
                  gradient: "linear-gradient(135deg,#10b981,#059669)",
                  glow: "#10b981",
                  tag: "Fastest",
                  disabled: !user,
                },
                {
                  mode: "ai", icon: Brain, emoji: "🤖",
                  title: "AI-Powered Generation",
                  desc: "Answer a few questions and let Gemini AI write your resume for you.",
                  gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
                  glow: "#8b5cf6",
                  tag: "AI",
                },
              ].map(({ mode, icon: Icon, emoji, title, desc, gradient, glow, tag, disabled }) => (
                <button
                  key={mode}
                  onClick={() => !disabled && handleStartMode(mode)}
                  disabled={disabled}
                  className="w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 group relative overflow-hidden"
                  style={{
                    borderColor: "rgba(99,102,241,0.12)",
                    background: "white",
                    opacity: disabled ? 0.4 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = glow; e.currentTarget.style.boxShadow = `0 8px 30px ${glow}20`; }}}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-lg"
                      style={{ background: gradient }}>
                      {emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-900 text-base">{title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ background: gradient }}>{tag}</span>
                        {mode === "existing" && !user && <span className="text-[10px] text-gray-400">(Login required)</span>}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                  </div>
                  {(loadingProfile && mode === "existing") && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">All your data stays private. No account needed for fresh start.</p>
          </div>
        )}

        {/* ════════════════════════════════════════════════
            BUILDER — TEMPLATE PHASE
        ════════════════════════════════════════════════ */}
        {activeMainTab === "builder" && phase === "template" && (
          <div className="fade-up">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 text-indigo-600 bg-indigo-50 border border-indigo-100">
                <Palette className="w-3.5 h-3.5" /> Step 1 of 3 — Choose Your Template
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">Pick a template that fits you</h2>
              <p className="text-gray-500">Each template is ATS-optimized. You can change this later.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {TEMPLATES.map(t => (
                <TemplatePreviewCard
                  key={t.id}
                  template={t}
                  selected={selectedTemplate === t.id}
                  onSelect={() => setSelectedTemplate(t.id)}
                />
              ))}
            </div>

            <div className="flex items-center justify-between max-w-md mx-auto gap-4">
              <button onClick={() => setPhase("welcome")}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleTemplateSelect}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                style={{ background: TEMPLATES.find(t => t.id === selectedTemplate)?.gradient }}>
                Use {TEMPLATES.find(t => t.id === selectedTemplate)?.name} Template
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════
            BUILDER — WIZARD PHASE
        ════════════════════════════════════════════════ */}
        {activeMainTab === "builder" && phase === "wizard" && (
          <div className="max-w-3xl mx-auto">
            {/* Progress */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">Step {wizardStep + 1} of {WIZARD_STEPS.length}</p>
                <p className="text-sm font-bold text-gray-700">{currentStepDef.label}</p>
              </div>
              <StepProgress steps={WIZARD_STEPS} currentStep={wizardStep} skipped={skippedSteps} />
            </div>

            {/* Step Card */}
            <div key={wizardStep} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden scale-in">
              {/* Header */}
              <div className="p-6 sm:p-8 border-b border-gray-100"
                style={{ background: `linear-gradient(135deg,${currentStepDef.color}12,${currentStepDef.color}05)` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                    style={{ background: `linear-gradient(135deg,${currentStepDef.color},${currentStepDef.color}cc)` }}>
                    <currentStepDef.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-gray-900">{currentStepDef.question}</h2>
                    <p className="text-sm text-gray-500">{currentStepDef.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Step Body */}
              <div className="p-6 sm:p-8">
                {currentStepDef.id === "personal" && <PersonalStep form={formData} setForm={setFormData} />}
                {currentStepDef.id === "summary" && <SummaryStep form={formData} setForm={setFormData} />}
                {currentStepDef.id === "experience" && <ExperienceStep form={formData} setForm={setFormData} />}
                {currentStepDef.id === "education" && <EducationStep form={formData} setForm={setFormData} />}
                {currentStepDef.id === "skills" && <SkillsStep form={formData} setForm={setFormData} />}
                {currentStepDef.id === "extras" && <ExtrasStep form={formData} setForm={setFormData} />}
              </div>

              {/* Footer */}
              <div className="px-6 sm:px-8 pb-6 flex items-center justify-between gap-3">
                <button onClick={handleBack}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-3">
                  {currentStepDef.id !== "personal" && (
                    <button onClick={handleSkip}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all border border-dashed border-gray-200">
                      <SkipForward className="w-3.5 h-3.5" /> Skip
                    </button>
                  )}
                  <button onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                    style={{ background: `linear-gradient(135deg,${currentStepDef.color},${currentStepDef.color}cc)` }}>
                    {wizardStep === WIZARD_STEPS.length - 1 ? <><Eye className="w-4 h-4" />Preview Resume</> : <>Continue <ChevronRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>
            </div>

            {/* Mini preview strip */}
            <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Live Preview</span>
              </div>
              <div className="bg-gray-50 rounded-xl overflow-hidden" style={{ height: "140px", padding: "8px" }}>
                <div style={{ transform: "scale(0.38)", transformOrigin: "top left", width: "263%", height: "263%" }}>
                  <CVPreview template={selectedTemplate} data={formData} mini />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════
            BUILDER — PREVIEW / FINAL PHASE
        ════════════════════════════════════════════════ */}
        {activeMainTab === "builder" && phase === "preview" && (
          <div className="fade-up">
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <button onClick={() => setPhase("wizard")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
                  <ChevronLeft className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => setPhase("template")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
                  <Palette className="w-4 h-4" /> Change Template
                </button>
              </div>
              <div className="sm:ml-auto flex gap-2">
                <button onClick={downloadPDF}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                  style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </div>

            {/* Template switcher */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shrink-0 transition-all border"
                  style={{
                    background: selectedTemplate === t.id ? t.gradient : "white",
                    color: selectedTemplate === t.id ? "white" : "#374151",
                    borderColor: selectedTemplate === t.id ? "transparent" : "#e5e7eb",
                  }}>
                  <span>{t.icon}</span>{t.name}
                  {selectedTemplate === t.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Resume Preview */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{formData.fullName || "Your Resume"}.pdf</span>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                    </span>
                  </div>
                  <div id="cv-preview-print" className="p-8">
                    <CVPreview template={selectedTemplate} data={formData} />
                  </div>
                </div>
              </div>

              {/* Quick Edit Panel */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-indigo-400" /> Quick Edit
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: "fullName", label: "Name", placeholder: "Your full name" },
                      { key: "jobTitle", label: "Headline", placeholder: "Your title" },
                      { key: "email", label: "Email", placeholder: "email@example.com" },
                      { key: "phone", label: "Phone", placeholder: "+91 XXXXX XXXXX" },
                      { key: "location", label: "Location", placeholder: "City, State" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1 block">{label}</label>
                        <input
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                          placeholder={placeholder}
                          value={formData[key]}
                          onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1 block">Summary</label>
                      <textarea
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                        placeholder="Brief professional summary..."
                        value={formData.summary}
                        onChange={e => setFormData(p => ({ ...p, summary: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1 block">Skills</label>
                      <textarea
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                        placeholder="React, Python, AWS..."
                        value={formData.skills}
                        onChange={e => setFormData(p => ({ ...p, skills: e.target.value }))}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* AI Improve Card */}
                <div className="rounded-2xl p-5 border overflow-hidden relative"
                  style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)", borderColor: "rgba(139,92,246,0.3)" }}>
                  {/* Animated glow blob */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-30 blur-2xl pointer-events-none"
                    style={{ background: "radial-gradient(circle,#a78bfa,#7c3aed)" }} />
                  <div className="relative">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}>
                        <Sparkles className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                          AI One-Click Improve
                          <span className="text-[9px] bg-violet-500/40 text-violet-200 px-1.5 py-0.5 rounded-full font-bold border border-violet-400/30">Gemini AI</span>
                        </h3>
                        <p className="text-[11px] text-violet-300">Rewrites summary & experience bullets</p>
                      </div>
                    </div>

                    <p className="text-xs text-violet-200/80 mb-4 leading-relaxed">
                      Gemini AI will rewrite your professional summary and all work experience descriptions using strong action verbs and ATS-optimized language.
                    </p>

                    {improveSuccess && (
                      <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 rounded-xl px-3 py-2 mb-3">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        Resume improved! Check your preview.
                      </div>
                    )}
                    {improveError && (
                      <div className="text-xs text-red-300 bg-red-500/20 border border-red-400/30 rounded-xl px-3 py-2 mb-3">
                        {improveError}
                      </div>
                    )}

                    <button
                      onClick={improveResume}
                      disabled={improving}
                      className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                      style={{
                        background: improving ? "rgba(139,92,246,0.4)" : "linear-gradient(135deg,#8b5cf6,#6d28d9)",
                        boxShadow: improving ? "none" : "0 4px 20px rgba(139,92,246,0.5)",
                        color: "white",
                      }}
                    >
                      {improving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Gemini is rewriting...</>
                      ) : improveSuccess ? (
                        <><CheckCircle className="w-4 h-4" />Improved! Run Again?</>
                      ) : (
                        <><Sparkles className="w-4 h-4" />Improve My Resume</>
                      )}
                    </button>

                    <p className="text-center text-[10px] text-violet-400/70 mt-2">
                      Your original data is preserved — you can edit after
                    </p>
                  </div>
                </div>

                {/* Download Options */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
                    <Download className="w-4 h-4 text-indigo-400" /> Download
                  </h3>
                  <div className="space-y-2">
                    <button onClick={downloadPDF}
                      className="w-full py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                      style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                      <Download className="w-4 h-4" /> Download as PDF
                    </button>
                    <button onClick={() => { setPhase("wizard"); setWizardStep(0); }}
                      className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                      <RefreshCw className="w-4 h-4" /> Start Over
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-black text-gray-800 mb-3">Resume Completeness</h3>
                  {(() => {
                    const checks = [
                      { label: "Name & Contact", done: !!(formData.fullName && formData.email) },
                      { label: "Professional Summary", done: !!formData.summary },
                      { label: "Work Experience", done: formData.experience.some(e => e.company || e.position) },
                      { label: "Education", done: formData.education.some(e => e.institution || e.degree) },
                      { label: "Skills", done: !!formData.skills },
                      { label: "Certifications / Languages", done: !!(formData.certifications || formData.languages) },
                    ];
                    const score = Math.round((checks.filter(c => c.done).length / checks.length) * 100);
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">{score}% Complete</span>
                          <span className="text-xs font-bold" style={{ color: score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444" }}>{score >= 80 ? "Excellent!" : score >= 50 ? "Good" : "Needs Work"}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${score}%`, background: score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444" }} />
                        </div>
                        <div className="space-y-1.5 mt-3">
                          {checks.map(({ label, done }) => (
                            <div key={label} className="flex items-center gap-2 text-xs">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-emerald-100" : "bg-gray-100"}`}>
                                {done ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />}
                              </div>
                              <span className={done ? "text-gray-700" : "text-gray-400"}>{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
