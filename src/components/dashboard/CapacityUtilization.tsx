import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DashboardMetrics } from "@/types";
import { useAppContext } from "@/context/AppContext";

interface CapacityUtilizationProps {
  data?: {
    daily: CapacityData[];
    weekly: CapacityData[];
    monthly: CapacityData[];
  };
  currentUtilization?: number;
}

interface CapacityData {
  name: string;
  capacity: number;
  utilized: number;
}

const defaultData = {
  daily: [
    { name: "Mon", capacity: 100, utilized: 0 },
    { name: "Tue", capacity: 100, utilized: 0 },
    { name: "Wed", capacity: 100, utilized: 0 },
    { name: "Thu", capacity: 100, utilized: 0 },
    { name: "Fri", capacity: 100, utilized: 0 },
    { name: "Sat", capacity: 50, utilized: 0 },
    { name: "Sun", capacity: 0, utilized: 0 },
  ],
  weekly: [
    { name: "Week 1", capacity: 100, utilized: 0 },
    { name: "Week 2", capacity: 100, utilized: 0 },
    { name: "Week 3", capacity: 100, utilized: 0 },
    { name: "Week 4", capacity: 100, utilized: 0 },
  ],
  monthly: [
    { name: "Jan", capacity: 100, utilized: 0 },
    { name: "Feb", capacity: 100, utilized: 0 },
    { name: "Mar", capacity: 100, utilized: 0 },
    { name: "Apr", capacity: 100, utilized: 0 },
    { name: "May", capacity: 100, utilized: 0 },
    { name: "Jun", capacity: 100, utilized: 0 },
  ],
};

const CapacityUtilization: React.FC<CapacityUtilizationProps> = ({
  data = defaultData,
  currentUtilization,
}) => {
  const { dashboardMetrics } = useAppContext();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [department, setDepartment] = useState<string>("all");

  // Calculate utilization percentage for display
  const utilizationPercentage =
    currentUtilization !== undefined
      ? currentUtilization
      : dashboardMetrics.capacityUtilization;
  const utilizationColor =
    utilizationPercentage > 90
      ? "text-red-500"
      : utilizationPercentage > 75
        ? "text-amber-500"
        : "text-green-500";

  return (
    <Card className="w-full h-full bg-white shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">
            Capacity Utilization
          </CardTitle>
          <div className="flex space-x-2">
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="printing">Printing</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="finishing">Finishing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm text-muted-foreground">
              Current Utilization
            </span>
            <div className="flex items-baseline">
              <span className={`text-2xl font-bold ${utilizationColor}`}>
                {utilizationPercentage}%
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                {utilizationPercentage > 75 ? "High Load" : "Normal"}
              </span>
            </div>
          </div>
          <Tabs
            value={period}
            onValueChange={(value) =>
              setPeriod(value as "daily" | "weekly" | "monthly")
            }
          >
            <TabsList className="grid grid-cols-3 w-[240px]">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data[period]}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCapacity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUtilized" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="capacity"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorCapacity)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="utilized"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorUtilized)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CapacityUtilization;
