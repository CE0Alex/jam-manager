import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, } from "recharts";
export default function FinancialReport({ startDate, endDate, }) {
    const { jobs } = useAppContext();
    // Filter jobs by date range
    const filteredJobs = jobs.filter((job) => {
        const jobDate = new Date(job.createdAt);
        return jobDate >= startDate && jobDate <= endDate;
    });
    // Calculate revenue (empty data)
    const totalRevenue = 0;
    const totalCosts = 0;
    const totalProfit = 0;
    const profitMargin = 0;
    // Generate revenue by month data (empty)
    const revenueByMonth = [
        { name: "Jan", revenue: 0, costs: 0, profit: 0 },
        { name: "Feb", revenue: 0, costs: 0, profit: 0 },
        { name: "Mar", revenue: 0, costs: 0, profit: 0 },
        { name: "Apr", revenue: 0, costs: 0, profit: 0 },
        { name: "May", revenue: 0, costs: 0, profit: 0 },
        { name: "Jun", revenue: 0, costs: 0, profit: 0 },
    ];
    // Generate revenue by job type data (empty)
    const revenueByJobType = [
        { name: "Business Cards", value: 0 },
        { name: "Brochures", value: 0 },
        { name: "Posters", value: 0 },
        { name: "Banners", value: 0 },
        { name: "Flyers", value: 0 },
    ];
    // Generate cost breakdown data (empty)
    const costBreakdown = [
        { name: "Materials", value: 0 },
        { name: "Labor", value: 0 },
        { name: "Equipment", value: 0 },
        { name: "Overhead", value: 0 },
        { name: "Marketing", value: 0 },
    ];
    // Generate profit margin trend data (empty)
    const profitMarginTrend = [
        { name: "Jan", margin: 0 },
        { name: "Feb", margin: 0 },
        { name: "Mar", margin: 0 },
        { name: "Apr", margin: 0 },
        { name: "May", margin: 0 },
        { name: "Jun", margin: 0 },
    ];
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Total Revenue" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold", children: ["$", totalRevenue.toLocaleString()] }), _jsxs("p", { className: "text-muted-foreground text-sm mt-1", children: ["From ", filteredJobs.length, " jobs"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Total Costs" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold", children: ["$", totalCosts.toLocaleString()] }), _jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Materials, labor, etc." })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Total Profit" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold", children: ["$", totalProfit.toLocaleString()] }), _jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Revenue - Costs" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Profit Margin" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold", children: [profitMargin.toFixed(1), "%"] }), _jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Industry avg: 35%" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Revenue, Costs & Profit by Month" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: revenueByMonth, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, {}), _jsx(Tooltip, { formatter: (value) => [`$${value}`, "Amount"] }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "revenue", fill: "#8884d8", name: "Revenue ($)" }), _jsx(Bar, { dataKey: "costs", fill: "#ff8042", name: "Costs ($)" }), _jsx(Bar, { dataKey: "profit", fill: "#82ca9d", name: "Profit ($)" })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Profit Margin Trend" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: profitMarginTrend, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, { domain: [0, 50] }), _jsx(Tooltip, { formatter: (value) => [`${value}%`, "Profit Margin"] }), _jsx(Legend, {}), _jsx(Line, { type: "monotone", dataKey: "margin", stroke: "#82ca9d", activeDot: { r: 8 }, name: "Profit Margin (%)", strokeWidth: 2 })] }) }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Revenue by Job Type" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: revenueByJobType, cx: "50%", cy: "50%", labelLine: false, outerRadius: 80, fill: "#8884d8", dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, children: revenueByJobType.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { formatter: (value) => [`$${value}`, "Revenue"] }), _jsx(Legend, {})] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Cost Breakdown" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: costBreakdown, cx: "50%", cy: "50%", labelLine: false, outerRadius: 80, fill: "#8884d8", dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, children: costBreakdown.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { formatter: (value) => [`${value}%`, "Percentage"] }), _jsx(Legend, {})] }) }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Revenue Forecast" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: [
                                    { month: "Jul", actual: 0, forecast: 17000 },
                                    { month: "Aug", actual: 0, forecast: 18000 },
                                    { month: "Sep", actual: 0, forecast: 19000 },
                                    { month: "Oct", actual: 0, forecast: 20000 },
                                    { month: "Nov", actual: 0, forecast: 22000 },
                                    { month: "Dec", actual: 0, forecast: 25000 },
                                ], children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "month" }), _jsx(YAxis, {}), _jsx(Tooltip, { formatter: (value) => [`$${value}`, "Amount"] }), _jsx(Legend, {}), _jsx(Area, { type: "monotone", dataKey: "forecast", stroke: "#8884d8", fill: "#8884d8", fillOpacity: 0.3, name: "Revenue Forecast ($)" })] }) }) })] })] }));
}
