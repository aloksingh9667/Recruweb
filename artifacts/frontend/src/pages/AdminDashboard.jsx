import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { fetchApi } from "@/lib/api";
import {
  Users, Briefcase, FileText, TrendingUp, Building2,
  Shield, LogOut, Search, Ban, Trash2, CheckCircle,
  XCircle, ChevronRight, BarChart3, AlertCircle, RefreshCw,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{value ?? "—"}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        {sub && <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

const TABS = ["Overview", "Users", "Jobs", "Applications"];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [tab, setTab] = useState("Overview");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [jobSearch, setJobSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const admin = JSON.parse(localStorage.getItem("recruweb_admin") || "null");

  useEffect(() => {
    const token = localStorage.getItem("recruweb_token");
    if (!token || !admin || admin.role !== "admin") {
      setLocation("/admin/login");
      return;
    }
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [s, u, j, a] = await Promise.all([
        fetchApi("/admin/stats"),
        fetchApi("/admin/users?limit=100"),
        fetchApi("/admin/jobs?limit=100"),
        fetchApi("/admin/applications?limit=100"),
      ]);
      setStats(s);
      setUsers(u.users || []);
      setJobs(j.jobs || []);
      setApps(a.applications || []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  const logout = () => {
    localStorage.removeItem("recruweb_token");
    localStorage.removeItem("recruweb_admin");
    setLocation("/admin/login");
  };

  const toggleBan = async (userId, isBanned) => {
    setActionLoading(userId);
    try {
      await fetchApi(`/admin/users/${userId}/toggle-ban`, { method: "PUT" });
      setUsers(prev => prev.map(u => u.id === userId || u._id === userId ? { ...u, isBanned: !isBanned } : u));
    } finally { setActionLoading(""); }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Delete this user and all their data?")) return;
    setActionLoading(userId + "_del");
    try {
      await fetchApi(`/admin/users/${userId}`, { method: "DELETE" });
      setUsers(prev => prev.filter(u => u.id !== userId && u._id !== userId));
    } finally { setActionLoading(""); }
  };

  const toggleJobStatus = async (jobId, approve) => {
    setActionLoading(jobId);
    try {
      await fetchApi(`/admin/jobs/${jobId}/${approve ? "approve" : "reject"}`, { method: "PUT" });
      setJobs(prev => prev.map(j => (j._id || j.id) === jobId ? { ...j, isActive: approve, adminStatus: approve ? "approved" : "rejected" } : j));
    } finally { setActionLoading(""); }
  };

  const deleteJob = async (jobId) => {
    if (!confirm("Delete this job permanently?")) return;
    setActionLoading(jobId + "_del");
    try {
      await fetchApi(`/admin/jobs/${jobId}`, { method: "DELETE" });
      setJobs(prev => prev.filter(j => (j._id || j.id) !== jobId));
    } finally { setActionLoading(""); }
  };

  const filteredUsers = users.filter(u => {
    const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
    const matchSearch = !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  const filteredJobs = jobs.filter(j =>
    !jobSearch || j.title?.toLowerCase().includes(jobSearch.toLowerCase()) || j.company?.toLowerCase().includes(jobSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-sm">Recruweb Admin</span>
              <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">Control Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAll} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{admin?.name}</span>
            <button onClick={logout}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Tab strip */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 pb-0">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${tab === t ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl px-4 py-3 text-sm mb-5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 h-28 animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === "Overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} color="#6366f1" sub={`${stats?.totalCandidates} candidates`} />
                  <StatCard icon={Building2} label="Employers" value={stats?.totalEmployers} color="#8b5cf6" />
                  <StatCard icon={Briefcase} label="Total Jobs" value={stats?.totalJobs} color="#3b82f6" sub={`${stats?.activeJobs} active`} />
                  <StatCard icon={FileText} label="Applications" value={stats?.totalApplications} color="#10b981" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Users */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-500" /> Recent Signups
                    </h3>
                    <div className="space-y-3">
                      {(stats?.recentUsers || []).map(u => (
                        <div key={u.id || u._id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: u.role === "employer" ? "#8b5cf6" : "#6366f1" }}>
                            {(u.name||"?")[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{u.name}</p>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === "employer" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"}`}>
                            {u.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Jobs */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-500" /> Recent Jobs
                    </h3>
                    <div className="space-y-3">
                      {(stats?.recentJobs || []).map(j => (
                        <div key={j.id || j._id} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{j.title}</p>
                            <p className="text-xs text-gray-500 truncate">{j.company}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${j.isActive ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                            {j.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Applications by status */}
                {stats?.applicationsByStatus?.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-green-500" /> Applications by Status
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {stats.applicationsByStatus.map(s => (
                        <div key={s.status} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3">
                          <span className="text-xl font-extrabold text-gray-900 dark:text-white">{s.count}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{s.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* USERS */}
            {tab === "Users" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                      placeholder="Search users…"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-400 transition-colors" />
                  </div>
                  <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-white outline-none">
                    <option value="all">All Roles</option>
                    <option value="candidate">Candidates</option>
                    <option value="employer">Employers</option>
                  </select>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">User</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Role</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden sm:table-cell">Status</th>
                          <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filteredUsers.map(u => {
                          const uid = u.id || u._id;
                          return (
                            <tr key={uid} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{u.name}</p>
                                  <p className="text-xs text-gray-500">{u.email}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${u.role === "employer" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-4 py-3 hidden sm:table-cell">
                                {u.isBanned
                                  ? <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">Banned</span>
                                  : <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Active</span>
                                }
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => toggleBan(uid, u.isBanned)}
                                    disabled={actionLoading === uid}
                                    title={u.isBanned ? "Unban user" : "Ban user"}
                                    className={`p-1.5 rounded-lg transition-colors ${u.isBanned ? "bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200" : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 hover:bg-amber-200"}`}>
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => deleteUser(uid)}
                                    disabled={actionLoading === uid + "_del"}
                                    title="Delete user"
                                    className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-10 text-gray-400 text-sm">No users found</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* JOBS */}
            {tab === "Jobs" && (
              <div className="space-y-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={jobSearch} onChange={e => setJobSearch(e.target.value)}
                    placeholder="Search jobs…"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-400 transition-colors" />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Job</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden sm:table-cell">Status</th>
                          <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filteredJobs.map(j => {
                          const jid = j._id || j.id;
                          return (
                            <tr key={jid} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-semibold text-gray-900 dark:text-white">{j.title}</p>
                                <p className="text-xs text-gray-500">{j.company} · {j.location}</p>
                              </td>
                              <td className="px-4 py-3 hidden sm:table-cell">
                                {j.isActive
                                  ? <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Active</span>
                                  : <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">Inactive</span>
                                }
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => toggleJobStatus(jid, !j.isActive)}
                                    disabled={actionLoading === jid}
                                    title={j.isActive ? "Deactivate" : "Activate"}
                                    className={`p-1.5 rounded-lg transition-colors ${j.isActive ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 hover:bg-amber-200" : "bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200"}`}>
                                    {j.isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                  </button>
                                  <button onClick={() => deleteJob(jid)}
                                    disabled={actionLoading === jid + "_del"}
                                    className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredJobs.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">No jobs found</div>}
                  </div>
                </div>
              </div>
            )}

            {/* APPLICATIONS */}
            {tab === "Applications" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Candidate</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden sm:table-cell">Job</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                      {apps.map(a => (
                        <tr key={a._id || a.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-900 dark:text-white">{a.candidateId?.name || "Unknown"}</p>
                            <p className="text-xs text-gray-500">{a.candidateId?.email || ""}</p>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <p className="text-gray-900 dark:text-white">{a.jobId?.title || "—"}</p>
                            <p className="text-xs text-gray-500">{a.jobId?.company || ""}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${
                              a.status === "accepted" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : a.status === "rejected" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            }`}>
                              {a.status || "pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {apps.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">No applications found</div>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
