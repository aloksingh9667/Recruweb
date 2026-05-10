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
import { Check, X, Plus, Briefcase, Building2, MapPin, GraduationCap, Clock, Calendar, Users, Globe, Star } from "lucide-react";
import { Link } from "wouter";

const STEPS = [
  { id: 1, label: "Job Details", icon: Briefcase },
  { id: 2, label: "Candidate Requirements", icon: GraduationCap },
  { id: 3, label: "Role Information", icon: Building2 },
  { id: 4, label: "Job Description", icon: Briefcase },
  { id: 5, label: "Company Info", icon: Building2 },
];

const PERKS = [
  "Health insurance", "Annual bonus", "Provident fund", "Flexible working hours",
  "Work from home", "5 days working", "Laptop provided", "Performance bonus",
  "Paid leaves", "Office cab/shuttle", "Food allowance", "Gratuity",
];

const CATEGORIES = [
  "IT & Software", "Data Science & Analytics", "Marketing & Communications",
  "Sales & Business Development", "Finance & Accounting", "Human Resources",
  "Design & Creative", "Operations & Logistics", "Healthcare",
  "Engineering (Non-IT)", "Education & Training", "Legal & Compliance", "Other",
];

const INDUSTRIES = [
  "IT Services & Consulting", "Software Product", "Internet / E-commerce",
  "Banking / Financial Services", "Insurance", "BPO / Call Centre",
  "Telecom / ISP", "Retail", "Manufacturing", "Healthcare / Pharma",
  "Education / EdTech", "Real Estate", "FMCG", "Automobile", "Other",
];

const DEPARTMENTS = [
  "IT & Information Security", "Software Development", "Data Science & Analytics",
  "Sales & Business Development", "Marketing & Communications", "Finance & Accounting",
  "Human Resources", "Operations", "Customer Success", "Design & UX",
  "Legal & Compliance", "Administration", "Other",
];

const ROLE_CATEGORIES = [
  "Software Engineer", "IT Support", "Data Scientist", "Product Manager",
  "Business Development", "Sales Executive", "Marketing Manager",
  "HR Manager", "Finance Manager", "Operations Manager", "Other",
];

const EDUCATION = [
  "Any Graduate", "B.Tech/B.E.", "MBA/PGDM", "B.Sc", "BCA", "MCA",
  "M.Tech", "B.Com", "12th Pass", "10th Pass", "Any Post Graduate",
];

const COMPANY_SIZES = [
  "1-10 employees", "11-50 employees", "51-200 employees",
  "201-500 employees", "501-1000 employees", "1001-5000 employees",
  "5000+ employees",
];

const EXP_OPTIONS = ["Fresher", "1", "2", "3", "4", "5", "6", "7", "8", "10", "12", "15", "20+"];

