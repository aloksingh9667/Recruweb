import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Link, useLocation, useSearch } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Search, MapPin, Briefcase, IndianRupee, Clock, Bookmark,
  BookmarkCheck, SlidersHorizontal, X, ChevronDown, ChevronUp,
  Star, Building2, Users, TrendingUp, Send,
} from "lucide-react";
import { formatDistanceToNow, subDays, subHours } from "date-fns";

const LOCATIONS = ["Mumbai", "Bangalore", "Delhi", "Hyderabad", "Pune", "Chennai", "Kolkata", "Noida", "Gurgaon", "Remote"];
const CATEGORIES = ["IT/Software", "Marketing", "Sales", "HR", "Finance", "Operations", "Design", "Data Science", "Other"];
const WORK_MODES = ["Work from home", "Work from office", "Hybrid"];
const EXP_OPTIONS = [
  { label: "Fresher (0-1 yr)", min: 0, max: 1 },
  { label: "1-3 years", min: 1, max: 3 },
  { label: "3-5 years", min: 3, max: 5 },
  { label: "5-7 years", min: 5, max: 7 },
  { label: "7-10 years", min: 7, max: 10 },
  { label: "10+ years", min: 10, max: 99 },
];
const SALARY_OPTIONS = [
  { label: "0-3 Lakhs", min: 0, max: 3 },
  { label: "3-6 Lakhs", min: 3, max: 6 },
  { label: "6-10 Lakhs", min: 6, max: 10 },
  { label: "10-15 Lakhs", min: 10, max: 15 },
  { label: "15-25 Lakhs", min: 15, max: 25 },
  { label: "25-50 Lakhs", min: 25, max: 50 },
  { label: "50+ Lakhs", min: 50, max: 999 },
];
const DATE_OPTIONS = [
  { label: "Any time", value: "any" },
  { label: "Last 24 hours", value: "1day" },
  { label: "Last 3 days", value: "3days" },
  { label: "Last week", value: "1week" },
  { label: "Last month", value: "1month" },
];
const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "remote"];

function parseSalaryLPA(salaryStr) {
  if (!salaryStr) return null;
  const nums = salaryStr.match(/\d+(\.\d+)?/g);
  if (!nums || nums.length === 0) return null;
  const avg = nums.reduce((s, n) => s + parseFloat(n), 0) / nums.length;
  if (salaryStr.toLowerCase().includes("lpa") || salaryStr.includes("L") || salaryStr.includes("l")) return avg;
  if (avg > 1000) return avg / 100000;
  return avg;
}

function parseExpYears(expStr) {
  if (!expStr) return null;
  const nums = expStr.match(/\d+/g);
  if (!nums) return null;
  return parseFloat(nums[0]);
}

function companyInitials(name) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

const COMPANY_COLORS = [
  "bg-blue-600", "bg-indigo-600", "bg-purple-600", "bg-teal-600",
  "bg-emerald-600", "bg-orange-500", "bg-red-500", "bg-pink-600",
  "bg-cyan-600", "bg-amber-600",
];
function companyColor(name) {
  if (!name) return COMPANY_COLORS[0];
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) & 0xfffff;
  return COMPANY_COLORS[Math.abs(h) % COMPANY_COLORS.length];
}

function CheckItem({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer group">
      <div
        onClick={onChange}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-blue-400"}`}
      >
        {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 12 12"><path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" /></svg>}
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{label}</span>
    </label>
  );
}

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="mt-1 space-y-0.5">{children}</div>}
    </div>
  );
}

