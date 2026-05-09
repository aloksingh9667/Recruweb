import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, ChevronDown, ChevronUp, Loader2, AlertCircle, Mic, Target, Zap } from "lucide-react";

const DIFFICULTY_COLORS = {
  easy: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  hard: "bg-red-100 text-red-700 border-red-200",
};

const TYPE_COLORS = {
  behavioral: "bg-blue-100 text-blue-700 border-blue-200",
  technical: "bg-purple-100 text-purple-700 border-purple-200",
  situational: "bg-orange-100 text-orange-700 border-orange-200",
};

const QUICK_ROLES = [
  "Software Engineer", "Product Manager", "Data Analyst",
  "UI/UX Designer", "Marketing Manager", "Business Analyst",
  "DevOps Engineer", "Sales Executive",
];

export default function InterviewPrep() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});
  const [filter, setFilter] = useState("all");

  const generate = async () => {
    if (!jobTitle.trim()) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    setExpanded({});
    try {
      const data = await fetchApi("/ai/interview-prep", {
        method: "POST",
        body: JSON.stringify({ jobTitle, jobDescription, count }),
      });
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  const filtered = filter === "all" ? questions : questions.filter(q => q.type === filter);

  const counts = questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Interview Prep</h1>
          <p className="text-muted-foreground text-sm">Generate tailored interview questions with ideal answers</p>
        </div>
      </div>

      {/* Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Configure your prep session</CardTitle>
          <CardDescription>Enter the role you're interviewing for to get personalized questions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick roles */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Quick select</Label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setJobTitle(r)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    jobTitle === r
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 hover:bg-muted border-border text-muted-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Job Title *</Label>
            <Input
              placeholder="e.g. Senior Software Engineer, Product Manager..."
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Job Description (optional)</Label>
            <Textarea
              placeholder="Paste the job description for more tailored questions..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Number of Questions</Label>
            <div className="flex gap-2">
              {[5, 10, 15].map(n => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    count === n
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted/50 border-border"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button className="w-full gap-2" onClick={generate} disabled={loading || !jobTitle.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? "Generating questions..." : "Generate Interview Questions"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {questions.length > 0 && (
        <div className="space-y-4">
          {/* Summary + Filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm font-medium">{questions.length} questions for <span className="text-primary">{jobTitle}</span></p>
            <div className="flex gap-2 ml-auto flex-wrap">
              <button
                onClick={() => setFilter("all")}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${filter === "all" ? "bg-foreground text-background border-foreground" : "hover:bg-muted border-border text-muted-foreground"}`}
              >
                All ({questions.length})
              </button>
              {["behavioral", "technical", "situational"].map(t => counts[t] ? (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`text-xs px-3 py-1 rounded-full border capitalize transition-colors ${filter === t ? "bg-foreground text-background border-foreground" : "hover:bg-muted border-border text-muted-foreground"}`}
                >
                  {t} ({counts[t]})
                </button>
              ) : null)}
            </div>
          </div>

          {/* Question Cards */}
          <div className="space-y-3">
            {filtered.map((q, i) => (
              <Card key={i} className="overflow-hidden">
                <button
                  className="w-full text-left p-4 hover:bg-muted/20 transition-colors"
                  onClick={() => toggleExpand(i)}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{q.question}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 h-4 capitalize border ${TYPE_COLORS[q.type] || ""}`}>
                          {q.type}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 h-4 capitalize border ${DIFFICULTY_COLORS[q.difficulty] || ""}`}>
                          {q.difficulty}
                        </Badge>
                      </div>
                    </div>
                    {expanded[i]
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    }
                  </div>
                </button>

                {expanded[i] && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="pl-9">
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Target className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-semibold text-primary">Ideal Answer</span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">{q.answer}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={generate}>
              <Zap className="w-4 h-4" /> Regenerate
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && questions.length === 0 && !error && (
        <div className="text-center py-12">
          <Mic className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Enter a job title above to generate interview questions</p>
        </div>
      )}
    </div>
  );
}