const schema = z.object({
  companyName: z.string().min(2, "Company name required"),
  title: z.string().min(2, "Job title required"),
  expMin: z.string().default("Fresher"),
  expMax: z.string().default("3"),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  openings: z.string().default("1"),
  location: z.string().min(2, "Location required"),
  category: z.string().min(1, "Category required"),
  employmentType: z.string().default("full-time"),
  education: z.string().optional(),
  skills: z.string().optional(),
  industry: z.string().optional(),
  department: z.string().optional(),
  roleCategory: z.string().optional(),
  role: z.string().optional(),
  shiftTiming: z.string().optional(),
  workingDays: z.string().optional(),
  keyResponsibilities: z.string().optional(),
  description: z.string().min(10, "Job description required"),
  requirements: z.string().optional(),
  companyDescription: z.string().optional(),
  companyWebsite: z.string().optional(),
  companySize: z.string().optional(),
  companyAddress: z.string().optional(),
  companyRating: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
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
  const [skillInput, setSkillInput] = useState("");
  const [skillsList, setSkillsList] = useState([]);
  const [customPerk, setCustomPerk] = useState("");

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchApi(`/jobs/${jobId}`),
    enabled: isEditing,
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: user?.company || "",
      title: "", expMin: "Fresher", expMax: "3",
      salaryMin: "", salaryMax: "", openings: "1",
      location: "", category: "", employmentType: "full-time",
      education: "", skills: "",
      industry: "", department: "", roleCategory: "", role: "",
      shiftTiming: "", workingDays: "",
      keyResponsibilities: "", description: "", requirements: "",
      companyDescription: "", companyWebsite: "", companySize: "", companyAddress: "",
      companyRating: "", contactEmail: user?.email || "", contactPhone: "",
    },
  });

  useEffect(() => {
    if (job) {
      const expParts = (job.experienceRequired || "Fresher - 3 yrs").split("-");
      form.reset({
        companyName: job.company || user?.company || "",
        title: job.title || "",
        expMin: expParts[0]?.trim() || "Fresher",
        expMax: expParts[1]?.replace(/yrs?/i, "").trim() || "3",
        salaryMin: "", salaryMax: "",
        openings: String(job.openings || 1),
        location: job.location || "",
        category: job.category || "",
        employmentType: job.employmentType || "full-time",
        education: job.education || "",
        industry: job.industry || "",
        department: job.department || "",
        roleCategory: job.roleCategory || "",
        role: job.role || "",
        shiftTiming: job.shiftTiming || "",
        workingDays: job.workingDays || "",
        keyResponsibilities: job.keyResponsibilities || "",
        description: job.description || "",
        requirements: job.requirements || "",
        companyDescription: job.companyDescription || "",
        companyWebsite: job.companyWebsite || "",
        companySize: job.companySize || "",
        companyAddress: job.companyAddress || "",
        companyRating: String(job.companyRating || ""),
        contactEmail: job.contactEmail || user?.email || "",
        contactPhone: job.contactPhone || "",
      });
      setSelectedPerks(job.perks || []);
      setSkillsList(job.skills || []);
    }
  }, [job]);

  const mutation = useMutation({
    mutationFn: (data) => fetchApi(isEditing ? `/jobs/${jobId}` : "/jobs", {
      method: isEditing ? "PUT" : "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employerJobs"] });
      toast({ title: `Job ${isEditing ? "updated" : "posted"} successfully!`, description: "Your listing is now live." });
      setLocation("/employer/jobs");
    },
    onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skillsList.includes(s)) setSkillsList(prev => [...prev, s]);
    setSkillInput("");
  };
  const removeSkill = (s) => setSkillsList(prev => prev.filter(x => x !== s));
  const togglePerk = (p) => setSelectedPerks(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
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

  const onSubmit = (data) => {
    const expStr = data.expMin === "Fresher" ? `Fresher - ${data.expMax} yrs` : `${data.expMin} - ${data.expMax} yrs`;
    const salaryStr = data.salaryMin && data.salaryMax ? `₹${data.salaryMin}K - ₹${data.salaryMax}K/month` : undefined;
    mutation.mutate({
      title: data.title,
      company: data.companyName,
      location: data.location,
      employmentType: data.employmentType,
      category: data.category,
      description: data.description,
      keyResponsibilities: data.keyResponsibilities,
      requirements: data.requirements,
      experienceRequired: expStr,
      salaryRange: salaryStr,
      openings: parseInt(data.openings) || 1,
      skills: skillsList,
      perks: selectedPerks,
      industry: data.industry,
      department: data.department,
      roleCategory: data.roleCategory,
      role: data.role || data.title,
      education: data.education,
      shiftTiming: data.shiftTiming,
      workingDays: data.workingDays,
      companyDescription: data.companyDescription,
      companyWebsite: data.companyWebsite,
      companySize: data.companySize,
      companyAddress: data.companyAddress,
      companyRating: data.companyRating ? parseFloat(data.companyRating) : undefined,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
    });
  };

  if (isEditing && isLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const StepIcon = STEPS[currentStep - 1]?.icon || Briefcase;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <div className="bg-card border-b shadow-sm sticky top-14 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/employer/jobs">
              <button className="text-muted-foreground hover:text-foreground transition-colors p-1"><X className="w-5 h-5" /></button>
            </Link>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <span className="font-bold text-base">
                {isEditing ? "Edit Job" : "Post a Job"}
                <span className="text-xs font-normal bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full ml-2">Free</span>
              </span>
            </div>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:block">Step {currentStep} of {STEPS.length}</span>
        </div>

        {/* Step progress bar */}
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(currentStep / STEPS.length) * 100}%` }} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden md:block w-52 shrink-0">
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden sticky top-32">
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => { if (isCompleted || isCurrent) setCurrentStep(step.id); }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b last:border-b-0 ${
                      isCurrent ? "bg-primary/5 border-l-4 border-l-primary" :
                      isCompleted ? "hover:bg-muted/50 cursor-pointer" : "opacity-40 cursor-not-allowed"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCompleted ? "bg-primary text-white" : isCurrent ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-sm font-medium ${isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 min-w-0">
            {/* Mobile step pills */}
            <div className="md:hidden flex items-center gap-2 mb-5 overflow-x-auto pb-1">
              {STEPS.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-1 shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep > step.id ? "bg-primary text-white" : currentStep === step.id ? "bg-primary text-white ring-4 ring-primary/20" : "bg-muted text-muted-foreground"
                  }`}>
                    {currentStep > step.id ? <Check className="w-3.5 h-3.5" /> : step.id}
                  </div>
                  {idx < STEPS.length - 1 && <div className={`w-4 h-0.5 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />}
                </div>
              ))}
              <span className="ml-2 text-sm font-medium text-primary">{STEPS[currentStep - 1]?.label}</span>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>

                {/* ── STEP 1: Job Details ── */}
                {currentStep === 1 && (
                  <div className="bg-card rounded-xl border shadow-sm p-5 sm:p-6 space-y-5">
                    <div>
                      <h2 className="text-xl font-bold mb-0.5">Job Details</h2>
                      <p className="text-sm text-muted-foreground">Basic information about the position</p>
                    </div>

                    <FormField control={form.control} name="companyName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Company Name *</FormLabel>
                        <FormControl><Input placeholder="e.g. TCS, Infosys, your company name" className="h-11" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Job Title *</FormLabel>
                        <FormControl><Input placeholder="e.g. Senior React Developer, Data Analyst" className="h-11" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div>
                      <label className="text-sm font-semibold block mb-2">Work Experience</label>
                      <div className="flex items-center gap-3">
                        <Select value={form.watch("expMin")} onValueChange={v => form.setValue("expMin", v)}>
                          <SelectTrigger className="h-11"><SelectValue placeholder="Min" /></SelectTrigger>
                          <SelectContent>{EXP_OPTIONS.slice(0, -1).map(o => <SelectItem key={o} value={o}>{o === "Fresher" ? "Fresher" : `${o} yr`}</SelectItem>)}</SelectContent>
                        </Select>
                        <span className="text-muted-foreground text-sm shrink-0">to</span>
                        <Select value={form.watch("expMax")} onValueChange={v => form.setValue("expMax", v)}>
                          <SelectTrigger className="h-11"><SelectValue placeholder="Max" /></SelectTrigger>
                          <SelectContent>{EXP_OPTIONS.slice(1).map(o => <SelectItem key={o} value={o}>{o === "20+" ? "20+ yrs" : `${o} yr`}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold block mb-2">Monthly Salary (₹ thousands)</label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1 border rounded-lg h-11 px-3 bg-background">
                          <span className="text-muted-foreground font-medium">₹</span>
                          <Input type="number" placeholder="Min" className="border-0 h-9 p-0 focus-visible:ring-0" {...form.register("salaryMin")} />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">K/mo</span>
                        </div>
                        <span className="text-muted-foreground text-sm shrink-0">to</span>
                        <div className="flex items-center gap-2 flex-1 border rounded-lg h-11 px-3 bg-background">
                          <span className="text-muted-foreground font-medium">₹</span>
                          <Input type="number" placeholder="Max" className="border-0 h-9 p-0 focus-visible:ring-0" {...form.register("salaryMax")} />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">K/mo</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold block mb-2">Number of Openings</label>
                      <Input type="number" min="1" placeholder="1" className="h-11 w-32" {...form.register("openings")} />
                    </div>

                    <div>
                      <label className="text-sm font-semibold block mb-1">Perks & Benefits <span className="text-muted-foreground font-normal text-xs">(Optional)</span></label>
                      <div className="flex gap-2 mb-3">
                        <Input placeholder="Add custom perk..." className="h-9 flex-1" value={customPerk} onChange={e => setCustomPerk(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomPerk())} />
                        <Button type="button" variant="outline" size="sm" onClick={addCustomPerk}><Plus className="w-4 h-4" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {PERKS.map(perk => (
                          <button key={perk} type="button" onClick={() => togglePerk(perk)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${
                            selectedPerks.includes(perk) ? "bg-primary/10 border-primary text-primary font-medium" : "border-border text-muted-foreground hover:border-primary/40"
                          }`}>
                            {selectedPerks.includes(perk) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}{perk}
                          </button>
                        ))}
                      </div>
                      {selectedPerks.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {selectedPerks.map(p => (
                            <span key={p} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                              {p}<button type="button" onClick={() => togglePerk(p)}><X className="w-2.5 h-2.5" /></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Candidate Requirements ── */}
                {currentStep === 2 && (
                  <div className="bg-card rounded-xl border shadow-sm p-5 sm:p-6 space-y-5">
                    <div>
                      <h2 className="text-xl font-bold mb-0.5">Candidate Requirements</h2>
                      <p className="text-sm text-muted-foreground">Define what you're looking for in candidates</p>
                    </div>

                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Job Location *</FormLabel>
                        <FormControl><Input placeholder="e.g. Noida, Delhi, Bangalore or Remote" className="h-11" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Job Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                          <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="employmentType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Employment Type *</FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { value: "full-time", label: "Full Time" },
                            { value: "part-time", label: "Part Time" },
                            { value: "contract", label: "Contract" },
                            { value: "internship", label: "Internship" },
                            { value: "remote", label: "Remote" },
                            { value: "hybrid", label: "Hybrid" },
                          ].map(opt => (
                            <label key={opt.value} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer text-sm transition-all ${field.value === opt.value ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:border-primary/40"}`}>
                              <input type="radio" value={opt.value} className="sr-only" onChange={() => field.onChange(opt.value)} checked={field.value === opt.value} />
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${field.value === opt.value ? "border-primary" : "border-muted-foreground/40"}`}>
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
                        <FormLabel className="font-semibold">Minimum Education</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select education level" /></SelectTrigger></FormControl>
                          <SelectContent>{EDUCATION.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <div>
                      <label className="text-sm font-semibold block mb-2">Required Skills</label>
                      <div className="flex gap-2 mb-2">
                        <Input placeholder="Add a skill (e.g. React, Python...)" className="h-10 flex-1" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
                        <Button type="button" variant="outline" size="sm" onClick={addSkill}><Plus className="w-4 h-4" /></Button>
                      </div>
                      {skillsList.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {skillsList.map(s => (
                            <span key={s} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium">
                              {s}<button type="button" onClick={() => removeSkill(s)}><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Role Information ── */}
                {currentStep === 3 && (
                  <div className="bg-card rounded-xl border shadow-sm p-5 sm:p-6 space-y-5">
                    <div>
                      <h2 className="text-xl font-bold mb-0.5">Role Information</h2>
                      <p className="text-sm text-muted-foreground">Help candidates understand the role better</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="industry" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Industry Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select industry" /></SelectTrigger></FormControl>
                            <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="department" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Department</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                            <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="roleCategory" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Role Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select role category" /></SelectTrigger></FormControl>
                            <SelectContent>{ROLE_CATEGORIES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="role" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Role / Designation</FormLabel>
                          <FormControl><Input placeholder="e.g. Software Engineer L2" className="h-11" {...field} /></FormControl>
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="shiftTiming" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold flex items-center gap-1.5"><Clock className="w-4 h-4" />Shift Timing</FormLabel>
                          <FormControl><Input placeholder="e.g. 9:00 AM - 6:00 PM" className="h-11" {...field} /></FormControl>
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="workingDays" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold flex items-center gap-1.5"><Calendar className="w-4 h-4" />Working Days</FormLabel>
                          <FormControl><Input placeholder="e.g. Monday - Friday" className="h-11" {...field} /></FormControl>
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="keyResponsibilities" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Key Responsibilities</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={"• Develop and maintain React applications\n• Collaborate with cross-functional teams\n• Code reviews and technical documentation\n• Optimize performance and scalability"}
                            rows={5} className="resize-none" {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Use bullet points (• or -) for better readability</p>
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* ── STEP 4: Job Description ── */}
                {currentStep === 4 && (
                  <div className="bg-card rounded-xl border shadow-sm p-5 sm:p-6 space-y-5">
                    <div>
                      <h2 className="text-xl font-bold mb-0.5">Job Description</h2>
                      <p className="text-sm text-muted-foreground">Describe the role in detail</p>
                    </div>

                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Full Job Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the role, team, tech stack, growth opportunities, why candidates should join..."
                            rows={8} className="resize-none" {...field}
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
                            placeholder={"• B.Tech/BCA in Computer Science\n• 3+ years with React\n• Strong communication skills\n• Experience with agile teams"}
                            rows={5} className="resize-none" {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* ── STEP 5: Company Info ── */}
                {currentStep === 5 && (
                  <div className="bg-card rounded-xl border shadow-sm p-5 sm:p-6 space-y-5">
                    <div>
                      <h2 className="text-xl font-bold mb-0.5">Company Information</h2>
                      <p className="text-sm text-muted-foreground">Help candidates learn about your company</p>
                    </div>

                    <FormField control={form.control} name="companyDescription" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">About Company</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your company — mission, values, culture, what makes it a great place to work..." rows={4} className="resize-none" {...field} />
                        </FormControl>
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="companyWebsite" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold flex items-center gap-1.5"><Globe className="w-4 h-4" />Website</FormLabel>
                          <FormControl><Input placeholder="https://yourcompany.com" className="h-11" {...field} /></FormControl>
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="companySize" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold flex items-center gap-1.5"><Users className="w-4 h-4" />Company Size</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select size" /></SelectTrigger></FormControl>
                            <SelectContent>{COMPANY_SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="companyRating" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold flex items-center gap-1.5"><Star className="w-4 h-4" />Company Rating (optional)</FormLabel>
                          <FormControl><Input type="number" step="0.1" min="0" max="5" placeholder="e.g. 4.2" className="h-11" {...field} /></FormControl>
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="companyAddress" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold flex items-center gap-1.5"><MapPin className="w-4 h-4" />Office Address</FormLabel>
                          <FormControl><Input placeholder="Full office address" className="h-11" {...field} /></FormControl>
                        </FormItem>
                      )} />
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm font-semibold mb-3">Contact Details</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="contactEmail" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl><Input type="email" placeholder="hr@company.com" className="h-11" {...field} /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="contactPhone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl><Input type="tel" placeholder="+91 98765 43210" className="h-11" {...field} /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Preview summary */}
                    <div className="bg-muted/50 rounded-xl p-4 text-sm">
                      <p className="font-semibold mb-2 text-foreground">📋 Summary</p>
                      <div className="grid grid-cols-2 gap-1 text-muted-foreground text-xs">
                        <span>Title: <strong className="text-foreground">{form.watch("title") || "—"}</strong></span>
                        <span>Company: <strong className="text-foreground">{form.watch("companyName") || "—"}</strong></span>
                        <span>Location: <strong className="text-foreground">{form.watch("location") || "—"}</strong></span>
                        <span>Type: <strong className="text-foreground capitalize">{form.watch("employmentType") || "—"}</strong></span>
                        <span>Skills: <strong className="text-foreground">{skillsList.length} added</strong></span>
                        <span>Openings: <strong className="text-foreground">{form.watch("openings") || 1}</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-5">
                  {currentStep > 1 ? (
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(s => s - 1)}>← Previous</Button>
                  ) : <div />}

                  {currentStep < STEPS.length ? (
                    <Button type="button" onClick={async () => {
                      const valid = await validateStep(currentStep);
                      if (valid) setCurrentStep(s => s + 1);
                    }}>
                      Next →
                    </Button>
                  ) : (
                    <Button type="submit" disabled={mutation.isPending} className="px-8 font-semibold">
                      {mutation.isPending ? "Posting..." : isEditing ? "Update Job" : "Post Job →"}
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
