import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
const statusColors = {
    pending: "bg-blue-500",
    in_progress: "bg-yellow-500",
    review: "bg-purple-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
};
const priorityLabels = {
    low: { label: "Low", variant: "secondary" },
    medium: { label: "Medium", variant: "default" },
    high: { label: "High", variant: "destructive" },
    urgent: { label: "Urgent", variant: "destructive" },
};
export default function UpcomingDeadlines() {
    const navigate = useNavigate();
    const { dashboardMetrics, staff, jobs } = useAppContext();
    // Use the pre-calculated metrics from context instead of recalculating
    const upcomingDeadlines = dashboardMetrics.upcomingDeadlines || [];
    const getStaffName = (staffId) => {
        if (!staffId)
            return "Unassigned";
        const staffMember = staff.find((s) => s.id === staffId);
        return staffMember ? staffMember.name : "Unknown";
    };
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { children: "Upcoming Deadlines" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => navigate("/jobs"), children: "View All Jobs" })] }) }), _jsx(CardContent, { children: upcomingDeadlines.length === 0 ? (_jsx("div", { className: "text-center py-6 text-muted-foreground", children: "No upcoming deadlines in the next 7 days" })) : (_jsx("div", { className: "space-y-4", children: upcomingDeadlines.map((job) => {
                        const daysUntilDeadline = Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) /
                            (1000 * 60 * 60 * 24));
                        return (_jsxs("div", { className: "flex items-center justify-between border-b pb-4 last:border-0 last:pb-0", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "font-medium", children: ["Invoice: ", job.title] }), _jsx("div", { className: "text-sm text-muted-foreground", children: job.client }), _jsxs("div", { className: "flex items-center space-x-2 mt-1", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${statusColors[job.status]}` }), _jsx("span", { className: "text-xs capitalize", children: job.status.replace("_", " ") }), _jsx(Badge, { variant: priorityLabels[job.priority].variant, children: priorityLabels[job.priority].label })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-sm font-medium", children: ["Due: ", format(new Date(job.deadline), "MMM d, yyyy")] }), _jsx("div", { className: "text-xs text-muted-foreground", children: daysUntilDeadline === 0
                                                ? "Today"
                                                : daysUntilDeadline === 1
                                                    ? "Tomorrow"
                                                    : `${daysUntilDeadline} days` }), _jsx("div", { className: "text-xs mt-1", children: getStaffName(job.assignedTo) }), _jsx(Link, { to: `/jobs/${job.id}`, children: _jsxs(Button, { variant: "ghost", size: "sm", className: "mt-2", children: [_jsx(Eye, { className: "h-3 w-3 mr-1" }), "View"] }) })] })] }, job.id));
                    }) })) })] }));
}
