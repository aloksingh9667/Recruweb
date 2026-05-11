import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, Trash2, Download, RefreshCw, Mail } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "";

function api(path: string, token: string, opts: RequestInit = {}) {
  return fetch(`${API}/api${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  }).then(r => r.json());
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${className}`} />;
}

export default function AdminSubscribers() {
  const { token } = useAdminAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-subscribers", search, page],
    queryFn: () => api(`/admin/subscribers?search=${encodeURIComponent(search)}&page=${page}&limit=20`, token!),
    enabled: !!token,
  });

  const del = useMutation({
    mutationFn: (id: string) => api(`/admin/subscribers/${id}`, token!, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-subscribers"] });
      toast({ title: "Subscriber removed" });
    },
  });

  const subs: any[] = data?.subscribers || [];
  const total: number = data?.total || 0;

  const exportCSV = () => {
    if (!subs.length) return;
    const csv = ["Email,Source,Date", ...subs.map(s => `${s.email},${s.source},${new Date(s.createdAt).toLocaleDateString()}`)].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "subscribers.csv";
    a.click();
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Newsletter Subscribers</h1>
              <p className="text-xs text-gray-500 mt-0.5">{total} total subscribers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} title="Export CSV" className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={() => qc.invalidateQueries({ queryKey: ["admin-subscribers"] })} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">Total Subscribers</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{total}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">On this page</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{subs.length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by email…"
            className="pl-9 h-9"
          />
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-56" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : subs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-400 font-medium">No subscribers yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {subs.map((s: any, i: number) => (
                <div key={s._id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors" style={{ animation: `fadeUp .3s ease ${i * 30}ms both` }}>
                  <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {s.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{s.email}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 capitalize">via {s.source} · {new Date(s.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <a href={`mailto:${s.email}`} className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-50 transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                  <button onClick={() => del.mutate(s._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <span className="text-sm text-gray-500">Page {page} of {data.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
