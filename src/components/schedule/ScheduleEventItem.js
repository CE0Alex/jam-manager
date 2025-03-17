import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import StaffAvatar from "../staff/StaffAvatar";
export default function ScheduleEventItem({ event, jobTitle, jobStatus, staffName, compact = false, }) {
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    const statusColors = {
        pending: "bg-blue-100 border-blue-300 text-blue-800",
        in_progress: "bg-yellow-100 border-yellow-300 text-yellow-800",
        review: "bg-purple-100 border-purple-300 text-purple-800",
        completed: "bg-green-100 border-green-300 text-green-800",
        cancelled: "bg-red-100 border-red-300 text-red-800",
    };
    return (_jsx(Link, { to: `/schedule/${event.id}`, children: _jsxs("div", { className: `border rounded-md p-2 hover:shadow-md transition-shadow ${statusColors[jobStatus]}`, children: [_jsxs("div", { className: "font-medium truncate", children: ["Invoice: ", jobTitle] }), !compact && event.notes && (_jsx("div", { className: "text-sm truncate mt-1", children: event.notes })), _jsxs("div", { className: "flex items-center text-xs mt-1 space-x-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Clock, { className: "h-3 w-3 mr-1" }), _jsxs("span", { children: [format(startTime, "h:mm a"), " - ", format(endTime, "h:mm a")] })] }), !compact && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(StaffAvatar, { staffId: event.staffId, size: "sm", showTooltip: false }), _jsx("span", { children: staffName })] }))] })] }) }));
}
