import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Download, Filter, Printer, Users, Clock, Layers, BarChart2, } from "lucide-react";
import ProductionReport from "./ProductionReport";
import StaffPerformanceReport from "./StaffPerformanceReport";
import ComprehensiveDashboard from "./ComprehensiveDashboard";
export default function ReportsView() {
    const { jobs, staff, schedule } = useAppContext();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [dateRange, setDateRange] = useState("month");
    // Calculate date range for reports
    const getDateRange = () => {
        const today = new Date();
        let startDate;
        let endDate = today;
        switch (dateRange) {
            case "week":
                startDate = subDays(today, 7);
                break;
            case "month":
                startDate = startOfMonth(today);
                endDate = endOfMonth(today);
                break;
            case "quarter":
                startDate = subDays(today, 90);
                break;
            case "year":
                startDate = subDays(today, 365);
                break;
            default:
                startDate = subDays(today, 30);
        }
        return { startDate, endDate };
    };
    const { startDate, endDate } = getDateRange();
    // Format date range for display
    const formattedDateRange = `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
    return (_jsxs("div", { className: "p-6 bg-gray-50 min-h-screen", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Production Reports" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Generate and view detailed reports about your print shop production operations." })] }), _jsx(Card, { className: "mb-6", children: _jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs(CardTitle, { className: "text-lg font-medium", children: ["Report Period: ", formattedDateRange] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Select, { value: dateRange, onValueChange: (value) => setDateRange(value), children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Select time range" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "week", children: "Last 7 days" }), _jsx(SelectItem, { value: "month", children: "This month" }), _jsx(SelectItem, { value: "quarter", children: "Last 90 days" }), _jsx(SelectItem, { value: "year", children: "Last 365 days" })] })] }), _jsx(Button, { variant: "outline", size: "icon", children: _jsx(Filter, { className: "h-4 w-4" }) }), _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export"] })] })] }) }) }), _jsxs(Tabs, { value: activeTab, onValueChange: (value) => setActiveTab(value), children: [_jsxs(TabsList, { className: "mb-6", children: [_jsxs(TabsTrigger, { value: "dashboard", className: "flex items-center gap-2", children: [_jsx(BarChart2, { className: "h-4 w-4" }), "Dashboard"] }), _jsxs(TabsTrigger, { value: "production", className: "flex items-center gap-2", children: [_jsx(Printer, { className: "h-4 w-4" }), "Production"] }), _jsxs(TabsTrigger, { value: "staff", className: "flex items-center gap-2", children: [_jsx(Users, { className: "h-4 w-4" }), "Staff"] }), _jsxs(TabsTrigger, { value: "capacity", className: "flex items-center gap-2", children: [_jsx(Layers, { className: "h-4 w-4" }), "Capacity"] })] }), _jsx(TabsContent, { value: "dashboard", children: _jsx(ComprehensiveDashboard, { startDate: startDate, endDate: endDate }) }), _jsx(TabsContent, { value: "production", children: _jsx(ProductionReport, { startDate: startDate, endDate: endDate }) }), _jsx(TabsContent, { value: "staff", children: _jsx(StaffPerformanceReport, { startDate: startDate, endDate: endDate }) }), _jsx(TabsContent, { value: "capacity", children: _jsx(CapacityAnalysisReport, { startDate: startDate, endDate: endDate }) })] })] }));
}
function CapacityAnalysisReport({ startDate, endDate, }) {
    const { staff, schedule, jobs } = useAppContext();
    // Filter to only production staff
    const productionStaff = staff.filter((member) => member.role.toLowerCase().includes("production") ||
        member.skills.some((skill) => skill.toLowerCase().includes("print") ||
            skill.toLowerCase().includes("production")));
    // Calculate capacity metrics based on staff availability and assignments
    const staffCapacityData = productionStaff.map((staffMember) => {
        // Calculate available hours based on staff availability
        const availableDaysCount = Object.values(staffMember.availability).filter(Boolean).length;
        const dailyHours = 8; // Assuming 8 hours per working day
        const totalAvailableHours = availableDaysCount * dailyHours;
        // Calculate assigned hours from schedule
        const staffEvents = schedule.filter((event) => event.staffId === staffMember.id);
        const assignedHours = staffEvents.reduce((total, event) => {
            const startTime = new Date(event.startTime);
            const endTime = new Date(event.endTime);
            const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            return total + durationHours;
        }, 0);
        // Calculate utilization percentage
        const utilizationPercentage = totalAvailableHours > 0
            ? Math.min(100, (assignedHours / totalAvailableHours) * 100)
            : 0;
        return {
            name: staffMember.name,
            role: staffMember.role,
            availableHours: totalAvailableHours,
            assignedHours: assignedHours,
            utilization: Math.round(utilizationPercentage),
            remainingCapacity: Math.max(0, totalAvailableHours - assignedHours),
        };
    });
    // Calculate overall production capacity
    const totalAvailableHours = staffCapacityData.reduce((sum, staff) => sum + staff.availableHours, 0);
    const totalAssignedHours = staffCapacityData.reduce((sum, staff) => sum + staff.assignedHours, 0);
    const overallUtilization = totalAvailableHours > 0
        ? Math.round((totalAssignedHours / totalAvailableHours) * 100)
        : 0;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Overall Capacity Utilization" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold", children: [overallUtilization, "%"] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2.5 mt-2", children: _jsx("div", { className: `h-2.5 rounded-full ${overallUtilization > 90 ? "bg-red-500" : overallUtilization > 75 ? "bg-amber-500" : "bg-green-500"}`, style: { width: `${overallUtilization}%` } }) }), _jsxs("p", { className: "text-muted-foreground text-sm mt-1", children: [totalAssignedHours.toFixed(1), " / ", totalAvailableHours.toFixed(1), " ", "hours"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Available Production Staff" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold", children: productionStaff.length }), _jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "With production-related skills" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Remaining Capacity" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold", children: [Math.max(0, totalAvailableHours - totalAssignedHours).toFixed(1), " ", "hours"] }), _jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Available for additional jobs" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Staff Capacity Breakdown" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [staffCapacityData.map((staffData, index) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: staffData.name }), _jsx("div", { className: "text-sm text-muted-foreground", children: staffData.role })] }), _jsxs("div", { className: "text-sm font-medium", children: [staffData.utilization, "% Utilized"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${staffData.utilization > 90 ? "bg-red-500" : staffData.utilization > 75 ? "bg-amber-500" : "bg-green-500"}`, style: { width: `${staffData.utilization}%` } }) }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsxs("span", { children: [staffData.assignedHours.toFixed(1), " hours assigned"] }), _jsxs("span", { children: [staffData.availableHours.toFixed(1), " hours available"] })] }), _jsxs("div", { className: "flex items-center text-xs text-muted-foreground mt-1", children: [_jsx(Clock, { className: "h-3 w-3 mr-1" }), _jsxs("span", { children: ["Available:", " ", Object.entries(staff.find((s) => s.name === staffData.name)
                                                            ?.availability || {})
                                                            .filter(([_, isAvailable]) => isAvailable)
                                                            .map(([day]) => day.substring(0, 3))
                                                            .join(", ")] })] })] }, index))), staffCapacityData.length === 0 && (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No production staff members found" }))] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Capacity Planning Recommendations" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [overallUtilization > 90 && (_jsxs("div", { className: "p-4 bg-red-50 border border-red-200 rounded-md", children: [_jsx("h3", { className: "font-medium text-red-800 mb-1", children: "Over Capacity Warning" }), _jsx("p", { className: "text-sm text-red-700", children: "Your production team is currently over capacity. Consider hiring temporary staff, extending deadlines, or redistributing workload to prevent delays." })] })), overallUtilization > 75 && overallUtilization <= 90 && (_jsxs("div", { className: "p-4 bg-amber-50 border border-amber-200 rounded-md", children: [_jsx("h3", { className: "font-medium text-amber-800 mb-1", children: "High Utilization Alert" }), _jsx("p", { className: "text-sm text-amber-700", children: "Your production team is operating at high capacity. Monitor workloads closely and consider adjusting schedules if additional jobs are accepted." })] })), overallUtilization <= 75 && (_jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-md", children: [_jsx("h3", { className: "font-medium text-green-800 mb-1", children: "Optimal Capacity" }), _jsx("p", { className: "text-sm text-green-700", children: "Your production team has sufficient capacity for current workloads and can accommodate additional jobs if needed." })] })), _jsx("h3", { className: "font-medium mt-4", children: "Staff-Specific Recommendations" }), _jsxs("ul", { className: "space-y-2", children: [staffCapacityData
                                            .filter((staff) => staff.utilization > 90)
                                            .map((staff, index) => (_jsxs("li", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: staff.name }), " is over-utilized at ", staff.utilization, "%. Consider redistributing", " ", Math.round(staff.assignedHours - staff.availableHours * 0.8), " ", "hours to other team members."] }, index))), staffCapacityData
                                            .filter((staff) => staff.utilization < 50)
                                            .map((staff, index) => (_jsxs("li", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: staff.name }), " has significant available capacity at only ", staff.utilization, "% utilization. Consider assigning up to", " ", Math.round(staff.availableHours - staff.assignedHours), " ", "additional hours."] }, index))), staffCapacityData.filter((staff) => staff.utilization >= 50 && staff.utilization <= 90).length === staffCapacityData.length && (_jsx("li", { className: "text-sm", children: "All staff members are currently at optimal capacity levels." }))] })] }) })] })] }));
}
