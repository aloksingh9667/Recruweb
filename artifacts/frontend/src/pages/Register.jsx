import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Building2, User, Eye, EyeOff, Phone, Mail, Lock, ArrowRight, CheckCircle2, MapPin, Linkedin, GraduationCap, Globe, Users, Tag } from "lucide-react";

const FIELDS_OF_INTEREST = [
  "Information Technology", "Software Engineering", "Data Science & Analytics",
  "Marketing & Communications", "Sales & Business Development", "Finance & Accounting",
  "Human Resources", "Design & Creative", "Operations & Logistics", "Healthcare",
  "Education & Training", "Legal & Compliance", "Engineering (Non-IT)", "Content Writing",
  "Customer Support", "Banking & Insurance", "Retail & E-commerce", "Other",
];

const EXPERIENCE_LEVELS = [
  "Fresher (0 years)", "Less than 1 year", "1-2 years", "2-3 years",
  "3-5 years", "5-8 years", "8-12 years", "12+ years",
];

const INDUSTRIES = [
  "Information Technology", "Banking & Financial Services", "Healthcare & Pharma",
  "E-commerce & Retail", "Manufacturing", "Consulting", "Media & Entertainment",
  "Education & EdTech", "Real Estate", "Logistics & Supply Chain",
  "Telecom", "FMCG", "Automobile", "Energy & Utilities", "Other",
];

const COMPANY_SIZES = [
  "1-10 (Startup)", "11-50 (Small)", "51-200 (Small-Medium)",
  "201-500 (Medium)", "501-1000 (Large)", "1001-5000 (Enterprise)", "5000+ (MNC)",
];

const EDUCATION_LEVELS = [
  "High School / 12th", "Diploma", "B.Tech / B.E.", "BCA / B.Sc (IT)",
  "B.Com / BBA / BA", "M.Tech / M.E.", "MCA / M.Sc", "MBA / PGDM",
  "Ph.D", "Other Graduate", "Other Post-Graduate",
];

const WORK_MODES = ["Work from Office", "Work from Home", "Hybrid", "Open to All"];

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["candidate", "employer"]),
  company: z.string().optional(),
  fieldOfInterest: z.string().optional(),
  experienceLevel: z.string().optional(),
  currentLocation: z.string().optional(),
  currentTitle: z.string().optional(),
  education: z.string().optional(),
  skills: z.string().optional(),
  preferredWorkMode: z.string().optional(),
  linkedinUrl: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  website: z.string().optional(),
  hiringFor: z.string().optional(),
}).refine(data => {
  if (data.role === "employer" && (!data.company || data.company.length < 2)) return false;
  return true;
}, { message: "Company name is required for employers", path: ["company"] });

