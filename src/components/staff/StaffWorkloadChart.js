import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from "recharts";
export default function StaffWorkloadChart({ staffMembers, limit = 5, }) {
    const { staff, jobs, schedule } = useAppContext();
    // Use provided staff members or all staff from context
    const members = staffMembers || staff;
    // Calculate workload for each staff member
    const workloadData = members.map((member) => {
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
            jobsCount: assignedJobs.length,
            scheduledHours: Math.round(totalHoursScheduled * 10) / 10,
            capacity: totalCapacity,
            utilization: Math.min(Math.round(utilization), 100), // Cap at 100%
        };
    });
    // Sort by utilization (highest first) and limit to specified number
    const sortedData = [...workloadData]
        .sort((a, b) => b.utilization - a.utilization)
        .slice(0, limit);
    // Get color based on utilization percentage
    const getUtilizationColor = (percentage) => {
        if (percentage > 90)
            return "bg-red-500";
        if (percentage > 75)
            return "bg-amber-500";
        if (percentage > 50)
            return "bg-yellow-500";
        return "bg-green-500";
    };
    return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Staff Workload Distribution" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "h-[300px] mb-6", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: sortedData, layout: "vertical", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false }), _jsx(XAxis, { type: "number", domain: [0, 100] }), _jsx(YAxis, { dataKey: "name", type: "category", width: 100 }), _jsx(Tooltip, { formatter: (value, name) => {
                                            if (name === "utilization")
                                                return [`${value}%`, "Utilization"];
                                            if (name === "scheduledHours")
                                                return [`${value} hrs`, "Scheduled"];
                                            if (name === "capacity")
                                                return [`${value} hrs`, "Capacity"];
                                            return [value, name];
                                        } }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "utilization", name: "Utilization (%)", fill: "#8884d8" }), _jsx(Bar, { dataKey: "scheduledHours", name: "Scheduled Hours", fill: "#82ca9d" })] }) }) }), _jsx("div", { className: "space-y-4", children: sortedData.map((item) => (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: item.name }), _jsxs("span", { className: "text-sm text-muted-foreground ml-2", children: [item.scheduledHours, " / ", item.capacity, " hrs"] })] }), _jsxs("span", { className: "text-sm font-medium", children: [item.utilization, "%"] })] }), _jsx(Progress, { value: item.utilization, className: getUtilizationColor(item.utilization) }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [item.jobsCount, " jobs assigned"] })] }, item.name))) })] })] }));
}
