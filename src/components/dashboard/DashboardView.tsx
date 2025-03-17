import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
        archived: 0
      },
      staffWorkload: {},
    },
  );
  
  // Dialog state
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

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
      archived: 0
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
  
  // Status display helpers
  const statusLabels: Record<JobStatus, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    review: "In Review",
    completed: "Completed",
    cancelled: "Cancelled",
    archived: "Archived"
  };
  
  const statusBadgeColors: Record<JobStatus, string> = {
    pending: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    review: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    archived: "bg-gray-100 text-gray-800"
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your print shop operations and performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveDialog("totalJobs")}>
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

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveDialog("activeJobs")}>
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

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveDialog("capacity")}>
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
      
      {/* Total Jobs Dialog */}
      <Dialog open={activeDialog === "totalJobs"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Total Jobs Breakdown</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.client}</TableCell>
                    <TableCell>
                      <Badge className={statusBadgeColors[job.status]}>
                        {statusLabels[job.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(job.deadline).toLocaleDateString()}</TableCell>
                    <TableCell>{job.estimatedHours}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setActiveDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Active Jobs Dialog */}
      <Dialog open={activeDialog === "activeJobs"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Active Jobs</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs
                  .filter((job) => job.status === "in_progress" || job.status === "review")
                  .map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.client}</TableCell>
                      <TableCell>
                        <Badge className={statusBadgeColors[job.status]}>
                          {statusLabels[job.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(job.deadline).toLocaleDateString()}</TableCell>
                      <TableCell>{job.estimatedHours}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setActiveDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Capacity Dialog */}
      <Dialog open={activeDialog === "capacity"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Capacity Utilization Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Overall Capacity</h3>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${
                      metrics.capacityUtilization > 90
                        ? "bg-red-500"
                        : metrics.capacityUtilization > 75
                        ? "bg-amber-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${metrics.capacityUtilization}%` }}
                  ></div>
                </div>
                <span className="font-bold">{metrics.capacityUtilization}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {metrics.capacityUtilization > 90
                  ? "Your shop is over capacity. Consider rescheduling or adding resources."
                  : metrics.capacityUtilization > 75
                  ? "Your shop is nearing capacity. Monitor workload closely."
                  : "Your shop has available capacity for more jobs."}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Staff Workload</h3>
              <ScrollArea className="max-h-[40vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Assigned Jobs</TableHead>
                      <TableHead>Workload</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(metrics.staffWorkload).map(([staffId, workload]) => (
                      <TableRow key={staffId}>
                        <TableCell className="font-medium">{staffId}</TableCell>
                        <TableCell>{workload}</TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                workload > 90
                                  ? "bg-red-500"
                                  : workload > 75
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${workload}%` }}
                            ></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setActiveDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardView;
