import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Briefcase, ChevronDown, Sparkles, Brain, Target, User, LayoutDashboard, LogOut, FileText, Building2 } from "lucide-react";

export function NavBar() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Recruweb
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/jobs">
            <Button variant="ghost" size="sm" className="text-sm font-medium">Find Jobs</Button>
          </Link>

          {/* AI Tools dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-sm font-medium gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                AI Tools
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-52">
              <DropdownMenuItem asChild>
                <Link href="/interview-prep" className="flex items-center gap-2 cursor-pointer">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">Interview Prep</p>
                    <p className="text-xs text-muted-foreground">AI-powered Q&A</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              {user?.role === "candidate" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/candidate/resume-builder" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">Resume Builder</p>
                        <p className="text-xs text-muted-foreground">Generate with AI</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/candidate/job-match" className="flex items-center gap-2 cursor-pointer">
                      <Target className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="font-medium text-sm">Job Match</p>
                        <p className="text-xs text-muted-foreground">AI recommendations</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sm font-medium gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  {user.name?.split(" ")[0]}
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user.role === "employer" ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/employer/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/employer/jobs" className="flex items-center gap-2 cursor-pointer">
                        <Briefcase className="w-4 h-4" /> My Postings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/employer/profile" className="flex items-center gap-2 cursor-pointer">
                        <Building2 className="w-4 h-4" /> Company Profile
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/candidate/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/candidate/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/candidate/resume-builder" className="flex items-center gap-2 cursor-pointer">
                        <FileText className="w-4 h-4" /> Resume Builder
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/candidate/job-match" className="flex items-center gap-2 cursor-pointer">
                        <Target className="w-4 h-4" /> Job Match
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: simplified */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/jobs">
            <Button variant="ghost" size="sm">Jobs</Button>
          </Link>
          {user ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>Out</Button>
          ) : (
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
