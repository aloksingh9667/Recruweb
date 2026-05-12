import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchAdmin } from "@/lib/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("admin_token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("admin_token");
    if (!stored) {
      setIsLoading(false);
      return;
    }
    fetchAdmin("/auth/me")
      .then((data: AdminUser) => {
        if (data && data.role === "admin") {
          setAdmin(data);
          setToken(stored);
        } else {
          localStorage.removeItem("admin_token");
          setToken(null);
        }
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = (newToken: string, user: AdminUser) => {
    localStorage.setItem("admin_token", newToken);
    setToken(newToken);
    setAdmin(user);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
