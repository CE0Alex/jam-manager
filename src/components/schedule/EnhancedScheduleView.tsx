import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Calendar, Sliders, Wand2, Plus, Layers } from "lucide-react";
import EnhancedCalendar from "./EnhancedCalendar";
import ResourceCapacityPlanner from "./ResourceCapacityPlanner";
import MachineCapacityView from "./MachineCapacityView";
import AutoScheduleDialog from "./AutoScheduleDialog";
import BulkScheduleActions from "./BulkScheduleActions";

export default function EnhancedScheduleView() {
  const navigate = useNavigate();
  const { schedule, jobs, autoScheduleJob } = useAppContext();
  const [activeTab, setActiveTab] = useState<
    "calendar" | "resources" | "machines"
  >("calendar");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(
    null,
  );

  const handleEventSelect = (eventId: string, isMultiSelect: boolean) => {
    if (isMultiSelect) {
      // Toggle selection
      setSelectedEvents((prev) =>
        prev.includes(eventId)
          ? prev.filter((id) => id !== eventId)
          : [...prev, eventId],
      );
    } else {
      // Single selection
      setSelectedEvents([eventId]);
    }
  };

  const handleClearSelection = () => {
    setSelectedEvents([]);
  };

  const handleMachineSelect = (machineId: string) => {
    setSelectedMachineId(machineId);
    setActiveTab("calendar");
  };

  const handleScheduleRefresh = () => {
    // This would typically refresh data from an API
    // For now, we'll just clear selections
    setSelectedEvents([]);
    setSelectedMachineId(null);
  };

  // Auto-schedule unscheduled jobs when component mounts
  useEffect(() => {
    const unscheduledJobs = jobs.filter((job) => {
      // Check if job is not completed or cancelled
      if (job.status === "completed" || job.status === "cancelled")
        return false;

      // Check if job is already scheduled
      const isScheduled = schedule.some((event) => event.jobId === job.id);
      return !isScheduled;
    });

    // Auto-schedule each unscheduled job
    unscheduledJobs.forEach((job) => {
      autoScheduleJob(job.id);
    });
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6 bg-background">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Enhanced Production Schedule
        </h1>
        <p className="text-muted-foreground">
          Manage your production schedule with drag-and-drop, resource planning,
          and auto-scheduling
        </p>
      </div>

      <div className="flex justify-between items-center">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "calendar" | "resources" | "machines")
          }
          className="w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="flex items-center gap-2"
              >
                <Sliders className="h-4 w-4" />
                Resource Planning
              </TabsTrigger>
              <TabsTrigger value="machines" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Machine Capacity
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              <BulkScheduleActions
                selectedEvents={selectedEvents}
                onClearSelection={handleClearSelection}
                onEventsUpdated={handleScheduleRefresh}
              />

              <AutoScheduleDialog onScheduleSuccess={handleScheduleRefresh} />

              <Button onClick={() => navigate("/schedule/new")}>
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </div>
          </div>
        </Tabs>
      </div>

      <TabsContent value="calendar" className="space-y-4 mt-0">
        <EnhancedCalendar
          showResourceView={true}
          onEventSelect={handleEventSelect}
          selectedEvents={selectedEvents}
          selectedMachineId={selectedMachineId}
        />
      </TabsContent>

      <TabsContent value="resources" className="space-y-4 mt-0">
        <ResourceCapacityPlanner />
      </TabsContent>

      <TabsContent value="machines" className="space-y-4 mt-0">
        <MachineCapacityView onMachineSelect={handleMachineSelect} />
      </TabsContent>
    </div>
  );
}
