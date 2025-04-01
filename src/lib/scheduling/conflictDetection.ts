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
 * Normalizes a date string to ensure consistent timezone handling
 * @param dateTimeString ISO date string
 * @returns Date object normalized to user's local timezone
 */
export function normalizeDate(dateTimeString: string): Date {
  const date = new Date(dateTimeString);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    0,
    0
  );
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
  
  // Use normalized dates for consistent comparison
  const newStart = normalizeDate(newEvent.startTime);
  const newEnd = normalizeDate(newEvent.endTime);
  
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
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayOfWeek = dayNames[new Date(newStart).getDay()];
  
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
        
        // Create date objects in the same day as the event for proper comparison
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
        // Get just the date part (YYYY-MM-DD) for consistent comparison
        const newEventDate = newStart.toISOString().split('T')[0];
        const blockedTimesForDate = staffMember.blockedTimes.filter(
          bt => bt.date === newEventDate
        );
        
        for (const blockedTime of blockedTimesForDate) {
          const [blockStartHour, blockStartMinute] = blockedTime.start.split(":").map(Number);
          const [blockEndHour, blockEndMinute] = blockedTime.end.split(":").map(Number);
          
          // Create date objects in the same day as the event for proper comparison
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
      // Use normalized dates for consistent comparison
      const existingStart = normalizeDate(existingEvent.startTime);
      const existingEnd = normalizeDate(existingEvent.endTime);
      
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
      // Use normalized dates for consistent comparison
      const existingStart = normalizeDate(existingEvent.startTime);
      const existingEnd = normalizeDate(existingEvent.endTime);
      
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
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayOfWeek = dayNames[new Date(date).getDay()];
  
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
  
  // Create normalized date objects for start and end of availability
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
  
  // Get the date string in YYYY-MM-DD format for comparison
  const dateString = date.toISOString().split('T')[0];
  
  // Filter out slots that have existing events
  const staffEvents = existingEvents.filter(event => {
    // Normalize the event date for comparison
    const eventDate = normalizeDate(event.startTime);
    return event.staffId === staffId && 
      eventDate.toISOString().split('T')[0] === dateString;
  });
  
  // Apply blocked times filter
  const blockedTimesForDate = staffMember.blockedTimes?.filter(
    bt => bt.date === dateString
  ) || [];
  
  // Convert blocked times to Date objects on the same day
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
      const eventStart = normalizeDate(event.startTime);
      const eventEnd = normalizeDate(event.endTime);
      return !(slot.end <= eventStart || slot.start >= eventEnd);
    });
    
    if (hasEventConflict) return false;
    
    // Check against blocked times
    const hasBlockedConflict = blockedTimes.some(block => {
      return !(slot.end <= block.start || slot.start >= block.end);
    });
    
    return !hasBlockedConflict;
  });
  
  // If we need slots for a longer duration than 30 minutes
  if (minimumDuration > 30) {
    const requiredConsecutiveSlots = Math.ceil(minimumDuration / 30);
    const result: Array<{ start: string, end: string }> = [];
    
    // Find consecutive available slots that satisfy the minimum duration
    for (let i = 0; i <= availableSlots.length - requiredConsecutiveSlots; i++) {
      let consecutiveCount = 1;
      let startSlot = availableSlots[i];
      let endSlot = availableSlots[i];
      
      // Check how many consecutive slots we have starting at this position
      for (let j = i + 1; j < availableSlots.length && consecutiveCount < requiredConsecutiveSlots; j++) {
        if (availableSlots[j-1].end.getTime() === availableSlots[j].start.getTime()) {
          consecutiveCount++;
          endSlot = availableSlots[j];
        } else {
          break;
        }
      }
      
      // If we found enough consecutive slots, add this time range
      if (consecutiveCount >= requiredConsecutiveSlots) {
        result.push({
          start: startSlot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          end: endSlot.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        });
        
        // Skip to the next non-included slot to avoid duplicate ranges
        i += (consecutiveCount - 1);
      }
    }
    
    return result;
  }
  
  // For 30-minute slots, just return all available slots
  return availableSlots.map(slot => ({
    start: slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    end: slot.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  }));
}
