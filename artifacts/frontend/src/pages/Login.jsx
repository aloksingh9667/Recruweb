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
import { Briefcase, Building2, User, Eye, EyeOff, Phone, Mail, Lock, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["candidate", "employer"]),
});

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("candidate");
  const [loginMode, setLoginMode] = useState("email");

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "", role: "candidate" },
  });

  const onRoleSelect = (role) => {
    setSelectedRole(role);
    form.setValue("role", role);
  };

  const onSubmit = async (data) => {
    try {
      const isPhone = loginMode === "phone";
      const payload = {
        password: data.password,
        role: data.role,
        ...(isPhone ? { phone: data.identifier } : { email: data.identifier }),
      };
      const res = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res?.token && res?.user) {
        login(res.token, res.user);
        toast({ title: "Welcome back! 👋", description: "Successfully logged in." });
        setLocation(res.user.role === "employer" ? "/employer/dashboard" : "/candidate/dashboard");
      }
    } catch (err) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)", backgroundSize: "50px 50px"}} />
        <div className="relative z-10 text-center max-w-sm">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Find Your Dream Job</h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">Connect with top employers and unlock opportunities that match your skills and aspirations.</p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { num: "5L+", label: "Jobs Posted" },
              { num: "50K+", label: "Companies" },
              { num: "1Cr+", label: "Job Seekers" },
              { num: "95%", label: "Success Rate" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">{s.num}</div>
                <div className="text-blue-200 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary shadow-lg mb-4">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Welcome back!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Sign in to continue your journey</p>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
            {/* Role Selection */}
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Login as:</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { value: "candidate", label: "Job Seeker", sub: "Find your dream job", Icon: User },
                { value: "employer", label: "Employer", sub: "Post & manage jobs", Icon: Building2 },
              ].map(({ value, label, sub, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onRoleSelect(value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedRole === value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-gray-200 dark:border-gray-600 hover:border-primary/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${selectedRole === value ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-semibold ${selectedRole === value ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}>{label}</span>
                  <span className="text-[11px] text-gray-400 text-center leading-tight">{sub}</span>
                </button>
              ))}
            </div>

            {/* Email/Phone Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-5">
              {[
                { mode: "email", Icon: Mail, label: "Email" },
                { mode: "phone", Icon: Phone, label: "Phone" },
              ].map(({ mode, Icon, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => { setLoginMode(mode); form.setValue("identifier", ""); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all ${loginMode === mode ? "bg-white dark:bg-gray-600 shadow text-primary" : "text-gray-500"}`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{loginMode === "phone" ? "Phone Number" : "Email Address"}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          {loginMode === "phone"
                            ? <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            : <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          }
                          <Input
                            type={loginMode === "phone" ? "tel" : "email"}
                            placeholder={loginMode === "phone" ? "+91 98765 43210" : "you@example.com"}
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <button type="button" className="text-xs text-primary hover:underline font-medium">Forgot password?</button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input type={showPassword ? "text" : "password"} className="pl-10 pr-10" placeholder="••••••••" {...field} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11 text-sm font-semibold mt-2 gap-2" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Signing in..." : <>Sign in as {selectedRole === "employer" ? "Employer" : "Job Seeker"} <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </form>
            </Form>

            <div className="mt-5 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">Create account</Link>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            By signing in, you agree to our{" "}
            <span className="text-primary cursor-pointer hover:underline">Terms</span> &{" "}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
