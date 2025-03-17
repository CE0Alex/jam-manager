import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, subDays, startOfDay, isSameDay } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, UserX, Clock } from "lucide-react";
import { generateTimeBlocks } from "@/lib/scheduling";
export default function AvailabilityCalendar() {
    const { staff, schedule, jobs } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedStaff, setSelectedStaff] = useState("all"); // "all" or staff ID
    const [viewType, setViewType] = useState("day"); // "day" or "week"
    // Create job ID to title mapping for tooltips
    const jobTitles = useMemo(() => {
        const titles = {};
        jobs.forEach(job => {
            titles[job.id] = job.title;
        });
        return titles;
    }, [jobs]);
    // Generate time blocks for visualization
    const timeBlocks = useMemo(() => {
        if (viewType === "day") {
            // Filter staff if needed
            const filteredStaff = selectedStaff === "all"
                ? staff
                : staff.filter(member => member.id === selectedStaff);
            return generateTimeBlocks(selectedDate, filteredStaff, schedule, true);
        }
        else if (viewType === "week") {
            // Generate blocks for each day in the week
            let allBlocks = [];
            for (let i = 0; i < 7; i++) {
                const day = addDays(startOfDay(selectedDate), i - selectedDate.getDay());
                // Filter staff if needed
                const filteredStaff = selectedStaff === "all"
                    ? staff
                    : staff.filter(member => member.id === selectedStaff);
                const dayBlocks = generateTimeBlocks(day, filteredStaff, schedule, true);
                allBlocks = [...allBlocks, ...dayBlocks];
            }
            return allBlocks;
        }
        return [];
    }, [selectedDate, selectedStaff, viewType, staff, schedule]);
    // Navigate to previous/next day or week
    const navigatePrevious = () => {
        if (viewType === "day") {
            setSelectedDate(prev => subDays(prev, 1));
        }
        else {
            setSelectedDate(prev => subDays(prev, 7));
        }
    };
    const navigateNext = () => {
        if (viewType === "day") {
            setSelectedDate(prev => addDays(prev, 1));
        }
        else {
            setSelectedDate(prev => addDays(prev, 7));
        }
    };
    // Group blocks by hour for rendering
    const timeRows = useMemo(() => {
        const rows = {};
        // Create rows for each hour (8am to 6pm)
        for (let hour = 8; hour <= 18; hour++) {
            const hourKey = `${hour.toString().padStart(2, "0")}:00`;
            rows[hourKey] = [];
        }
        // Assign blocks to rows based on their start time
        timeBlocks.forEach(block => {
            const hour = format(block.start, "HH:00");
            if (rows[hour]) {
                rows[hour].push(block);
            }
        });
        return rows;
    }, [timeBlocks]);
    // Filter blocks by day for week view
    const getDayBlocks = (day) => {
        return timeBlocks.filter(block => isSameDay(block.start, day));
    };
    // Get week days array for rendering week view
    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(addDays(startOfDay(selectedDate), i - selectedDate.getDay()));
        }
        return days;
    }, [selectedDate]);
    return (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-xl font-bold", children: "Staff Availability" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: navigatePrevious, children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setSelectedDate(new Date()), children: "Today" }), _jsx(Button, { variant: "outline", size: "sm", onClick: navigateNext, children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-end justify-between gap-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row items-start md:items-end gap-4", children: [_jsxs("div", { className: "space-y-1 w-full md:w-48", children: [_jsx(Label, { htmlFor: "staff-select", children: "Staff Member" }), _jsxs(Select, { value: selectedStaff, onValueChange: setSelectedStaff, children: [_jsx(SelectTrigger, { id: "staff-select", children: _jsx(SelectValue, { placeholder: "All Staff" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Staff" }), staff.map(member => (_jsx(SelectItem, { value: member.id, children: member.name }, member.id)))] })] })] }), _jsx("div", { children: _jsx("div", { className: "text-sm font-medium mb-1", children: viewType === "day" ? format(selectedDate, "EEEE, MMMM d, yyyy") :
                                                    `Week of ${format(weekDays[0], "MMM d")} - ${format(weekDays[6], "MMM d, yyyy")}` }) })] }), _jsx(Tabs, { value: viewType, onValueChange: setViewType, className: "w-full md:w-auto", children: _jsxs(TabsList, { className: "grid w-full md:w-[200px] grid-cols-2", children: [_jsxs(TabsTrigger, { value: "day", className: "flex items-center", children: [_jsx(Clock, { className: "mr-2 h-4 w-4" }), "Day View"] }), _jsxs(TabsTrigger, { value: "week", className: "flex items-center", children: [_jsx(Calendar, { className: "mr-2 h-4 w-4" }), "Week View"] })] }) })] }), _jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "flex items-center mb-2 gap-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-blue-100 border border-blue-500 mr-1" }), _jsx("span", { className: "text-xs", children: "Available" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-blue-500 mr-1" }), _jsx("span", { className: "text-xs", children: "Scheduled" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-red-100 border border-red-500 mr-1" }), _jsx("span", { className: "text-xs", children: "Unavailable" })] })] }), viewType === "day" ? (_jsx("div", { className: "border rounded-md overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "py-2 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20", children: "Time" }), selectedStaff === "all" ? (staff.map(member => (_jsx("th", { className: "py-2 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: member.name }, member.id)))) : (_jsx("th", { className: "py-2 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: staff.find(s => s.id === selectedStaff)?.name || "Staff" }))] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: Object.entries(timeRows).map(([hour, blocks]) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "py-2 px-4 text-sm text-gray-900 align-top whitespace-nowrap", children: (() => {
                                                                const [h, m] = hour.split(':');
                                                                const hourNum = parseInt(h);
                                                                return `${hourNum > 12 ? hourNum - 12 : hourNum}:${m} ${hourNum >= 12 ? 'PM' : 'AM'}`;
                                                            })() }), selectedStaff === "all" ? (staff.map(member => {
                                                            const staffBlocks = blocks.filter(block => block.staffId === member.id);
                                                            return (_jsx("td", { className: "py-2 px-4 text-sm text-gray-500", children: staffBlocks.length === 0 ? (_jsx("div", { className: "h-6" })) : (_jsx("div", { className: "space-y-1", children: staffBlocks.map((block, idx) => (_jsxs("div", { className: `
                                          rounded p-1 text-xs
                                          ${block.type === 'event' ? 'bg-blue-500 text-white' : ''}
                                          ${block.type === 'available' ? 'bg-blue-100 border border-blue-200' : ''}
                                          ${block.type === 'unavailable' ? 'bg-red-100 border border-red-200' : ''}
                                        `, title: block.title, children: [block.type === 'event' && block.jobId && (_jsx("span", { children: jobTitles[block.jobId] || 'Job' })), block.type !== 'event' && (_jsx("span", { children: block.title }))] }, idx))) })) }, member.id));
                                                        })) : (_jsx("td", { className: "py-2 px-4 text-sm text-gray-500", children: blocks.length === 0 ? (_jsx("div", { className: "h-6" })) : (_jsx("div", { className: "space-y-1", children: blocks.map((block, idx) => (_jsxs("div", { className: `
                                      rounded p-1 text-xs
                                      ${block.type === 'event' ? 'bg-blue-500 text-white' : ''}
                                      ${block.type === 'available' ? 'bg-blue-100 border border-blue-200' : ''}
                                      ${block.type === 'unavailable' ? 'bg-red-100 border border-red-200' : ''}
                                    `, title: block.title, children: [block.type === 'event' && block.jobId && (_jsxs(_Fragment, { children: [_jsx("span", { children: jobTitles[block.jobId] || 'Job' }), _jsxs("span", { className: "text-xs ml-1 opacity-80", children: ["(", format(block.start, "h:mm"), " - ", format(block.end, "h:mm a"), ")"] })] })), block.type !== 'event' && (_jsx("span", { children: block.title }))] }, idx))) })) }))] }, hour))) })] }) })) : (_jsx("div", { className: "grid grid-cols-7 gap-2", children: weekDays.map(day => (_jsxs("div", { className: `
                      border rounded-md overflow-hidden
                      ${isSameDay(day, new Date()) ? 'border-blue-500' : 'border-gray-200'}
                    `, children: [_jsx("div", { className: `
                      py-1 px-2 text-center font-medium text-sm
                      ${isSameDay(day, new Date()) ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700'}
                    `, children: format(day, "EEE, MMM d") }), _jsx("div", { className: "p-2 space-y-1 min-h-[100px]", children: getDayBlocks(day).length === 0 ? (_jsxs("div", { className: "flex items-center justify-center h-full text-sm text-gray-400", children: [_jsx(UserX, { className: "h-4 w-4 mr-1" }), "No availability"] })) : (_jsxs("div", { className: "space-y-1", children: [getDayBlocks(day)
                                                            .filter(block => block.type === 'event')
                                                            .map((block, idx) => (_jsxs("div", { className: "bg-blue-500 text-white rounded p-1 text-xs", title: block.title, children: [_jsx("div", { className: "font-medium", children: jobTitles[block.jobId || ''] || 'Job' }), _jsxs("div", { className: "text-xs opacity-80", children: [format(block.start, "h:mm"), " - ", format(block.end, "h:mm a")] }), block.staffId && (_jsx("div", { className: "text-xs opacity-80", children: staff.find(s => s.id === block.staffId)?.name || 'Staff' }))] }, idx))), getDayBlocks(day)
                                                            .filter(block => block.type === 'available')
                                                            .map((block, idx) => (_jsxs("div", { className: "bg-blue-100 border border-blue-200 rounded p-1 text-xs", children: [_jsx("div", { className: "font-medium", children: block.title }), _jsxs("div", { className: "text-xs", children: [format(block.start, "h:mm"), " - ", format(block.end, "h:mm a")] }), block.staffId && (_jsx("div", { className: "text-xs", children: staff.find(s => s.id === block.staffId)?.name || 'Staff' }))] }, idx)))] })) })] }, format(day, "yyyy-MM-dd")))) }))] })] }) })] }));
}
