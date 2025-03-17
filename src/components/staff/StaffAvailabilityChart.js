import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from "recharts";
export default function StaffAvailabilityChart() {
    const { staff } = useAppContext();
    // Calculate availability by day of week
    const daysOfWeek = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ];
    const availabilityByDay = daysOfWeek.map((day) => {
        const availableStaff = staff.filter((member) => member.availability[day]);
        return {
            day: day.charAt(0).toUpperCase() + day.slice(1),
            count: availableStaff.length,
            percentage: Math.round((availableStaff.length / staff.length) * 100),
        };
    });
    // Calculate staff with specific availability patterns
    const fullTimeStaff = staff.filter((member) => member.availability.monday &&
        member.availability.tuesday &&
        member.availability.wednesday &&
        member.availability.thursday &&
        member.availability.friday).length;
    const weekendStaff = staff.filter((member) => member.availability.saturday || member.availability.sunday).length;
    const flexibleStaff = staff.filter((member) => Object.values(member.availability).filter(Boolean).length >= 3 &&
        (!member.availability.monday ||
            !member.availability.tuesday ||
            !member.availability.wednesday ||
            !member.availability.thursday ||
            !member.availability.friday)).length;
    return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Staff Availability" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "h-[250px] mb-6", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: availabilityByDay, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "day" }), _jsx(YAxis, { yAxisId: "left", orientation: "left" }), _jsx(YAxis, { yAxisId: "right", orientation: "right", domain: [0, 100] }), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Bar, { yAxisId: "left", dataKey: "count", name: "Available Staff", fill: "#8884d8" }), _jsx(Bar, { yAxisId: "right", dataKey: "percentage", name: "Percentage (%)", fill: "#82ca9d" })] }) }) }), _jsxs("div", { className: "flex flex-wrap gap-3 justify-center", children: [_jsxs(Badge, { variant: "outline", className: "bg-blue-100 text-blue-800 border-blue-200 text-sm py-1.5", children: ["Full-time (M-F): ", fullTimeStaff, " staff"] }), _jsxs(Badge, { variant: "outline", className: "bg-purple-100 text-purple-800 border-purple-200 text-sm py-1.5", children: ["Weekend Available: ", weekendStaff, " staff"] }), _jsxs(Badge, { variant: "outline", className: "bg-green-100 text-green-800 border-green-200 text-sm py-1.5", children: ["Flexible Schedule: ", flexibleStaff, " staff"] })] })] })] }));
}
