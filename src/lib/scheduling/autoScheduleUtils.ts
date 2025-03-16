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
    
    console.log("Checking staff member:", staffMember.name);
    
    // Check each day
    for (let dayOffset = 0; dayOffset < daysToCheck; dayOffset++) {
      const checkDate = addDays(startDate, dayOffset);
      const dateString = format(checkDate, "yyyy-MM-dd");
      const dayOfWeek = format(checkDate, "EEEE").toLowerCase();
      
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
  // Simple scoring mechanism - check if any skills match job type
  const jobTypeString = job.jobType.replace('_', ' ');
  
  // Count matching skills
  let matchCount = staffMember.skills.filter(skill => 
    skill.toLowerCase().includes(jobTypeString) || 
    jobTypeString.includes(skill.toLowerCase())
  ).length;
  
  // Base score on matches - 100 if at least one match, otherwise 50
  return matchCount > 0 ? 100 : 50;
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
