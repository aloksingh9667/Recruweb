import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Briefcase, ChevronDown, Brain, Target, User, LayoutDashboard, LogOut,
  FileText, Building2, Bookmark, Search, MapPin, DollarSign, Star, WifiHigh,
  Wand2, TrendingUp, Layers, BarChart3, Plus,
  Users, HelpCircle, Phone, Mail, AlertCircle, Settings, Moon, Sun,
  Bell, Menu, Home, ClipboardList, CheckSquare, Trophy, ChevronRight,
  Sparkles, UserCheck, Zap, Calendar,
} from "lucide-react";

function NavDropdown({ trigger, children }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 p-1">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavItem({ href, icon: Icon, label, desc, onClick }) {
  const content = (
    <div className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-muted/60 cursor-pointer transition-colors w-full">
      {Icon && <Icon className="w-4 h-4 text-muted-foreground shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-none">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
    </div>
  );
  if (onClick) return <div onClick={onClick}>{content}</div>;
  return <Link href={href}>{content}</Link>;
}

function MobileSection({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden mb-2">
      <button
        className="flex items-center gap-3 px-3 py-3 w-full hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-semibold flex-1 text-left">{title}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-border/50 bg-muted/20 px-2 py-1">
          {children}
        </div>
      )}
    </div>
  );
}

