import { useState } from "react";
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
import {
  FileText, Sparkles, Download, Copy, Check, AlertCircle,
  Loader2, Target, TrendingUp, Star
} from "lucide-react";

const TEMPLATES = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Clean, impactful layout with achievement-focused bullet points",
    icon: "✨",
    badge: "Most Popular",
    color: "bg-blue-50 border-blue-200 text-blue-700",
  },
  {
    id: "ats",
    name: "ATS-Friendly",
    description: "Keyword-rich, optimized for applicant tracking systems",
    icon: "🎯",
    badge: "Best for Large Companies",
    color: "bg-green-50 border-green-200 text-green-700",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Compelling narrative that showcases your unique personality",
    icon: "🎨",
    badge: "For Creative Roles",
    color: "bg-purple-50 border-purple-200 text-purple-700",
  },
];

export default function ResumeBuilder() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("generate");

  // Generate
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
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
          <p className="text-muted-foreground">Please log in to use the AI Resume Builder.</p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (user.role !== "candidate") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Resume Builder is available for candidates only.</p>
        </div>
      </div>
    );
  }

  const generateResume = async () => {
    setGenerating(true);
    setGenError("");
    setGeneratedResume("");
    try {
      const data = await fetchApi("/ai/resume-generate", {
        method: "POST",
        body: JSON.stringify({ template: selectedTemplate }),
      });
      setGeneratedResume(data.resume);
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) return;
    setAnalyzing(true);
    setAnalyzeError("");
    setAnalysis(null);
    try {
      const data = await fetchApi("/ai/resume-analyze", {
        method: "POST",
        body: JSON.stringify({ resumeText, targetRole }),
      });
      setAnalysis(data);
    } catch (err) {
      setAnalyzeError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResume = () => {
    const blob = new Blob([generatedResume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${selectedTemplate}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const scoreBarColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Resume Builder</h1>
            <p className="text-muted-foreground text-sm">Generate and analyze resumes with Gemini AI</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="generate" className="gap-2">
            <FileText className="w-4 h-4" /> Generate Resume
          </TabsTrigger>
          <TabsTrigger value="analyze" className="gap-2">
            <Target className="w-4 h-4" /> Analyze Resume
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Choose a Template</CardTitle>
              <CardDescription>AI will generate a complete resume based on your profile using the selected style.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedTemplate === t.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    <div className="text-2xl mb-2">{t.icon}</div>
                    <p className="font-semibold text-sm mb-1">{t.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{t.description}</p>
                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${t.color}`}>
                      {t.badge}
                    </Badge>
                  </button>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-lg bg-muted/40 text-sm text-muted-foreground">
                <strong>Note:</strong> The AI uses your candidate profile to generate the resume.{" "}
                <button onClick={() => navigate("/candidate/profile")} className="text-primary hover:underline font-medium">
                  Complete your profile
                </button>{" "}
                for the best results.
              </div>

              {genError && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {genError}
                </div>
              )}

              <Button className="mt-4 gap-2" onClick={generateResume} disabled={generating}>
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? "Generating..." : "Generate Resume"}
              </Button>
            </CardContent>
          </Card>

          {generatedResume && (
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">Generated Resume</CardTitle>
                  <CardDescription className="text-xs mt-0.5 capitalize">
                    {TEMPLATES.find(t => t.id === selectedTemplate)?.name} template
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={copyToClipboard}>
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button size="sm" className="gap-1.5" onClick={downloadResume}>
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

        {/* Analyze Tab */}
        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Analyze Your Resume</CardTitle>
              <CardDescription>Paste your resume text to get an ATS score, strengths, and improvement suggestions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Target Role (optional)</Label>
                <Input
                  placeholder="e.g. Senior Software Engineer, Product Manager..."
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Resume Text</Label>
                <Textarea
                  placeholder="Paste your resume content here..."
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  rows={10}
                  className="font-mono text-xs resize-none"
                />
              </div>

              {analyzeError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {analyzeError}
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
              {/* Score Card */}
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
                          <div
                            className={`h-full rounded-full transition-all ${scoreBarColor(analysis.score)}`}
                            style={{ width: `${analysis.score}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Strengths */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Star className="w-4 h-4 text-green-500" /> Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {(analysis.strengths || []).map((s, i) => (
                        <li key={i} className="text-xs flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Areas to Improve */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-yellow-500" /> Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {(analysis.improvements || []).map((s, i) => (
                        <li key={i} className="text-xs flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Suggestions */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" /> Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {(analysis.suggestions || []).map((s, i) => (
                        <li key={i} className="text-xs flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
