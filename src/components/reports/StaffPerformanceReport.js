import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, } from "recharts";
export default function StaffPerformanceReport({ startDate, endDate, }) {
    const { staff, jobs, schedule } = useAppContext();
    // Filter to only production staff
    const productionStaff = staff.filter((member) => member.role.toLowerCase().includes("production") ||
        member.skills.some((skill) => skill.toLowerCase().includes("print") ||
            skill.toLowerCase().includes("production")));
    // Empty staff productivity data
    const staffProductivity = productionStaff.map((member) => {
        return {
            name: member.name,
            jobsCompleted: 0,
            jobsAssigned: 0,
            completionRate: 0,
        };
    });
    // Empty staff efficiency data
    const staffEfficiency = productionStaff.map((member) => {
        return {
            name: member.name,
            efficiency: 0,
        };
    });
    // Empty staff quality scores
    const staffQualityScores = productionStaff.map((member) => ({
        name: member.name,
        qualityScore: 0,
    }));
    // Empty staff skills data
    const staffSkillsData = [];
    // Empty on-time delivery data
    const onTimeDeliveryByStaff = productionStaff.map((member) => {
        return {
            name: member.name,
            onTimeRate: 0,
        };
    });
    // Empty top performer
    const topPerformer = staffProductivity[0] || null;
    // Empty average metrics
    const avgCompletionRate = 0;
    const avgQualityScore = 0;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Average Completion Rate" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold", children: [avgCompletionRate, "%"] }), _jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Across production staff" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Top Performer" }) }), _jsx(CardContent, { children: topPerformer ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Avatar, { className: "h-8 w-8", children: [_jsx(AvatarImage, { src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${productionStaff.find((s) => s.name === topPerformer.name)?.id || "staff"}` }), _jsx(AvatarFallback, { children: topPerformer.name
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("") })] }), _jsx("div", { className: "text-xl font-bold", children: topPerformer.name })] }), _jsxs("p", { className: "text-muted-foreground text-sm mt-1", children: [topPerformer.completionRate, "% completion rate"] })] })) : (_jsx("div", { className: "text-xl font-bold", children: "No data available" })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Average Quality Score" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold", children: [avgQualityScore, "%"] }), _jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Client satisfaction" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Staff Productivity" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: staffProductivity, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, { yAxisId: "left", orientation: "left", stroke: "#8884d8" }), _jsx(YAxis, { yAxisId: "right", orientation: "right", stroke: "#82ca9d", domain: [0, 100] }), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Bar, { yAxisId: "left", dataKey: "jobsCompleted", fill: "#8884d8", name: "Jobs Completed" }), _jsx(Bar, { yAxisId: "right", dataKey: "completionRate", fill: "#82ca9d", name: "Completion Rate (%)" })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "On-Time Delivery by Staff" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: onTimeDeliveryByStaff, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, { domain: [0, 100] }), _jsx(Tooltip, { formatter: (value) => [`${value}%`, "On-Time Rate"] }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "onTimeRate", fill: "#82ca9d", name: "On-Time Delivery Rate (%)" })] }) }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Staff Efficiency" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: staffEfficiency, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, { domain: [0, 150] }), _jsx(Tooltip, { formatter: (value) => [`${value}%`, "Efficiency"] }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "efficiency", fill: "#8884d8", name: "Efficiency (%)" })] }) }) })] }), staffSkillsData.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Staff Skills Assessment" }) }), _jsx(CardContent, { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(RadarChart, { outerRadius: 90, data: staffSkillsData, children: [_jsx(PolarGrid, {}), _jsx(PolarAngleAxis, { dataKey: "subject" }), _jsx(PolarRadiusAxis, { domain: [0, 100] }), productionStaff.map((member, index) => {
                                                const colors = [
                                                    "#8884d8",
                                                    "#82ca9d",
                                                    "#ffc658",
                                                    "#ff8042",
                                                    "#a4de6c",
                                                ];
                                                return (_jsx(Radar, { name: member.name, dataKey: member.name, stroke: colors[index % colors.length], fill: colors[index % colors.length], fillOpacity: 0.2 }, member.id));
                                            }), _jsx(Legend, {}), _jsx(Tooltip, {})] }) }) })] }))] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Production Staff Performance" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [productionStaff.map((member) => {
                                    // Get schedule data for this staff member
                                    const staffEvents = schedule.filter((event) => event.staffId === member.id);
                                    const totalScheduledHours = staffEvents.reduce((total, event) => {
                                        const startTime = new Date(event.startTime);
                                        const endTime = new Date(event.endTime);
                                        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                                        return total + durationHours;
                                    }, 0);
                                    // Get assigned jobs
                                    const assignedJobs = jobs.filter((job) => job.assignedTo === member.id);
                                    return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Avatar, { className: "h-8 w-8", children: [_jsx(AvatarImage, { src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}` }), _jsx(AvatarFallback, { children: member.name
                                                                            .split(" ")
                                                                            .map((n) => n[0])
                                                                            .join("") })] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: member.name }), _jsx("div", { className: "text-sm text-muted-foreground", children: member.role })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Badge, { variant: "outline", children: [assignedJobs.length, " jobs"] }), _jsxs(Badge, { variant: "outline", children: [totalScheduledHours.toFixed(1), " hours"] })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Completion Rate" }), _jsxs("span", { children: [member.performanceMetrics?.completionRate || 0, "%"] })] }), _jsx(Progress, { value: member.performanceMetrics?.completionRate || 0, className: "h-2" })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "On-Time Delivery" }), _jsxs("span", { children: [member.performanceMetrics?.onTimeRate || 0, "%"] })] }), _jsx(Progress, { value: member.performanceMetrics?.onTimeRate || 0, className: "h-2" })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Quality Score" }), _jsxs("span", { children: [member.performanceMetrics?.qualityScore || 0, "%"] })] }), _jsx(Progress, { value: member.performanceMetrics?.qualityScore || 0, className: "h-2" })] }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["Available:", " ", Object.entries(member.availability)
                                                        .filter(([_, isAvailable]) => isAvailable)
                                                        .map(([day]) => day.substring(0, 3))
                                                        .join(", ")] })] }, member.id));
                                }), productionStaff.length === 0 && (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No production staff members found" }))] }) })] })] }));
}
