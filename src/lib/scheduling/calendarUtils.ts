import { StaffMember, ScheduleEvent } from "@/types";
import { format, parseISO, isSameDay } from "date-fns";

export interface TimeBlock {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId?: string;
  type: "event" | "available" | "unavailable" | "business-hours";
  color?: string;
  textColor?: string;
  jobId?: string;
  staffId?: string;
  machineId?: string;
  originalEvent?: ScheduleEvent;
}

/**
 * Generate time blocks for visualization in a calendar
 * @param date Date to generate blocks for
 * @param staff Array of staff members
 * @param events Array of scheduled events
 * @param includeAvailability Whether to include availability blocks
 * @returns Array of time blocks for calendar display
 */
export function generateTimeBlocks(
  date: Date,
  staff: StaffMember[],
  events: ScheduleEvent[],
  includeAvailability = true
): TimeBlock[] {
  const blocks: TimeBlock[] = [];
  const dateString = format(date, "yyyy-MM-dd");
  const dayOfWeek = format(date, "EEEE").toLowerCase();
  
  // Add scheduled events
  const dayEvents = events.filter(event => {
    const eventDate = parseISO(event.startTime);
    return format(eventDate, "yyyy-MM-dd") === dateString;
  });
  
  dayEvents.forEach(event => {
    blocks.push({
      id: `event-${event.id}`,
      title: event.notes || "Scheduled Job",
      start: parseISO(event.startTime),
      end: parseISO(event.endTime),
      resourceId: event.staffId,
      type: "event",
      color: event.color || "#3490dc",
      textColor: "#ffffff",
      jobId: event.jobId,
      staffId: event.staffId,
      machineId: event.machineId,
      originalEvent: event
    });
  });
  
  if (includeAvailability) {
    // Add availability blocks for each staff member
    staff.forEach(staffMember => {
      const isAvailableToday = staffMember.availability[
        dayOfWeek as keyof typeof staffMember.availability
      ];
      
      if (isAvailableToday) {
        // Get availability hours
        const availabilityHours = staffMember.availabilityHours?.[
          dayOfWeek as keyof typeof staffMember.availabilityHours
        ];
        
        // Default business hours if not specified (8am-5pm)
        const defaultStart = "08:00";
        const defaultEnd = "17:00";
        
        const { start, end } = availabilityHours || { start: defaultStart, end: defaultEnd };
        
        // Parse hours
        const [startHour, startMinute] = start.split(":").map(Number);
        const [endHour, endMinute] = end.split(":").map(Number);
        
        // Create date objects for start and end of availability
        const availStart = new Date(date);
        availStart.setHours(startHour, startMinute, 0, 0);
        
        const availEnd = new Date(date);
        availEnd.setHours(endHour, endMinute, 0, 0);
        
        // Filter events for this staff member on this day
        const staffEvents = dayEvents.filter(event => event.staffId === staffMember.id);
        
        if (staffEvents.length === 0) {
          // If no events, add a single availability block
          blocks.push({
            id: `avail-${staffMember.id}-${dateString}`,
            title: "Available",
            start: availStart,
            end: availEnd,
            resourceId: staffMember.id,
            type: "available",
            color: "#e3f2fd",
            textColor: "#1976d2",
            staffId: staffMember.id
          });
        } else {
          // If there are events, calculate available time slots around them
          let currentTime = new Date(availStart);
          
          // Sort events by start time
          const sortedEvents = [...staffEvents].sort((a, b) => 
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
          
          for (const event of sortedEvents) {
            const eventStart = parseISO(event.startTime);
            
            // Add available block before event if there's a gap
            if (currentTime < eventStart) {
              blocks.push({
                id: `avail-${staffMember.id}-${currentTime.getTime()}`,
                title: "Available",
                start: new Date(currentTime),
                end: new Date(eventStart),
                resourceId: staffMember.id,
                type: "available",
                color: "#e3f2fd",
                textColor: "#1976d2",
                staffId: staffMember.id
              });
            }
            
            // Move current time to after the event
            currentTime = parseISO(event.endTime);
          }
          
          // Add available block after the last event if needed
          if (currentTime < availEnd) {
            blocks.push({
              id: `avail-${staffMember.id}-${currentTime.getTime()}`,
              title: "Available",
              start: new Date(currentTime),
              end: new Date(availEnd),
              resourceId: staffMember.id,
              type: "available",
              color: "#e3f2fd",
              textColor: "#1976d2",
              staffId: staffMember.id
            });
          }
        }
        
        // Add blocked times if any
        if (staffMember.blockedTimes) {
          const blockedTimesForDate = staffMember.blockedTimes.filter(
            bt => bt.date === dateString
          );
          
          blockedTimesForDate.forEach(blockedTime => {
            const [blockStartHour, blockStartMinute] = blockedTime.start.split(":").map(Number);
            const [blockEndHour, blockEndMinute] = blockedTime.end.split(":").map(Number);
            
            const blockStart = new Date(date);
            blockStart.setHours(blockStartHour, blockStartMinute, 0, 0);
            
            const blockEnd = new Date(date);
            blockEnd.setHours(blockEndHour, blockEndMinute, 0, 0);
            
            blocks.push({
              id: `blocked-${staffMember.id}-${blockStart.getTime()}`,
              title: blockedTime.reason || "Blocked",
              start: blockStart,
              end: blockEnd,
              resourceId: staffMember.id,
              type: "unavailable",
              color: "#ffebee",
              textColor: "#c62828",
              staffId: staffMember.id
            });
          });
        }
      } else {
        // If staff is not available this day, add an unavailable block for the whole day
        const dayStart = new Date(date);
        dayStart.setHours(8, 0, 0, 0);
        
        const dayEnd = new Date(date);
        dayEnd.setHours(17, 0, 0, 0);
        
        blocks.push({
          id: `unavail-${staffMember.id}-${dateString}`,
          title: "Unavailable",
          start: dayStart,
          end: dayEnd,
          resourceId: staffMember.id,
          type: "unavailable",
          color: "#ffebee",
          textColor: "#c62828",
          staffId: staffMember.id
        });
      }
    });
  }
  
  return blocks;
}

/**
 * Convert schedule events to calendar events format
 * @param events Schedule events to convert
 * @param jobs Job data to include job titles
 * @param staff Staff data to include staff names
 * @returns Calendar events ready for display
 */
export function eventsToCalendarFormat(
  events: ScheduleEvent[],
  jobTitles: Record<string, string>,
  staffNames: Record<string, string>
) {
  return events.map(event => {
    const jobTitle = jobTitles[event.jobId] || "Unknown Job";
    const staffName = event.staffId ? staffNames[event.staffId] : "Unassigned";
    
    return {
      id: event.id,
      title: jobTitle,
      start: event.startTime,
      end: event.endTime,
      resourceId: event.staffId,
      extendedProps: {
        jobId: event.jobId,
        staffId: event.staffId,
        machineId: event.machineId,
        notes: event.notes,
        staffName
      },
      color: event.color || "#3490dc",
      textColor: "#ffffff"
    };
  });
}

/**
 * Get business hours for a specific day
 * @param staff Staff member to check
 * @param date Date to check
 * @returns Business hours object or undefined if not available
 */
export function getBusinessHours(
  staff: StaffMember,
  date: Date
): { startTime: string; endTime: string } | undefined {
  const dayOfWeek = format(date, "EEEE").toLowerCase();
  
  // Check if staff is available on this day
  if (!staff.availability[dayOfWeek as keyof typeof staff.availability]) {
    return undefined;
  }
  
  // Get availability hours for this day
  const availabilityHours = staff.availabilityHours?.[
    dayOfWeek as keyof typeof staff.availabilityHours
  ];
  
  if (!availabilityHours) {
    // Return default business hours if not specified
    return { startTime: "08:00", endTime: "17:00" };
  }
  
  return { startTime: availabilityHours.start, endTime: availabilityHours.end };
}

/**
 * Find available time slots for scheduling
 * @param date Date to check
 * @param duration Duration in hours needed
 * @param staff Staff data
 * @param events Existing schedule events
 * @returns Array of available time slots
 */
export function findAvailableSlots(
  date: Date,
  duration: number,
  staff: StaffMember[],
  events: ScheduleEvent[]
): Array<{
  staffId: string;
  staffName: string;
  startTime: string;
  endTime: string;
}> {
  const results: Array<{
    staffId: string;
    staffName: string;
    startTime: string;
    endTime: string;
  }> = [];
  
  // Get day of week
  const dayOfWeek = format(date, "EEEE").toLowerCase();
  
  // Check each staff member
  staff.forEach(staffMember => {
    // Check if staff is available on this day
    if (!staffMember.availability[dayOfWeek as keyof typeof staffMember.availability]) {
      return; // Skip if not available on this day
    }
    
    // Get available time slots for this staff
    const durationMinutes = duration * 60;
    const availableSlots = generateAvailableTimeSlots(
      staffMember,
      date,
      events.filter(event => event.staffId === staffMember.id),
      durationMinutes
    );
    
    // Add results with staff info
    availableSlots.forEach(slot => {
      results.push({
        staffId: staffMember.id,
        staffName: staffMember.name,
        startTime: slot.start,
        endTime: slot.end
      });
    });
  });
  
  // Sort by start time
  return results.sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });
}

