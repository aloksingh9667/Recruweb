import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Search, Filter, Sparkles, X, Mail, Phone, MapPin, Star, Loader2, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useMemo } from "react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending Review" },
  { value: "reviewed", label: "Reviewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_COLORS = {
  pending: "bg-gray-100 text-gray-700 border-gray-200",
  reviewed: "bg-blue-100 text-blue-700 border-blue-200",
  shortlisted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  interview_scheduled: "bg-teal-100 text-teal-700 border-teal-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  hired: "bg-green-100 text-green-700 border-green-200",
};

const EXP_LEVELS = ["Any", "Fresher", "1-2 years", "3-5 years", "5+ years"];
const EDU_LEVELS = ["Any", "10th", "12th", "Diploma", "B.Tech", "B.Sc", "B.Com", "MBA", "M.Tech", "PhD"];

export default function JobApplications() {
  const { jobId } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedApp, setSelectedApp] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [keyword, setKeyword] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [expFilter, setExpFilter] = useState("Any");
  const [eduFilter, setEduFilter] = useState("Any");
  const [statusFilter, setStatusFilter] = useState("all");
  const [aiRanking, setAiRanking] = useState(false);
  const [aiRanked, setAiRanked] = useState(null);

  const { data: job } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchApi(`/jobs/${jobId}`),
  });

  const { data: appData, isLoading } = useQuery({
    queryKey: ["jobApplications", jobId],
    queryFn: () => fetchApi(`/applications/job/${jobId}`),
  });

  const applications = appData?.applications || appData || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ appId, status }) =>
      fetchApi(`/applications/${appId}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(["jobApplications", jobId], (old) => {
        if (!old) return old;
        const list = old?.applications || old;
        const updated_list = list.map(a => a.id === variables.appId ? { ...a, status: variables.status } : a);
        return old?.applications ? { ...old, applications: updated_list } : updated_list;
      });
      toast({ title: "Status updated" });
      if (selectedApp?.id === variables.appId) setSelectedApp(s => ({ ...s, status: variables.status }));
    },
    onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  // Client-side filtering
  const filtered = useMemo(() => {
    if (aiRanked) return aiRanked;
    let list = applications;

    if (statusFilter !== "all") list = list.filter(a => a.status === statusFilter);

    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(a => {
        const text = [
          a.candidate?.bio, a.candidate?.experience, a.candidate?.education,
          a.candidate?.currentTitle, a.coverLetter, (a.candidate?.skills || []).join(" "),
          a.candidate?.name, a.candidate?.email,
        ].filter(Boolean).join(" ").toLowerCase();
        return text.includes(kw);
      });
    }

    if (skillsFilter) {
      const skills = skillsFilter.toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
      list = list.filter(a => {
        const candSkills = (a.candidate?.skills || []).map(s => s.toLowerCase());
        return skills.some(s => candSkills.some(cs => cs.includes(s)));
      });
    }

    if (expFilter !== "Any") {
      list = list.filter(a => (a.candidate?.experience || "").toLowerCase().includes(expFilter.toLowerCase()));
    }

    if (eduFilter !== "Any") {
      list = list.filter(a => (a.candidate?.education || "").toLowerCase().includes(eduFilter.toLowerCase()));
    }

    return list;
  }, [applications, keyword, skillsFilter, expFilter, eduFilter, statusFilter, aiRanked]);

  const runAiFilter = async () => {
    if (!job || applications.length === 0) return;
    setAiRanking(true);
    try {
      const data = await fetchApi("/ai/rank-candidates", {
        method: "POST",
        body: JSON.stringify({
          jobTitle: job.title,
          jobDescription: job.description,
          jobRequirements: job.requirements,
          jobSkills: job.skills,
          candidates: applications.map(a => ({
            id: a.id,
            name: a.candidate?.name,
            skills: a.candidate?.skills || [],
            experience: a.candidate?.experience,
            education: a.candidate?.education,
            currentTitle: a.candidate?.currentTitle,
            bio: a.candidate?.bio,
          })),
        }),
      });
      // Merge scores back into application list
      const scoreMap = {};
      (data.ranked || []).forEach((r, i) => { scoreMap[r.id] = { score: r.score, reason: r.reason, rank: i + 1 }; });
      const ranked = [...applications].map(a => ({ ...a, aiScore: scoreMap[a.id] }));
      ranked.sort((a, b) => (b.aiScore?.score || 0) - (a.aiScore?.score || 0));
      setAiRanked(ranked);
      toast({ title: "AI Ranking complete", description: `Ranked ${ranked.length} candidates by fit score` });
    } catch (err) {
      toast({ title: "AI Ranking failed", description: err.message, variant: "destructive" });
    } finally {
      setAiRanking(false);
    }
  };

  const clearAiRanking = () => setAiRanked(null);
  const clearFilters = () => {
    setKeyword(""); setSkillsFilter(""); setExpFilter("Any"); setEduFilter("Any"); setStatusFilter("all"); setAiRanked(null);
  };
  const hasFilters = keyword || skillsFilter || expFilter !== "Any" || eduFilter !== "Any" || statusFilter !== "all" || aiRanked;

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading applications...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link href="/employer/jobs" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to jobs
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            for <span className="font-medium text-foreground">{job?.title || "Job"}</span>
            <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
              {filtered.length} {hasFilters ? "filtered" : "total"}
              {aiRanked && " · AI Ranked"}
            </span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowFilters(f => !f)}
          >
            <Filter className="w-3.5 h-3.5" /> Filters
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
          </Button>
          {aiRanked ? (
            <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground" onClick={clearAiRanking}>
              <X className="w-3.5 h-3.5" /> Clear AI Ranking
            </Button>
          ) : (
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
              onClick={runAiFilter}
              disabled={aiRanking || applications.length === 0}
            >
              {aiRanking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {aiRanking ? "Ranking..." : "AI Resume Filter"}
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Keyword */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Keyword Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Skills, title..." className="pl-8 h-8 text-xs" />
                </div>
              </div>
              {/* Skills */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Skills (comma-separated)</label>
                <Input value={skillsFilter} onChange={e => setSkillsFilter(e.target.value)} placeholder="React, Python, SQL..." className="h-8 text-xs" />
              </div>
              {/* Experience */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Experience Level</label>
                <Select value={expFilter} onValueChange={setExpFilter}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{EXP_LEVELS.map(e => <SelectItem key={e} value={e} className="text-xs">{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {/* Education */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Education</label>
                <Select value={eduFilter} onValueChange={setEduFilter}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{EDU_LEVELS.map(e => <SelectItem key={e} value={e} className="text-xs">{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Status filter */}
              <div className="flex gap-1.5 flex-wrap">
                {[{ value: "all", label: "All" }, ...STATUS_OPTIONS].map(s => (
                  <button
                    key={s.value}
                    onClick={() => setStatusFilter(s.value)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      statusFilter === s.value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {hasFilters && (
                <Button size="sm" variant="ghost" onClick={clearFilters} className="ml-auto text-xs gap-1 h-7">
                  <X className="w-3 h-3" /> Clear all
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-1">{hasFilters ? "No matching candidates" : "No applications yet"}</h3>
          <p className="text-muted-foreground text-sm">{hasFilters ? "Try adjusting your filters." : "Applications will appear here."}</p>
          {hasFilters && <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">Clear Filters</Button>}
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                <tr>
                  {aiRanked && <th className="px-4 py-3 w-12">Rank</th>}
                  <th className="px-6 py-3">Candidate</th>
                  <th className="px-4 py-3">Skills</th>
                  <th className="px-4 py-3">Applied</th>
                  <th className="px-4 py-3">Resume</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                    {aiRanked && (
                      <td className="px-4 py-3">
                        {app.aiScore ? (
                          <div className="flex flex-col items-center">
                            <div className="text-xs font-bold text-primary">#{app.aiScore.rank}</div>
                            <div className={`text-xs font-semibold ${app.aiScore.score >= 75 ? "text-green-600" : app.aiScore.score >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                              {app.aiScore.score}%
                            </div>
                          </div>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                    )}
                    <td className="px-6 py-3">
                      <div className="font-medium">{app.candidate?.user?.name || app.candidate?.name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">{app.candidate?.user?.email || app.candidate?.email}</div>
                      {app.candidate?.currentTitle && (
                        <div className="text-xs text-muted-foreground italic">{app.candidate.currentTitle}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {(app.candidate?.skills || []).slice(0, 3).map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
                        ))}
                        {(app.candidate?.skills || []).length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{(app.candidate.skills.length - 3)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : ""}
                    </td>
                    <td className="px-4 py-3">
                      {app.candidate?.resumeUrl ? (
                        <a href={app.candidate.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center text-xs font-medium gap-0.5">
                          <Download className="h-3 w-3" /> Download
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">No resume</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        defaultValue={app.status}
                        onValueChange={(val) => updateStatusMutation.mutate({ appId: app.id, status: val })}
                      >
                        <SelectTrigger className={`w-[148px] h-7 text-xs font-medium border ${STATUS_COLORS[app.status] || STATUS_COLORS.pending}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)} className="h-7 text-xs">
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidate Detail Modal */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedApp?.candidate?.user?.name || selectedApp?.candidate?.name || "Candidate Profile"}</DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-5 mt-2">
              {/* AI Score */}
              {selectedApp.aiScore && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {selectedApp.aiScore.score}%
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-violet-800">AI Match Score #{selectedApp.aiScore.rank}</p>
                    <p className="text-xs text-violet-600">{selectedApp.aiScore.reason}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md">
                  <Mail className="h-3.5 w-3.5" /> {selectedApp.candidate?.user?.email || selectedApp.candidate?.email}
                </div>
                {selectedApp.candidate?.phone && (
                  <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md">
                    <Phone className="h-3.5 w-3.5" /> {selectedApp.candidate.phone}
                  </div>
                )}
                {selectedApp.candidate?.location && (
                  <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md">
                    <MapPin className="h-3.5 w-3.5" /> {selectedApp.candidate.location}
                  </div>
                )}
              </div>

              {selectedApp.candidate?.currentTitle && (
                <div>
                  <h4 className="font-semibold text-xs text-muted-foreground mb-1 uppercase tracking-wide">Current Title</h4>
                  <p className="font-medium">{selectedApp.candidate.currentTitle}</p>
                </div>
              )}

              {selectedApp.coverLetter && (
                <div>
                  <h4 className="font-semibold text-xs text-muted-foreground mb-1.5 uppercase tracking-wide border-b pb-1">Cover Letter</h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm whitespace-pre-wrap leading-relaxed">{selectedApp.coverLetter}</div>
                </div>
              )}

              {selectedApp.candidate?.bio && (
                <div>
                  <h4 className="font-semibold text-xs text-muted-foreground mb-1.5 uppercase tracking-wide border-b pb-1">Professional Summary</h4>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedApp.candidate.bio}</p>
                </div>
              )}

              {selectedApp.candidate?.experience && (
                <div>
                  <h4 className="font-semibold text-xs text-muted-foreground mb-1.5 uppercase tracking-wide border-b pb-1">Experience</h4>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedApp.candidate.experience}</p>
                </div>
              )}

              {selectedApp.candidate?.education && (
                <div>
                  <h4 className="font-semibold text-xs text-muted-foreground mb-1.5 uppercase tracking-wide border-b pb-1">Education</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedApp.candidate.education}</p>
                </div>
              )}

              {selectedApp.candidate?.skills?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-xs text-muted-foreground mb-2 uppercase tracking-wide border-b pb-1">Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApp.candidate.skills.map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-between items-center border-t">
                {selectedApp.candidate?.resumeUrl ? (
                  <a href={selectedApp.candidate.resumeUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Download Resume</Button>
                  </a>
                ) : (
                  <span className="text-muted-foreground text-sm italic">No resume provided</span>
                )}
                <Select
                  defaultValue={selectedApp.status}
                  onValueChange={(val) => {
                    updateStatusMutation.mutate({ appId: selectedApp.id, status: val });
                    setSelectedApp(s => ({ ...s, status: val }));
                  }}
                >
                  <SelectTrigger className={`w-[148px] text-xs ${STATUS_COLORS[selectedApp.status] || STATUS_COLORS.pending} border`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
