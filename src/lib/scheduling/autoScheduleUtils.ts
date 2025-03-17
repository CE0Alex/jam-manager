import { Job, ScheduleEvent, StaffMember } from "@/types";
import { format, addDays, parseISO, addMinutes } from "date-fns";
import { formatTime12Hour } from "../timeUtils";

interface ScheduleSuggestion {
  staffId: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  conflictFree: boolean;
  relevanceScore: number; 
  utilizationScore: number;
  totalScore: number;
}

/**
 * Generate suggestions for scheduling a job
 */
export function findScheduleSuggestions(
  job: Job,
  staff: StaffMember[],
  schedule: ScheduleEvent[],
  maxSuggestions = 5,
  daysToCheck = 10
): ScheduleSuggestion[] {
  console.log("Finding schedule suggestions for job:", job.title);
  const suggestions: ScheduleSuggestion[] = [];
  
  // Start checking from tomorrow
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  // Check each staff member
  for (const staffMember of staff) {
    // Skip if staff member has no skills or availability
    if (!staffMember.skills.length) continue;
    
    // Skip if staff member doesn't have the capability for this job type
    if (staffMember.jobTypeCapabilities && 
        staffMember.jobTypeCapabilities.length > 0 && 
        !staffMember.jobTypeCapabilities.includes(job.jobType)) {
      console.log(`Skipping ${staffMember.name} as they don't have capability for ${job.jobType}`);
      continue;
    }
    
    console.log("Checking staff member:", staffMember.name);
    
    // Check each day
    for (let dayOffset = 0; dayOffset < daysToCheck; dayOffset++) {
      const checkDate = addDays(startDate, dayOffset);
      const dateString = format(checkDate, "yyyy-MM-dd");
      const dayOfWeek = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      // Skip if staff is not available on this day
      if (!staffMember.availability[dayOfWeek as keyof typeof staffMember.availability]) {
        continue;
      }
      
      console.log(`Checking date ${dateString} for ${staffMember.name}`);
      
      // Get availability hours for this day
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
      
      // Check each possible time in 30-min increments
      const dayStart = new Date(checkDate);
      dayStart.setHours(startHour, startMinute, 0, 0);
      
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(endHour, endMinute, 0, 0);
      
      // Get existing events for this day and staff
      const existingEvents = schedule.filter(event => 
        event.staffId === staffMember.id && 
        format(new Date(event.startTime), "yyyy-MM-dd") === dateString
      );
      
      // Try each possible start time
      let currentTime = new Date(dayStart);
      const requiredDuration = job.estimatedHours * 60; // Convert to minutes
      
      while (currentTime <= dayEnd) {
        // Calculate end time
        const endTime = addMinutes(currentTime, requiredDuration);
        
        // Skip if end time exceeds day end
        if (endTime > dayEnd) {
          currentTime = addMinutes(currentTime, 30);
          continue;
        }
        
        // Check if this slot conflicts with existing events
        const hasConflict = existingEvents.some(event => {
          const eventStart = new Date(event.startTime);
          const eventEnd = new Date(event.endTime);
          
          // Check for overlap
          return !(endTime <= eventStart || currentTime >= eventEnd);
        });
        
        if (!hasConflict) {
          // This is an available slot - add to suggestions
          // Calculate scores
          const relevanceScore = calculateSkillRelevance(staffMember, job);
          const utilizationScore = 80; // Default good score for simplicity
          const totalScore = (relevanceScore * 0.7) + (utilizationScore * 0.3);
          
          suggestions.push({
            staffId: staffMember.id,
            staffName: staffMember.name,
            date: dateString,
            startTime: format(currentTime, "HH:mm"),
            endTime: format(endTime, "HH:mm"),
            conflictFree: true,
            relevanceScore,
            utilizationScore,
            totalScore
          });
          
          // If we have enough suggestions for this staff member, move to next
          if (suggestions.filter(s => s.staffId === staffMember.id).length >= 2) {
            break;
          }
        }
        
        // Move to next time slot
        currentTime = addMinutes(currentTime, 30);
      }
    }
  }
  
  // Sort by total score (descending) and limit to max suggestions
  return suggestions
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, maxSuggestions);
}

/**
 * Calculate how relevant a staff member's skills are for a job
 */
function calculateSkillRelevance(staffMember: StaffMember, job: Job): number {
  // First check if they have capability for this job type
  if (staffMember.jobTypeCapabilities && 
      staffMember.jobTypeCapabilities.includes(job.jobType)) {
    return 100; // Perfect match - they are qualified for this job type
  }
  
  // Legacy fallback - check skills
  const jobTypeString = job.jobType.replace('_', ' ');
  
  // Count matching skills
  let matchCount = staffMember.skills.filter(skill => 
    skill.toLowerCase().includes(jobTypeString) || 
    jobTypeString.includes(skill.toLowerCase())
  ).length;
  
  // Base score on matches - 80 if at least one match, otherwise 50
  return matchCount > 0 ? 80 : 50;
}

/**
 * Format a suggestion for display
 */
