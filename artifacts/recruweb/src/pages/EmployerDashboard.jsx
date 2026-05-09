import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, CheckCircle, Clock } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const statusColors = {
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  shortlisted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  hired: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

export default function EmployerDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["employerDashboard"],
    queryFn: () => fetchApi("/employers/dashboard"),
  });

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-primary">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalJobs || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.activeJobs || 0} active
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalApplications || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.pendingApplications || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.shortlistedApplications || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Recent Applications</h2>
        
        {stats?.recentApplications?.length > 0 ? (
          <div className="border rounded-xl bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium">
                  <tr>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Job Title</th>
                    <th className="px-6 py-4">Applied</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{app.candidate?.user?.name || "Unknown"}</td>
                      <td className="px-6 py-4">{app.job?.title || "Unknown Job"}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : ""}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`capitalize ${statusColors[app.status] || statusColors.pending} border-transparent`}>
                          {app.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/employer/jobs/${app.jobId}/applications`} className="text-primary hover:underline font-medium">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No recent applications.</p>
              <Link href="/employer/jobs/new" className="text-primary hover:underline font-medium">
                Post a new job
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
