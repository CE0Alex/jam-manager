import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  format,
  addDays,
  subDays,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  isSameDay,
  isSameMonth,
  getDay,
  getDate,
  getMonth,
  getYear,
  parseISO,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  FileText,
  Grid3X3,
  List,
  Users,
} from "lucide-react";
import { Job, ScheduleEvent } from "@/types";

type CalendarView = "month" | "week" | "day" | "agenda";

export default function DashboardCalendar() {
  // Force component to render with a key
  React.useEffect(() => {
    console.log("DashboardCalendar mounted");
  }, []);
  const navigate = useNavigate();
  const { jobs, schedule, staff, getJobById } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(
    null,
  );
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (selectedEvent) {
      const job = getJobById(selectedEvent.jobId);
      if (job) {
        setSelectedJob(job);
      }
    }
  }, [selectedEvent, getJobById]);

  const navigatePrevious = () => {
    switch (view) {
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(subDays(currentDate, 7));
        break;
      case "day":
        setCurrentDate(subDays(currentDate, 1));
        break;
      default:
        setCurrentDate(subDays(currentDate, 7));
    }
  };

  const navigateNext = () => {
    switch (view) {
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addDays(currentDate, 7));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
      default:
        setCurrentDate(addDays(currentDate, 7));
    }
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return schedule.filter((event) => {
      const eventStart = new Date(event.startTime);
      const eventStartDate = format(eventStart, "yyyy-MM-dd");
      return eventStartDate === dateStr;
    });
  };

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

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);

    // Also fetch the job details right away
    const job = getJobById(event.jobId);
    if (job) {
      setSelectedJob(job);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-blue-100 border-blue-300 text-blue-800",
      in_progress: "bg-yellow-100 border-yellow-300 text-yellow-800",
      review: "bg-purple-100 border-purple-300 text-purple-800",
      completed: "bg-green-100 border-green-300 text-green-800",
      cancelled: "bg-red-100 border-red-300 text-red-800",
    };
    return statusColors[status] || statusColors.pending;
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "d";
    const days = [];
    const rows = [];

    // Create header row with day names
    const dayNames = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const daysHeader = dayNames.map((day) => (
      <div key={day} className="text-center p-2 font-medium">
        {day}
      </div>
    ));

    // Create calendar grid
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayEvents = getEventsForDay(day);
        const isToday = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, monthStart);

        weekDays.push(
          <div
            key={day.toString()}
            className={`min-h-[100px] border p-1 ${isToday ? "bg-blue-50" : ""} ${!isCurrentMonth ? "bg-gray-100 text-gray-400" : ""}`}
          >
            <div className="text-right mb-1">
              <span
                className={`text-sm ${isToday ? "bg-blue-500 text-white rounded-full w-6 h-6 inline-block text-center" : ""}`}
              >
                {formattedDate}
              </span>
            </div>
            <div className="overflow-y-auto max-h-[80px]">
              {dayEvents.map((event) => {
                const { jobTitle, jobStatus } = getEventDetails(
                  event.jobId,
                  event.staffId,
                );
                return (
                  <div
                    key={event.id}
                    className={`text-xs p-1 mb-1 rounded cursor-pointer truncate ${getStatusColor(jobStatus)}`}
                    onClick={() => handleEventClick(event)}
                  >
                    {format(parseISO(event.startTime), "h:mm a")} - {jobTitle}
                  </div>
                );
              })}
            </div>
          </div>,
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={rows.length} className="grid grid-cols-7 gap-0">
          {weekDays}
        </div>,
      );
    }

    return (
      <div className="bg-white rounded-md">
        <div className="grid grid-cols-7 gap-0 border-b">{daysHeader}</div>
        {rows}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Time slots from 8:00 to 18:00
    const timeSlots = Array.from({ length: 11 }, (_, i) => i + 8);

    return (
      <div className="bg-white rounded-md">
        <div className="grid grid-cols-8 border-b">
          <div className="p-2 border-r">Time</div>
          {days.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toString()}
                className={`text-center p-2 ${isToday ? "bg-blue-50 font-bold" : ""}`}
              >
                <div>{format(day, "EEE")}</div>
                <div>{format(day, "MMM d")}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-8">
          <div className="border-r">
            {timeSlots.map((hour) => (
              <div
                key={hour}
                className="h-20 border-b p-1 text-xs text-right pr-2"
              >
                {hour}:00
              </div>
            ))}
          </div>

          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div key={day.toString()} className="relative border-r">
                {timeSlots.map((hour) => (
                  <div key={hour} className="h-20 border-b"></div>
                ))}

                {dayEvents.map((event) => {
                  const startTime = new Date(event.startTime);
                  const endTime = new Date(event.endTime);
                  const startHour =
                    startTime.getHours() + startTime.getMinutes() / 60;
                  const endHour =
                    endTime.getHours() + endTime.getMinutes() / 60;
                  const top = (startHour - 8) * 80; // 80px per hour (20px height * 4 quarters)
                  const height = (endHour - startHour) * 80;
                  const { jobTitle, jobStatus } = getEventDetails(
                    event.jobId,
                    event.staffId,
                  );

                  return (
                    <div
                      key={event.id}
                      className={`absolute left-0 right-0 mx-1 p-1 text-xs rounded overflow-hidden ${getStatusColor(jobStatus)}`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="font-medium truncate">{jobTitle}</div>
                      <div className="truncate">
                        {format(startTime, "HH:mm")} -{" "}
                        {format(endTime, "HH:mm")}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    // Time slots from 8:00 to 18:00
    const timeSlots = Array.from({ length: 11 }, (_, i) => i + 8);
    const dayEvents = getEventsForDay(currentDate);

    return (
      <div className="bg-white rounded-md">
        <div className="grid grid-cols-[100px_1fr] border-b">
          <div className="p-2 border-r">Time</div>
          <div className="text-center p-2 font-bold">
            <div>{format(currentDate, "EEEE")}</div>
            <div>{format(currentDate, "MMMM d, yyyy")}</div>
          </div>
        </div>

        <div className="grid grid-cols-[100px_1fr]">
          <div className="border-r">
            {timeSlots.map((hour) => (
              <div key={hour} className="h-24 border-b p-1 text-right pr-2">
                {hour}:00
              </div>
            ))}
          </div>

          <div className="relative">
            {timeSlots.map((hour) => (
              <div key={hour} className="h-24 border-b"></div>
            ))}

            {dayEvents.map((event) => {
              const startTime = new Date(event.startTime);
              const endTime = new Date(event.endTime);
              const startHour =
                startTime.getHours() + startTime.getMinutes() / 60;
              const endHour = endTime.getHours() + endTime.getMinutes() / 60;
              const top = (startHour - 8) * 96; // 96px per hour (24px height * 4 quarters)
              const height = (endHour - startHour) * 96;
              const { jobTitle, jobStatus, staffName } = getEventDetails(
                event.jobId,
                event.staffId,
              );

              return (
                <div
                  key={event.id}
                  className={`absolute left-0 right-0 mx-2 p-2 rounded overflow-hidden ${getStatusColor(jobStatus)}`}
                  style={{ top: `${top}px`, height: `${height}px` }}
                  onClick={() => handleEventClick(event)}
                >
                  <div className="font-medium">{jobTitle}</div>
                  <div className="text-sm">
                    {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                  </div>
                  <div className="text-sm mt-1 flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {staffName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    // Get events for the next 14 days
    const startDate = currentDate;
    const endDate = addDays(currentDate, 13);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    // Group events by date
    const eventsByDate: Record<string, ScheduleEvent[]> = {};
    dateRange.forEach((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      eventsByDate[dateStr] = getEventsForDay(date);
    });

    return (
      <div className="bg-white rounded-md p-4 space-y-6">
        <h2 className="text-xl font-bold mb-4">Upcoming Schedule (14 days)</h2>
        {dateRange.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const events = eventsByDate[dateStr];
          const isToday = isSameDay(date, new Date());

          if (events.length === 0) return null;

          return (
            <div key={dateStr} className="space-y-2">
              <h3
                className={`text-lg font-medium ${isToday ? "text-blue-600" : ""}`}
              >
                {isToday ? "Today - " : ""}
                {format(date, "EEEE, MMMM d, yyyy")}
              </h3>
              <div className="space-y-2 pl-4">
                {events.map((event) => {
                  const { jobTitle, jobStatus, staffName } = getEventDetails(
                    event.jobId,
                    event.staffId,
                  );
                  const startTime = new Date(event.startTime);
                  const endTime = new Date(event.endTime);

                  return (
                    <div
                      key={event.id}
                      className={`p-3 rounded-md cursor-pointer ${getStatusColor(jobStatus)}`}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{jobTitle}</span>
                        <span>
                          {format(startTime, "HH:mm")} -{" "}
                          {format(endTime, "HH:mm")}
                        </span>
                      </div>
                      <div className="mt-1 text-sm flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {staffName}
                      </div>
                      {event.notes && (
                        <div className="mt-1 text-sm italic">{event.notes}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Production Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Select
              value={view}
              onValueChange={(value) => setView(value as CalendarView)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month" className="flex items-center">
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Month
                </SelectItem>
                <SelectItem value="week" className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Week
                </SelectItem>
                <SelectItem value="day" className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Day
                </SelectItem>
                <SelectItem value="agenda" className="flex items-center">
                  <List className="h-4 w-4 mr-2" />
                  Agenda
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-1">
              <Button variant="outline" size="icon" onClick={navigatePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={navigateToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={navigateNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="text-lg font-medium mt-2">
          {view === "month" && format(currentDate, "MMMM yyyy")}
          {view === "week" && (
            <>
              {format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d")} -{" "}
              {format(
                endOfWeek(currentDate, { weekStartsOn: 1 }),
                "MMM d, yyyy",
              )}
            </>
          )}
          {view === "day" && format(currentDate, "MMMM d, yyyy")}
          {view === "agenda" && (
            <>
              {format(currentDate, "MMM d")} -{" "}
              {format(addDays(currentDate, 13), "MMM d, yyyy")}
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="overflow-auto h-[500px]">
        {view === "month" && renderMonthView()}
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}
        {view === "agenda" && renderAgendaView()}
      </CardContent>

      {/* Event Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected job and schedule.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Job Title
                  </h3>
                  <p className="font-medium">{selectedJob.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Client
                  </h3>
                  <p>{selectedJob.client}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Description
                </h3>
                <p>{selectedJob.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Schedule
                  </h3>
                  <p>
                    {format(new Date(selectedEvent.startTime), "MMMM d, yyyy")}
                    <br />
                    {format(new Date(selectedEvent.startTime), "h:mm a")} -{" "}
                    {format(new Date(selectedEvent.endTime), "h:mm a")}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </h3>
                  <div
                    className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(selectedJob.status)}`}
                  >
                    {selectedJob.status.replace("_", " ").toUpperCase()}
                  </div>
                </div>
              </div>

              {selectedEvent.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Notes
                  </h3>
                  <p>{selectedEvent.notes}</p>
                </div>
              )}

              {selectedJob.fileUrl && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Attached File
                  </h3>
                  <a
                    href={selectedJob.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View File
                  </a>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailOpen(false);
                    // Navigate to the job details page
                    navigate(`/jobs/${selectedJob.id}`);
                  }}
                >
                  View Full Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
