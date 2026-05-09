import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import { FileUp, FileText } from "lucide-react";

const profileSchema = z.object({
  phone: z.string().optional(),
  location: z.string().optional(),
  currentTitle: z.string().optional(),
  bio: z.string().optional(),
  skills: z.string().optional(), // Comma separated for simplicity
  education: z.string().optional(),
  experience: z.string().optional(),
});

export default function CandidateProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["candidateProfile"],
    queryFn: () => fetchApi("/candidates/profile"),
  });

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: "",
      location: "",
      currentTitle: "",
      bio: "",
      skills: "",
      education: "",
      experience: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        phone: profile.phone || "",
        location: profile.location || "",
        currentTitle: profile.currentTitle || "",
        bio: profile.bio || "",
        skills: profile.skills ? profile.skills.join(", ") : "",
        education: profile.education || "",
        experience: profile.experience || "",
      });
    }
  }, [profile, form]);

  const updateMutation = useMutation({
    mutationFn: (data) => fetchApi("/candidates/profile", { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Profile updated successfully" });
    },
    onError: (err) => {
      toast({ title: "Failed to update profile", description: err.message, variant: "destructive" });
    }
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      skills: data.skills ? data.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
    };
    updateMutation.mutate(payload);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max file size is 5MB", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setUploading(true);
    try {
      await fetchApi("/candidates/resume", {
        method: "POST",
        body: formData, // fetch wrapper handles FormData content-type automatically
      });
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast({ title: "Resume uploaded successfully" });
    } catch (err) {
      toast({ title: "Failed to upload resume", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium">Current Resume</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile?.resumeUrl ? "Resume uploaded" : "No resume uploaded yet"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {profile?.resumeUrl && (
                  <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm">View</Button>
                  </a>
                )}
                <div>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload New"}
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Accepted formats: PDF, DOCX. Max size: 5MB.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currentTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Title</FormLabel>
                        <FormControl><Input placeholder="e.g. Frontend Developer" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl><Input placeholder="e.g. Noida, India" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input placeholder="+91..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills (comma separated)</FormLabel>
                        <FormControl><Input placeholder="React, Node.js, Design" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Summary</FormLabel>
                      <FormControl><Textarea rows={4} placeholder="Tell employers about yourself..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience</FormLabel>
                      <FormControl><Textarea rows={4} placeholder="Your work history..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education</FormLabel>
                      <FormControl><Textarea rows={3} placeholder="Your educational background..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
