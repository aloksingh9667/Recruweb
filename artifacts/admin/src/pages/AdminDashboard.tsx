import { useEffect, useState } from "react";
import { fetchAdmin } from "@/lib/api";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Briefcase, FileText, Building2, TrendingUp, UserCheck, Clock } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalEmployers: number;
  totalCandidates: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  applicationsByStatus: { status: string; count: number }[];
  jobsByCategory: { category: string; count: number }[];
  recentUsers: { _id: string; name: string; email: string; role: string; createdAt: string }[];
  recentJobs: { _id: string; title: string; company: string; createdAt: string; isActive: boolean }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  reviewed: "#3b82f6",
  shortlisted: "#8b5cf6",
  rejected: "#ef4444",
  hired: "#22c55e",
};

const CHART_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmin("/admin/stats")
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Employers", value: stats?.totalEmployers ?? 0, icon: Building2, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Candidates", value: stats?.totalCandidates ?? 0, icon: UserCheck, color: "text-green-500", bg: "bg-green-50" },
    { label: "Total Jobs", value: stats?.totalJobs ?? 0, icon: Briefcase, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Active Jobs", value: stats?.activeJobs ?? 0, icon: TrendingUp, color: "text-teal-500", bg: "bg-teal-50" },
    { label: "Applications", value: stats?.totalApplications ?? 0, icon: FileText, color: "text-pink-500", bg: "bg-pink-50" },
  ];

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform overview and analytics</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="border shadow-sm">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jobs by Category */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Jobs by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.jobsByCategory && stats.jobsByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.jobsByCategory.slice(0, 8)} margin={{ left: -20 }}>
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
              )}
            </CardContent>
          </Card>

          {/* Applications by Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Applications by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.applicationsByStatus && stats.applicationsByStatus.length > 0 ? (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="60%" height={180}>
                    <PieChart>
                      <Pie data={stats.applicationsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70}>
                        {stats.applicationsByStatus.map((entry, i) => (
                          <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {stats.applicationsByStatus.map((s, i) => (
                      <div key={s.status} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] || CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-xs capitalize">{s.status}</span>
                        <span className="text-xs font-semibold ml-auto">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" /> Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats?.recentUsers?.length ? stats.recentUsers.map(u => (
                <div key={u._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {u.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <Badge variant={u.role === "employer" ? "default" : "secondary"} className="text-[10px] capitalize shrink-0">
                    {u.role}
                  </Badge>
                </div>
              )) : <p className="text-sm text-muted-foreground">No users yet</p>}
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" /> Recent Jobs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats?.recentJobs?.length ? stats.recentJobs.map(j => (
                <div key={j._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{j.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{j.company}</p>
                  </div>
                  <Badge variant={j.isActive ? "default" : "secondary"} className="text-[10px] shrink-0">
                    {j.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              )) : <p className="text-sm text-muted-foreground">No jobs yet</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
