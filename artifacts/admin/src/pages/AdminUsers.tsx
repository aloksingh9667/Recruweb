import { useEffect, useState, useCallback } from "react";
import { fetchAdmin } from "@/lib/api";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search, Ban, Trash2, UserCheck, RefreshCw, X,
  Mail, Calendar, Briefcase, FileText, ChevronLeft, ChevronRight,
} from "lucide-react";

interface User {
  _id: string; name: string; email: string;
  role: string; isBanned: boolean; createdAt: string;
}

interface UserDetail extends User {
  profile: any;
  appCount: number;
  jobCount: number;
}

function SkeletonRow() {
  return (
    <tr className="border-b">
      {[1,2,3,4,5].map(i => (
        <td key={i} className="p-3">
          <div className="h-4 rounded-full bg-gray-100 animate-pulse" style={{ width: `${50 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

function RolePill({ role }: { role: string }) {
  const styles: Record<string, string> = {
    candidate: "bg-blue-50 text-blue-700 border-blue-200",
    employer:  "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${styles[role] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
      {role}
    </span>
  );
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => { setPage(1); }, [debouncedSearch, roleFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (roleFilter !== "all") params.set("role", roleFilter);
      const data = await fetchAdmin(`/admin/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetailUser(null);
    try {
      const data = await fetchAdmin(`/admin/users/${id}`);
      setDetailUser({ ...data.user, profile: data.profile, appCount: data.appCount, jobCount: data.jobCount });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleBan = async (id: string) => {
    setActionLoading(id + "-ban");
    try {
      const updated = await fetchAdmin(`/admin/users/${id}/toggle-ban`, { method: "PUT" });
      setUsers(u => u.map(x => x._id === id ? { ...x, isBanned: updated.isBanned } : x));
      if (detailUser?._id === id) setDetailUser(d => d ? { ...d, isBanned: updated.isBanned } : null);
      toast({ title: updated.isBanned ? "User banned" : "User unbanned" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (id: string) => {
    setActionLoading(id + "-del");
    try {
      await fetchAdmin(`/admin/users/${id}`, { method: "DELETE" });
      setUsers(u => u.filter(x => x._id !== id));
      setTotal(t => t - 1);
      if (detailUser?._id === id) setDetailUser(null);
      toast({ title: "User deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <AdminLayout>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}`}</style>

      <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Users</h1>
            <p className="text-gray-500 text-sm mt-0.5">{total.toLocaleString()} registered users</p>
          </div>
          <Button variant="outline" size="sm" onClick={load} className="gap-2 rounded-xl">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 rounded-xl border-gray-200"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {["all", "candidate", "employer"].map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                    roleFilter === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table + Detail panel */}
        <div className="flex gap-4">
          {/* Table */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-700">All Users</h2>
              <span className="text-xs text-gray-400">{total} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    <th className="text-left p-3 pl-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                    <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                    <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                    <th className="text-right p-3 pr-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                    : users.length === 0
                    ? (
                      <tr><td colSpan={5} className="p-12 text-center text-sm text-gray-400">No users found</td></tr>
                    ) : users.map(u => (
                      <tr
                        key={u._id}
                        className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors cursor-pointer"
                        onClick={() => openDetail(u._id)}
                      >
                        <td className="p-3 pl-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ background: u.role === "employer" ? "linear-gradient(135deg,#f093fb,#f5576c)" : "linear-gradient(135deg,#4facfe,#00f2fe)" }}>
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{u.name}</p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3"><RolePill role={u.role} /></td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.isBanned ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.isBanned ? "bg-red-500" : "bg-emerald-500"}`} />
                            {u.isBanned ? "Banned" : "Active"}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-3 pr-5">
                          <div className="flex gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant={u.isBanned ? "outline" : "secondary"}
                              className="gap-1 h-7 px-2 text-xs rounded-lg"
                              onClick={() => toggleBan(u._id)}
                              disabled={actionLoading === u._id + "-ban"}
                            >
                              {u.isBanned ? <UserCheck className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                              {u.isBanned ? "Unban" : "Ban"}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive" className="h-7 px-2 text-xs rounded-lg">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete user?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This permanently deletes <strong>{u.name}</strong> and all their data including jobs, applications, and profiles.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteUser(u._id)} className="bg-destructive hover:bg-destructive/90 rounded-xl">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail Panel */}
          {(detailUser || detailLoading) && (
            <div className="w-72 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 self-start"
              style={{ animation: "slideIn .25s ease both" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">User Profile</h3>
                <button onClick={() => setDetailUser(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {detailLoading ? (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => <div key={i} className="h-6 rounded-full bg-gray-100 animate-pulse" />)}
                </div>
              ) : detailUser && (
                <>
                  <div className="flex flex-col items-center gap-2 py-3">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                      style={{ background: detailUser.role === "employer" ? "linear-gradient(135deg,#f093fb,#f5576c)" : "linear-gradient(135deg,#4facfe,#00f2fe)" }}>
                      {detailUser.name?.[0]?.toUpperCase()}
                    </div>
                    <p className="font-bold text-gray-900 text-base">{detailUser.name}</p>
                    <RolePill role={detailUser.role} />
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-gray-300" />
                      <span className="truncate text-xs">{detailUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-300" />
                      <span className="text-xs">Joined {new Date(detailUser.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                    {detailUser.role === "candidate" && (
                      <>
                        {detailUser.profile?.currentTitle && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Briefcase className="w-3.5 h-3.5 shrink-0 text-gray-300" />
                            <span className="text-xs">{detailUser.profile.currentTitle}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-500">
                          <FileText className="w-3.5 h-3.5 shrink-0 text-gray-300" />
                          <span className="text-xs">{detailUser.appCount} application{detailUser.appCount !== 1 ? "s" : ""}</span>
                        </div>
                        {detailUser.profile?.skills?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Skills</p>
                            <div className="flex flex-wrap gap-1">
                              {detailUser.profile.skills.slice(0, 8).map((s: string, i: number) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {detailUser.role === "employer" && (
                      <>
                        {detailUser.profile?.company && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Briefcase className="w-3.5 h-3.5 shrink-0 text-gray-300" />
                            <span className="text-xs">{detailUser.profile.company}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-500">
                          <FileText className="w-3.5 h-3.5 shrink-0 text-gray-300" />
                          <span className="text-xs">{detailUser.jobCount} job{detailUser.jobCount !== 1 ? "s" : ""} posted</span>
                        </div>
                        {detailUser.profile?.industry && (
                          <div className="text-xs text-gray-400">Industry: {detailUser.profile.industry}</div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant={detailUser.isBanned ? "outline" : "secondary"}
                      className="flex-1 h-8 text-xs rounded-xl gap-1"
                      onClick={() => toggleBan(detailUser._id)}
                      disabled={!!actionLoading}
                    >
                      {detailUser.isBanned ? <><UserCheck className="w-3 h-3"/>Unban</> : <><Ban className="w-3 h-3"/>Ban</>}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" className="h-8 px-3 text-xs rounded-xl">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {detailUser.name}?</AlertDialogTitle>
                          <AlertDialogDescription>All their data will be permanently removed.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteUser(detailUser._id)} className="bg-destructive rounded-xl">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-xl gap-1">
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <span className="text-sm text-gray-500 px-2">Page {page} of {totalPages}</span>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