export function formatSuggestion(suggestion: ScheduleSuggestion): string {
  const formattedDate = format(new Date(suggestion.date), "EEE, MMM d");
  const formattedStartTime = formatTime12Hour(suggestion.startTime);
  const formattedEndTime = formatTime12Hour(suggestion.endTime);
  
  return `${suggestion.staffName} on ${formattedDate} at ${formattedStartTime} - ${formattedEndTime}`;
}

/**
 * Generate scheduling suggestions specifically for a given staff member
 */
export function generateCustomSuggestionsForStaff(
  job: Job,
  staffMember: StaffMember,
  schedule: ScheduleEvent[],
  maxSuggestions = 5,
  daysToCheck = 10
): ScheduleSuggestion[] {
  console.log("Generating custom suggestions for staff:", staffMember.name);
  
  // Check if staff member has the capability for this job type
  if (staffMember.jobTypeCapabilities && 
      staffMember.jobTypeCapabilities.length > 0 && 
      !staffMember.jobTypeCapabilities.includes(job.jobType)) {
    console.log(`${staffMember.name} doesn't have capability for job type: ${job.jobType}`);
    return [];
  }
  
  const suggestions: ScheduleSuggestion[] = [];
  
  // Start checking from today
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  // Check each day
  for (let dayOffset = 0; dayOffset < daysToCheck; dayOffset++) {
    const checkDate = addDays(startDate, dayOffset);
    const dateString = format(checkDate, "yyyy-MM-dd");
    const dayOfWeek = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Skip if staff is not available on this day
    if (!staffMember.availability[dayOfWeek as keyof typeof staffMember.availability]) {
      continue;
    }
    
    // Get availability hours for this day
    const availabilityHours = staffMember.availabilityHours?.[dayOfWeek as keyof typeof staffMember.availabilityHours];
    
    // Default to 8am-5pm if not specified
    const defaultStart = "08:00";
    const defaultEnd = "17:00";
    const { start, end } = availabilityHours || { start: defaultStart, end: defaultEnd };
    
    // Parse hours
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    
    // Setup time range for this day
    const dayStart = new Date(checkDate);
    dayStart.setHours(startHour, startMinute, 0, 0);
    
    const dayEnd = new Date(checkDate);
    dayEnd.setHours(endHour, endMinute, 0, 0);
    
    // Get existing events for this day and staff
    const existingEvents = schedule.filter(event => 
      event.staffId === staffMember.id && 
      format(new Date(event.startTime), "yyyy-MM-dd") === dateString
    );
    
    // Try standard time slots
    const timeSlots = [
      { start: "08:00", end: null },  // Morning
      { start: "09:00", end: null },
      { start: "10:00", end: null },
      { start: "12:00", end: null },  // Afternoon
      { start: "13:00", end: null },
      { start: "14:00", end: null }
    ];
    
    // Calculate end times based on job duration
    timeSlots.forEach(slot => {
      const [startHour, startMin] = slot.start.split(':').map(Number);
      const durationMinutes = job.estimatedHours * 60;
      
      let endHours = startHour + Math.floor(durationMinutes / 60);
      let endMinutes = startMin + (durationMinutes % 60);
      
      if (endMinutes >= 60) {
        endHours += 1;
        endMinutes -= 60;
      }
      
      // Format as HH:MM
      slot.end = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    });
    
    for (const slot of timeSlots) {
      const [slotStartHour, slotStartMinute] = slot.start.split(":").map(Number);
      const [slotEndHour, slotEndMinute] = slot.end.split(":").map(Number);
      
      const slotStart = new Date(checkDate);
      slotStart.setHours(slotStartHour, slotStartMinute, 0, 0);
      
      const slotEnd = new Date(checkDate);
      slotEnd.setHours(slotEndHour, slotEndMinute, 0, 0);
      
      // Skip if slot is outside staff availability
      if (slotStart < dayStart || slotEnd > dayEnd) {
        continue;
      }
      
      // Check for conflicts with existing events
      const hasConflict = existingEvents.some(event => {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        
        // Check for overlap
        return !(slotEnd <= eventStart || slotStart >= eventEnd);
      });
      
      if (!hasConflict) {
        // This is an available slot - add to suggestions
        suggestions.push({
          staffId: staffMember.id,
          staffName: staffMember.name,
          date: dateString,
          startTime: slot.start,
          endTime: slot.end,
          conflictFree: true,
          relevanceScore: 100,  // Staff already selected, so relevance is max
          utilizationScore: 90,
          totalScore: 95
        });
      }
    }
    
    // If we found suggestions for this day, check the next day
    if (suggestions.length >= maxSuggestions) {
      break;
    }
  }
  
  return suggestions.slice(0, maxSuggestions);
}

/**
 * Create a schedule event from a suggestion
 */
export function createEventFromSuggestion(
  suggestion: ScheduleSuggestion,
  job: Job
): Omit<ScheduleEvent, "id"> {
  return {
    jobId: job.id,
    staffId: suggestion.staffId,
    startTime: `${suggestion.date}T${suggestion.startTime}:00`,
    endTime: `${suggestion.date}T${suggestion.endTime}:00`,
    isAutoScheduled: true,
  };
}
