import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format, addDays } from "date-fns";
import { AlertTriangle, CheckCircle, Clock, BarChart, ChevronDown, ChevronUp, X, } from "lucide-react";
import { JobStatus } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DashboardOverview() {
  const { dashboardMetrics, jobs, staff, schedule } = useAppContext();

  // Track which dialog is open
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

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

  const statusBadgeColors: Record<JobStatus, string> = {
    pending: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    review: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<JobStatus, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    review: "In Review",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Capacity Utilization */}
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveDialog("capacity")}>
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
          <CardFooter className="pt-0 pb-2">
            <div className="text-xs text-blue-600 flex items-center">
              <span>View details</span>
              <ChevronDown className="ml-1 h-3 w-3" />
            </div>
          </CardFooter>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveDialog("deadlines")}>
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
          <CardFooter className="pt-0 pb-2">
            <div className="text-xs text-blue-600 flex items-center">
              <span>View all deadlines</span>
              <ChevronDown className="ml-1 h-3 w-3" />
            </div>
          </CardFooter>
        </Card>

        {/* Active Jobs */}
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveDialog("active")}>
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
          <CardFooter className="pt-0 pb-2">
            <div className="text-xs text-blue-600 flex items-center">
              <span>View active jobs</span>
              <ChevronDown className="ml-1 h-3 w-3" />
            </div>
          </CardFooter>
        </Card>

        {/* Completed Jobs */}
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveDialog("completed")}>
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
          <CardFooter className="pt-0 pb-2">
            <div className="text-xs text-blue-600 flex items-center">
              <span>View completed jobs</span>
              <ChevronDown className="ml-1 h-3 w-3" />
            </div>
          </CardFooter>
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

      {/* Capacity Utilization Dialog */}
      <Dialog open={activeDialog === "capacity"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Capacity Utilization Details</DialogTitle>
            <DialogDescription>
              Detailed breakdown of production capacity across staff members
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h3 className="font-medium mb-2">Overall Utilization</h3>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>Production Capacity</span>
                <span>{Math.round(dashboardMetrics.capacityUtilization * 100)}%</span>
              </div>
              <Progress value={dashboardMetrics.capacityUtilization * 100} className="h-2" />
            </div>

            <h3 className="font-medium mt-6 mb-2">Production Team Capacity</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Assigned Jobs</TableHead>
                  <TableHead>Scheduled Hours</TableHead>
                  <TableHead>Available Hours</TableHead>
                  <TableHead>Utilization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff
                  .filter(member => member.role === 'production')
                  .map(member => {
                    // Calculate scheduled hours
                    const memberSchedule = schedule.filter(event => event.staffId === member.id);
                    const scheduledHours = memberSchedule.reduce((total, event) => {
                      const start = new Date(event.startTime);
                      const end = new Date(event.endTime);
                      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    }, 0);
                    
                    // Calculate available hours based on availability
                    let availableHours = 0;
                    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
                      if (member.availability[day as keyof typeof member.availability]) {
                        const hours = member.availabilityHours?.[day as keyof typeof member.availabilityHours];
                        if (hours) {
                          const [startHour, startMin] = hours.start.split(':').map(Number);
                          const [endHour, endMin] = hours.end.split(':').map(Number);
                          availableHours += (endHour + endMin/60) - (startHour + startMin/60);
                        } else {
                          // Default business hours
                          availableHours += 8; // 8 hour workday
                        }
                      }
                    });
                    
                    const utilization = availableHours > 0 ? (scheduledHours / availableHours) * 100 : 0;
                    
                    return (
                      <TableRow key={member.id}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.assignedJobs.length}</TableCell>
                        <TableCell>{scheduledHours.toFixed(1)} hrs</TableCell>
                        <TableCell>{availableHours.toFixed(1)} hrs</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={utilization} className="h-2 w-24" />
                            <span>{Math.round(utilization)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upcoming Deadlines Dialog */}
      <Dialog open={activeDialog === "deadlines"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Upcoming Deadlines</DialogTitle>
            <DialogDescription>
              Jobs with deadlines in the next 7 days
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {dashboardMetrics.upcomingDeadlines.map(job => {
                const daysRemaining = Math.ceil(
                  (new Date(job.deadline).getTime() - new Date().getTime()) / 
                  (1000 * 60 * 60 * 24)
                );
                const isLate = daysRemaining < 0;
                const isCritical = daysRemaining <= 1;
                const isWarning = daysRemaining <= 3;
                
                return (
                  <Card key={job.id} className={`border ${isLate ? 'border-red-500' : isCritical ? 'border-orange-500' : isWarning ? 'border-yellow-500' : 'border-gray-200'}`}>
                    <CardHeader className="py-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{job.title}</CardTitle>
                          <CardDescription>{job.client}</CardDescription>
                        </div>
                        <Badge className={statusBadgeColors[job.status]}>
                          {statusLabels[job.status]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Deadline</p>
                          <p className="font-medium">{format(new Date(job.deadline), "MMMM d, yyyy")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Time Remaining</p>
                          <p className={`font-medium ${isLate ? 'text-red-600' : isCritical ? 'text-orange-600' : ''}`}>
                            {isLate ? `${Math.abs(daysRemaining)} days overdue` : 
                              daysRemaining === 0 ? "Due today" : 
                              `${daysRemaining} days remaining`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {dashboardMetrics.upcomingDeadlines.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No upcoming deadlines in the next 7 days</p>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active Jobs Dialog */}
      <Dialog open={activeDialog === "active"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Active Jobs</DialogTitle>
            <DialogDescription>
              Jobs currently in progress or under review
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs
                  .filter(job => job.status === 'in_progress' || job.status === 'review')
                  .map(job => {
                    const assignedStaff = job.assignedTo ? 
                      staff.find(s => s.id === job.assignedTo)?.name || 'Unknown' : 
                      'Unassigned';
                    
                    return (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.client}</TableCell>
                        <TableCell>
                          <Badge className={statusBadgeColors[job.status]}>
                            {statusLabels[job.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>{assignedStaff}</TableCell>
                        <TableCell>{format(new Date(job.deadline), "MMM d, yyyy")}</TableCell>
                      </TableRow>
                    );
                  })}
                
                {jobs.filter(job => job.status === 'in_progress' || job.status === 'review').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No active jobs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Completed Jobs Dialog */}
      <Dialog open={activeDialog === "completed"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Completed Jobs</DialogTitle>
            <DialogDescription>
              Recently completed jobs
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Completed By</TableHead>
                  <TableHead>Job Type</TableHead>
                  <TableHead>Completion Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs
                  .filter(job => job.status === 'completed')
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 15) // Show only the 15 most recent
                  .map(job => {
                    const assignedStaff = job.assignedTo ? 
                      staff.find(s => s.id === job.assignedTo)?.name || 'Unknown' : 
                      'Unassigned';
                    
                    return (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.client}</TableCell>
                        <TableCell>{assignedStaff}</TableCell>
                        <TableCell>{job.jobType.replace('_', ' ')}</TableCell>
                        <TableCell>{format(new Date(job.updatedAt), "MMM d, yyyy")}</TableCell>
                      </TableRow>
                    );
                  })}
                
                {jobs.filter(job => job.status === 'completed').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No completed jobs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
