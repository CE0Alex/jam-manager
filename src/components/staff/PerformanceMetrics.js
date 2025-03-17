import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../../components/ui/select";
import { BarChart, LineChart } from "lucide-react";
const PerformanceMetrics = ({ staffMember }) => {
    const [timeRange, setTimeRange] = useState("month");
    // Default staff member data if none provided
    const defaultStaffMember = {
        id: "",
        name: "",
        role: "",
        email: "",
        phone: "",
        skills: [],
        availability: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false,
        },
        assignedJobs: [],
        performanceMetrics: {
            completionRate: 0,
            onTimeRate: 0,
            qualityScore: 0,
        },
    };
    const staff = staffMember || defaultStaffMember;
    // Mock performance data
    const mockCompletionRateData = [
        { month: "Jan", rate: 90 },
        { month: "Feb", rate: 85 },
        { month: "Mar", rate: 92 },
        { month: "Apr", rate: 88 },
        { month: "May", rate: 94 },
        { month: "Jun", rate: 91 },
    ];
    const mockOnTimeData = [
        { month: "Jan", rate: 82 },
        { month: "Feb", rate: 79 },
        { month: "Mar", rate: 85 },
        { month: "Apr", rate: 81 },
        { month: "May", rate: 88 },
        { month: "Jun", rate: 86 },
    ];
    const mockQualityData = [
        { month: "Jan", rate: 88 },
        { month: "Feb", rate: 90 },
        { month: "Mar", rate: 89 },
        { month: "Apr", rate: 91 },
        { month: "May", rate: 92 },
        { month: "Jun", rate: 93 },
    ];
    return (_jsxs("div", { className: "w-full h-full bg-white p-4 rounded-lg shadow", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Performance Metrics" }), _jsxs(Select, { value: timeRange, onValueChange: setTimeRange, children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Select time range" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "week", children: "Last Week" }), _jsx(SelectItem, { value: "month", children: "Last Month" }), _jsx(SelectItem, { value: "quarter", children: "Last Quarter" }), _jsx(SelectItem, { value: "year", children: "Last Year" })] })] })] }), _jsxs(Tabs, { defaultValue: "overview", className: "w-full", children: [_jsxs(TabsList, { className: "grid grid-cols-3 mb-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "trends", children: "Trends" }), _jsx(TabsTrigger, { value: "comparison", children: "Team Comparison" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Completion Rate" }), _jsx(CardDescription, { children: "Jobs completed successfully" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "text-3xl font-bold", children: [staff.performanceMetrics?.completionRate || 0, "%"] }), _jsx("div", { className: "ml-2 text-sm text-green-500", children: "+2%" })] }), _jsx("div", { className: "mt-4 h-20 flex items-end", children: mockCompletionRateData.map((item, index) => (_jsxs("div", { className: "flex-1 flex flex-col items-center", children: [_jsx("div", { className: "w-6 bg-blue-500 rounded-t", style: { height: `${item.rate * 0.2}px` } }), _jsx("div", { className: "text-xs mt-1", children: item.month })] }, index))) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "On-Time Delivery" }), _jsx(CardDescription, { children: "Jobs delivered by deadline" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "text-3xl font-bold", children: [staff.performanceMetrics?.onTimeRate || 0, "%"] }), _jsx("div", { className: "ml-2 text-sm text-green-500", children: "+3%" })] }), _jsx("div", { className: "mt-4 h-20 flex items-end", children: mockOnTimeData.map((item, index) => (_jsxs("div", { className: "flex-1 flex flex-col items-center", children: [_jsx("div", { className: "w-6 bg-green-500 rounded-t", style: { height: `${item.rate * 0.2}px` } }), _jsx("div", { className: "text-xs mt-1", children: item.month })] }, index))) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Quality Score" }), _jsx(CardDescription, { children: "Average client satisfaction" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "text-3xl font-bold", children: [staff.performanceMetrics?.qualityScore || 0, "%"] }), _jsx("div", { className: "ml-2 text-sm text-green-500", children: "+1%" })] }), _jsx("div", { className: "mt-4 h-20 flex items-end", children: mockQualityData.map((item, index) => (_jsxs("div", { className: "flex-1 flex flex-col items-center", children: [_jsx("div", { className: "w-6 bg-purple-500 rounded-t", style: { height: `${item.rate * 0.2}px` } }), _jsx("div", { className: "text-xs mt-1", children: item.month })] }, index))) })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Performance Summary" }), _jsx(CardDescription, { children: "Overall performance analysis" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Jobs Completed" }), _jsx("span", { className: "font-medium", children: "24 jobs" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Average Completion Time" }), _jsx("span", { className: "font-medium", children: "2.3 days" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Efficiency Rating" }), _jsx("span", { className: "font-medium", children: "91%" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Client Feedback Score" }), _jsx("span", { className: "font-medium", children: "4.7/5.0" })] })] }) })] })] }), _jsx(TabsContent, { value: "trends", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Performance Trends" }), _jsx(CardDescription, { children: "6-month performance analysis" })] }), _jsx(CardContent, { className: "h-80 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(LineChart, { className: "h-40 w-40 text-gray-400 mx-auto" }), _jsx("p", { className: "mt-4 text-sm text-gray-500", children: "Detailed trend charts would be implemented here with a charting library" })] }) })] }) }), _jsx(TabsContent, { value: "comparison", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Team Comparison" }), _jsx(CardDescription, { children: "Performance relative to team average" })] }), _jsx(CardContent, { className: "h-80 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(BarChart, { className: "h-40 w-40 text-gray-400 mx-auto" }), _jsx("p", { className: "mt-4 text-sm text-gray-500", children: "Comparative performance charts would be implemented here" })] }) })] }) })] })] }));
};
export default PerformanceMetrics;
