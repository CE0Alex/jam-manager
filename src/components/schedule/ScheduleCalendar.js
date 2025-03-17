import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import ScheduleEventItem from "./ScheduleEventItem";
import { Link } from "react-router-dom";
export default function ScheduleCalendar() {
    const { schedule, jobs, staff } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState("week");
    // Calculate the start and end of the current week
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // End on Sunday
    // Generate array of days for the week view
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    // Navigate to previous/next day or week
    const navigatePrevious = () => {
        if (view === "day") {
            setCurrentDate((prev) => addDays(prev, -1));
        }
        else {
            setCurrentDate((prev) => addDays(prev, -7));
        }
    };
    const navigateNext = () => {
        if (view === "day") {
            setCurrentDate((prev) => addDays(prev, 1));
        }
        else {
            setCurrentDate((prev) => addDays(prev, 7));
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
    // Get job and staff details for an event
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
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Production Schedule" }), _jsx(Link, { to: "/schedule/new", children: _jsxs(Button, { children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Schedule Job"] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { children: "Schedule" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Select, { value: view, onValueChange: (value) => setView(value), children: [_jsx(SelectTrigger, { className: "w-[120px]", children: _jsx(SelectValue, { placeholder: "View" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "day", children: "Day View" }), _jsx(SelectItem, { value: "week", children: "Week View" })] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: navigatePrevious, children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", onClick: () => setCurrentDate(new Date()), children: "Today" }), _jsx(Button, { variant: "outline", size: "icon", onClick: navigateNext, children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] })] })] }), _jsx("div", { className: "text-lg font-medium mt-2", children: view === "day"
                                    ? format(currentDate, "MMMM d, yyyy")
                                    : `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}` })] }), _jsx(CardContent, { children: view === "day" ? (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "text-lg font-medium", children: format(currentDate, "EEEE") }), _jsx("div", { className: "border rounded-md p-4 min-h-[400px]", children: getEventsForDay(currentDate).length === 0 ? (_jsx("div", { className: "flex items-center justify-center h-64 text-muted-foreground", children: "No events scheduled for this day" })) : (_jsx("div", { className: "space-y-2", children: getEventsForDay(currentDate).map((event) => {
                                            const { jobTitle, jobStatus, staffName } = getEventDetails(event.jobId, event.staffId);
                                            return (_jsx(ScheduleEventItem, { event: event, jobTitle: jobTitle, jobStatus: jobStatus, staffName: staffName }, event.id));
                                        }) })) })] })) : (_jsx("div", { className: "grid grid-cols-7 gap-4", children: weekDays.map((day) => {
                                const dayEvents = getEventsForDay(day);
                                const isToday = isSameDay(day, new Date());
                                return (_jsxs("div", { className: "min-h-[400px]", children: [_jsxs("div", { className: `text-center p-2 font-medium rounded-t-md ${isToday ? "bg-primary text-primary-foreground" : "bg-muted"}`, children: [_jsx("div", { children: format(day, "EEE") }), _jsx("div", { children: format(day, "d") })] }), _jsx("div", { className: "border-x border-b rounded-b-md p-2 h-full", children: dayEvents.length === 0 ? (_jsx("div", { className: "flex items-center justify-center h-32 text-xs text-muted-foreground", children: "No events" })) : (_jsx("div", { className: "space-y-2", children: dayEvents.map((event) => {
                                                    const { jobTitle, jobStatus, staffName } = getEventDetails(event.jobId, event.staffId);
                                                    return (_jsx(ScheduleEventItem, { event: event, jobTitle: jobTitle, jobStatus: jobStatus, staffName: staffName, compact: true }, event.id));
                                                }) })) })] }, day.toString()));
                            }) })) })] })] }));
}