/**
 * Generate available time slots for a staff member
 * @param staff Staff member
 * @param date Date to check
 * @param events Staff member's existing events for the day
 * @param durationMinutes Required duration in minutes
 * @returns Array of available time slots that can fit the required duration
 */
function generateAvailableTimeSlots(
  staff: StaffMember,
  date: Date,
  events: ScheduleEvent[],
  durationMinutes: number
): Array<{ start: string; end: string }> {
  const dayOfWeek = format(date, "EEEE").toLowerCase();
  const dateString = format(date, "yyyy-MM-dd");
  
  // Get staff availability hours
  const availabilityHours = staff.availabilityHours?.[
    dayOfWeek as keyof typeof staff.availabilityHours
  ];
  
  // Default business hours if not specified
  const defaultStart = "08:00";
  const defaultEnd = "17:00";
  
  const { start, end } = availabilityHours || { start: defaultStart, end: defaultEnd };
  
  // Parse hours
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  
  // Create date objects for start and end of availability
  const availStart = new Date(date);
  availStart.setHours(startHour, startMinute, 0, 0);
  
  const availEnd = new Date(date);
  availEnd.setHours(endHour, endMinute, 0, 0);
  
  // Check if the working hours are sufficient for the requested duration
  const availableDurationMinutes = (availEnd.getTime() - availStart.getTime()) / (1000 * 60);
  if (availableDurationMinutes < durationMinutes) {
    return []; // Not enough time in the working day
  }
  
  // Get events for this day
  const dayEvents = events.filter(event => {
    const eventDate = parseISO(event.startTime);
    return format(eventDate, "yyyy-MM-dd") === dateString;
  }).sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  
  // Get blocked times for this day
  const blockedTimes = staff.blockedTimes?.filter(
    bt => bt.date === dateString
  ) || [];
  
  // If no events or blocked times, return the entire available period
  if (dayEvents.length === 0 && blockedTimes.length === 0) {
    // Generate slots at 30-minute intervals
    return generateTimeSlots(availStart, availEnd, durationMinutes);
  }
  
  // Array to store free periods
  const freePeriods: Array<{ start: Date; end: Date }> = [];
  let currentTime = new Date(availStart);
  
  // Process events
  for (const event of dayEvents) {
    const eventStart = parseISO(event.startTime);
    const eventEnd = parseISO(event.endTime);
    
    // If there's a gap before this event
    if (currentTime < eventStart) {
      freePeriods.push({
        start: new Date(currentTime),
        end: new Date(eventStart)
      });
    }
    
    // Move currentTime to after this event
    currentTime = new Date(Math.max(currentTime.getTime(), eventEnd.getTime()));
  }
  
  // Add the period after the last event
  if (currentTime < availEnd) {
    freePeriods.push({
      start: new Date(currentTime),
      end: new Date(availEnd)
    });
  }
  
  // Filter out periods that overlap with blocked times
  const filteredPeriods = freePeriods.flatMap(period => {
    return filterBlockedTimes(period.start, period.end, blockedTimes, date);
  });
  
  // Generate time slots from the free periods
  const slots: Array<{ start: string; end: string }> = [];
  
  filteredPeriods.forEach(period => {
    const periodSlots = generateTimeSlots(period.start, period.end, durationMinutes);
    slots.push(...periodSlots);
  });
  
  return slots;
}

