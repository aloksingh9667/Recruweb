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
import { Search, Ban, Trash2, UserCheck, RefreshCw, Building2 } from "lucide-react";

interface Employer {
  _id: string;
  name: string;
  email: string;
  company?: string;
  isBanned: boolean;
  createdAt: string;
}

export default function AdminEmployers() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15", role: "employer" });
      if (search) params.set("search", search);
      const data = await fetchAdmin(`/admin/users?${params}`);
      setEmployers(data.users);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const toggleBan = async (id: string) => {
    setActionLoading(id + "-ban");
    try {
      const updated = await fetchAdmin(`/admin/users/${id}/toggle-ban`, { method: "PUT" });
      setEmployers(e => e.map(x => x._id === id ? { ...x, isBanned: updated.isBanned } : x));
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  };

  const deleteEmployer = async (id: string) => {
    setActionLoading(id + "-del");
    try {
      await fetchAdmin(`/admin/users/${id}`, { method: "DELETE" });
      setEmployers(e => e.filter(x => x._id !== id));
      setTotal(t => t - 1);
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Employers</h1>
            <p className="text-muted-foreground text-sm mt-1">{total} registered employers</p>
          </div>
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={e => { e.preventDefault(); setPage(1); load(); }} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search employer name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" size="sm">Search</Button>
            </form>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">All Employers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
            ) : employers.length === 0 ? (
              <div className="p-8 text-center">
                <Building2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No employers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 pl-6 font-medium text-muted-foreground">Employer</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Company</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Joined</th>
                      <th className="text-right p-3 pr-6 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employers.map(e => (
                      <tr key={e._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="p-3 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-600 shrink-0">
                              {e.name[0]}
                            </div>
                            <div>
                              <p className="font-medium">{e.name}</p>
                              <p className="text-xs text-muted-foreground">{e.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-muted-foreground">{e.company || "—"}</span>
                        </td>
                        <td className="p-3">
                          <Badge variant={e.isBanned ? "destructive" : "default"} className="text-xs">
                            {e.isBanned ? "Banned" : "Active"}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {new Date(e.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-3 pr-6">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant={e.isBanned ? "outline" : "secondary"}
                              className="gap-1.5 h-7 px-2 text-xs"
                              onClick={() => toggleBan(e._id)}
                              disabled={actionLoading === e._id + "-ban"}
                            >
                              {e.isBanned ? <UserCheck className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                              {e.isBanned ? "Unban" : "Ban"}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive" className="gap-1.5 h-7 px-2 text-xs">
                                  <Trash2 className="w-3 h-3" /> Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete employer?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete <strong>{e.name}</strong> and all their jobs and data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteEmployer(e._id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
