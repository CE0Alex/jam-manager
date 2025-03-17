import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, isSameDay } from "date-fns";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
// Helper function to format numbers
const formatNumber = (num) => {
    return num.toFixed(1);
};
export default function WorkloadDashboard({ initialView = "list", }) {
    const { staff, jobs, schedule } = useAppContext();
    const [activeView, setActiveView] = useState(initialView);
    const [selectedStaffId, setSelectedStaffId] = useState(null);
    const [timeRange, setTimeRange] = useState("week");
    // Get staff workload data
    const getStaffWorkload = (staffMember) => {
        // Get assigned jobs
        const assignedJobs = jobs.filter(job => job.assignedTo === staffMember.id);
        // Get scheduled events for this staff member
        const staffEvents = schedule.filter(event => event.staffId === staffMember.id);
        // Calculate total hours scheduled
        let scheduledHours = 0;
        staffEvents.forEach(event => {
            const startTime = new Date(event.startTime);
            const endTime = new Date(event.endTime);
            // Filter by time range
            const today = new Date();
            const endDate = timeRange === "today" ? today :
                timeRange === "week" ? addDays(today, 7) :
                    addDays(today, 30);
            if (startTime <= endDate) {
                const durationMs = endTime.getTime() - startTime.getTime();
                const durationHours = durationMs / (1000 * 60 * 60);
                scheduledHours += durationHours;
            }
        });
        // Calculate capacity (simplified)
        // In a real app, you would use actual availability data
        const dailyCapacity = 8; // 8 hours per day
        const workDaysPerWeek = Object.values(staffMember.availability).filter(Boolean).length;
        const totalCapacity = timeRange === "today" ? dailyCapacity :
            timeRange === "week" ? (workDaysPerWeek * dailyCapacity) :
                (workDaysPerWeek * 4 * dailyCapacity); // Approx 4 weeks in a month
        // Calculate utilization percentage
        const utilization = totalCapacity > 0 ? (scheduledHours / totalCapacity) * 100 : 0;
        // Get upcoming deadlines
        const upcomingDeadlines = assignedJobs
            .filter(job => {
            const deadline = new Date(job.deadline);
            const today = new Date();
            const maxDate = timeRange === "today" ? today :
                timeRange === "week" ? addDays(today, 7) :
                    addDays(today, 30);
            return deadline <= maxDate && job.status !== "completed" && job.status !== "cancelled";
        })
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        return {
            assignedJobs,
            scheduledHours,
            totalCapacity,
            utilization: Math.min(utilization, 100), // Cap at 100%
            isOverCapacity: utilization > 100,
            upcomingDeadlines
        };
    };
    // Get utilization color based on percentage
    const getUtilizationColor = (percentage) => {
        if (percentage > 100)
            return "bg-red-500";
        if (percentage > 90)
            return "bg-amber-500";
        if (percentage > 70)
            return "bg-yellow-500";
        return "bg-green-500";
    };
    // Get initials for avatar
    const getInitials = (name) => {
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase();
    };
    // Render list view
    const renderListView = () => {
        const filteredStaff = selectedStaffId
            ? staff.filter(s => s.id === selectedStaffId)
            : staff;
        return (_jsx("div", { className: "space-y-6", children: filteredStaff.map(staffMember => {
                const { assignedJobs, scheduledHours, totalCapacity, utilization, isOverCapacity, upcomingDeadlines } = getStaffWorkload(staffMember);
                return (_jsxs(Card, { className: "overflow-hidden", children: [_jsx(CardHeader, { className: "pb-4", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs(Avatar, { children: [_jsx(AvatarImage, { src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffMember.id}`, alt: staffMember.name }), _jsx(AvatarFallback, { children: getInitials(staffMember.name) })] }), _jsxs("div", { children: [_jsx(CardTitle, { children: staffMember.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: staffMember.role })] })] }), _jsx(Link, { to: `/staff/${staffMember.id}`, children: _jsx(Button, { variant: "outline", size: "sm", children: "View Profile" }) })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-sm font-medium", children: "Workload" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Capacity Utilization" }), _jsxs("span", { className: "font-medium", children: [Math.round(utilization), "%"] })] }), _jsx(Progress, { value: utilization, className: getUtilizationColor(utilization) }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [scheduledHours.toFixed(1), " / ", totalCapacity.toFixed(1), " hours", isOverCapacity && (_jsx(Badge, { variant: "destructive", className: "ml-2", children: "Over Capacity" }))] })] }), _jsxs("div", { className: "flex items-center text-sm", children: [_jsx(Calendar, { className: "h-4 w-4 mr-1 text-muted-foreground" }), _jsxs("span", { children: ["Available: ", Object.entries(staffMember.availability)
                                                                .filter(([_, isAvailable]) => isAvailable)
                                                                .map(([day]) => day.substring(0, 3))
                                                                .join(", ")] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-sm font-medium", children: "Assigned Jobs" }), _jsx("div", { className: "space-y-2", children: assignedJobs.length === 0 ? (_jsx("p", { className: "text-sm text-muted-foreground", children: "No jobs assigned" })) : (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: "Total Jobs" }), _jsx("span", { className: "font-medium", children: assignedJobs.length })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: "In Progress" }), _jsx("span", { className: "font-medium", children: assignedJobs.filter(job => job.status === "in_progress").length })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: "Pending" }), _jsx("span", { className: "font-medium", children: assignedJobs.filter(job => job.status === "pending").length })] })] })) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-sm font-medium", children: "Upcoming Deadlines" }), upcomingDeadlines.length === 0 ? (_jsx("p", { className: "text-sm text-muted-foreground", children: "No upcoming deadlines" })) : (_jsxs("div", { className: "space-y-2", children: [upcomingDeadlines.slice(0, 3).map(job => {
                                                        const deadline = new Date(job.deadline);
                                                        const isToday = isSameDay(deadline, new Date());
                                                        const isPast = deadline < new Date();
                                                        return (_jsxs("div", { className: "text-sm", children: [_jsx("div", { className: "font-medium truncate", children: job.title }), _jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "h-3 w-3 mr-1 text-muted-foreground" }), _jsxs("span", { className: `${isPast ? "text-red-500" : isToday ? "text-amber-500" : ""}`, children: [format(deadline, "MMM d, yyyy"), isPast && " (Overdue)", isToday && " (Today)"] })] })] }, job.id));
                                                    }), upcomingDeadlines.length > 3 && (_jsxs("div", { className: "text-xs text-muted-foreground", children: ["+", upcomingDeadlines.length - 3, " more deadlines"] }))] }))] })] }) })] }, staffMember.id));
            }) }));
    };
    // Render calendar view
    const renderCalendarView = () => {
        // This would be a calendar showing staff assignments
        // For simplicity, we'll just show a placeholder
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx(Calendar, { className: "h-16 w-16 mx-auto text-muted-foreground" }), _jsx("h3", { className: "text-lg font-medium mt-4", children: "Staff Calendar View" }), _jsx("p", { className: "text-muted-foreground mt-2", children: "A calendar view showing all staff assignments would be implemented here." })] }));
    };
    // Render metrics view
    const renderMetricsView = () => {
        // Calculate overall metrics
        const totalJobs = jobs.length;
        const completedJobs = jobs.filter(job => job.status === "completed").length;
        const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
        // Calculate staff metrics
        const staffMetrics = staff.map(staffMember => {
            const assignedJobs = jobs.filter(job => job.assignedTo === staffMember.id);
            const completedJobs = assignedJobs.filter(job => job.status === "completed");
            const completionRate = assignedJobs.length > 0 ?
                (completedJobs.length / assignedJobs.length) * 100 : 0;
            // Calculate on-time rate
            const onTimeJobs = completedJobs.filter(job => {
                const completionDate = new Date(job.updatedAt);
                const deadline = new Date(job.deadline);
                return completionDate <= deadline;
            });
            const onTimeRate = completedJobs.length > 0 ?
                (onTimeJobs.length / completedJobs.length) * 100 : 0;
            return {
                staffMember,
                assignedCount: assignedJobs.length,
                completedCount: completedJobs.length,
                completionRate,
                onTimeRate
            };
        });
        // Calculate total allocated hours and capacity
        const totalAllocatedHours = staff.reduce((total, staffMember) => {
            const staffEvents = schedule.filter(event => event.staffId === staffMember.id);
            const hours = staffEvents.reduce((sum, event) => {
                const startTime = new Date(event.startTime);
                const endTime = new Date(event.endTime);
                const durationMs = endTime.getTime() - startTime.getTime();
                const durationHours = durationMs / (1000 * 60 * 60);
                return sum + durationHours;
            }, 0);
            return total + hours;
        }, 0);
        const totalCapacity = staff.reduce((total, staffMember) => {
            const workDaysPerWeek = Object.values(staffMember.availability).filter(Boolean).length;
            const dailyCapacity = 8; // 8 hours per day
            const weeklyCapacity = workDaysPerWeek * dailyCapacity;
            return total + weeklyCapacity;
        }, 0);
        // Mock data for team members display
        const staffMembers = staff.map(s => ({
            id: s.id,
            name: s.name,
            profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.id}`
        }));
        return (_jsx("div", { className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Team Workload Summary" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-medium", children: "Overall Capacity" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Allocated Hours vs. Capacity" }), _jsxs("span", { className: "text-sm font-medium", children: [formatNumber(totalAllocatedHours), "/", formatNumber(totalCapacity), " hrs"] })] }), _jsx(Progress, { value: Math.min((totalAllocatedHours / totalCapacity) * 100, 100), className: "h-2" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-medium", children: "Team Utilization" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Current Utilization" }), _jsxs("span", { className: "text-sm font-medium", children: [formatNumber((totalAllocatedHours / totalCapacity) * 100), "%"] })] }), _jsx(Progress, { value: Math.min((totalAllocatedHours / totalCapacity) * 100, 100), className: cn("h-2", (totalAllocatedHours / totalCapacity) > 0.9 ? "text-red-500" : "text-green-500") })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-medium", children: "Team Members" }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex -space-x-2", children: staffMembers.slice(0, 5).map((staff, index) => (_jsxs(Avatar, { className: "border-2 border-background", children: [_jsx(AvatarImage, { src: staff.profilePic, alt: staff.name }), _jsx(AvatarFallback, { children: getInitials(staff.name) })] }, index))) }), staffMembers.length > 5 && (_jsxs(Badge, { variant: "outline", className: "ml-2", children: ["+", staffMembers.length - 5, " more"] }))] })] })] }) })] }) }));
    };
    return (_jsxs(Tabs, { defaultValue: "item-1", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "item-1", children: "List" }), _jsx(TabsTrigger, { value: "item-2", children: "Calendar" }), _jsx(TabsTrigger, { value: "item-3", children: "Metrics" })] }), _jsx(TabsContent, { value: "item-1", children: renderListView() }), _jsx(TabsContent, { value: "item-2", children: renderCalendarView() }), _jsx(TabsContent, { value: "item-3", children: renderMetricsView() })] }));
}
