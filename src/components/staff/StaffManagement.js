import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StaffWorkloadChart from "./StaffWorkloadChart";
import StaffAvailabilityChart from "./StaffAvailabilityChart";
import StaffAvatar from "./StaffAvatar";
export default function StaffManagement() {
    const navigate = useNavigate();
    const { staff } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    // Filter staff based on search term and active tab
    const filteredStaff = staff.filter((member) => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === "all" ||
            (activeTab === "production" &&
                member.role.toLowerCase().includes("production")) ||
            (activeTab === "sales" && member.role.toLowerCase().includes("sales")) ||
            (activeTab === "design" && member.role.toLowerCase().includes("design"));
        return matchesSearch && matchesTab;
    });
    // Calculate department statistics
    const departments = {
        production: staff.filter((s) => s.role.toLowerCase().includes("production"))
            .length,
        sales: staff.filter((s) => s.role.toLowerCase().includes("sales")).length,
        design: staff.filter((s) => s.role.toLowerCase().includes("design")).length,
        other: staff.filter((s) => !s.role.toLowerCase().includes("production") &&
            !s.role.toLowerCase().includes("sales") &&
            !s.role.toLowerCase().includes("design")).length,
    };
    // Calculate average performance metrics
    const calculateAverageMetrics = () => {
        const staffWithMetrics = staff.filter((s) => s.performanceMetrics);
        if (staffWithMetrics.length === 0)
            return { completion: 0, onTime: 0, quality: 0 };
        const totals = staffWithMetrics.reduce((acc, s) => {
            if (!s.performanceMetrics)
                return acc;
            return {
                completion: acc.completion + (s.performanceMetrics.completionRate || 0),
                onTime: acc.onTime + (s.performanceMetrics.onTimeRate || 0),
                quality: acc.quality + (s.performanceMetrics.qualityScore || 0),
            };
        }, { completion: 0, onTime: 0, quality: 0 });
        return {
            completion: Math.round(totals.completion / staffWithMetrics.length),
            onTime: Math.round(totals.onTime / staffWithMetrics.length),
            quality: Math.round(totals.quality / staffWithMetrics.length),
        };
    };
    const averageMetrics = calculateAverageMetrics();
    return (_jsxs("div", { className: "p-6 bg-gray-50 min-h-screen", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Staff Management" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Manage your team, track performance, and assign workloads" })] }), _jsxs(Button, { onClick: () => navigate("/staff/new"), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Staff Member"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Total Staff" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold", children: staff.length }), _jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Across all departments" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Departments" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs(Badge, { variant: "outline", className: "bg-blue-100 text-blue-800 border-blue-200", children: ["Production: ", departments.production] }), _jsxs(Badge, { variant: "outline", className: "bg-green-100 text-green-800 border-green-200", children: ["Sales: ", departments.sales] }), _jsxs(Badge, { variant: "outline", className: "bg-purple-100 text-purple-800 border-purple-200", children: ["Design: ", departments.design] }), departments.other > 0 && (_jsxs(Badge, { variant: "outline", className: "bg-gray-100 text-gray-800 border-gray-200", children: ["Other: ", departments.other] }))] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Avg. Performance" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Completion Rate" }), _jsxs("span", { children: [averageMetrics.completion, "%"] })] }), _jsx(Progress, { value: averageMetrics.completion, className: "h-1" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "On-Time Rate" }), _jsxs("span", { children: [averageMetrics.onTime, "%"] })] }), _jsx(Progress, { value: averageMetrics.onTime, className: "h-1" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Quality Score" }), _jsxs("span", { children: [averageMetrics.quality, "%"] })] }), _jsx(Progress, { value: averageMetrics.quality, className: "h-1" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Availability" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold", children: staff.filter((s) => Object.values(s.availability).filter(Boolean).length >= 5).length }), _jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Staff available 5+ days/week" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6", children: [_jsx(StaffWorkloadChart, { limit: 5 }), _jsx(StaffAvailabilityChart, {})] }), _jsxs(Card, { className: "mb-6", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4", children: [_jsx(CardTitle, { children: "Staff Directory" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { type: "search", placeholder: "Search staff...", className: "pl-8 w-[200px] sm:w-[300px]", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] }), _jsx(Tabs, { value: activeTab, onValueChange: (v) => setActiveTab(v), children: _jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "all", children: "All" }), _jsx(TabsTrigger, { value: "production", children: "Production" }), _jsx(TabsTrigger, { value: "sales", children: "Sales" }), _jsx(TabsTrigger, { value: "design", children: "Design" })] }) })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredStaff.length > 0 ? (filteredStaff.map((member) => (_jsx(Card, { className: "overflow-hidden hover:shadow-md transition-shadow cursor-pointer", onClick: () => navigate(`/staff/${member.id}`), children: _jsxs(CardContent, { className: "p-0", children: [_jsxs("div", { className: "flex items-start p-4", children: [_jsx(StaffAvatar, { staffId: member.id, size: "lg" }), _jsxs("div", { className: "ml-4", children: [_jsx("h3", { className: "font-medium", children: member.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: member.role }), _jsxs("div", { className: "flex items-center mt-2 text-xs text-muted-foreground", children: [_jsx(Users, { className: "h-3 w-3 mr-1" }), _jsxs("span", { children: [member.assignedJobs.length, " jobs assigned"] })] }), _jsxs("div", { className: "flex items-center mt-1 text-xs text-muted-foreground", children: [_jsx(Calendar, { className: "h-3 w-3 mr-1" }), _jsxs("span", { children: ["Available:", " ", Object.entries(member.availability)
                                                                            .filter(([_, isAvailable]) => isAvailable)
                                                                            .map(([day]) => day.substring(0, 3))
                                                                            .join(", ")] })] })] })] }), member.performanceMetrics && (_jsx("div", { className: "px-4 pb-4", children: _jsxs("div", { className: "mt-2 space-y-1", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: "Completion Rate" }), _jsxs("span", { children: [member.performanceMetrics.completionRate, "%"] })] }), _jsx(Progress, { value: member.performanceMetrics.completionRate, className: "h-1" })] }) }))] }) }, member.id)))) : (_jsx("div", { className: "col-span-full text-center py-8 text-muted-foreground", children: "No staff members found matching your search criteria." })) }) })] })] }));
}
