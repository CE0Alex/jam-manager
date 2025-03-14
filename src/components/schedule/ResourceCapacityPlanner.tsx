import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, addDays, eachDayOfInterval } from "date-fns";
import { AlertTriangle, Clock, Users, Printer, Calendar } from "lucide-react";
import { StaffMember, Machine } from "@/types";

interface ResourceCapacityPlannerProps {
  initialTab?: "staff" | "machines";
}

export default function ResourceCapacityPlanner({
  initialTab = "staff",
}: ResourceCapacityPlannerProps) {
  const { staff, machines, schedule } = useAppContext();
  const [activeTab, setActiveTab] = useState<"staff" | "machines">(initialTab);
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");

  // Calculate date range based on selected time range
  const getDateRange = () => {
    const today = new Date();
    let endDate: Date;

    switch (timeRange) {
      case "day":
        endDate = today;
        break;
      case "week":
        endDate = addDays(today, 6);
        break;
      case "month":
        endDate = addDays(today, 29);
        break;
      default:
        endDate = addDays(today, 6);
    }

    return eachDayOfInterval({ start: today, end: endDate });
  };

  // Calculate staff capacity utilization
  const calculateStaffUtilization = (staffMember: StaffMember) => {
    const dateRange = getDateRange();
    let totalCapacityHours = 0;
    let scheduledHours = 0;

    // Calculate total capacity based on availability
    dateRange.forEach((date) => {
      const dayOfWeek = format(
        date,
        "EEEE",
      ).toLowerCase() as keyof typeof staffMember.availability;
      if (staffMember.availability[dayOfWeek]) {
        // Default to 8 hours if availabilityHours not specified
        const availHours = staffMember.availabilityHours?.[dayOfWeek];
        if (availHours) {
          const startHour = parseInt(availHours.start.split(":")[0]);
          const endHour = parseInt(availHours.end.split(":")[0]);
          totalCapacityHours += endHour - startHour;
        } else {
          totalCapacityHours += 8; // Default work day
        }
      }
    });

    // Calculate scheduled hours
    const staffEvents = schedule.filter(
      (event) => event.staffId === staffMember.id,
    );
    staffEvents.forEach((event) => {
      const startTime = new Date(event.startTime);
      const endTime = new Date(event.endTime);
      const eventDate = format(startTime, "yyyy-MM-dd");

      // Check if event is within the date range
      if (dateRange.some((date) => format(date, "yyyy-MM-dd") === eventDate)) {
        // Calculate duration in hours
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        scheduledHours += durationHours;
      }
    });

    const utilization =
      totalCapacityHours > 0 ? (scheduledHours / totalCapacityHours) * 100 : 0;
    return {
      utilization: Math.min(utilization, 100), // Cap at 100%
      scheduledHours,
      totalCapacityHours,
      isOverCapacity: utilization > 100,
    };
  };

  // Calculate machine capacity utilization
  const calculateMachineUtilization = (machine: Machine) => {
    const dateRange = getDateRange();
    // Assume machines are available 24/7 for simplicity
    // In a real app, you would have machine-specific availability
    let totalCapacityHours = dateRange.length * machine.hoursPerDay;
    let scheduledHours = 0;

    // Calculate scheduled hours
    const machineEvents = schedule.filter(
      (event) => event.machineId === machine.id,
    );
    machineEvents.forEach((event) => {
      const startTime = new Date(event.startTime);
      const endTime = new Date(event.endTime);
      const eventDate = format(startTime, "yyyy-MM-dd");

      // Check if event is within the date range
      if (dateRange.some((date) => format(date, "yyyy-MM-dd") === eventDate)) {
        // Calculate duration in hours
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        scheduledHours += durationHours;
      }
    });

    const utilization =
      totalCapacityHours > 0 ? (scheduledHours / totalCapacityHours) * 100 : 0;
    return {
      utilization: Math.min(utilization, 100), // Cap at 100%
      scheduledHours,
      totalCapacityHours,
      isOverCapacity: utilization > 100,
    };
  };

  // Get utilization color based on percentage
  const getUtilizationColor = (percentage: number, isOverCapacity: boolean) => {
    if (isOverCapacity) return "bg-red-500";
    if (percentage > 90) return "bg-amber-500";
    if (percentage > 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Render staff capacity view
  const renderStaffCapacity = () => {
    return (
      <div className="space-y-4">
        {staff.map((staffMember) => {
          const {
            utilization,
            scheduledHours,
            totalCapacityHours,
            isOverCapacity,
          } = calculateStaffUtilization(staffMember);

          return (
            <div key={staffMember.id} className="border rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{staffMember.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {staffMember.role}
                  </p>
                </div>
                <Badge variant={isOverCapacity ? "destructive" : "outline"}>
                  {isOverCapacity ? "Over Capacity" : "Available"}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Capacity Utilization</span>
                  <span className="font-medium">
                    {Math.round(utilization)}% ({scheduledHours.toFixed(1)} /{" "}
                    {totalCapacityHours.toFixed(1)} hours)
                  </span>
                </div>
                <Progress
                  value={utilization}
                  className={getUtilizationColor(utilization, isOverCapacity)}
                />
              </div>

              <div className="mt-4 flex items-center text-sm">
                <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="mr-4">
                  Skills: {staffMember.skills.join(", ")}
                </span>
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>
                  Available:{" "}
                  {Object.entries(staffMember.availability)
                    .filter(([_, isAvailable]) => isAvailable)
                    .map(([day]) => day.substring(0, 3))
                    .join(", ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render machine capacity view
  const renderMachineCapacity = () => {
    if (!machines || machines.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No machines configured. Add machines to view capacity.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {machines.map((machine) => {
          const {
            utilization,
            scheduledHours,
            totalCapacityHours,
            isOverCapacity,
          } = calculateMachineUtilization(machine);

          return (
            <div key={machine.id} className="border rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{machine.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {machine.type}
                  </p>
                </div>
                <Badge variant={isOverCapacity ? "destructive" : "outline"}>
                  {isOverCapacity ? "Over Capacity" : "Available"}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Capacity Utilization</span>
                  <span className="font-medium">
                    {Math.round(utilization)}% ({scheduledHours.toFixed(1)} /{" "}
                    {totalCapacityHours.toFixed(1)} hours)
                  </span>
                </div>
                <Progress
                  value={utilization}
                  className={getUtilizationColor(utilization, isOverCapacity)}
                />
              </div>

              <div className="mt-4 flex items-center text-sm">
                <Printer className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="mr-4">
                  Capabilities: {machine.capabilities.join(", ")}
                </span>
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>Hours per day: {machine.hoursPerDay}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Check for capacity warnings
  const getCapacityWarnings = () => {
    const warnings = [];

    // Check staff capacity
    staff.forEach((staffMember) => {
      const { utilization, isOverCapacity } =
        calculateStaffUtilization(staffMember);
      if (isOverCapacity) {
        warnings.push(
          `${staffMember.name} is over capacity (${Math.round(utilization)}%).`,
        );
      } else if (utilization > 90) {
        warnings.push(
          `${staffMember.name} is nearing capacity (${Math.round(utilization)}%).`,
        );
      }
    });

    // Check machine capacity
    machines?.forEach((machine) => {
      const { utilization, isOverCapacity } =
        calculateMachineUtilization(machine);
      if (isOverCapacity) {
        warnings.push(
          `${machine.name} is over capacity (${Math.round(utilization)}%).`,
        );
      } else if (utilization > 90) {
        warnings.push(
          `${machine.name} is nearing capacity (${Math.round(utilization)}%).`,
        );
      }
    });

    return warnings;
  };

  const capacityWarnings = getCapacityWarnings();

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Resource Capacity Planning</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className={timeRange === "day" ? "bg-muted" : ""}
              onClick={() => setTimeRange("day")}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={timeRange === "week" ? "bg-muted" : ""}
              onClick={() => setTimeRange("week")}
            >
              Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={timeRange === "month" ? "bg-muted" : ""}
              onClick={() => setTimeRange("month")}
            >
              Month
            </Button>
          </div>
        </div>
      </CardHeader>

      {capacityWarnings.length > 0 && (
        <div className="mx-6 mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Capacity Warnings</h4>
              <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                {capacityWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <CardContent className="pt-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "staff" | "machines")}
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Staff Capacity
            </TabsTrigger>
            <TabsTrigger value="machines" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Machine Capacity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="staff">{renderStaffCapacity()}</TabsContent>

          <TabsContent value="machines">{renderMachineCapacity()}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
