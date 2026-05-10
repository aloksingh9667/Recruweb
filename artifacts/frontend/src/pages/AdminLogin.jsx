import { useState } from "react";
import { useLocation } from "wouter";
import { fetchApi } from "@/lib/api";
import { Shield, Eye, EyeOff, Loader2, Lock } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("admin@recruweb.in");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password, role: "admin" }),
      });
      if (data.user?.role !== "admin") {
        setError("This account does not have admin privileges.");
        return;
      }
      localStorage.setItem("recruweb_token", data.token);
      localStorage.setItem("recruweb_admin", JSON.stringify(data.user));
      setLocation("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg,#0f0c29 0%,#302b63 55%,#24243e 100%)" }}>
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header strip */}
          <div className="p-6 text-center" style={{ background: "linear-gradient(135deg,#3730a3,#5b21b6,#9333ea)" }}>
            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-white/60 text-sm mt-1">Recruweb Control Centre</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-7 space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
                placeholder="admin@recruweb.in"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
                  placeholder="Enter admin password"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? "Signing in…" : "Sign in as Admin"}
            </button>

            <p className="text-center text-xs text-gray-400 mt-2">
              Default: admin@recruweb.in / Demo@1234
            </p>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-5">
          Recruweb Admin · Restricted Access
        </p>
      </div>
    </div>
  );
}
