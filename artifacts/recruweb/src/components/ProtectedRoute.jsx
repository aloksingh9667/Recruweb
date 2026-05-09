import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";

export function ProtectedRoute({ component: Component, allowedRole, ...rest }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation("/login");
      } else if (allowedRole && user.role !== allowedRole) {
        setLocation(user.role === "employer" ? "/employer/dashboard" : "/candidate/dashboard");
      }
    }
  }, [user, isLoading, allowedRole, setLocation]);

  if (isLoading) {
    return <div className="p-20 text-center animate-pulse">Loading...</div>;
  }

  if (!user || (allowedRole && user.role !== allowedRole)) {
    return null; // Will redirect
  }

  return <Component {...rest} />;
}
