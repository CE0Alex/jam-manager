import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays } from "date-fns";
import {
  Printer,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
} from "lucide-react";
import { Machine } from "@/types";

interface MachineCapacityViewProps {
  onMachineSelect?: (machineId: string) => void;
}

export default function MachineCapacityView({
  onMachineSelect,
}: MachineCapacityViewProps) {
  const { machines, schedule, dashboardMetrics } = useAppContext();
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");

  // Get machine utilization from dashboard metrics
  const machineUtilization = dashboardMetrics.machineUtilization || {};

  // Get machine status color
  const getMachineStatusColor = (status: Machine["status"]) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800 border-green-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "offline":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get utilization color based on percentage
  const getUtilizationColor = (percentage: number) => {
    if (percentage > 90) return "bg-red-500";
    if (percentage > 75) return "bg-amber-500";
    if (percentage > 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Get upcoming maintenance machines
  const getUpcomingMaintenance = () => {
    return machines.filter((machine) => {
      if (!machine.maintenanceSchedule) return false;

      const nextMaintenance = new Date(
        machine.maintenanceSchedule.nextMaintenance,
      );
      const today = new Date();
      const twoWeeksFromNow = addDays(today, 14);

      return nextMaintenance >= today && nextMaintenance <= twoWeeksFromNow;
    });
  };

  const upcomingMaintenance = getUpcomingMaintenance();

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Machine Capacity</CardTitle>
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

      <CardContent>
        <Tabs defaultValue="utilization">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="utilization" className="space-y-4">
            {machines.map((machine) => {
              const utilization = machineUtilization[machine.id] || 0;

              return (
                <div
                  key={machine.id}
                  className="border rounded-md p-4 cursor-pointer hover:border-primary"
                  onClick={() => onMachineSelect && onMachineSelect(machine.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{machine.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {machine.type}
                      </p>
                    </div>
                    <Badge className={getMachineStatusColor(machine.status)}>
                      {machine.status.charAt(0).toUpperCase() +
                        machine.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Capacity Utilization</span>
                      <span className="font-medium">{utilization}%</span>
                    </div>
                    <Progress
                      value={utilization}
                      className={getUtilizationColor(utilization)}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {machine.capabilities.map((capability, index) => (
                      <Badge key={index} variant="outline">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            {upcomingMaintenance.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">
                      Upcoming Maintenance
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      The following machines are scheduled for maintenance in
                      the next 14 days. Plan your production schedule
                      accordingly.
                    </p>
                  </div>
                </div>

                {upcomingMaintenance.map((machine) => (
                  <div key={machine.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{machine.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {machine.type}
                        </p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        Maintenance Scheduled
                      </Badge>
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Next Maintenance: </span>
                        <span className="font-medium ml-1">
                          {format(
                            new Date(
                              machine.maintenanceSchedule!.nextMaintenance,
                            ),
                            "MMMM d, yyyy",
                          )}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Last Maintenance: </span>
                        <span className="ml-1">
                          {format(
                            new Date(
                              machine.maintenanceSchedule!.lastMaintenance,
                            ),
                            "MMMM d, yyyy",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium">No Upcoming Maintenance</h3>
                <p className="text-muted-foreground mt-1">
                  All machines are on their regular maintenance schedule with no
                  upcoming service in the next 14 days.
                </p>
              </div>
            )}

            <div className="mt-6">
              <Button variant="outline" className="w-full" disabled>
                <Settings className="h-4 w-4 mr-2" />
                Manage Maintenance Schedules
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
