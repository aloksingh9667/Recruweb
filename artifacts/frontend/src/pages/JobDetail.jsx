import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  MapPin, Briefcase, IndianRupee, ArrowLeft, Send, Bookmark,
  BookmarkCheck, Clock, Users, Star, Globe, Building2, GraduationCap,
  Calendar, Timer, CheckCircle2, AlertCircle, ChevronRight,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground text-sm w-40 shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function JobDetail() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "", mobile: "", email: "", address: "",
    positionApplied: "", preferredLocation: "", expectedSalary: "", joiningAvailability: "",
    highestQualification: "", collegeName: "", passingYear: "",
    totalExperience: "", currentCompany: "", currentSalary: "",
    skills: "", coverLetter: "", resumeAttached: false,
  });
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchApi(`/jobs/${jobId}`),
  });

  const { data: applications } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => fetchApi("/applications/my"),
    enabled: !!user && user.role === "candidate",
  });

  const { data: savedJobsRaw } = useQuery({
    queryKey: ["savedJobs"],
    queryFn: () => fetchApi("/jobs/saved/my"),
    enabled: !!user && user.role === "candidate",
  });

  const savedJobsList = Array.isArray(savedJobsRaw) ? savedJobsRaw : (savedJobsRaw?.jobs ?? []);
  const hasApplied = (applications?.applications ?? (Array.isArray(applications) ? applications : []))
    .some(a => a.jobId === jobId || a.jobId?._id === jobId || a.jobId?.id === jobId);
  const isSaved = savedJobsList.some(j => j._id === jobId || j.id === jobId);
  const isCandidate = user?.role === "candidate";

  const applyMutation = useMutation({
    mutationFn: (data) => fetchApi("/applications", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
      toast({ title: "Application submitted!", description: "Your application has been sent." });
      setIsDialogOpen(false);
    },
    onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const handleApplySubmit = () => {
    applyMutation.mutate({
      jobId,
      ...form,
      skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
    });
  };

  const saveMutation = useMutation({
    mutationFn: () => isSaved
      ? fetchApi(`/jobs/${jobId}/save`, { method: "DELETE" })
      : fetchApi(`/jobs/${jobId}/save`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
      toast({ title: isSaved ? "Removed from saved" : "Job saved!" });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-xl font-semibold mb-2">Job not found</h2>
        <Link href="/jobs"><Button variant="outline">Back to Jobs</Button></Link>
      </div>
    );
  }

  const companyName = job.company || job.employer?.company || "Company";
  const companyDesc = job.companyDescription || job.employer?.description;
  const companyWebsite = job.companyWebsite || job.employer?.website;
  const companySize = job.companySize || job.employer?.companySize;
  const companyAddress = job.companyAddress;
  const companyRating = job.companyRating;
  const companyReviews = job.companyReviews;

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Link href="/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Job Header Card */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex gap-4 items-start">
                {/* Company Logo */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0 border border-border">
                  {companyName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">{job.title}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-base font-semibold text-primary">{companyName}</span>
                    {companyRating && (
                      <span className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-white" />{companyRating}
                      </span>
                    )}
                    {companyReviews > 0 && (
                      <span className="text-xs text-muted-foreground">{companyReviews} reviews</span>
                    )}
                  </div>

                  {/* Meta pills */}
                  <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                    {job.experienceRequired && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-primary/60" />{job.experienceRequired}
                      </span>
                    )}
                    {job.salaryRange && (
                      <span className="flex items-center gap-1.5">
                        <IndianRupee className="w-4 h-4 text-primary/60" />{job.salaryRange}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary/60" />{job.location}
                    </span>
                  </div>

                  {/* Secondary meta */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    {job.createdAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </span>
                    )}
                    {job.openings > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {job.openings} opening{job.openings !== 1 ? "s" : ""}
                      </span>
                    )}
                    {job.applicantCount > 0 && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {job.applicantCount}+ applicants
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-5 flex-wrap">
                {user?.role === "employer" ? (
                  <Button disabled variant="outline" className="flex-1 sm:flex-none">Employers cannot apply</Button>
                ) : hasApplied ? (
                  <Button disabled variant="secondary" className="flex-1 sm:flex-none gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Applied
                  </Button>
                ) : user ? (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex-1 sm:flex-none gap-2 font-semibold">
                        <Send className="w-4 h-4" /> Apply now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Apply for {job.title}</DialogTitle>
                        <DialogDescription>at {companyName} · {job.location}</DialogDescription>
                      </DialogHeader>
                      <div className="mt-3 space-y-5">
                        {/* Personal Details */}
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 pb-1 border-b">Personal Details</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { label: "Full Name *", key: "fullName", placeholder: "Your full name" },
                              { label: "Mobile Number *", key: "mobile", placeholder: "+91 XXXXX XXXXX" },
                              { label: "Email *", key: "email", placeholder: "you@email.com" },
                              { label: "Address", key: "address", placeholder: "City, State" },
                            ].map(({ label, key, placeholder }) => (
                              <div key={key}>
                                <label className="text-xs font-semibold text-foreground mb-1 block">{label}</label>
                                <input
                                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                                  placeholder={placeholder}
                                  value={form[key]}
                                  onChange={e => setField(key, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Job Preferences */}
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 pb-1 border-b">Job Preferences</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { label: "Position Applied For", key: "positionApplied", placeholder: job.title },
                              { label: "Preferred Location", key: "preferredLocation", placeholder: "e.g. Noida, Delhi" },
                              { label: "Expected Salary", key: "expectedSalary", placeholder: "e.g. ₹8 LPA" },
                              { label: "Joining Availability", key: "joiningAvailability", placeholder: "e.g. Immediate / 30 days" },
                            ].map(({ label, key, placeholder }) => (
                              <div key={key}>
                                <label className="text-xs font-semibold text-foreground mb-1 block">{label}</label>
                                <input
                                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                                  placeholder={placeholder}
                                  value={form[key]}
                                  onChange={e => setField(key, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Education */}
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 pb-1 border-b">Education</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { label: "Highest Qualification", key: "highestQualification", placeholder: "e.g. B.Tech, MBA" },
                              { label: "College Name", key: "collegeName", placeholder: "College / University" },
                              { label: "Passing Year", key: "passingYear", placeholder: "e.g. 2022" },
                            ].map(({ label, key, placeholder }) => (
                              <div key={key}>
                                <label className="text-xs font-semibold text-foreground mb-1 block">{label}</label>
                                <input
                                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                                  placeholder={placeholder}
                                  value={form[key]}
                                  onChange={e => setField(key, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Experience */}
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 pb-1 border-b">Experience</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { label: "Total Experience", key: "totalExperience", placeholder: "e.g. 3 years" },
                              { label: "Current Company", key: "currentCompany", placeholder: "Company name / Fresher" },
                              { label: "Current Salary", key: "currentSalary", placeholder: "e.g. ₹5 LPA" },
                            ].map(({ label, key, placeholder }) => (
                              <div key={key}>
                                <label className="text-xs font-semibold text-foreground mb-1 block">{label}</label>
                                <input
                                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                                  placeholder={placeholder}
                                  value={form[key]}
                                  onChange={e => setField(key, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Skills & Resume */}
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 pb-1 border-b">Skills & Resume</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-semibold text-foreground mb-1 block">Skills <span className="text-muted-foreground font-normal">(comma separated)</span></label>
                              <input
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                                placeholder="e.g. React, Node.js, Python"
                                value={form.skills}
                                onChange={e => setField("skills", e.target.value)}
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="resumeAttached"
                                checked={form.resumeAttached}
                                onChange={e => setField("resumeAttached", e.target.checked)}
                                className="w-4 h-4 accent-primary"
                              />
                              <label htmlFor="resumeAttached" className="text-sm font-medium cursor-pointer">
                                Resume Attached <span className="text-muted-foreground font-normal">(I have uploaded my resume to my profile)</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Cover Letter */}
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 pb-1 border-b">Cover Letter <span className="font-normal normal-case">(Optional)</span></h3>
                          <Textarea
                            placeholder="Why are you a great fit for this role? Highlight your most relevant experience..."
                            value={form.coverLetter}
                            onChange={e => setField("coverLetter", e.target.value)}
                            rows={4}
                            className="resize-none"
                          />
                        </div>

                        <Button
                          onClick={handleApplySubmit}
                          disabled={applyMutation.isPending || !form.fullName || !form.mobile || !form.email}
                          className="w-full font-semibold"
                        >
                          {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                        </Button>
                        {(!form.fullName || !form.mobile || !form.email) && (
                          <p className="text-xs text-muted-foreground text-center">* Full Name, Mobile and Email are required</p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Link href="/login"><Button className="flex-1 sm:flex-none font-semibold"><Send className="w-4 h-4 mr-2" />Login to Apply</Button></Link>
                )}

                <Button
                  variant="outline"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || (!user && false)}
                  className={`flex-1 sm:flex-none gap-2 ${isSaved ? "border-primary text-primary bg-primary/5" : ""}`}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  {isSaved ? "Saved" : "Save"}
                </Button>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 pb-2 border-b">Job description</h2>
              <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {job.description}
              </div>
            </div>

            {/* Key Responsibilities */}
            {job.keyResponsibilities && (
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 pb-2 border-b">Key Responsibilities</h2>
                <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {job.keyResponsibilities}
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 pb-2 border-b">Requirements & Qualifications</h2>
                <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {job.requirements}
                </div>
              </div>
            )}

            {/* Role Details Table */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-3 pb-2 border-b">Role details</h2>
              <div className="divide-y divide-border/50">
                <InfoRow label="Role" value={job.role || job.title} />
                <InfoRow label="Industry Type" value={job.industry} />
                <InfoRow label="Department" value={job.department} />
                <InfoRow label="Employment Type" value={job.employmentType ? job.employmentType.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : undefined} />
                <InfoRow label="Role Category" value={job.roleCategory} />
                <InfoRow label="Education" value={job.education} />
                {job.shiftTiming && <InfoRow label="Shift Timing" value={job.shiftTiming} />}
                {job.workingDays && <InfoRow label="Working Days" value={job.workingDays} />}
              </div>
            </div>

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 pb-2 border-b">Key Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1.5 text-xs font-medium rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* About Company */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 pb-2 border-b">About company</h2>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0 border border-border">
                  {companyName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{companyName}</h3>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    {(job.industry || job.employer?.industry) && (
                      <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.industry || job.employer?.industry}</span>
                    )}
                    {companySize && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{companySize}</span>}
                    {companyWebsite && (
                      <a href={companyWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        <Globe className="w-3.5 h-3.5" />Website
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {companyDesc && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{companyDesc}</p>
              )}

              {companyAddress && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground mt-3 pt-3 border-t border-border/50">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary/60" />
                  <span>{companyAddress}</span>
                </div>
              )}
            </div>

            {/* Contact */}
            {(job.contactEmail || job.contactPhone) && (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
                <p className="font-semibold mb-1">⚠️ Beware of fraudsters</p>
                <p className="text-xs opacity-80">Recruweb does not promise a job or interview in exchange for money. Do not pay anyone claiming to be a recruiter.</p>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-4">
            {/* Perks */}
            {job.perks?.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm">
                <h3 className="font-semibold mb-3 text-sm">Perks & Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {job.perks.map((perk, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/40 px-2.5 py-1 rounded-full font-medium">
                      <CheckCircle2 className="w-3 h-3" />{perk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm">
              <h3 className="font-semibold mb-3 text-sm">Quick Info</h3>
              <div className="space-y-3 text-sm">
                {job.employmentType && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Briefcase className="w-4 h-4 text-primary/60 shrink-0" />
                    <span className="capitalize">{job.employmentType.replace(/-/g, " ")}</span>
                  </div>
                )}
                {job.education && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <GraduationCap className="w-4 h-4 text-primary/60 shrink-0" />
                    <span>{job.education}</span>
                  </div>
                )}
                {job.shiftTiming && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Timer className="w-4 h-4 text-primary/60 shrink-0" />
                    <span>{job.shiftTiming}</span>
                  </div>
                )}
                {job.workingDays && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary/60 shrink-0" />
                    <span>{job.workingDays}</span>
                  </div>
                )}
                {job.openings > 0 && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Users className="w-4 h-4 text-primary/60 shrink-0" />
                    <span>{job.openings} opening{job.openings !== 1 ? "s" : ""}</span>
                  </div>
                )}
                {job.category && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <ChevronRight className="w-4 h-4 text-primary/60 shrink-0" />
                    <span>{job.category}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Apply CTA again on sidebar */}
            {!hasApplied && isCandidate && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold mb-1">Interested in this job?</p>
                <p className="text-xs text-muted-foreground mb-3">Apply now before the positions are filled</p>
                <Button size="sm" className="w-full font-semibold" onClick={() => setIsDialogOpen(true)}>
                  <Send className="w-3.5 h-3.5 mr-1.5" />Apply Now
                </Button>
              </div>
            )}

            {/* Report */}
            <div className="text-center">
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Report this job
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
