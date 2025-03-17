import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format, addDays, eachDayOfInterval } from "date-fns";
import { AlertTriangle, Clock, Users, Printer, Calendar } from "lucide-react";
export default function ResourceCapacityPlanner({ initialTab = "staff", }) {
    const { staff, machines, schedule } = useAppContext();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [timeRange, setTimeRange] = useState("week");
    // Calculate date range based on selected time range
    const getDateRange = () => {
        const today = new Date();
        let endDate;
        switch (timeRange) {
            case "day":
                endDate = today;
                break;
            case "week":
                endDate = addDays(today, 6);
                break;
            case "month":
                endDate = addDays(today, 29);
                break;
            default:
                endDate = addDays(today, 6);
        }
        return eachDayOfInterval({ start: today, end: endDate });
    };
    // Calculate staff capacity utilization
    const calculateStaffUtilization = (staffMember) => {
        const dateRange = getDateRange();
        let totalCapacityHours = 0;
        let scheduledHours = 0;
        // Calculate total capacity based on availability
        dateRange.forEach((date) => {
            const dayOfWeek = format(date, "EEEE").toLowerCase();
            if (staffMember.availability[dayOfWeek]) {
                // Default to 8 hours if availabilityHours not specified
                const availHours = staffMember.availabilityHours?.[dayOfWeek];
                if (availHours) {
                    const startHour = parseInt(availHours.start.split(":")[0]);
                    const endHour = parseInt(availHours.end.split(":")[0]);
                    totalCapacityHours += endHour - startHour;
                }
                else {
                    totalCapacityHours += 8; // Default work day
                }
            }
        });
        // Calculate scheduled hours
        const staffEvents = schedule.filter((event) => event.staffId === staffMember.id);
        staffEvents.forEach((event) => {
            const startTime = new Date(event.startTime);
            const endTime = new Date(event.endTime);
            const eventDate = format(startTime, "yyyy-MM-dd");
            // Check if event is within the date range
            if (dateRange.some((date) => format(date, "yyyy-MM-dd") === eventDate)) {
                // Calculate duration in hours
                const durationMs = endTime.getTime() - startTime.getTime();
                const durationHours = durationMs / (1000 * 60 * 60);
                scheduledHours += durationHours;
            }
        });
        const utilization = totalCapacityHours > 0 ? (scheduledHours / totalCapacityHours) * 100 : 0;
        return {
            utilization: Math.min(utilization, 100), // Cap at 100%
            scheduledHours,
            totalCapacityHours,
            isOverCapacity: utilization > 100,
        };
    };
    // Calculate machine capacity utilization
    const calculateMachineUtilization = (machine) => {
        const dateRange = getDateRange();
        // Assume machines are available 24/7 for simplicity
        // In a real app, you would have machine-specific availability
        let totalCapacityHours = dateRange.length * machine.hoursPerDay;
        let scheduledHours = 0;
        // Calculate scheduled hours
        const machineEvents = schedule.filter((event) => event.machineId === machine.id);
        machineEvents.forEach((event) => {
            const startTime = new Date(event.startTime);
            const endTime = new Date(event.endTime);
            const eventDate = format(startTime, "yyyy-MM-dd");
            // Check if event is within the date range
            if (dateRange.some((date) => format(date, "yyyy-MM-dd") === eventDate)) {
                // Calculate duration in hours
                const durationMs = endTime.getTime() - startTime.getTime();
                const durationHours = durationMs / (1000 * 60 * 60);
                scheduledHours += durationHours;
            }
        });
        const utilization = totalCapacityHours > 0 ? (scheduledHours / totalCapacityHours) * 100 : 0;
        return {
            utilization: Math.min(utilization, 100), // Cap at 100%
            scheduledHours,
            totalCapacityHours,
            isOverCapacity: utilization > 100,
        };
    };
    // Get utilization color based on percentage
    const getUtilizationColor = (percentage, isOverCapacity) => {
        if (isOverCapacity)
            return "bg-red-500";
        if (percentage > 90)
            return "bg-amber-500";
        if (percentage > 70)
            return "bg-yellow-500";
        return "bg-green-500";
    };
    // Render staff capacity view
    const renderStaffCapacity = () => {
        return (_jsx("div", { className: "space-y-4", children: staff.map((staffMember) => {
                const { utilization, scheduledHours, totalCapacityHours, isOverCapacity, } = calculateStaffUtilization(staffMember);
                return (_jsxs("div", { className: "border rounded-md p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: staffMember.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: staffMember.role })] }), _jsx(Badge, { variant: isOverCapacity ? "destructive" : "outline", children: isOverCapacity ? "Over Capacity" : "Available" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Capacity Utilization" }), _jsxs("span", { className: "font-medium", children: [Math.round(utilization), "% (", scheduledHours.toFixed(1), " /", " ", totalCapacityHours.toFixed(1), " hours)"] })] }), _jsx(Progress, { value: utilization, className: getUtilizationColor(utilization, isOverCapacity) })] }), _jsxs("div", { className: "mt-4 flex items-center text-sm", children: [_jsx(Users, { className: "h-4 w-4 mr-1 text-muted-foreground" }), _jsxs("span", { className: "mr-4", children: ["Skills: ", staffMember.skills.join(", ")] }), _jsx(Calendar, { className: "h-4 w-4 mr-1 text-muted-foreground" }), _jsxs("span", { children: ["Available:", " ", Object.entries(staffMember.availability)
                                            .filter(([_, isAvailable]) => isAvailable)
                                            .map(([day]) => day.substring(0, 3))
                                            .join(", ")] })] })] }, staffMember.id));
            }) }));
    };
    // Render machine capacity view
    const renderMachineCapacity = () => {
        if (!machines || machines.length === 0) {
            return (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No machines configured. Add machines to view capacity." }));
        }
        return (_jsx("div", { className: "space-y-4", children: machines.map((machine) => {
                const { utilization, scheduledHours, totalCapacityHours, isOverCapacity, } = calculateMachineUtilization(machine);
                return (_jsxs("div", { className: "border rounded-md p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: machine.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: machine.type })] }), _jsx(Badge, { variant: isOverCapacity ? "destructive" : "outline", children: isOverCapacity ? "Over Capacity" : "Available" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Capacity Utilization" }), _jsxs("span", { className: "font-medium", children: [Math.round(utilization), "% (", scheduledHours.toFixed(1), " /", " ", totalCapacityHours.toFixed(1), " hours)"] })] }), _jsx(Progress, { value: utilization, className: getUtilizationColor(utilization, isOverCapacity) })] }), _jsxs("div", { className: "mt-4 flex items-center text-sm", children: [_jsx(Printer, { className: "h-4 w-4 mr-1 text-muted-foreground" }), _jsxs("span", { className: "mr-4", children: ["Capabilities: ", machine.capabilities.join(", ")] }), _jsx(Clock, { className: "h-4 w-4 mr-1 text-muted-foreground" }), _jsxs("span", { children: ["Hours per day: ", machine.hoursPerDay] })] })] }, machine.id));
            }) }));
    };
    // Check for capacity warnings
    const getCapacityWarnings = () => {
        const warnings = [];
        // Check staff capacity
        staff.forEach((staffMember) => {
            const { utilization, isOverCapacity } = calculateStaffUtilization(staffMember);
            if (isOverCapacity) {
                warnings.push(`${staffMember.name} is over capacity (${Math.round(utilization)}%).`);
            }
            else if (utilization > 90) {
                warnings.push(`${staffMember.name} is nearing capacity (${Math.round(utilization)}%).`);
            }
        });
        // Check machine capacity
        machines?.forEach((machine) => {
            const { utilization, isOverCapacity } = calculateMachineUtilization(machine);
            if (isOverCapacity) {
                warnings.push(`${machine.name} is over capacity (${Math.round(utilization)}%).`);
            }
            else if (utilization > 90) {
                warnings.push(`${machine.name} is nearing capacity (${Math.round(utilization)}%).`);
            }
        });
        return warnings;
    };
    const capacityWarnings = getCapacityWarnings();
    return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { children: "Resource Capacity Planning" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", className: timeRange === "day" ? "bg-muted" : "", onClick: () => setTimeRange("day"), children: "Today" }), _jsx(Button, { variant: "outline", size: "sm", className: timeRange === "week" ? "bg-muted" : "", onClick: () => setTimeRange("week"), children: "Week" }), _jsx(Button, { variant: "outline", size: "sm", className: timeRange === "month" ? "bg-muted" : "", onClick: () => setTimeRange("month"), children: "Month" })] })] }) }), capacityWarnings.length > 0 && (_jsx("div", { className: "mx-6 mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md", children: _jsxs("div", { className: "flex items-start", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-yellow-800", children: "Capacity Warnings" }), _jsx("ul", { className: "mt-1 text-sm text-yellow-700 list-disc list-inside", children: capacityWarnings.map((warning, index) => (_jsx("li", { children: warning }, index))) })] })] }) })), _jsx(CardContent, { className: "pt-6", children: _jsxs(Tabs, { value: activeTab, onValueChange: (value) => setActiveTab(value), children: [_jsxs(TabsList, { className: "grid w-full max-w-md grid-cols-2 mb-6", children: [_jsxs(TabsTrigger, { value: "staff", className: "flex items-center gap-2", children: [_jsx(Users, { className: "h-4 w-4" }), "Staff Capacity"] }), _jsxs(TabsTrigger, { value: "machines", className: "flex items-center gap-2", children: [_jsx(Printer, { className: "h-4 w-4" }), "Machine Capacity"] })] }), _jsx(TabsContent, { value: "staff", children: renderStaffCapacity() }), _jsx(TabsContent, { value: "machines", children: renderMachineCapacity() })] }) })] }));
}
