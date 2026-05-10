import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { Bookmark, BookmarkCheck, MapPin, Briefcase, IndianRupee, ArrowRight, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const COMPANY_COLORS = ["#6366f1","#8b5cf6","#3b82f6","#10b981","#f59e0b","#ef4444","#14b8a6","#ec4899"];
function colorFor(str) { let h=0; for(const c of (str||"")) h=(h*31+c.charCodeAt(0))&0xffffffff; return COMPANY_COLORS[Math.abs(h)%COMPANY_COLORS.length]; }

function JobCard({ job, onUnsave }) {
  const color = colorFor(job.company);
  const [unsaving, setUnsaving] = useState(false);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0"
              style={{ background: color }}>
              {(job.company||"?")[0]}
            </div>
            <div className="min-w-0">
              <Link href={`/jobs/${job._id}`}>
                <p className="font-bold text-gray-900 dark:text-white text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1 cursor-pointer">{job.title}</p>
              </Link>
              <p className="text-gray-500 dark:text-gray-400 text-xs">{job.company}</p>
            </div>
          </div>
          <button onClick={async () => { setUnsaving(true); await onUnsave(job._id); setUnsaving(false); }}
            disabled={unsaving}
            title="Remove from saved"
            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500">
            <BookmarkCheck className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
          {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{job.location}</span>}
          {job.salaryRange && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3"/>{job.salaryRange}</span>}
          {job.employmentType && <span className="flex items-center gap-1 capitalize"><Briefcase className="w-3 h-3"/>{job.employmentType}</span>}
        </div>
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.skills.slice(0, 4).map(s => (
              <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">{s}</span>
            ))}
          </div>
        )}
      </div>
      <div className="px-4 pb-4">
        <Link href={`/jobs/${job._id}`}>
          <button className="w-full py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all flex items-center justify-center gap-1.5">
            View Job <ArrowRight className="w-3 h-3" />
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function SavedJobs() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: () => fetchApi("/candidates/saved-jobs"),
    enabled: !!user && user.role === "candidate",
  });

  const unsaveMutation = useMutation({
    mutationFn: (jobId) => fetchApi(`/candidates/saved-jobs/${jobId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-jobs"] });
      qc.invalidateQueries({ queryKey: ["saved-job-ids"] });
      toast({ title: "Removed", description: "Job removed from saved list." });
    },
  });

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-4">
          <Bookmark className="w-8 h-8 text-indigo-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign in to see Saved Jobs</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Log in as a candidate to bookmark and track your favourite jobs.</p>
        <button onClick={() => setLocation("/login")}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
          Sign In
        </button>
      </div>
    );
  }

  if (user.role !== "candidate") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <Bookmark className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Candidates Only</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Saved jobs is for job seekers only.</p>
      </div>
    );
  }

  const jobs = data?.savedJobs || [];
  const filtered = jobs.filter(j =>
    !search ||
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Saved Jobs</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{jobs.length} job{jobs.length !== 1 ? "s" : ""} bookmarked</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {jobs.length > 0 && (
          <div className="relative max-w-sm mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Filter saved jobs…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors" />
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 h-44 animate-pulse" />)}
          </div>
        )}

        {isError && <div className="text-center py-16"><p className="text-gray-400 text-sm">Failed to load saved jobs.</p></div>}

        {!isLoading && !isError && jobs.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-5">
              <Bookmark className="w-10 h-10 text-indigo-300 dark:text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No saved jobs yet</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              Tap the bookmark icon on any job listing to save it here for later.
            </p>
            <Link href="/jobs">
              <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white inline-flex items-center gap-2"
                style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
                Browse Jobs <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && jobs.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No jobs match your search.</p>
            <button onClick={() => setSearch("")} className="text-indigo-500 text-sm mt-2 hover:underline">Clear filter</button>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(job => (
              <JobCard key={job._id} job={job} onUnsave={(id) => unsaveMutation.mutateAsync(id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
