import { useState, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  FileText, Sparkles, Download, Copy, Check, AlertCircle,
  Loader2, Target, TrendingUp, Star, Plus, Trash2, Eye
} from "lucide-react";

const TEMPLATES = [
  { id: "professional", name: "Professional", description: "Clean corporate layout, ideal for traditional industries", icon: "💼", badge: "Most Popular", badgeColor: "bg-blue-50 border-blue-200 text-blue-700" },
  { id: "ats", name: "ATS-Friendly", description: "Keyword-rich, optimized for applicant tracking systems", icon: "🎯", badge: "Best for MNCs", badgeColor: "bg-green-50 border-green-200 text-green-700" },
  { id: "creative", name: "Creative", description: "Bold design that showcases your personality and creativity", icon: "🎨", badge: "For Creative Roles", badgeColor: "bg-purple-50 border-purple-200 text-purple-700" },
];

const defaultForm = {
  fullName: "", jobTitle: "", email: "", phone: "", location: "", linkedin: "", website: "",
  summary: "",
  experience: [{ company: "", position: "", duration: "", description: "" }],
  education: [{ institution: "", degree: "", year: "", grade: "" }],
  skills: "",
  certifications: "",
  languages: "",
};

function ProfessionalTemplate({ data }) {
  return (
    <div className="font-serif text-gray-900 text-[13px] leading-relaxed">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-3 mb-4">
        <h1 className="text-2xl font-bold tracking-wide text-gray-900">{data.fullName || "Your Name"}</h1>
        {data.jobTitle && <p className="text-gray-600 font-medium mt-0.5">{data.jobTitle}</p>}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>☎ {data.phone}</span>}
          {data.location && <span>📍 {data.location}</span>}
          {data.linkedin && <span>in {data.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Professional Summary</h2>
          <p className="text-gray-700">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience?.some(e => e.company || e.position) && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Work Experience</h2>
          {data.experience.filter(e => e.company || e.position).map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-gray-900">{exp.position}</div>
                  <div className="text-gray-600 font-medium">{exp.company}</div>
                </div>
                <div className="text-gray-500 text-xs shrink-0">{exp.duration}</div>
              </div>
              {exp.description && <p className="text-gray-700 mt-1 text-xs">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education?.some(e => e.institution || e.degree) && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Education</h2>
          {data.education.filter(e => e.institution || e.degree).map((edu, i) => (
            <div key={i} className="flex justify-between items-start mb-2">
              <div>
                <div className="font-bold text-gray-900">{edu.degree}</div>
                <div className="text-gray-600">{edu.institution}</div>
              </div>
              <div className="text-right text-xs text-gray-500">
                <div>{edu.year}</div>
                {edu.grade && <div>{edu.grade}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-1">
            {data.skills.split(",").map((s, i) => (
              <span key={i} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{s.trim()}</span>
            ))}
          </div>
        </div>
      )}

      {data.certifications && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Certifications</h2>
          <p className="text-gray-700">{data.certifications}</p>
        </div>
      )}
    </div>
  );
}

function ATSTemplate({ data }) {
  return (
    <div className="font-sans text-gray-900 text-[13px] leading-relaxed">
      <div className="bg-blue-700 text-white p-4 -mx-1 -mt-1 mb-4 rounded-t">
        <h1 className="text-xl font-bold">{data.fullName || "Your Name"}</h1>
        {data.jobTitle && <p className="text-blue-100 text-sm mt-0.5">{data.jobTitle}</p>}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-blue-100">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
        </div>
      </div>

      {data.summary && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase text-blue-700 border-l-4 border-blue-700 pl-2 mb-2">PROFESSIONAL SUMMARY</h2>
          <p className="text-gray-700 text-xs">{data.summary}</p>
        </div>
      )}

      {data.skills && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase text-blue-700 border-l-4 border-blue-700 pl-2 mb-2">KEY SKILLS</h2>
          <div className="grid grid-cols-3 gap-1">
            {data.skills.split(",").map((s, i) => (
              <span key={i} className="flex items-center gap-1 text-xs text-gray-700">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0" />{s.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.experience?.some(e => e.company || e.position) && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase text-blue-700 border-l-4 border-blue-700 pl-2 mb-2">WORK EXPERIENCE</h2>
          {data.experience.filter(e => e.company || e.position).map((exp, i) => (
            <div key={i} className="mb-3 pl-2">
              <div className="flex justify-between">
                <span className="font-bold text-gray-900 text-xs">{exp.position} | {exp.company}</span>
                <span className="text-gray-500 text-xs">{exp.duration}</span>
              </div>
              {exp.description && <p className="text-gray-700 mt-1 text-xs">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {data.education?.some(e => e.institution || e.degree) && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase text-blue-700 border-l-4 border-blue-700 pl-2 mb-2">EDUCATION</h2>
          {data.education.filter(e => e.institution || e.degree).map((edu, i) => (
            <div key={i} className="flex justify-between mb-2 pl-2">
              <div>
                <div className="font-bold text-xs">{edu.degree}</div>
                <div className="text-gray-600 text-xs">{edu.institution}</div>
              </div>
              <div className="text-xs text-gray-500 text-right">
                <div>{edu.year}</div>
                {edu.grade && <div>{edu.grade}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreativeTemplate({ data }) {
  return (
    <div className="font-sans text-[13px] leading-relaxed flex gap-4">
      {/* Left sidebar */}
      <div className="w-1/3 bg-gradient-to-b from-purple-700 to-indigo-800 text-white p-4 rounded-lg shrink-0">
        <div className="mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mb-3">
            {(data.fullName || "YN").slice(0,2).toUpperCase()}
          </div>
          <h1 className="text-base font-bold leading-tight">{data.fullName || "Your Name"}</h1>
          {data.jobTitle && <p className="text-purple-200 text-xs mt-1">{data.jobTitle}</p>}
        </div>

        <div className="mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-purple-300 mb-2">Contact</h3>
          <div className="space-y-1 text-xs text-purple-100">
            {data.email && <div>{data.email}</div>}
            {data.phone && <div>{data.phone}</div>}
            {data.location && <div>{data.location}</div>}
          </div>
        </div>

        {data.skills && (
          <div className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-purple-300 mb-2">Skills</h3>
            <div className="space-y-1">
              {data.skills.split(",").slice(0, 10).map((s, i) => (
                <div key={i} className="text-xs text-purple-100 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-purple-300 rounded-full" />{s.trim()}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.languages && (
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-purple-300 mb-2">Languages</h3>
            <p className="text-xs text-purple-100">{data.languages}</p>
          </div>
        )}
      </div>

      {/* Right content */}
      <div className="flex-1">
        {data.summary && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-purple-700" /> About Me
            </h2>
            <p className="text-gray-700 text-xs">{data.summary}</p>
          </div>
        )}

        {data.experience?.some(e => e.company || e.position) && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-purple-700" /> Experience
            </h2>
            {data.experience.filter(e => e.company || e.position).map((exp, i) => (
              <div key={i} className="mb-3 pl-3 border-l-2 border-purple-200">
                <div className="font-bold text-xs text-gray-900">{exp.position}</div>
                <div className="text-purple-600 text-xs font-medium">{exp.company} · {exp.duration}</div>
                {exp.description && <p className="text-gray-600 mt-1 text-xs">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {data.education?.some(e => e.institution || e.degree) && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-purple-700" /> Education
            </h2>
            {data.education.filter(e => e.institution || e.degree).map((edu, i) => (
              <div key={i} className="mb-2 pl-3 border-l-2 border-purple-200">
                <div className="font-bold text-xs">{edu.degree}</div>
                <div className="text-gray-600 text-xs">{edu.institution} · {edu.year}</div>
                {edu.grade && <div className="text-xs text-gray-500">{edu.grade}</div>}
              </div>
            ))}
          </div>
        )}

        {data.certifications && (
          <div>
            <h2 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-purple-700" /> Certifications
            </h2>
            <p className="text-gray-700 text-xs">{data.certifications}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CVPreview({ template, data }) {
  if (template === "ats") return <ATSTemplate data={data} />;
  if (template === "creative") return <CreativeTemplate data={data} />;
  return <ProfessionalTemplate data={data} />;
}

export default function ResumeBuilder() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("builder");
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [formData, setFormData] = useState(defaultForm);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef(null);

  // AI Generate
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState("");
  const [genError, setGenError] = useState("");
  const [copied, setCopied] = useState(false);

  // Analyze
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzeError, setAnalyzeError] = useState("");

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Sign in required</h2>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const updateExp = (i, field, value) => {
    const exp = [...formData.experience];
    exp[i] = { ...exp[i], [field]: value };
    setFormData(prev => ({ ...prev, experience: exp }));
  };
  const updateEdu = (i, field, value) => {
    const edu = [...formData.education];
    edu[i] = { ...edu[i], [field]: value };
    setFormData(prev => ({ ...prev, education: edu }));
  };

  const downloadPDF = () => {
    const printContent = document.getElementById("cv-preview-print");
    if (!printContent) return;
    const w = window.open("", "_blank");
    w.document.write(`
      <!DOCTYPE html><html><head>
      <title>${formData.fullName || "Resume"} - CV</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #111; background: white; padding: 20px; }
        @media print { body { padding: 0; } @page { margin: 15mm; } }
      </style>
      </head><body>
      ${printContent.innerHTML}
      <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body></html>
    `);
    w.document.close();
  };

  const downloadDOCX = () => {
    const lines = [];
    lines.push(formData.fullName || "Your Name");
    if (formData.jobTitle) lines.push(formData.jobTitle);
    lines.push([formData.email, formData.phone, formData.location].filter(Boolean).join(" | "));
    lines.push("");
    if (formData.summary) { lines.push("PROFESSIONAL SUMMARY"); lines.push(formData.summary); lines.push(""); }
    if (formData.experience?.some(e => e.company)) {
      lines.push("WORK EXPERIENCE");
      formData.experience.filter(e => e.company).forEach(e => {
        lines.push(`${e.position} at ${e.company} (${e.duration})`);
        if (e.description) lines.push(e.description);
        lines.push("");
      });
    }
    if (formData.education?.some(e => e.institution)) {
      lines.push("EDUCATION");
      formData.education.filter(e => e.institution).forEach(e => {
        lines.push(`${e.degree} - ${e.institution} (${e.year}) ${e.grade ? "| " + e.grade : ""}`);
      });
      lines.push("");
    }
    if (formData.skills) { lines.push("SKILLS"); lines.push(formData.skills); lines.push(""); }
    if (formData.certifications) { lines.push("CERTIFICATIONS"); lines.push(formData.certifications); lines.push(""); }
    if (formData.languages) { lines.push("LANGUAGES"); lines.push(formData.languages); }

    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(formData.fullName || "resume").replace(/\s+/g, "_")}_CV.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateResume = async () => {
    setGenerating(true); setGenError(""); setGeneratedResume("");
    try {
      const data = await fetchApi("/ai/resume-generate", { method: "POST", body: JSON.stringify({ template: selectedTemplate }) });
      setGeneratedResume(data.resume);
    } catch (err) { setGenError(err.message); }
    finally { setGenerating(false); }
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) return;
    setAnalyzing(true); setAnalyzeError(""); setAnalysis(null);
    try {
      const data = await fetchApi("/ai/resume-analyze", { method: "POST", body: JSON.stringify({ resumeText, targetRole }) });
      setAnalysis(data);
    } catch (err) { setAnalyzeError(err.message); }
    finally { setAnalyzing(false); }
  };

  const scoreColor = (s) => s >= 80 ? "text-green-600" : s >= 60 ? "text-yellow-600" : "text-red-600";
  const scoreBarColor = (s) => s >= 80 ? "bg-green-500" : s >= 60 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">CV & Resume Builder</h1>
            <p className="text-muted-foreground text-sm">Build, customize, and download your professional resume</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="builder" className="gap-2"><FileText className="w-4 h-4" /> CV Builder</TabsTrigger>
          <TabsTrigger value="ai-generate" className="gap-2"><Sparkles className="w-4 h-4" /> AI Generate</TabsTrigger>
          <TabsTrigger value="analyze" className="gap-2"><Target className="w-4 h-4" /> Analyze</TabsTrigger>
        </TabsList>

        {/* ── CV BUILDER TAB ── */}
        <TabsContent value="builder">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="space-y-5">
              {/* Template Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Choose Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${selectedTemplate === t.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"}`}
                      >
                        <div className="text-xl mb-1">{t.icon}</div>
                        <p className="font-semibold text-xs mb-1">{t.name}</p>
                        <p className="text-[10px] text-muted-foreground">{t.description}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Personal Info */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Personal Information</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Full Name *</Label><Input placeholder="Rahul Sharma" value={formData.fullName} onChange={e => updateField("fullName", e.target.value)} className="mt-1 h-9 text-sm" /></div>
                    <div><Label className="text-xs">Job Title</Label><Input placeholder="Software Engineer" value={formData.jobTitle} onChange={e => updateField("jobTitle", e.target.value)} className="mt-1 h-9 text-sm" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Email *</Label><Input type="email" placeholder="you@email.com" value={formData.email} onChange={e => updateField("email", e.target.value)} className="mt-1 h-9 text-sm" /></div>
                    <div><Label className="text-xs">Phone</Label><Input placeholder="+91 98765 43210" value={formData.phone} onChange={e => updateField("phone", e.target.value)} className="mt-1 h-9 text-sm" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Location</Label><Input placeholder="Noida, UP" value={formData.location} onChange={e => updateField("location", e.target.value)} className="mt-1 h-9 text-sm" /></div>
                    <div><Label className="text-xs">LinkedIn</Label><Input placeholder="linkedin.com/in/rahul" value={formData.linkedin} onChange={e => updateField("linkedin", e.target.value)} className="mt-1 h-9 text-sm" /></div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Professional Summary</CardTitle></CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Brief 2-3 line summary of your professional background, key skills, and career goals..."
                    value={formData.summary}
                    onChange={e => updateField("summary", e.target.value)}
                    rows={4}
                    className="text-sm resize-none"
                  />
                </CardContent>
              </Card>

              {/* Experience */}
              <Card>
                <CardHeader className="pb-3 flex-row items-center justify-between">
                  <CardTitle className="text-sm">Work Experience</CardTitle>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setFormData(p => ({ ...p, experience: [...p.experience, { company: "", position: "", duration: "", description: "" }] }))}>
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.experience.map((exp, i) => (
                    <div key={i} className="space-y-2 relative">
                      {i > 0 && <Separator className="mb-4" />}
                      {formData.experience.length > 1 && (
                        <button onClick={() => setFormData(p => ({ ...p, experience: p.experience.filter((_, j) => j !== i) }))} className="absolute top-0 right-0 text-red-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label className="text-xs">Company</Label><Input placeholder="TCS Digital" value={exp.company} onChange={e => updateExp(i, "company", e.target.value)} className="mt-1 h-8 text-xs" /></div>
                        <div><Label className="text-xs">Position</Label><Input placeholder="Software Engineer" value={exp.position} onChange={e => updateExp(i, "position", e.target.value)} className="mt-1 h-8 text-xs" /></div>
                      </div>
                      <div><Label className="text-xs">Duration</Label><Input placeholder="Jan 2022 - Present" value={exp.duration} onChange={e => updateExp(i, "duration", e.target.value)} className="mt-1 h-8 text-xs" /></div>
                      <div><Label className="text-xs">Description</Label><Textarea placeholder="Describe your responsibilities and achievements..." value={exp.description} onChange={e => updateExp(i, "description", e.target.value)} rows={3} className="mt-1 text-xs resize-none" /></div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader className="pb-3 flex-row items-center justify-between">
                  <CardTitle className="text-sm">Education</CardTitle>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setFormData(p => ({ ...p, education: [...p.education, { institution: "", degree: "", year: "", grade: "" }] }))}>
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formData.education.map((edu, i) => (
                    <div key={i} className="space-y-2 relative">
                      {i > 0 && <Separator className="mb-3" />}
                      {formData.education.length > 1 && (
                        <button onClick={() => setFormData(p => ({ ...p, education: p.education.filter((_, j) => j !== i) }))} className="absolute top-0 right-0 text-red-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label className="text-xs">Institution</Label><Input placeholder="Delhi University" value={edu.institution} onChange={e => updateEdu(i, "institution", e.target.value)} className="mt-1 h-8 text-xs" /></div>
                        <div><Label className="text-xs">Degree</Label><Input placeholder="B.Tech Computer Science" value={edu.degree} onChange={e => updateEdu(i, "degree", e.target.value)} className="mt-1 h-8 text-xs" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label className="text-xs">Year</Label><Input placeholder="2018 - 2022" value={edu.year} onChange={e => updateEdu(i, "year", e.target.value)} className="mt-1 h-8 text-xs" /></div>
                        <div><Label className="text-xs">Grade/CGPA</Label><Input placeholder="8.5 CGPA" value={edu.grade} onChange={e => updateEdu(i, "grade", e.target.value)} className="mt-1 h-8 text-xs" /></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Skills & Others */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Skills & Additional Info</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Technical Skills (comma-separated)</Label>
                    <Textarea placeholder="React, Node.js, Python, SQL, AWS, Docker..." value={formData.skills} onChange={e => updateField("skills", e.target.value)} rows={2} className="mt-1 text-xs resize-none" />
                  </div>
                  <div>
                    <Label className="text-xs">Certifications</Label>
                    <Textarea placeholder="AWS Solutions Architect, Google Analytics Certified..." value={formData.certifications} onChange={e => updateField("certifications", e.target.value)} rows={2} className="mt-1 text-xs resize-none" />
                  </div>
                  <div>
                    <Label className="text-xs">Languages Known</Label>
                    <Input placeholder="Hindi (Native), English (Professional), Tamil (Conversational)" value={formData.languages} onChange={e => updateField("languages", e.target.value)} className="mt-1 h-8 text-xs" />
                  </div>
                </CardContent>
              </Card>

              {/* Download Buttons */}
              <div className="flex gap-3">
                <Button className="flex-1 gap-2" onClick={downloadPDF}>
                  <Download className="w-4 h-4" /> Download PDF
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={downloadDOCX}>
                  <Download className="w-4 h-4" /> Download TXT/DOC
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:sticky lg:top-4 lg:self-start">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2"><Eye className="w-4 h-4 text-primary" /> Live Preview</h3>
                <Badge variant="outline" className="text-xs capitalize">{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</Badge>
              </div>
              <div id="cv-preview-print" className="bg-white border rounded-xl shadow-sm p-6 overflow-auto max-h-[800px]" ref={previewRef}>
                <CVPreview template={selectedTemplate} data={formData} />
              </div>
              <div className="flex gap-2 mt-3">
                <Button className="flex-1 gap-2" onClick={downloadPDF} size="sm">
                  <Download className="w-3.5 h-3.5" /> PDF
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={downloadDOCX} size="sm">
                  <Download className="w-3.5 h-3.5" /> TXT/DOC
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── AI GENERATE TAB ── */}
        <TabsContent value="ai-generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> AI Resume Generator</CardTitle>
              <CardDescription>Gemini AI generates a complete resume from your profile. Complete your profile for best results.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${selectedTemplate === t.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}
                  >
                    <div className="text-2xl mb-2">{t.icon}</div>
                    <p className="font-semibold text-sm mb-1">{t.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{t.description}</p>
                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${t.badgeColor}`}>{t.badge}</Badge>
                  </button>
                ))}
              </div>
              {genError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />{genError}
                </div>
              )}
              <div className="flex gap-3">
                <Button className="gap-2" onClick={generateResume} disabled={generating}>
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generating ? "Generating..." : "Generate with AI"}
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate("/candidate/profile")}>
                  Complete Profile First
                </Button>
              </div>
            </CardContent>
          </Card>

          {generatedResume && (
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Generated Resume</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(generatedResume); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button size="sm" className="gap-1.5" onClick={() => { const blob = new Blob([generatedResume], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `resume-${selectedTemplate}.txt`; a.click(); URL.revokeObjectURL(url); }}>
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed p-4 rounded-lg bg-muted/50 border max-h-[500px] overflow-y-auto">
                  {generatedResume}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── ANALYZE TAB ── */}
        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> ATS Resume Analyzer</CardTitle>
              <CardDescription>Paste your resume to get ATS score, strengths, and improvement tips.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Target Role (optional)</Label>
                <Input placeholder="e.g. Senior Software Engineer, Product Manager..." value={targetRole} onChange={e => setTargetRole(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Resume Text</Label>
                <Textarea placeholder="Paste your resume content here..." value={resumeText} onChange={e => setResumeText(e.target.value)} rows={10} className="font-mono text-xs resize-none" />
              </div>
              {analyzeError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />{analyzeError}
                </div>
              )}
              <Button className="gap-2" onClick={analyzeResume} disabled={analyzing || !resumeText.trim()}>
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                {analyzing ? "Analyzing..." : "Analyze Resume"}
              </Button>
            </CardContent>
          </Card>

          {analysis && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${scoreColor(analysis.score)}`}>{analysis.score}</div>
                      <div className="text-xs text-muted-foreground mt-1">out of 100</div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Overall Score</span>
                          <Badge variant="outline" className="text-xs">{analysis.atsRating} ATS</Badge>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${scoreBarColor(analysis.score)}`} style={{ width: `${analysis.score}%` }} />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "Strengths", items: analysis.strengths, Icon: Star, color: "text-green-500", dot: "bg-green-500" },
                  { title: "Improve", items: analysis.improvements, Icon: TrendingUp, color: "text-yellow-500", dot: "bg-yellow-500" },
                  { title: "Suggestions", items: analysis.suggestions, Icon: Sparkles, color: "text-blue-500", dot: "bg-blue-500" },
                ].map(({ title, items, Icon, color, dot }) => (
                  <Card key={title}>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Icon className={`w-4 h-4 ${color}`} /> {title}</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-1.5">
                        {(items || []).map((s, i) => (
                          <li key={i} className="text-xs flex items-start gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${dot} mt-1.5 shrink-0`} />{s}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
