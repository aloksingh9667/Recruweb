import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Building2, MapPin, Clock, ChevronRight, CheckCircle2,
  XCircle, Calendar, Briefcase, AlertCircle, Search, Circle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STAGES = [
  { key: "pending", label: "Applied", shortLabel: "Applied", icon: FileText, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-700", dot: "bg-blue-500", line: "bg-blue-200 dark:bg-blue-800" },
  { key: "reviewed", label: "Under Review", shortLabel: "Review", icon: Search, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-700", dot: "bg-yellow-500", line: "bg-yellow-200 dark:bg-yellow-800" },
  { key: "shortlisted", label: "Shortlisted", shortLabel: "Shortlisted", icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-700", dot: "bg-purple-500", line: "bg-purple-200 dark:bg-purple-800" },
  { key: "interview_scheduled", label: "Interview", shortLabel: "Interview", icon: Calendar, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-900/20", border: "border-teal-200 dark:border-teal-700", dot: "bg-teal-500", line: "bg-teal-200 dark:bg-teal-800" },
  { key: "hired", label: "Hired!", shortLabel: "Hired", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-700", dot: "bg-green-500", line: "bg-green-200 dark:bg-green-800" },
];

const REJECTED_STAGE = { key: "rejected", label: "Rejected", icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-700", dot: "bg-red-500" };

function getStageIndex(status) {
  if (status === "rejected") return -1;
  return STAGES.findIndex(s => s.key === status);
}

function ApplicationTracker({ status }) {
  const isRejected = status === "rejected";
  const currentIdx = getStageIndex(status);

  if (isRejected) {
    return (
      <div className="flex items-center gap-2 mt-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
          <XCircle className="w-3.5 h-3.5 text-red-500" />
          <span className="text-xs font-medium text-red-600 dark:text-red-400">Application Rejected</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isPending = idx > currentIdx;
          const Icon = stage.icon;
          return (
            <div key={stage.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1 relative">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCurrent ? `${stage.bg} ${stage.border}` :
                  isCompleted ? "bg-green-100 dark:bg-green-900/20 border-green-400 dark:border-green-600" :
                  "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : isCurrent ? (
                    <Icon className={`w-3.5 h-3.5 ${stage.color}`} />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                  )}
                </div>
                <span className={`text-[9px] font-medium text-center leading-tight whitespace-nowrap ${
                  isCurrent ? stage.color.replace("text-", "text-") : isCompleted ? "text-green-600 dark:text-green-400" : "text-gray-400"
                }`}>
                  {stage.shortLabel}
                </span>
              </div>
              {idx < STAGES.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full ${
                  isCompleted ? "bg-green-300 dark:bg-green-700" : "bg-gray-200 dark:bg-gray-700"
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ApplicationCard({ app }) {
  const job = app.job || app.jobId;
  const isRejected = app.status === "rejected";
  const currentStage = isRejected ? REJECTED_STAGE : (STAGES.find(s => s.key === app.status) || STAGES[0]);

  return (
    <div className={`bg-white dark:bg-gray-800 border ${currentStage.border} rounded-xl p-5 hover:shadow-md transition-all`}>
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className={`w-12 h-12 rounded-xl ${currentStage.bg} border ${currentStage.border} flex items-center justify-center shrink-0`}>
          <span className={`text-sm font-bold ${currentStage.color}`}>
            {(job?.company || job?.companyName || "Co").slice(0, 2).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <Link href={`/jobs/${job?._id || job?.id || app.jobId}`}>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm hover:text-primary cursor-pointer transition-colors truncate">
                  {job?.title || "Job Position"}
                </h3>
              </Link>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                {(job?.company || job?.employer?.company) && (
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{job?.company || job?.employer?.company}</span>
                )}
                {job?.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                {job?.salary && <span className="text-green-600 dark:text-green-400 font-medium">{job.salary}</span>}
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${currentStage.bg} ${currentStage.border}`}>
              <currentStage.icon className={`w-3 h-3 ${currentStage.color}`} />
              <span className={currentStage.color}>{currentStage.label}</span>
            </div>
          </div>

          {/* Application Tracker */}
          <ApplicationTracker status={app.status} />

          {/* Skills */}
          {job?.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {job.skills.slice(0, 4).map(s => (
                <span key={s} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
          )}

          {/* Cover Letter Preview */}
          {app.coverLetter && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 bg-muted/40 rounded px-2 py-1.5 italic">
              "{app.coverLetter}"
            </p>
          )}

          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Applied {app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : ""}
            </span>
            <Link href={`/jobs/${job?._id || job?.id || app.jobId}`} className="ml-auto">
              <Button size="sm" variant="ghost" className="gap-1 h-7 text-xs text-primary">
                View Job <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: "all", label: "All Applications", statuses: null },
  { id: "active", label: "Applied", statuses: ["pending"] },
  { id: "review", label: "Under Review", statuses: ["reviewed"] },
  { id: "shortlisted", label: "Shortlisted", statuses: ["shortlisted"] },
  { id: "interview", label: "Interview", statuses: ["interview_scheduled"] },
  { id: "hired", label: "Hired", statuses: ["hired"] },
  { id: "rejected", label: "Rejected", statuses: ["rejected"] },
];

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const woSearch = useSearch();
  const [activeTab, setActiveTab] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const tab = p.get("tab");
    return TABS.find(t => t.id === tab) ? tab : "all";
  });

  useEffect(() => {
    const p = new URLSearchParams(woSearch);
    const tab = p.get("tab");
    if (tab && TABS.find(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [woSearch]);

  const { data, isLoading } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => fetchApi("/applications/my"),
    enabled: !!user,
  });

  const applications = data?.applications || [];

  const filterApps = (statuses) =>
    statuses ? applications.filter(a => statuses.includes(a.status)) : applications;

  const activeApps = filterApps(TABS.find(t => t.id === activeTab)?.statuses);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Sign in to view your applications</h2>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (user.role !== "candidate") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Applications page is for candidates.</p>
          <Link href="/employer/applications"><Button className="mt-4">View All Applications</Button></Link>
        </div>
      </div>
    );
  }

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === "pending").length,
    shortlisted: applications.filter(a => a.status === "shortlisted").length,
    interview: applications.filter(a => a.status === "interview_scheduled").length,
    hired: applications.filter(a => a.status === "hired").length,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" /> My Applications
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{applications.length} total applications</p>
      </div>

      {/* Stats Strip */}
      {applications.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total Applied", count: stats.total, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
            { label: "Applied", count: stats.applied, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" },
            { label: "Shortlisted", count: stats.shortlisted, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" },
            { label: "Interview", count: stats.interview, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800" },
            { label: "Hired", count: stats.hired, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`rounded-xl border p-3 text-center ${bg}`}>
              <div className={`text-xl font-bold ${color}`}>{count}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 border-b border-border">
        {TABS.map(tab => {
          const count = filterApps(tab.statuses).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap rounded-t border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Application Cards */}
      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : activeApps.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl">
          <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No applications here</h3>
          <p className="text-muted-foreground text-sm mb-6">
            {activeTab === "all" ? "Start applying to jobs you're interested in." : "No applications in this stage yet."}
          </p>
          <Link href="/jobs"><Button>Browse Jobs</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activeApps.map(app => <ApplicationCard key={app.id || app._id} app={app} />)}
        </div>
      )}
    </div>
  );
}
