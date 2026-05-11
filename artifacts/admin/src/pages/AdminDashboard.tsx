import { useEffect, useState } from "react";
import { fetchAdmin } from "@/lib/api";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Briefcase, FileText, Building2, TrendingUp, UserCheck, Clock, ArrowUpRight, MessageSquare, Bell } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalEmployers: number;
  totalCandidates: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalContacts: number;
  unreadContacts: number;
  totalSubscribers: number;
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

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const step = Math.ceil(value / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 25);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

function StatCard({ label, value, icon: Icon, gradient, delay }: {
  label: string; value: number; icon: any; gradient: string; delay: number;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
      style={{ background: gradient, animationDelay: `${delay}ms`, animation: "fadeUp .5s ease both" }}
    >
      <div className="absolute right-3 top-3 opacity-20">
        <Icon className="w-12 h-12" />
      </div>
      <p className="text-3xl font-black tracking-tight">
        <AnimatedNumber value={value} />
      </p>
      <p className="text-sm font-medium mt-1 opacity-90">{label}</p>
      <div className="flex items-center gap-1 mt-3 text-xs opacity-75">
        <ArrowUpRight className="w-3 h-3" /> Platform total
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmin("/admin/stats")
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Users",    value: stats?.totalUsers ?? 0,        icon: Users,         gradient: "linear-gradient(135deg,#667eea,#764ba2)" },
    { label: "Employers",      value: stats?.totalEmployers ?? 0,     icon: Building2,     gradient: "linear-gradient(135deg,#f093fb,#f5576c)" },
    { label: "Candidates",     value: stats?.totalCandidates ?? 0,    icon: UserCheck,     gradient: "linear-gradient(135deg,#4facfe,#00f2fe)" },
    { label: "Total Jobs",     value: stats?.totalJobs ?? 0,          icon: Briefcase,     gradient: "linear-gradient(135deg,#43e97b,#38f9d7)" },
    { label: "Active Jobs",    value: stats?.activeJobs ?? 0,         icon: TrendingUp,    gradient: "linear-gradient(135deg,#fa709a,#fee140)" },
    { label: "Applications",   value: stats?.totalApplications ?? 0,  icon: FileText,      gradient: "linear-gradient(135deg,#a18cd1,#fbc2eb)" },
    { label: "Contact Messages", value: stats?.totalContacts ?? 0,    icon: MessageSquare, gradient: "linear-gradient(135deg,#f7971e,#ffd200)" },
    { label: "Subscribers",    value: stats?.totalSubscribers ?? 0,   icon: Bell,          gradient: "linear-gradient(135deg,#11998e,#38ef7d)" },
  ];

  return (
    <AdminLayout>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes shimmer { to{background-position:200% 0} }
        .skeleton { background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation: shimmer 1.5s infinite; border-radius:12px; }
      `}</style>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Platform overview · Recruweb Resources Pvt. Ltd.</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-28" />)
            : statCards.map(({ label, value, icon, gradient }, i) => (
                <StatCard key={label} label={label} value={value} icon={icon} gradient={gradient} delay={i * 60} />
              ))
          }
        </div>

        {/* Unread contacts alert */}
        {!loading && (stats?.unreadContacts ?? 0) > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 font-medium">
              You have <strong>{stats!.unreadContacts}</strong> unread contact message{stats!.unreadContacts !== 1 ? "s" : ""}.
            </p>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Jobs by Category */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-4 rounded-full bg-indigo-500" />
                Jobs by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="skeleton h-52" />
              ) : stats?.jobsByCategory && stats.jobsByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.jobsByCategory.slice(0, 8)} margin={{ left: -20, bottom: 10 }}>
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {stats.jobsByCategory.slice(0, 8).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">No data yet</div>
              )}
            </CardContent>
          </Card>

          {/* Applications by Status */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-4 rounded-full bg-pink-500" />
                Applications by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="skeleton h-44" />
              ) : stats?.applicationsByStatus && stats.applicationsByStatus.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="55%" height={180}>
                    <PieChart>
                      <Pie data={stats.applicationsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={72} innerRadius={40}>
                        {stats.applicationsByStatus.map((entry, i) => (
                          <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {stats.applicationsByStatus.map((s, i) => (
                      <div key={s.status} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[s.status] || CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-xs text-gray-600 capitalize flex-1">{s.status}</span>
                        <span className="text-xs font-bold text-gray-900">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-sm text-gray-400">No data yet</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Users */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" /> Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10" />)
                : stats?.recentUsers?.length ? stats.recentUsers.map(u => (
                    <div key={u._id} className="flex items-center gap-3 group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ background: u.role === "employer" ? "linear-gradient(135deg,#f093fb,#f5576c)" : "linear-gradient(135deg,#4facfe,#00f2fe)" }}>
                        {u.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      <Badge variant={u.role === "employer" ? "default" : "secondary"} className="text-[10px] capitalize shrink-0">
                        {u.role}
                      </Badge>
                    </div>
                  )) : <p className="text-sm text-gray-400">No users yet</p>}
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" /> Recent Jobs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10" />)
                : stats?.recentJobs?.length ? stats.recentJobs.map(j => (
                    <div key={j._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "linear-gradient(135deg,#43e97b,#38f9d7)" }}>
                        <Briefcase className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{j.title}</p>
                        <p className="text-xs text-gray-400 truncate">{j.company}</p>
                      </div>
                      <Badge variant={j.isActive ? "default" : "secondary"} className="text-[10px] shrink-0">
                        {j.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  )) : <p className="text-sm text-gray-400">No jobs yet</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
