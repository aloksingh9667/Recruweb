import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, FileText, Search, Filter, Sparkles, X, Loader2, Users } from "lucide-react";
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

// ── PDF generator ────────────────────────────────────────────────────────────
function downloadApplicationPDF(app, jobTitle = "") {
  const name  = app.fullName || app.candidate?.user?.name || app.candidate?.name || "Candidate";
  const email = app.email    || app.candidate?.user?.email || app.candidate?.email || "";
  const phone = app.mobile   || app.candidate?.phone || "";
  const skills = (app.skills?.length > 0 ? app.skills : app.candidate?.skills || []).join(", ");

  const row = (label, value) =>
    value
      ? `<tr>
           <td style="padding:6px 12px 6px 0;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top;width:180px">${label}</td>
           <td style="padding:6px 0;font-size:13px;color:#111827;font-weight:500">${value}</td>
         </tr>`
      : "";

  const section = (title, rows) => {
    const content = rows.join("");
    if (!content) return "";
    return `
      <div style="margin-bottom:24px">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6366f1;border-bottom:1.5px solid #e5e7eb;padding-bottom:6px;margin-bottom:10px">${title}</div>
        <table style="width:100%;border-collapse:collapse">${content}</table>
      </div>`;
  };

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Application – ${name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111827; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body style="padding:40px 48px;max-width:800px;margin:0 auto">

  <!-- Print button -->
  <div class="no-print" style="margin-bottom:20px;text-align:right">
    <button onclick="window.print()" style="background:#6366f1;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-size:13px;cursor:pointer;font-weight:600">
      Save as PDF / Print
    </button>
  </div>

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:12px;padding:28px 32px;margin-bottom:28px">
    <div style="font-size:22px;font-weight:800;margin-bottom:4px">${name}</div>
    <div style="font-size:13px;opacity:0.85">${email}${phone ? " · " + phone : ""}</div>
    ${jobTitle ? `<div style="margin-top:8px;font-size:12px;background:rgba(255,255,255,0.15);display:inline-block;padding:3px 10px;border-radius:20px">Applied for: ${jobTitle}</div>` : ""}
    <div style="margin-top:4px;font-size:11px;opacity:0.7">Application submitted · ${new Date(app.createdAt || Date.now()).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</div>
  </div>

  ${section("Personal Details", [
    row("Full Name",    app.fullName    || app.candidate?.user?.name || app.candidate?.name),
    row("Mobile",       app.mobile      || app.candidate?.phone),
    row("Email",        app.email       || app.candidate?.user?.email || app.candidate?.email),
    row("Address",      app.address     || app.candidate?.location),
  ])}

  ${section("Job Preferences", [
    row("Position Applied For",  app.positionApplied),
    row("Preferred Location",    app.preferredLocation),
    row("Expected Salary",       app.expectedSalary),
    row("Joining Availability",  app.joiningAvailability),
  ])}

  ${section("Education", [
    row("Highest Qualification", app.highestQualification || app.candidate?.education),
    row("College / University",  app.collegeName),
    row("Passing Year",          app.passingYear),
  ])}

  ${section("Experience", [
    row("Total Experience",  app.totalExperience  || app.candidate?.experience),
    row("Current Company",   app.currentCompany),
    row("Current Salary",    app.currentSalary),
    row("Current Title",     app.candidate?.currentTitle),
  ])}

  ${skills ? `
  <div style="margin-bottom:24px">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6366f1;border-bottom:1.5px solid #e5e7eb;padding-bottom:6px;margin-bottom:10px">Skills</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${skills.split(", ").map(s => `<span style="background:#ede9fe;color:#6d28d9;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:500">${s}</span>`).join("")}
    </div>
  </div>` : ""}

  ${app.coverLetter ? `
  <div style="margin-bottom:24px">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6366f1;border-bottom:1.5px solid #e5e7eb;padding-bottom:6px;margin-bottom:10px">Cover Letter</div>
    <div style="font-size:13px;line-height:1.75;color:#374151;white-space:pre-wrap;background:#f9fafb;padding:16px;border-radius:8px;border:1px solid #e5e7eb">${app.coverLetter}</div>
  </div>` : ""}

  ${app.candidate?.bio ? `
  <div style="margin-bottom:24px">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6366f1;border-bottom:1.5px solid #e5e7eb;padding-bottom:6px;margin-bottom:10px">Professional Summary</div>
    <div style="font-size:13px;line-height:1.75;color:#374151;white-space:pre-wrap">${app.candidate.bio}</div>
  </div>` : ""}

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center">
    Application PDF · ${name} · Generated by Recruweb
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

export default function JobApplications() {
  const { jobId } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedApp, setSelectedApp] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

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

  const filtered = useMemo(() => {
    if (aiRanked) return aiRanked;
    let list = applications;
    if (statusFilter !== "all") list = list.filter(a => a.status === statusFilter);
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(a => {
        const text = [
          a.fullName, a.mobile, a.email, a.address,
          a.positionApplied, a.preferredLocation, a.expectedSalary,
          a.highestQualification, a.collegeName, a.totalExperience,
          a.currentCompany, a.currentSalary,
          a.candidate?.bio, a.candidate?.experience, a.candidate?.education,
          a.candidate?.currentTitle, a.coverLetter,
          (a.skills || a.candidate?.skills || []).join(" "),
          a.candidate?.name, a.candidate?.email,
        ].filter(Boolean).join(" ").toLowerCase();
        return text.includes(kw);
      });
    }
    if (skillsFilter) {
      const skills = skillsFilter.toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
      list = list.filter(a => {
        const candSkills = (a.skills || a.candidate?.skills || []).map(s => s.toLowerCase());
        return skills.some(s => candSkills.some(cs => cs.includes(s)));
      });
    }
    if (expFilter !== "Any") {
      list = list.filter(a =>
        (a.totalExperience || a.candidate?.experience || "").toLowerCase().includes(expFilter.toLowerCase())
      );
    }
    if (eduFilter !== "Any") {
      list = list.filter(a =>
        (a.highestQualification || a.candidate?.education || "").toLowerCase().includes(eduFilter.toLowerCase())
      );
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
            name: a.fullName || a.candidate?.name,
            skills: a.skills || a.candidate?.skills || [],
            experience: a.totalExperience || a.candidate?.experience,
            education: a.highestQualification || a.candidate?.education,
            currentTitle: a.candidate?.currentTitle,
            bio: a.candidate?.bio,
          })),
        }),
      });
      const scoreMap = {};
      (data.ranked || []).forEach((r, i) => { scoreMap[r.id] = { score: r.score, reason: r.reason, rank: i + 1 }; });
      const ranked = [...applications].map(a => ({ ...a, aiScore: scoreMap[a.id] }));
      ranked.sort((a, b) => (b.aiScore?.score || 0) - (a.aiScore?.score || 0));
      setAiRanked(ranked);
      toast({ title: "AI Ranking complete", description: `Ranked ${ranked.length} candidates` });
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
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowFilters(f => !f)}>
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
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Keyword Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Name, skills, company..." className="pl-8 h-8 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Skills (comma-separated)</label>
                <Input value={skillsFilter} onChange={e => setSkillsFilter(e.target.value)} placeholder="React, Python, SQL..." className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Experience Level</label>
                <Select value={expFilter} onValueChange={setExpFilter}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{EXP_LEVELS.map(e => <SelectItem key={e} value={e} className="text-xs">{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Education</label>
                <Select value={eduFilter} onValueChange={setEduFilter}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{EDU_LEVELS.map(e => <SelectItem key={e} value={e} className="text-xs">{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
                  <th className="px-4 py-3">Experience</th>
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
                      <div className="font-medium">{app.fullName || app.candidate?.user?.name || app.candidate?.name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">{app.email || app.candidate?.user?.email || app.candidate?.email}</div>
                      {app.mobile && <div className="text-xs text-muted-foreground">{app.mobile}</div>}
                      {app.candidate?.currentTitle && (
                        <div className="text-xs text-muted-foreground italic">{app.candidate.currentTitle}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {app.totalExperience || app.candidate?.experience || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {(app.skills?.length > 0 ? app.skills : app.candidate?.skills || []).slice(0, 3).map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
                        ))}
                        {(app.skills?.length > 0 ? app.skills : app.candidate?.skills || []).length > 3 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{(app.skills?.length > 0 ? app.skills : app.candidate?.skills || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : ""}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {/* Download uploaded resume file */}
                        {app.candidate?.resumeUrl && (
                          <a href={app.candidate.resumeUrl} target="_blank" rel="noreferrer"
                            className="text-primary hover:underline inline-flex items-center text-xs font-medium gap-0.5">
                            <Download className="h-3 w-3" /> File
                          </a>
                        )}
                        {/* Download application as PDF */}
                        <button
                          onClick={() => downloadApplicationPDF(app, job?.title)}
                          className="text-violet-600 hover:underline inline-flex items-center text-xs font-medium gap-0.5"
                        >
                          <FileText className="h-3 w-3" /> PDF
                        </button>
                      </div>
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
                        View Details
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
            <DialogTitle className="text-xl">
              {selectedApp?.fullName || selectedApp?.candidate?.user?.name || selectedApp?.candidate?.name || "Application Details"}
            </DialogTitle>
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

              {/* ── Personal Details ── */}
              <div>
                <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-widest mb-2 pb-1 border-b">Personal Details</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {[
                    ["Full Name",  selectedApp.fullName || selectedApp.candidate?.user?.name || selectedApp.candidate?.name],
                    ["Mobile",     selectedApp.mobile   || selectedApp.candidate?.phone],
                    ["Email",      selectedApp.email    || selectedApp.candidate?.user?.email || selectedApp.candidate?.email],
                    ["Address",    selectedApp.address  || selectedApp.candidate?.location],
                  ].map(([label, val]) => val ? (
                    <div key={label}>
                      <span className="text-muted-foreground text-xs">{label}</span>
                      <p className="font-medium">{val}</p>
                    </div>
                  ) : null)}
                </div>
              </div>

              {/* ── Job Preferences ── */}
              {(selectedApp.positionApplied || selectedApp.preferredLocation || selectedApp.expectedSalary || selectedApp.joiningAvailability) && (
                <div>
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-widest mb-2 pb-1 border-b">Job Preferences</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {[
                      ["Position Applied For",  selectedApp.positionApplied],
                      ["Preferred Location",    selectedApp.preferredLocation],
                      ["Expected Salary",       selectedApp.expectedSalary],
                      ["Joining Availability",  selectedApp.joiningAvailability],
                    ].map(([label, val]) => val ? (
                      <div key={label}>
                        <span className="text-muted-foreground text-xs">{label}</span>
                        <p className="font-medium">{val}</p>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}

              {/* ── Education ── */}
              {(selectedApp.highestQualification || selectedApp.collegeName || selectedApp.passingYear || selectedApp.candidate?.education) && (
                <div>
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-widest mb-2 pb-1 border-b">Education</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {[
                      ["Highest Qualification", selectedApp.highestQualification || selectedApp.candidate?.education],
                      ["College / University",  selectedApp.collegeName],
                      ["Passing Year",          selectedApp.passingYear],
                    ].map(([label, val]) => val ? (
                      <div key={label}>
                        <span className="text-muted-foreground text-xs">{label}</span>
                        <p className="font-medium">{val}</p>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}

              {/* ── Experience ── */}
              {(selectedApp.totalExperience || selectedApp.currentCompany || selectedApp.currentSalary || selectedApp.candidate?.experience || selectedApp.candidate?.currentTitle) && (
                <div>
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-widest mb-2 pb-1 border-b">Experience</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {[
                      ["Total Experience", selectedApp.totalExperience || selectedApp.candidate?.experience],
                      ["Current Company",  selectedApp.currentCompany],
                      ["Current Salary",   selectedApp.currentSalary],
                      ["Current Title",    selectedApp.candidate?.currentTitle],
                    ].map(([label, val]) => val ? (
                      <div key={label}>
                        <span className="text-muted-foreground text-xs">{label}</span>
                        <p className="font-medium">{val}</p>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}

              {/* ── Skills ── */}
              {((selectedApp.skills?.length > 0) || (selectedApp.candidate?.skills?.length > 0)) && (
                <div>
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-widest mb-2 pb-1 border-b">Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedApp.skills?.length > 0 ? selectedApp.skills : selectedApp.candidate?.skills || []).map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Resume ── */}
              <div>
                <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-widest mb-2 pb-1 border-b">Resume & Documents</h4>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${selectedApp.resumeAttached ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    Resume File: {selectedApp.resumeAttached ? "Attached" : "Not attached"}
                  </span>
                  {selectedApp.candidate?.resumeUrl && (
                    <a href={selectedApp.candidate.resumeUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs">
                        <Download className="h-3 w-3" /> Download File
                      </Button>
                    </a>
                  )}
                  <Button
                    size="sm"
                    className="gap-1.5 h-7 text-xs bg-violet-600 hover:bg-violet-700"
                    onClick={() => downloadApplicationPDF(selectedApp, job?.title)}
                  >
                    <FileText className="h-3 w-3" /> Download Application PDF
                  </Button>
                </div>
              </div>

              {/* ── Cover Letter ── */}
              {selectedApp.coverLetter && (
                <div>
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-widest mb-2 pb-1 border-b">Cover Letter</h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm whitespace-pre-wrap leading-relaxed">{selectedApp.coverLetter}</div>
                </div>
              )}

              {/* ── Profile Bio ── */}
              {selectedApp.candidate?.bio && (
                <div>
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-widest mb-2 pb-1 border-b">Professional Summary</h4>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedApp.candidate.bio}</p>
                </div>
              )}

              {/* ── Status Change ── */}
              <div className="pt-3 flex justify-between items-center border-t">
                <p className="text-xs text-muted-foreground">Update application status</p>
                <Select
                  defaultValue={selectedApp.status}
                  onValueChange={(val) => {
                    updateStatusMutation.mutate({ appId: selectedApp.id, status: val });
                    setSelectedApp(s => ({ ...s, status: val }));
                  }}
                >
                  <SelectTrigger className={`w-[160px] text-xs ${STATUS_COLORS[selectedApp.status] || STATUS_COLORS.pending} border`}>
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
