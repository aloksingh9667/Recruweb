import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare, Search, Trash2, Mail, Phone,
  ChevronDown, ChevronUp, Eye, RefreshCw, Inbox,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "";

function api(path: string, token: string, opts: RequestInit = {}) {
  return fetch(`${API}/api${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  }).then(r => r.json());
}

const TYPE_COLORS: Record<string, string> = {
  general: "bg-gray-100 text-gray-700",
  support: "bg-blue-100 text-blue-700",
  employer: "bg-purple-100 text-purple-700",
  partnership: "bg-emerald-100 text-emerald-700",
};

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${className}`} />;
}

export default function AdminContacts() {
  const { token } = useAdminAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const isReadParam = filter === "all" ? "all" : filter === "unread" ? "false" : "true";

  const { data, isLoading } = useQuery({
    queryKey: ["admin-contacts", search, filter, page],
    queryFn: () => api(`/admin/contacts?search=${encodeURIComponent(search)}&isRead=${isReadParam}&page=${page}&limit=15`, token!),
    enabled: !!token,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api(`/admin/contacts/${id}/read`, token!, { method: "PUT" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-contacts"] }),
  });

  const del = useMutation({
    mutationFn: (id: string) => api(`/admin/contacts/${id}`, token!, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-contacts"] });
      toast({ title: "Deleted" });
    },
  });

  const contacts: any[] = data?.contacts || [];
  const total: number = data?.total || 0;
  const unread: number = data?.unread || 0;

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">Contact Us</h1>
                <p className="text-xs text-gray-500 mt-0.5">{total} total · {unread} unread</p>
              </div>
            </div>
          </div>
          <button onClick={() => qc.invalidateQueries({ queryKey: ["admin-contacts"] })} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, subject…"
              className="pl-9 h-9"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "unread", "read"] as const).map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                  filter === f ? "bg-cyan-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f === "all" ? "All" : f === "unread" ? `Unread${unread ? ` (${unread})` : ""}` : "Read"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-4">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-400 font-medium">No messages yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {contacts.map((c: any) => (
                <div key={c._id} className={`transition-colors ${!c.isRead ? "bg-cyan-50/40" : ""}`}>
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${!c.isRead ? "bg-cyan-500" : "bg-transparent"}`} />
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {c.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(expanded === c._id ? null : c._id)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold text-gray-900 ${!c.isRead ? "font-black" : ""}`}>{c.name}</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize ${TYPE_COLORS[c.type] || TYPE_COLORS.general}`}>{c.type}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{c.subject}</p>
                    </div>
                    <p className="text-[11px] text-gray-400 hidden sm:block shrink-0">{new Date(c.createdAt).toLocaleDateString("en-IN")}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      {!c.isRead && (
                        <button
                          onClick={() => markRead.mutate(c._id)}
                          title="Mark as read"
                          className="p-1.5 rounded-lg text-cyan-600 hover:bg-cyan-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => del.mutate(c._id)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setExpanded(expanded === c._id ? null : c._id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                        {expanded === c._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {expanded === c._id && (
                    <div className="px-5 pb-4 pt-1 border-t border-gray-100 bg-gray-50/60" style={{ animation: "fadeIn .2s ease both" }}>
                      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
                      <div className="flex flex-wrap gap-4 mb-3 text-xs text-gray-600">
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 hover:text-indigo-600">
                          <Mail className="w-3.5 h-3.5" />{c.email}
                        </a>
                        {c.phone && (
                          <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 hover:text-indigo-600">
                            <Phone className="w-3.5 h-3.5" />{c.phone}
                          </a>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">{c.subject}</p>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{c.message}</p>
                      <div className="flex gap-2 mt-3">
                        <a
                          href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                        >
                          <Mail className="w-3 h-3" />Reply via Email
                        </a>
                      </div>
                    </div>
                  )}
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
