import React from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { JobType } from "@/types";

interface JobTypeDistributionProps {
  startDate: Date;
  endDate: Date;
  viewType?: "pie" | "bar";
}

export default function JobTypeDistribution({
  startDate,
  endDate,
  viewType = "pie",
}: JobTypeDistributionProps) {
  const { jobs } = useAppContext();

  // Filter jobs by date range
  const filteredJobs = jobs.filter((job) => {
    const jobDate = new Date(job.createdAt);
    return jobDate >= startDate && jobDate <= endDate;
  });

  // Count jobs by type
  const jobTypeCounts: Record<JobType, number> = {
    embroidery: 0,
    screen_printing: 0,
    digital_printing: 0,
    wide_format: 0,
    central_facility: 0,
  };

  filteredJobs.forEach((job) => {
    jobTypeCounts[job.jobType]++;
  });

  // Calculate hours by job type
  const jobTypeHours: Record<JobType, number> = {
    embroidery: 0,
    screen_printing: 0,
    digital_printing: 0,
    wide_format: 0,
    central_facility: 0,
  };

  filteredJobs.forEach((job) => {
    jobTypeHours[job.jobType] += job.estimatedHours;
  });

  // Format data for charts
  const chartData = Object.entries(jobTypeCounts).map(([type, count]) => ({
    name: formatJobType(type as JobType),
    value: count,
    hours: jobTypeHours[type as JobType],
    type,
  }));

  // Colors for different job types
  const COLORS = {
    embroidery: "#8884d8", // purple
    screen_printing: "#3B82F6", // blue
    digital_printing: "#10B981", // green
    wide_format: "#F97316", // orange
    central_facility: "#EF4444", // red
  };

  // Format job type for display
  function formatJobType(type: JobType): string {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Get badge for job type
  const getJobTypeBadge = (type: JobType) => {
    const badgeClasses = {
      embroidery: "bg-purple-100 text-purple-800 border-purple-200",
      screen_printing: "bg-blue-100 text-blue-800 border-blue-200",
      digital_printing: "bg-green-100 text-green-800 border-green-200",
      wide_format: "bg-orange-100 text-orange-800 border-orange-200",
      central_facility: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <Badge variant="outline" className={badgeClasses[type]}>
        {formatJobType(type)}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Job Type Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {viewType === "pie" ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.type}`}
                      fill={COLORS[entry.type as JobType]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} jobs (${props.payload.hours} hours)`,
                    name,
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, "auto"]}
                />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="value"
                  name="Job Count"
                  fill="#8884d8"
                />
                <Bar
                  yAxisId="right"
                  dataKey="hours"
                  name="Total Hours"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Job Count by Type</h3>
            <div className="space-y-2">
              {Object.entries(jobTypeCounts).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <div>{getJobTypeBadge(type as JobType)}</div>
                  <div className="font-medium">{count} jobs</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">
              Production Hours by Type
            </h3>
            <div className="space-y-2">
              {Object.entries(jobTypeHours).map(([type, hours]) => (
                <div key={type} className="flex justify-between items-center">
                  <div>{getJobTypeBadge(type as JobType)}</div>
                  <div className="font-medium">{hours.toFixed(1)} hours</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
