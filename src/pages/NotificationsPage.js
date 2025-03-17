import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertTriangle, Info, Calendar, FileText, User, } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
export default function NotificationsPage() {
    const notifications = [
        {
            id: 1,
            title: "Job Status Update",
            message: "Business Cards for Acme Corp has been moved to In Progress",
            time: "10 minutes ago",
            type: "status",
            read: false,
        },
        {
            id: 2,
            title: "Upcoming Deadline",
            message: "Banner Printing for XYZ Event is due tomorrow",
            time: "1 hour ago",
            type: "deadline",
            read: false,
        },
        {
            id: 3,
            title: "Staff Assignment",
            message: "Sarah Johnson has been assigned to Brochure Design for TechCo",
            time: "3 hours ago",
            type: "assignment",
            read: true,
        },
        {
            id: 4,
            title: "Job Completed",
            message: "Flyers for Community Event has been marked as completed",
            time: "Yesterday",
            type: "completion",
            read: true,
        },
        {
            id: 5,
            title: "New Job Created",
            message: "A new job 'Poster Design for Summer Festival' has been created",
            time: "Yesterday",
            type: "new",
            read: true,
        },
        {
            id: 6,
            title: "System Update",
            message: "Print Shop Manager has been updated to version 1.2.0",
            time: "2 days ago",
            type: "system",
            read: true,
        },
    ];
    const getIcon = (type) => {
        switch (type) {
            case "status":
                return _jsx(FileText, { className: "h-5 w-5 text-blue-500" });
            case "deadline":
                return _jsx(Calendar, { className: "h-5 w-5 text-amber-500" });
            case "assignment":
                return _jsx(User, { className: "h-5 w-5 text-purple-500" });
            case "completion":
                return _jsx(CheckCircle, { className: "h-5 w-5 text-green-500" });
            case "new":
                return _jsx(Info, { className: "h-5 w-5 text-blue-500" });
            case "system":
                return _jsx(AlertTriangle, { className: "h-5 w-5 text-gray-500" });
            default:
                return _jsx(Bell, { className: "h-5 w-5 text-gray-500" });
        }
    };
    return (_jsx(MainLayout, { title: "Notifications", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsx(Badge, { className: "ml-2", children: notifications.filter((n) => !n.read).length }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", children: "Mark All as Read" }), _jsx(Button, { variant: "outline", size: "sm", children: "Clear All" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Notifications" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-1", children: notifications.map((notification) => (_jsxs("div", { className: `flex items-start p-4 rounded-lg ${notification.read ? "bg-background" : "bg-muted"}`, children: [_jsx("div", { className: "mr-4 mt-0.5", children: getIcon(notification.type) }), _jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: notification.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: notification.message })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-muted-foreground", children: notification.time }), !notification.read && (_jsx("div", { className: "h-2 w-2 rounded-full bg-primary" }))] })] }) })] }, notification.id))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Notification Settings" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Button, { variant: "outline", className: "justify-start", children: [_jsx(Bell, { className: "mr-2 h-4 w-4" }), "Manage Notification Preferences"] }), _jsxs(Button, { variant: "outline", className: "justify-start", children: [_jsx(Calendar, { className: "mr-2 h-4 w-4" }), "Configure Deadline Reminders"] })] }) })] })] }) }));
}
