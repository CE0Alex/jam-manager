import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusDistribution from "./StatusDistribution";
import CapacityUtilization from "./CapacityUtilization";
import UpcomingDeadlines from "./UpcomingDeadlines";
import DashboardCalendar from "./Calendar";
import { DashboardMetrics, JobStatus } from "@/types";
import { useAppContext } from "@/context/AppContext";

interface DashboardViewProps {
  metrics?: DashboardMetrics;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  metrics: propMetrics,
}) => {
  const { jobs, dashboardMetrics, refreshDashboard } = useAppContext();
  const [metrics, setMetrics] = useState<DashboardMetrics>(
    dashboardMetrics || {
      upcomingDeadlines: [],
      capacityUtilization: 0,
      jobStatusDistribution: {
        pending: 0,
        in_progress: 0,
        review: 0,
        completed: 0,
        cancelled: 0,
      },
      staffWorkload: {},
    },
  );

  // Force a refresh of dashboard metrics when component mounts
  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  // Calculate job status distribution directly from jobs array
  useEffect(() => {
    // Initialize status counts
    const statusCounts: Record<JobStatus, number> = {
      pending: 0,
      in_progress: 0,
      review: 0,
      completed: 0,
      cancelled: 0,
    };

    // Count jobs by status
    jobs.forEach((job) => {
      statusCounts[job.status]++;
    });

    // Update metrics with real-time job status distribution
    setMetrics((prev) => ({
      ...prev,
      jobStatusDistribution: statusCounts,
    }));
  }, [jobs]);

  // Calculate active jobs count directly from jobs array
  const activeJobsCount = jobs.filter(
    (job) => job.status === "in_progress" || job.status === "review",
  ).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your print shop operations and performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{jobs.length}</div>
            <p className="text-muted-foreground text-sm mt-1">
              Across all statuses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeJobsCount}</div>
            <p className="text-muted-foreground text-sm mt-1">
              In progress or review
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Current Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {metrics.capacityUtilization}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className={`h-2.5 rounded-full ${metrics.capacityUtilization > 90 ? "bg-red-500" : metrics.capacityUtilization > 75 ? "bg-amber-500" : "bg-green-500"}`}
                style={{ width: `${metrics.capacityUtilization}%` }}
              ></div>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {metrics.capacityUtilization > 90
                ? "Over capacity"
                : metrics.capacityUtilization > 75
                  ? "High utilization"
                  : "Normal utilization"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 h-[600px]">
        <DashboardCalendar />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <StatusDistribution data={metrics.jobStatusDistribution} />
        <CapacityUtilization currentUtilization={metrics.capacityUtilization} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <UpcomingDeadlines />
      </div>
    </div>
  );
};

export default DashboardView;
