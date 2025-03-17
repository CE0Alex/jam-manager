import { getAvailableTimeSlots } from "./conflictDetection";
import { format, addDays, parseISO } from "date-fns";
/**
 * Generate automatic scheduling suggestions for a job
 * @param job The job to schedule
 * @param staff Available staff members
 * @param existingEvents Existing schedule events
 * @param maxSuggestions Maximum number of suggestions to return (default 5)
 * @param daysToCheck Number of future days to check (default 10)
 * @returns Array of scheduling suggestions
 */
export function generateSchedulingSuggestions(job, staff, existingEvents, maxSuggestions = 5, daysToCheck = 10) {
    // Calculate required time slots (30 min each) based on estimated hours
    const requiredTimeSlots = Math.ceil(job.estimatedHours * 2); // 2 slots per hour
    // Filter staff with appropriate skills for this job type
    const eligibleStaff = staff.filter(staffMember => {
        // If job has specific skill requirements, check against staff skills
        if (job.jobType === "embroidery") {
            return staffMember.skills.some(skill => skill.toLowerCase().includes("embroidery") ||
                skill.toLowerCase().includes("sewing") ||
                skill.toLowerCase().includes("digitizing"));
        }
        else if (job.jobType === "screen_printing") {
            return staffMember.skills.some(skill => skill.toLowerCase().includes("screen") ||
                skill.toLowerCase().includes("printing") ||
                skill.toLowerCase().includes("press"));
        }
        else if (job.jobType === "digital_printing") {
            return staffMember.skills.some(skill => skill.toLowerCase().includes("digital") ||
                skill.toLowerCase().includes("printing") ||
                skill.toLowerCase().includes("dtg") ||
                skill.toLowerCase().includes("design"));
        }
        else if (job.jobType === "wide_format") {
            return staffMember.skills.some(skill => skill.toLowerCase().includes("wide format") ||
                skill.toLowerCase().includes("large format") ||
                skill.toLowerCase().includes("printing"));
        }
        // For central facility or if no matching skills found, consider all staff
        return true;
    });
    console.log("Generating suggestions for job:", job.title);
    console.log("Eligible staff:", eligibleStaff.map(s => s.name));
    // Generate all possible time slots
    const suggestions = [];
    const today = new Date();
    // Check each staff member
    for (const staffMember of eligibleStaff) {
        console.log("Checking availability for staff:", staffMember.name);
        // Check each day
        for (let dayOffset = 0; dayOffset < daysToCheck; dayOffset++) {
            const checkDate = addDays(today, dayOffset);
            const dateString = format(checkDate, "yyyy-MM-dd");
            console.log(`Checking date ${dateString} for ${staffMember.name}`);
            // Get available time slots for this staff on this day
            const availableSlots = getAvailableTimeSlots(staffMember.id, checkDate, staff, existingEvents, job.estimatedHours * 60 // Convert hours to minutes
            );
            console.log(`Found ${availableSlots.length} available slots`);
            // If we found slots that can accommodate the job
            if (availableSlots.length > 0) {
                for (const slot of availableSlots) {
                    // Calculate how well this staff member's skills match the job
                    const relevanceScore = calculateSkillRelevance(staffMember, job);
                    // Calculate how well this time slot utilizes the staff member's available time
                    const utilizationScore = calculateUtilizationScore(slot, staffMember, checkDate, existingEvents);
                    // Calculate total score (weighted combination)
                    const totalScore = (relevanceScore * 0.7) + (utilizationScore * 0.3);
                    suggestions.push({
                        staffId: staffMember.id,
                        staffName: staffMember.name,
                        date: dateString,
                        startTime: slot.start,
                        endTime: slot.end,
                        conflictFree: true,
                        relevanceScore,
                        utilizationScore,
                        totalScore
                    });
                }
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
 * @param staffMember Staff member to evaluate
 * @param job Job to be performed
 * @returns Score from 0-100 indicating skill relevance
 */
function calculateSkillRelevance(staffMember, job) {
    // Define keywords relevant to each job type
    const jobTypeKeywords = {
        embroidery: ["embroidery", "sewing", "digitizing", "embroiderer", "garment"],
        screen_printing: ["screen", "printing", "press", "ink", "screens", "screen printing"],
        digital_printing: ["digital", "printing", "dtg", "direct to garment", "design"],
        wide_format: ["wide format", "large format", "banner", "sign", "vinyl"],
        central_facility: ["production", "management", "scheduling", "quality control"]
    };
    // Get keywords for this job type
    const relevantKeywords = jobTypeKeywords[job.jobType];
    // Count matching skills
    let matchCount = 0;
    let keywordMatchQuality = 0;
    for (const skill of staffMember.skills) {
        const skillLower = skill.toLowerCase();
        // Check for exact matches
        if (relevantKeywords.includes(skillLower)) {
            matchCount++;
            keywordMatchQuality += 2; // Exact match is weighted more
        }
        else {
            // Check for partial matches
            for (const keyword of relevantKeywords) {
                if (skillLower.includes(keyword) || keyword.includes(skillLower)) {
                    matchCount++;
                    keywordMatchQuality += 1; // Partial match
                    break;
                }
            }
        }
    }
    // Calculate score based on matches and quality
    const baseScore = (matchCount / Math.max(1, staffMember.skills.length)) * 50;
    const qualityScore = Math.min(50, keywordMatchQuality * 10);
    return Math.min(100, baseScore + qualityScore);
}
/**
 * Calculate how well a time slot utilizes a staff member's availability
 * @param slot Time slot to evaluate
 * @param staffMember Staff member being scheduled
 * @param date Date of the slot
 * @param existingEvents Existing scheduled events
 * @returns Score from 0-100 indicating utilization efficiency
 */
function calculateUtilizationScore(slot, staffMember, date, existingEvents) {
    const dayOfWeek = format(date, "EEEE").toLowerCase();
    const dateString = format(date, "yyyy-MM-dd");
    // Get availability hours for this day
    const availabilityHours = staffMember.availabilityHours?.[dayOfWeek];
    if (!availabilityHours) {
        return 50; // Default middle score if no specific hours
    }
    // Get staff events for this day
    const staffEvents = existingEvents.filter(event => event.staffId === staffMember.id &&
        format(parseISO(event.startTime), "yyyy-MM-dd") === dateString);
    // If there are no other events, prioritize booking in the middle of the day
    if (staffEvents.length === 0) {
        // Parse availability start and end
        const [availStartHour, availStartMin] = availabilityHours.start.split(":").map(Number);
        const [availEndHour, availEndMin] = availabilityHours.end.split(":").map(Number);
        // Calculate minutes from start of availability to middle of the day
        const availabilityStartMinutes = availStartHour * 60 + availStartMin;
        const availabilityEndMinutes = availEndHour * 60 + availEndMin;
        const midpointMinutes = (availabilityStartMinutes + availabilityEndMinutes) / 2;
        // Parse slot start time
        const [slotStartHour, slotStartMin] = slot.start.split(":").map(Number);
        const slotStartMinutes = slotStartHour * 60 + slotStartMin;
        // Calculate distance from midpoint (normalized to 0-100)
        const maxDistance = (availabilityEndMinutes - availabilityStartMinutes) / 2;
        const distance = Math.abs(slotStartMinutes - midpointMinutes);
        const normalizedDistance = distance / Math.max(1, maxDistance);
        // Convert to score (closer to midpoint = higher score)
        return 100 - (normalizedDistance * 100);
    }
    // If there are other events, prioritize booking adjacent to existing events
    let bestAdjacentScore = 0;
    for (const event of staffEvents) {
        const eventStart = parseISO(event.startTime);
        const eventEnd = parseISO(event.endTime);
        // Parse slot times
        const [slotStartHour, slotStartMin] = slot.start.split(":").map(Number);
        const [slotEndHour, slotEndMin] = slot.end.split(":").map(Number);
        // Create Date objects for slot times
        const slotStart = new Date(date);
        slotStart.setHours(slotStartHour, slotStartMin, 0, 0);
        const slotEnd = new Date(date);
        slotEnd.setHours(slotEndHour, slotEndMin, 0, 0);
        // Check if slot is adjacent to event start
        if (Math.abs(slotEnd.getTime() - eventStart.getTime()) <= 15 * 60 * 1000) {
            bestAdjacentScore = 100;
            break;
        }
        // Check if slot is adjacent to event end
        if (Math.abs(slotStart.getTime() - eventEnd.getTime()) <= 15 * 60 * 1000) {
            bestAdjacentScore = 100;
            break;
        }
        // Check for near adjacency and assign partial scores
        const distanceToStart = Math.abs(slotEnd.getTime() - eventStart.getTime()) / (60 * 60 * 1000);
        const distanceToEnd = Math.abs(slotStart.getTime() - eventEnd.getTime()) / (60 * 60 * 1000);
        if (distanceToStart < 1) {
            bestAdjacentScore = Math.max(bestAdjacentScore, 100 - (distanceToStart * 100));
        }
        if (distanceToEnd < 1) {
            bestAdjacentScore = Math.max(bestAdjacentScore, 100 - (distanceToEnd * 100));
        }
    }
    return bestAdjacentScore;
}
/**
 * Create a schedule event from a suggestion
 * @param suggestion Scheduling suggestion
 * @param job Job to be scheduled
 * @returns Schedule event object ready to be added
 */
export function createEventFromSuggestion(suggestion, job) {
    return {
        jobId: job.id,
        staffId: suggestion.staffId,
        startTime: `${suggestion.date}T${suggestion.startTime}:00`,
        endTime: `${suggestion.date}T${suggestion.endTime}:00`,
        isAutoScheduled: true,
    };
}
