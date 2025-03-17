import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { format, addDays, subDays, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, parseISO, } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, FileText, Grid3X3, List, Users, } from "lucide-react";
export default function DashboardCalendar() {
    // Force component to render with a key
    React.useEffect(() => {
        console.log("DashboardCalendar mounted");
    }, []);
    const navigate = useNavigate();
    const { jobs, schedule, staff, getJobById } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState("month");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    useEffect(() => {
        if (selectedEvent) {
            const job = getJobById(selectedEvent.jobId);
            if (job) {
                setSelectedJob(job);
            }
        }
    }, [selectedEvent, getJobById]);
    const navigatePrevious = () => {
        switch (view) {
            case "month":
                setCurrentDate(subMonths(currentDate, 1));
                break;
            case "week":
                setCurrentDate(subDays(currentDate, 7));
                break;
            case "day":
                setCurrentDate(subDays(currentDate, 1));
                break;
            default:
                setCurrentDate(subDays(currentDate, 7));
        }
    };
    const navigateNext = () => {
        switch (view) {
            case "month":
                setCurrentDate(addMonths(currentDate, 1));
                break;
            case "week":
                setCurrentDate(addDays(currentDate, 7));
                break;
            case "day":
                setCurrentDate(addDays(currentDate, 1));
                break;
            default:
                setCurrentDate(addDays(currentDate, 7));
        }
    };
    const navigateToday = () => {
        setCurrentDate(new Date());
    };
    const getEventsForDay = (date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        return schedule.filter((event) => {
            const eventStart = new Date(event.startTime);
            const eventStartDate = format(eventStart, "yyyy-MM-dd");
            return eventStartDate === dateStr;
        });
    };
    const getEventDetails = (jobId, staffId) => {
        const job = jobs.find((j) => j.id === jobId);
        const staffMember = staffId
            ? staff.find((s) => s.id === staffId)
            : undefined;
        return {
            jobTitle: job?.title || "Unknown Job",
            jobStatus: job?.status || "pending",
            staffName: staffMember?.name || "Unassigned",
        };
    };
    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsDetailOpen(true);
        // Also fetch the job details right away
        const job = getJobById(event.jobId);
        if (job) {
            setSelectedJob(job);
        }
    };
    const getStatusColor = (status) => {
        const statusColors = {
            pending: "bg-blue-100 border-blue-300 text-blue-800",
            in_progress: "bg-yellow-100 border-yellow-300 text-yellow-800",
            review: "bg-purple-100 border-purple-300 text-purple-800",
            completed: "bg-green-100 border-green-300 text-green-800",
            cancelled: "bg-red-100 border-red-300 text-red-800",
        };
        return statusColors[status] || statusColors.pending;
    };
    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
        const dateFormat = "d";
        const days = [];
        const rows = [];
        // Create header row with day names
        const dayNames = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ];
        const daysHeader = dayNames.map((day) => (_jsx("div", { className: "text-center p-2 font-medium", children: day }, day)));
        // Create calendar grid
        let day = startDate;
        let formattedDate = "";
        while (day <= endDate) {
            const weekDays = [];
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, monthStart);
                weekDays.push(_jsxs("div", { className: `min-h-[100px] border p-1 ${isToday ? "bg-blue-50" : ""} ${!isCurrentMonth ? "bg-gray-100 text-gray-400" : ""}`, children: [_jsx("div", { className: "text-right mb-1", children: _jsx("span", { className: `text-sm ${isToday ? "bg-blue-500 text-white rounded-full w-6 h-6 inline-block text-center" : ""}`, children: formattedDate }) }), _jsx("div", { className: "overflow-y-auto max-h-[80px]", children: dayEvents.map((event) => {
                                const { jobTitle, jobStatus } = getEventDetails(event.jobId, event.staffId);
                                return (_jsxs("div", { className: `text-xs p-1 mb-1 rounded cursor-pointer truncate ${getStatusColor(jobStatus)}`, onClick: () => handleEventClick(event), children: [format(parseISO(event.startTime), "h:mm a"), " - ", jobTitle] }, event.id));
                            }) })] }, day.toString()));
                day = addDays(day, 1);
            }
            rows.push(_jsx("div", { className: "grid grid-cols-7 gap-0", children: weekDays }, rows.length));
        }
        return (_jsxs("div", { className: "bg-white rounded-md", children: [_jsx("div", { className: "grid grid-cols-7 gap-0 border-b", children: daysHeader }), rows] }));
    };
    const renderWeekView = () => {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
        // Time slots from 8:00 to 18:00
        const timeSlots = Array.from({ length: 11 }, (_, i) => i + 8);
        return (_jsxs("div", { className: "bg-white rounded-md", children: [_jsxs("div", { className: "grid grid-cols-8 border-b", children: [_jsx("div", { className: "p-2 border-r", children: "Time" }), days.map((day) => {
                            const isToday = isSameDay(day, new Date());
                            return (_jsxs("div", { className: `text-center p-2 ${isToday ? "bg-blue-50 font-bold" : ""}`, children: [_jsx("div", { children: format(day, "EEE") }), _jsx("div", { children: format(day, "MMM d") })] }, day.toString()));
                        })] }), _jsxs("div", { className: "grid grid-cols-8", children: [_jsx("div", { className: "border-r", children: timeSlots.map((hour) => (_jsxs("div", { className: "h-20 border-b p-1 text-xs text-right pr-2", children: [hour, ":00"] }, hour))) }), days.map((day) => {
                            const dayEvents = getEventsForDay(day);
                            return (_jsxs("div", { className: "relative border-r", children: [timeSlots.map((hour) => (_jsx("div", { className: "h-20 border-b" }, hour))), dayEvents.map((event) => {
                                        const startTime = new Date(event.startTime);
                                        const endTime = new Date(event.endTime);
                                        const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                                        const endHour = endTime.getHours() + endTime.getMinutes() / 60;
                                        const top = (startHour - 8) * 80; // 80px per hour (20px height * 4 quarters)
                                        const height = (endHour - startHour) * 80;
                                        const { jobTitle, jobStatus } = getEventDetails(event.jobId, event.staffId);
                                        return (_jsxs("div", { className: `absolute left-0 right-0 mx-1 p-1 text-xs rounded overflow-hidden ${getStatusColor(jobStatus)}`, style: { top: `${top}px`, height: `${height}px` }, onClick: () => handleEventClick(event), children: [_jsx("div", { className: "font-medium truncate", children: jobTitle }), _jsxs("div", { className: "truncate", children: [format(startTime, "HH:mm"), " -", " ", format(endTime, "HH:mm")] })] }, event.id));
                                    })] }, day.toString()));
                        })] })] }));
    };
    const renderDayView = () => {
        // Time slots from 8:00 to 18:00
        const timeSlots = Array.from({ length: 11 }, (_, i) => i + 8);
        const dayEvents = getEventsForDay(currentDate);
        return (_jsxs("div", { className: "bg-white rounded-md", children: [_jsxs("div", { className: "grid grid-cols-[100px_1fr] border-b", children: [_jsx("div", { className: "p-2 border-r", children: "Time" }), _jsxs("div", { className: "text-center p-2 font-bold", children: [_jsx("div", { children: format(currentDate, "EEEE") }), _jsx("div", { children: format(currentDate, "MMMM d, yyyy") })] })] }), _jsxs("div", { className: "grid grid-cols-[100px_1fr]", children: [_jsx("div", { className: "border-r", children: timeSlots.map((hour) => (_jsxs("div", { className: "h-24 border-b p-1 text-right pr-2", children: [hour, ":00"] }, hour))) }), _jsxs("div", { className: "relative", children: [timeSlots.map((hour) => (_jsx("div", { className: "h-24 border-b" }, hour))), dayEvents.map((event) => {
                                    const startTime = new Date(event.startTime);
                                    const endTime = new Date(event.endTime);
                                    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                                    const endHour = endTime.getHours() + endTime.getMinutes() / 60;
                                    const top = (startHour - 8) * 96; // 96px per hour (24px height * 4 quarters)
                                    const height = (endHour - startHour) * 96;
                                    const { jobTitle, jobStatus, staffName } = getEventDetails(event.jobId, event.staffId);
                                    return (_jsxs("div", { className: `absolute left-0 right-0 mx-2 p-2 rounded overflow-hidden ${getStatusColor(jobStatus)}`, style: { top: `${top}px`, height: `${height}px` }, onClick: () => handleEventClick(event), children: [_jsx("div", { className: "font-medium", children: jobTitle }), _jsxs("div", { className: "text-sm", children: [format(startTime, "h:mm a"), " - ", format(endTime, "h:mm a")] }), _jsxs("div", { className: "text-sm mt-1 flex items-center", children: [_jsx(Users, { className: "h-3 w-3 mr-1" }), staffName] })] }, event.id));
                                })] })] })] }));
    };
    const renderAgendaView = () => {
        // Get events for the next 14 days
        const startDate = currentDate;
        const endDate = addDays(currentDate, 13);
        const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
        // Group events by date
        const eventsByDate = {};
        dateRange.forEach((date) => {
            const dateStr = format(date, "yyyy-MM-dd");
            eventsByDate[dateStr] = getEventsForDay(date);
        });
        return (_jsxs("div", { className: "bg-white rounded-md p-4 space-y-6", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "Upcoming Schedule (14 days)" }), dateRange.map((date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const events = eventsByDate[dateStr];
                    const isToday = isSameDay(date, new Date());
                    if (events.length === 0)
                        return null;
                    return (_jsxs("div", { className: "space-y-2", children: [_jsxs("h3", { className: `text-lg font-medium ${isToday ? "text-blue-600" : ""}`, children: [isToday ? "Today - " : "", format(date, "EEEE, MMMM d, yyyy")] }), _jsx("div", { className: "space-y-2 pl-4", children: events.map((event) => {
                                    const { jobTitle, jobStatus, staffName } = getEventDetails(event.jobId, event.staffId);
                                    const startTime = new Date(event.startTime);
                                    const endTime = new Date(event.endTime);
                                    return (_jsxs("div", { className: `p-3 rounded-md cursor-pointer ${getStatusColor(jobStatus)}`, onClick: () => handleEventClick(event), children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "font-medium", children: jobTitle }), _jsxs("span", { children: [format(startTime, "HH:mm"), " -", " ", format(endTime, "HH:mm")] })] }), _jsxs("div", { className: "mt-1 text-sm flex items-center", children: [_jsx(Users, { className: "h-3 w-3 mr-1" }), staffName] }), event.notes && (_jsx("div", { className: "mt-1 text-sm italic", children: event.notes }))] }, event.id));
                                }) })] }, dateStr));
                })] }));
    };
    return (_jsxs(Card, { className: "w-full h-full", children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { children: "Production Calendar" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Select, { value: view, onValueChange: (value) => setView(value), children: [_jsx(SelectTrigger, { className: "w-[130px]", children: _jsx(SelectValue, { placeholder: "View" }) }), _jsxs(SelectContent, { children: [_jsxs(SelectItem, { value: "month", className: "flex items-center", children: [_jsx(Grid3X3, { className: "h-4 w-4 mr-2" }), "Month"] }), _jsxs(SelectItem, { value: "week", className: "flex items-center", children: [_jsx(CalendarIcon, { className: "h-4 w-4 mr-2" }), "Week"] }), _jsxs(SelectItem, { value: "day", className: "flex items-center", children: [_jsx(CalendarIcon, { className: "h-4 w-4 mr-2" }), "Day"] }), _jsxs(SelectItem, { value: "agenda", className: "flex items-center", children: [_jsx(List, { className: "h-4 w-4 mr-2" }), "Agenda"] })] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: navigatePrevious, children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", onClick: navigateToday, children: "Today" }), _jsx(Button, { variant: "outline", size: "icon", onClick: navigateNext, children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] })] })] }), _jsxs("div", { className: "text-lg font-medium mt-2", children: [view === "month" && format(currentDate, "MMMM yyyy"), view === "week" && (_jsxs(_Fragment, { children: [format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d"), " -", " ", format(endOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d, yyyy")] })), view === "day" && format(currentDate, "MMMM d, yyyy"), view === "agenda" && (_jsxs(_Fragment, { children: [format(currentDate, "MMM d"), " -", " ", format(addDays(currentDate, 13), "MMM d, yyyy")] }))] })] }), _jsxs(CardContent, { className: "overflow-auto h-[500px]", children: [view === "month" && renderMonthView(), view === "week" && renderWeekView(), view === "day" && renderDayView(), view === "agenda" && renderAgendaView()] }), _jsx(Dialog, { open: isDetailOpen, onOpenChange: setIsDetailOpen, children: _jsxs(DialogContent, { className: "sm:max-w-[600px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Job Details" }), _jsx(DialogDescription, { children: "Detailed information about the selected job and schedule." })] }), selectedEvent && selectedJob && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Job Title" }), _jsx("p", { className: "font-medium", children: selectedJob.title })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Client" }), _jsx("p", { children: selectedJob.client })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Description" }), _jsx("p", { children: selectedJob.description })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Schedule" }), _jsxs("p", { children: [format(new Date(selectedEvent.startTime), "MMMM d, yyyy"), _jsx("br", {}), format(new Date(selectedEvent.startTime), "h:mm a"), " -", " ", format(new Date(selectedEvent.endTime), "h:mm a")] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Status" }), _jsx("div", { className: `inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(selectedJob.status)}`, children: selectedJob.status.replace("_", " ").toUpperCase() })] })] }), selectedEvent.notes && (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Notes" }), _jsx("p", { children: selectedEvent.notes })] })), selectedJob.fileUrl && (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Attached File" }), _jsxs("a", { href: selectedJob.fileUrl, target: "_blank", rel: "noopener noreferrer", className: "flex items-center text-blue-600 hover:underline", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "View File"] })] })), _jsxs("div", { className: "flex justify-end space-x-2 pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setIsDetailOpen(false), children: "Close" }), _jsx(Button, { onClick: () => {
                                                setIsDetailOpen(false);
                                                // Navigate to the job details page
                                                navigate(`/jobs/${selectedJob.id}`);
                                            }, children: "View Full Details" })] })] }))] }) })] }));
}
