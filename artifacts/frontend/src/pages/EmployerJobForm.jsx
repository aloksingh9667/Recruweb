import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Check, ChevronRight, X, Plus, Briefcase, Phone } from "lucide-react";
import { Link } from "wouter";

const STEPS = [
  { id: 1, label: "Job details" },
  { id: 2, label: "Candidate preferences" },
  { id: 3, label: "Screening questions" },
  { id: 4, label: "Job description" },
  { id: 5, label: "Communication preferences" },
];

const PERKS = [
  "Office cab/shuttle", "Food allowance", "Health insurance",
  "Annual bonus", "Provident fund", "Flexible working hours",
  "Work from home", "5 days working", "Laptop provided",
  "Performance bonus", "Paid leaves", "Gratuity",
];

const CATEGORIES = [
  "IT & Software", "Data Science & Analytics", "Marketing & Communications",
  "Sales & Business Development", "Finance & Accounting", "Human Resources",
  "Design & Creative", "Operations & Logistics", "Healthcare",
  "Engineering (Non-IT)", "Education & Training", "Legal & Compliance", "Other",
];

const EDUCATION = [
  "Any Graduate", "B.Tech/B.E.", "MBA/PGDM", "B.Sc", "BCA", "MCA",
  "M.Tech", "B.Com", "12th Pass", "10th Pass", "Any Post Graduate",
];

const EXP_OPTIONS = [
  "Fresher", "1", "2", "3", "4", "5", "6", "7", "8", "10", "12", "15", "20+"
];

const jobSchema = z.object({
  // Step 1
  postingType: z.string().default("company"),
  companyName: z.string().min(2, "Company name required"),
  title: z.string().min(2, "Job title required"),
  expMin: z.string().default("Fresher"),
  expMax: z.string().default("3"),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  perks: z.array(z.string()).default([]),
  // Step 2
  location: z.string().min(2, "Location required"),
  category: z.string().min(2, "Category required"),
  employmentType: z.string().default("full-time"),
  education: z.string().optional(),
  skills: z.string().optional(),
  // Step 3 — screening questions (stored as text)
  screeningQ1: z.string().optional(),
  screeningQ2: z.string().optional(),
  screeningQ3: z.string().optional(),
  // Step 4
  description: z.string().min(10, "Job description required"),
  requirements: z.string().optional(),
  // Step 5
  contactEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  notifyMethod: z.string().default("email"),
});

