import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export function JobCard({ job }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="hover-elevate cursor-pointer transition-all duration-200 border-border/50 overflow-hidden h-full flex flex-col group">
        <CardContent className="p-6 flex flex-col h-full gap-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">{job.employer?.company || "Company"}</p>
            </div>
            {job.createdAt && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-auto">
            <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground font-normal">
              {job.location}
            </Badge>
            <Badge variant="outline" className="font-normal text-muted-foreground">
              {job.employmentType?.replace("-", " ")}
            </Badge>
            {job.salaryRange && (
              <Badge variant="outline" className="font-normal text-green-600 dark:text-green-400 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
                {job.salaryRange}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
