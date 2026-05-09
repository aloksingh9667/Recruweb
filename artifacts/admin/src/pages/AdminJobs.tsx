import { useEffect, useState, useCallback } from "react";
import { fetchAdmin } from "@/lib/api";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, CheckCircle, XCircle, Trash2, RefreshCw, MapPin, Building2 } from "lucide-react";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  employmentType: string;
  isActive: boolean;
  adminStatus: string;
  createdAt: string;
  applicantCount?: number;
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const data = await fetchAdmin(`/admin/jobs?${params}`);
      setJobs(data.jobs);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const approveJob = async (id: string) => {
    setActionLoading(id + "-approve");
    try {
      const updated = await fetchAdmin(`/admin/jobs/${id}/approve`, { method: "PUT" });
      setJobs(j => j.map(x => x._id === id ? { ...x, adminStatus: updated.adminStatus, isActive: updated.isActive } : x));
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  };

  const rejectJob = async (id: string) => {
    setActionLoading(id + "-reject");
    try {
      const updated = await fetchAdmin(`/admin/jobs/${id}/reject`, { method: "PUT" });
      setJobs(j => j.map(x => x._id === id ? { ...x, adminStatus: updated.adminStatus, isActive: updated.isActive } : x));
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  };

  const deleteJob = async (id: string) => {
    setActionLoading(id + "-del");
    try {
      await fetchAdmin(`/admin/jobs/${id}`, { method: "DELETE" });
      setJobs(j => j.filter(x => x._id !== id));
      setTotal(t => t - 1);
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  };

  const statusBadge = (job: Job) => {
    if (job.adminStatus === "rejected") return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
    if (!job.isActive) return <Badge variant="secondary" className="text-xs">Inactive</Badge>;
    return <Badge className="text-xs bg-green-500/15 text-green-700 border-green-200">Active</Badge>;
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Jobs</h1>
            <p className="text-muted-foreground text-sm mt-1">{total} total jobs</p>
          </div>
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3 flex-wrap">
              <form className="relative flex-1 min-w-48" onSubmit={e => { e.preventDefault(); setPage(1); load(); }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search title or company..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </form>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "all", label: "All" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "pending", label: "Pending" },
                  { value: "rejected", label: "Rejected" },
                ].map(s => (
                  <Button
                    key={s.value}
                    size="sm"
                    variant={statusFilter === s.value ? "default" : "outline"}
                    onClick={() => { setStatusFilter(s.value); setPage(1); }}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">All Jobs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No jobs found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 pl-6 font-medium text-muted-foreground">Job</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Posted</th>
                      <th className="text-right p-3 pr-6 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="p-3 pl-6">
                          <p className="font-medium">{j.title}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="w-3 h-3" /> {j.company}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" /> {j.location}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">{j.category}</Badge>
                        </td>
                        <td className="p-3">
                          <span className="text-xs text-muted-foreground capitalize">{j.employmentType}</span>
                        </td>
                        <td className="p-3">{statusBadge(j)}</td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {new Date(j.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-3 pr-6">
                          <div className="flex gap-1.5 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                              onClick={() => approveJob(j._id)}
                              disabled={!!actionLoading}
                            >
                              <CheckCircle className="w-3 h-3" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 h-7 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                              onClick={() => rejectJob(j._id)}
                              disabled={!!actionLoading}
                            >
                              <XCircle className="w-3 h-3" /> Reject
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive" className="h-7 px-2 text-xs">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete job?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete <strong>{j.title}</strong> at {j.company} and all its applications.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteJob(j._id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
