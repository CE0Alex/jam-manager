import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import ScheduleEventItem from "./ScheduleEventItem";
import { Link } from "react-router-dom";

export default function ScheduleCalendar() {
  const { schedule, jobs, staff } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week">("week");

  // Calculate the start and end of the current week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // End on Sunday

  // Generate array of days for the week view
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Navigate to previous/next day or week
  const navigatePrevious = () => {
    if (view === "day") {
      setCurrentDate((prev) => addDays(prev, -1));
    } else {
      setCurrentDate((prev) => addDays(prev, -7));
    }
  };

  const navigateNext = () => {
    if (view === "day") {
      setCurrentDate((prev) => addDays(prev, 1));
    } else {
      setCurrentDate((prev) => addDays(prev, 7));
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

  // Get job and staff details for an event
  const getEventDetails = (jobId: string, staffId?: string) => {
    const job = jobs.find((j) => j.id === jobId);
    const staffMember = staffId
      ? staff.find((s) => s.id === staffId)
      : undefined;

    return {
      jobTitle: job?.title || "Unknown Job",
      jobStatus: job?.status || "pending",
      staffName: staffMember?.name || "Unassigned",
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Production Schedule</h2>
        <Link to="/schedule/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Job
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Schedule</CardTitle>
            <div className="flex items-center space-x-2">
              <Select
                value={view}
                onValueChange={(value) => setView(value as "day" | "week")}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day View</SelectItem>
                  <SelectItem value="week">Week View</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={navigatePrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={navigateNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="text-lg font-medium mt-2">
            {view === "day"
              ? format(currentDate, "MMMM d, yyyy")
              : `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`}
          </div>
        </CardHeader>

        <CardContent>
          {view === "day" ? (
            <div className="space-y-4">
              <div className="text-lg font-medium">
                {format(currentDate, "EEEE")}
              </div>

              <div className="border rounded-md p-4 min-h-[400px]">
                {getEventsForDay(currentDate).length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No events scheduled for this day
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getEventsForDay(currentDate).map((event) => {
                      const { jobTitle, jobStatus, staffName } =
                        getEventDetails(event.jobId, event.staffId);
                      return (
                        <ScheduleEventItem
                          key={event.id}
                          event={event}
                          jobTitle={jobTitle}
                          jobStatus={jobStatus}
                          staffName={staffName}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());

                return (
                  <div key={day.toString()} className="min-h-[400px]">
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
                          {dayEvents.map((event) => {
                            const { jobTitle, jobStatus, staffName } =
                              getEventDetails(event.jobId, event.staffId);
                            return (
                              <ScheduleEventItem
                                key={event.id}
                                event={event}
                                jobTitle={jobTitle}
                                jobStatus={jobStatus}
                                staffName={staffName}
                                compact
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
