import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter, } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle, Clock, BarChart, ChevronDown, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
export default function DashboardOverview() {
    const { dashboardMetrics, jobs, staff, schedule } = useAppContext();
    // Track which dialog is open
    const [activeDialog, setActiveDialog] = useState(null);
    // Calculate job status percentages
    const totalJobs = jobs.length;
    const statusCounts = dashboardMetrics.jobStatusDistribution;
    const statusColors = {
        pending: "bg-blue-500",
        in_progress: "bg-yellow-500",
        review: "bg-purple-500",
        completed: "bg-green-500",
        cancelled: "bg-red-500",
    };
    const statusBadgeColors = {
        pending: "bg-blue-100 text-blue-800",
        in_progress: "bg-yellow-100 text-yellow-800",
        review: "bg-purple-100 text-purple-800",
        completed: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
    };
    const statusLabels = {
        pending: "Pending",
        in_progress: "In Progress",
        review: "In Review",
        completed: "Completed",
        cancelled: "Cancelled",
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { className: "cursor-pointer hover:border-primary transition-colors", onClick: () => setActiveDialog("capacity"), children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Capacity Utilization" }), _jsx(CardDescription, { children: "Current workload vs. capacity" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-2xl font-bold", children: [Math.round(dashboardMetrics.capacityUtilization * 100), "%"] }), _jsx(BarChart, { className: "h-4 w-4 text-muted-foreground" })] }), _jsx(Progress, { value: dashboardMetrics.capacityUtilization * 100, className: "h-2 mt-2" })] }), _jsx(CardFooter, { className: "pt-0 pb-2", children: _jsxs("div", { className: "text-xs text-blue-600 flex items-center", children: [_jsx("span", { children: "View details" }), _jsx(ChevronDown, { className: "ml-1 h-3 w-3" })] }) })] }), _jsxs(Card, { className: "cursor-pointer hover:border-primary transition-colors", onClick: () => setActiveDialog("deadlines"), children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Upcoming Deadlines" }), _jsx(CardDescription, { children: "Jobs due in the next 7 days" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-2xl font-bold", children: dashboardMetrics.upcomingDeadlines.length }), _jsx(Clock, { className: "h-4 w-4 text-muted-foreground" })] }), _jsx("div", { className: "mt-2 space-y-1", children: dashboardMetrics.upcomingDeadlines.slice(0, 2).map((job) => (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "truncate max-w-[180px]", children: job.title }), _jsx("span", { className: "text-muted-foreground", children: format(new Date(job.deadline), "MMM d") })] }, job.id))) })] }), _jsx(CardFooter, { className: "pt-0 pb-2", children: _jsxs("div", { className: "text-xs text-blue-600 flex items-center", children: [_jsx("span", { children: "View all deadlines" }), _jsx(ChevronDown, { className: "ml-1 h-3 w-3" })] }) })] }), _jsxs(Card, { className: "cursor-pointer hover:border-primary transition-colors", onClick: () => setActiveDialog("active"), children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Active Jobs" }), _jsx(CardDescription, { children: "Jobs in progress or review" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-2xl font-bold", children: (statusCounts.in_progress || 0) + (statusCounts.review || 0) }), _jsx(AlertTriangle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2 mt-2", children: [_jsxs("div", { className: "text-sm", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-yellow-500 mr-2" }), _jsx("span", { children: "In Progress:" })] }), _jsx("div", { className: "font-medium", children: statusCounts.in_progress || 0 })] }), _jsxs("div", { className: "text-sm", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-purple-500 mr-2" }), _jsx("span", { children: "In Review:" })] }), _jsx("div", { className: "font-medium", children: statusCounts.review || 0 })] })] })] }), _jsx(CardFooter, { className: "pt-0 pb-2", children: _jsxs("div", { className: "text-xs text-blue-600 flex items-center", children: [_jsx("span", { children: "View active jobs" }), _jsx(ChevronDown, { className: "ml-1 h-3 w-3" })] }) })] }), _jsxs(Card, { className: "cursor-pointer hover:border-primary transition-colors", onClick: () => setActiveDialog("completed"), children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Completed Jobs" }), _jsx(CardDescription, { children: "Successfully finished jobs" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-2xl font-bold", children: statusCounts.completed || 0 }), _jsx(CheckCircle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsx("div", { className: "mt-2", children: _jsxs("div", { className: "text-sm", children: [_jsx("span", { children: "Completion Rate:" }), _jsxs("div", { className: "font-medium", children: [totalJobs > 0
                                                            ? Math.round(((statusCounts.completed || 0) / totalJobs) * 100)
                                                            : 0, "%"] })] }) })] }), _jsx(CardFooter, { className: "pt-0 pb-2", children: _jsxs("div", { className: "text-xs text-blue-600 flex items-center", children: [_jsx("span", { children: "View completed jobs" }), _jsx(ChevronDown, { className: "ml-1 h-3 w-3" })] }) })] }), _jsxs(Card, { className: "md:col-span-2", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Job Status Distribution" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: Object.entries(statusLabels).map(([status, label]) => {
                                        const count = statusCounts[status] || 0;
                                        const percentage = totalJobs > 0 ? (count / totalJobs) * 100 : 0;
                                        return (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: label }), _jsxs("span", { children: [count, " (", Math.round(percentage), "%)"] })] }), _jsx("div", { className: "h-2 w-full bg-secondary rounded-full overflow-hidden", children: _jsx("div", { className: `h-full ${statusColors[status]}`, style: { width: `${percentage}%` } }) })] }, status));
                                    }) }) })] }), _jsxs(Card, { className: "md:col-span-2", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Staff Workload" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: staff.map((member) => {
                                        const assignedCount = member.assignedJobs.length;
                                        const maxJobs = 5; // Arbitrary max for visualization
                                        const percentage = Math.min((assignedCount / maxJobs) * 100, 100);
                                        return (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: member.name }), _jsxs("span", { children: [assignedCount, " job", assignedCount !== 1 ? "s" : ""] })] }), _jsx("div", { className: "h-2 w-full bg-secondary rounded-full overflow-hidden", children: _jsx("div", { className: `h-full ${assignedCount > 3 ? "bg-red-500" : assignedCount > 1 ? "bg-yellow-500" : "bg-green-500"}`, style: { width: `${percentage}%` } }) })] }, member.id));
                                    }) }) })] })] }), _jsx(Dialog, { open: activeDialog === "capacity", onOpenChange: () => setActiveDialog(null), children: _jsxs(DialogContent, { className: "max-w-4xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Capacity Utilization Details" }), _jsx(DialogDescription, { children: "Detailed breakdown of production capacity across staff members" })] }), _jsxs("div", { className: "py-4", children: [_jsx("h3", { className: "font-medium mb-2", children: "Overall Utilization" }), _jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex justify-between mb-1", children: [_jsx("span", { children: "Production Capacity" }), _jsxs("span", { children: [Math.round(dashboardMetrics.capacityUtilization * 100), "%"] })] }), _jsx(Progress, { value: dashboardMetrics.capacityUtilization * 100, className: "h-2" })] }), _jsx("h3", { className: "font-medium mt-6 mb-2", children: "Production Team Capacity" }), _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Staff Member" }), _jsx(TableHead, { children: "Assigned Jobs" }), _jsx(TableHead, { children: "Scheduled Hours" }), _jsx(TableHead, { children: "Available Hours" }), _jsx(TableHead, { children: "Utilization" })] }) }), _jsx(TableBody, { children: staff
                                                .filter(member => member.role === 'production')
                                                .map(member => {
                                                // Calculate scheduled hours
                                                const memberSchedule = schedule.filter(event => event.staffId === member.id);
                                                const scheduledHours = memberSchedule.reduce((total, event) => {
                                                    const start = new Date(event.startTime);
                                                    const end = new Date(event.endTime);
                                                    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                                }, 0);
                                                // Calculate available hours based on availability
                                                let availableHours = 0;
                                                ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
                                                    if (member.availability[day]) {
                                                        const hours = member.availabilityHours?.[day];
                                                        if (hours) {
                                                            const [startHour, startMin] = hours.start.split(':').map(Number);
                                                            const [endHour, endMin] = hours.end.split(':').map(Number);
                                                            availableHours += (endHour + endMin / 60) - (startHour + startMin / 60);
                                                        }
                                                        else {
                                                            // Default business hours
                                                            availableHours += 8; // 8 hour workday
                                                        }
                                                    }
                                                });
                                                const utilization = availableHours > 0 ? (scheduledHours / availableHours) * 100 : 0;
                                                return (_jsxs(TableRow, { children: [_jsx(TableCell, { children: member.name }), _jsx(TableCell, { children: member.assignedJobs.length }), _jsxs(TableCell, { children: [scheduledHours.toFixed(1), " hrs"] }), _jsxs(TableCell, { children: [availableHours.toFixed(1), " hrs"] }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: utilization, className: "h-2 w-24" }), _jsxs("span", { children: [Math.round(utilization), "%"] })] }) })] }, member.id));
                                            }) })] })] }), _jsx(DialogFooter, { children: _jsx(Button, { variant: "outline", onClick: () => setActiveDialog(null), children: "Close" }) })] }) }), _jsx(Dialog, { open: activeDialog === "deadlines", onOpenChange: () => setActiveDialog(null), children: _jsxs(DialogContent, { className: "max-w-3xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Upcoming Deadlines" }), _jsx(DialogDescription, { children: "Jobs with deadlines in the next 7 days" })] }), _jsx(ScrollArea, { className: "h-[400px] pr-4", children: _jsxs("div", { className: "space-y-4", children: [dashboardMetrics.upcomingDeadlines.map(job => {
                                        const daysRemaining = Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) /
                                            (1000 * 60 * 60 * 24));
                                        const isLate = daysRemaining < 0;
                                        const isCritical = daysRemaining <= 1;
                                        const isWarning = daysRemaining <= 3;
                                        return (_jsxs(Card, { className: `border ${isLate ? 'border-red-500' : isCritical ? 'border-orange-500' : isWarning ? 'border-yellow-500' : 'border-gray-200'}`, children: [_jsx(CardHeader, { className: "py-3", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-base", children: job.title }), _jsx(CardDescription, { children: job.client })] }), _jsx(Badge, { className: statusBadgeColors[job.status], children: statusLabels[job.status] })] }) }), _jsx(CardContent, { className: "py-2", children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Deadline" }), _jsx("p", { className: "font-medium", children: format(new Date(job.deadline), "MMMM d, yyyy") })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Time Remaining" }), _jsx("p", { className: `font-medium ${isLate ? 'text-red-600' : isCritical ? 'text-orange-600' : ''}`, children: isLate ? `${Math.abs(daysRemaining)} days overdue` :
                                                                            daysRemaining === 0 ? "Due today" :
                                                                                `${daysRemaining} days remaining` })] })] }) })] }, job.id));
                                    }), dashboardMetrics.upcomingDeadlines.length === 0 && (_jsx("div", { className: "py-8 text-center text-muted-foreground", children: _jsx("p", { children: "No upcoming deadlines in the next 7 days" }) }))] }) }), _jsx(DialogFooter, { children: _jsx(Button, { variant: "outline", onClick: () => setActiveDialog(null), children: "Close" }) })] }) }), _jsx(Dialog, { open: activeDialog === "active", onOpenChange: () => setActiveDialog(null), children: _jsxs(DialogContent, { className: "max-w-4xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Active Jobs" }), _jsx(DialogDescription, { children: "Jobs currently in progress or under review" })] }), _jsx(ScrollArea, { className: "h-[400px] pr-4", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Job Title" }), _jsx(TableHead, { children: "Client" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Assigned To" }), _jsx(TableHead, { children: "Deadline" })] }) }), _jsxs(TableBody, { children: [jobs
                                                .filter(job => job.status === 'in_progress' || job.status === 'review')
                                                .map(job => {
                                                const assignedStaff = job.assignedTo ?
                                                    staff.find(s => s.id === job.assignedTo)?.name || 'Unknown' :
                                                    'Unassigned';
                                                return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: job.title }), _jsx(TableCell, { children: job.client }), _jsx(TableCell, { children: _jsx(Badge, { className: statusBadgeColors[job.status], children: statusLabels[job.status] }) }), _jsx(TableCell, { children: assignedStaff }), _jsx(TableCell, { children: format(new Date(job.deadline), "MMM d, yyyy") })] }, job.id));
                                            }), jobs.filter(job => job.status === 'in_progress' || job.status === 'review').length === 0 && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, className: "text-center py-4 text-muted-foreground", children: "No active jobs found" }) }))] })] }) }), _jsx(DialogFooter, { children: _jsx(Button, { variant: "outline", onClick: () => setActiveDialog(null), children: "Close" }) })] }) }), _jsx(Dialog, { open: activeDialog === "completed", onOpenChange: () => setActiveDialog(null), children: _jsxs(DialogContent, { className: "max-w-4xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Completed Jobs" }), _jsx(DialogDescription, { children: "Recently completed jobs" })] }), _jsx(ScrollArea, { className: "h-[400px] pr-4", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Job Title" }), _jsx(TableHead, { children: "Client" }), _jsx(TableHead, { children: "Completed By" }), _jsx(TableHead, { children: "Job Type" }), _jsx(TableHead, { children: "Completion Date" })] }) }), _jsxs(TableBody, { children: [jobs
                                                .filter(job => job.status === 'completed')
                                                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                                                .slice(0, 15) // Show only the 15 most recent
                                                .map(job => {
                                                const assignedStaff = job.assignedTo ?
                                                    staff.find(s => s.id === job.assignedTo)?.name || 'Unknown' :
                                                    'Unassigned';
                                                return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: job.title }), _jsx(TableCell, { children: job.client }), _jsx(TableCell, { children: assignedStaff }), _jsx(TableCell, { children: job.jobType.replace('_', ' ') }), _jsx(TableCell, { children: format(new Date(job.updatedAt), "MMM d, yyyy") })] }, job.id));
                                            }), jobs.filter(job => job.status === 'completed').length === 0 && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, className: "text-center py-4 text-muted-foreground", children: "No completed jobs found" }) }))] })] }) }), _jsx(DialogFooter, { children: _jsx(Button, { variant: "outline", onClick: () => setActiveDialog(null), children: "Close" }) })] }) })] }));
}
