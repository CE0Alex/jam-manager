import { ScheduleEvent, StaffMember } from "@/types";

export interface ScheduleConflict {
  type: "staff" | "machine" | "time" | "availability";
  message: string;
  severity: "warning" | "error";
  conflictingEventId?: string;
  staffId?: string;
  machineId?: string;
  details?: string;
}

/**
 * Detect conflicts for a new or updated schedule event
 * @param newEvent The event being scheduled or updated
 * @param existingEvents All existing schedule events
 * @param staff Staff members data
 * @param isUpdate Whether this is an update to an existing event
 * @returns Array of detected conflicts
 */
export function detectScheduleConflicts(
  newEvent: ScheduleEvent,
  existingEvents: ScheduleEvent[],
  staff: StaffMember[],
  isUpdate = false
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  
  // For updates, filter out the event being updated
  const events = isUpdate 
    ? existingEvents.filter(event => event.id !== newEvent.id) 
    : existingEvents;
  
  const newStart = new Date(newEvent.startTime);
  const newEnd = new Date(newEvent.endTime);
  
  // Check for invalid time range
  if (newEnd <= newStart) {
    conflicts.push({
      type: "time",
      message: "End time must be after start time",
      severity: "error"
    });
  }
  
  // Find the staff member if assigned
  const staffMember = newEvent.staffId 
    ? staff.find(s => s.id === newEvent.staffId) 
    : undefined;
  
  // Check staff availability
  if (staffMember) {
    const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "lowercase" })
      .format(newStart);
    
    // Check if staff is available on this day
    if (!staffMember.availability[dayOfWeek as keyof typeof staffMember.availability]) {
      conflicts.push({
        type: "availability",
        message: `${staffMember.name} is not available on ${dayOfWeek}s`,
        severity: "error",
        staffId: staffMember.id
      });
    } else {
      // Check if the time falls within the staff's availability hours
      const availabilityHours = staffMember.availabilityHours?.[dayOfWeek as keyof typeof staffMember.availabilityHours];
      
      if (availabilityHours) {
        const { start, end } = availabilityHours;
        const [startHour, startMinute] = start.split(":").map(Number);
        const [endHour, endMinute] = end.split(":").map(Number);
        
        const availStart = new Date(newStart);
        availStart.setHours(startHour, startMinute, 0, 0);
        
        const availEnd = new Date(newStart);
        availEnd.setHours(endHour, endMinute, 0, 0);
        
        if (newStart < availStart || newEnd > availEnd) {
          conflicts.push({
            type: "availability",
            message: `Schedule time is outside ${staffMember.name}'s availability hours (${start} to ${end})`,
            severity: "error",
            staffId: staffMember.id,
            details: `Available: ${start} to ${end}`
          });
        }
      }
      
      // Check for blocked times
      if (staffMember.blockedTimes) {
        const newEventDate = newStart.toISOString().split('T')[0];
        const blockedTimesForDate = staffMember.blockedTimes.filter(
          bt => bt.date === newEventDate
        );
        
        for (const blockedTime of blockedTimesForDate) {
          const [blockStartHour, blockStartMinute] = blockedTime.start.split(":").map(Number);
          const [blockEndHour, blockEndMinute] = blockedTime.end.split(":").map(Number);
          
          const blockStart = new Date(newStart);
          blockStart.setHours(blockStartHour, blockStartMinute, 0, 0);
          
          const blockEnd = new Date(newStart);
          blockEnd.setHours(blockEndHour, blockEndMinute, 0, 0);
          
          if (!(newEnd <= blockStart || newStart >= blockEnd)) {
            conflicts.push({
              type: "availability",
              message: `Schedule overlaps with ${staffMember.name}'s blocked time`,
              severity: "error",
              staffId: staffMember.id,
              details: blockedTime.reason 
                ? `Reason: ${blockedTime.reason}` 
                : undefined
            });
          }
        }
      }
    }
    
    // Check for overlapping assignments for the staff member
    const staffEvents = events.filter(event => event.staffId === newEvent.staffId);
    
    for (const existingEvent of staffEvents) {
      const existingStart = new Date(existingEvent.startTime);
      const existingEnd = new Date(existingEvent.endTime);
      
      // Check for overlap
      if (!(newEnd <= existingStart || newStart >= existingEnd)) {
        conflicts.push({
          type: "staff",
          message: `Schedule conflicts with another assignment for ${staffMember.name}`,
          severity: "error",
          staffId: staffMember.id,
          conflictingEventId: existingEvent.id,
          details: `Conflicting event: ${existingStart.toLocaleTimeString()} - ${existingEnd.toLocaleTimeString()}`
        });
      }
    }
  }
  
  // Check for machine overlaps if a machine is assigned
  if (newEvent.machineId) {
    const machineEvents = events.filter(
      event => event.machineId === newEvent.machineId
    );
    
    for (const existingEvent of machineEvents) {
      const existingStart = new Date(existingEvent.startTime);
      const existingEnd = new Date(existingEvent.endTime);
      
      // Check for overlap
      if (!(newEnd <= existingStart || newStart >= existingEnd)) {
        conflicts.push({
          type: "machine",
          message: `Machine is already scheduled during this time`,
          severity: "error",
          machineId: newEvent.machineId,
          conflictingEventId: existingEvent.id,
          details: `Conflicting event: ${existingStart.toLocaleTimeString()} - ${existingEnd.toLocaleTimeString()}`
        });
      }
    }
  }
  
  return conflicts;
}

