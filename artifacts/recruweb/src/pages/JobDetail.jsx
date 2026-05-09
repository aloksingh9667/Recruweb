import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, MapPin, Briefcase, IndianRupee, ArrowLeft, Send } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function JobDetail() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchApi(`/jobs/${jobId}`),
  });

  const { data: applications } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => fetchApi("/applications/my"),
    enabled: !!user && user.role === "candidate",
  });

  const hasApplied = applications?.some(app => app.jobId === parseInt(jobId));

  const applyMutation = useMutation({
    mutationFn: (data) => fetchApi("/applications", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
      toast({ title: "Application submitted", description: "You have successfully applied for this job." });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Application failed", description: error.message, variant: "destructive" });
    }
  });

  if (isLoading) {
    return <div className="container mx-auto p-8 animate-pulse text-center">Loading job details...</div>;
  }

  if (!job) {
    return <div className="container mx-auto p-8 text-center">Job not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/jobs" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to jobs
      </Link>

      <Card className="border-border shadow-sm mb-8">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-primary tracking-tight">{job.title}</h1>
              <div className="mt-2 text-xl text-muted-foreground font-medium">
                {job.employer?.company || "Company Name"}
              </div>
            </div>
            
            <div className="flex-shrink-0">
              {user?.role === "employer" ? (
                <Button disabled variant="outline">Employers cannot apply</Button>
              ) : hasApplied ? (
                <Button disabled variant="secondary" className="w-full md:w-auto">Already Applied</Button>
              ) : user ? (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full md:w-auto"><Send className="h-4 w-4 mr-2" /> Apply Now</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply for {job.title}</DialogTitle>
                      <DialogDescription>
                        Submit your application to {job.employer?.company}. Make sure your profile and resume are up to date.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Cover Letter (Optional)</label>
                        <Textarea 
                          placeholder="Why are you a good fit for this role?" 
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          rows={6}
                        />
                      </div>
                      <Button 
                        onClick={() => applyMutation.mutate({ jobId: parseInt(jobId), coverLetter })}
                        disabled={applyMutation.isPending}
                        className="w-full"
                      >
                        {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Link href="/login">
                  <Button className="w-full md:w-auto">Login to Apply</Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 py-6 border-y">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground capitalize">{job.employmentType?.replace("-", " ")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">{job.category}</span>
            </div>
            {job.salaryRange && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <IndianRupee className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">{job.salaryRange}</span>
              </div>
            )}
          </div>
          {job.createdAt && (
            <div className="mt-4 text-sm text-muted-foreground">
              Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Job Description</h2>
            <div className="prose max-w-none text-foreground whitespace-pre-wrap">
              {job.description}
            </div>
          </section>

          {job.requirements && (
            <section>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Requirements</h2>
              <div className="prose max-w-none text-foreground whitespace-pre-wrap">
                {job.requirements}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          {job.skills && job.skills.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {job.employer && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">About {job.employer.company}</h3>
                {job.employer.industry && <p className="text-sm mb-2"><span className="text-muted-foreground">Industry:</span> {job.employer.industry}</p>}
                {job.employer.companySize && <p className="text-sm mb-2"><span className="text-muted-foreground">Size:</span> {job.employer.companySize}</p>}
                {job.employer.website && (
                  <p className="text-sm mb-2">
                    <a href={job.employer.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">Visit Website</a>
                  </p>
                )}
                {job.employer.description && (
                  <p className="text-sm text-muted-foreground mt-4 line-clamp-4">
                    {job.employer.description}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
