import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminJobs from "@/pages/AdminJobs";
import AdminEmployers from "@/pages/AdminEmployers";
import AdminApplications from "@/pages/AdminApplications";
import AdminContacts from "@/pages/AdminContacts";
import AdminSubscribers from "@/pages/AdminSubscribers";
import AdminSettings from "@/pages/AdminSettings";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { admin, isLoading } = useAdminAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!admin) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={AdminLogin} />
      <Route path="/dashboard">
        <ProtectedRoute component={AdminDashboard} />
      </Route>
      <Route path="/users">
        <ProtectedRoute component={AdminUsers} />
      </Route>
      <Route path="/employers">
        <ProtectedRoute component={AdminEmployers} />
      </Route>
      <Route path="/jobs">
        <ProtectedRoute component={AdminJobs} />
      </Route>
      <Route path="/applications">
        <ProtectedRoute component={AdminApplications} />
      </Route>
      <Route path="/contacts">
        <ProtectedRoute component={AdminContacts} />
      </Route>
      <Route path="/subscribers">
        <ProtectedRoute component={AdminSubscribers} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={AdminSettings} />
      </Route>
      <Route path="/">
        <RootRedirect />
      </Route>
      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-muted-foreground mt-2">Page not found</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function RootRedirect() {
  const { admin, isLoading } = useAdminAuth();
  if (isLoading) return null;
  return <Redirect to={admin ? "/dashboard" : "/login"} />;
}

function App() {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminAuthProvider>
          <WouterRouter base={base}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AdminAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
