import React from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

interface FinancialReportProps {
  startDate: Date;
  endDate: Date;
}

export default function FinancialReport({
  startDate,
  endDate,
}: FinancialReportProps) {
  const { jobs } = useAppContext();

  // Filter jobs by date range
  const filteredJobs = jobs.filter((job) => {
    const jobDate = new Date(job.createdAt);
    return jobDate >= startDate && jobDate <= endDate;
  });

  // Calculate revenue (empty data)
  const totalRevenue = 0;
  const totalCosts = 0;
  const totalProfit = 0;
  const profitMargin = 0;

  // Generate revenue by month data (empty)
  const revenueByMonth = [
    { name: "Jan", revenue: 0, costs: 0, profit: 0 },
    { name: "Feb", revenue: 0, costs: 0, profit: 0 },
    { name: "Mar", revenue: 0, costs: 0, profit: 0 },
    { name: "Apr", revenue: 0, costs: 0, profit: 0 },
    { name: "May", revenue: 0, costs: 0, profit: 0 },
    { name: "Jun", revenue: 0, costs: 0, profit: 0 },
  ];

  // Generate revenue by job type data (empty)
  const revenueByJobType = [
    { name: "Business Cards", value: 0 },
    { name: "Brochures", value: 0 },
    { name: "Posters", value: 0 },
    { name: "Banners", value: 0 },
    { name: "Flyers", value: 0 },
  ];

  // Generate cost breakdown data (empty)
  const costBreakdown = [
    { name: "Materials", value: 0 },
    { name: "Labor", value: 0 },
    { name: "Equipment", value: 0 },
    { name: "Overhead", value: 0 },
    { name: "Marketing", value: 0 },
  ];

  // Generate profit margin trend data (empty)
  const profitMarginTrend = [
    { name: "Jan", margin: 0 },
    { name: "Feb", margin: 0 },
    { name: "Mar", margin: 0 },
    { name: "Apr", margin: 0 },
    { name: "May", margin: 0 },
    { name: "Jun", margin: 0 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              From {filteredJobs.length} jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${totalCosts.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Materials, labor, etc.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${totalProfit.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Revenue - Costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profitMargin.toFixed(1)}%</div>
            <p className="text-muted-foreground text-sm mt-1">
              Industry avg: 35%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue, Costs & Profit by Month</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                <Bar dataKey="costs" fill="#ff8042" name="Costs ($)" />
                <Bar dataKey="profit" fill="#82ca9d" name="Profit ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit Margin Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitMarginTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 50]} />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Profit Margin"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="margin"
                  stroke="#82ca9d"
                  activeDot={{ r: 8 }}
                  name="Profit Margin (%)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Job Type</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByJobType}
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
                  {revenueByJobType.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdown}
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
                  {costBreakdown.map((entry, index) => (
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
          <CardTitle>Revenue Forecast</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[
                { month: "Jul", actual: 0, forecast: 17000 },
                { month: "Aug", actual: 0, forecast: 18000 },
                { month: "Sep", actual: 0, forecast: 19000 },
                { month: "Oct", actual: 0, forecast: 20000 },
                { month: "Nov", actual: 0, forecast: 22000 },
                { month: "Dec", actual: 0, forecast: 25000 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
              <Legend />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
                name="Revenue Forecast ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
