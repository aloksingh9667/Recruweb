import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Briefcase, MapPin, Clock, Search, Filter, Download,
  ArrowLeft, ChevronRight, Star, Mail, Phone, X, Sparkles, Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending Review", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "reviewed", label: "Reviewed", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "shortlisted", label: "Shortlisted", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "interview_scheduled", label: "Interview", color: "bg-teal-100 text-teal-700 border-teal-200" },
  { value: "hired", label: "Hired", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700 border-red-200" },
];

function getStatusColor(status) {
  return STATUS_OPTIONS.find(s => s.value === status)?.color || "bg-gray-100 text-gray-700";
}
function getStatusLabel(status) {
  return STATUS_OPTIONS.find(s => s.value === status)?.label || "Pending";
}

export default function AllApplicationsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [aiRanking, setAiRanking] = useState(false);
  const [aiRanked, setAiRanked] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["allEmployerApplications"],
    queryFn: () => fetchApi("/applications/employer/all"),
    enabled: !!user && user.role === "employer",
  });

  const applications = data?.applications || [];
  const jobs = data?.jobs || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ appId, status }) =>
      fetchApi(`/applications/${appId}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(["allEmployerApplications"], (old) => {
        if (!old) return old;
        return {
          ...old,
          applications: old.applications.map(a =>
            (a._id || a.id) === variables.appId ? { ...a, status: variables.status } : a
          ),
        };
      });
      toast({ title: "Status updated successfully" });
      if ((selectedApp?._id || selectedApp?.id) === variables.appId) {
        setSelectedApp(s => ({ ...s, status: variables.status }));
      }
    },
    onError: (err) => toast({ title: "Failed to update", description: err.message, variant: "destructive" }),
  });

  const filtered = useMemo(() => {
    let list = aiRanked || applications;
    if (statusFilter !== "all") list = list.filter(a => a.status === statusFilter);
    if (jobFilter !== "all") list = list.filter(a => (a.job?._id || a.jobId) === jobFilter);
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter(a => {
        const text = [
          a.candidate?.name, a.candidate?.email, a.candidate?.currentTitle,
          (a.candidate?.skills || []).join(" "), a.job?.title,
        ].filter(Boolean).join(" ").toLowerCase();
        return text.includes(kw);
      });
    }
    return list;
  }, [applications, aiRanked, statusFilter, jobFilter, search]);

  const runAiRank = async () => {
    if (applications.length === 0) return;
    setAiRanking(true);
    try {
      const data = await fetchApi("/ai/rank-candidates", {
        method: "POST",
        body: JSON.stringify({
          jobTitle: "All Positions",
          jobDescription: "Rank candidates by overall profile quality",
          candidates: applications.map(a => ({
            id: a._id || a.id,
            name: a.candidate?.name,
            skills: a.candidate?.skills || [],
            experience: a.candidate?.experience,
            education: a.candidate?.education,
            currentTitle: a.candidate?.currentTitle,
            bio: a.candidate?.bio,
          })),
        }),
      });
      const scoreMap = {};
      (data.ranked || []).forEach((r, i) => { scoreMap[r.id] = { score: r.score, reason: r.reason, rank: i + 1 }; });
      const ranked = [...applications].map(a => ({ ...a, aiScore: scoreMap[a._id || a.id] }));
      ranked.sort((a, b) => (b.aiScore?.score || 0) - (a.aiScore?.score || 0));
      setAiRanked(ranked);
      toast({ title: `AI ranked ${ranked.length} candidates` });
    } catch (err) {
      toast({ title: "AI Ranking failed", description: err.message, variant: "destructive" });
    } finally {
      setAiRanking(false);
    }
  };

  if (!user || user.role !== "employer") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground text-sm mb-4">This page is for employers only.</p>
          <Button onClick={() => navigate("/login")}>Sign In as Employer</Button>
        </div>
      </div>
    );
  }

  const statusCounts = {};
  STATUS_OPTIONS.forEach(s => { statusCounts[s.value] = applications.filter(a => a.status === s.value).length; });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <Link href="/employer/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Jobs
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Applications</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {applications.length} total applications across {jobs.length} jobs
          </p>
        </div>
        <div className="flex gap-2">
          {aiRanked ? (
            <Button variant="outline" size="sm" onClick={() => setAiRanked(null)} className="gap-1.5">
              <X className="w-3.5 h-3.5" /> Clear AI Ranking
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={runAiRank}
              disabled={aiRanking || applications.length === 0}
              className="gap-1.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
            >
              {aiRanking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {aiRanking ? "Ranking..." : "AI Resume Filter"}
            </Button>
          )}
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {STATUS_OPTIONS.map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(statusFilter === value ? "all" : value)}
            className={`p-3 rounded-xl border text-center transition-all ${
              statusFilter === value ? "ring-2 ring-primary border-primary shadow-sm" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50"
            }`}
          >
            <div className="text-lg font-bold text-gray-900 dark:text-white">{statusCounts[value] || 0}</div>
            <div className={`text-[10px] font-medium mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${color}`}>{label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search candidates, skills..."
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className="w-[200px] h-9 text-sm">
            <SelectValue placeholder="Filter by job" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs.map(job => (
              <SelectItem key={job._id} value={job._id} className="text-sm">{job.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Applications Table */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No applications found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your filters.</p>
          {(search || statusFilter !== "all" || jobFilter !== "all") && (
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearch(""); setStatusFilter("all"); setJobFilter("all"); }}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                <tr>
                  {aiRanked && <th className="px-4 py-3 w-14">Rank</th>}
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Applied For</th>
                  <th className="px-4 py-3">Skills</th>
                  <th className="px-4 py-3">Applied</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((app) => {
                  const appId = app._id || app.id;
                  const jobTitle = app.job?.title || "Unknown Position";
                  const jobId = app.job?._id || app.jobId;
                  return (
                    <tr key={appId} className="hover:bg-muted/20 transition-colors">
                      {aiRanked && (
                        <td className="px-4 py-3">
                          {app.aiScore ? (
                            <div className="text-center">
                              <div className="text-xs font-bold text-primary">#{app.aiScore.rank}</div>
                              <div className={`text-xs font-semibold ${app.aiScore.score >= 75 ? "text-green-600" : app.aiScore.score >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                                {app.aiScore.score}%
                              </div>
                            </div>
                          ) : <span className="text-xs text-muted-foreground px-4">—</span>}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm">{app.candidate?.name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{app.candidate?.email}</div>
                        {app.candidate?.currentTitle && <div className="text-xs text-muted-foreground italic">{app.candidate.currentTitle}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/employer/jobs/${jobId}/applications`}>
                          <span className="text-xs font-medium text-primary hover:underline cursor-pointer">{jobTitle}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {(app.candidate?.skills || []).slice(0, 3).map((s, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
                          ))}
                          {(app.candidate?.skills || []).length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{app.candidate.skills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : ""}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          defaultValue={app.status || "pending"}
                          onValueChange={(val) => updateStatusMutation.mutate({ appId, status: val })}
                        >
                          <SelectTrigger className={`w-[140px] h-7 text-xs font-medium border ${getStatusColor(app.status)}`}>
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
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidate Detail Modal */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedApp?.candidate?.name || "Candidate Profile"}</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4 mt-2">
              {selectedApp.aiScore && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 border border-violet-200 dark:border-violet-700 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {selectedApp.aiScore.score}%
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-violet-800 dark:text-violet-300">AI Match Score #{selectedApp.aiScore.rank}</p>
                    <p className="text-xs text-violet-600 dark:text-violet-400">{selectedApp.aiScore.reason}</p>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {selectedApp.candidate?.email && (
                  <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md"><Mail className="h-3.5 w-3.5" />{selectedApp.candidate.email}</div>
                )}
                {selectedApp.candidate?.phone && (
                  <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md"><Phone className="h-3.5 w-3.5" />{selectedApp.candidate.phone}</div>
                )}
              </div>
              <div className="bg-muted/30 rounded-lg px-3 py-2">
                <span className="text-xs text-muted-foreground">Applied for: </span>
                <span className="text-sm font-medium">{selectedApp.job?.title || "Unknown Position"}</span>
              </div>
              {selectedApp.candidate?.bio && (
                <div>
                  <h4 className="font-semibold text-xs text-muted-foreground mb-1 uppercase tracking-wide border-b pb-1">Summary</h4>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedApp.candidate.bio}</p>
                </div>
              )}
              {selectedApp.candidate?.experience && (
                <div>
                  <h4 className="font-semibold text-xs text-muted-foreground mb-1 uppercase tracking-wide border-b pb-1">Experience</h4>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedApp.candidate.experience}</p>
                </div>
              )}
              {selectedApp.candidate?.skills?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-xs text-muted-foreground mb-2 uppercase tracking-wide border-b pb-1">Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApp.candidate.skills.map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                </div>
              )}
              {selectedApp.coverLetter && (
                <div>
                  <h4 className="font-semibold text-xs text-muted-foreground mb-1.5 uppercase tracking-wide border-b pb-1">Cover Letter</h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm whitespace-pre-wrap leading-relaxed">{selectedApp.coverLetter}</div>
                </div>
              )}
              <div className="pt-3 border-t flex items-center justify-between gap-3">
                {selectedApp.candidate?.resumeUrl ? (
                  <a href={selectedApp.candidate.resumeUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Download Resume</Button>
                  </a>
                ) : <span className="text-sm text-muted-foreground italic">No resume</span>}
                <Select
                  defaultValue={selectedApp.status || "pending"}
                  onValueChange={(val) => {
                    updateStatusMutation.mutate({ appId: selectedApp._id || selectedApp.id, status: val });
                  }}
                >
                  <SelectTrigger className={`w-[148px] text-xs border ${getStatusColor(selectedApp.status)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>)}
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
