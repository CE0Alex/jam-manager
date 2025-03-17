import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, } from "recharts";
export default function JobTypeDistribution({ startDate, endDate, viewType = "pie", }) {
    const { jobs } = useAppContext();
    // Filter jobs by date range
    const filteredJobs = jobs.filter((job) => {
        const jobDate = new Date(job.createdAt);
        return jobDate >= startDate && jobDate <= endDate;
    });
    // Count jobs by type
    const jobTypeCounts = {
        embroidery: 0,
        screen_printing: 0,
        digital_printing: 0,
        wide_format: 0,
        central_facility: 0,
    };
    filteredJobs.forEach((job) => {
        jobTypeCounts[job.jobType]++;
    });
    // Calculate hours by job type
    const jobTypeHours = {
        embroidery: 0,
        screen_printing: 0,
        digital_printing: 0,
        wide_format: 0,
        central_facility: 0,
    };
    filteredJobs.forEach((job) => {
        jobTypeHours[job.jobType] += job.estimatedHours;
    });
    // Format data for charts
    const chartData = Object.entries(jobTypeCounts).map(([type, count]) => ({
        name: formatJobType(type),
        value: count,
        hours: jobTypeHours[type],
        type,
    }));
    // Colors for different job types
    const COLORS = {
        embroidery: "#8884d8", // purple
        screen_printing: "#3B82F6", // blue
        digital_printing: "#10B981", // green
        wide_format: "#F97316", // orange
        central_facility: "#EF4444", // red
    };
    // Format job type for display
    function formatJobType(type) {
        return type
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
    // Get badge for job type
    const getJobTypeBadge = (type) => {
        const badgeClasses = {
            embroidery: "bg-purple-100 text-purple-800 border-purple-200",
            screen_printing: "bg-blue-100 text-blue-800 border-blue-200",
            digital_printing: "bg-green-100 text-green-800 border-green-200",
            wide_format: "bg-orange-100 text-orange-800 border-orange-200",
            central_facility: "bg-red-100 text-red-800 border-red-200",
        };
        return (_jsx(Badge, { variant: "outline", className: badgeClasses[type], children: formatJobType(type) }));
    };
    return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Job Type Distribution" }) }), _jsxs(CardContent, { children: [viewType === "pie" ? (_jsx("div", { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: chartData, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 90, paddingAngle: 2, dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, children: chartData.map((entry) => (_jsx(Cell, { fill: COLORS[entry.type] }, `cell-${entry.type}`))) }), _jsx(Tooltip, { formatter: (value, name, props) => [
                                            `${value} jobs (${props.payload.hours} hours)`,
                                            name,
                                        ] }), _jsx(Legend, {})] }) }) })) : (_jsx("div", { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, { yAxisId: "left", orientation: "left" }), _jsx(YAxis, { yAxisId: "right", orientation: "right", domain: [0, "auto"] }), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Bar, { yAxisId: "left", dataKey: "value", name: "Job Count", fill: "#8884d8" }), _jsx(Bar, { yAxisId: "right", dataKey: "hours", name: "Total Hours", fill: "#82ca9d" })] }) }) })), _jsxs("div", { className: "mt-4 grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium mb-2", children: "Job Count by Type" }), _jsx("div", { className: "space-y-2", children: Object.entries(jobTypeCounts).map(([type, count]) => (_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("div", { children: getJobTypeBadge(type) }), _jsxs("div", { className: "font-medium", children: [count, " jobs"] })] }, type))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium mb-2", children: "Production Hours by Type" }), _jsx("div", { className: "space-y-2", children: Object.entries(jobTypeHours).map(([type, hours]) => (_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("div", { children: getJobTypeBadge(type) }), _jsxs("div", { className: "font-medium", children: [hours.toFixed(1), " hours"] })] }, type))) })] })] })] })] }));
}
