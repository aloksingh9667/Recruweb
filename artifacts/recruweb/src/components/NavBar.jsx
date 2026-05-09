import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function NavBar() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          Recruweb
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
            Find Jobs
          </Link>
          
          {user ? (
            <>
              {user.role === "employer" ? (
                <>
                  <Link href="/employer/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
                  <Link href="/employer/jobs" className="text-sm font-medium hover:text-primary transition-colors">My Postings</Link>
                  <Link href="/employer/profile" className="text-sm font-medium hover:text-primary transition-colors">Company Profile</Link>
                </>
              ) : (
                <>
                  <Link href="/candidate/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
                  <Link href="/candidate/profile" className="text-sm font-medium hover:text-primary transition-colors">My Profile</Link>
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors px-3 py-2">
                Log in
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
