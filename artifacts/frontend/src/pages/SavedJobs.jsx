import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, BookmarkX, MapPin, Building2, Briefcase, IndianRupee, ArrowRight, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function SavedJobs() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["savedJobs"],
    queryFn: () => fetchApi("/jobs/saved/my"),
    enabled: !!user,
  });

  const unsaveMutation = useMutation({
    mutationFn: (jobId) => fetchApi(`/jobs/${jobId}/save`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
      toast({ title: "Job removed", description: "Removed from your saved jobs." });
    },
  });

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Sign in to view saved jobs</h2>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-primary" /> Saved Jobs
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{jobs?.length ?? 0} jobs saved</p>
        </div>
        <Link href="/jobs">
          <Button variant="outline" size="sm">Browse More Jobs</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : jobs?.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl">
          <Bookmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No saved jobs yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Start saving jobs you're interested in to find them easily later.</p>
          <Link href="/jobs"><Button>Browse Jobs</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <Card key={job._id || job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/jobs/${job._id || job.id}`}>
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer">{job.title}</h3>
                        </Link>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.company || job.employer?.company}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                          <span className="flex items-center gap-1 capitalize"><Briefcase className="w-3.5 h-3.5" />{job.employmentType}</span>
                          {job.salaryRange && <span className="flex items-center gap-1 text-green-600"><IndianRupee className="w-3.5 h-3.5" />{job.salaryRange}</span>}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">{job.category}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <Link href={`/jobs/${job._id || job.id}`}>
                        <Button size="sm" className="gap-1.5">View Job <ArrowRight className="w-3.5 h-3.5" /></Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => unsaveMutation.mutate(job._id || job.id)}
                        disabled={unsaveMutation.isPending}
                      >
                        <BookmarkX className="w-3.5 h-3.5" /> Remove
                      </Button>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
