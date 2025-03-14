import React from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface SalesReportProps {
  startDate: Date;
  endDate: Date;
}

export default function SalesReport({ startDate, endDate }: SalesReportProps) {
  const { jobs } = useAppContext();

  // Filter jobs by date range
  const filteredJobs = jobs.filter((job) => {
    const jobDate = new Date(job.createdAt);
    return jobDate >= startDate && jobDate <= endDate;
  });

  // Calculate total sales (empty data)
  const totalSales = 0;

  // Generate sales by client data (empty)
  const salesByClient: Record<string, number> = {};

  const salesByClientData: { name: string; value: number }[] = [];

  // Generate sales by month data (empty)
  const salesByMonth = [
    { name: "Jan", sales: 0 },
    { name: "Feb", sales: 0 },
    { name: "Mar", sales: 0 },
    { name: "Apr", sales: 0 },
    { name: "May", sales: 0 },
    { name: "Jun", sales: 0 },
  ];

  // Generate sales by job type data (empty)
  const salesByJobType = [
    { name: "Business Cards", value: 0 },
    { name: "Brochures", value: 0 },
    { name: "Posters", value: 0 },
    { name: "Banners", value: 0 },
    { name: "Flyers", value: 0 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${totalSales.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {filteredJobs.length} jobs completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Average Job Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              $
              {filteredJobs.length > 0
                ? (totalSales / filteredJobs.length).toLocaleString()
                : 0}
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Per completed job
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Top Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {salesByClientData.length > 0 ? salesByClientData[0].name : "N/A"}
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {salesByClientData.length > 0
                ? `$${salesByClientData[0].value.toLocaleString()} in sales`
                : "No sales data"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Month</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" name="Sales ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Job Type</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByJobType}
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
                  {salesByJobType.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Clients by Sales</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesByClientData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
              <Bar dataKey="value" fill="#82ca9d" name="Sales ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
