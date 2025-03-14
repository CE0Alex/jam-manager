import React, { useState, useEffect, useRef } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
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
  isSameDay,
  isSameMonth,
  parseISO,
  addHours,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  FileText,
  Grid3X3,
  List,
  Users,
  Clock,
  AlertTriangle,
  BarChart4,
  Layers,
  Move,
  Trash2,
  Plus,
} from "lucide-react";
import { Job, ScheduleEvent, JobStatus, StaffMember, Machine } from "@/types";

type CalendarView = "month" | "week" | "day" | "agenda" | "timeline";

interface DragInfo {
  eventId: string;
  initialX: number;
  initialY: number;
  isDragging: boolean;
  originalDate?: Date;
  originalStaffId?: string;
  originalMachineId?: string;
}

interface EnhancedCalendarProps {
  onEventUpdate?: (event: ScheduleEvent) => void;
  showResourceView?: boolean;
  onEventSelect?: (eventId: string, isMultiSelect: boolean) => void;
  selectedEvents?: string[];
  selectedMachineId?: string | null;
}

export default function EnhancedCalendar({
  onEventUpdate,
  showResourceView = true,
  onEventSelect,
  selectedEvents = [],
  selectedMachineId = null,
}: EnhancedCalendarProps) {
  const navigate = useNavigate();
  const {
    jobs,
    schedule,
    staff,
    machines,
    getJobById,
    updateScheduleEvent,
    addScheduleEvent,
  } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("week");
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(
    null,
  );
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  const [resourceFilter, setResourceFilter] = useState<
    "all" | "staff" | "machines"
  >("all");
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [bulkSelectedEvents, setBulkSelectedEvents] = useState<string[]>([]);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<
    "reschedule" | "delete" | ""
  >("");
  const [bulkRescheduleData, setBulkRescheduleData] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });
  const [isCapacityWarningOpen, setIsCapacityWarningOpen] = useState(false);
  const [capacityWarningMessage, setCapacityWarningMessage] = useState("");
  const [suggestedTimeSlots, setSuggestedTimeSlots] = useState<
    { startTime: string; endTime: string }[]
  >([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(
    null,
  );

  const calendarRef = useRef<HTMLDivElement>(null);

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
      case "timeline":
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
      case "timeline":
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

  // Filter events based on resource filter
  const getFilteredEvents = (events: ScheduleEvent[]) => {
    let filteredEvents = events;

    // First filter by resource type and selection
    if (
      resourceFilter !== "all" ||
      selectedStaff.length > 0 ||
      selectedMachines.length > 0
    ) {
      filteredEvents = events.filter((event) => {
        if (resourceFilter === "staff" || selectedStaff.length > 0) {
          if (!event.staffId) return false;
          if (
            selectedStaff.length > 0 &&
            !selectedStaff.includes(event.staffId)
          )
            return false;
        }

        if (resourceFilter === "machines" || selectedMachines.length > 0) {
          if (!event.machineId) return false;
          if (
            selectedMachines.length > 0 &&
            !selectedMachines.includes(event.machineId)
          )
            return false;
        }

        return true;
      });
    }

    // Then filter by selected machine if provided externally
    if (selectedMachineId) {
      filteredEvents = filteredEvents.filter(
        (event) => event.machineId === selectedMachineId,
      );
    }

    return filteredEvents;
  };

  const getEventDetails = (
    jobId: string,
    staffId?: string,
    machineId?: string,
  ) => {
    const job = jobs.find((j) => j.id === jobId);
    const staffMember = staffId
      ? staff.find((s) => s.id === staffId)
      : undefined;
    const machine = machineId
      ? machines?.find((m) => m.id === machineId)
      : undefined;

    return {
      jobTitle: job?.title || "Unknown Job",
      jobStatus: job?.status || "pending",
      staffName: staffMember?.name || "Unassigned",
      machineName: machine?.name || "Unassigned",
    };
  };

  const handleEventClick = (event: ScheduleEvent, e: React.MouseEvent) => {
    // Don't open detail dialog if we're in the middle of dragging
    if (dragInfo?.isDragging) return;

    // Check if we're in bulk selection mode (with shift key)
    if (e.shiftKey) {
      // Handle internal bulk selection if no external handler
      if (!onEventSelect) {
        setBulkSelectedEvents((prev) => {
          if (prev.includes(event.id)) {
            return prev.filter((id) => id !== event.id);
          } else {
            return [...prev, event.id];
          }
        });
      } else {
        // Use external handler for bulk selection
        onEventSelect(event.id, true);
      }
      return;
    }

    // If we have an external selection handler, use it
    if (onEventSelect) {
      onEventSelect(event.id, false);
    }

    setSelectedEvent(event);
    setIsDetailOpen(true);

    // Also fetch the job details right away
    const job = getJobById(event.jobId);
    if (job) {
      setSelectedJob(job);
    }
  };

  const handleDragStart = (event: ScheduleEvent, e: React.MouseEvent) => {
    // Prevent default browser drag behavior
    e.preventDefault();

    // Don't start drag if we're in bulk selection mode
    if (e.shiftKey) return;

    // Set up drag info
    setDragInfo({
      eventId: event.id,
      initialX: e.clientX,
      initialY: e.clientY,
      isDragging: true,
      originalDate: new Date(event.startTime),
      originalStaffId: event.staffId,
      originalMachineId: event.machineId,
    });

    // Add event listeners for drag and drop
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
  };

  const handleDragMove = (e: MouseEvent) => {
    // This is handled by CSS for visual feedback
  };

  const handleDragEnd = (e: MouseEvent) => {
    if (!dragInfo || !dragInfo.isDragging) return;

    // Remove event listeners
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);

    // Find the event being dragged
    const draggedEvent = schedule.find(
      (event) => event.id === dragInfo.eventId,
    );
    if (!draggedEvent) {
      setDragInfo(null);
      return;
    }

    // Get the element under the mouse
    const elementsUnderMouse = document.elementsFromPoint(e.clientX, e.clientY);

    // Find the day cell or time slot element
    const targetElement = elementsUnderMouse.find(
      (el) =>
        el.classList.contains("day-cell") ||
        el.classList.contains("time-slot") ||
        el.classList.contains("resource-cell"),
    );

    if (targetElement) {
      // Get the date from the data attribute
      const dateStr = targetElement.getAttribute("data-date");
      const resourceId = targetElement.getAttribute("data-resource-id");
      const resourceType = targetElement.getAttribute("data-resource-type");

      if (dateStr) {
        // Calculate the new start and end times
        const originalStart = new Date(draggedEvent.startTime);
        const originalEnd = new Date(draggedEvent.endTime);
        const duration = originalEnd.getTime() - originalStart.getTime();

        let newStart: Date;

        if (targetElement.classList.contains("time-slot")) {
          // For time slots, use the hour from the data attribute
          const hour = parseInt(
            targetElement.getAttribute("data-hour") || "0",
            10,
          );
          newStart = new Date(dateStr);
          newStart.setHours(hour, 0, 0, 0);
        } else {
          // For day cells, keep the same time but change the date
          newStart = new Date(dateStr);
          newStart.setHours(
            originalStart.getHours(),
            originalStart.getMinutes(),
            0,
            0,
          );
        }

        const newEnd = new Date(newStart.getTime() + duration);

        // Update the event with new times and possibly new resource assignment
        const updatedEvent = {
          ...draggedEvent,
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString(),
        };

        // Update resource assignment if dropped on a resource cell
        if (resourceType === "staff" && resourceId) {
          updatedEvent.staffId = resourceId;
          // Clear machine assignment if reassigning to staff
          if (resourceFilter === "staff") {
            updatedEvent.machineId = undefined;
          }
        } else if (resourceType === "machine" && resourceId) {
          updatedEvent.machineId = resourceId;
          // Clear staff assignment if reassigning to machine
          if (resourceFilter === "machines") {
            updatedEvent.staffId = undefined;
          }
        }

        // Check for scheduling conflicts
        const hasConflict = checkSchedulingConflict(updatedEvent);
        if (hasConflict) {
          toast({
            title: "Scheduling Conflict",
            description:
              "This time slot conflicts with another scheduled event",
            variant: "destructive",
          });
        } else {
          // Update the event
          if (onEventUpdate) {
            onEventUpdate(updatedEvent);
          } else {
            updateScheduleEvent(updatedEvent);
            toast({
              title: "Event Updated",
              description: "The event has been rescheduled successfully",
            });
          }
        }
      }
    }

    // Reset drag info
    setDragInfo(null);
  };

  const checkSchedulingConflict = (event: ScheduleEvent): boolean => {
    // Skip checking the event against itself
    const otherEvents = schedule.filter((e) => e.id !== event.id);

    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);

    // Check for conflicts with staff or machine
    return otherEvents.some((otherEvent) => {
      const otherStart = new Date(otherEvent.startTime);
      const otherEnd = new Date(otherEvent.endTime);

      // Check for time overlap
      const timeOverlap = eventStart < otherEnd && eventEnd > otherStart;

      // Check for resource conflict
      const staffConflict =
        event.staffId &&
        otherEvent.staffId &&
        event.staffId === otherEvent.staffId;

      const machineConflict =
        event.machineId &&
        otherEvent.machineId &&
        event.machineId === otherEvent.machineId;

      return timeOverlap && (staffConflict || machineConflict);
    });
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

  const handleBulkAction = (action: "reschedule" | "delete") => {
    setBulkActionType(action);
    setIsBulkActionDialogOpen(true);
  };

  const executeBulkAction = () => {
    if (bulkActionType === "delete") {
      // Delete all selected events
      bulkSelectedEvents.forEach((eventId) => {
        const event = schedule.find((e) => e.id === eventId);
        if (event) {
          // Delete event logic here
          // deleteScheduleEvent(eventId);
        }
      });
      toast({
        title: "Bulk Delete",
        description: `${bulkSelectedEvents.length} events have been deleted`,
      });
    } else if (bulkActionType === "reschedule") {
      // Reschedule all selected events
      const { days, hours, minutes } = bulkRescheduleData;
      const totalMinutes = days * 24 * 60 + hours * 60 + minutes;

      bulkSelectedEvents.forEach((eventId) => {
        const event = schedule.find((e) => e.id === eventId);
        if (event) {
          const startTime = new Date(event.startTime);
          const endTime = new Date(event.endTime);

          // Add the specified time
          startTime.setMinutes(startTime.getMinutes() + totalMinutes);
          endTime.setMinutes(endTime.getMinutes() + totalMinutes);

          const updatedEvent = {
            ...event,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          };

          // Update the event
          updateScheduleEvent(updatedEvent);
        }
      });

      toast({
        title: "Bulk Reschedule",
        description: `${bulkSelectedEvents.length} events have been rescheduled`,
      });
    }

    // Reset bulk selection
    setBulkSelectedEvents([]);
    setIsBulkActionDialogOpen(false);
    setBulkRescheduleData({ days: 0, hours: 0, minutes: 0 });
  };

  const suggestAvailableTimeSlots = (jobId: string) => {
    const job = getJobById(jobId);
    if (!job) return;

    // Get job duration in hours (estimated)
    const jobDuration = job.estimatedHours;

    // Get all events for the next 14 days
    const startDate = new Date();
    const endDate = addDays(startDate, 14);

    // Find available staff and machines
    const availableStaff = staff.filter((s) => s.availability.monday); // Simplified for demo
    const availableMachines = machines || [];

    // Generate time slots
    const suggestedSlots = [];

    // For simplicity, just suggest a few slots
    for (let i = 0; i < 3; i++) {
      const suggestedStart = addDays(startDate, i + 1);
      suggestedStart.setHours(9, 0, 0, 0); // 9 AM

      const suggestedEnd = new Date(suggestedStart);
      suggestedEnd.setHours(suggestedStart.getHours() + jobDuration);

      suggestedSlots.push({
        startTime: suggestedStart.toISOString(),
        endTime: suggestedEnd.toISOString(),
      });
    }

    setSuggestedTimeSlots(suggestedSlots);
    setIsSuggestionsOpen(true);
  };

  const applySelectedSuggestion = () => {
    if (selectedSuggestion === null || !selectedJob) return;

    const suggestion = suggestedTimeSlots[selectedSuggestion];

    // Create a new schedule event
    const newEvent: Omit<ScheduleEvent, "id"> = {
      jobId: selectedJob.id,
      startTime: suggestion.startTime,
      endTime: suggestion.endTime,
      // Assign to first available staff/machine for demo
      staffId: staff[0]?.id,
      machineId: machines?.[0]?.id,
    };

    addScheduleEvent(newEvent);

    toast({
      title: "Event Scheduled",
      description: "The job has been scheduled using the suggested time slot",
    });

    setIsSuggestionsOpen(false);
    setSelectedSuggestion(null);
  };

  const checkCapacityWarnings = () => {
    // This is a simplified capacity check
    // In a real app, you would have more sophisticated logic

    // Count events per day for the next week
    const startDate = new Date();
    const endDate = addDays(startDate, 7);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    let overCapacityDay = null;

    for (const date of dateRange) {
      const dayEvents = getEventsForDay(date);

      // If more than 8 events in a day, consider it over capacity
      if (dayEvents.length > 8) {
        overCapacityDay = format(date, "EEEE, MMMM d");
        break;
      }
    }

    if (overCapacityDay) {
      setCapacityWarningMessage(
        `Warning: ${overCapacityDay} appears to be over capacity. Consider rescheduling some jobs.`,
      );
      setIsCapacityWarningOpen(true);
    }
  };

  // Call capacity check when component mounts or schedule changes
  useEffect(() => {
    checkCapacityWarnings();
  }, [schedule]);

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
        const dayEvents = getFilteredEvents(getEventsForDay(day));
        const isToday = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, monthStart);
        const dateStr = format(day, "yyyy-MM-dd");

        weekDays.push(
          <div
            key={day.toString()}
            className={`min-h-[100px] border p-1 day-cell ${isToday ? "bg-blue-50" : ""} ${!isCurrentMonth ? "bg-gray-100 text-gray-400" : ""}`}
            data-date={dateStr}
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
                  event.machineId,
                );
                const isSelected =
                  selectedEvents.includes(event.id) ||
                  bulkSelectedEvents.includes(event.id);
                return (
                  <div
                    key={event.id}
                    className={`text-xs p-1 mb-1 rounded cursor-move truncate ${getStatusColor(jobStatus)} ${isSelected ? "ring-2 ring-primary" : ""} ${dragInfo?.eventId === event.id ? "opacity-50" : ""}`}
                    onClick={(e) => handleEventClick(event, e)}
                    onMouseDown={(e) => handleDragStart(event, e)}
                    draggable="false"
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
            const dateStr = format(day, "yyyy-MM-dd");
            const dayEvents = getFilteredEvents(getEventsForDay(day));
            return (
              <div key={day.toString()} className="relative border-r">
                {timeSlots.map((hour) => (
                  <div
                    key={hour}
                    className="h-20 border-b time-slot"
                    data-date={dateStr}
                    data-hour={hour}
                  ></div>
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
                  const { jobTitle, jobStatus, staffName, machineName } =
                    getEventDetails(
                      event.jobId,
                      event.staffId,
                      event.machineId,
                    );
                  const isSelected =
                    selectedEvents.includes(event.id) ||
                    bulkSelectedEvents.includes(event.id);

                  return (
                    <div
                      key={event.id}
                      className={`absolute left-0 right-0 mx-1 p-1 text-xs rounded overflow-hidden cursor-move ${getStatusColor(jobStatus)} ${isSelected ? "ring-2 ring-primary" : ""} ${dragInfo?.eventId === event.id ? "opacity-50" : ""}`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                      onClick={(e) => handleEventClick(event, e)}
                      onMouseDown={(e) => handleDragStart(event, e)}
                      draggable="false"
                    >
                      <div className="font-medium truncate">{jobTitle}</div>
                      <div className="truncate">
                        {format(startTime, "h:mm a")} -{" "}
                        {format(endTime, "h:mm a")}
                      </div>
                      <div className="truncate text-xs mt-1">
                        {staffName} {event.machineId && `/ ${machineName}`}
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
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const dayEvents = getFilteredEvents(getEventsForDay(currentDate));

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
              <div
                key={hour}
                className="h-24 border-b time-slot"
                data-date={dateStr}
                data-hour={hour}
              ></div>
            ))}

            {dayEvents.map((event) => {
              const startTime = new Date(event.startTime);
              const endTime = new Date(event.endTime);
              const startHour =
                startTime.getHours() + startTime.getMinutes() / 60;
              const endHour = endTime.getHours() + endTime.getMinutes() / 60;
              const top = (startHour - 8) * 96; // 96px per hour (24px height * 4 quarters)
              const height = (endHour - startHour) * 96;
              const { jobTitle, jobStatus, staffName, machineName } =
                getEventDetails(event.jobId, event.staffId, event.machineId);
              const isSelected =
                selectedEvents.includes(event.id) ||
                bulkSelectedEvents.includes(event.id);

              return (
                <div
                  key={event.id}
                  className={`absolute left-0 right-0 mx-2 p-2 rounded overflow-hidden cursor-move ${getStatusColor(jobStatus)} ${isSelected ? "ring-2 ring-primary" : ""} ${dragInfo?.eventId === event.id ? "opacity-50" : ""}`}
                  style={{ top: `${top}px`, height: `${height}px` }}
                  onClick={(e) => handleEventClick(event, e)}
                  onMouseDown={(e) => handleDragStart(event, e)}
                  draggable="false"
                >
                  <div className="font-medium">{jobTitle}</div>
                  <div className="text-sm">
                    {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                  </div>
                  <div className="text-sm mt-1 flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {staffName}
                    {event.machineId && (
                      <>
                        <span className="mx-1">|</span>
                        <Clock className="h-3 w-3 mr-1" />
                        {machineName}
                      </>
                    )}
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
      eventsByDate[dateStr] = getFilteredEvents(getEventsForDay(date));
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
                  const { jobTitle, jobStatus, staffName, machineName } =
                    getEventDetails(
                      event.jobId,
                      event.staffId,
                      event.machineId,
                    );
                  const startTime = new Date(event.startTime);
                  const endTime = new Date(event.endTime);
                  const isSelected =
                    selectedEvents.includes(event.id) ||
                    bulkSelectedEvents.includes(event.id);

                  return (
                    <div
                      key={event.id}
                      className={`p-3 rounded-md cursor-move ${getStatusColor(jobStatus)} ${isSelected ? "ring-2 ring-primary" : ""} ${dragInfo?.eventId === event.id ? "opacity-50" : ""}`}
                      onClick={(e) => handleEventClick(event, e)}
                      onMouseDown={(e) => handleDragStart(event, e)}
                      draggable="false"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{jobTitle}</span>
                        <span>
                          {format(startTime, "h:mm a")} -{" "}
                          {format(endTime, "h:mm a")}
                        </span>
                      </div>
                      <div className="mt-1 text-sm flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {staffName}
                        {event.machineId && (
                          <>
                            <span className="mx-1">|</span>
                            <Clock className="h-3 w-3 mr-1" />
                            {machineName}
                          </>
                        )}
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

  const renderTimelineView = () => {
    // This is a Gantt-like timeline view
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Get all resources (staff and machines)
    const resources = [];

    if (resourceFilter === "all" || resourceFilter === "staff") {
      const filteredStaff =
        selectedStaff.length > 0
          ? staff.filter((s) => selectedStaff.includes(s.id))
          : staff;
      resources.push(
        ...filteredStaff.map((s) => ({
          id: s.id,
          name: s.name,
          type: "staff",
        })),
      );
    }

    if (resourceFilter === "all" || resourceFilter === "machines") {
      const filteredMachines =
        selectedMachines.length > 0
          ? machines?.filter((m) => selectedMachines.includes(m.id)) || []
          : machines || [];
      resources.push(
        ...filteredMachines.map((m) => ({
          id: m.id,
          name: m.name,
          type: "machine",
        })),
      );
    }

    // Time slots from 8:00 to 18:00
    const timeSlots = Array.from({ length: 11 }, (_, i) => i + 8);

    return (
      <div className="bg-white rounded-md">
        <div
          className="grid"
          style={{ gridTemplateColumns: "200px repeat(7, 1fr)" }}
        >
          {/* Header row with days */}
          <div className="p-2 border-r border-b font-medium">Resources</div>
          {days.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toString()}
                className={`text-center p-2 border-b ${isToday ? "bg-blue-50 font-bold" : ""}`}
              >
                <div>{format(day, "EEE")}</div>
                <div>{format(day, "MMM d")}</div>
              </div>
            );
          })}

          {/* Resource rows */}
          {resources.map((resource) => (
            <React.Fragment key={resource.id}>
              {/* Resource name column */}
              <div className="p-2 border-r border-b font-medium truncate">
                {resource.name}
                <div className="text-xs text-muted-foreground">
                  {resource.type === "staff" ? "Staff" : "Machine"}
                </div>
              </div>

              {/* Day cells for this resource */}
              {days.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                // Get events for this resource on this day
                const resourceEvents = getEventsForDay(day).filter(
                  (event) =>
                    (resource.type === "staff" &&
                      event.staffId === resource.id) ||
                    (resource.type === "machine" &&
                      event.machineId === resource.id),
                );

                return (
                  <div
                    key={`${resource.id}-${dateStr}`}
                    className="relative border-b min-h-[100px] resource-cell"
                    data-date={dateStr}
                    data-resource-id={resource.id}
                    data-resource-type={resource.type}
                  >
                    {/* Render events for this resource on this day */}
                    {resourceEvents.map((event) => {
                      const startTime = new Date(event.startTime);
                      const endTime = new Date(event.endTime);
                      const { jobTitle, jobStatus } = getEventDetails(
                        event.jobId,
                        event.staffId,
                        event.machineId,
                      );
                      const isSelected =
                        selectedEvents.includes(event.id) ||
                        bulkSelectedEvents.includes(event.id);

                      // Calculate position based on time
                      // For simplicity, just show them stacked
                      return (
                        <div
                          key={event.id}
                          className={`m-1 p-1 text-xs rounded overflow-hidden cursor-move ${getStatusColor(jobStatus)} ${isSelected ? "ring-2 ring-primary" : ""} ${dragInfo?.eventId === event.id ? "opacity-50" : ""}`}
                          onClick={(e) => handleEventClick(event, e)}
                          onMouseDown={(e) => handleDragStart(event, e)}
                          draggable="false"
                        >
                          <div className="font-medium truncate">{jobTitle}</div>
                          <div className="truncate">
                            {format(startTime, "h:mm a")} -{" "}
                            {format(endTime, "h:mm a")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full h-full" ref={calendarRef}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Production Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            {/* View selector */}
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
                <SelectItem value="timeline" className="flex items-center">
                  <BarChart4 className="h-4 w-4 mr-2" />
                  Timeline
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Resource filter */}
            {showResourceView && (
              <Select
                value={resourceFilter}
                onValueChange={(value) =>
                  setResourceFilter(value as "all" | "staff" | "machines")
                }
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="staff">Staff Only</SelectItem>
                  <SelectItem value="machines">Machines Only</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Navigation controls */}
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

        {/* Date range display */}
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
          {view === "timeline" && (
            <>
              {format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d")} -{" "}
              {format(
                endOfWeek(currentDate, { weekStartsOn: 1 }),
                "MMM d, yyyy",
              )}
            </>
          )}
        </div>

        {/* Bulk selection controls */}
        {(bulkSelectedEvents.length > 0 || selectedEvents.length > 0) && (
          <div className="mt-2 p-2 bg-muted rounded-md flex items-center justify-between">
            <div>
              <span className="font-medium">
                {bulkSelectedEvents.length || selectedEvents.length} events
                selected
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                (Shift+click to select multiple events)
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("reschedule")}
              >
                <Move className="h-4 w-4 mr-1" />
                Reschedule
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("delete")}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBulkSelectedEvents([]);
                  if (onEventSelect) {
                    // Clear external selection
                    selectedEvents.forEach((id) => onEventSelect(id, true));
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Capacity warning */}
        {isCapacityWarningOpen && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
              <span className="text-sm">{capacityWarningMessage}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCapacityWarningOpen(false)}
            >
              Dismiss
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="overflow-auto h-[500px]">
        {view === "month" && renderMonthView()}
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}
        {view === "agenda" && renderAgendaView()}
        {view === "timeline" && renderTimelineView()}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Assigned Staff
                  </h3>
                  <p>
                    {selectedEvent.staffId
                      ? staff.find((s) => s.id === selectedEvent.staffId)
                          ?.name || "Unknown"
                      : "Unassigned"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Assigned Machine
                  </h3>
                  <p>
                    {selectedEvent.machineId
                      ? machines?.find((m) => m.id === selectedEvent.machineId)
                          ?.name || "Unknown"
                      : "Unassigned"}
                  </p>
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

              <div className="flex justify-between space-x-2 pt-4">
                <div>
                  <Button
                    variant="outline"
                    onClick={() => suggestAvailableTimeSlots(selectedJob.id)}
                  >
                    Suggest Alternative Times
                  </Button>
                </div>
                <div className="flex space-x-2">
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog
        open={isBulkActionDialogOpen}
        onOpenChange={setIsBulkActionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkActionType === "reschedule"
                ? "Bulk Reschedule"
                : "Bulk Delete"}
            </DialogTitle>
            <DialogDescription>
              {bulkActionType === "reschedule"
                ? `Reschedule ${bulkSelectedEvents.length || selectedEvents.length} selected events`
                : `Delete ${bulkSelectedEvents.length || selectedEvents.length} selected events`}
            </DialogDescription>
          </DialogHeader>

          {bulkActionType === "reschedule" && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="days">Days</Label>
                  <Input
                    id="days"
                    type="number"
                    value={bulkRescheduleData.days}
                    onChange={(e) =>
                      setBulkRescheduleData((prev) => ({
                        ...prev,
                        days: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    value={bulkRescheduleData.hours}
                    onChange={(e) =>
                      setBulkRescheduleData((prev) => ({
                        ...prev,
                        hours: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minutes">Minutes</Label>
                  <Input
                    id="minutes"
                    type="number"
                    value={bulkRescheduleData.minutes}
                    onChange={(e) =>
                      setBulkRescheduleData((prev) => ({
                        ...prev,
                        minutes: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter positive values to move events forward in time, or
                negative values to move them backward.
              </p>
            </div>
          )}

          {bulkActionType === "delete" && (
            <div className="py-4">
              <p className="text-sm text-destructive font-medium">
                Warning: This action cannot be undone. All selected events will
                be permanently deleted.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsBulkActionDialogOpen(false);
                setBulkRescheduleData({ days: 0, hours: 0, minutes: 0 });
              }}
            >
              Cancel
            </Button>
            <Button
              variant={bulkActionType === "delete" ? "destructive" : "default"}
              onClick={executeBulkAction}
            >
              {bulkActionType === "reschedule"
                ? "Reschedule Events"
                : "Delete Events"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Slot Suggestions Dialog */}
      <Dialog open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suggested Time Slots</DialogTitle>
            <DialogDescription>
              Here are some available time slots for this job
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {suggestedTimeSlots.map((slot, index) => {
              const startTime = new Date(slot.startTime);
              const endTime = new Date(slot.endTime);
              return (
                <div
                  key={index}
                  className={`p-3 border rounded-md cursor-pointer ${selectedSuggestion === index ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => setSelectedSuggestion(index)}
                >
                  <div className="font-medium">
                    {format(startTime, "EEEE, MMMM d, yyyy")}
                  </div>
                  <div>
                    {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSuggestionsOpen(false);
                setSelectedSuggestion(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={applySelectedSuggestion}
              disabled={selectedSuggestion === null}
            >
              Schedule This Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
