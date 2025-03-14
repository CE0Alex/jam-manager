import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { StaffMember } from "../../types";
import { BarChart, LineChart, PieChart } from "lucide-react";

interface PerformanceMetricsProps {
  staffMember?: StaffMember;
}

const PerformanceMetrics = ({ staffMember }: PerformanceMetricsProps) => {
  const [timeRange, setTimeRange] = useState("month");

  // Default staff member data if none provided
  const defaultStaffMember: StaffMember = {
    id: "",
    name: "",
    role: "",
    email: "",
    phone: "",
    skills: [],
    availability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    assignedJobs: [],
    performanceMetrics: {
      completionRate: 0,
      onTimeRate: 0,
      qualityScore: 0,
    },
  };

  const staff = staffMember || defaultStaffMember;

  // Mock performance data
  const mockCompletionRateData = [
    { month: "Jan", rate: 90 },
    { month: "Feb", rate: 85 },
    { month: "Mar", rate: 92 },
    { month: "Apr", rate: 88 },
    { month: "May", rate: 94 },
    { month: "Jun", rate: 91 },
  ];

  const mockOnTimeData = [
    { month: "Jan", rate: 82 },
    { month: "Feb", rate: 79 },
    { month: "Mar", rate: 85 },
    { month: "Apr", rate: 81 },
    { month: "May", rate: 88 },
    { month: "Jun", rate: 86 },
  ];

  const mockQualityData = [
    { month: "Jan", rate: 88 },
    { month: "Feb", rate: 90 },
    { month: "Mar", rate: 89 },
    { month: "Apr", rate: 91 },
    { month: "May", rate: 92 },
    { month: "Jun", rate: 93 },
  ];

  return (
    <div className="w-full h-full bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Performance Metrics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Team Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
                <CardDescription>Jobs completed successfully</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-3xl font-bold">
                    {staff.performanceMetrics?.completionRate || 0}%
                  </div>
                  <div className="ml-2 text-sm text-green-500">+2%</div>
                </div>
                <div className="mt-4 h-20 flex items-end">
                  {mockCompletionRateData.map((item, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-6 bg-blue-500 rounded-t"
                        style={{ height: `${item.rate * 0.2}px` }}
                      ></div>
                      <div className="text-xs mt-1">{item.month}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  On-Time Delivery
                </CardTitle>
                <CardDescription>Jobs delivered by deadline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-3xl font-bold">
                    {staff.performanceMetrics?.onTimeRate || 0}%
                  </div>
                  <div className="ml-2 text-sm text-green-500">+3%</div>
                </div>
                <div className="mt-4 h-20 flex items-end">
                  {mockOnTimeData.map((item, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-6 bg-green-500 rounded-t"
                        style={{ height: `${item.rate * 0.2}px` }}
                      ></div>
                      <div className="text-xs mt-1">{item.month}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Quality Score
                </CardTitle>
                <CardDescription>Average client satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-3xl font-bold">
                    {staff.performanceMetrics?.qualityScore || 0}%
                  </div>
                  <div className="ml-2 text-sm text-green-500">+1%</div>
                </div>
                <div className="mt-4 h-20 flex items-end">
                  {mockQualityData.map((item, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-6 bg-purple-500 rounded-t"
                        style={{ height: `${item.rate * 0.2}px` }}
                      ></div>
                      <div className="text-xs mt-1">{item.month}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Overall performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Jobs Completed</span>
                  <span className="font-medium">24 jobs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Completion Time</span>
                  <span className="font-medium">2.3 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Efficiency Rating</span>
                  <span className="font-medium">91%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Client Feedback Score</span>
                  <span className="font-medium">4.7/5.0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>6-month performance analysis</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="text-center">
                <LineChart className="h-40 w-40 text-gray-400 mx-auto" />
                <p className="mt-4 text-sm text-gray-500">
                  Detailed trend charts would be implemented here with a
                  charting library
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Comparison</CardTitle>
              <CardDescription>
                Performance relative to team average
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="text-center">
                <BarChart className="h-40 w-40 text-gray-400 mx-auto" />
                <p className="mt-4 text-sm text-gray-500">
                  Comparative performance charts would be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMetrics;
