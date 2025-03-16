/**
 * Format a time string from 24-hour format to 12-hour format
 * @param time Time string in 24-hour format (HH:MM)
 * @returns Time string in 12-hour format (h:MM AM/PM)
 */
export function formatTime12Hour(time: string): string {
  if (!time) return "";
  
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format a time string from 12-hour format to 24-hour format
 * @param time12 Time string in 12-hour format (h:MM AM/PM)
 * @returns Time string in 24-hour format (HH:MM)
 */
export function formatTime24Hour(time12: string): string {
  if (!time12) return "";
  
  const [timePart, period] = time12.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);
  
  if (period.toUpperCase() === 'PM' && hours < 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Generate time options in 30-minute increments for a given time range
 * @param startHour Starting hour (0-23)
 * @param endHour Ending hour (0-23)
 * @param use12Hour Whether to return in 12-hour format (default true)
 * @returns Array of time strings in 30-minute increments
 */
export function generateTimeOptions(
  startHour = 8, 
  endHour = 17, 
  use12Hour = true
): string[] {
  const options: string[] = [];
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute of [0, 30]) {
      // Skip 17:30 if endHour is 17
      if (hour === endHour && minute === 30) continue;
      
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      if (use12Hour) {
        options.push(formatTime12Hour(time24));
      } else {
        options.push(time24);
      }
    }
  }
  
  return options;
}

/**
 * Parse display time (12-hour or 24-hour format) to 24-hour format
 * @param displayTime Time as displayed in the UI
 * @returns Time in 24-hour format (HH:MM)
 */
export function parseDisplayTime(displayTime: string): string {
  if (!displayTime) return "";
  
  // Check if it's already in 24-hour format
  if (displayTime.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    return displayTime;
  }
  
  // Handle 12-hour format
  if (displayTime.toLowerCase().includes('am') || displayTime.toLowerCase().includes('pm')) {
    return formatTime24Hour(displayTime);
  }
  
  // Attempt to parse other formats
  try {
    const timeParts = displayTime.replace(/[^0-9:]/g, '').split(':');
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    // Adjust hours if PM is in the string
    if (displayTime.toLowerCase().includes('pm') && hours < 12) {
      hours += 12;
    } else if (displayTime.toLowerCase().includes('am') && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error parsing time:', displayTime);
    return '00:00'; // Default to midnight if parsing fails
  }
}