export default function EmployerJobForm() {
  const { jobId } = useParams();
  const isEditing = !!jobId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPerks, setSelectedPerks] = useState([]);
  const [customPerk, setCustomPerk] = useState("");

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchApi(`/jobs/${jobId}`),
    enabled: isEditing,
  });

  const form = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      postingType: "company",
      companyName: user?.company || "",
      title: "", expMin: "Fresher", expMax: "3",
      salaryMin: "", salaryMax: "", perks: [],
      location: "", category: "", employmentType: "full-time", education: "", skills: "",
      screeningQ1: "", screeningQ2: "", screeningQ3: "",
      description: "", requirements: "",
      contactEmail: user?.email || "", contactPhone: "", notifyMethod: "email",
    },
  });

  useEffect(() => {
    if (job) {
      form.reset({
        postingType: "company",
        companyName: job.company || user?.company || "",
        title: job.title || "",
        expMin: "Fresher", expMax: "5",
        salaryMin: "", salaryMax: "",
        perks: [], location: job.location || "",
        category: job.category || "",
        employmentType: job.type?.toLowerCase() || "full-time",
        education: "", skills: job.skills?.join(", ") || "",
        screeningQ1: "", screeningQ2: "", screeningQ3: "",
        description: job.description || "",
        requirements: job.requirements?.join("\n") || "",
        contactEmail: user?.email || "", contactPhone: "", notifyMethod: "email",
      });
      setSelectedPerks([]);
    }
  }, [job, user]);

  const mutation = useMutation({
    mutationFn: (data) => fetchApi(isEditing ? `/jobs/${jobId}` : "/jobs", {
      method: isEditing ? "PUT" : "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employerJobs"] });
      toast({ title: `Job ${isEditing ? "updated" : "posted"} successfully! 🎉`, description: "Your job listing is now live." });
      setLocation("/employer/jobs");
    },
    onError: (err) => {
      toast({ title: "Failed to post job", description: err.message, variant: "destructive" });
    },
  });

  const togglePerk = (perk) => {
    setSelectedPerks(prev => prev.includes(perk) ? prev.filter(p => p !== perk) : [...prev, perk]);
  };
  const addCustomPerk = () => {
    if (customPerk.trim() && !selectedPerks.includes(customPerk.trim())) {
      setSelectedPerks(prev => [...prev, customPerk.trim()]);
      setCustomPerk("");
    }
  };

  const validateStep = async (step) => {
    const fields = {
      1: ["companyName", "title"],
      2: ["location", "category"],
      3: [],
      4: ["description"],
      5: [],
    };
    return form.trigger(fields[step]);
  };

  const nextStep = async () => {
    const valid = await validateStep(currentStep);
    if (valid && currentStep < 5) setCurrentStep(s => s + 1);
  };

  const onSubmit = (data) => {
    const expStr = data.expMin === "Fresher" ? `Fresher - ${data.expMax} yrs` : `${data.expMin} - ${data.expMax} yrs`;
    const salaryStr = data.salaryMin && data.salaryMax ? `₹${data.salaryMin}K - ₹${data.salaryMax}K/month` : undefined;
    const payload = {
      title: data.title,
      company: data.companyName,
      location: data.location,
      type: data.employmentType,
      category: data.category,
      description: data.description,
      experience: expStr,
      salary: salaryStr,
      requirements: data.requirements ? data.requirements.split("\n").filter(Boolean) : [],
      skills: data.skills ? data.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
      perks: selectedPerks,
    };
    mutation.mutate(payload);
  };

  if (isEditing && isLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Loading job...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <div className="bg-white dark:bg-gray-900 border-b shadow-sm sticky top-14 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/employer/jobs">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <span className="font-bold text-base text-gray-900 dark:text-white">
                Post a job <span className="text-xs font-normal bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full ml-1">Free</span>
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
            <span>1800-102-2558</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex gap-8">
          {/* Sidebar Steps */}
          <div className="hidden md:block w-52 shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-sm overflow-hidden sticky top-36">
              {STEPS.map((step, idx) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => { if (isCompleted || isCurrent) setCurrentStep(step.id); }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b last:border-b-0 ${
                      isCurrent
                        ? "bg-primary/5 border-l-4 border-l-primary"
                        : isCompleted
                        ? "hover:bg-muted/50 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      isCompleted
                        ? "bg-primary text-white"
                        : isCurrent
                        ? "bg-primary text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    }`}>
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                    </div>
                    <span className={`text-sm font-medium ${isCurrent ? "text-primary" : isCompleted ? "text-gray-700 dark:text-gray-300" : "text-gray-400"}`}>
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Form Area */}
          <div className="flex-1 min-w-0">
            {/* Mobile Step indicator */}
            <div className="md:hidden flex items-center gap-2 mb-5 overflow-x-auto pb-1">
              {STEPS.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-1 shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${currentStep > step.id ? "bg-primary text-white" : currentStep === step.id ? "bg-primary text-white ring-4 ring-primary/20" : "bg-gray-200 text-gray-500"}`}>
                    {currentStep > step.id ? <Check className="w-3.5 h-3.5" /> : step.id}
                  </div>
                  {idx < STEPS.length - 1 && <div className={`w-4 h-0.5 ${currentStep > step.id ? "bg-primary" : "bg-gray-200"}`} />}
                </div>
              ))}
              <span className="ml-2 text-sm font-medium text-primary">{STEPS[currentStep - 1]?.label}</span>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* ── STEP 1: Job Details ── */}
                {currentStep === 1 && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-sm p-6 space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Job details</h2>
                      <p className="text-sm text-muted-foreground">Basic information about the position</p>
                    </div>

                    {/* Posting Type */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">You're posting this job as a:</p>
                      <div className="flex gap-3">
                        {["company", "consultancy"].map(type => (
                          <label key={type} className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 cursor-pointer transition-all text-sm font-medium ${form.watch("postingType") === type ? "border-primary bg-primary/5 text-primary" : "border-gray-200 dark:border-gray-600 text-gray-600 hover:border-primary/40"}`}>
                            <input type="radio" value={type} className="sr-only" {...form.register("postingType")} />
                            {type === "company" ? "Company/Business" : "Consultancy"}
                          </label>
                        ))}
                      </div>
                    </div>

                    <FormField control={form.control} name="companyName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Your company name</FormLabel>
                        <FormControl><Input placeholder="Company name" className="h-11" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Job title</FormLabel>
                        <FormControl><Input placeholder="Ex. Sales manager" className="h-11" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Work Experience */}
                    <div>
                      <label className="text-sm font-semibold block mb-2">Work experience</label>
                      <div className="flex items-center gap-3">
                        <Select value={form.watch("expMin")} onValueChange={v => form.setValue("expMin", v)}>
                          <SelectTrigger className="h-11"><SelectValue placeholder="Min exp." /></SelectTrigger>
                          <SelectContent>
                            {EXP_OPTIONS.slice(0, -1).map(o => <SelectItem key={o} value={o}>{o === "Fresher" ? "Fresher" : `${o} year${o !== "1" ? "s" : ""}`}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <span className="text-muted-foreground text-sm shrink-0">to</span>
                        <Select value={form.watch("expMax")} onValueChange={v => form.setValue("expMax", v)}>
                          <SelectTrigger className="h-11"><SelectValue placeholder="Max exp." /></SelectTrigger>
                          <SelectContent>
                            {EXP_OPTIONS.slice(1).map(o => <SelectItem key={o} value={o}>{o === "20+" ? "20+ years" : `${o} year${o !== "1" ? "s" : ""}`}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Salary */}
                    <div>
                      <label className="text-sm font-semibold block mb-2">Salary per month</label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1 border rounded-lg h-11 px-3">
                          <span className="text-muted-foreground font-medium">₹</span>
                          <Input type="number" placeholder="Min" className="border-0 h-9 p-0 focus-visible:ring-0 [appearance:textfield]" {...form.register("salaryMin")} />
                        </div>
                        <span className="text-muted-foreground text-sm shrink-0">to</span>
                        <div className="flex items-center gap-2 flex-1 border rounded-lg h-11 px-3">
                          <span className="text-muted-foreground font-medium">₹</span>
                          <Input type="number" placeholder="Max" className="border-0 h-9 p-0 focus-visible:ring-0 [appearance:textfield]" {...form.register("salaryMax")} />
                        </div>
                      </div>
                    </div>

                    {/* Perks */}
                    <div>
                      <label className="text-sm font-semibold block mb-1">
                        Perks and benefits <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
                      </label>
                      <div className="relative mb-3">
                        <Input
                          placeholder="Search for perks and benefits"
                          className="h-11"
                          value={customPerk}
                          onChange={e => setCustomPerk(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomPerk())}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Suggestions</p>
                      <div className="flex flex-wrap gap-2">
                        {PERKS.map(perk => (
                          <button
                            key={perk}
                            type="button"
                            onClick={() => togglePerk(perk)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all ${
                              selectedPerks.includes(perk)
                                ? "bg-primary/10 border-primary text-primary font-medium"
                                : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary/40"
                            }`}
                          >
                            {selectedPerks.includes(perk) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            {perk}
                          </button>
                        ))}
                      </div>
                      {selectedPerks.length > 0 && (
                        <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1.5">Selected perks ({selectedPerks.length}):</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedPerks.map(p => (
                              <span key={p} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                                {p}
                                <button type="button" onClick={() => togglePerk(p)}><X className="w-2.5 h-2.5" /></button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Candidate Preferences ── */}
                {currentStep === 2 && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-sm p-6 space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Candidate preferences</h2>
                      <p className="text-sm text-muted-foreground">Define your ideal candidate</p>
                    </div>

                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Job location *</FormLabel>
                        <FormControl><Input placeholder="e.g. Noida, Delhi, Bangalore or Remote" className="h-11" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Job category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11"><SelectValue placeholder="Select job category" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="employmentType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Employment type *</FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { value: "full-time", label: "Full Time" },
                            { value: "part-time", label: "Part Time" },
                            { value: "contract", label: "Contract" },
                            { value: "internship", label: "Internship" },
                            { value: "remote", label: "Remote" },
                            { value: "hybrid", label: "Hybrid" },
                          ].map(opt => (
                            <label key={opt.value} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer text-sm transition-all ${field.value === opt.value ? "border-primary bg-primary/5 text-primary font-medium" : "border-gray-200 dark:border-gray-600 hover:border-primary/40"}`}>
                              <input type="radio" value={opt.value} className="sr-only" onChange={() => field.onChange(opt.value)} checked={field.value === opt.value} />
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${field.value === opt.value ? "border-primary" : "border-gray-300"}`}>
                                {field.value === opt.value && <div className="w-2 h-2 bg-primary rounded-full" />}
                              </div>
                              {opt.label}
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="education" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Minimum education</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11"><SelectValue placeholder="Select education level" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EDUCATION.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="skills" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Required skills <span className="text-muted-foreground font-normal text-xs">(comma separated)</span></FormLabel>
                        <FormControl><Input placeholder="e.g. React, Node.js, Python, SQL" className="h-11" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* ── STEP 3: Screening Questions ── */}
                {currentStep === 3 && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-sm p-6 space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Screening questions</h2>
                      <p className="text-sm text-muted-foreground">Add up to 3 questions to filter candidates <span className="text-primary">(Optional)</span></p>
                    </div>

                    {[
                      { name: "screeningQ1", placeholder: "e.g. How many years of React experience do you have?" },
                      { name: "screeningQ2", placeholder: "e.g. Are you comfortable working from Noida office?" },
                      { name: "screeningQ3", placeholder: "e.g. What is your current notice period?" },
                    ].map((q, i) => (
                      <FormField key={q.name} control={form.control} name={q.name} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Question {i + 1}</FormLabel>
                          <FormControl>
                            <Input placeholder={q.placeholder} className="h-11" {...field} />
                          </FormControl>
                        </FormItem>
                      )} />
                    ))}

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">💡 Pro Tip</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Screening questions help you filter candidates before reviewing resumes. Ask specific, job-relevant questions to get better responses.</p>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: Job Description ── */}
                {currentStep === 4 && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-sm p-6 space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Job description</h2>
                      <p className="text-sm text-muted-foreground">Describe the role, responsibilities, and what makes it great</p>
                    </div>

                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Job description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the role, day-to-day responsibilities, team size, tech stack, growth opportunities..."
                            rows={8}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between">
                          <FormMessage />
                          <span className="text-xs text-muted-foreground">{field.value?.length || 0} characters</span>
                        </div>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="requirements" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Requirements / Qualifications <span className="text-muted-foreground font-normal text-xs">(Optional)</span></FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={"• B.Tech/BCA in Computer Science\n• 3+ years of experience with React\n• Strong communication skills\n• Experience with agile methodologies"}
                            rows={5}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* ── STEP 5: Communication Preferences ── */}
                {currentStep === 5 && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-sm p-6 space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Communication preferences</h2>
                      <p className="text-sm text-muted-foreground">How should candidates and we contact you?</p>
                    </div>

                    <FormField control={form.control} name="contactEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Contact email</FormLabel>
                        <FormControl><Input type="email" placeholder="hr@yourcompany.com" className="h-11" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="contactPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Contact phone <span className="text-muted-foreground font-normal text-xs">(Optional)</span></FormLabel>
                        <FormControl><Input type="tel" placeholder="+91 98765 43210" className="h-11" {...field} /></FormControl>
                      </FormItem>
                    )} />

                    <div>
                      <label className="text-sm font-semibold block mb-2">Notify me of new applications via</label>
                      <div className="flex gap-3">
                        {["email", "sms", "both"].map(method => (
                          <label key={method} className={`flex items-center gap-2 px-4 py-2.5 rounded-full border cursor-pointer text-sm capitalize transition-all ${form.watch("notifyMethod") === method ? "border-primary bg-primary/5 text-primary font-medium" : "border-gray-200 dark:border-gray-600 hover:border-primary/40"}`}>
                            <input type="radio" value={method} className="sr-only" {...form.register("notifyMethod")} />
                            {method === "both" ? "Email + SMS" : method.toUpperCase()}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
                      <h3 className="font-bold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                        <Check className="w-4 h-4" /> Ready to post!
                      </h3>
                      <div className="space-y-1.5 text-sm text-green-700 dark:text-green-400">
                        <div className="flex justify-between"><span>Job title:</span><span className="font-medium">{form.watch("title")}</span></div>
                        <div className="flex justify-between"><span>Company:</span><span className="font-medium">{form.watch("companyName")}</span></div>
                        <div className="flex justify-between"><span>Location:</span><span className="font-medium">{form.watch("location")}</span></div>
                        <div className="flex justify-between"><span>Type:</span><span className="font-medium capitalize">{form.watch("employmentType")}</span></div>
                        {selectedPerks.length > 0 && <div className="flex justify-between"><span>Perks:</span><span className="font-medium">{selectedPerks.length} selected</span></div>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => currentStep > 1 ? setCurrentStep(s => s - 1) : setLocation("/employer/jobs")}
                    className="px-6"
                  >
                    {currentStep === 1 ? "Cancel" : "← Back"}
                  </Button>

                  {currentStep < 5 ? (
                    <Button type="button" onClick={nextStep} className="px-8 gap-2">
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={mutation.isPending} className="px-10 gap-2">
                      {mutation.isPending ? (
                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Posting...</>
                      ) : (
                        <><Check className="w-4 h-4" /> {isEditing ? "Update Job" : "Post Job"}</>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