function MobileLink({ href, icon: Icon, label, onClick }) {
  return (
    <Link href={href} onClick={onClick}>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 cursor-pointer">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
}

function statusToNotif(app) {
  const jobTitle = app.job?.title || app.jobId?.title || "a job";
  const company = app.job?.company || app.jobId?.company || app.jobId?.employer?.company || "";
  const companyStr = company ? ` at ${company}` : "";
  const map = {
    reviewed:            { icon: FileText,    color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/20",   title: "Application Under Review", desc: `Your application for ${jobTitle}${companyStr} is being reviewed` },
    shortlisted:         { icon: CheckSquare, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20", title: "You've Been Shortlisted!", desc: `Shortlisted for ${jobTitle}${companyStr}` },
    interview_scheduled: { icon: Calendar,    color: "text-teal-600",   bg: "bg-teal-50 dark:bg-teal-900/20",   title: "Interview Scheduled!", desc: `Interview scheduled for ${jobTitle}${companyStr}` },
    hired:               { icon: Trophy,      color: "text-green-600",  bg: "bg-green-50 dark:bg-green-900/20", title: "Congratulations! You're Hired!", desc: `Offer received for ${jobTitle}${companyStr}` },
    rejected:            { icon: AlertCircle, color: "text-red-500",    bg: "bg-red-50 dark:bg-red-900/20",     title: "Application Not Selected", desc: `Application for ${jobTitle}${companyStr} was not selected` },
    pending:             { icon: FileText,    color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-900/20",   title: "Application Submitted", desc: `Applied for ${jobTitle}${companyStr}` },
  };
  return map[app.status] || map.pending;
}

function NotificationBell({ isCandidate, isEmployer }) {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  const { data: candidateAppsData } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => fetchApi("/applications/my"),
    enabled: isCandidate,
    staleTime: 30000,
  });

  const { data: employerAppsData } = useQuery({
    queryKey: ["employerApplications"],
    queryFn: () => fetchApi("/applications/employer/all"),
    enabled: isEmployer,
    staleTime: 30000,
  });

  const notifications = useMemo(() => {
    if (isCandidate) {
      const apps = candidateAppsData?.applications || [];
      return apps
        .filter(a => a.status !== "pending")
        .slice(0, 5)
        .map((app, i) => {
          const n = statusToNotif(app);
          return {
            id: i,
            icon: n.icon,
            color: n.color,
            bg: n.bg,
            title: n.title,
            desc: n.desc,
            time: app.updatedAt ? formatDistanceToNow(new Date(app.updatedAt), { addSuffix: true }) : "",
            href: `/applications?tab=${app.status === "interview_scheduled" ? "interview" : app.status === "shortlisted" ? "shortlisted" : "all"}`,
          };
        });
    }
    if (isEmployer) {
      const apps = employerAppsData?.applications || [];
      return apps.slice(0, 5).map((app, i) => {
        const jobTitle = app.job?.title || "a position";
        const candidateName = app.candidate?.name || app.candidate?.user?.name || "A candidate";
        return {
          id: i,
          icon: Users,
          color: "text-blue-600",
          bg: "bg-blue-50 dark:bg-blue-900/20",
          title: "New Application Received",
          desc: `${candidateName} applied to ${jobTitle}`,
          jobTitle,
          time: app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : "",
          href: "/employer/applications",
        };
      });
    }
    return [];
  }, [isCandidate, isEmployer, candidateAppsData, employerAppsData]);

  const unreadCount = notifications.length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 shadow-xl" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">{unreadCount} new</span>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="py-10 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No notifications yet</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                {isCandidate ? "Apply to jobs to see updates here" : "New applications will appear here"}
              </p>
            </div>
          ) : notifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                onClick={() => { setLocation(notif.href); setOpen(false); }}
                className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer transition-colors"
              >
                <div className={`w-8 h-8 rounded-full ${notif.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${notif.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-tight">{notif.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.desc}</p>
                  {notif.jobTitle && (
                    <span className="inline-block mt-1 text-[10px] bg-primary/8 text-primary px-2 py-0.5 rounded-full font-medium">
                      {notif.jobTitle}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-1">{notif.time}</span>
              </div>
            );
          })}
        </div>
        <div className="px-4 py-2.5 border-t bg-muted/10">
          <button
            onClick={() => { setLocation(isEmployer ? "/employer/applications" : "/applications"); setOpen(false); }}
            className="w-full text-center text-xs text-primary hover:underline font-medium"
          >
            View all {isEmployer ? "applications" : "notifications"} →
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NavBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isCandidate = user?.role === "candidate";
  const isEmployer = user?.role === "employer";

  const handleLogout = () => { logout(); setLocation("/"); setMobileOpen(false); };
  const close = () => setMobileOpen(false);

  return (
    <nav className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg hidden sm:block">Recruweb</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-sm gap-1">
              <Home className="w-3.5 h-3.5" /> Home
            </Button>
          </Link>

          {/* Jobs Dropdown */}
          <NavDropdown trigger={
            <Button variant="ghost" size="sm" className="text-sm gap-1">
              <Briefcase className="w-3.5 h-3.5" /> Jobs <ChevronDown className="w-3 h-3" />
            </Button>
          }>
            <NavItem href="/jobs" icon={Search} label="Find Jobs" desc="Browse all openings" />
            <NavItem href="/jobs?location=noida" icon={MapPin} label="Jobs by Location" desc="Noida, Delhi NCR & more" />
            <NavItem href="/jobs?sort=salary" icon={DollarSign} label="Jobs by Salary" desc="Highest paying first" />
            <NavItem href="/jobs?type=walk-in" icon={WifiHigh} label="Walk-in Jobs" desc="Immediate joining" />
            <NavItem href="/jobs?featured=true" icon={Star} label="Recommended Jobs" desc="Based on your profile" />
            {isCandidate && <>
              <DropdownMenuSeparator />
              <NavItem href="/saved-jobs" icon={Bookmark} label="Saved Jobs" desc="Your bookmarked jobs" />
            </>}
          </NavDropdown>

          {/* Services Dropdown */}
          <NavDropdown trigger={
            <Button variant="ghost" size="sm" className="text-sm gap-1">
              <Layers className="w-3.5 h-3.5" /> Services <ChevronDown className="w-3 h-3" />
            </Button>
          }>
            {isCandidate ? (
              <>
                <NavItem href="/candidate/profile" icon={FileText} label="Upload Resume" desc="Update your CV" />
                <NavItem href="/candidate/resume-builder" icon={Wand2} label="Build Resume" desc="AI-powered resume" />
                <DropdownMenuLabel className="text-[10px] text-muted-foreground px-2 mt-1">Resume Templates</DropdownMenuLabel>
                <NavItem href="/candidate/resume-builder?template=professional" icon={FileText} label="Professional" />
                <NavItem href="/candidate/resume-builder?template=ats" icon={Target} label="ATS Friendly" />
                <NavItem href="/candidate/resume-builder?template=creative" icon={Sparkles} label="Creative" />
                <DropdownMenuSeparator />
                <NavItem href="/candidate/resume-builder?tab=analyze" icon={BarChart3} label="Resume Analyzer" desc="AI score + suggestions" />
                <NavItem href="/interview-prep" icon={Brain} label="Interview Preparation" desc="Practice questions" />
                <NavItem href="/candidate/job-match" icon={Target} label="Job Match AI" desc="Find best jobs for you" />
              </>
            ) : (
              <>
                <NavItem href="/candidate/resume-builder" icon={Wand2} label="Resume Builder" desc="Build your CV with AI" />
                <NavItem href="/candidate/resume-builder?tab=analyze" icon={BarChart3} label="Resume Analyzer" desc="AI score + suggestions" />
                <NavItem href="/interview-prep" icon={Brain} label="Interview Preparation" desc="Practice questions" />
                <NavItem href="/candidate/job-match" icon={Target} label="Job Match AI" desc="AI-powered matching" />
              </>
            )}
          </NavDropdown>

          {/* Applications — candidates only */}
          {isCandidate && (
            <NavDropdown trigger={
              <Button variant="ghost" size="sm" className="text-sm gap-1">
                <ClipboardList className="w-3.5 h-3.5" /> Applications <ChevronDown className="w-3 h-3" />
              </Button>
            }>
              <NavItem href="/applications" icon={ClipboardList} label="All Applications" />
              <NavItem href="/applications?tab=active" icon={FileText} label="Applied Jobs" />
              <NavItem href="/applications?tab=shortlisted" icon={Star} label="Shortlisted" />
              <NavItem href="/applications?tab=interview" icon={CheckSquare} label="Interview Scheduled" />
              <NavItem href="/applications?tab=hired" icon={Trophy} label="Hired" />
              <DropdownMenuSeparator />
              <NavItem href="/applications?tab=rejected" icon={AlertCircle} label="Rejected" />
            </NavDropdown>
          )}

          {/* Employer Dropdown — employers only */}
          {isEmployer && (
            <NavDropdown trigger={
              <Button variant="ghost" size="sm" className="text-sm gap-1">
                <Building2 className="w-3.5 h-3.5" /> Employer <ChevronDown className="w-3 h-3" />
              </Button>
            }>
              <NavItem href="/employer/jobs/new" icon={Plus} label="Post a Job" desc="Create new listing" />
              <NavItem href="/employer/jobs" icon={Briefcase} label="Manage Jobs" desc="Edit/delete postings" />
              <NavItem href="/employer/applications" icon={Users} label="View Applications" desc="All candidates across jobs" />
              <NavItem href="/employer/applications" icon={Sparkles} label="AI Resume Filter" desc="Rank candidates by fit score" />
              <DropdownMenuSeparator />
              <NavItem href="/employer/dashboard" icon={LayoutDashboard} label="Employer Dashboard" />
              <NavItem href="/employer/profile" icon={Building2} label="Company Profile" />
            </NavDropdown>
          )}

          {/* Help Dropdown */}
          <NavDropdown trigger={
            <Button variant="ghost" size="sm" className="text-sm gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Help <ChevronDown className="w-3 h-3" />
            </Button>
          }>
            <NavItem href="/help" icon={HelpCircle} label="FAQ" desc="Common questions" />
            <NavItem href="/help#contact-form" icon={Phone} label="Contact Us" />
            <NavItem icon={Mail} label="Email Support" desc="support@recruweb.in"
              onClick={() => window.location = "mailto:support@recruweb.in"} />
            <NavItem href="/help#contact-form" icon={AlertCircle} label="Report a Problem" />
          </NavDropdown>
        </div>

        {/* Right side controls */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {user ? (
            <>
              <NotificationBell isCandidate={isCandidate} isEmployer={isEmployer} />


              <NavDropdown trigger={
                <Button variant="ghost" size="sm" className="gap-2 ml-1">
                  <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="max-w-[80px] truncate text-sm">{user.name?.split(" ")[0]}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              }>
                <div className="px-2 py-1.5 border-b mb-1">
                  <p className="text-xs font-semibold truncate">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
                {isCandidate ? (
                  <>
                    <NavItem href="/candidate/dashboard" icon={LayoutDashboard} label="My Dashboard" />
                    <NavItem href="/candidate/profile" icon={User} label="My Profile" />
                    <NavItem href="/candidate/resume-builder" icon={FileText} label="My Resume" />
                  </>
                ) : isEmployer ? (
                  <>
                    <NavItem href="/employer/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem href="/employer/profile" icon={Building2} label="Company Profile" />
                  </>
                ) : null}
                <DropdownMenuSeparator />
                <NavItem href="/settings" icon={Settings} label="Settings" />
                <div onClick={handleLogout}>
                  <div className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-destructive/10 cursor-pointer text-destructive transition-colors">
                    <LogOut className="w-4 h-4 shrink-0" />
                    <p className="text-sm font-medium">Sign Out</p>
                  </div>
                </div>
              </NavDropdown>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link href="/register"><Button size="sm">Sign up</Button></Link>
            </div>
          )}
        </div>

        {/* Mobile: theme + menu */}
        <div className="flex lg:hidden items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Menu className="w-4 h-4" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-80 p-0 overflow-y-auto">
              <SheetHeader className="p-4 border-b bg-primary/5">
                <SheetTitle className="text-left flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                    <Briefcase className="w-3.5 h-3.5 text-white" />
                  </div>
                  Recruweb
                </SheetTitle>
              </SheetHeader>

              <div className="p-4 space-y-2">
                {/* User info */}
                {user && (
                  <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/10 rounded-xl mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                    <Bell className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}

                {/* Home + Jobs */}
                <MobileLink href="/" icon={Home} label="Home" onClick={close} />
                <MobileLink href="/interview-prep" icon={Brain} label="Interview Preparation" onClick={close} />

                {/* Jobs Section */}
                <MobileSection title="Find Jobs" icon={Search}>
                  <MobileLink href="/jobs" icon={Search} label="All Jobs" onClick={close} />
                  <MobileLink href="/jobs?location=noida" icon={MapPin} label="Jobs by Location" onClick={close} />
                  <MobileLink href="/jobs?sort=salary" icon={DollarSign} label="Jobs by Salary" onClick={close} />
                  <MobileLink href="/jobs?type=walk-in" icon={WifiHigh} label="Walk-in Jobs" onClick={close} />
                  {isCandidate && <MobileLink href="/saved-jobs" icon={Bookmark} label="Saved Jobs" onClick={close} />}
                </MobileSection>

                {/* Services Section */}
                <MobileSection title="Services" icon={Layers}>
                  <MobileLink href="/candidate/resume-builder" icon={Wand2} label="Resume Builder" onClick={close} />
                  <MobileLink href="/candidate/resume-builder?tab=analyze" icon={BarChart3} label="Resume Analyzer" onClick={close} />
                  <MobileLink href="/interview-prep" icon={Brain} label="Interview Prep" onClick={close} />
                  <MobileLink href="/candidate/job-match" icon={Target} label="Job Match AI" onClick={close} />
                </MobileSection>

                {/* Candidate Section */}
                {isCandidate && (
                  <MobileSection title="My Account" icon={User} defaultOpen>
                    <MobileLink href="/candidate/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={close} />
                    <MobileLink href="/applications" icon={ClipboardList} label="My Applications" onClick={close} />
                    <MobileLink href="/saved-jobs" icon={Bookmark} label="Saved Jobs" onClick={close} />
                    <MobileLink href="/candidate/profile" icon={User} label="My Profile" onClick={close} />
                    <MobileLink href="/candidate/resume-builder" icon={FileText} label="Resume Builder" onClick={close} />
                    <MobileLink href="/candidate/job-match" icon={Target} label="Job Match AI" onClick={close} />
                  </MobileSection>
                )}

                {/* Employer Section */}
                {isEmployer && (
                  <MobileSection title="Employer" icon={Building2} defaultOpen>
                    <MobileLink href="/employer/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={close} />
                    <MobileLink href="/employer/jobs/new" icon={Plus} label="Post a Job" onClick={close} />
                    <MobileLink href="/employer/jobs" icon={Briefcase} label="Manage Jobs" onClick={close} />
                    <MobileLink href="/employer/applications" icon={Users} label="View Applications" onClick={close} />
                    <MobileLink href="/employer/profile" icon={Building2} label="Company Profile" onClick={close} />
                  </MobileSection>
                )}

                {/* Help Section */}
                <MobileSection title="Help & Support" icon={HelpCircle}>
                  <MobileLink href="/help" icon={HelpCircle} label="FAQ" onClick={close} />
                  <MobileLink href="/help#contact-form" icon={Phone} label="Contact Us" onClick={close} />
                  <MobileLink href="/help#contact-form" icon={AlertCircle} label="Report a Problem" onClick={close} />
                </MobileSection>

                {/* Auth / Settings */}
                <div className="pt-2 border-t mt-2 space-y-1">
                  {user ? (
                    <>
                      <MobileLink href="/settings" icon={Settings} label="Settings" onClick={close} />
                      <div
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 cursor-pointer text-destructive"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-2 px-1">
                      <Link href="/login" onClick={close} className="flex-1">
                        <Button variant="outline" className="w-full">Log in</Button>
                      </Link>
                      <Link href="/register" onClick={close} className="flex-1">
                        <Button className="w-full">Sign up</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
