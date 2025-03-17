import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, } from "recharts";
import { useAppContext } from "@/context/AppContext";
const StatusDistribution = ({ data: propData, className = "", }) => {
    const { dashboardMetrics } = useAppContext();
    const [timeRange, setTimeRange] = useState("month");
    const [viewType, setViewType] = useState("chart");
    // Use the data from props or from context
    const statusCounts = propData || dashboardMetrics.jobStatusDistribution;
    // Transform data for chart
    const chartData = Object.entries(statusCounts).map(([status, count]) => ({
        name: formatStatus(status),
        value: count,
        status,
    }));
    // Colors for different statuses
    const COLORS = {
        pending: "#FFB547", // amber
        in_progress: "#3B82F6", // blue
        review: "#8B5CF6", // purple
        completed: "#10B981", // green
        cancelled: "#EF4444", // red
    };
    // Format status for display
    function formatStatus(status) {
        return status
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
    // Calculate total jobs
    const totalJobs = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    return (_jsxs(Card, { className: `w-full h-full bg-white ${className}`, children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-xl font-bold", children: "Job Status Distribution" }), _jsx(CardDescription, { children: "Overview of jobs by current status" })] }), _jsx("div", { className: "flex space-x-2", children: _jsxs(Select, { value: timeRange, onValueChange: (value) => setTimeRange(value), children: [_jsx(SelectTrigger, { className: "w-[120px]", children: _jsx(SelectValue, { placeholder: "Time Range" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "week", children: "This Week" }), _jsx(SelectItem, { value: "month", children: "This Month" }), _jsx(SelectItem, { value: "quarter", children: "This Quarter" }), _jsx(SelectItem, { value: "year", children: "This Year" })] })] }) })] }), _jsx(CardContent, { children: _jsxs(Tabs, { value: viewType, onValueChange: (value) => setViewType(value), children: [_jsxs(TabsList, { className: "grid w-[200px] grid-cols-2 mb-4", children: [_jsx(TabsTrigger, { value: "chart", children: "Chart" }), _jsx(TabsTrigger, { value: "table", children: "Table" })] }), _jsx(TabsContent, { value: "chart", className: "h-[250px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: chartData, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 90, paddingAngle: 2, dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, children: chartData.map((entry, index) => (_jsx(Cell, { fill: COLORS[entry.status] }, `cell-${index}`))) }), _jsx(Tooltip, { formatter: (value) => [`${value} jobs`, "Count"], labelFormatter: (name) => `Status: ${name}` }), _jsx(Legend, {})] }) }) }), _jsx(TabsContent, { value: "table", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "text-left py-2", children: "Status" }), _jsx("th", { className: "text-right py-2", children: "Count" }), _jsx("th", { className: "text-right py-2", children: "Percentage" })] }) }), _jsx("tbody", { children: chartData.map((item, index) => {
                                                const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
                                                const percentage = total > 0
                                                    ? ((item.value / total) * 100).toFixed(1)
                                                    : "0.0";
                                                return (_jsxs("tr", { className: "border-t border-gray-200", children: [_jsx("td", { className: "py-2", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-3 h-3 rounded-full mr-2", style: {
                                                                            backgroundColor: COLORS[item.status],
                                                                        } }), item.name] }) }), _jsx("td", { className: "text-right py-2", children: item.value }), _jsxs("td", { className: "text-right py-2", children: [percentage, "%"] })] }, index));
                                            }) })] }) }) })] }) })] }));
};
export default StatusDistribution;
