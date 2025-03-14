import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Calendar, Clock, Users } from "lucide-react";

interface CapacityManagerProps {
  dailyCapacity?: number;
  weeklyCapacity?: number;
  currentUtilization?: number;
  onCapacityChange?: (type: "daily" | "weekly", value: number) => void;
}

const CapacityManager = ({
  dailyCapacity = 24, // Default 24 hours per day
  weeklyCapacity = 120, // Default 120 hours per week
  currentUtilization = 0, // Default 0% utilization
  onCapacityChange = () => {},
}: CapacityManagerProps) => {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");
  const [tempDailyCapacity, setTempDailyCapacity] = useState(dailyCapacity);
  const [tempWeeklyCapacity, setTempWeeklyCapacity] = useState(weeklyCapacity);

  const handleSaveChanges = () => {
    if (activeTab === "daily") {
      onCapacityChange("daily", tempDailyCapacity);
    } else {
      onCapacityChange("weekly", tempWeeklyCapacity);
    }
  };

  // Calculate utilization color based on percentage
  const getUtilizationColor = (percentage: number) => {
    if (percentage < 50) return "bg-green-500";
    if (percentage < 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold">
              Production Capacity Management
            </CardTitle>
            <CardDescription>
              Adjust and monitor your production capacity
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock size={16} />
              <span>Current Utilization:</span>
            </div>
            <div className="w-32 h-4 relative">
              <Progress
                value={currentUtilization}
                className={getUtilizationColor(currentUtilization)}
              />
              <span className="absolute right-0 top-0 text-xs font-medium">
                {currentUtilization}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="daily"
          onValueChange={(value) => setActiveTab(value as "daily" | "weekly")}
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
            <TabsTrigger value="daily" className="flex items-center gap-1">
              <Calendar size={16} />
              Daily Capacity
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-1">
              <Users size={16} />
              Weekly Capacity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="daily-capacity">
                      Daily Production Hours
                    </Label>
                    <span className="text-sm font-medium">
                      {tempDailyCapacity} hours
                    </span>
                  </div>
                  <Slider
                    id="daily-capacity"
                    min={1}
                    max={48}
                    step={1}
                    value={[tempDailyCapacity]}
                    onValueChange={(value) => setTempDailyCapacity(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily-staff">Staff Available</Label>
                  <Input
                    id="daily-staff"
                    type="number"
                    min={1}
                    max={20}
                    defaultValue={5}
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-1">
                  <AlertCircle size={16} className="text-amber-500" />
                  Daily Capacity Insights
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Maximum Jobs Per Day:</span>
                    <span className="font-medium">
                      {Math.floor(tempDailyCapacity / 2)}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Recommended Job Size:</span>
                    <span className="font-medium">2-4 hours</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Current Day Utilization:</span>
                    <span className="font-medium">{currentUtilization}%</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="weekly-capacity">
                      Weekly Production Hours
                    </Label>
                    <span className="text-sm font-medium">
                      {tempWeeklyCapacity} hours
                    </span>
                  </div>
                  <Slider
                    id="weekly-capacity"
                    min={40}
                    max={240}
                    step={5}
                    value={[tempWeeklyCapacity]}
                    onValueChange={(value) => setTempWeeklyCapacity(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekly-staff">Weekly Staff Rotation</Label>
                  <Input
                    id="weekly-staff"
                    type="number"
                    min={3}
                    max={30}
                    defaultValue={12}
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-1">
                  <AlertCircle size={16} className="text-amber-500" />
                  Weekly Capacity Insights
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Maximum Jobs Per Week:</span>
                    <span className="font-medium">
                      {Math.floor(tempWeeklyCapacity / 4)}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Optimal Daily Distribution:</span>
                    <span className="font-medium">
                      {Math.round(tempWeeklyCapacity / 5)} hours/day
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Current Week Utilization:</span>
                    <span className="font-medium">{currentUtilization}%</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSaveChanges}>Save Capacity Changes</Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CapacityManager;
