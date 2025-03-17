import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar, Users } from "lucide-react";
import AvailabilityCalendar from "./AvailabilityCalendar";
import { toast } from "@/components/ui/use-toast";

interface SimpleProductionCalendarProps {
  initialDate?: Date;
  initialView?: "day" | "week";
}

export default function SimpleProductionCalendar({
  initialDate = new Date(),
  initialView = "week",
}: SimpleProductionCalendarProps) {
  const { schedule = [], jobs = [], staff = [] } = useAppContext?.() || {};
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState<"day" | "week" | "month">(initialView);
  const [activeTab, setActiveTab] = useState<"schedule" | "availability">("schedule");
  
  // Calculate the start and end of the current week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // End on Sunday

  // Generate array of days for the week view
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Handle calendar navigation based on the view
  const handleCalendarNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return schedule.filter((event) => {
      const eventStart = new Date(event.startTime);
      const eventStartDate = format(eventStart, "yyyy-MM-dd");
      return eventStartDate === dateStr;
    });
  };

  return (
    <div className="space-y-4 bg-white">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Production Schedule</h2>
        <Button onClick={() => {
          toast({
            title: "Schedule Job",
            description: "This feature is available in the full version.",
          });
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Job
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="schedule" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule View
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Staff Availability
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Schedule</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select
                    value={view}
                    onValueChange={(value) => setView(value as "day" | "week" | "month")}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="View" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day View</SelectItem>
                      <SelectItem value="week">Week View</SelectItem>
                      <SelectItem value="month">Month View</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCalendarNavigation('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleCalendarNavigation('next')}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-lg font-medium mt-2">
                {view === "month" && format(currentDate, "MMMM yyyy")}
                {view === "week" && `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`}
                {view === "day" && format(currentDate, "MMMM d, yyyy")}
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {weekDays.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div key={day.toString()} className="min-h-[200px]">
                      <div
                        className={`text-center p-2 font-medium rounded-t-md ${isToday ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      >
                        <div>{format(day, "EEE")}</div>
                        <div>{format(day, "d")}</div>
                      </div>

                      <div className="border-x border-b rounded-b-md p-2 h-full">
                        {dayEvents.length === 0 ? (
                          <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
                            No events
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {dayEvents.map((event) => (
                              <div 
                                key={event.id}
                                className="p-2 rounded-md bg-blue-50 border border-blue-200 text-xs"
                              >
                                <div className="font-medium truncate">
                                  {jobs.find(j => j.id === event.jobId)?.title || "Unknown Job"}
                                </div>
                                <div className="text-muted-foreground">
                                  {staff.find(s => s.id === event.staffId)?.name || "Unassigned"}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilityCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
} 