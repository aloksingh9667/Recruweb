import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Search, MapPin, Building2, ChevronRight } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: stats } = useQuery({
    queryKey: ["jobStats"],
    queryFn: () => fetchApi("/jobs/stats/summary"),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/jobs?search=${encodeURIComponent(searchQuery)}`);
    } else {
      setLocation("/jobs");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden text-primary-foreground py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40"></div>
        
        <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl mb-6">
            Find the right job. <br/> Make the right hire.
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mb-10">
            Recruweb connects top talent with Noida's best companies. Browse thousands of jobs across IT, Marketing, Sales, and more.
          </p>
          
          <form onSubmit={handleSearch} className="w-full max-w-3xl bg-background rounded-xl p-2 shadow-2xl flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Job title, keywords, or company" 
                className="pl-12 border-0 bg-transparent text-foreground h-12 focus-visible:ring-0 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8 text-base">Search Jobs</Button>
          </form>

          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="bg-primary-foreground/20 p-2 rounded-full">
                <Building2 className="h-5 w-5" />
              </div>
              <span>Trusted by 500+ Companies</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-primary-foreground/20 p-2 rounded-full">
                <MapPin className="h-5 w-5" />
              </div>
              <span>Focused on Noida & Delhi NCR</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Explore Categories</h2>
              <p className="text-muted-foreground">Find opportunities tailored to your expertise</p>
            </div>
            <Link href="/jobs" className="text-primary font-medium flex items-center gap-1 hover:underline hidden md:flex">
              All categories <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {stats?.byCategory ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.byCategory.map((cat, i) => (
                <Link key={cat.category || i} href={`/jobs?category=${encodeURIComponent(cat.category)}`} className="group">
                  <div className="bg-background border rounded-xl p-6 hover-elevate transition-all border-border/50 group-hover:border-primary/50 text-center flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
                    </div>
                    <h3 className="font-semibold text-lg">{cat.category}</h3>
                    <p className="text-muted-foreground mt-1">{cat.count} open positions</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-background border rounded-xl p-6 h-40 animate-pulse bg-muted/50"></div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Latest Opportunities</h2>
              <p className="text-muted-foreground">Recently posted jobs from top employers</p>
            </div>
            <Link href="/jobs" className="text-primary font-medium flex items-center gap-1 hover:underline">
              View all jobs <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {stats?.recentJobs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.recentJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="border rounded-xl h-48 animate-pulse bg-muted/30"></div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
