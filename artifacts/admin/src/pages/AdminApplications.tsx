import { useEffect, useState, useCallback } from "react";
import { fetchAdmin } from "@/lib/api";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  RefreshCw, FileText, Search, X, ChevronLeft, ChevronRight,
  CalendarDays, ChevronDown, ChevronUp, Trash2,
} from "lucide-react";

interface Application {
  _id: string;
  status: string;
  createdAt: string;
  coverLetter?: string;
  jobId?: { _id: string; title: string; company: string };
  candidateId?: { _id: string; name: string; email: string };
}

const STATUS_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending:     { label: "Pending",     bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400"  },
  reviewed:    { label: "Reviewed",    bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500"   },
  shortlisted: { label: "Shortlisted", bg: "bg-purple-50",  text: "text-purple-700",  dot: "bg-purple-500" },
  rejected:    { label: "Rejected",    bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500"    },
  hired:       { label: "Hired",       bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500"},
};

const ALL_STATUSES = ["pending", "reviewed", "shortlisted", "rejected", "hired"];

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] || { label: status, bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${m.bg} ${m.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function StatusSelect({ value, onSave, disabled }: { value: string; onSave: (s: string) => void; disabled: boolean }) {
  const [local, setLocal] = useState(value);
  const [saving, setSaving] = useState(false);
  const changed = local !== value;

  const save = async () => {
    setSaving(true);
    await onSave(local);
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={local}
        onChange={e => setLocal(e.target.value)}
        disabled={disabled || saving}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200 disabled:opacity-60 cursor-pointer"
      >
        {ALL_STATUSES.map(s => (
          <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>
        ))}
      </select>
      {changed && (
        <button
          onClick={save}
          disabled={saving}
          className="text-[11px] px-2 py-1 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors whitespace-nowrap"
        >
          {saving ? "…" : "Save"}
        </button>
      )}
    </div>
  );
}

function CoverLetterCell({ text }: { text?: string }) {
  const [open, setOpen] = useState(false);
  if (!text) return <span className="text-xs text-gray-300 italic">—</span>;
  return (
    <div className="max-w-xs">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
      >
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {open ? "Hide" : "View"}
      </button>
      {open && (
        <div className="mt-2 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-gray-700 leading-relaxed whitespace-pre-line max-h-36 overflow-y-auto">
          {text}
        </div>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b">
      {[1,2,3,4,5,6].map(i => (
        <td key={i} className="p-3">
          <div className="h-4 rounded-full bg-gray-100 animate-pulse" style={{ width: `${45 + i * 7}%` }} />
        </td>
      ))}
    </tr>
  );
}

const STATUS_FILTERS = ["all", "pending", "reviewed", "shortlisted", "rejected", "hired"];

export default function AdminApplications() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const data = await fetchAdmin(`/admin/applications?${params}`);
      setApplications(data.applications);
      setTotal(data.total);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id + "-status");
    try {
      const updated = await fetchAdmin(`/admin/applications/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setApplications(apps => apps.map(a => a._id === id ? { ...a, status: updated.status } : a));
      toast({ title: `Status updated to ${STATUS_META[status]?.label || status}` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteApp = async (id: string) => {
    setActionLoading(id + "-del");
    try {
      await fetchAdmin(`/admin/applications/${id}`, { method: "DELETE" });
      setApplications(apps => apps.filter(a => a._id !== id));
      setTotal(t => t - 1);
      toast({ title: "Application deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Applications</h1>
            <p className="text-gray-500 text-sm mt-0.5">{total.toLocaleString()} total applications</p>
          </div>
          <Button variant="outline" size="sm" onClick={load} className="gap-2 rounded-xl">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search candidate name, email, job or company…"
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
          <div className="flex gap-1 flex-wrap">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  statusFilter === s
                    ? "bg-pink-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {s === "all" ? "All" : STATUS_META[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700">All Applications</h2>
            <span className="text-xs text-gray-400">{total} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="text-left p-3 pl-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Candidate</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cover Letter</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Applied</th>
                  <th className="text-right p-3 pr-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
                  : applications.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="p-16 text-center">
                        <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">No applications found</p>
                      </td>
                    </tr>
                  ) : applications.map(a => (
                    <tr key={a._id} className="border-b border-gray-50 hover:bg-pink-50/20 transition-colors">
                      <td className="p-3 pl-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {((a.candidateId as any)?.name?.[0] || "?").toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{(a.candidateId as any)?.name || "Unknown"}</p>
                            <p className="text-xs text-gray-400">{(a.candidateId as any)?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-gray-900">{(a.jobId as any)?.title || "Unknown Job"}</p>
                        <p className="text-xs text-gray-400">{(a.jobId as any)?.company}</p>
                      </td>
                      <td className="p-3">
                        <StatusSelect
                          value={a.status}
                          disabled={!!actionLoading}
                          onSave={s => updateStatus(a._id, s)}
                        />
                      </td>
                      <td className="p-3">
                        <CoverLetterCell text={a.coverLetter} />
                      </td>
                      <td className="p-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(a.createdAt).toLocaleDateString("en-IN")}
                        </div>
                      </td>
                      <td className="p-3 pr-5 text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors disabled:opacity-40"
                              disabled={!!actionLoading}
                              title="Delete application"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete application?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Permanently remove <strong>{(a.candidateId as any)?.name}'s</strong> application for <strong>{(a.jobId as any)?.title}</strong>?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteApp(a._id)} className="bg-destructive rounded-xl">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
