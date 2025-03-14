import React, { useState } from "react";
import ProductionCalendar from "./ProductionCalendar";
import CapacityManager from "./CapacityManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Sliders } from "lucide-react";

interface ScheduleViewProps {
  initialTab?: "calendar" | "capacity";
  dailyCapacity?: number;
  weeklyCapacity?: number;
  currentUtilization?: number;
}

const ScheduleView = ({
  initialTab = "calendar",
  dailyCapacity = 24,
  weeklyCapacity = 120,
  currentUtilization = 0,
}: ScheduleViewProps) => {
  const [activeTab, setActiveTab] = useState<"calendar" | "capacity">(
    initialTab,
  );
  const [capacitySettings, setCapacitySettings] = useState({
    daily: dailyCapacity,
    weekly: weeklyCapacity,
    utilization: currentUtilization,
  });

  const handleCapacityChange = (type: "daily" | "weekly", value: number) => {
    setCapacitySettings((prev) => ({
      ...prev,
      [type]: value,
    }));
    // In a real application, this would likely make an API call to update settings
    console.log(`Updated ${type} capacity to ${value} hours`);
  };

  return (
    <div className="container mx-auto p-4 space-y-6 bg-background">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Production Schedule
        </h1>
        <p className="text-muted-foreground">
          Manage your production schedule and capacity settings
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "calendar" | "capacity")
        }
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="capacity" className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Capacity Management
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="calendar" className="space-y-4">
          <ProductionCalendar />
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          <CapacityManager
            dailyCapacity={capacitySettings.daily}
            weeklyCapacity={capacitySettings.weekly}
            currentUtilization={capacitySettings.utilization}
            onCapacityChange={handleCapacityChange}
          />
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Schedule Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border">
              <h3 className="font-medium mb-2">Upcoming Jobs</h3>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Next 7 days</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border">
              <h3 className="font-medium mb-2">Current Capacity</h3>
              <p className="text-2xl font-bold">
                {capacitySettings.utilization}%
              </p>
              <p className="text-sm text-muted-foreground">
                Of total production hours
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border">
              <h3 className="font-medium mb-2">Staff Assigned</h3>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">
                Across all scheduled jobs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleView;
