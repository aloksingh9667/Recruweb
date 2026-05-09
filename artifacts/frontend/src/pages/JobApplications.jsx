import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ExternalLink, Mail, Phone, MapPin, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

const statusOptions = [
  { value: "pending", label: "Pending Review" },
  { value: "reviewed", label: "Reviewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

const statusColors = {
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  shortlisted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  hired: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

export default function JobApplications() {
  const { jobId } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedApp, setSelectedApp] = useState(null);

  const { data: job } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchApi(`/jobs/${jobId}`),
  });

  const { data: applications, isLoading } = useQuery({
    queryKey: ["jobApplications", jobId],
    queryFn: () => fetchApi(`/applications/job/${jobId}`),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ appId, status }) => fetchApi(`/applications/${appId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    }),
    onSuccess: (_, variables) => {
      // Optimistic update
      queryClient.setQueryData(["jobApplications", jobId], (old) => {
        if (!old) return old;
        return old.map(app => app.id === variables.appId ? { ...app, status: variables.status } : app);
      });
      toast({ title: "Status updated" });
    },
    onError: (err) => {
      toast({ title: "Failed to update status", description: err.message, variant: "destructive" });
    }
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading applications...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link href="/employer/jobs" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to jobs
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
        <p className="text-lg text-muted-foreground mt-1">for {job?.title || "Job"}</p>
      </div>

      {applications?.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card">
          <h3 className="text-xl font-medium mb-2">No applications yet</h3>
          <p className="text-muted-foreground">Applications for this job will appear here.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">Resume</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {applications?.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-base">{app.candidate?.user?.name || "Unknown"}</div>
                      <div className="text-muted-foreground text-xs">{app.candidate?.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : ""}
                    </td>
                    <td className="px-6 py-4">
                      {app.candidate?.resumeUrl ? (
                        <a href={app.candidate.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center text-sm font-medium">
                          <Download className="h-3 w-3 mr-1" /> Download
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">No resume</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Select 
                        defaultValue={app.status} 
                        onValueChange={(val) => updateStatusMutation.mutate({ appId: app.id, status: val })}
                      >
                        <SelectTrigger className={`w-[140px] h-8 text-xs font-medium border-0 ${statusColors[app.status] || statusColors.pending}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)}>
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
            <DialogTitle className="text-2xl">{selectedApp?.candidate?.user?.name || "Candidate Profile"}</DialogTitle>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-6 mt-4">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md">
                  <Mail className="h-4 w-4" /> {selectedApp.candidate?.user?.email}
                </div>
                {selectedApp.candidate?.phone && (
                  <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md">
                    <Phone className="h-4 w-4" /> {selectedApp.candidate.phone}
                  </div>
                )}
                {selectedApp.candidate?.location && (
                  <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md">
                    <MapPin className="h-4 w-4" /> {selectedApp.candidate.location}
                  </div>
                )}
              </div>

              {selectedApp.candidate?.currentTitle && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Current Title</h4>
                  <p className="font-medium text-lg">{selectedApp.candidate.currentTitle}</p>
                </div>
              )}

              {selectedApp.coverLetter && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2 border-b pb-1">Cover Letter</h4>
                  <div className="bg-muted/30 p-4 rounded-lg text-sm whitespace-pre-wrap">
                    {selectedApp.coverLetter}
                  </div>
                </div>
              )}

              {selectedApp.candidate?.bio && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2 border-b pb-1">Professional Summary</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedApp.candidate.bio}</p>
                </div>
              )}

              {selectedApp.candidate?.experience && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2 border-b pb-1">Experience</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedApp.candidate.experience}</p>
                </div>
              )}

              {selectedApp.candidate?.education && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2 border-b pb-1">Education</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedApp.candidate.education}</p>
                </div>
              )}

              {selectedApp.candidate?.skills && selectedApp.candidate.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2 border-b pb-1">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.candidate.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-between items-center border-t">
                {selectedApp.candidate?.resumeUrl ? (
                  <a href={selectedApp.candidate.resumeUrl} target="_blank" rel="noreferrer">
                    <Button><Download className="h-4 w-4 mr-2" /> Download Full Resume</Button>
                  </a>
                ) : (
                  <span className="text-muted-foreground text-sm italic">No resume provided</span>
                )}
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium mr-2">Status:</span>
                  <Select 
                    defaultValue={selectedApp.status} 
                    onValueChange={(val) => {
                      updateStatusMutation.mutate({ appId: selectedApp.id, status: val });
                      setSelectedApp({...selectedApp, status: val});
                    }}
                  >
                    <SelectTrigger className={`w-[140px] ${statusColors[selectedApp.status] || statusColors.pending} border-0`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
