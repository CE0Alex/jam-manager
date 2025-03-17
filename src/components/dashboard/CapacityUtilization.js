import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, } from "recharts";
import { useAppContext } from "@/context/AppContext";
const defaultData = {
    daily: [
        { name: "Mon", capacity: 100, utilized: 0 },
        { name: "Tue", capacity: 100, utilized: 0 },
        { name: "Wed", capacity: 100, utilized: 0 },
        { name: "Thu", capacity: 100, utilized: 0 },
        { name: "Fri", capacity: 100, utilized: 0 },
        { name: "Sat", capacity: 50, utilized: 0 },
        { name: "Sun", capacity: 0, utilized: 0 },
    ],
    weekly: [
        { name: "Week 1", capacity: 100, utilized: 0 },
        { name: "Week 2", capacity: 100, utilized: 0 },
        { name: "Week 3", capacity: 100, utilized: 0 },
        { name: "Week 4", capacity: 100, utilized: 0 },
    ],
    monthly: [
        { name: "Jan", capacity: 100, utilized: 0 },
        { name: "Feb", capacity: 100, utilized: 0 },
        { name: "Mar", capacity: 100, utilized: 0 },
        { name: "Apr", capacity: 100, utilized: 0 },
        { name: "May", capacity: 100, utilized: 0 },
        { name: "Jun", capacity: 100, utilized: 0 },
    ],
};
const CapacityUtilization = ({ data = defaultData, currentUtilization, }) => {
    const { dashboardMetrics } = useAppContext();
    const [period, setPeriod] = useState("daily");
    const [department, setDepartment] = useState("all");
    // Calculate utilization percentage for display
    const utilizationPercentage = currentUtilization !== undefined
        ? currentUtilization
        : dashboardMetrics.capacityUtilization;
    const utilizationColor = utilizationPercentage > 90
        ? "text-red-500"
        : utilizationPercentage > 75
            ? "text-amber-500"
            : "text-green-500";
    return (_jsxs(Card, { className: "w-full h-full bg-white shadow-sm", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { className: "text-lg font-medium", children: "Capacity Utilization" }), _jsx("div", { className: "flex space-x-2", children: _jsxs(Select, { value: department, onValueChange: setDepartment, children: [_jsx(SelectTrigger, { className: "w-[140px] h-8", children: _jsx(SelectValue, { placeholder: "Department" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Departments" }), _jsx(SelectItem, { value: "printing", children: "Printing" }), _jsx(SelectItem, { value: "design", children: "Design" }), _jsx(SelectItem, { value: "finishing", children: "Finishing" })] })] }) })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Current Utilization" }), _jsxs("div", { className: "flex items-baseline", children: [_jsxs("span", { className: `text-2xl font-bold ${utilizationColor}`, children: [utilizationPercentage, "%"] }), _jsx("span", { className: "ml-2 text-xs text-muted-foreground", children: utilizationPercentage > 75 ? "High Load" : "Normal" })] })] }), _jsx(Tabs, { value: period, onValueChange: (value) => setPeriod(value), children: _jsxs(TabsList, { className: "grid grid-cols-3 w-[240px]", children: [_jsx(TabsTrigger, { value: "daily", children: "Daily" }), _jsx(TabsTrigger, { value: "weekly", children: "Weekly" }), _jsx(TabsTrigger, { value: "monthly", children: "Monthly" })] }) })] }), _jsx("div", { className: "h-[250px] w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: data[period], margin: { top: 10, right: 10, left: 0, bottom: 0 }, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "colorCapacity", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#8884d8", stopOpacity: 0.1 }), _jsx("stop", { offset: "95%", stopColor: "#8884d8", stopOpacity: 0 })] }), _jsxs("linearGradient", { id: "colorUtilized", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#82ca9d", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#82ca9d", stopOpacity: 0 })] })] }), _jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, { domain: [0, 100] }), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Area, { type: "monotone", dataKey: "capacity", stroke: "#8884d8", fillOpacity: 1, fill: "url(#colorCapacity)", strokeWidth: 2 }), _jsx(Area, { type: "monotone", dataKey: "utilized", stroke: "#82ca9d", fillOpacity: 1, fill: "url(#colorUtilized)", strokeWidth: 2 })] }) }) })] })] }));
};
export default CapacityUtilization;
