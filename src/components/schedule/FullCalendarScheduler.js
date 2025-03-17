import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Grid3X3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
export default function FullCalendarScheduler({ selectedJob, selectedStaffId, onTimeSlotSelect }) {
    const { schedule, staff, settings } = useAppContext();
    // Format a date as a string in YYYY-MM-DD format
    const formatDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    // Create a date object from a date string (YYYY-MM-DD) without timezone issues
    const createDateFromString = (dateStr) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0); // Use noon to avoid any day boundary issues
    };
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState("week");
    const [selectedDate, setSelectedDate] = useState(formatDateString(new Date()));
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    // Get the selected staff member
    const selectedStaff = staff.find(s => s.id === selectedStaffId);
    // Calculate available time slots when date or staff changes
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    // For additional validation - check if we can round trip a date through our functions
    // Useful in debugging to ensure our date handling is consistent
    const validateDateFunctions = (dateStr) => {
        try {
            const dateObj = createDateFromString(dateStr);
            const backToString = formatDateString(dateObj);
            console.log(`Validation - Original: ${dateStr}, After round trip: ${backToString}, Match: ${dateStr === backToString}`);
            return dateStr === backToString;
        }
        catch (error) {
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
        if (!selectedStaff.availability[dayOfWeek]) {
            setAvailableTimeSlots([]);
            return;
        }
        // Get availability hours for this day
        const availabilityHours = selectedStaff.availabilityHours?.[dayOfWeek];
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
        const slots = [];
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
                    if ((slotStart < eventEnd && potentialEndTime > eventStart) ||
                        (potentialEndTime > eventStart && slotStart < eventEnd)) {
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
    const handleTimeSlotSelect = (startTime, endTime) => {
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
    const handleDateSelect = (date) => {
        const formattedDate = formatDateString(date);
        // For debugging
        console.log(`Selected date: ${date.toString()}, formatted as: ${formattedDate}`);
        console.log(`Previous selected date was: ${selectedDate}`);
        console.log(`Is same day check: ${isSameDay(date, createDateFromString(selectedDate))}`);
        console.log(`Direct string comparison: ${formattedDate === selectedDate}`);
        setSelectedDate(formattedDate);
    };
    // Get events for a specific day
    const getEventsForDay = (date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        return schedule.filter((event) => {
            const eventStart = new Date(event.startTime);
            const eventStartDate = format(eventStart, "yyyy-MM-dd");
            return eventStartDate === dateStr;
        });
    };
    // Get staff availability for a specific day
    const getStaffAvailability = (date, staffId) => {
        const staffMember = staff.find(s => s.id === staffId);
        if (!staffMember)
            return false;
        // Get day of week reliably
        const dayOfWeek = format(date, "EEEE").toLowerCase();
        return staffMember.availability[dayOfWeek] || false;
    };
    // Format time in 12-hour format
    const formatTime12Hour = (time) => {
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
        return (_jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "grid grid-cols-7 gap-1 text-center border-b pb-2", children: dayNames.map(day => (_jsx("div", { className: "font-medium", children: day }, day))) }), _jsx("div", { className: "grid grid-cols-7 gap-1 mt-2", children: days.map(day => {
                        const formattedDate = format(day, "d");
                        const isToday = isSameDay(day, new Date());
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const dayString = formatDateString(day);
                        const isSelected = dayString === selectedDate;
                        const dayEvents = getEventsForDay(day);
                        const isStaffAvailable = selectedStaffId ? getStaffAvailability(day, selectedStaffId) : true;
                        const dateStr = format(day, "yyyy-MM-dd");
                        return (_jsxs("div", { className: `
                  p-1 h-24 border rounded-md relative
                  ${isCurrentMonth ? "" : "bg-gray-50 text-gray-400"}
                  ${isToday ? "bg-blue-50" : ""}
                  ${isSelected ? "ring-2 ring-primary" : ""}
                  ${!isStaffAvailable && isCurrentMonth ? "bg-gray-100" : ""}
                  cursor-pointer hover:bg-gray-50
                `, onClick: () => handleDateSelect(day), children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsx("span", { className: `text-sm ${isToday ? "bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center" : ""}`, children: formattedDate }), isCurrentMonth && !isStaffAvailable && (_jsx("span", { className: "text-xs bg-red-100 text-red-800 px-1 rounded", children: "Off" }))] }), _jsx("div", { className: "overflow-y-auto h-16 mt-1 text-xs", children: dayEvents.length > 0 && (_jsx("div", { className: "mb-1", children: _jsxs(Badge, { variant: "outline", className: "text-xs", children: [dayEvents.length, " event", dayEvents.length !== 1 ? 's' : ''] }) })) })] }, day.toString()));
                    }) })] }));
    };
    // Render week view
    const renderWeekView = () => {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // End on Sunday
        // Generate array of days for the week view
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
        return (_jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "grid grid-cols-7 gap-1 mb-4", children: weekDays.map((day) => {
                        const isToday = isSameDay(day, new Date());
                        // Instead of comparing with Date objects, compare formatted strings
                        const dayString = formatDateString(day);
                        const isSelected = dayString === selectedDate;
                        const isStaffAvailable = selectedStaffId ? getStaffAvailability(day, selectedStaffId) : true;
                        return (_jsxs("div", { className: `
                  text-center p-2 rounded-md cursor-pointer
                  ${isToday ? "bg-blue-50" : "hover:bg-gray-100"}
                  ${isSelected ? "ring-2 ring-primary" : ""}
                  ${!isStaffAvailable ? "bg-gray-100" : ""}
                `, onClick: () => handleDateSelect(day), children: [_jsx("div", { className: "font-medium", children: format(day, "EEE") }), _jsx("div", { children: format(day, "MMM d") }), !isStaffAvailable && (_jsx("div", { className: "text-xs mt-1 text-red-500", children: "Staff Unavailable" }))] }, format(day, "yyyy-MM-dd")));
                    }) }), _jsxs("div", { className: "mt-4", children: [_jsxs("h3", { className: "font-medium text-lg mb-2", children: ["Available Times on ", format(createDateFromString(selectedDate), "EEEE, MMMM d")] }), !selectedStaff ? (_jsx("div", { className: "p-4 text-center text-muted-foreground bg-gray-50 rounded-md", children: "Please select a staff member to see availability" })) : !selectedStaff.availability[format(createDateFromString(selectedDate), "EEEE").toLowerCase()] ? (_jsxs("div", { className: "p-4 text-center text-amber-700 bg-amber-50 rounded-md border border-amber-200", children: [selectedStaff.name, " is not available on ", format(createDateFromString(selectedDate), "EEEE"), "s"] })) : availableTimeSlots.length === 0 ? (_jsx("div", { className: "p-4 text-center text-muted-foreground bg-gray-50 rounded-md", children: "No available time slots for the selected date" })) : (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2", children: availableTimeSlots.map((slot, index) => (_jsxs("div", { className: `
                    p-3 rounded-md border text-center cursor-pointer
                    ${slot.isAvailable
                                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                    : 'bg-red-50 border-red-200 cursor-not-allowed opacity-60'}
                    ${selectedTimeSlot?.startTime === slot.startTime
                                    ? 'ring-2 ring-primary'
                                    : ''}
                  `, onClick: () => {
                                    if (slot.isAvailable) {
                                        handleTimeSlotSelect(slot.startTime, slot.endTime);
                                    }
                                    else {
                                        toast({
                                            title: "Time Unavailable",
                                            description: slot.conflictReason || "This time slot is not available",
                                            variant: "destructive"
                                        });
                                    }
                                }, children: [_jsxs("div", { className: "font-medium", children: [formatTime12Hour(slot.startTime), " - ", formatTime12Hour(slot.endTime)] }), _jsx("div", { className: "text-xs mt-1", children: slot.isAvailable
                                            ? _jsx("span", { className: "text-green-600", children: "Available" })
                                            : _jsx("span", { className: "text-red-600", children: slot.conflictReason || "Unavailable" }) })] }, index))) }))] })] }));
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
        return (_jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: `
            rounded-md p-4 mb-4
            ${isToday ? "bg-blue-50" : "bg-gray-50"}
            ${isSelected ? "ring-2 ring-primary" : ""}
          `, children: [_jsx("h3", { className: "text-xl font-bold", children: format(currentDate, "EEEE") }), _jsx("p", { className: "text-lg", children: format(currentDate, "MMMM d, yyyy") }), !isStaffAvailable && selectedStaffId && (_jsx("div", { className: "mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700", children: "Selected staff is not available on this day" }))] }), _jsxs("div", { className: "mt-4", children: [_jsx("h3", { className: "font-medium text-lg mb-2", children: "Available Time Slots" }), !selectedStaff ? (_jsx("div", { className: "p-4 text-center text-muted-foreground bg-gray-50 rounded-md", children: "Please select a staff member to see availability" })) : !isStaffAvailable ? (_jsxs("div", { className: "p-4 text-center text-amber-700 bg-amber-50 rounded-md border border-amber-200", children: [selectedStaff.name, " is not available on ", format(currentDate, "EEEE"), "s"] })) : availableTimeSlots.length === 0 ? (_jsx("div", { className: "p-4 text-center text-muted-foreground bg-gray-50 rounded-md", children: "No available time slots for the selected date" })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-2", children: availableTimeSlots.map((slot, index) => (_jsxs("div", { className: `
                    p-3 rounded-md border text-center cursor-pointer
                    ${slot.isAvailable
                                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                    : 'bg-red-50 border-red-200 cursor-not-allowed opacity-60'}
                    ${selectedTimeSlot?.startTime === slot.startTime
                                    ? 'ring-2 ring-primary'
                                    : ''}
                  `, onClick: () => {
                                    if (slot.isAvailable) {
                                        handleTimeSlotSelect(slot.startTime, slot.endTime);
                                    }
                                    else {
                                        toast({
                                            title: "Time Unavailable",
                                            description: slot.conflictReason || "This time slot is not available",
                                            variant: "destructive"
                                        });
                                    }
                                }, children: [_jsxs("div", { className: "font-medium", children: [formatTime12Hour(slot.startTime), " - ", formatTime12Hour(slot.endTime)] }), _jsx("div", { className: "text-xs mt-1", children: slot.isAvailable
                                            ? _jsx("span", { className: "text-green-600", children: "Available" })
                                            : _jsx("span", { className: "text-red-600", children: slot.conflictReason || "Unavailable" }) })] }, index))) }))] })] }));
    };
    // Selected time slot summary
    const renderSelectedTimeSlot = () => {
        if (!selectedTimeSlot)
            return null;
        // Create a proper date object from the string
        const selectedDateObj = createDateFromString(selectedDate);
        return (_jsxs("div", { className: "mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md", children: [_jsxs("h4", { className: "font-medium flex items-center text-blue-800", children: [_jsx(Clock, { className: "h-4 w-4 mr-2" }), "Selected Schedule"] }), _jsxs("div", { className: "mt-1 text-blue-700", children: [_jsxs("p", { children: [format(selectedDateObj, "EEEE, MMMM d"), " from", " ", formatTime12Hour(selectedTimeSlot.startTime), " to", " ", formatTime12Hour(selectedTimeSlot.endTime)] }), _jsxs("p", { className: "text-sm mt-1", children: ["Duration: ", selectedJob.estimatedHours, " hour(s) based on job estimate"] })] })] }));
    };
    return (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-xl font-bold", children: "Schedule Calendar" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Select, { value: view, onValueChange: (value) => setView(value), children: [_jsx(SelectTrigger, { className: "w-[120px]", children: _jsx(SelectValue, { placeholder: "View" }) }), _jsxs(SelectContent, { children: [_jsxs(SelectItem, { value: "month", className: "flex items-center", children: [_jsx(Grid3X3, { className: "h-4 w-4 mr-2" }), "Month"] }), _jsxs(SelectItem, { value: "week", className: "flex items-center", children: [_jsx(CalendarIcon, { className: "h-4 w-4 mr-2" }), "Week"] }), _jsxs(SelectItem, { value: "day", className: "flex items-center", children: [_jsx(CalendarIcon, { className: "h-4 w-4 mr-2" }), "Day"] })] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: navigatePrevious, children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: navigateToday, children: "Today" }), _jsx(Button, { variant: "outline", size: "sm", onClick: navigateNext, children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] })] })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-lg font-medium", children: [view === "month" && format(currentDate, "MMMM yyyy"), view === "week" && (_jsxs(_Fragment, { children: ["Week of ", format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMMM d"), " - ", format(endOfWeek(currentDate, { weekStartsOn: 1 }), "MMMM d, yyyy")] })), view === "day" && format(currentDate, "MMMM d, yyyy")] }), view === "month" && renderMonthView(), view === "week" && renderWeekView(), view === "day" && renderDayView(), renderSelectedTimeSlot()] })] }));
}