function NaukriJobCard({ job, isSaved, onSaveToggle, onApply, hasApplied, isCandidate }) {
  const initials = companyInitials(job.company || job.employer?.company);
  const color = companyColor(job.company || job.employer?.company);
  const postedAgo = job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : "";
  const skills = job.skills?.slice(0, 4) || [];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg ${color} text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Link href={`/jobs/${job.id || job._id}`}>
                <h3 className="font-semibold text-blue-700 dark:text-blue-400 text-base hover:underline cursor-pointer leading-snug line-clamp-1">
                  {job.title}
                </h3>
              </Link>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                {job.company || job.employer?.company || "Company"}
                <span className="flex items-center gap-0.5 ml-1 text-amber-500">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-gray-500">{(3.5 + Math.random() * 1.4).toFixed(1)}</span>
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isCandidate && (
                <button
                  onClick={() => onSaveToggle(job.id || job._id, isSaved)}
                  className={`p-1.5 rounded-full transition-colors ${isSaved ? "text-blue-600" : "text-gray-400 hover:text-blue-500"}`}
                  title={isSaved ? "Saved" : "Save job"}
                >
                  {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
              )}
              {isCandidate ? (
                hasApplied ? (
                  <span className="text-xs px-3 h-8 flex items-center font-medium text-green-600 bg-green-50 border border-green-200 rounded-md">
                    Applied ✓
                  </span>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => onApply(job)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 h-8 font-medium"
                  >
                    Apply
                  </Button>
                )
              ) : (
                <Link href={`/jobs/${job.id || job._id}`}>
                  <Button size="sm" className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors text-xs px-4 h-8 font-medium">
                    View
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {job.experienceRequired || "0-5 yrs"}
            </span>
            <span className="flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5" />
              {job.salaryRange || "Not disclosed"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </span>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {skills.map((s, i) => (
                <span key={i} className="text-[11px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          )}

          {job.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-1">
              {job.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-green-600 dark:text-green-400 font-medium capitalize bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                {job.employmentType?.replace("-", " ") || "Full time"}
              </span>
              {(job.adminStatus === "approved" || !job.adminStatus) && (
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Actively hiring</span>
              )}
            </div>
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {postedAgo}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseParamsToState(search) {
  const p = new URLSearchParams(search);
  const loc = p.get("location") || "";
  const cat = p.get("category") || "";
  const type = p.get("type") || "";
  const sort = p.get("sort") || "date";
  const exp = p.get("experience") || "";
  const q = p.get("search") || "";
  const featured = p.get("featured") === "true";
  const walkIn = type === "walk-in";

  const workModes = type === "Remote" ? ["Work from home"] : [];
  const jobTypes = (type && type !== "Remote" && type !== "walk-in") ? [type] : [];
  const locations = loc ? [loc] : [];
  const categories = cat ? [cat] : [];
  const experience = exp === "Fresher" ? ["Fresher (0-1 yr)"] : exp ? [exp] : [];

  return { locations, jobTypes, categories, workModes, experience, sort, q, locationInput: loc, walkIn, featured };
}

export default function Jobs() {
  const [woLocation] = useLocation();
  const woSearch = useSearch();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isCandidate = user?.role === "candidate";
  const init = parseParamsToState(window.location.search);

  const [searchInput, setSearchInput] = useState(init.q);
  const [locationInput, setLocationInput] = useState(init.locationInput);
  const [activeSearch, setActiveSearch] = useState(init.q);
  const [walkInFilter, setWalkInFilter] = useState(init.walkIn);
  const [featuredFilter, setFeaturedFilter] = useState(init.featured);

  const [filters, setFilters] = useState({
    locations: init.locations,
    jobTypes: init.jobTypes,
    categories: init.categories,
    workModes: init.workModes,
    experience: init.experience,
    salary: [],
    datePosted: "any",
  });

  const [locationSearch, setLocationSearch] = useState("");
  const [sortBy, setSortBy] = useState(init.sort === "salary" ? "salary" : (init.featured ? "popular" : "date"));

  const [applyDialogJob, setApplyDialogJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    const s = parseParamsToState(woSearch || window.location.search);
    setFilters({
      locations: s.locations,
      jobTypes: s.jobTypes,
      categories: s.categories,
      workModes: s.workModes,
      experience: s.experience,
      salary: [],
      datePosted: "any",
    });
    setSortBy(s.sort === "salary" ? "salary" : (s.featured ? "popular" : "date"));
    setSearchInput(s.q);
    setActiveSearch(s.q);
    setLocationInput(s.locationInput);
    setWalkInFilter(s.walkIn);
    setFeaturedFilter(s.featured);
  }, [woSearch]);

  const { data, isLoading } = useQuery({
    queryKey: ["jobs-all"],
    queryFn: () => fetchApi(`/jobs?limit=100`),
    staleTime: 60000,
  });

  const { data: savedJobsRaw } = useQuery({
    queryKey: ["savedJobs"],
    queryFn: () => fetchApi("/jobs/saved/my"),
    enabled: isCandidate,
  });
  const savedJobIds = useMemo(() => {
    const list = Array.isArray(savedJobsRaw) ? savedJobsRaw : (savedJobsRaw?.jobs ?? []);
    return new Set(list.map(j => j._id || j.id));
  }, [savedJobsRaw]);

  const { data: myApplicationsRaw } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => fetchApi("/applications/my"),
    enabled: isCandidate,
  });
  const appliedJobIds = useMemo(() => {
    const apps = myApplicationsRaw?.applications ?? [];
    return new Set(apps.map(a => a.jobId?._id || a.jobId?.id || a.jobId));
  }, [myApplicationsRaw]);

  const saveMutation = useMutation({
    mutationFn: ({ jobId, isSaved }) =>
      isSaved
        ? fetchApi(`/jobs/${jobId}/save`, { method: "DELETE" })
        : fetchApi(`/jobs/${jobId}/save`, { method: "POST" }),
    onSuccess: (_, { isSaved }) => {
      queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
      toast({ title: isSaved ? "Job removed from saved" : "Job saved successfully" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const applyMutation = useMutation({
    mutationFn: ({ jobId, coverLetter }) =>
      fetchApi("/applications", { method: "POST", body: JSON.stringify({ jobId, coverLetter }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
      toast({ title: "Application submitted!", description: "Your application has been sent successfully." });
      setApplyDialogJob(null);
      setCoverLetter("");
    },
    onError: (err) => {
      toast({ title: "Application failed", description: err.message, variant: "destructive" });
    },
  });

  const handleSaveToggle = useCallback((jobId, isSaved) => {
    if (!isCandidate) {
      toast({ title: "Sign in required", description: "Please log in as a candidate to save jobs.", variant: "destructive" });
      return;
    }
    saveMutation.mutate({ jobId, isSaved });
  }, [isCandidate, saveMutation, toast]);

  const handleApply = useCallback((job) => {
    if (!isCandidate) {
      toast({ title: "Sign in required", description: "Please log in as a candidate to apply.", variant: "destructive" });
      return;
    }
    setApplyDialogJob(job);
    setCoverLetter("");
  }, [isCandidate, toast]);

  const handleApplySubmit = () => {
    if (!applyDialogJob) return;
    applyMutation.mutate({ jobId: applyDialogJob.id || applyDialogJob._id, coverLetter });
  };

  const toggle = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  }, []);

  const activeFilterCount = useMemo(() =>
    filters.locations.length + filters.jobTypes.length + filters.categories.length +
    filters.workModes.length + filters.experience.length + filters.salary.length +
    (filters.datePosted !== "any" ? 1 : 0), [filters]);

  const clearAll = () => setFilters({
    locations: [], jobTypes: [], categories: [], workModes: [],
    experience: [], salary: [], datePosted: "any",
  });

  const filteredJobs = useMemo(() => {
    let jobs = data?.jobs || [];

    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      jobs = jobs.filter(j =>
        j.title?.toLowerCase().includes(q) ||
        (j.company || j.employer?.company || "").toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q) ||
        j.skills?.some(s => s.toLowerCase().includes(q))
      );
    }

    if (filters.locations.length > 0) {
      jobs = jobs.filter(j => filters.locations.some(loc =>
        j.location?.toLowerCase().includes(loc.toLowerCase())
      ));
    }

    if (filters.jobTypes.length > 0) {
      jobs = jobs.filter(j => filters.jobTypes.includes(j.employmentType));
    }

    if (filters.categories.length > 0) {
      jobs = jobs.filter(j => filters.categories.includes(j.category));
    }

    if (filters.workModes.length > 0) {
      jobs = jobs.filter(j => {
        const loc = j.location?.toLowerCase() || "";
        const type = j.employmentType?.toLowerCase() || "";
        return filters.workModes.some(m => {
          if (m === "Work from home") return loc.includes("remote") || type === "remote";
          if (m === "Work from office") return !loc.includes("remote") && type !== "remote";
          if (m === "Hybrid") return loc.includes("hybrid") || j.description?.toLowerCase().includes("hybrid");
          return false;
        });
      });
    }

    if (filters.salary.length > 0) {
      jobs = jobs.filter(j => {
        const lpa = parseSalaryLPA(j.salaryRange);
        if (lpa === null) return true;
        return filters.salary.some(s => {
          const opt = SALARY_OPTIONS.find(o => o.label === s);
          return opt && lpa >= opt.min && lpa <= opt.max;
        });
      });
    }

    if (filters.experience.length > 0) {
      jobs = jobs.filter(j => {
        const exp = parseExpYears(j.experienceRequired);
        if (exp === null) return true;
        return filters.experience.some(e => {
          const opt = EXP_OPTIONS.find(o => o.label === e);
          return opt && exp >= opt.min && exp <= opt.max;
        });
      });
    }

    if (filters.datePosted !== "any") {
      const now = new Date();
      const cutoff = {
        "1day": subHours(now, 24),
        "3days": subDays(now, 3),
        "1week": subDays(now, 7),
        "1month": subDays(now, 30),
      }[filters.datePosted];
      if (cutoff) jobs = jobs.filter(j => j.createdAt && new Date(j.createdAt) >= cutoff);
    }

    if (sortBy === "date") {
      jobs = [...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "salary") {
      jobs = [...jobs].sort((a, b) => (parseSalaryLPA(b.salaryRange) || 0) - (parseSalaryLPA(a.salaryRange) || 0));
    }

    return jobs;
  }, [data, activeSearch, filters, sortBy]);

  const handleSearch = (e) => {
    e?.preventDefault();
    setActiveSearch(searchInput);
  };

  const visibleLocations = LOCATIONS.filter(l =>
    l.toLowerCase().includes(locationSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Apply Dialog */}
      <Dialog open={!!applyDialogJob} onOpenChange={(open) => { if (!open) setApplyDialogJob(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              Apply for {applyDialogJob?.title}
            </DialogTitle>
            <DialogDescription>
              {applyDialogJob?.company || applyDialogJob?.employer?.company} · {applyDialogJob?.location}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Textarea
                placeholder="Write a brief cover letter explaining why you're a great fit..."
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setApplyDialogJob(null)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
                onClick={handleApplySubmit}
                disabled={applyMutation.isPending}
              >
                <Send className="w-4 h-4" />
                {applyMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Top search bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-[56px] z-20">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200 transition-all">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Enter skills / designations / companies"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(""); setActiveSearch(""); }}>
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 min-w-[180px] focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200 transition-all">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Enter location"
                value={locationInput}
                onChange={e => setLocationInput(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-semibold">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="flex gap-5">
          {/* LEFT SIDEBAR — Filters */}
          <aside className="w-60 flex-shrink-0 self-start sticky top-[120px]">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="font-bold text-sm text-gray-800 dark:text-gray-200">All Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button onClick={clearAll} className="text-xs text-blue-600 hover:underline font-medium">Clear all</button>
                )}
              </div>

              <div className="px-4 py-2 max-h-[calc(100vh-180px)] overflow-y-auto">
                {/* Work Mode */}
                <FilterSection title="Work Mode">
                  {WORK_MODES.map(m => (
                    <CheckItem key={m} checked={filters.workModes.includes(m)} onChange={() => toggle("workModes", m)} label={m} />
                  ))}
                </FilterSection>

                {/* Experience */}
                <FilterSection title="Experience">
                  {EXP_OPTIONS.map(o => (
                    <CheckItem key={o.label} checked={filters.experience.includes(o.label)} onChange={() => toggle("experience", o.label)} label={o.label} />
                  ))}
                </FilterSection>

                {/* Salary */}
                <FilterSection title="Salary (per annum)">
                  {SALARY_OPTIONS.map(o => (
                    <CheckItem key={o.label} checked={filters.salary.includes(o.label)} onChange={() => toggle("salary", o.label)} label={o.label} />
                  ))}
                </FilterSection>

                {/* Location */}
                <FilterSection title="Location">
                  <div className="mb-2">
                    <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1">
                      <Search className="w-3 h-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search location"
                        value={locationSearch}
                        onChange={e => setLocationSearch(e.target.value)}
                        className="text-xs bg-transparent outline-none flex-1 text-gray-700 dark:text-gray-300 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  {visibleLocations.map(loc => (
                    <CheckItem key={loc} checked={filters.locations.includes(loc)} onChange={() => toggle("locations", loc)} label={loc} />
                  ))}
                </FilterSection>

                {/* Job Type */}
                <FilterSection title="Job Type">
                  {JOB_TYPES.map(t => (
                    <CheckItem key={t} checked={filters.jobTypes.includes(t)} onChange={() => toggle("jobTypes", t)} label={t.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())} />
                  ))}
                </FilterSection>

                {/* Category */}
                <FilterSection title="Department" defaultOpen={false}>
                  {CATEGORIES.map(c => (
                    <CheckItem key={c} checked={filters.categories.includes(c)} onChange={() => toggle("categories", c)} label={c} />
                  ))}
                </FilterSection>

                {/* Date Posted */}
                <FilterSection title="Date Posted" defaultOpen={false}>
                  {DATE_OPTIONS.map(o => (
                    <label key={o.value} className="flex items-center gap-2 py-1 cursor-pointer group">
                      <div
                        onClick={() => setFilters(f => ({ ...f, datePosted: o.value }))}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${filters.datePosted === o.value ? "border-blue-600" : "border-gray-300 group-hover:border-blue-400"}`}
                      >
                        {filters.datePosted === o.value && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{o.label}</span>
                    </label>
                  ))}
                </FilterSection>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1 min-w-0">
            {/* Result header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  {isLoading ? (
                    <span className="text-gray-400">Searching...</span>
                  ) : (
                    <>
                      <span className="text-blue-700 dark:text-blue-400 font-bold">{filteredJobs.length}</span>
                      {" "}job{filteredJobs.length !== 1 ? "s" : ""} found
                      {activeSearch && <span className="text-gray-500 font-normal"> for "{activeSearch}"</span>}
                    </>
                  )}
                </h2>
                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {filters.locations.map(l => (
                      <span key={l} className="flex items-center gap-1 text-[11px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-0.5">
                        {l} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => toggle("locations", l)} />
                      </span>
                    ))}
                    {filters.jobTypes.map(t => (
                      <span key={t} className="flex items-center gap-1 text-[11px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-0.5">
                        {t.replace("-", " ")} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => toggle("jobTypes", t)} />
                      </span>
                    ))}
                    {filters.categories.map(c => (
                      <span key={c} className="flex items-center gap-1 text-[11px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-0.5">
                        {c} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => toggle("categories", c)} />
                      </span>
                    ))}
                    {filters.salary.map(s => (
                      <span key={s} className="flex items-center gap-1 text-[11px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-0.5">
                        {s} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => toggle("salary", s)} />
                      </span>
                    ))}
                    {filters.experience.map(e => (
                      <span key={e} className="flex items-center gap-1 text-[11px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-0.5">
                        {e} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => toggle("experience", e)} />
                      </span>
                    ))}
                    {filters.workModes.map(m => (
                      <span key={m} className="flex items-center gap-1 text-[11px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-0.5">
                        {m} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => toggle("workModes", m)} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded px-2 py-1 outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <option value="date">Date</option>
                  <option value="salary">Salary</option>
                </select>
              </div>
            </div>

            {/* Job list */}
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-5 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/5" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="space-y-3">
                {filteredJobs.map(job => (
                  <NaukriJobCard
                    key={job.id || job._id}
                    job={job}
                    isSaved={savedJobIds.has(job.id || job._id)}
                    onSaveToggle={handleSaveToggle}
                    onApply={handleApply}
                    hasApplied={appliedJobIds.has(job.id || job._id)}
                    isCandidate={isCandidate}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-20 text-center">
                <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">No jobs found</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">Try adjusting your filters or search terms</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { clearAll(); setSearchInput(""); setActiveSearch(""); }}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
