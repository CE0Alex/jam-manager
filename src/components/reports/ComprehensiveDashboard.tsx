import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subDays, startOfMonth, endOfMonth, addDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Download,
  Calendar,
  Filter,
  Printer,
  Users,
  Clock,
  Layers,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  BarChart2,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { JobStatus, JobType } from "@/types";

interface ComprehensiveDashboardProps {
  startDate: Date;
  endDate: Date;
}

export default function ComprehensiveDashboard({
  startDate,
  endDate,
}: ComprehensiveDashboardProps) {
  const { jobs, staff, schedule, machines, dashboardMetrics } = useAppContext();
  const [timeRange, setTimeRange] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");

  // Filter jobs by date range
  const filteredJobs = jobs.filter((job) => {
    const jobDate = new Date(job.createdAt);
    return jobDate >= startDate && jobDate <= endDate;
  });

  // Calculate job status distribution
  const statusCounts = filteredJobs.reduce(
    (acc, job) => {
      if (!acc[job.status]) {
        acc[job.status] = 0;
      }
      acc[job.status]++;
      return acc;
    },
    {} as Record<JobStatus, number>,
  );

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name:
      status.replace("_", " ").charAt(0).toUpperCase() +
      status.replace("_", " ").slice(1),
    value: count,
  }));

  // Calculate job type distribution
  const jobTypeCounts = filteredJobs.reduce(
    (acc, job) => {
      if (!acc[job.jobType]) {
        acc[job.jobType] = 0;
      }
      acc[job.jobType]++;
      return acc;
    },
    {} as Record<JobType, number>,
  );

  const jobTypeData = Object.entries(jobTypeCounts).map(([type, count]) => ({
    name:
      type.replace("_", " ").charAt(0).toUpperCase() +
      type.replace("_", " ").slice(1),
    value: count,
    type,
  }));

  // Calculate hours by job type
  const jobTypeHours: Record<string, number> = {};

  filteredJobs.forEach((job) => {
    if (!jobTypeHours[job.jobType]) {
      jobTypeHours[job.jobType] = 0;
    }
    jobTypeHours[job.jobType] += job.estimatedHours;
  });

  // Calculate staff utilization
  const staffUtilization = staff.map((member) => {
    // Get assigned jobs
    const assignedJobs = jobs.filter((job) => job.assignedTo === member.id);

    // Get scheduled events for this staff member
    const staffEvents = schedule.filter((event) => event.staffId === member.id);

    // Calculate total hours scheduled
    const totalHoursScheduled = staffEvents.reduce((total, event) => {
      const startTime = new Date(event.startTime);
      const endTime = new Date(event.endTime);
      const durationHours =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      return total + durationHours;
    }, 0);

    // Calculate capacity (simplified)
    const dailyCapacity = 8; // 8 hours per day
    const workDaysPerWeek = Object.values(member.availability).filter(
      Boolean,
    ).length;
    const totalCapacity = workDaysPerWeek * dailyCapacity;

    // Calculate utilization percentage
    const utilization =
      totalCapacity > 0 ? (totalHoursScheduled / totalCapacity) * 100 : 0;

    return {
      name: member.name,
      utilization: Math.min(utilization, 100), // Cap at 100%
      jobsAssigned: assignedJobs.length,
    };
  });

  // Calculate machine utilization
  const machineUtilization =
    machines?.map((machine) => {
      // Get events for this machine
      const machineEvents = schedule.filter(
        (event) => event.machineId === machine.id,
      );

      // Calculate total hours scheduled
      const totalHoursScheduled = machineEvents.reduce((total, event) => {
        const startTime = new Date(event.startTime);
        const endTime = new Date(event.endTime);
        const durationHours =
          (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        return total + durationHours;
      }, 0);

      // Calculate capacity
      const totalCapacity = machine.hoursPerDay * 5; // 5 working days

      // Calculate utilization percentage
      const utilization =
        totalCapacity > 0 ? (totalHoursScheduled / totalCapacity) * 100 : 0;

      return {
        name: machine.name,
        utilization: Math.min(utilization, 100), // Cap at 100%
      };
    }) || [];

  // Calculate on-time delivery rate
  const completedJobs = filteredJobs.filter(
    (job) => job.status === "completed",
  );
  const onTimeJobs = completedJobs.filter((job) => {
    // A job is on-time if it was completed before or on its deadline
    const completionDate = new Date(job.updatedAt);
    const deadlineDate = new Date(job.deadline);
    return completionDate <= deadlineDate;
  });

  const onTimeRate =
    completedJobs.length > 0
      ? Math.round((onTimeJobs.length / completedJobs.length) * 100)
      : 0;

  // Calculate total production hours
  const totalProductionHours = schedule.reduce((total, event) => {
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    const durationHours =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    return total + durationHours;
  }, 0);

  // Calculate average production time per job
  const averageProductionTime =
    jobs.length > 0 ? totalProductionHours / jobs.length : 0;

  // Calculate overall capacity utilization
  const totalCapacity = staff.length * 40; // 40 hours per week per staff
  const totalScheduled = schedule.reduce((total, event) => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);
  const capacityUtilization = Math.min(
    100,
    Math.round((totalScheduled / totalCapacity) * 100),
  );

  // Generate monthly trend data (placeholder data)
  const monthlyTrendData = [
    { name: "Jan", jobs: 12, hours: 120, utilization: 65 },
    { name: "Feb", jobs: 15, hours: 145, utilization: 70 },
    { name: "Mar", jobs: 18, hours: 160, utilization: 75 },
    { name: "Apr", jobs: 16, hours: 150, utilization: 72 },
    { name: "May", jobs: 21, hours: 180, utilization: 85 },
    { name: "Jun", jobs: 24, hours: 200, utilization: 90 },
  ];

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // Colors for job types
  const JOB_TYPE_COLORS = {
    embroidery: "#8884d8", // purple
    screen_printing: "#3B82F6", // blue
    digital_printing: "#10B981", // green
    wide_format: "#F97316", // orange
    central_facility: "#EF4444", // red
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{filteredJobs.length}</div>
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">+12%</span>
              <span className="text-muted-foreground ml-1">
                vs. previous period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Capacity Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{capacityUtilization}%</div>
              <div className="p-2 bg-purple-100 rounded-full">
                <BarChart2 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <Progress
              value={capacityUtilization}
              className={`mt-2 ${capacityUtilization > 90 ? "bg-red-500" : capacityUtilization > 75 ? "bg-amber-500" : "bg-green-500"}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              On-Time Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{onTimeRate}%</div>
              <div className="p-2 bg-green-100 rounded-full">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              {onTimeRate >= 90 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  <span className="text-green-500 font-medium">Excellent</span>
                </>
              ) : onTimeRate >= 75 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1 text-amber-500" />
                  <span className="text-amber-500 font-medium">Good</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                  <span className="text-red-500 font-medium">
                    Needs Improvement
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Avg. Production Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">
                {averageProductionTime.toFixed(1)} hrs
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-muted-foreground">Per job completion</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Status and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} jobs`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={jobTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {jobTypeData.map((entry) => (
                    <Cell
                      key={`cell-${entry.type}`}
                      fill={JOB_TYPE_COLORS[entry.type as JobType]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} jobs`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="jobs"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name="Jobs Completed"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="utilization"
                  stroke="#82ca9d"
                  name="Utilization %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Production Hours by Job Type</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(jobTypeHours).map(([type, hours]) => ({
                  name: type
                    .replace("_", " ")
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" "),
                  hours: hours,
                  type: type,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} hours`, "Production Time"]}
                />
                <Legend />
                <Bar
                  dataKey="hours"
                  name="Production Hours"
                  fill="#8884d8"
                  barSize={40}
                >
                  {Object.entries(jobTypeHours).map(([type], index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={JOB_TYPE_COLORS[type as JobType]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resource Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Staff Utilization</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffUtilization} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(value) => [`${value}%`, "Utilization"]} />
                <Bar
                  dataKey="utilization"
                  fill="#8884d8"
                  name="Utilization (%)"
                  background={{ fill: "#eee" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Machine Utilization</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineUtilization} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(value) => [`${value}%`, "Utilization"]} />
                <Bar
                  dataKey="utilization"
                  fill="#82ca9d"
                  name="Utilization (%)"
                  background={{ fill: "#eee" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Planning */}
      <Card>
        <CardHeader>
          <CardTitle>Capacity Planning Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {capacityUtilization > 90 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="font-medium text-red-800 mb-1">
                  Over Capacity Warning
                </h3>
                <p className="text-sm text-red-700">
                  Your production team is currently over capacity. Consider
                  hiring temporary staff, extending deadlines, or redistributing
                  workload to prevent delays.
                </p>
              </div>
            )}

            {capacityUtilization > 75 && capacityUtilization <= 90 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <h3 className="font-medium text-amber-800 mb-1">
                  High Utilization Alert
                </h3>
                <p className="text-sm text-amber-700">
                  Your production team is operating at high capacity. Monitor
                  workloads closely and consider adjusting schedules if
                  additional jobs are accepted.
                </p>
              </div>
            )}

            {capacityUtilization <= 75 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-medium text-green-800 mb-1">
                  Optimal Capacity
                </h3>
                <p className="text-sm text-green-700">
                  Your production team has sufficient capacity for current
                  workloads and can accommodate additional jobs if needed.
                </p>
              </div>
            )}

            <h3 className="font-medium mt-4">
              Resource-Specific Recommendations
            </h3>
            <ul className="space-y-2">
              {staffUtilization
                .filter((staff) => staff.utilization > 90)
                .map((staff, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{staff.name}</span> is
                    over-utilized at {staff.utilization.toFixed(0)}%. Consider
                    redistributing some of their workload to other team members.
                  </li>
                ))}

              {machineUtilization
                .filter((machine) => machine.utilization > 90)
                .map((machine, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{machine.name}</span> is
                    over-utilized at {machine.utilization.toFixed(0)}%. Consider
                    scheduling jobs on alternative equipment when possible.
                  </li>
                ))}

              {staffUtilization.filter((staff) => staff.utilization < 50)
                .length > 0 && (
                <li className="text-sm">
                  Some staff members have low utilization. Consider reassigning
                  work to balance workloads.
                </li>
              )}

              {onTimeRate < 80 && (
                <li className="text-sm">
                  On-time delivery rate is below target. Review scheduling
                  practices and consider adding buffer time for complex jobs.
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