/**
 * Check if a schedule event has conflicts
 * @param event Event to check
 * @param existingEvents All existing schedule events
 * @param staff Staff members data
 * @param isUpdate Whether this is an update to an existing event
 * @returns True if the event has any conflicts
 */
export function hasScheduleConflicts(
  event: ScheduleEvent,
  existingEvents: ScheduleEvent[],
  staff: StaffMember[],
  isUpdate = false
): boolean {
  const conflicts = detectScheduleConflicts(event, existingEvents, staff, isUpdate);
  return conflicts.length > 0;
}

/**
 * Get all available time slots for a staff member on a specific date
 * @param staffId Staff member ID
 * @param date Date to check
 * @param staff All staff members
 * @param existingEvents All existing schedule events
 * @param minimumDuration Minimum duration in minutes needed for a slot to be considered available
 * @returns Array of available time slots in 30-minute increments
 */
export function getAvailableTimeSlots(
  staffId: string,
  date: Date,
  staff: StaffMember[],
  existingEvents: ScheduleEvent[],
  minimumDuration = 30
): Array<{ start: string, end: string }> {
  // Find the staff member
  const staffMember = staff.find(s => s.id === staffId);
  if (!staffMember) return [];
  
  // Get day of week for availability check
  const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "lowercase" })
    .format(date);
  
  // Check if staff is available on this day
  if (!staffMember.availability[dayOfWeek as keyof typeof staffMember.availability]) {
    return [];
  }
  
  // Get the availability hours for this day
  const availabilityHours = staffMember.availabilityHours?.[
    dayOfWeek as keyof typeof staffMember.availabilityHours
  ];
  
  // Default to 8am-5pm if not specified
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
  
  // Generate all 30-minute slots
  const timeSlots: Array<{ start: Date, end: Date }> = [];
  let currentSlot = new Date(availStart);
  
  while (currentSlot < availEnd) {
    const slotStart = new Date(currentSlot);
    const slotEnd = new Date(currentSlot);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30);
    
    if (slotEnd <= availEnd) {
      timeSlots.push({ start: slotStart, end: slotEnd });
    }
    
    currentSlot.setMinutes(currentSlot.getMinutes() + 30);
  }
  
  // Filter out slots that have existing events
  const dateString = date.toISOString().split('T')[0];
  const staffEvents = existingEvents.filter(event => 
    event.staffId === staffId && 
    new Date(event.startTime).toISOString().split('T')[0] === dateString
  );
  
  // Apply blocked times filter
  const blockedTimesForDate = staffMember.blockedTimes?.filter(
    bt => bt.date === dateString
  ) || [];
  
  // Convert blocked times to Date objects
  const blockedTimes = blockedTimesForDate.map(bt => {
    const [blockStartHour, blockStartMinute] = bt.start.split(":").map(Number);
    const [blockEndHour, blockEndMinute] = bt.end.split(":").map(Number);
    
    const blockStart = new Date(date);
    blockStart.setHours(blockStartHour, blockStartMinute, 0, 0);
    
    const blockEnd = new Date(date);
    blockEnd.setHours(blockEndHour, blockEndMinute, 0, 0);
    
    return { start: blockStart, end: blockEnd };
  });
  
  // Filter out time slots that overlap with existing events or blocked times
  const availableSlots = timeSlots.filter(slot => {
    // Check against existing events
    const hasEventConflict = staffEvents.some(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return !(slot.end <= eventStart || slot.start >= eventEnd);
    });
    
    if (hasEventConflict) return false;
    
    // Check against blocked times
    const hasBlockedConflict = blockedTimes.some(block => {
      return !(slot.end <= block.start || slot.start >= block.end);
    });
    
    return !hasBlockedConflict;
  });
  
  // If minimum duration is longer than 30 minutes, find consecutive available slots
  if (minimumDuration > 30) {
  const requiredSlots = Math.ceil(minimumDuration / 30);
  const consecutiveSlots: Array<{ start: string, end: string }> = [];
  
  // Check if we have enough slots at all
  if (availableSlots.length < requiredSlots) {
  console.log("Not enough available slots to satisfy duration");
    return [];
  }
  
  // Simple case: if the duration fits in the full workday and there are no conflicts
  if (availableSlots.length === timeSlots.length) {
  const startTime = availableSlots[0].start;
  const endTimeDate = new Date(availableSlots[0].start);
  endTimeDate.setMinutes(endTimeDate.getMinutes() + minimumDuration);
  
  // Make sure the end time doesn't exceed availability
  if (endTimeDate <= availEnd) {
    const endTime = endTimeDate;
    
  // Format to time strings without seconds
  return [{
    start: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      end: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      }];
      }
    }
    
    for (let i = 0; i <= availableSlots.length - requiredSlots; i++) {
      let isConsecutive = true;
      
      // Check if slots are consecutive
      for (let j = 0; j < requiredSlots - 1; j++) {
        if (availableSlots[i + j].end.getTime() !== availableSlots[i + j + 1].start.getTime()) {
          isConsecutive = false;
          break;
        }
      }
      
      if (isConsecutive) {
        consecutiveSlots.push({
          start: availableSlots[i].start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          end: availableSlots[i + requiredSlots - 1].end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        });
      }
    }
    
    // If we didn't find consecutive slots, try to find a single block with the required duration
    if (consecutiveSlots.length === 0 && availableSlots.length > 0) {
      console.log("No consecutive slots found, trying to find a single block");
      
      // Try each available slot as a starting point
      for (let i = 0; i < availableSlots.length; i++) {
        const startTime = availableSlots[i].start;
        const endTime = new Date(startTime.getTime() + (minimumDuration * 60 * 1000));
        
        // Check if end time is within availability 
        if (endTime <= availEnd) {
          // Check if this block overlaps with any existing events
          let hasConflict = false;
          
          for (const event of staffEvents) {
            const eventStart = new Date(event.startTime);
            const eventEnd = new Date(event.endTime);
            
            if (!(endTime <= eventStart || startTime >= eventEnd)) {
              hasConflict = true;
              break;
            }
          }
          
          if (!hasConflict) {
            console.log("Found a valid time block!");
            consecutiveSlots.push({
              start: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
              end: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
            });
            break;
          }
        }
      }
    }
    
    console.log(`Found ${consecutiveSlots.length} consecutive slots`);
    return consecutiveSlots;
  }
  
  // Otherwise, return all available 30-minute slots
  return availableSlots.map(slot => ({
    start: slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    end: slot.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  }));
}
