import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { format, addDays, startOfWeek, endOfWeek, isToday, parse, isWithinInterval, addHours } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatTime12Hour } from "@/lib/timeUtils";
import { StaffMember, Job } from "@/types";

interface InteractiveScheduleCalendarProps {
  selectedJob: Job;
  selectedStaffId: string;
  onTimeSlotSelect: (date: string, startTime: string, endTime: string) => void;
}

export default function InteractiveScheduleCalendar({
  selectedJob,
  selectedStaffId,
  onTimeSlotSelect
}: InteractiveScheduleCalendarProps) {
  const { staff, schedule, settings } = useAppContext();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [availableTimeSlots, setAvailableTimeSlots] = useState<Array<{
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    hasConflict: boolean;
    conflictReason?: string;
  }>>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    startTime: string;
    endTime: string;
  } | null>(null);

  // Get the selected staff member
  const selectedStaff = staff.find(s => s.id === selectedStaffId);

  // Calculate the start and end of the week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // End on Sunday
  
  // Generate array of days for the week view
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(weekStart, i));
  }

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(format(date, "yyyy-MM-dd"));
  };

  // Handle navigation
  const navigatePrevious = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };

  const navigateNext = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (startTime: string, endTime: string) => {
    setSelectedTimeSlot({ startTime, endTime });
    onTimeSlotSelect(selectedDate, startTime, endTime);
  };

  // Calculate available time slots based on selected date and staff
  useEffect(() => {
    if (!selectedStaff || !selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }

    // Get day of week for availability check
    const selectedDateObj = parse(selectedDate, "yyyy-MM-dd", new Date());
    const dayOfWeek = format(selectedDateObj, "EEEE").toLowerCase();
    
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
    const availStart = new Date(selectedDateObj);
    availStart.setHours(startHour, startMinute, 0, 0);
    
    const availEnd = new Date(selectedDateObj);
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
    const requiredSlots = Math.ceil(requiredDuration / 30);
    
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
          endTime: format(addHours(slotStart, selectedJob.estimatedHours), "HH:mm"),
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

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Schedule Calendar</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div 
              key={format(day, "yyyy-MM-dd")} 
              className={`
                text-center p-2 rounded-md cursor-pointer
                ${isToday(day) ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"}
                ${format(day, "yyyy-MM-dd") === selectedDate ? "ring-2 ring-primary" : ""}
              `}
              onClick={() => handleDateSelect(day)}
            >
              <div className="font-medium">{format(day, "EEE")}</div>
              <div>{format(day, "MMM d")}</div>
            </div>
          ))}
        </div>

        {/* Availability and Time Slot Selection */}
        <div className="mt-4">
          <h3 className="font-medium text-lg mb-2">
            Available Times on {format(parse(selectedDate, "yyyy-MM-dd", new Date()), "EEEE, MMMM d")}
          </h3>
          
          {!selectedStaff ? (
            <div className="p-4 text-center text-muted-foreground bg-gray-50 rounded-md">
              Please select a staff member to see availability
            </div>
          ) : !selectedStaff.availability[format(parse(selectedDate, "yyyy-MM-dd", new Date()), "EEEE").toLowerCase() as keyof typeof selectedStaff.availability] ? (
            <div className="p-4 text-center text-amber-700 bg-amber-50 rounded-md border border-amber-200">
              {selectedStaff.name} is not available on {format(parse(selectedDate, "yyyy-MM-dd", new Date()), "EEEE")}s
            </div>
          ) : availableTimeSlots.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground bg-gray-50 rounded-md">
              No available time slots for the selected date
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {availableTimeSlots.map((slot, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
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
                          }
                        }}
                      >
                        <div className="font-medium">
                          {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                        </div>
                        <div className="text-xs mt-1">
                          {slot.isAvailable 
                            ? <span className="text-green-600">Available</span> 
                            : <span className="text-red-600">Unavailable</span>}
                        </div>
                      </div>
                    </TooltipTrigger>
                    {!slot.isAvailable && (
                      <TooltipContent>
                        <p>{slot.conflictReason || "Time slot unavailable"}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </div>
        
        {/* Selected Time Slot Summary */}
        {selectedTimeSlot && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium flex items-center text-blue-800">
              <Clock className="h-4 w-4 mr-2" />
              Selected Schedule
            </h4>
            <div className="mt-1 text-blue-700">
              <p>
                {format(parse(selectedDate, "yyyy-MM-dd", new Date()), "EEEE, MMMM d")} from{" "}
                {formatTime12Hour(selectedTimeSlot.startTime)} to{" "}
                {formatTime12Hour(selectedTimeSlot.endTime)}
              </p>
              <p className="text-sm mt-1">
                Duration: {selectedJob.estimatedHours} hour(s) based on job estimate
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
