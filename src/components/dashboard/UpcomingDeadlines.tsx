import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { JobStatus } from "@/types";

const statusColors: Record<JobStatus, string> = {
  pending: "bg-blue-500",
  in_progress: "bg-yellow-500",
  review: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const priorityLabels: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  low: { label: "Low", variant: "secondary" },
  medium: { label: "Medium", variant: "default" },
  high: { label: "High", variant: "destructive" },
  urgent: { label: "Urgent", variant: "destructive" },
};

export default function UpcomingDeadlines() {
  const navigate = useNavigate();
  const { dashboardMetrics, staff, jobs } = useAppContext();

  // Calculate upcoming deadlines directly from jobs
  const today = new Date();
  const cutoffDate = new Date(today);
  cutoffDate.setDate(today.getDate() + 7);

  const upcomingDeadlines = jobs
    .filter((job) => {
      const deadline = new Date(job.deadline);
      return (
        job.status !== "completed" &&
        job.status !== "cancelled" &&
        deadline <= cutoffDate
      );
    })
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    );

  const getStaffName = (staffId?: string) => {
    if (!staffId) return "Unassigned";
    const staffMember = staff.find((s) => s.id === staffId);
    return staffMember ? staffMember.name : "Unknown";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Upcoming Deadlines</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate("/jobs")}>
            View All Jobs
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingDeadlines.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No upcoming deadlines in the next 7 days
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingDeadlines.map((job) => {
              const daysUntilDeadline = Math.ceil(
                (new Date(job.deadline).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              );

              return (
                <div
                  key={job.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <div className="font-medium">Invoice: {job.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {job.client}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div
                        className={`w-2 h-2 rounded-full ${statusColors[job.status]}`}
                      />
                      <span className="text-xs capitalize">
                        {job.status.replace("_", " ")}
                      </span>
                      <Badge variant={priorityLabels[job.priority].variant}>
                        {priorityLabels[job.priority].label}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Due: {format(new Date(job.deadline), "MMM d, yyyy")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {daysUntilDeadline === 0
                        ? "Today"
                        : daysUntilDeadline === 1
                          ? "Tomorrow"
                          : `${daysUntilDeadline} days`}
                    </div>
                    <div className="text-xs mt-1">
                      {getStaffName(job.assignedTo)}
                    </div>

                    <Link to={`/jobs/${job.id}`}>
                      <Button variant="ghost" size="sm" className="mt-2">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
