import { useAppContext } from "@/context/AppContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle, Clock, BarChart } from "lucide-react";
import { JobStatus } from "@/types";

export default function DashboardOverview() {
  const { dashboardMetrics, jobs, staff } = useAppContext();

  // Calculate job status percentages
  const totalJobs = jobs.length;
  const statusCounts = dashboardMetrics.jobStatusDistribution;

  const statusColors: Record<JobStatus, string> = {
    pending: "bg-blue-500",
    in_progress: "bg-yellow-500",
    review: "bg-purple-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  };

  const statusLabels: Record<JobStatus, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    review: "In Review",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Capacity Utilization */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Capacity Utilization
          </CardTitle>
          <CardDescription>Current workload vs. capacity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {Math.round(dashboardMetrics.capacityUtilization * 100)}%
            </div>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </div>
          <Progress
            value={dashboardMetrics.capacityUtilization * 100}
            className="h-2 mt-2"
          />
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Upcoming Deadlines
          </CardTitle>
          <CardDescription>Jobs due in the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {dashboardMetrics.upcomingDeadlines.length}
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 space-y-1">
            {dashboardMetrics.upcomingDeadlines.slice(0, 2).map((job) => (
              <div key={job.id} className="flex justify-between text-sm">
                <span className="truncate max-w-[180px]">{job.title}</span>
                <span className="text-muted-foreground">
                  {format(new Date(job.deadline), "MMM d")}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Jobs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          <CardDescription>Jobs in progress or review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {(statusCounts.in_progress || 0) + (statusCounts.review || 0)}
            </div>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                <span>In Progress:</span>
              </div>
              <div className="font-medium">{statusCounts.in_progress || 0}</div>
            </div>
            <div className="text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                <span>In Review:</span>
              </div>
              <div className="font-medium">{statusCounts.review || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed Jobs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
          <CardDescription>Successfully finished jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {statusCounts.completed || 0}
            </div>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <div className="text-sm">
              <span>Completion Rate:</span>
              <div className="font-medium">
                {totalJobs > 0
                  ? Math.round(
                      ((statusCounts.completed || 0) / totalJobs) * 100,
                    )
                  : 0}
                %
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Status Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Job Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(statusLabels).map(([status, label]) => {
              const count = statusCounts[status as JobStatus] || 0;
              const percentage = totalJobs > 0 ? (count / totalJobs) * 100 : 0;

              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span>
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${statusColors[status as JobStatus]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Staff Workload */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Staff Workload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staff.map((member) => {
              const assignedCount = member.assignedJobs.length;
              const maxJobs = 5; // Arbitrary max for visualization
              const percentage = Math.min((assignedCount / maxJobs) * 100, 100);

              return (
                <div key={member.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{member.name}</span>
                    <span>
                      {assignedCount} job{assignedCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${assignedCount > 3 ? "bg-red-500" : assignedCount > 1 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
