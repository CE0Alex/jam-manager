import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { format, addDays, startOfWeek, endOfWeek, isToday, parse, addHours } from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatTime12Hour } from "@/lib/timeUtils";
export default function InteractiveScheduleCalendar({ selectedJob, selectedStaffId, onTimeSlotSelect }) {
    const { staff, schedule, settings } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
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
    const handleDateSelect = (date) => {
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
    const handleTimeSlotSelect = (startTime, endTime) => {
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
        const slots = [];
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
    return (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-xl font-bold", children: "Schedule Calendar" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: navigatePrevious, children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentDate(new Date()), children: "Today" }), _jsx(Button, { variant: "outline", size: "sm", onClick: navigateNext, children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-7 gap-1 mb-2", children: weekDays.map((day) => (_jsxs("div", { className: `
                text-center p-2 rounded-md cursor-pointer
                ${isToday(day) ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"}
                ${format(day, "yyyy-MM-dd") === selectedDate ? "ring-2 ring-primary" : ""}
              `, onClick: () => handleDateSelect(day), children: [_jsx("div", { className: "font-medium", children: format(day, "EEE") }), _jsx("div", { children: format(day, "MMM d") })] }, format(day, "yyyy-MM-dd")))) }), _jsxs("div", { className: "mt-4", children: [_jsxs("h3", { className: "font-medium text-lg mb-2", children: ["Available Times on ", format(parse(selectedDate, "yyyy-MM-dd", new Date()), "EEEE, MMMM d")] }), !selectedStaff ? (_jsx("div", { className: "p-4 text-center text-muted-foreground bg-gray-50 rounded-md", children: "Please select a staff member to see availability" })) : !selectedStaff.availability[format(parse(selectedDate, "yyyy-MM-dd", new Date()), "EEEE").toLowerCase()] ? (_jsxs("div", { className: "p-4 text-center text-amber-700 bg-amber-50 rounded-md border border-amber-200", children: [selectedStaff.name, " is not available on ", format(parse(selectedDate, "yyyy-MM-dd", new Date()), "EEEE"), "s"] })) : availableTimeSlots.length === 0 ? (_jsx("div", { className: "p-4 text-center text-muted-foreground bg-gray-50 rounded-md", children: "No available time slots for the selected date" })) : (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2", children: availableTimeSlots.map((slot, index) => (_jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs("div", { className: `
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
                                                    }, children: [_jsxs("div", { className: "font-medium", children: [formatTime12Hour(slot.startTime), " - ", formatTime12Hour(slot.endTime)] }), _jsx("div", { className: "text-xs mt-1", children: slot.isAvailable
                                                                ? _jsx("span", { className: "text-green-600", children: "Available" })
                                                                : _jsx("span", { className: "text-red-600", children: "Unavailable" }) })] }) }), !slot.isAvailable && (_jsx(TooltipContent, { children: _jsx("p", { children: slot.conflictReason || "Time slot unavailable" }) }))] }) }, index))) }))] }), selectedTimeSlot && (_jsxs("div", { className: "mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md", children: [_jsxs("h4", { className: "font-medium flex items-center text-blue-800", children: [_jsx(Clock, { className: "h-4 w-4 mr-2" }), "Selected Schedule"] }), _jsxs("div", { className: "mt-1 text-blue-700", children: [_jsxs("p", { children: [format(parse(selectedDate, "yyyy-MM-dd", new Date()), "EEEE, MMMM d"), " from", " ", formatTime12Hour(selectedTimeSlot.startTime), " to", " ", formatTime12Hour(selectedTimeSlot.endTime)] }), _jsxs("p", { className: "text-sm mt-1", children: ["Duration: ", selectedJob.estimatedHours, " hour(s) based on job estimate"] })] })] }))] })] }));
}
