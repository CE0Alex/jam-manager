import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Calendar, Clock, Users } from "lucide-react";
const CapacityManager = ({ dailyCapacity = 24, // Default 24 hours per day
weeklyCapacity = 120, // Default 120 hours per week
currentUtilization = 0, // Default 0% utilization
onCapacityChange = () => { }, }) => {
    const [activeTab, setActiveTab] = useState("daily");
    const [tempDailyCapacity, setTempDailyCapacity] = useState(dailyCapacity);
    const [tempWeeklyCapacity, setTempWeeklyCapacity] = useState(weeklyCapacity);
    const handleSaveChanges = () => {
        if (activeTab === "daily") {
            onCapacityChange("daily", tempDailyCapacity);
        }
        else {
            onCapacityChange("weekly", tempWeeklyCapacity);
        }
    };
    // Calculate utilization color based on percentage
    const getUtilizationColor = (percentage) => {
        if (percentage < 50)
            return "bg-green-500";
        if (percentage < 75)
            return "bg-yellow-500";
        return "bg-red-500";
    };
    return (_jsxs(Card, { className: "w-full bg-white shadow-sm", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-xl font-semibold", children: "Production Capacity Management" }), _jsx(CardDescription, { children: "Adjust and monitor your production capacity" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "flex items-center gap-1 text-sm text-muted-foreground", children: [_jsx(Clock, { size: 16 }), _jsx("span", { children: "Current Utilization:" })] }), _jsxs("div", { className: "w-32 h-4 relative", children: [_jsx(Progress, { value: currentUtilization, className: getUtilizationColor(currentUtilization) }), _jsxs("span", { className: "absolute right-0 top-0 text-xs font-medium", children: [currentUtilization, "%"] })] })] })] }) }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "daily", onValueChange: (value) => setActiveTab(value), children: [_jsxs(TabsList, { className: "grid w-full max-w-md grid-cols-2 mb-4", children: [_jsxs(TabsTrigger, { value: "daily", className: "flex items-center gap-1", children: [_jsx(Calendar, { size: 16 }), "Daily Capacity"] }), _jsxs(TabsTrigger, { value: "weekly", className: "flex items-center gap-1", children: [_jsx(Users, { size: 16 }), "Weekly Capacity"] })] }), _jsx(TabsContent, { value: "daily", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx(Label, { htmlFor: "daily-capacity", children: "Daily Production Hours" }), _jsxs("span", { className: "text-sm font-medium", children: [tempDailyCapacity, " hours"] })] }), _jsx(Slider, { id: "daily-capacity", min: 1, max: 48, step: 1, value: [tempDailyCapacity], onValueChange: (value) => setTempDailyCapacity(value[0]) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "daily-staff", children: "Staff Available" }), _jsx(Input, { id: "daily-staff", type: "number", min: 1, max: 20, defaultValue: 5 })] })] }), _jsxs("div", { className: "bg-slate-50 p-4 rounded-lg", children: [_jsxs("h4", { className: "font-medium mb-2 flex items-center gap-1", children: [_jsx(AlertCircle, { size: 16, className: "text-amber-500" }), "Daily Capacity Insights"] }), _jsxs("ul", { className: "space-y-2 text-sm", children: [_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { children: "Maximum Jobs Per Day:" }), _jsx("span", { className: "font-medium", children: Math.floor(tempDailyCapacity / 2) })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { children: "Recommended Job Size:" }), _jsx("span", { className: "font-medium", children: "2-4 hours" })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { children: "Current Day Utilization:" }), _jsxs("span", { className: "font-medium", children: [currentUtilization, "%"] })] })] })] })] }) }), _jsx(TabsContent, { value: "weekly", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx(Label, { htmlFor: "weekly-capacity", children: "Weekly Production Hours" }), _jsxs("span", { className: "text-sm font-medium", children: [tempWeeklyCapacity, " hours"] })] }), _jsx(Slider, { id: "weekly-capacity", min: 40, max: 240, step: 5, value: [tempWeeklyCapacity], onValueChange: (value) => setTempWeeklyCapacity(value[0]) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "weekly-staff", children: "Weekly Staff Rotation" }), _jsx(Input, { id: "weekly-staff", type: "number", min: 3, max: 30, defaultValue: 12 })] })] }), _jsxs("div", { className: "bg-slate-50 p-4 rounded-lg", children: [_jsxs("h4", { className: "font-medium mb-2 flex items-center gap-1", children: [_jsx(AlertCircle, { size: 16, className: "text-amber-500" }), "Weekly Capacity Insights"] }), _jsxs("ul", { className: "space-y-2 text-sm", children: [_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { children: "Maximum Jobs Per Week:" }), _jsx("span", { className: "font-medium", children: Math.floor(tempWeeklyCapacity / 4) })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { children: "Optimal Daily Distribution:" }), _jsxs("span", { className: "font-medium", children: [Math.round(tempWeeklyCapacity / 5), " hours/day"] })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { children: "Current Week Utilization:" }), _jsxs("span", { className: "font-medium", children: [currentUtilization, "%"] })] })] })] })] }) }), _jsx("div", { className: "flex justify-end mt-6", children: _jsx(Button, { onClick: handleSaveChanges, children: "Save Capacity Changes" }) })] }) })] }));
};
export default CapacityManager;
