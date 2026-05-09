import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

const statusColors = {
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  shortlisted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  hired: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

export default function CandidateDashboard() {
  const { data: applications, isLoading } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => fetchApi("/applications/my"),
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">My Applications</h1>

      {applications?.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground mb-4">You haven't applied to any jobs yet.</div>
            <Link href="/jobs" className="text-primary font-medium hover:underline">
              Browse Jobs
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications?.map(app => (
            <Card key={app.id}>
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <Link href={`/jobs/${app.jobId}`}>
                    <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer inline-block">
                      {app.job?.title || "Unknown Job"}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground text-sm mt-1">
                    {app.job?.employer?.company || "Company"} • Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className={`capitalize font-medium ${statusColors[app.status] || statusColors.pending} border-transparent`}>
                    {app.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
