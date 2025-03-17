import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, } from "recharts";
export default function SalesReport({ startDate, endDate }) {
    const { jobs } = useAppContext();
    // Filter jobs by date range
    const filteredJobs = jobs.filter((job) => {
        const jobDate = new Date(job.createdAt);
        return jobDate >= startDate && jobDate <= endDate;
    });
    // Calculate total sales (empty data)
    const totalSales = 0;
    // Generate sales by client data (empty)
    const salesByClient = {};
    const salesByClientData = [];
    // Generate sales by month data (empty)
    const salesByMonth = [
        { name: "Jan", sales: 0 },
        { name: "Feb", sales: 0 },
        { name: "Mar", sales: 0 },
        { name: "Apr", sales: 0 },
        { name: "May", sales: 0 },
        { name: "Jun", sales: 0 },
    ];
    // Generate sales by job type data (empty)
    const salesByJobType = [
        { name: "Business Cards", value: 0 },
        { name: "Brochures", value: 0 },
        { name: "Posters", value: 0 },
        { name: "Banners", value: 0 },
        { name: "Flyers", value: 0 },
    ];
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Total Sales" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold", children: ["$", totalSales.toLocaleString()] }), _jsxs("p", { className: "text-muted-foreground text-sm mt-1", children: [filteredJobs.length, " jobs completed"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Average Job Value" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold", children: ["$", filteredJobs.length > 0
                                                ? (totalSales / filteredJobs.length).toLocaleString()
                                                : 0] }), _jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Per completed job" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Top Client" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold", children: salesByClientData.length > 0 ? salesByClientData[0].name : "N/A" }), _jsx("p", { className: "text-muted-foreground text-sm mt-1", children: salesByClientData.length > 0
                                            ? `$${salesByClientData[0].value.toLocaleString()} in sales`
                                            : "No sales data" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Sales by Month" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: salesByMonth, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, {}), _jsx(Tooltip, { formatter: (value) => [`$${value}`, "Sales"] }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "sales", fill: "#8884d8", name: "Sales ($)" })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Sales by Job Type" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: salesByJobType, cx: "50%", cy: "50%", labelLine: false, outerRadius: 80, fill: "#8884d8", dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, children: salesByJobType.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { formatter: (value) => [`${value}%`, "Percentage"] }), _jsx(Legend, {})] }) }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Top Clients by Sales" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: salesByClientData, layout: "vertical", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false }), _jsx(XAxis, { type: "number" }), _jsx(YAxis, { dataKey: "name", type: "category", width: 150 }), _jsx(Tooltip, { formatter: (value) => [`$${value}`, "Sales"] }), _jsx(Bar, { dataKey: "value", fill: "#82ca9d", name: "Sales ($)" })] }) }) })] })] }));
}
