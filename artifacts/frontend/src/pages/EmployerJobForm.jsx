import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const jobSchema = z.object({
  title: z.string().min(2, "Title is required"),
  location: z.string().min(2, "Location is required"),
  category: z.string().min(2, "Category is required"),
  employmentType: z.string().min(2, "Employment type is required"),
  description: z.string().min(10, "Description is required"),
  requirements: z.string().optional(),
  salaryRange: z.string().optional(),
  skills: z.string().optional(), // Comma separated
});

export default function EmployerJobForm() {
  const { jobId } = useParams();
  const isEditing = !!jobId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchApi(`/jobs/${jobId}`),
    enabled: isEditing,
  });

  const form = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      location: "",
      category: "",
      employmentType: "full-time",
      description: "",
      requirements: "",
      salaryRange: "",
      skills: "",
    },
  });

  useEffect(() => {
    if (job) {
      form.reset({
        title: job.title || "",
        location: job.location || "",
        category: job.category || "",
        employmentType: job.employmentType || "full-time",
        description: job.description || "",
        requirements: job.requirements || "",
        salaryRange: job.salaryRange || "",
        skills: job.skills ? job.skills.join(", ") : "",
      });
    }
  }, [job, form]);

  const mutation = useMutation({
    mutationFn: (data) => fetchApi(isEditing ? `/jobs/${jobId}` : "/jobs", {
      method: isEditing ? "PUT" : "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employerJobs"] });
      toast({ title: `Job ${isEditing ? 'updated' : 'created'} successfully` });
      setLocation("/employer/jobs");
    },
    onError: (err) => {
      toast({ title: `Failed to ${isEditing ? 'update' : 'create'} job`, description: err.message, variant: "destructive" });
    }
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      skills: data.skills ? data.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
    };
    mutation.mutate(payload);
  };

  const categories = ["IT/Software", "Marketing", "Sales", "HR", "Finance", "Operations", "Design", "Other"];
  const employmentTypes = [
    { value: "full-time", label: "Full Time" },
    { value: "part-time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
    { value: "remote", label: "Remote" },
  ];

  if (isEditing && isLoading) return <div className="p-8 text-center">Loading job...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/employer/jobs" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to jobs
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{isEditing ? "Edit Job Posting" : "Create New Job"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title *</FormLabel>
                      <FormControl><Input placeholder="e.g. Senior Frontend Developer" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl><Input placeholder="e.g. Noida, UP" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employmentTypes.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Range (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g. ₹10L - ₹15L LPA" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Skills (Optional)</FormLabel>
                      <FormControl><Input placeholder="React, Node.js (comma separated)" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description *</FormLabel>
                    <FormControl><Textarea rows={6} placeholder="Detailed role description..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements / Qualifications (Optional)</FormLabel>
                    <FormControl><Textarea rows={4} placeholder="Education, experience, etc..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setLocation("/employer/jobs")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : isEditing ? "Update Job" : "Publish Job"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
