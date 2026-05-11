import { useEffect, useState, useCallback } from "react";
import { fetchAdmin } from "@/lib/api";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search, Ban, Trash2, UserCheck, RefreshCw, Building2,
  Briefcase, Mail, Calendar, ChevronLeft, ChevronRight, X,
  Globe, MapPin,
} from "lucide-react";

interface Employer {
  _id: string; name: string; email: string; isBanned: boolean; createdAt: string;
  jobCount: number; activeJobCount: number;
  profile?: { company?: string; industry?: string; website?: string; location?: string; description?: string };
}

const STATUS_FILTERS = [
  { value: "all",    label: "All" },
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" },
];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3 animate-pulse">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded-full w-3/4" />
          <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded-full w-full" />
      <div className="flex gap-2">
        <div className="h-7 bg-gray-100 rounded-xl flex-1" />
        <div className="h-7 bg-gray-100 rounded-xl flex-1" />
      </div>
    </div>
  );
}

export default function AdminEmployers() {
  const { toast } = useToast();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const data = await fetchAdmin(`/admin/employers?${params}`);
      setEmployers(data.employers);
      setTotal(data.total);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const toggleBan = async (id: string) => {
    setActionLoading(id + "-ban");
    try {
      const updated = await fetchAdmin(`/admin/users/${id}/toggle-ban`, { method: "PUT" });
      setEmployers(e => e.map(x => x._id === id ? { ...x, isBanned: updated.isBanned } : x));
      toast({ title: updated.isBanned ? "Employer banned" : "Employer unbanned" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteEmployer = async (id: string) => {
    setActionLoading(id + "-del");
    try {
      await fetchAdmin(`/admin/users/${id}`, { method: "DELETE" });
      setEmployers(e => e.filter(x => x._id !== id));
      setTotal(t => t - 1);
      if (expandedId === id) setExpandedId(null);
      toast({ title: "Employer deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Employers</h1>
            <p className="text-gray-500 text-sm mt-0.5">{total.toLocaleString()} registered employers</p>
          </div>
          <Button variant="outline" size="sm" onClick={load} className="gap-2 rounded-xl">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search employer name or email…"
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
          <div className="flex gap-1">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === f.value
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : employers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No employers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {employers.map(e => {
              const isExpanded = expandedId === e._id;
              return (
                <div
                  key={e._id}
                  className={`bg-white rounded-2xl border shadow-sm p-5 transition-all duration-200 ${
                    isExpanded ? "border-purple-200 shadow-md" : "border-gray-100 hover:border-purple-100 hover:shadow"
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white shrink-0"
                      style={{ background: "linear-gradient(135deg,#f093fb,#f5576c)" }}>
                      {e.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{e.name}</p>
                      {e.profile?.company && (
                        <p className="text-xs text-purple-600 font-medium truncate">{e.profile.company}</p>
                      )}
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          e.isBanned ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${e.isBanned ? "bg-red-500" : "bg-emerald-500"}`} />
                          {e.isBanned ? "Banned" : "Active"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex gap-3 mt-4">
                    <div className="flex-1 bg-purple-50 rounded-xl p-2.5 text-center">
                      <p className="text-lg font-black text-purple-700">{e.jobCount}</p>
                      <p className="text-[10px] text-purple-500 font-medium">Total Jobs</p>
                    </div>
                    <div className="flex-1 bg-emerald-50 rounded-xl p-2.5 text-center">
                      <p className="text-lg font-black text-emerald-700">{e.activeJobCount}</p>
                      <p className="text-[10px] text-emerald-500 font-medium">Active Jobs</p>
                    </div>
                  </div>

                  {/* Expandable toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : e._id)}
                    className="mt-3 w-full text-xs text-gray-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-1"
                  >
                    {isExpanded ? "Hide details ▲" : "Show details ▼"}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2" style={{ animation: "fadeDown .2s ease" }}>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        <a href={`mailto:${e.email}`} className="truncate hover:text-indigo-600">{e.email}</a>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        Joined {new Date(e.createdAt).toLocaleDateString("en-IN")}
                      </div>
                      {e.profile?.industry && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Briefcase className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                          {e.profile.industry}
                        </div>
                      )}
                      {e.profile?.location && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                          {e.profile.location}
                        </div>
                      )}
                      {e.profile?.website && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Globe className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                          <a href={e.profile.website} target="_blank" rel="noopener noreferrer"
                            className="text-indigo-500 hover:underline truncate">
                            {e.profile.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}
                      {e.profile?.description && (
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 mt-1">{e.profile.description}</p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant={e.isBanned ? "outline" : "secondary"}
                      className="flex-1 h-8 text-xs rounded-xl gap-1"
                      onClick={() => toggleBan(e._id)}
                      disabled={actionLoading === e._id + "-ban"}
                    >
                      {e.isBanned ? <><UserCheck className="w-3 h-3" />Unban</> : <><Ban className="w-3 h-3" />Ban</>}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" className="h-8 px-3 text-xs rounded-xl" disabled={!!actionLoading}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete employer?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently deletes <strong>{e.name}</strong> and all their {e.jobCount} job(s) and related data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteEmployer(e._id)} className="bg-destructive rounded-xl">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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

        <style>{`@keyframes fadeDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}`}</style>
      </div>
    </AdminLayout>
  );
}
