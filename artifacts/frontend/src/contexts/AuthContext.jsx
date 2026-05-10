import { createContext, useContext, useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("recruweb_token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchApi("/auth/me")
      .then((data) => {
        if (data) setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("recruweb_token");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener("recruweb-auth-logout", handler);
    return () => window.removeEventListener("recruweb-auth-logout", handler);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("recruweb_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("recruweb_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
