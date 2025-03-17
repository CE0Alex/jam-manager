import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays } from "date-fns";
import { AlertTriangle, CheckCircle, Clock, Settings, } from "lucide-react";
export default function MachineCapacityView({ onMachineSelect, }) {
    const { machines, schedule, dashboardMetrics } = useAppContext();
    const [timeRange, setTimeRange] = useState("week");
    // Get machine utilization from dashboard metrics
    const machineUtilization = dashboardMetrics.machineUtilization || {};
    // Get machine status color
    const getMachineStatusColor = (status) => {
        switch (status) {
            case "operational":
                return "bg-green-100 text-green-800 border-green-200";
            case "maintenance":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "offline":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };
    // Get utilization color based on percentage
    const getUtilizationColor = (percentage) => {
        if (percentage > 90)
            return "bg-red-500";
        if (percentage > 75)
            return "bg-amber-500";
        if (percentage > 50)
            return "bg-yellow-500";
        return "bg-green-500";
    };
    // Get upcoming maintenance machines
    const getUpcomingMaintenance = () => {
        return machines.filter((machine) => {
            if (!machine.maintenanceSchedule)
                return false;
            const nextMaintenance = new Date(machine.maintenanceSchedule.nextMaintenance);
            const today = new Date();
            const twoWeeksFromNow = addDays(today, 14);
            return nextMaintenance >= today && nextMaintenance <= twoWeeksFromNow;
        });
    };
    const upcomingMaintenance = getUpcomingMaintenance();
    return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { children: "Machine Capacity" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", className: timeRange === "day" ? "bg-muted" : "", onClick: () => setTimeRange("day"), children: "Today" }), _jsx(Button, { variant: "outline", size: "sm", className: timeRange === "week" ? "bg-muted" : "", onClick: () => setTimeRange("week"), children: "Week" }), _jsx(Button, { variant: "outline", size: "sm", className: timeRange === "month" ? "bg-muted" : "", onClick: () => setTimeRange("month"), children: "Month" })] })] }) }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "utilization", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2 mb-4", children: [_jsx(TabsTrigger, { value: "utilization", children: "Utilization" }), _jsx(TabsTrigger, { value: "maintenance", children: "Maintenance" })] }), _jsx(TabsContent, { value: "utilization", className: "space-y-4", children: machines.map((machine) => {
                                const utilization = machineUtilization[machine.id] || 0;
                                return (_jsxs("div", { className: "border rounded-md p-4 cursor-pointer hover:border-primary", onClick: () => onMachineSelect && onMachineSelect(machine.id), children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: machine.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: machine.type })] }), _jsx(Badge, { className: getMachineStatusColor(machine.status), children: machine.status.charAt(0).toUpperCase() +
                                                        machine.status.slice(1) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Capacity Utilization" }), _jsxs("span", { className: "font-medium", children: [utilization, "%"] })] }), _jsx(Progress, { value: utilization, className: getUtilizationColor(utilization) })] }), _jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: machine.capabilities.map((capability, index) => (_jsx(Badge, { variant: "outline", children: capability }, index))) })] }, machine.id));
                            }) }), _jsxs(TabsContent, { value: "maintenance", className: "space-y-4", children: [upcomingMaintenance.length > 0 ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-md", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-yellow-800", children: "Upcoming Maintenance" }), _jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "The following machines are scheduled for maintenance in the next 14 days. Plan your production schedule accordingly." })] })] }), upcomingMaintenance.map((machine) => (_jsxs("div", { className: "border rounded-md p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: machine.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: machine.type })] }), _jsx(Badge, { className: "bg-yellow-100 text-yellow-800 border-yellow-200", children: "Maintenance Scheduled" })] }), _jsxs("div", { className: "mt-2 space-y-1", children: [_jsxs("div", { className: "flex items-center text-sm", children: [_jsx(Clock, { className: "h-4 w-4 mr-1 text-muted-foreground" }), _jsx("span", { children: "Next Maintenance: " }), _jsx("span", { className: "font-medium ml-1", children: format(new Date(machine.maintenanceSchedule.nextMaintenance), "MMMM d, yyyy") })] }), _jsxs("div", { className: "flex items-center text-sm", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1 text-muted-foreground" }), _jsx("span", { children: "Last Maintenance: " }), _jsx("span", { className: "ml-1", children: format(new Date(machine.maintenanceSchedule.lastMaintenance), "MMMM d, yyyy") })] })] })] }, machine.id)))] })) : (_jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-center", children: [_jsx(CheckCircle, { className: "h-12 w-12 text-green-500 mb-4" }), _jsx("h3", { className: "text-lg font-medium", children: "No Upcoming Maintenance" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "All machines are on their regular maintenance schedule with no upcoming service in the next 14 days." })] })), _jsx("div", { className: "mt-6", children: _jsxs(Button, { variant: "outline", className: "w-full", disabled: true, children: [_jsx(Settings, { className: "h-4 w-4 mr-2" }), "Manage Maintenance Schedules"] }) })] })] }) })] }));
}
