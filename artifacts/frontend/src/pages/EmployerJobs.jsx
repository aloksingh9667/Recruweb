import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function EmployerJobs() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["employerJobs"],
    queryFn: () => fetchApi("/jobs/employer/my"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => fetchApi(`/jobs/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employerJobs"] });
      toast({ title: "Job deleted successfully" });
    },
    onError: (err) => {
      toast({ title: "Failed to delete job", description: err.message, variant: "destructive" });
    }
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading jobs...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Job Postings</h1>
        <Link href="/employer/jobs/new">
          <Button><Plus className="h-4 w-4 mr-2" /> Post New Job</Button>
        </Link>
      </div>

      {jobs?.length === 0 ? (
        <Card className="text-center py-16 border-dashed">
          <CardContent>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <BriefcaseIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">No jobs posted yet</h3>
            <p className="text-muted-foreground mb-6">Create your first job posting to start receiving applications.</p>
            <Link href="/employer/jobs/new">
              <Button>Post a Job</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs?.map((job) => (
            <Card key={job.id} className="overflow-hidden hover-elevate transition-all border-border/50 group">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <Link href={`/jobs/${job.id}`}>
                      <h3 className="font-semibold text-xl hover:text-primary transition-colors cursor-pointer inline-block mb-1">
                        {job.title}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="secondary" className="font-normal">{job.location}</Badge>
                      <Badge variant="outline" className="font-normal text-muted-foreground capitalize">{job.employmentType?.replace("-", " ")}</Badge>
                      <span className="text-sm text-muted-foreground ml-2">
                        Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 md:self-center">
                    <Link href={`/employer/jobs/${job.id}/applications`}>
                      <Button variant="outline" size="sm" className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/20">
                        <Users className="h-4 w-4 mr-2" /> 
                        View Applications
                      </Button>
                    </Link>
                    <Link href={`/employer/jobs/${job.id}/edit`}>
                      <Button variant="ghost" size="icon" className="hover:text-primary" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this job posting?")) {
                          deleteMutation.mutate(job.id);
                        }
                      }}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

function BriefcaseIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}
