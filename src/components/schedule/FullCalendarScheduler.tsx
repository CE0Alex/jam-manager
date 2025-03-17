import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths
} from "date-fns";
import { ChevronLeft, ChevronRight, Users, Clock, Calendar as CalendarIcon, Grid3X3, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Job, ScheduleEvent } from "@/types";
import ScheduleEventItem from "./ScheduleEventItem";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

type CalendarView = "month" | "week" | "day";

interface FullCalendarSchedulerProps {
  selectedJob: Job;
  selectedStaffId: string;
  onTimeSlotSelect: (date: string, startTime: string, endTime: string) => void;
}

export default function FullCalendarScheduler({
  selectedJob,
  selectedStaffId,
  onTimeSlotSelect
}: FullCalendarSchedulerProps) {
  const { schedule, staff, settings } = useAppContext();
  
  // Format a date as a string in YYYY-MM-DD format
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Create a date object from a date string (YYYY-MM-DD) without timezone issues
  const createDateFromString = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0); // Use noon to avoid any day boundary issues
  };
  
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>("week");
  const [selectedDate, setSelectedDate] = useState<string>(formatDateString(new Date()));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    startTime: string;
    endTime: string;
  } | null>(null);

  // Get the selected staff member
  const selectedStaff = staff.find(s => s.id === selectedStaffId);

  // Calculate available time slots when date or staff changes
  const [availableTimeSlots, setAvailableTimeSlots] = useState<Array<{
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    hasConflict: boolean;
    conflictReason?: string;
  }>>([]);
  
  // For additional validation - check if we can round trip a date through our functions
  // Useful in debugging to ensure our date handling is consistent
  const validateDateFunctions = (dateStr: string) => {
    try {
      const dateObj = createDateFromString(dateStr);
      const backToString = formatDateString(dateObj);
      console.log(`Validation - Original: ${dateStr}, After round trip: ${backToString}, Match: ${dateStr === backToString}`);
      return dateStr === backToString;
    } catch (error) {
      console.error("Date validation error:", error);
      return false;
    }
  };
  
  // Run validation on initialization
  useEffect(() => {
    validateDateFunctions(selectedDate);
  }, []);

  // Effect to calculate available time slots
  useEffect(() => {
    if (!selectedStaff || !selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }

    // Create a date object from selected date string without timezone issues
    const [year, month, day] = selectedDate.split('-').map(Number);
    const selectedDateObj = new Date(year, month - 1, day, 12, 0, 0); // Use noon to avoid any day shifts
    
    // Get day of week for availability check
    const dayOfWeek = format(selectedDateObj, "EEEE").toLowerCase();
    console.log(`Day of week for ${selectedDate}: ${dayOfWeek}`);
    
    // Check if staff is available on this day
    if (!selectedStaff.availability[dayOfWeek as keyof typeof selectedStaff.availability]) {
      setAvailableTimeSlots([]);
      return;
    }
    
    // Get availability hours for this day
    const availabilityHours = selectedStaff.availabilityHours?.[
      dayOfWeek as keyof typeof selectedStaff.availabilityHours
    ];
    
    // Default to business hours if not specified
    const defaultStart = settings.businessHours.start;
    const defaultEnd = settings.businessHours.end;
    
    const { start, end } = availabilityHours || { start: defaultStart, end: defaultEnd };
    
    // Parse hours
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    
    // Create date objects for start and end of availability
    const availStart = new Date(year, month - 1, day);
    availStart.setHours(startHour, startMinute, 0, 0);
    
    const availEnd = new Date(year, month - 1, day);
    availEnd.setHours(endHour, endMinute, 0, 0);
    
    // Get existing events for this day and staff
    const existingEvents = schedule.filter(event => {
      return event.staffId === selectedStaffId &&
        format(new Date(event.startTime), "yyyy-MM-dd") === selectedDate;
    });
    
    // Generate time slots in 30-minute increments
    const slots: Array<{
      startTime: string;
      endTime: string;
      isAvailable: boolean;
      hasConflict: boolean;
      conflictReason?: string;
    }> = [];
    
    const requiredDuration = selectedJob.estimatedHours * 60; // in minutes
    
    // Generate all 30-minute slots for the day
    const slotStart = new Date(availStart);
    
    while (slotStart < availEnd) {
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);
      
      if (slotEnd <= availEnd) {
        // Check if this slot can accommodate the job duration
        const potentialEndTime = new Date(slotStart);
        potentialEndTime.setMinutes(potentialEndTime.getMinutes() + requiredDuration);
        
        // Check if end time exceeds availability
        const exceedsAvailability = potentialEndTime > availEnd;
        
        // Check for conflicts with existing events
        let hasConflict = false;
        let conflictReason = "";
        
        for (const event of existingEvents) {
          const eventStart = new Date(event.startTime);
          const eventEnd = new Date(event.endTime);
          
          // Check for overlap
          if (
            (slotStart < eventEnd && potentialEndTime > eventStart) ||
            (potentialEndTime > eventStart && slotStart < eventEnd)
          ) {
            hasConflict = true;
            conflictReason = "Conflicts with another scheduled event";
            break;
          }
        }
        
        // Add the slot
        slots.push({
          startTime: format(slotStart, "HH:mm"),
          endTime: format(potentialEndTime, "HH:mm"),
          isAvailable: !exceedsAvailability && !hasConflict,
          hasConflict: hasConflict || exceedsAvailability,
          conflictReason: exceedsAvailability 
            ? "Duration exceeds available hours" 
            : (hasConflict ? conflictReason : undefined)
        });
      }
      
      // Move to next 30-minute slot
      slotStart.setMinutes(slotStart.getMinutes() + 30);
    }
    
    setAvailableTimeSlots(slots);
  }, [selectedDate, selectedStaff, selectedStaffId, schedule, settings.businessHours, selectedJob]);

  // Handle time slot selection
  const handleTimeSlotSelect = (startTime: string, endTime: string) => {
    setSelectedTimeSlot({ startTime, endTime });
    onTimeSlotSelect(selectedDate, startTime, endTime);
  };

  // Handle navigation
  const navigatePrevious = () => {
    switch (view) {
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(prev => addDays(prev, -7));
        break;
      case "day":
        setCurrentDate(prev => addDays(prev, -1));
        break;
    }
  };

  const navigateNext = () => {
    switch (view) {
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(prev => addDays(prev, 7));
        break;
      case "day":
        setCurrentDate(prev => addDays(prev, 1));
        break;
    }
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(formatDateString(new Date()));
  };

  // Handle date selection - with proper timezone handling
  const handleDateSelect = (date: Date) => {
    const formattedDate = formatDateString(date);
    
    // For debugging
    console.log(`Selected date: ${date.toString()}, formatted as: ${formattedDate}`);
    console.log(`Previous selected date was: ${selectedDate}`);
    console.log(`Is same day check: ${isSameDay(date, createDateFromString(selectedDate))}`);
    console.log(`Direct string comparison: ${formattedDate === selectedDate}`);
    
    setSelectedDate(formattedDate);
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

  // Get staff availability for a specific day
  const getStaffAvailability = (date: Date, staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return false;

    // Get day of week reliably
    const dayOfWeek = format(date, "EEEE").toLowerCase();
    return staffMember.availability[dayOfWeek as keyof typeof staffMember.availability] || false;
  };

  // Format time in 12-hour format
  const formatTime12Hour = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  // Render month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 }); // End on Sunday

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Create weekday headers
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
      <div className="mt-4">
        <div className="grid grid-cols-7 gap-1 text-center border-b pb-2">
          {dayNames.map(day => (
            <div key={day} className="font-medium">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-2">
          {days.map(day => {
            const formattedDate = format(day, "d");
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, monthStart);
            const dayString = formatDateString(day);
            const isSelected = dayString === selectedDate;
            const dayEvents = getEventsForDay(day);
            const isStaffAvailable = selectedStaffId ? getStaffAvailability(day, selectedStaffId) : true;
            const dateStr = format(day, "yyyy-MM-dd");

            return (
              <div 
                key={day.toString()}
                className={`
                  p-1 h-24 border rounded-md relative
                  ${isCurrentMonth ? "" : "bg-gray-50 text-gray-400"}
                  ${isToday ? "bg-blue-50" : ""}
                  ${isSelected ? "ring-2 ring-primary" : ""}
                  ${!isStaffAvailable && isCurrentMonth ? "bg-gray-100" : ""}
                  cursor-pointer hover:bg-gray-50
                `}
                onClick={() => handleDateSelect(day)}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm ${isToday ? "bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center" : ""}`}>
                    {formattedDate}
                  </span>
                  {isCurrentMonth && !isStaffAvailable && (
                    <span className="text-xs bg-red-100 text-red-800 px-1 rounded">Off</span>
                  )}
                </div>
                <div className="overflow-y-auto h-16 mt-1 text-xs">
                  {dayEvents.length > 0 && (
                    <div className="mb-1">
                      <Badge variant="outline" className="text-xs">
                        {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // End on Sunday
    
    // Generate array of days for the week view
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="mt-4">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            // Instead of comparing with Date objects, compare formatted strings
            const dayString = formatDateString(day);
            const isSelected = dayString === selectedDate;
            const isStaffAvailable = selectedStaffId ? getStaffAvailability(day, selectedStaffId) : true;

            return (
              <div 
                key={format(day, "yyyy-MM-dd")} 
                className={`
                  text-center p-2 rounded-md cursor-pointer
                  ${isToday ? "bg-blue-50" : "hover:bg-gray-100"}
                  ${isSelected ? "ring-2 ring-primary" : ""}
                  ${!isStaffAvailable ? "bg-gray-100" : ""}
                `}
                onClick={() => handleDateSelect(day)}
              >
                <div className="font-medium">{format(day, "EEE")}</div>
                <div>{format(day, "MMM d")}</div>
                {!isStaffAvailable && (
                  <div className="text-xs mt-1 text-red-500">Staff Unavailable</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Available time slots for selected date */}
        <div className="mt-4">
          <h3 className="font-medium text-lg mb-2">
            Available Times on {format(createDateFromString(selectedDate), "EEEE, MMMM d")}
          </h3>
          
          {!selectedStaff ? (
            <div className="p-4 text-center text-muted-foreground bg-gray-50 rounded-md">
              Please select a staff member to see availability
            </div>
          ) : !selectedStaff.availability[format(createDateFromString(selectedDate), "EEEE").toLowerCase() as keyof typeof selectedStaff.availability] ? (
            <div className="p-4 text-center text-amber-700 bg-amber-50 rounded-md border border-amber-200">
              {selectedStaff.name} is not available on {format(createDateFromString(selectedDate), "EEEE")}s
            </div>
          ) : availableTimeSlots.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground bg-gray-50 rounded-md">
              No available time slots for the selected date
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {availableTimeSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`
                    p-3 rounded-md border text-center cursor-pointer
                    ${slot.isAvailable 
                      ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                      : 'bg-red-50 border-red-200 cursor-not-allowed opacity-60'}
                    ${selectedTimeSlot?.startTime === slot.startTime 
                      ? 'ring-2 ring-primary' 
                      : ''}
                  `}
                  onClick={() => {
                    if (slot.isAvailable) {
                      handleTimeSlotSelect(slot.startTime, slot.endTime);
                    } else {
                      toast({
                        title: "Time Unavailable",
                        description: slot.conflictReason || "This time slot is not available",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <div className="font-medium">
                    {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                  </div>
                  <div className="text-xs mt-1">
                    {slot.isAvailable 
                      ? <span className="text-green-600">Available</span> 
                      : <span className="text-red-600">{slot.conflictReason || "Unavailable"}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayStr = format(currentDate, "yyyy-MM-dd");
    const isToday = isSameDay(currentDate, new Date());
    const currentDateStr = formatDateString(currentDate);
    const isSelected = currentDateStr === selectedDate;
    const isStaffAvailable = selectedStaffId ? getStaffAvailability(currentDate, selectedStaffId) : true;

    // If the date changes in day view, update the selected date
    useEffect(() => {
      if (view === "day") {
        setSelectedDate(formatDateString(currentDate));
      }
    }, [currentDate, view]);

    return (
      <div className="mt-4">
        <div 
          className={`
            rounded-md p-4 mb-4
            ${isToday ? "bg-blue-50" : "bg-gray-50"}
            ${isSelected ? "ring-2 ring-primary" : ""}
          `}
        >
          <h3 className="text-xl font-bold">{format(currentDate, "EEEE")}</h3>
          <p className="text-lg">{format(currentDate, "MMMM d, yyyy")}</p>
          {!isStaffAvailable && selectedStaffId && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
              Selected staff is not available on this day
            </div>
          )}
        </div>

        {/* Available time slots for selected date */}
        <div className="mt-4">
          <h3 className="font-medium text-lg mb-2">
            Available Time Slots
          </h3>
          
          {!selectedStaff ? (
            <div className="p-4 text-center text-muted-foreground bg-gray-50 rounded-md">
              Please select a staff member to see availability
            </div>
          ) : !isStaffAvailable ? (
            <div className="p-4 text-center text-amber-700 bg-amber-50 rounded-md border border-amber-200">
              {selectedStaff.name} is not available on {format(currentDate, "EEEE")}s
            </div>
          ) : availableTimeSlots.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground bg-gray-50 rounded-md">
              No available time slots for the selected date
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {availableTimeSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`
                    p-3 rounded-md border text-center cursor-pointer
                    ${slot.isAvailable 
                      ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                      : 'bg-red-50 border-red-200 cursor-not-allowed opacity-60'}
                    ${selectedTimeSlot?.startTime === slot.startTime 
                      ? 'ring-2 ring-primary' 
                      : ''}
                  `}
                  onClick={() => {
                    if (slot.isAvailable) {
                      handleTimeSlotSelect(slot.startTime, slot.endTime);
                    } else {
                      toast({
                        title: "Time Unavailable",
                        description: slot.conflictReason || "This time slot is not available",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <div className="font-medium">
                    {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                  </div>
                  <div className="text-xs mt-1">
                    {slot.isAvailable 
                      ? <span className="text-green-600">Available</span> 
                      : <span className="text-red-600">{slot.conflictReason || "Unavailable"}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Selected time slot summary
  const renderSelectedTimeSlot = () => {
    if (!selectedTimeSlot) return null;

    // Create a proper date object from the string
    const selectedDateObj = createDateFromString(selectedDate);

    return (
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="font-medium flex items-center text-blue-800">
          <Clock className="h-4 w-4 mr-2" />
          Selected Schedule
        </h4>
        <div className="mt-1 text-blue-700">
          <p>
            {format(selectedDateObj, "EEEE, MMMM d")} from{" "}
            {formatTime12Hour(selectedTimeSlot.startTime)} to{" "}
            {formatTime12Hour(selectedTimeSlot.endTime)}
          </p>
          <p className="text-sm mt-1">
            Duration: {selectedJob.estimatedHours} hour(s) based on job estimate
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Schedule Calendar</CardTitle>
        <div className="flex items-center space-x-2">
          <Select
            value={view}
            onValueChange={(value) => setView(value as CalendarView)}
          >
            <SelectTrigger className="w-[120px]">
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
            </SelectContent>
          </Select>

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
      </CardHeader>
      
      <CardContent>
        <div className="text-lg font-medium">
          {view === "month" && format(currentDate, "MMMM yyyy")}
          {view === "week" && (
            <>
              Week of {format(
                startOfWeek(currentDate, { weekStartsOn: 1 }),
                "MMMM d"
              )} - {format(
                endOfWeek(currentDate, { weekStartsOn: 1 }),
                "MMMM d, yyyy"
              )}
            </>
          )}
          {view === "day" && format(currentDate, "MMMM d, yyyy")}
        </div>

        {view === "month" && renderMonthView()}
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}

        {renderSelectedTimeSlot()}
      </CardContent>
    </Card>
  );
}
