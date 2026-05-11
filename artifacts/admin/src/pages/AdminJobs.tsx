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
  Search, CheckCircle, XCircle, Trash2, RefreshCw,
  MapPin, Building2, Users, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, Eye, EyeOff, X,
} from "lucide-react";

interface Job {
  _id: string; title: string; company: string; location: string;
  category: string; employmentType: string; isActive: boolean;
  adminStatus: string; createdAt: string; applicantCount?: number;
}

function StatusBadge({ job }: { job: Job }) {
  if (job.adminStatus === "rejected") return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">✗ Rejected</span>;
  if (!job.isActive) return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">○ Inactive</span>;
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">● Active</span>;
}

function SkeletonRow() {
  return (
    <tr className="border-b">
      {[1,2,3,4,5,6].map(i => (
        <td key={i} className="p-3">
          <div className="h-4 rounded-full bg-gray-100 animate-pulse" style={{ width: `${40 + i * 8}%` }} />
        </td>
      ))}
    </tr>
  );
}

const FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminJobs() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const data = await fetchAdmin(`/admin/jobs?${params}`);
      setJobs(data.jobs);
      setTotal(data.total);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const approveJob = async (id: string) => {
    setActionLoading(id + "-approve");
    try {
      const updated = await fetchAdmin(`/admin/jobs/${id}/approve`, { method: "PUT" });
      setJobs(j => j.map(x => x._id === id ? { ...x, adminStatus: updated.adminStatus, isActive: updated.isActive } : x));
      toast({ title: "Job approved ✓" });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setActionLoading(null); }
  };

  const rejectJob = async (id: string) => {
    setActionLoading(id + "-reject");
    try {
      const updated = await fetchAdmin(`/admin/jobs/${id}/reject`, { method: "PUT" });
      setJobs(j => j.map(x => x._id === id ? { ...x, adminStatus: updated.adminStatus, isActive: updated.isActive } : x));
      toast({ title: "Job rejected" });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setActionLoading(null); }
  };

  const toggleActive = async (id: string) => {
    setActionLoading(id + "-toggle");
    try {
      const updated = await fetchAdmin(`/admin/jobs/${id}/toggle-active`, { method: "PUT" });
      setJobs(j => j.map(x => x._id === id ? { ...x, isActive: updated.isActive } : x));
      toast({ title: updated.isActive ? "Job activated" : "Job deactivated" });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setActionLoading(null); }
  };

  const deleteJob = async (id: string) => {
    setActionLoading(id + "-del");
    try {
      await fetchAdmin(`/admin/jobs/${id}`, { method: "DELETE" });
      setJobs(j => j.filter(x => x._id !== id));
      setTotal(t => t - 1);
      toast({ title: "Job deleted" });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setActionLoading(null); }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Jobs</h1>
            <p className="text-gray-500 text-sm mt-0.5">{total.toLocaleString()} total jobs</p>
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
                placeholder="Search title, company or location…"
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
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl flex-wrap">
              {FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => { setStatusFilter(f.value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === f.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700">All Jobs</h2>
            <span className="text-xs text-gray-400">{total} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="text-left p-3 pl-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Applicants</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Posted</th>
                  <th className="text-right p-3 pr-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                  : jobs.length === 0
                  ? (
                    <tr><td colSpan={6} className="p-12 text-center text-sm text-gray-400">No jobs found</td></tr>
                  ) : jobs.map(j => (
                    <tr key={j._id} className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors">
                      <td className="p-3 pl-5">
                        <p className="font-semibold text-gray-900">{j.title}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{j.company}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{j.location}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">{j.category}</span>
                      </td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="w-3 h-3" /> {j.applicantCount ?? 0}
                        </span>
                      </td>
                      <td className="p-3"><StatusBadge job={j} /></td>
                      <td className="p-3 text-xs text-gray-400">
                        {new Date(j.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-3 pr-5">
                        <div className="flex gap-1 justify-end flex-wrap">
                          {/* Approve */}
                          <button
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 transition-colors"
                            onClick={() => approveJob(j._id)}
                            disabled={!!actionLoading}
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          {/* Reject */}
                          <button
                            className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 disabled:opacity-40 transition-colors"
                            onClick={() => rejectJob(j._id)}
                            disabled={!!actionLoading}
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          {/* Toggle active */}
                          <button
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 disabled:opacity-40 transition-colors"
                            onClick={() => toggleActive(j._id)}
                            disabled={!!actionLoading}
                            title={j.isActive ? "Deactivate" : "Activate"}
                          >
                            {j.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {/* Delete */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete job?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Permanently delete <strong>{j.title}</strong> at {j.company} and all its {j.applicantCount ?? 0} application(s)?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteJob(j._id)} className="bg-destructive rounded-xl">Delete</AlertDialogAction>
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
