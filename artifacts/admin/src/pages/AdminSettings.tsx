import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Save, RefreshCw, ToggleLeft, ToggleRight, Shield, Briefcase, Cpu, Mail } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "";

function api(path: string, token: string, opts: RequestInit = {}) {
  return fetch(`${API}/api${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  }).then(r => r.json());
}

function Toggle({ value, onChange, label, description }: { value: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? "bg-indigo-600" : "bg-gray-200"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${value ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

function Section({ title, icon: Icon, color, children }: { title: string; icon: any; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-5">
      <div className={`px-5 py-4 border-b border-gray-100 flex items-center gap-3`}>
        <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

export default function AdminSettings() {
  const { token } = useAdminAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api("/admin/settings", token!),
    enabled: !!token,
  });

  const [form, setForm] = useState<any>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (settings && !dirty) {
      setForm(settings);
    }
  }, [settings]);

  const upd = (key: string, value: any) => {
    setForm((p: any) => ({ ...p, [key]: value }));
    setDirty(true);
  };

  const save = useMutation({
    mutationFn: () => api("/admin/settings", token!, { method: "PUT", body: JSON.stringify(form) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      setDirty(false);
      toast({ title: "Settings saved", description: "Platform settings updated successfully." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 max-w-2xl mx-auto space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 h-40 animate-pulse" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Platform Settings</h1>
              <p className="text-xs text-gray-500 mt-0.5">Configure Recruweb platform behaviour</p>
            </div>
          </div>
          <button onClick={() => qc.invalidateQueries({ queryKey: ["admin-settings"] })} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* General */}
        <Section title="General Information" icon={Shield} color="bg-gradient-to-br from-indigo-500 to-purple-600">
          <div className="py-3 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Platform Name</label>
              <Input value={form.platformName || ""} onChange={e => upd("platformName", e.target.value)} className="h-9" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Tagline</label>
              <Input value={form.tagline || ""} onChange={e => upd("tagline", e.target.value)} className="h-9" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Contact Email</label>
                <Input value={form.contactEmail || ""} onChange={e => upd("contactEmail", e.target.value)} className="h-9" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Support Phone</label>
                <Input value={form.supportPhone || ""} onChange={e => upd("supportPhone", e.target.value)} className="h-9" />
              </div>
            </div>
          </div>
        </Section>

        {/* Jobs */}
        <Section title="Job & Application Limits" icon={Briefcase} color="bg-gradient-to-br from-orange-500 to-amber-500">
          <div className="py-3 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Max Jobs per Employer</label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxJobsPerEmployer ?? ""}
                  onChange={e => upd("maxJobsPerEmployer", Number(e.target.value))}
                  className="h-9"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Max Applications per Candidate</label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxAppsPerCandidate ?? ""}
                  onChange={e => upd("maxAppsPerCandidate", Number(e.target.value))}
                  className="h-9"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Job Approval Mode</label>
              <div className="flex gap-2">
                {["auto", "manual"].map(mode => (
                  <button
                    key={mode}
                    onClick={() => upd("jobApprovalMode", mode)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      form.jobApprovalMode === mode
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-gray-200 text-gray-600 hover:border-indigo-300"
                    }`}
                  >
                    {mode === "auto" ? "Auto Approve" : "Manual Review"}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                {form.jobApprovalMode === "manual" ? "Jobs posted by employers will need admin approval before going live." : "Jobs are published immediately when posted."}
              </p>
            </div>
          </div>
        </Section>

        {/* Feature Toggles */}
        <Section title="Feature Toggles" icon={Cpu} color="bg-gradient-to-br from-emerald-500 to-teal-600">
          <Toggle
            value={!!form.maintenanceMode}
            onChange={v => upd("maintenanceMode", v)}
            label="Maintenance Mode"
            description="Takes the site offline for visitors. Admin panel stays accessible."
          />
          <Toggle
            value={!!form.allowGuestBrowsing}
            onChange={v => upd("allowGuestBrowsing", v)}
            label="Allow Guest Browsing"
            description="Guests can browse jobs without logging in."
          />
          <Toggle
            value={!!form.aiEnabled}
            onChange={v => upd("aiEnabled", v)}
            label="AI Features"
            description="Enable AI cover letter generation and job matching."
          />
          <Toggle
            value={!!form.newsLetterEnabled}
            onChange={v => upd("newsLetterEnabled", v)}
            label="Newsletter Subscriptions"
            description="Show newsletter subscribe box in the footer."
          />
        </Section>

        {/* Save */}
        <div className="flex items-center justify-end gap-3">
          {dirty && <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>}
          <Button
            onClick={() => save.mutate()}
            disabled={!dirty || save.isPending}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {save.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {save.isPending ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
