import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, startOfMonth, endOfMonth, isSameMonth, addMonths, subMonths, } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar, Users, Wand2, Clock, Star, Grid3X3, List } from "lucide-react";
import ScheduleEventItem from "./ScheduleEventItem";
import AvailabilityCalendar from "./AvailabilityCalendar";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatTime12Hour } from "@/lib/timeUtils";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import * as autoScheduleUtils from "@/lib/scheduling/autoScheduleUtils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
export default function ProductionCalendar({ initialDate = new Date(), initialView = "week", initialJob = null, onScheduled, }) {
    const { schedule = [], jobs = [], staff = [], addScheduleEvent } = useAppContext?.() || {};
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [view, setView] = useState(initialView);
    const [activeTab, setActiveTab] = useState("schedule");
    // Interactive Schedule Dialog state
    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedStaffId, setSelectedStaffId] = useState("unassigned");
    const [scheduleSuggestions, setScheduleSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [scheduleData, setScheduleData] = useState({
        startDate: format(new Date(), "yyyy-MM-dd"),
        startTime: "09:00",
        endTime: "",
        notes: ""
    });
    // Calculate the start and end of the current week
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // End on Sunday
    // Generate array of days for the week view
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    // Handle calendar navigation based on the view
    const handleCalendarNavigation = (direction) => {
        switch (view) {
            case 'month':
                if (direction === 'prev') {
                    setCurrentDate(subMonths(currentDate, 1));
                }
                else {
                    setCurrentDate(addMonths(currentDate, 1));
                }
                break;
            case 'week':
                if (direction === 'prev') {
                    setCurrentDate(addDays(currentDate, -7));
                }
                else {
                    setCurrentDate(addDays(currentDate, 7));
                }
                break;
            case 'day':
                if (direction === 'prev') {
                    setCurrentDate(addDays(currentDate, -1));
                }
                else {
                    setCurrentDate(addDays(currentDate, 1));
                }
                break;
        }
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
    // Get staff availability hours for a specific day
    const getStaffAvailabilityHours = (date, staffId) => {
        const staffMember = staff.find(s => s.id === staffId);
        if (!staffMember)
            return { start: "09:00", end: "17:00" };
        // Get day of week
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        // Check if staff is available on this day
        if (!staffMember.availability[dayOfWeek]) {
            return null; // Not available on this day
        }
        // Get custom availability hours or use business hours
        const availabilityHours = staffMember.availabilityHours?.[dayOfWeek];
        if (!availabilityHours) {
            // Use business hours as default
            return {
                start: "09:00",
                end: "17:00"
            };
        }
        return availabilityHours;
    };
    // Check if staff is available on a specific day
    const getStaffAvailability = (date, staffId) => {
        const staffMember = staff.find(s => s.id === staffId);
        if (!staffMember)
            return true; // Default to available if staff not found
        // Get day of week
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        // Check if staff is available on this day
        return staffMember.availability[dayOfWeek] || false;
    };
    // Check if a job duration would exceed available hours in a day
    const checkForMultiDayJob = (startDate, startTime, jobDuration) => {
        // If no staff assigned or job duration is less than 1 hour, no need to split
        if (!selectedStaffId || selectedStaffId === "unassigned" || jobDuration < 1) {
            return { needsSplit: false };
        }
        const dateObj = parseISO(startDate);
        const availabilityHours = getStaffAvailabilityHours(dateObj, selectedStaffId);
        // If staff not available on this day, can't schedule
        if (!availabilityHours) {
            return { needsSplit: false, error: "Staff not available on this day" };
        }
        // Calculate end time based on staff availability
        const [startHour, startMinute] = startTime.split(":").map(Number);
        const [availEndHour, availEndMinute] = availabilityHours.end.split(":").map(Number);
        // Calculate minutes from start time to end of availability
        const availableMinutes = (availEndHour - startHour) * 60 + (availEndMinute - startMinute);
        const requiredMinutes = jobDuration * 60;
        if (requiredMinutes > availableMinutes) {
            // Job needs to be split across multiple days
            return {
                needsSplit: true,
                firstDayEndTime: availabilityHours.end,
                firstDayDuration: availableMinutes / 60,
                remainingDuration: (requiredMinutes - availableMinutes) / 60
            };
        }
        return { needsSplit: false };
    };
    // Get job and staff details for an event
    const getEventDetails = (jobId, staffId) => {
        const job = jobs.find((j) => j.id === jobId);
        const staffMember = staffId
            ? staff.find((s) => s.id === staffId)
            : undefined;
        return {
            jobTitle: job?.title || "Unknown Job",
            jobStatus: (job?.status || "pending"),
            staffName: staffMember?.name || "Unassigned",
        };
    };
    // Open the schedule dialog with a selected job
    const openScheduleDialog = (job) => {
        setSelectedJob(job);
        setSelectedStaffId("unassigned");
        setScheduleData({
            startDate: format(new Date(), "yyyy-MM-dd"),
            startTime: "09:00",
            endTime: "",
            notes: ""
        });
        setIsScheduleDialogOpen(true);
        // Generate scheduling suggestions
        generateScheduleSuggestions(job);
    };
    // Close the schedule dialog
    const closeScheduleDialog = () => {
        setIsScheduleDialogOpen(false);
        setSelectedJob(null);
        setSelectedStaffId("unassigned");
    };
    // Handle time slot selection from calendar
    const handleTimeSlotSelect = (date, startTime, endTime) => {
        setScheduleData({
            startDate: date,
            startTime: startTime,
            endTime: endTime,
            notes: ""
        });
    };
    // Generate scheduling suggestions for a job
    const generateScheduleSuggestions = (job) => {
        setIsLoadingSuggestions(true);
        setScheduleSuggestions([]);
        try {
            // Use imported module directly with the correct function name
            const suggestions = autoScheduleUtils.findScheduleSuggestions(job, staff, schedule, 3, // limit to 3 suggestions for UI simplicity
            10 // days to check
            );
            setScheduleSuggestions(suggestions);
        }
        catch (error) {
            console.error("Error generating suggestions:", error);
            toast({
                title: "Failed to generate suggestions",
                description: "There was an error generating schedule suggestions.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoadingSuggestions(false);
        }
    };
    // Apply a scheduling suggestion
    const applySuggestion = (suggestion) => {
        setSelectedStaffId(suggestion.staffId);
        setScheduleData({
            startDate: suggestion.date,
            startTime: suggestion.startTime,
            endTime: suggestion.endTime,
            notes: ""
        });
        toast({
            title: "Suggestion Applied",
            description: `Schedule with ${suggestion.staffName} on ${format(parseISO(suggestion.date), "MMM d")} has been applied.`,
        });
    };
    // Submit the schedule
    const handleScheduleSubmit = () => {
        if (!selectedJob)
            return;
        // Validate required fields
        if (!scheduleData.startDate || !scheduleData.startTime || !scheduleData.endTime) {
            toast({
                title: "Missing Information",
                description: "Please fill out all required scheduling fields",
                variant: "destructive"
            });
            return;
        }
        try {
            // Format the times
            const startDateTime = new Date(scheduleData.startDate);
            const [startHour, startMinute] = scheduleData.startTime.split(":").map(Number);
            startDateTime.setHours(startHour, startMinute);
            const endDateTime = new Date(scheduleData.startDate);
            const [endHour, endMinute] = scheduleData.endTime.split(":").map(Number);
            endDateTime.setHours(endHour, endMinute);
            // Check if end time is before start time (might be the next day)
            if (endDateTime <= startDateTime) {
                endDateTime.setDate(endDateTime.getDate() + 1);
            }
            // Create the event
            const event = {
                jobId: selectedJob.id,
                staffId: selectedStaffId,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                notes: scheduleData.notes || undefined
            };
            // Try to add the event
            const result = addScheduleEvent(event);
            // Check for conflicts
            if (result.conflicts && result.conflicts.length > 0) {
                // Handle conflicts based on severity
                const errorConflicts = result.conflicts.filter(c => c.severity === "error");
                const warningConflicts = result.conflicts.filter(c => c.severity === "warning");
                if (errorConflicts.length > 0) {
                    // Show error for critical conflicts
                    toast({
                        title: "Scheduling Conflicts Detected",
                        description: errorConflicts.map(c => c.message).join(", "),
                        variant: "destructive"
                    });
                    setIsScheduleDialogOpen(true); // Keep the dialog open
                    return; // Don't proceed if there are error conflicts
                }
                else if (warningConflicts.length > 0) {
                    // Show warning for non-critical conflicts but continue
                    toast({
                        title: "Scheduling Warnings",
                        description: warningConflicts.map(c => c.message).join(", ")
                    });
                }
            }
            // Successfully scheduled
            toast({
                title: "Job Scheduled",
                description: `${selectedJob.title} has been scheduled${selectedStaffId ? ` with ${getStaffName(selectedStaffId)}` : ''}`
            });
            // Close the dialog
            setIsScheduleDialogOpen(false);
            // Reset the form
            setSelectedJob(null);
            setSelectedStaffId("");
            setScheduleData({
                startDate: format(new Date(), "yyyy-MM-dd"),
                startTime: "09:00",
                endTime: "10:00",
                notes: ""
            });
            // Refresh the calendar
            setCurrentDate(new Date());
            // Call the onScheduled callback if provided
            if (onScheduled) {
                onScheduled();
            }
        }
        catch (error) {
            console.error("Error scheduling job:", error);
            toast({
                title: "Scheduling Error",
                description: "An unexpected error occurred while scheduling the job",
                variant: "destructive"
            });
        }
    };
    // Find the next available day for a staff after a given date
    const findNextAvailableDay = (currentDateStr, staffId) => {
        if (!staffId || staffId === "unassigned")
            return null;
        const currentDate = parseISO(currentDateStr);
        // Check the next 10 days
        for (let i = 1; i <= 10; i++) {
            const dateToCheck = addDays(currentDate, i);
            const isAvailable = getStaffAvailability(dateToCheck, staffId);
            if (isAvailable) {
                return dateToCheck;
            }
        }
        return null; // No available day found in the next 10 days
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
                        const dayString = format(day, "yyyy-MM-dd");
                        const isSelected = dayString === scheduleData.startDate;
                        const dayEvents = getEventsForDay(day);
                        const isStaffAvailable = selectedStaffId && selectedStaffId !== "unassigned"
                            ? getStaffAvailability(day, selectedStaffId)
                            : true;
                        return (_jsxs("div", { className: `
                  p-1 h-20 border rounded-md relative
                  ${isCurrentMonth ? "" : "bg-gray-50 text-gray-400"}
                  ${isToday ? "bg-blue-50" : ""}
                  ${isSelected ? "ring-2 ring-primary" : ""}
                  ${!isStaffAvailable && isCurrentMonth ? "bg-gray-100" : ""}
                  cursor-pointer hover:bg-gray-50
                `, onClick: () => {
                                if (isCurrentMonth) {
                                    setScheduleData(prev => ({ ...prev, startDate: dayString }));
                                }
                            }, children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsx("span", { className: `text-sm ${isToday ? "bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center" : ""}`, children: formattedDate }), isCurrentMonth && !isStaffAvailable && (_jsx("span", { className: "text-xs bg-red-100 text-red-800 px-1 rounded", children: "Off" }))] }), _jsx("div", { className: "overflow-y-auto h-12 mt-1 text-xs", children: dayEvents.length > 0 && (_jsx("div", { className: "mb-1", children: _jsxs(Badge, { variant: "outline", className: "text-xs", children: [dayEvents.length, " event", dayEvents.length !== 1 ? 's' : ''] }) })) })] }, day.toString()));
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
                        const dayString = format(day, "yyyy-MM-dd");
                        const isSelected = dayString === scheduleData.startDate;
                        const isStaffAvailable = selectedStaffId && selectedStaffId !== "unassigned"
                            ? getStaffAvailability(day, selectedStaffId)
                            : true;
                        return (_jsxs("div", { className: `
                  text-center p-2 rounded-md cursor-pointer
                  ${isToday ? "bg-blue-50" : "hover:bg-gray-100"}
                  ${isSelected ? "ring-2 ring-primary" : ""}
                  ${!isStaffAvailable ? "bg-gray-100" : ""}
                `, onClick: () => setScheduleData(prev => ({ ...prev, startDate: dayString })), children: [_jsx("div", { className: "font-medium", children: format(day, "EEE") }), _jsx("div", { children: format(day, "MMM d") }), !isStaffAvailable && (_jsx("div", { className: "text-xs mt-1 text-red-500", children: "Staff Unavailable" }))] }, format(day, "yyyy-MM-dd")));
                    }) }), _jsxs("div", { className: "mt-4", children: [_jsxs("h3", { className: "font-medium text-lg mb-2", children: ["Available Times on ", format(parseISO(scheduleData.startDate), "EEEE, MMMM d")] }), !selectedStaffId || selectedStaffId === "unassigned" ? (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2", children: Array.from({ length: 10 }, (_, i) => {
                                const hour = i + 8; // Start from 8 AM
                                const startTime = `${hour.toString().padStart(2, "0")}:00`;
                                // Calculate end time based on job's estimated hours
                                const startHour = hour;
                                const startMinute = 0;
                                const totalMinutes = (selectedJob?.estimatedHours || 1) * 60;
                                let endHour = startHour + Math.floor(totalMinutes / 60);
                                let endMinute = startMinute + (totalMinutes % 60);
                                if (endMinute >= 60) {
                                    endHour += 1;
                                    endMinute -= 60;
                                }
                                const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
                                return (_jsx("div", { className: `
                      p-3 rounded-md border text-center cursor-pointer
                      bg-green-50 border-green-200 hover:bg-green-100
                      ${scheduleData.startTime === startTime ? 'ring-2 ring-primary' : ''}
                    `, onClick: () => setScheduleData(prev => ({
                                        ...prev,
                                        startTime,
                                        endTime
                                    })), children: _jsxs("div", { className: "font-medium", children: [formatTime12Hour(startTime), " - ", formatTime12Hour(endTime)] }) }, startTime));
                            }) })) : (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2", children: Array.from({ length: 6 }, (_, i) => {
                                const hour = i + 9; // Start from 9 AM
                                const startTime = `${hour.toString().padStart(2, "0")}:00`;
                                // Calculate end time based on job's estimated hours
                                const startHour = hour;
                                const startMinute = 0;
                                const totalMinutes = (selectedJob?.estimatedHours || 1) * 60;
                                let endHour = startHour + Math.floor(totalMinutes / 60);
                                let endMinute = startMinute + (totalMinutes % 60);
                                if (endMinute >= 60) {
                                    endHour += 1;
                                    endMinute -= 60;
                                }
                                const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
                                return (_jsx("div", { className: `
                      p-3 rounded-md border text-center cursor-pointer
                      bg-green-50 border-green-200 hover:bg-green-100
                      ${scheduleData.startTime === startTime ? 'ring-2 ring-primary' : ''}
                    `, onClick: () => setScheduleData(prev => ({
                                        ...prev,
                                        startTime,
                                        endTime
                                    })), children: _jsxs("div", { className: "font-medium", children: [formatTime12Hour(startTime), " - ", formatTime12Hour(endTime)] }) }, startTime));
                            }) }))] })] }));
    };
    // Update selected date when date or view changes
    useEffect(() => {
        if (view === "day") {
            setScheduleData(prev => ({ ...prev, startDate: format(currentDate, "yyyy-MM-dd") }));
        }
    }, [currentDate, view]);
    // Render day view
    const renderDayView = () => {
        const dayStr = format(currentDate, "yyyy-MM-dd");
        const isToday = isSameDay(currentDate, new Date());
        const currentDateStr = format(currentDate, "yyyy-MM-dd");
        const isSelected = currentDateStr === scheduleData.startDate;
        const isStaffAvailable = selectedStaffId && selectedStaffId !== "unassigned"
            ? getStaffAvailability(currentDate, selectedStaffId)
            : true;
        return (_jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: `
            rounded-md p-4 mb-4
            ${isToday ? "bg-blue-50" : "bg-gray-50"}
            ${isSelected ? "ring-2 ring-primary" : ""}
          `, children: [_jsx("h3", { className: "text-xl font-bold", children: format(currentDate, "EEEE") }), _jsx("p", { className: "text-lg", children: format(currentDate, "MMMM d, yyyy") }), !isStaffAvailable && selectedStaffId && selectedStaffId !== "unassigned" && (_jsx("div", { className: "mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700", children: "Selected staff is not available on this day" }))] }), _jsxs("div", { className: "mt-4", children: [_jsx("h3", { className: "font-medium text-lg mb-2", children: "Available Time Slots" }), !isStaffAvailable && selectedStaffId && selectedStaffId !== "unassigned" ? (_jsxs("div", { className: "p-4 text-center text-amber-700 bg-amber-50 rounded-md border border-amber-200", children: [staff.find(s => s.id === selectedStaffId)?.name || "Selected staff", " is not available on this day"] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-2", children: Array.from({ length: 12 }, (_, i) => {
                                const hour = i + 8; // Start from 8 AM
                                const startTime = `${hour.toString().padStart(2, "0")}:00`;
                                // Calculate end time based on job's estimated hours
                                const startHour = hour;
                                const startMinute = 0;
                                const totalMinutes = (selectedJob?.estimatedHours || 1) * 60;
                                let endHour = startHour + Math.floor(totalMinutes / 60);
                                let endMinute = startMinute + (totalMinutes % 60);
                                if (endMinute >= 60) {
                                    endHour += 1;
                                    endMinute -= 60;
                                }
                                const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
                                return (_jsx("div", { className: `
                      p-3 rounded-md border text-center cursor-pointer
                      bg-green-50 border-green-200 hover:bg-green-100
                      ${scheduleData.startTime === startTime ? 'ring-2 ring-primary' : ''}
                    `, onClick: () => setScheduleData(prev => ({
                                        ...prev,
                                        startTime,
                                        endTime
                                    })), children: _jsxs("div", { className: "font-medium", children: [formatTime12Hour(startTime), " - ", formatTime12Hour(endTime)] }) }, startTime));
                            }) }))] })] }));
    };
    // Add a getStaffName helper function
    const getStaffName = (staffId) => {
        const staffMember = staff.find(s => s.id === staffId);
        return staffMember?.name || "Unknown";
    };
    const loading = isLoadingSuggestions;
    return (_jsxs("div", { className: "space-y-4 bg-white", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Production Schedule" }), _jsxs(Button, { onClick: () => {
                            // Filter to jobs that aren't completed or cancelled
                            const availableJobs = jobs.filter(job => job.status !== "completed" && job.status !== "cancelled");
                            if (availableJobs.length === 0) {
                                toast({
                                    title: "No jobs available",
                                    description: "There are no active jobs to schedule.",
                                    variant: "destructive"
                                });
                                return;
                            }
                            // Show job selection dialog
                            setIsScheduleDialogOpen(true);
                            setSelectedJob(null);
                        }, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Schedule Job"] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "mb-4", children: [_jsxs(TabsTrigger, { value: "schedule", className: "flex items-center", children: [_jsx(Calendar, { className: "h-4 w-4 mr-2" }), "Schedule View"] }), _jsxs(TabsTrigger, { value: "availability", className: "flex items-center", children: [_jsx(Users, { className: "h-4 w-4 mr-2" }), "Staff Availability"] })] }), _jsx(TabsContent, { value: "schedule", children: _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { children: "Schedule" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Select, { value: view, onValueChange: (value) => setView(value), children: [_jsx(SelectTrigger, { className: "w-[120px]", children: _jsx(SelectValue, { placeholder: "View" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "day", children: "Day View" }), _jsx(SelectItem, { value: "week", children: "Week View" }), _jsx(SelectItem, { value: "month", children: "Month View" })] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: () => handleCalendarNavigation('prev'), children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", onClick: () => setCurrentDate(new Date()), children: "Today" }), _jsx(Button, { variant: "outline", size: "icon", onClick: () => handleCalendarNavigation('next'), children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] })] })] }), _jsxs("div", { className: "text-lg font-medium mt-2", children: [view === "month" && format(currentDate, "MMMM yyyy"), view === "week" && `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`, view === "day" && format(currentDate, "MMMM d, yyyy")] })] }), _jsxs(CardContent, { children: [view === "month" && (_jsx("div", { className: "space-y-4", children: renderMonthView() })), view === "day" ? (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "text-lg font-medium", children: format(currentDate, "EEEE") }), _jsx("div", { className: "border rounded-md p-4 min-h-[400px]", children: getEventsForDay(currentDate).length === 0 ? (_jsx("div", { className: "flex items-center justify-center h-64 text-muted-foreground", children: "No events scheduled for this day" })) : (_jsx("div", { className: "space-y-2", children: getEventsForDay(currentDate).map((event) => {
                                                            const { jobTitle, jobStatus, staffName } = getEventDetails(event.jobId, event.staffId);
                                                            return (_jsx(ScheduleEventItem, { event: event, jobTitle: jobTitle, jobStatus: jobStatus, staffName: staffName }, event.id));
                                                        }) })) })] })) : view === "week" ? (_jsx("div", { className: "grid grid-cols-7 gap-4", children: weekDays.map((day) => {
                                                const dayEvents = getEventsForDay(day);
                                                const isToday = isSameDay(day, new Date());
                                                return (_jsxs("div", { className: "min-h-[400px]", children: [_jsxs("div", { className: `text-center p-2 font-medium rounded-t-md ${isToday ? "bg-primary text-primary-foreground" : "bg-muted"}`, children: [_jsx("div", { children: format(day, "EEE") }), _jsx("div", { children: format(day, "d") })] }), _jsx("div", { className: "border-x border-b rounded-b-md p-2 h-full", children: dayEvents.length === 0 ? (_jsx("div", { className: "flex items-center justify-center h-32 text-xs text-muted-foreground", children: "No events" })) : (_jsx("div", { className: "space-y-2", children: dayEvents.map((event) => {
                                                                    const { jobTitle, jobStatus, staffName } = getEventDetails(event.jobId, event.staffId);
                                                                    return (_jsx(ScheduleEventItem, { event: event, jobTitle: jobTitle, jobStatus: jobStatus, staffName: staffName, compact: true }, event.id));
                                                                }) })) })] }, day.toString()));
                                            }) })) : null] })] }) }), _jsx(TabsContent, { value: "availability", children: _jsx(AvailabilityCalendar, {}) })] }), _jsx(Dialog, { open: isScheduleDialogOpen, onOpenChange: setIsScheduleDialogOpen, children: _jsxs(DialogContent, { className: "max-w-5xl max-h-[90vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-xl", children: selectedJob ? `Schedule Job: ${selectedJob.title}` : 'Schedule Job' }), _jsx(DialogDescription, { children: selectedJob ? 'Choose a date and time to schedule this job' : 'Select a job to schedule' })] }), selectedJob ? (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-7 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsxs("div", { className: "bg-card p-4 rounded-lg border shadow-sm", children: [_jsx("h3", { className: "text-lg font-medium mb-4", children: "Job Details" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Title:" }), " ", selectedJob.title] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Client:" }), " ", selectedJob.client] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Estimated Hours:" }), " ", selectedJob.estimatedHours] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Priority:" }), " ", selectedJob.priority] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Assigned Staff" }), _jsxs(Select, { value: selectedStaffId, onValueChange: (value) => {
                                                        setSelectedStaffId(value);
                                                        // Regenerate suggestions when staff changes
                                                        if (selectedJob) {
                                                            generateScheduleSuggestions(selectedJob);
                                                        }
                                                    }, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select staff member" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "unassigned", children: "Unassigned" }), staff.map((member) => (_jsx(SelectItem, { value: member.id, children: member.name }, member.id)))] })] })] }), _jsxs("div", { className: "bg-blue-50 p-4 rounded-lg border border-blue-200", children: [_jsxs("h3", { className: "text-md font-medium flex items-center", children: [_jsx(Wand2, { className: "h-4 w-4 mr-2 text-blue-600" }), "Recommended Schedules"] }), loading ? (_jsx("div", { className: "absolute inset-0 bg-background/80 flex items-center justify-center", children: _jsx(LoadingSpinner, {}) })) : scheduleSuggestions.length > 0 ? (_jsxs("div", { className: "mt-2 space-y-2", children: [scheduleSuggestions
                                                            .filter(s => selectedStaffId === "unassigned" || s.staffId === selectedStaffId)
                                                            .slice(0, 3)
                                                            .map((suggestion, index) => (_jsx("div", { className: `p-2 rounded border cursor-pointer hover:bg-blue-100 transition-colors ${index === 0 ? 'bg-blue-100 border-blue-300' : 'bg-white border-slate-200'}`, onClick: () => applySuggestion(suggestion), children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: suggestion.staffName }), _jsx("p", { className: "text-xs text-slate-500", children: format(parseISO(suggestion.date), "EEEE, MMMM d") })] }), _jsxs("div", { className: "text-xs text-right", children: [_jsxs("p", { children: [formatTime12Hour(suggestion.startTime), " - ", formatTime12Hour(suggestion.endTime)] }), index === 0 && (_jsxs(Badge, { variant: "outline", className: "mt-1 bg-blue-100 text-blue-800 text-[10px] px-1 py-0 h-4", children: [_jsx(Star, { className: "h-2 w-2 mr-1" }), " Best Match"] }))] })] }) }, index))), scheduleSuggestions.length > 0 &&
                                                            scheduleSuggestions.filter(s => selectedStaffId === "unassigned" || s.staffId === selectedStaffId).length === 0 && (_jsx("p", { className: "text-sm text-amber-600 py-2 text-center", children: "No recommendations available for the selected staff member." }))] })) : (_jsx("p", { className: "text-sm text-slate-500 py-2", children: "No suggestions available for this job" }))] })] }), _jsx("div", { className: "lg:col-span-5", children: _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2 flex flex-row items-center justify-between space-y-0", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: "Select a Date & Time" }), _jsx(CardDescription, { children: "Available time slots are shown in green" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Select, { value: view, onValueChange: (value) => setView(value), children: [_jsx(SelectTrigger, { className: "w-[120px]", children: _jsx(SelectValue, { placeholder: "View" }) }), _jsxs(SelectContent, { children: [_jsxs(SelectItem, { value: "month", className: "flex items-center", children: [_jsx(Grid3X3, { className: "h-4 w-4 mr-2" }), "Month"] }), _jsxs(SelectItem, { value: "week", className: "flex items-center", children: [_jsx(Calendar, { className: "h-4 w-4 mr-2" }), "Week"] }), _jsxs(SelectItem, { value: "day", className: "flex items-center", children: [_jsx(List, { className: "h-4 w-4 mr-2" }), "Day"] })] })] }), _jsxs("div", { className: "flex space-x-1", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: () => handleCalendarNavigation('prev'), children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentDate(new Date()), children: "Today" }), _jsx(Button, { variant: "outline", size: "icon", onClick: () => handleCalendarNavigation('next'), children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] })] })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-lg font-medium mb-4", children: [view === "month" && format(currentDate, "MMMM yyyy"), view === "week" && (_jsxs(_Fragment, { children: ["Week of ", format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMMM d"), " - ", format(endOfWeek(currentDate, { weekStartsOn: 1 }), "MMMM d, yyyy")] })), view === "day" && format(currentDate, "MMMM d, yyyy")] }), view === "month" && renderMonthView(), view === "week" && renderWeekView(), view === "day" && renderDayView(), scheduleData.startTime && scheduleData.endTime && (_jsxs("div", { className: "mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md", children: [_jsxs("h4", { className: "font-medium flex items-center text-blue-800", children: [_jsx(Clock, { className: "h-4 w-4 mr-2" }), "Selected Schedule"] }), _jsxs("div", { className: "mt-1 text-blue-700", children: [_jsxs("p", { children: [format(parseISO(scheduleData.startDate), "EEEE, MMMM d"), " from", " ", formatTime12Hour(scheduleData.startTime), " to", " ", formatTime12Hour(scheduleData.endTime)] }), _jsxs("p", { className: "text-sm mt-1", children: ["Duration: ", selectedJob.estimatedHours, " hour(s) based on job estimate"] }), selectedStaffId !== "unassigned" && (_jsxs("p", { className: "text-sm mt-1", children: ["Assigned to: ", staff.find(s => s.id === selectedStaffId)?.name || "Unknown"] }))] })] }))] })] }) })] })) : (_jsx("div", {})), _jsxs(DialogFooter, { className: "flex justify-between items-center mt-4", children: [_jsx(Button, { variant: "outline", onClick: closeScheduleDialog, children: "Cancel" }), selectedJob ? (_jsx(Button, { onClick: handleScheduleSubmit, disabled: !selectedJob || !scheduleData.startTime || !scheduleData.endTime, children: "Schedule Job" })) : (_jsx(Button, { disabled: true, children: "Select a job to continue" }))] })] }) })] }));
}
