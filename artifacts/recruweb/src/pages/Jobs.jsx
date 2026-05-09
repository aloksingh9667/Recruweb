import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { Search } from "lucide-react";

export default function Jobs() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [employmentType, setEmploymentType] = useState(searchParams.get("employmentType") || "all");
  const [jobLocation, setJobLocation] = useState(searchParams.get("location") || "");
  
  // Use state for actual queries to avoid refetching on every keystroke
  const [queryParams, setQueryParams] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "all",
    employmentType: searchParams.get("employmentType") || "all",
    location: searchParams.get("location") || "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", queryParams],
    queryFn: () => {
      const params = new URLSearchParams();
      if (queryParams.search) params.append("search", queryParams.search);
      if (queryParams.category !== "all") params.append("category", queryParams.category);
      if (queryParams.employmentType !== "all") params.append("employmentType", queryParams.employmentType);
      if (queryParams.location) params.append("location", queryParams.location);
      return fetchApi(`/jobs?${params.toString()}`);
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setQueryParams({
      search,
      category,
      employmentType,
      location: jobLocation
    });
    
    // Update URL
    const urlParams = new URLSearchParams();
    if (search) urlParams.append("search", search);
    if (category !== "all") urlParams.append("category", category);
    if (employmentType !== "all") urlParams.append("employmentType", employmentType);
    if (jobLocation) urlParams.append("location", jobLocation);
    const newUrl = `/jobs${urlParams.toString() ? `?${urlParams.toString()}` : ""}`;
    window.history.replaceState(null, "", newUrl);
  };

  const categories = ["IT/Software", "Marketing", "Sales", "HR", "Finance", "Operations", "Design", "Other"];
  const employmentTypes = ["full-time", "part-time", "contract", "internship", "remote"];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Find Jobs</h1>
        <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4 lg:grid-cols-5 items-end bg-card p-4 rounded-xl border shadow-sm">
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium">Keywords</label>
            <Input 
              placeholder="Job title, company..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input 
              placeholder="City or Remote" 
              value={jobLocation} 
              onChange={e => setJobLocation(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 lg:col-span-1 md:col-span-4 flex justify-end">
            <Button type="submit" className="w-full">
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {isLoading ? "Searching..." : `${data?.total || 0} Jobs Found`}
          </h2>
          <div className="flex gap-2 items-center">
            <label className="text-sm text-muted-foreground whitespace-nowrap">Job Type:</label>
            <Select value={employmentType} onValueChange={setEmploymentType}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                {employmentTypes.map(c => <SelectItem key={c} value={c}>{c.replace("-", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="border rounded-xl h-48 animate-pulse bg-muted/30"></div>)}
          </div>
        ) : data?.jobs?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border rounded-xl bg-card">
            <h3 className="text-lg font-medium">No jobs found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setSearch(""); setCategory("all"); setEmploymentType("all"); setJobLocation("");
              setQueryParams({ search: "", category: "all", employmentType: "all", location: "" });
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
