import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, Building2, Loader2, AlertCircle, Target, ArrowRight } from "lucide-react";

export default function JobMatch() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Target className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Sign in required</h2>
          <p className="text-muted-foreground">Log in as a candidate to get AI job matches.</p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (user.role !== "candidate") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">AI Job Match is available for candidates only.</p>
      </div>
    );
  }

  const getMatches = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchApi("/ai/job-match", { method: "POST" });
      setMatches(data.matches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const matchScoreColor = (score) => {
    if (score >= 85) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-orange-600 bg-orange-50 border-orange-200";
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Job Match</h1>
          <p className="text-muted-foreground text-sm">Find your best-fit jobs with Gemini AI</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 opacity-80" />
          <h2 className="text-lg font-semibold mb-2">Get Personalized Job Recommendations</h2>
          <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
            Our AI analyzes your profile, skills, and experience to find the most suitable jobs for you from our current listings.
          </p>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive mb-4 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          <Button className="gap-2" onClick={getMatches} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Finding matches..." : (matches ? "Refresh Matches" : "Find My Best Jobs")}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Make sure your{" "}
            <button onClick={() => navigate("/candidate/profile")} className="text-primary hover:underline">profile</button>
            {" "}is complete for better matches.
          </p>
        </CardContent>
      </Card>

      {matches !== null && (
        matches.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No job matches found. Try completing your profile with more skills and experience.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">{matches.length} matches found</p>
            {matches.map((m, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{m.title}</h3>
                        <Badge variant="outline" className={`text-xs border ${matchScoreColor(m.matchScore)}`}>
                          {m.matchScore}% match
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{m.company}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{m.location}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{m.reason}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 shrink-0"
                      onClick={() => navigate(`/jobs/${m.jobId}`)}
                    >
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
