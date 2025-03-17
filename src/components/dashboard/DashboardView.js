import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import StatusDistribution from "./StatusDistribution";
import CapacityUtilization from "./CapacityUtilization";
import UpcomingDeadlines from "./UpcomingDeadlines";
import DashboardCalendar from "./Calendar";
import { useAppContext } from "@/context/AppContext";
const DashboardView = ({ metrics: propMetrics, }) => {
    const { jobs, dashboardMetrics, refreshDashboard } = useAppContext();
    const [metrics, setMetrics] = useState(dashboardMetrics || {
        upcomingDeadlines: [],
        capacityUtilization: 0,
        jobStatusDistribution: {
            pending: 0,
            in_progress: 0,
            review: 0,
            completed: 0,
            cancelled: 0,
            archived: 0
        },
        staffWorkload: {},
    });
    // Dialog state
    const [activeDialog, setActiveDialog] = useState(null);
    // Force a refresh of dashboard metrics when component mounts
    useEffect(() => {
        refreshDashboard();
    }, [refreshDashboard]);
    // Calculate job status distribution directly from jobs array
    useEffect(() => {
        // Initialize status counts
        const statusCounts = {
            pending: 0,
            in_progress: 0,
            review: 0,
            completed: 0,
            cancelled: 0,
            archived: 0
        };
        // Count jobs by status
        jobs.forEach((job) => {
            statusCounts[job.status]++;
        });
        // Update metrics with real-time job status distribution
        setMetrics((prev) => ({
            ...prev,
            jobStatusDistribution: statusCounts,
        }));
    }, [jobs]);
    // Calculate active jobs count directly from jobs array
    const activeJobsCount = jobs.filter((job) => job.status === "in_progress" || job.status === "review").length;
    // Status display helpers
    const statusLabels = {
        pending: "Pending",
        in_progress: "In Progress",
        review: "In Review",
        completed: "Completed",
        cancelled: "Cancelled",
        archived: "Archived"
    };
    const statusBadgeColors = {
        pending: "bg-blue-100 text-blue-800",
        in_progress: "bg-yellow-100 text-yellow-800",
        review: "bg-purple-100 text-purple-800",
        completed: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
        archived: "bg-gray-100 text-gray-800"
    };
    return (_jsxs("div", { className: "p-6 bg-gray-50 min-h-screen", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Dashboard" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Overview of your print shop operations and performance metrics." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6", children: [_jsxs(Card, { className: "bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer", onClick: () => setActiveDialog("totalJobs"), children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Total Jobs" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold", children: jobs.length }), _jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Across all statuses" })] })] }), _jsxs(Card, { className: "bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer", onClick: () => setActiveDialog("activeJobs"), children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Active Jobs" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold", children: activeJobsCount }), _jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "In progress or review" })] })] }), _jsxs(Card, { className: "bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer", onClick: () => setActiveDialog("capacity"), children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Current Capacity" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold", children: [metrics.capacityUtilization, "%"] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2.5 mt-2", children: _jsx("div", { className: `h-2.5 rounded-full ${metrics.capacityUtilization > 90 ? "bg-red-500" : metrics.capacityUtilization > 75 ? "bg-amber-500" : "bg-green-500"}`, style: { width: `${metrics.capacityUtilization}%` } }) }), _jsx("p", { className: "text-muted-foreground text-sm mt-1", children: metrics.capacityUtilization > 90
                                            ? "Over capacity"
                                            : metrics.capacityUtilization > 75
                                                ? "High utilization"
                                                : "Normal utilization" })] })] })] }), _jsx("div", { className: "mb-6 h-[600px]", children: _jsx(DashboardCalendar, {}) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6", children: [_jsx(StatusDistribution, { data: metrics.jobStatusDistribution }), _jsx(CapacityUtilization, { currentUtilization: metrics.capacityUtilization })] }), _jsx("div", { className: "grid grid-cols-1 gap-6", children: _jsx(UpcomingDeadlines, {}) }), _jsx(Dialog, { open: activeDialog === "totalJobs", onOpenChange: (open) => !open && setActiveDialog(null), children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh]", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Total Jobs Breakdown" }) }), _jsx(ScrollArea, { className: "max-h-[60vh]", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Job Title" }), _jsx(TableHead, { children: "Client" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Deadline" }), _jsx(TableHead, { children: "Hours" })] }) }), _jsx(TableBody, { children: jobs.map((job) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: job.title }), _jsx(TableCell, { children: job.client }), _jsx(TableCell, { children: _jsx(Badge, { className: statusBadgeColors[job.status], children: statusLabels[job.status] }) }), _jsx(TableCell, { children: new Date(job.deadline).toLocaleDateString() }), _jsx(TableCell, { children: job.estimatedHours })] }, job.id))) })] }) }), _jsx(DialogFooter, { children: _jsx(Button, { onClick: () => setActiveDialog(null), children: "Close" }) })] }) }), _jsx(Dialog, { open: activeDialog === "activeJobs", onOpenChange: (open) => !open && setActiveDialog(null), children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh]", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Active Jobs" }) }), _jsx(ScrollArea, { className: "max-h-[60vh]", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Job Title" }), _jsx(TableHead, { children: "Client" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Deadline" }), _jsx(TableHead, { children: "Hours" })] }) }), _jsx(TableBody, { children: jobs
                                            .filter((job) => job.status === "in_progress" || job.status === "review")
                                            .map((job) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: job.title }), _jsx(TableCell, { children: job.client }), _jsx(TableCell, { children: _jsx(Badge, { className: statusBadgeColors[job.status], children: statusLabels[job.status] }) }), _jsx(TableCell, { children: new Date(job.deadline).toLocaleDateString() }), _jsx(TableCell, { children: job.estimatedHours })] }, job.id))) })] }) }), _jsx(DialogFooter, { children: _jsx(Button, { onClick: () => setActiveDialog(null), children: "Close" }) })] }) }), _jsx(Dialog, { open: activeDialog === "capacity", onOpenChange: (open) => !open && setActiveDialog(null), children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh]", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Capacity Utilization Details" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Overall Capacity" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-full bg-gray-200 rounded-full h-4", children: _jsx("div", { className: `h-4 rounded-full ${metrics.capacityUtilization > 90
                                                            ? "bg-red-500"
                                                            : metrics.capacityUtilization > 75
                                                                ? "bg-amber-500"
                                                                : "bg-green-500"}`, style: { width: `${metrics.capacityUtilization}%` } }) }), _jsxs("span", { className: "font-bold", children: [metrics.capacityUtilization, "%"] })] }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: metrics.capacityUtilization > 90
                                                ? "Your shop is over capacity. Consider rescheduling or adding resources."
                                                : metrics.capacityUtilization > 75
                                                    ? "Your shop is nearing capacity. Monitor workload closely."
                                                    : "Your shop has available capacity for more jobs." })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Staff Workload" }), _jsx(ScrollArea, { className: "max-h-[40vh]", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Staff Member" }), _jsx(TableHead, { children: "Assigned Jobs" }), _jsx(TableHead, { children: "Workload" })] }) }), _jsx(TableBody, { children: Object.entries(metrics.staffWorkload).map(([staffId, workload]) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: staffId }), _jsx(TableCell, { children: workload }), _jsx(TableCell, { children: _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${workload > 90
                                                                                ? "bg-red-500"
                                                                                : workload > 75
                                                                                    ? "bg-amber-500"
                                                                                    : "bg-green-500"}`, style: { width: `${workload}%` } }) }) })] }, staffId))) })] }) })] })] }), _jsx(DialogFooter, { children: _jsx(Button, { onClick: () => setActiveDialog(null), children: "Close" }) })] }) })] }));
};
export default DashboardView;
