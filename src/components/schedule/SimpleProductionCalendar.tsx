import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { useAppContext } from "@/context/AppContext";

/**
 * This is a simplified placeholder component used only for the build process
 * to avoid errors with the original ProductionCalendar component.
 * The actual functionality is in the original ProductionCalendar component.
 */

/**
 * A simplified but functional calendar component used as a fallback
 * when the full ProductionCalendar component is not available.
 */
interface SimpleProductionCalendarProps {
  initialDate?: Date;
  initialView?: "day" | "week";
  initialJob?: any;
  onScheduled?: () => void;
}

export default function SimpleProductionCalendar({
  initialDate = new Date(),
  initialView = "week",
  initialJob,
  onScheduled
}: SimpleProductionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState<"day" | "week">(initialView);
  const { schedule = [], jobs = [], staff = [] } = useAppContext?.() || {};

  // Effect to handle initialJob if provided
  useEffect(() => {
    if (initialJob && onScheduled) {
      console.log("SimpleProductionCalendar handling initialJob:", initialJob.id);
      // We would normally schedule the job here
      // For now, just call onScheduled to clear the state
      onScheduled();
    }
  }, [initialJob, onScheduled]);

  // Calculate the start and end of the current week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // End on Sunday

  // Generate array of days for the week view
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Navigate to previous/next day or week
  const navigatePrevious = () => {
    if (view === "day") {
      setCurrentDate(prev => addDays(prev, -1));
    } else {
      setCurrentDate(prev => subWeeks(prev, 1));
    }
  };

  const navigateNext = () => {
    if (view === "day") {
      setCurrentDate(prev => addDays(prev, 1));
    } else {
      setCurrentDate(prev => addWeeks(prev, 1));
    }
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Filter events for the current view
  const currentEvents = schedule.filter(event => {
    const eventDate = new Date(event.startTime);
    if (view === "day") {
      return format(eventDate, "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd");
    } else {
      return eventDate >= weekStart && eventDate <= weekEnd;
    }
  });

  // Count events per day for week view
  const eventsPerDay = weekDays.map(day => {
    return {
      date: day,
      count: schedule.filter(event => {
        const eventDate = new Date(event.startTime);
        return format(eventDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
      }).length
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Production Schedule</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={navigateToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>
            {view === "day" ? (
              format(currentDate, "MMMM d, yyyy")
            ) : (
              `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
            )}
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant={view === "day" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setView("day")}
            >
              Day
            </Button>
            <Button 
              variant={view === "week" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setView("week")}
            >
              Week
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {view === "day" ? (
            <div className="space-y-4">
              {currentEvents.length > 0 ? (
                currentEvents.map((event, index) => (
                  <div key={index} className="p-3 rounded-md border bg-secondary/20">
                    <p className="font-medium">
                      {format(new Date(event.startTime), "h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
                    </p>
                    <p>
                      {jobs.find(job => job.id === event.jobId)?.title || "Untitled Job"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {staff.find(s => s.id === event.staffId)?.name || "Unassigned"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No events scheduled for this day
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => (
                <div key={index} className="border rounded-md p-2 min-h-[120px]">
                  <div className="text-center mb-2">
                    <p className="text-sm font-medium">{format(day, "EEE")}</p>
                    <p className={`text-lg ${format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ? "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}>
                      {format(day, "d")}
                    </p>
                  </div>
                  {eventsPerDay[index].count > 0 ? (
                    <div className="text-center p-1 bg-primary/20 rounded mt-2">
                      {eventsPerDay[index].count} event{eventsPerDay[index].count !== 1 ? "s" : ""}
                    </div>
                  ) : (
                    <div className="text-center text-xs text-muted-foreground">No events</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 