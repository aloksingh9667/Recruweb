import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Building2, MapPin, Clock, ChevronRight, CheckCircle2, XCircle, Calendar, Briefcase, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_CONFIG = {
  pending: { label: "Pending Review", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  reviewed: { label: "Reviewed", color: "bg-blue-100 text-blue-700 border-blue-200", icon: FileText },
  shortlisted: { label: "Shortlisted", color: "bg-purple-100 text-purple-700 border-purple-200", icon: CheckCircle2 },
  interview_scheduled: { label: "Interview Scheduled", color: "bg-teal-100 text-teal-700 border-teal-200", icon: Calendar },
  hired: { label: "Hired", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

function ApplicationCard({ app }) {
  const job = app.job || app.jobId;
  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <Link href={`/jobs/${job?._id || job?.id || app.jobId}`}>
                  <h3 className="font-semibold hover:text-primary cursor-pointer transition-colors">
                    {job?.title || "Job Position"}
                  </h3>
                </Link>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                  {(job?.company || job?.employer?.company) && (
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job?.company || job?.employer?.company}</span>
                  )}
                  {job?.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>}
                </div>
              </div>
              <Badge variant="outline" className={`text-xs border flex items-center gap-1 shrink-0 ${cfg.color}`}>
                <Icon className="w-3 h-3" />{cfg.label}
              </Badge>
            </div>
            {app.coverLetter && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 bg-muted/40 rounded px-2 py-1.5">
                {app.coverLetter}
              </p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Applied {app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : ""}
              </span>
              <Link href={`/jobs/${job?._id || job?.id || app.jobId}`} className="ml-auto">
                <Button size="sm" variant="ghost" className="gap-1 h-7 text-xs">
                  View Job <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => fetchApi("/applications/my"),
    enabled: !!user,
  });

  const applications = data?.applications || [];

  const tabs = [
    { id: "all", label: "All", statuses: null },
    { id: "active", label: "Applied", statuses: ["pending", "reviewed"] },
    { id: "shortlisted", label: "Shortlisted", statuses: ["shortlisted"] },
    { id: "interview", label: "Interview", statuses: ["interview_scheduled"] },
    { id: "hired", label: "Hired", statuses: ["hired"] },
    { id: "rejected", label: "Rejected", statuses: ["rejected"] },
  ];

  const filterApps = (statuses) =>
    statuses ? applications.filter(a => statuses.includes(a.status)) : applications;

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
          <p className="text-muted-foreground">Applications page is for candidates. Employers can view applications in their dashboard.</p>
          <Link href="/employer/jobs"><Button className="mt-4">My Job Postings</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" /> My Applications
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{applications.length} total applications</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl">
          <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No applications yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Start applying to jobs you're interested in.</p>
          <Link href="/jobs"><Button>Browse Jobs</Button></Link>
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-6 flex-wrap h-auto gap-1 p-1">
            {tabs.map(tab => {
              const count = filterApps(tab.statuses).length;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5 text-xs">
                  {tab.label}
                  <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                    {count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              {filterApps(tab.statuses).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No applications in this category</div>
              ) : (
                filterApps(tab.statuses).map(app => <ApplicationCard key={app.id || app._id} app={app} />)
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
