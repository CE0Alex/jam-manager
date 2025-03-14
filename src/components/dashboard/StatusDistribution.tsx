import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { JobStatus } from "@/types";
import { useAppContext } from "@/context/AppContext";

interface StatusDistributionProps {
  data?: Record<JobStatus, number>;
  className?: string;
}

const StatusDistribution = ({
  data: propData,
  className = "",
}: StatusDistributionProps) => {
  const { jobs } = useAppContext();
  const [timeRange, setTimeRange] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");
  const [viewType, setViewType] = useState<"chart" | "table">("chart");

  // Calculate job status distribution directly from jobs array
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

  // Use the calculated data or the prop data
  const data = propData || statusCounts;

  // Transform data for chart
  const chartData = Object.entries(data).map(([status, count]) => ({
    name: formatStatus(status as JobStatus),
    value: count,
    status,
  }));

  // Colors for different statuses
  const COLORS = {
    pending: "#FFB547", // amber
    in_progress: "#3B82F6", // blue
    review: "#8B5CF6", // purple
    completed: "#10B981", // green
    cancelled: "#EF4444", // red
  };

  // Format status for display
  function formatStatus(status: JobStatus): string {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Calculate total jobs
  const totalJobs = Object.values(data).reduce((sum, count) => sum + count, 0);

  return (
    <Card className={`w-full h-full bg-white ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold">
            Job Status Distribution
          </CardTitle>
          <CardDescription>Overview of jobs by current status</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as any)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={viewType}
          onValueChange={(value) => setViewType(value as "chart" | "table")}
        >
          <TabsList className="grid w-[200px] grid-cols-2 mb-4">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="h-[250px]">
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
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.status as JobStatus]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} jobs`, "Count"]}
                  labelFormatter={(name) => `Status: ${name}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="table">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2">Status</th>
                    <th className="text-right py-2">Count</th>
                    <th className="text-right py-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((item, index) => {
                    const total = Object.values(data).reduce(
                      (sum, count) => sum + count,
                      0,
                    );
                    const percentage = ((item.value / total) * 100).toFixed(1);

                    return (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="py-2">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{
                                backgroundColor:
                                  COLORS[item.status as JobStatus],
                              }}
                            />
                            {item.name}
                          </div>
                        </td>
                        <td className="text-right py-2">{item.value}</td>
                        <td className="text-right py-2">{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StatusDistribution;
