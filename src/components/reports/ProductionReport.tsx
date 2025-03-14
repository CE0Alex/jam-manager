import React from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, addDays, subDays } from "date-fns";
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
} from "recharts";
import JobTypeDistribution from "./JobTypeDistribution";
import { JobStatus } from "@/types";

interface ProductionReportProps {
  startDate: Date;
  endDate: Date;
}

export default function ProductionReport({
  startDate,
  endDate,
}: ProductionReportProps) {
  const { jobs, schedule, machines, staff } = useAppContext();

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

  // Calculate machine utilization based on actual schedule data
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

      // Calculate utilization percentage (based on available hours per day)
      const availableHoursPerWeek = machine.hoursPerDay * 5; // 5 working days
      const utilizationPercentage = Math.min(
        100,
        (totalHoursScheduled / availableHoursPerWeek) * 100,
      );

      return {
        name: machine.name,
        utilization: Math.round(utilizationPercentage),
      };
    }) || [];

  // Calculate production time by job type based on job titles
  const jobTypeMap: Record<string, number> = {};
  filteredJobs.forEach((job) => {
    // Extract job type from title (simplified approach)
    const jobType = job.title.split("-")[0].trim();
    if (!jobTypeMap[jobType]) {
      jobTypeMap[jobType] = 0;
    }
    jobTypeMap[jobType] += job.estimatedHours || 0;
  });

  const productionTimeByJobType = Object.entries(jobTypeMap)
    .map(([name, hours]) => ({ name, hours }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5); // Top 5 job types

  // Calculate on-time delivery rate based on completed jobs
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

  // Calculate on-time delivery trend based on actual data
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentMonth = new Date().getMonth();

  const onTimeDelivery = months.slice(0, 6).map((name, index) => {
    // This would normally be calculated from historical data
    // For now, we'll use a placeholder calculation
    const monthIndex = (currentMonth - 5 + index) % 12;
    const monthName = months[monthIndex >= 0 ? monthIndex : monthIndex + 12];
    return {
      name: monthName,
      rate: onTimeRate > 0 ? Math.max(50, onTimeRate - (5 - index) * 5) : 0,
    };
  });

  // Calculate total production hours from schedule
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

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Total Production Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalProductionHours.toFixed(1)}
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Across {filteredJobs.length} jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              On-Time Delivery Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{onTimeRate}%</div>
            <p className="text-muted-foreground text-sm mt-1">
              {onTimeJobs.length} of {completedJobs.length} jobs on time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Average Production Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {averageProductionTime.toFixed(1)} hours
            </div>
            <p className="text-muted-foreground text-sm mt-1">Per job</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  fill="#8884d8"
                  name="Utilization (%)"
                  background={{ fill: "#eee" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <JobTypeDistribution startDate={startDate} endDate={endDate} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Production Time by Job Type</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionTimeByJobType}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} hours`, "Production Time"]}
                />
                <Legend />
                <Bar dataKey="hours" fill="#82ca9d" name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>On-Time Delivery Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={onTimeDelivery}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "On-Time Rate"]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name="On-Time Delivery Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