export default function Register() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("candidate");
  const [step, setStep] = useState(1);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "", email: "", phone: "", password: "",
      role: "candidate", company: "",
      fieldOfInterest: "", experienceLevel: "", currentLocation: "",
      currentTitle: "", education: "", skills: "", preferredWorkMode: "", linkedinUrl: "",
      industry: "", companySize: "", website: "", hiringFor: "",
    },
  });

  const role = form.watch("role");

  const onRoleSelect = (r) => {
    setSelectedRole(r);
    form.setValue("role", r);
  };

  const nextStep = async () => {
    const fields = ["name", "email", "phone", "password", "role", ...(role === "employer" ? ["company"] : [])];
    const valid = await form.trigger(fields);
    if (valid) setStep(2);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        phone: data.phone || undefined,
        skills: data.skills ? data.skills.split(",").map(s => s.trim()).filter(Boolean) : undefined,
      };
      const res = await fetchApi("/auth/register", { method: "POST", body: JSON.stringify(payload) });
      if (res?.token && res?.user) {
        login(res.token, res.user);
        toast({ title: "Welcome to Recruweb!", description: "Your account has been created successfully." });
        setLocation(res.user.role === "employer" ? "/employer/dashboard" : "/candidate/dashboard");
      } else {
        toast({ title: "Registration failed", description: "Unexpected response. Please try again.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Registration failed", description: err.message || "Something went wrong. Please try again.", variant: "destructive" });
    }
  };

  const benefits = role === "employer"
    ? ["Post unlimited job listings", "Access to 1Cr+ candidate profiles", "AI-powered candidate matching", "Track applications easily"]
    : ["Apply to 5L+ jobs instantly", "AI Resume Builder & Analyzer", "Job alerts & notifications", "Career counseling tools"];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-primary flex-col justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 25% 25%, white 2px, transparent 2px)", backgroundSize: "50px 50px"}} />
        <div className="relative z-10 max-w-xs">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {role === "employer" ? "Start Hiring Today" : "Find Your Next Role"}
          </h2>
          <p className="text-blue-100 mb-8 leading-relaxed">
            {role === "employer" ? "Join 50,000+ companies hiring on Recruweb." : "Join 1 Crore+ job seekers on India's fastest growing job portal."}
          </p>
          <div className="space-y-3">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-300 shrink-0" />
                <span className="text-blue-50 text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Create your account</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Join Recruweb — India's top job portal</p>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>{s}</div>
                <span className={`text-sm font-medium ${step >= s ? "text-primary" : "text-gray-400"}`}>{s === 1 ? "Basic Info" : "Your Profile"}</span>
                {s < 2 && <div className={`flex-1 h-0.5 w-12 ${step > s ? "bg-primary" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* ── STEP 1 ── */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">I want to:</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: "candidate", label: "Find a Job", sub: "Job Seeker", Icon: User },
                          { value: "employer", label: "Hire Talent", sub: "Employer/Company", Icon: Building2 },
                        ].map(({ value, label, sub, Icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => onRoleSelect(value)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedRole === value ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-600 hover:border-primary/40"}`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedRole === value ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className={`text-sm font-semibold ${selectedRole === value ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}>{label}</span>
                            <span className="text-[11px] text-gray-400">{sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input placeholder="Rahul Sharma" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input type="email" placeholder="you@example.com" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input type="tel" placeholder="+91 98765 43210" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" className="pl-10 pr-10" {...field} />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    {role === "employer" && (
                      <FormField control={form.control} name="company" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input placeholder="Acme Technologies Pvt. Ltd." className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}

                    <Button type="button" className="w-full h-11 gap-2 font-semibold" onClick={nextStep}>
                      Continue <ArrowRight className="w-4 h-4" />
                    </Button>

                    <div className="text-center text-sm text-gray-500">
                      Already have an account?{" "}
                      <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link>
                    </div>
                  </div>
                )}

                {/* ── STEP 2 — CANDIDATE ── */}
                {step === 2 && role === "candidate" && (
                  <div className="space-y-4">
                    <div className="text-center mb-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Tell us about yourself</h3>
                      <p className="text-sm text-gray-500">Help us match you with the right jobs (all optional)</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="currentTitle" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Job Title</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input placeholder="e.g. Software Engineer" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="currentLocation" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current City</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input placeholder="e.g. Noida, Delhi, Bangalore" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="fieldOfInterest" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field of Interest</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select your primary field" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {FIELDS_OF_INTEREST.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="experienceLevel" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Years of experience?" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EXPERIENCE_LEVELS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="education" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Highest Education</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Qualification" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EDUCATION_LEVELS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="preferredWorkMode" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Work Mode</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Office / WFH / Hybrid" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {WORK_MODES.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="skills" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Skills</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input placeholder="e.g. React, Node.js, Excel, Sales (comma separated)" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn Profile</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input placeholder="https://linkedin.com/in/yourname" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">Almost there!</p>
                      <p className="text-xs opacity-80">This information helps us suggest relevant jobs and personalize your dashboard.</p>
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setStep(1)}>Back</Button>
                      <Button type="submit" className="flex-1 h-11 gap-2 font-semibold" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Creating..." : <><CheckCircle2 className="w-4 h-4" /> Create Account</>}
                      </Button>
                    </div>

                    <button type="button" onClick={form.handleSubmit(onSubmit)} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 hover:underline">
                      Skip and create account
                    </button>
                  </div>
                )}

                {/* ── STEP 2 — EMPLOYER ── */}
                {step === 2 && role === "employer" && (
                  <div className="space-y-4">
                    <div className="text-center mb-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">About your company</h3>
                      <p className="text-sm text-gray-500">Help candidates know you better (all optional)</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="industry" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select your industry" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="companySize" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Size</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Number of employees" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COMPANY_SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="currentLocation" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Office Location</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input placeholder="e.g. Noida Sector 62, Gurugram" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="hiringFor" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hiring For (Field)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Primary hiring domain" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {FIELDS_OF_INTEREST.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="website" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Website</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input placeholder="https://yourcompany.com" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">Ready to hire!</p>
                      <p className="text-xs opacity-80">A complete company profile attracts better candidates and builds trust.</p>
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setStep(1)}>Back</Button>
                      <Button type="submit" className="flex-1 h-11 gap-2 font-semibold" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Creating..." : <><CheckCircle2 className="w-4 h-4" /> Create Account</>}
                      </Button>
                    </div>

                    <button type="button" onClick={form.handleSubmit(onSubmit)} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 hover:underline">
                      Skip and create account
                    </button>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
