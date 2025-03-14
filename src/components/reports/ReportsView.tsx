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
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import {
  Download,
  Calendar,
  Filter,
  Printer,
  Users,
  Clock,
  Layers,
  BarChart2,
  FileText,
} from "lucide-react";
import ProductionReport from "./ProductionReport";
import StaffPerformanceReport from "./StaffPerformanceReport";
import FinancialReport from "./FinancialReport";
import SalesReport from "./SalesReport";
import ComprehensiveDashboard from "./ComprehensiveDashboard";

export default function ReportsView() {
  const { jobs, staff, schedule } = useAppContext();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "production" | "staff" | "capacity" | "financial" | "sales"
  >("dashboard");
  const [dateRange, setDateRange] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");

  // Calculate date range for reports
  const getDateRange = () => {
    const today = new Date();
    let startDate: Date;
    let endDate = today;

    switch (dateRange) {
      case "week":
        startDate = subDays(today, 7);
        break;
      case "month":
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case "quarter":
        startDate = subDays(today, 90);
        break;
      case "year":
        startDate = subDays(today, 365);
        break;
      default:
        startDate = subDays(today, 30);
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Format date range for display
  const formattedDateRange = `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Production Reports
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate and view detailed reports about your print shop production
          operations.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">
              Report Period: {formattedDateRange}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={dateRange}
                onValueChange={(value) => setDateRange(value as any)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="quarter">Last 90 days</SelectItem>
                  <SelectItem value="year">Last 365 days</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>

              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Production
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Staff
          </TabsTrigger>
          <TabsTrigger value="capacity" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Capacity
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Sales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ComprehensiveDashboard startDate={startDate} endDate={endDate} />
        </TabsContent>

        <TabsContent value="production">
          <ProductionReport startDate={startDate} endDate={endDate} />
        </TabsContent>

        <TabsContent value="staff">
          <StaffPerformanceReport startDate={startDate} endDate={endDate} />
        </TabsContent>

        <TabsContent value="capacity">
          <CapacityAnalysisReport startDate={startDate} endDate={endDate} />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialReport startDate={startDate} endDate={endDate} />
        </TabsContent>

        <TabsContent value="sales">
          <SalesReport startDate={startDate} endDate={endDate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface CapacityAnalysisReportProps {
  startDate: Date;
  endDate: Date;
}

function CapacityAnalysisReport({
  startDate,
  endDate,
}: CapacityAnalysisReportProps) {
  const { staff, schedule, jobs } = useAppContext();

  // Filter to only production staff
  const productionStaff = staff.filter(
    (member) =>
      member.role.toLowerCase().includes("production") ||
      member.skills.some(
        (skill) =>
          skill.toLowerCase().includes("print") ||
          skill.toLowerCase().includes("production"),
      ),
  );

  // Calculate capacity metrics based on staff availability and assignments
  const staffCapacityData = productionStaff.map((staffMember) => {
    // Calculate available hours based on staff availability
    const availableDaysCount = Object.values(staffMember.availability).filter(
      Boolean,
    ).length;
    const dailyHours = 8; // Assuming 8 hours per working day
    const totalAvailableHours = availableDaysCount * dailyHours;

    // Calculate assigned hours from schedule
    const staffEvents = schedule.filter(
      (event) => event.staffId === staffMember.id,
    );
    const assignedHours = staffEvents.reduce((total, event) => {
      const startTime = new Date(event.startTime);
      const endTime = new Date(event.endTime);
      const durationHours =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      return total + durationHours;
    }, 0);

    // Calculate utilization percentage
    const utilizationPercentage =
      totalAvailableHours > 0
        ? Math.min(100, (assignedHours / totalAvailableHours) * 100)
        : 0;

    return {
      name: staffMember.name,
      role: staffMember.role,
      availableHours: totalAvailableHours,
      assignedHours: assignedHours,
      utilization: Math.round(utilizationPercentage),
      remainingCapacity: Math.max(0, totalAvailableHours - assignedHours),
    };
  });

  // Calculate overall production capacity
  const totalAvailableHours = staffCapacityData.reduce(
    (sum, staff) => sum + staff.availableHours,
    0,
  );
  const totalAssignedHours = staffCapacityData.reduce(
    (sum, staff) => sum + staff.assignedHours,
    0,
  );
  const overallUtilization =
    totalAvailableHours > 0
      ? Math.round((totalAssignedHours / totalAvailableHours) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Overall Capacity Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallUtilization}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className={`h-2.5 rounded-full ${overallUtilization > 90 ? "bg-red-500" : overallUtilization > 75 ? "bg-amber-500" : "bg-green-500"}`}
                style={{ width: `${overallUtilization}%` }}
              ></div>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {totalAssignedHours.toFixed(1)} / {totalAvailableHours.toFixed(1)}{" "}
              hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Available Production Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{productionStaff.length}</div>
            <p className="text-muted-foreground text-sm mt-1">
              With production-related skills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Remaining Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.max(0, totalAvailableHours - totalAssignedHours).toFixed(1)}{" "}
              hours
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Available for additional jobs
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Capacity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {staffCapacityData.map((staffData, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{staffData.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {staffData.role}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {staffData.utilization}% Utilized
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${staffData.utilization > 90 ? "bg-red-500" : staffData.utilization > 75 ? "bg-amber-500" : "bg-green-500"}`}
                    style={{ width: `${staffData.utilization}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {staffData.assignedHours.toFixed(1)} hours assigned
                  </span>
                  <span>
                    {staffData.availableHours.toFixed(1)} hours available
                  </span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>
                    Available:{" "}
                    {Object.entries(
                      staff.find((s) => s.name === staffData.name)
                        ?.availability || {},
                    )
                      .filter(([_, isAvailable]) => isAvailable)
                      .map(([day]) => day.substring(0, 3))
                      .join(", ")}
                  </span>
                </div>
              </div>
            ))}

            {staffCapacityData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No production staff members found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Capacity Planning Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overallUtilization > 90 && (
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

            {overallUtilization > 75 && overallUtilization <= 90 && (
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

            {overallUtilization <= 75 && (
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

            <h3 className="font-medium mt-4">Staff-Specific Recommendations</h3>
            <ul className="space-y-2">
              {staffCapacityData
                .filter((staff) => staff.utilization > 90)
                .map((staff, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{staff.name}</span> is
                    over-utilized at {staff.utilization}%. Consider
                    redistributing{" "}
                    {Math.round(
                      staff.assignedHours - staff.availableHours * 0.8,
                    )}{" "}
                    hours to other team members.
                  </li>
                ))}

              {staffCapacityData
                .filter((staff) => staff.utilization < 50)
                .map((staff, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{staff.name}</span> has
                    significant available capacity at only {staff.utilization}%
                    utilization. Consider assigning up to{" "}
                    {Math.round(staff.availableHours - staff.assignedHours)}{" "}
                    additional hours.
                  </li>
                ))}

              {staffCapacityData.filter(
                (staff) => staff.utilization >= 50 && staff.utilization <= 90,
              ).length === staffCapacityData.length && (
                <li className="text-sm">
                  All staff members are currently at optimal capacity levels.
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