/**
 * Filter periods that overlap with blocked times
 * @param periodStart Start of the period
 * @param periodEnd End of the period
 * @param blockedTimes Array of blocked times
 * @param date Date to check
 * @returns Array of non-overlapping periods
 */
function filterBlockedTimes(
  periodStart: Date,
  periodEnd: Date,
  blockedTimes: Array<{ date: string; start: string; end: string; reason?: string }>,
  date: Date
): Array<{ start: Date; end: Date }> {
  if (blockedTimes.length === 0) {
    return [{ start: periodStart, end: periodEnd }];
  }
  
  const result: Array<{ start: Date; end: Date }> = [];
  let currentStart = new Date(periodStart);
  
  // Convert blocked times to Date objects
  const blocks = blockedTimes.map(block => {
    const [blockStartHour, blockStartMinute] = block.start.split(":").map(Number);
    const [blockEndHour, blockEndMinute] = block.end.split(":").map(Number);
    
    const blockStart = new Date(date);
    blockStart.setHours(blockStartHour, blockStartMinute, 0, 0);
    
    const blockEnd = new Date(date);
    blockEnd.setHours(blockEndHour, blockEndMinute, 0, 0);
    
    return { start: blockStart, end: blockEnd };
  }).sort((a, b) => a.start.getTime() - b.start.getTime());
  
  // Process each blocked time
  for (const block of blocks) {
    // If current start is after this block, skip it
    if (currentStart >= block.end) {
      continue;
    }
    
    // If current start is before block start, add the period before the block
    if (currentStart < block.start) {
      result.push({
        start: new Date(currentStart),
        end: new Date(block.start)
      });
    }
    
    // Move current start to after this block
    currentStart = new Date(block.end);
    
    // If we've gone past period end, break
    if (currentStart >= periodEnd) {
      break;
    }
  }
  
  // Add remaining period if any
  if (currentStart < periodEnd) {
    result.push({
      start: new Date(currentStart),
      end: new Date(periodEnd)
    });
  }
  
  return result;
}

/**
 * Generate time slots at 30-minute intervals
 * @param start Start time
 * @param end End time
 * @param durationMinutes Required duration in minutes
 * @returns Array of time slots that can fit the required duration
 */
function generateTimeSlots(
  start: Date,
  end: Date,
  durationMinutes: number
): Array<{ start: string; end: string }> {
  const slots: Array<{ start: string; end: string }> = [];
  const slotDuration = 30; // 30-minute slots
  
  // Calculate how many slots are needed for the requested duration
  const requiredSlots = Math.ceil(durationMinutes / slotDuration);
  
  // Generate slots
  const startTime = new Date(start);
  
  while (startTime.getTime() + (durationMinutes * 60 * 1000) <= end.getTime()) {
    const slotStart = new Date(startTime);
    const slotEnd = new Date(startTime);
    slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);
    
    slots.push({
      start: format(slotStart, "HH:mm"),
      end: format(slotEnd, "HH:mm")
    });
    
    // Move to next 30-minute increment
    startTime.setMinutes(startTime.getMinutes() + 30);
  }
  
  return slots;
}
