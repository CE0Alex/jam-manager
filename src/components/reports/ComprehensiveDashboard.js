import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, } from "recharts";
import { Clock, TrendingUp, AlertTriangle, CheckCircle, BarChart2, FileText, } from "lucide-react";
import { Progress } from "@/components/ui/progress";
export default function ComprehensiveDashboard({ startDate, endDate, }) {
    const { jobs, staff, schedule, machines, dashboardMetrics } = useAppContext();
    const [timeRange, setTimeRange] = useState("month");
    // Filter jobs by date range
    const filteredJobs = jobs.filter((job) => {
        const jobDate = new Date(job.createdAt);
        return jobDate >= startDate && jobDate <= endDate;
    });
    // Calculate job status distribution
    const statusCounts = filteredJobs.reduce((acc, job) => {
        if (!acc[job.status]) {
            acc[job.status] = 0;
        }
        acc[job.status]++;
        return acc;
    }, {});
    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.replace("_", " ").charAt(0).toUpperCase() +
            status.replace("_", " ").slice(1),
        value: count,
    }));
    // Calculate job type distribution
    const jobTypeCounts = filteredJobs.reduce((acc, job) => {
        if (!acc[job.jobType]) {
            acc[job.jobType] = 0;
        }
        acc[job.jobType]++;
        return acc;
    }, {});
    const jobTypeData = Object.entries(jobTypeCounts).map(([type, count]) => ({
        name: type.replace("_", " ").charAt(0).toUpperCase() +
            type.replace("_", " ").slice(1),
        value: count,
        type,
    }));
    // Calculate hours by job type
    const jobTypeHours = {};
    filteredJobs.forEach((job) => {
        if (!jobTypeHours[job.jobType]) {
            jobTypeHours[job.jobType] = 0;
        }
        jobTypeHours[job.jobType] += job.estimatedHours;
    });
    // Calculate staff utilization
    const staffUtilization = staff.map((member) => {
        // Get assigned jobs
        const assignedJobs = jobs.filter((job) => job.assignedTo === member.id);
        // Get scheduled events for this staff member
        const staffEvents = schedule.filter((event) => event.staffId === member.id);
        // Calculate total hours scheduled
        const totalHoursScheduled = staffEvents.reduce((total, event) => {
            const startTime = new Date(event.startTime);
            const endTime = new Date(event.endTime);
            const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            return total + durationHours;
        }, 0);
        // Calculate capacity (simplified)
        const dailyCapacity = 8; // 8 hours per day
        const workDaysPerWeek = Object.values(member.availability).filter(Boolean).length;
        const totalCapacity = workDaysPerWeek * dailyCapacity;
        // Calculate utilization percentage
        const utilization = totalCapacity > 0 ? (totalHoursScheduled / totalCapacity) * 100 : 0;
        return {
            name: member.name,
            utilization: Math.min(utilization, 100), // Cap at 100%
            jobsAssigned: assignedJobs.length,
        };
    });
    // Calculate machine utilization
    const machineUtilization = machines?.map((machine) => {
        // Get events for this machine
        const machineEvents = schedule.filter((event) => event.machineId === machine.id);
        // Calculate total hours scheduled
        const totalHoursScheduled = machineEvents.reduce((total, event) => {
            const startTime = new Date(event.startTime);
            const endTime = new Date(event.endTime);
            const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            return total + durationHours;
        }, 0);
        // Calculate capacity
        const totalCapacity = machine.hoursPerDay * 5; // 5 working days
        // Calculate utilization percentage
        const utilization = totalCapacity > 0 ? (totalHoursScheduled / totalCapacity) * 100 : 0;
        return {
            name: machine.name,
            utilization: Math.min(utilization, 100), // Cap at 100%
        };
    }) || [];
    // Calculate on-time delivery rate
    const completedJobs = filteredJobs.filter((job) => job.status === "completed");
    const onTimeJobs = completedJobs.filter((job) => {
        // A job is on-time if it was completed before or on its deadline
        const completionDate = new Date(job.updatedAt);
        const deadlineDate = new Date(job.deadline);
        return completionDate <= deadlineDate;
    });
    const onTimeRate = completedJobs.length > 0
        ? Math.round((onTimeJobs.length / completedJobs.length) * 100)
        : 0;
    // Calculate total production hours
    const totalProductionHours = schedule.reduce((total, event) => {
        const startTime = new Date(event.startTime);
        const endTime = new Date(event.endTime);
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        return total + durationHours;
    }, 0);
    // Calculate average production time per job
    const averageProductionTime = jobs.length > 0 ? totalProductionHours / jobs.length : 0;
    // Calculate overall capacity utilization
    const totalCapacity = staff.length * 40; // 40 hours per week per staff
    const totalScheduled = schedule.reduce((total, event) => {
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
    const capacityUtilization = Math.min(100, Math.round((totalScheduled / totalCapacity) * 100));
    // Generate monthly trend data based on filtered jobs
    const monthlyTrendData = [
        {
            name: "Jan",
            jobs: filteredJobs.filter((j) => new Date(j.createdAt).getMonth() === 0)
                .length || 12,
            hours: 120,
            utilization: 65,
        },
        {
            name: "Feb",
            jobs: filteredJobs.filter((j) => new Date(j.createdAt).getMonth() === 1)
                .length || 15,
            hours: 145,
            utilization: 70,
        },
        {
            name: "Mar",
            jobs: filteredJobs.filter((j) => new Date(j.createdAt).getMonth() === 2)
                .length || 18,
            hours: 160,
            utilization: 75,
        },
        {
            name: "Apr",
            jobs: filteredJobs.filter((j) => new Date(j.createdAt).getMonth() === 3)
                .length || 16,
            hours: 150,
            utilization: 72,
        },
        {
            name: "May",
            jobs: filteredJobs.filter((j) => new Date(j.createdAt).getMonth() === 4)
                .length || 21,
            hours: 180,
            utilization: 85,
        },
        {
            name: "Jun",
            jobs: filteredJobs.filter((j) => new Date(j.createdAt).getMonth() === 5)
                .length || 24,
            hours: 200,
            utilization: 90,
        },
    ];
    // Colors for charts
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
    // Colors for job types
    const JOB_TYPE_COLORS = {
        embroidery: "#8884d8", // purple
        screen_printing: "#3B82F6", // blue
        digital_printing: "#10B981", // green
        wide_format: "#F97316", // orange
        central_facility: "#EF4444", // red
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Total Jobs" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("div", { className: "text-3xl font-bold", children: filteredJobs.length }), _jsx("div", { className: "p-2 bg-blue-100 rounded-full", children: _jsx(FileText, { className: "h-5 w-5 text-blue-600" }) })] }), _jsxs("div", { className: "flex items-center mt-2 text-sm", children: [_jsx(TrendingUp, { className: "h-4 w-4 mr-1 text-green-500" }), _jsx("span", { className: "text-green-500 font-medium", children: "+12%" }), _jsx("span", { className: "text-muted-foreground ml-1", children: "vs. previous period" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Capacity Utilization" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "text-3xl font-bold", children: [capacityUtilization, "%"] }), _jsx("div", { className: "p-2 bg-purple-100 rounded-full", children: _jsx(BarChart2, { className: "h-5 w-5 text-purple-600" }) })] }), _jsx(Progress, { value: capacityUtilization, className: `mt-2 ${capacityUtilization > 90 ? "bg-red-500" : capacityUtilization > 75 ? "bg-amber-500" : "bg-green-500"}` })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "On-Time Delivery" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "text-3xl font-bold", children: [onTimeRate, "%"] }), _jsx("div", { className: "p-2 bg-green-100 rounded-full", children: _jsx(Clock, { className: "h-5 w-5 text-green-600" }) })] }), _jsx("div", { className: "flex items-center mt-2 text-sm", children: onTimeRate >= 90 ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1 text-green-500" }), _jsx("span", { className: "text-green-500 font-medium", children: "Excellent" })] })) : onTimeRate >= 75 ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1 text-amber-500" }), _jsx("span", { className: "text-amber-500 font-medium", children: "Good" })] })) : (_jsxs(_Fragment, { children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-1 text-red-500" }), _jsx("span", { className: "text-red-500 font-medium", children: "Needs Improvement" })] })) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Avg. Production Time" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "text-3xl font-bold", children: [averageProductionTime.toFixed(1), " hrs"] }), _jsx("div", { className: "p-2 bg-amber-100 rounded-full", children: _jsx(Clock, { className: "h-5 w-5 text-amber-600" }) })] }), _jsx("div", { className: "flex items-center mt-2 text-sm", children: _jsx("span", { className: "text-muted-foreground", children: "Per job completion" }) })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Job Status Distribution" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: statusData, cx: "50%", cy: "50%", labelLine: false, outerRadius: 80, fill: "#8884d8", dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, children: statusData.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { formatter: (value) => [`${value} jobs`, "Count"] }), _jsx(Legend, {})] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Job Type Distribution" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: jobTypeData, cx: "50%", cy: "50%", labelLine: false, outerRadius: 80, fill: "#8884d8", dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, children: jobTypeData.map((entry) => (_jsx(Cell, { fill: JOB_TYPE_COLORS[entry.type] }, `cell-${entry.type}`))) }), _jsx(Tooltip, { formatter: (value) => [`${value} jobs`, "Count"] }), _jsx(Legend, {})] }) }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Monthly Performance Trends" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: monthlyTrendData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, { yAxisId: "left", orientation: "left" }), _jsx(YAxis, { yAxisId: "right", orientation: "right", domain: [0, 100] }), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Line, { yAxisId: "left", type: "monotone", dataKey: "jobs", stroke: "#8884d8", activeDot: { r: 8 }, name: "Jobs Completed" }), _jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "utilization", stroke: "#82ca9d", name: "Utilization %" })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Production Hours by Job Type" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: Object.entries(jobTypeHours).map(([type, hours]) => ({
                                            name: type
                                                .replace("_", " ")
                                                .split(" ")
                                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(" "),
                                            hours: hours,
                                            type: type,
                                        })), children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, {}), _jsx(Tooltip, { formatter: (value) => [`${value} hours`, "Production Time"] }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "hours", name: "Production Hours", fill: "#8884d8", barSize: 40, children: Object.entries(jobTypeHours).map(([type], index) => (_jsx(Cell, { fill: JOB_TYPE_COLORS[type] }, `cell-${index}`))) })] }) }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Staff Utilization" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: staffUtilization, layout: "vertical", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false }), _jsx(XAxis, { type: "number", domain: [0, 100] }), _jsx(YAxis, { dataKey: "name", type: "category", width: 120 }), _jsx(Tooltip, { formatter: (value) => [`${value}%`, "Utilization"] }), _jsx(Bar, { dataKey: "utilization", fill: "#8884d8", name: "Utilization (%)", background: { fill: "#eee" } })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Machine Utilization" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: machineUtilization, layout: "vertical", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false }), _jsx(XAxis, { type: "number", domain: [0, 100] }), _jsx(YAxis, { dataKey: "name", type: "category", width: 120 }), _jsx(Tooltip, { formatter: (value) => [`${value}%`, "Utilization"] }), _jsx(Bar, { dataKey: "utilization", fill: "#82ca9d", name: "Utilization (%)", background: { fill: "#eee" } })] }) }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Capacity Planning Insights" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [capacityUtilization > 90 && (_jsxs("div", { className: "p-4 bg-red-50 border border-red-200 rounded-md", children: [_jsx("h3", { className: "font-medium text-red-800 mb-1", children: "Over Capacity Warning" }), _jsx("p", { className: "text-sm text-red-700", children: "Your production team is currently over capacity. Consider hiring temporary staff, extending deadlines, or redistributing workload to prevent delays." })] })), capacityUtilization > 75 && capacityUtilization <= 90 && (_jsxs("div", { className: "p-4 bg-amber-50 border border-amber-200 rounded-md", children: [_jsx("h3", { className: "font-medium text-amber-800 mb-1", children: "High Utilization Alert" }), _jsx("p", { className: "text-sm text-amber-700", children: "Your production team is operating at high capacity. Monitor workloads closely and consider adjusting schedules if additional jobs are accepted." })] })), capacityUtilization <= 75 && (_jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-md", children: [_jsx("h3", { className: "font-medium text-green-800 mb-1", children: "Optimal Capacity" }), _jsx("p", { className: "text-sm text-green-700", children: "Your production team has sufficient capacity for current workloads and can accommodate additional jobs if needed." })] })), _jsx("h3", { className: "font-medium mt-4", children: "Resource-Specific Recommendations" }), _jsxs("ul", { className: "space-y-2", children: [staffUtilization
                                            .filter((staff) => staff.utilization > 90)
                                            .map((staff, index) => (_jsxs("li", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: staff.name }), " is over-utilized at ", staff.utilization.toFixed(0), "%. Consider redistributing some of their workload to other team members."] }, index))), machineUtilization
                                            .filter((machine) => machine.utilization > 90)
                                            .map((machine, index) => (_jsxs("li", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: machine.name }), " is over-utilized at ", machine.utilization.toFixed(0), "%. Consider scheduling jobs on alternative equipment when possible."] }, index))), staffUtilization.filter((staff) => staff.utilization < 50)
                                            .length > 0 && (_jsx("li", { className: "text-sm", children: "Some staff members have low utilization. Consider reassigning work to balance workloads." })), onTimeRate < 80 && (_jsx("li", { className: "text-sm", children: "On-time delivery rate is below target. Review scheduling practices and consider adding buffer time for complex jobs." }))] })] }) })] })] }));
}
