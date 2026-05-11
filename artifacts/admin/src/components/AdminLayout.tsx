import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  LayoutDashboard, Users, Briefcase, Building2,
  LogOut, Shield, FileText, Menu, X, ChevronRight,
  MessageSquare, Bell, Settings, ChevronLeft, ChevronRight as ChevRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",    label: "Dashboard",     icon: LayoutDashboard, color: "text-blue-400" },
  { href: "/users",        label: "Users",          icon: Users,           color: "text-green-400" },
  { href: "/employers",    label: "Employers",      icon: Building2,       color: "text-purple-400" },
  { href: "/jobs",         label: "Jobs",           icon: Briefcase,       color: "text-orange-400" },
  { href: "/applications", label: "Applications",   icon: FileText,        color: "text-pink-400" },
  { href: "/contacts",     label: "Contact Us",     icon: MessageSquare,   color: "text-cyan-400" },
  { href: "/subscribers",  label: "Subscribers",    icon: Bell,            color: "text-yellow-400" },
  { href: "/settings",     label: "Settings",       icon: Settings,        color: "text-rose-400" },
];

function SidebarContent({
  collapsed,
  onNavClick,
  onToggle,
  showToggle = false,
}: {
  collapsed?: boolean;
  onNavClick?: () => void;
  onToggle?: () => void;
  showToggle?: boolean;
}) {
  const { admin, logout } = useAdminAuth();
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`border-b border-white/10 flex items-center ${collapsed ? "p-3 justify-center" : "p-5"} transition-all duration-300`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <p className="font-bold text-sm text-white leading-none whitespace-nowrap">Recruweb</p>
            <p className="text-[11px] text-white/50 mt-0.5 font-medium tracking-wide uppercase whitespace-nowrap">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, color }) => {
          const isActive = location === href || location.startsWith(href + "/");
          return (
            <Link key={href} href={href}>
              <div
                onClick={onNavClick}
                title={collapsed ? label : undefined}
                className={`group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? color : "text-white/40 group-hover:" + color}`} />
                {!collapsed && <span className="flex-1 whitespace-nowrap">{label}</span>}
                {!collapsed && isActive && <ChevronRight className="w-3.5 h-3.5 text-white/40" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Toggle + User */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {showToggle && onToggle && (
          <button
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            {collapsed ? <ChevRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        )}

        {!collapsed && (
          <div className="flex items-center gap-3 px-1 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow shrink-0">
              {admin?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{admin?.name || "Admin"}</p>
              <p className="text-[10px] text-white/40 mt-0.5">Super Admin</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow" title={admin?.name || "Admin"}>
              {admin?.name?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        )}
        <button
          onClick={logout}
          title={collapsed ? "Sign Out" : undefined}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("adminSidebarCollapsed") === "true"; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem("adminSidebarCollapsed", String(collapsed)); } catch {}
  }, [collapsed]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex shrink-0 flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} showToggle />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 text-white/70 hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent onNavClick={() => setMobileOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-gray-900">Recruweb Admin</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
