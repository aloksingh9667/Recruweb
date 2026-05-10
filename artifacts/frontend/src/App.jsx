import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NavBar } from "@/components/NavBar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AIChatbot } from "@/components/AIChatbot";
import Footer from "@/components/Footer";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Jobs from "@/pages/Jobs";
import JobDetail from "@/pages/JobDetail";
import CandidateDashboard from "@/pages/CandidateDashboard";
import CandidateProfile from "@/pages/CandidateProfile";
import EmployerDashboard from "@/pages/EmployerDashboard";
import EmployerJobs from "@/pages/EmployerJobs";
import EmployerJobForm from "@/pages/EmployerJobForm";
import JobApplications from "@/pages/JobApplications";
import EmployerProfile from "@/pages/EmployerProfile";
import ResumeBuilder from "@/pages/ResumeBuilder";
import InterviewPrep from "@/pages/InterviewPrep";
import JobMatch from "@/pages/JobMatch";
import SavedJobs from "@/pages/SavedJobs";
import ApplicationsPage from "@/pages/ApplicationsPage";
import AllApplicationsPage from "@/pages/AllApplicationsPage";
import HelpPage from "@/pages/HelpPage";
import ProfileSettings from "@/pages/ProfileSettings";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
              <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
                <NavBar />
                <main className="flex-1">
                  <Switch>
                    {/* Public Routes */}
                    <Route path="/" component={Home} />
                    <Route path="/login" component={Login} />
                    <Route path="/register" component={Register} />
                    <Route path="/jobs" component={Jobs} />
                    <Route path="/jobs/:jobId" component={JobDetail} />
                    <Route path="/interview-prep" component={InterviewPrep} />
                    <Route path="/help" component={HelpPage} />

                    {/* Saved Jobs (candidate) */}
                    <Route path="/saved-jobs" component={SavedJobs} />

                    {/* Applications (candidate) */}
                    <Route path="/applications" component={ApplicationsPage} />

                    {/* Settings */}
                    <Route path="/settings" component={ProfileSettings} />

                    {/* Public career tools */}
                    <Route path="/candidate/resume-builder" component={ResumeBuilder} />
                    <Route path="/candidate/job-match" component={JobMatch} />

                    {/* Candidate Protected Routes */}
                    <Route path="/candidate/dashboard">
                      <ProtectedRoute component={CandidateDashboard} allowedRole="candidate" />
                    </Route>
                    <Route path="/candidate/profile">
                      <ProtectedRoute component={CandidateProfile} allowedRole="candidate" />
                    </Route>

                    {/* Employer Protected Routes */}
                    <Route path="/employer/dashboard">
                      <ProtectedRoute component={EmployerDashboard} allowedRole="employer" />
                    </Route>
                    <Route path="/employer/jobs">
                      <ProtectedRoute component={EmployerJobs} allowedRole="employer" />
                    </Route>
                    <Route path="/employer/jobs/new">
                      <ProtectedRoute component={EmployerJobForm} allowedRole="employer" />
                    </Route>
                    <Route path="/employer/jobs/:jobId/edit">
                      <ProtectedRoute component={EmployerJobForm} allowedRole="employer" />
                    </Route>
                    <Route path="/employer/jobs/:jobId/applications">
                      <ProtectedRoute component={JobApplications} allowedRole="employer" />
                    </Route>
                    <Route path="/employer/applications">
                      <ProtectedRoute component={AllApplicationsPage} allowedRole="employer" />
                    </Route>
                    <Route path="/employer/profile">
                      <ProtectedRoute component={EmployerProfile} allowedRole="employer" />
                    </Route>

                    {/* 404 */}
                    <Route path="/:rest*" component={() => (
                      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
                        <h2 className="text-4xl font-bold mb-4">404</h2>
                        <p className="text-muted-foreground mb-8">Page not found.</p>
                        <a href="/" className="text-primary hover:underline font-medium">Return home</a>
                      </div>
                    )} />
                  </Switch>
                </main>

                <Footer />
              </div>

              <AIChatbot />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
