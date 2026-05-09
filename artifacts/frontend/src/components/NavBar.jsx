import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Briefcase, ChevronDown, Sparkles, Brain, Target, User, LayoutDashboard, LogOut,
  FileText, Building2, Bookmark, Search, MapPin, DollarSign, Star, WifiHigh,
  MessageCircle, Mic, Wand2, TrendingUp, Layers, BarChart3, Download, Plus,
  Users, HelpCircle, Phone, Mail, AlertCircle, Settings, Lock, Moon, Sun,
  Bell, Menu, Home, ClipboardList, CheckSquare, Trophy, ChevronRight,
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

export function NavBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isCandidate = user?.role === "candidate";
  const isEmployer = user?.role === "employer";

  const handleLogout = () => {
    logout();
    setLocation("/");
    setMobileOpen(false);
  };

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

          {/* Home */}
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
                <NavItem href="/candidate/resume-builder?template=modern" icon={FileText} label="Professional" />
                <NavItem href="/candidate/resume-builder?template=ats" icon={Target} label="ATS Friendly" />
                <NavItem href="/candidate/resume-builder?template=creative" icon={Sparkles} label="Creative" />
                <DropdownMenuSeparator />
                <NavItem href="/candidate/resume-builder?tab=analyze" icon={BarChart3} label="Resume Analyzer" desc="AI score + suggestions" />
                <NavItem href="/candidate/profile" icon={User} label="Profile Completeness" desc="Fill in your details" />
              </>
            ) : (
              <>
                <NavItem href="/register?role=candidate" icon={FileText} label="Upload Resume" desc="Join as a candidate" />
                <NavItem href="/register?role=candidate" icon={Wand2} label="Build Resume" desc="Create with AI" />
                <NavItem href="/interview-prep" icon={Brain} label="Interview Prep" desc="Practice questions" />
              </>
            )}
          </NavDropdown>

          {/* AI Tools Dropdown */}
          <NavDropdown trigger={
            <Button variant="ghost" size="sm" className="text-sm gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Tools <ChevronDown className="w-3 h-3" />
            </Button>
          }>
            <NavItem icon={MessageCircle} label="AI Job Assistant" desc="Chat for career help"
              onClick={() => document.querySelector("[aria-label='Open AI Assistant']")?.click()} />
            <NavItem href="/interview-prep" icon={Brain} label="Interview Preparation" desc="Role-specific Q&A" />
            {isCandidate && <>
              <DropdownMenuSeparator />
              <NavItem href="/candidate/job-match" icon={Target} label="Job Match AI" desc="Find best jobs for you" />
              <NavItem href="/candidate/resume-builder?tab=analyze" icon={TrendingUp} label="Resume Improvement" desc="AI score & suggestions" />
            </>}
            {isEmployer && <>
              <DropdownMenuSeparator />
              <NavItem href="/employer/jobs" icon={Users} label="AI Resume Filter" desc="Rank candidates by fit" />
            </>}
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
              <NavItem href="/employer/jobs" icon={Users} label="View Applications" desc="Review candidates" />
              <NavItem href="/employer/jobs" icon={Sparkles} label="AI Resume Filter" desc="Rank by fit score" />
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
          {/* Dark mode toggle */}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {user ? (
            <>
              {/* Notifications bell */}
              <Button variant="ghost" size="icon" className="h-8 w-8 relative" onClick={() => setLocation(isCandidate ? "/applications" : "/employer/jobs")}>
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
              </Button>

              {/* Profile dropdown */}
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
            <SheetContent side="right" className="w-80 p-0 overflow-y-auto">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-left flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" /> Recruweb
                </SheetTitle>
              </SheetHeader>
              <div className="p-4 space-y-1">
                {/* User info */}
                {user && (
                  <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                )}

                {/* Mobile nav items */}
                {[
                  { href: "/", icon: Home, label: "Home" },
                  { href: "/jobs", icon: Search, label: "Find Jobs" },
                  { href: "/interview-prep", icon: Brain, label: "Interview Prep" },
                  { href: "/help", icon: HelpCircle, label: "Help & FAQ" },
                ].map(item => (
                  <Link key={item.href} href={item.href} onClick={close}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 cursor-pointer">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                    </div>
                  </Link>
                ))}

                {isCandidate && (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground px-3 pt-3 pb-1 uppercase tracking-wide">Candidate</p>
                    {[
                      { href: "/candidate/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                      { href: "/applications", icon: ClipboardList, label: "My Applications" },
                      { href: "/saved-jobs", icon: Bookmark, label: "Saved Jobs" },
                      { href: "/candidate/profile", icon: User, label: "My Profile" },
                      { href: "/candidate/resume-builder", icon: FileText, label: "Resume Builder" },
                      { href: "/candidate/job-match", icon: Target, label: "Job Match AI" },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={close}>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 cursor-pointer">
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                      </Link>
                    ))}
                  </>
                )}

                {isEmployer && (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground px-3 pt-3 pb-1 uppercase tracking-wide">Employer</p>
                    {[
                      { href: "/employer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                      { href: "/employer/jobs/new", icon: Plus, label: "Post a Job" },
                      { href: "/employer/jobs", icon: Briefcase, label: "Manage Jobs" },
                      { href: "/employer/profile", icon: Building2, label: "Company Profile" },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={close}>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 cursor-pointer">
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                      </Link>
                    ))}
                  </>
                )}

                <div className="pt-3 border-t mt-2 space-y-1">
                  {user ? (
                    <>
                      <Link href="/settings" onClick={close}>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 cursor-pointer">
                          <Settings className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Settings</span>
                        </div>
                      </Link>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 cursor-pointer text-destructive" onClick={handleLogout}>
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
