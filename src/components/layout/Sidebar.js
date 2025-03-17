import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutGrid, FileText, Calendar, Users, BarChart4, Menu, X, Settings, HelpCircle, Bell, } from "lucide-react";
export default function Sidebar({ className = "" }) {
    // Default to collapsed on mobile, expanded on desktop
    const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
    // Update collapsed state on window resize
    useEffect(() => {
        const handleResize = () => {
            setCollapsed(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const location = useLocation();
    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };
    const navItems = [
        {
            name: "Dashboard",
            path: "/",
            icon: _jsx(LayoutGrid, { className: "h-5 w-5" }),
        },
        {
            name: "Jobs",
            path: "/jobs",
            icon: _jsx(FileText, { className: "h-5 w-5" }),
        },
        {
            name: "Schedule",
            path: "/schedule",
            icon: _jsx(Calendar, { className: "h-5 w-5" }),
        },
        {
            name: "Staff",
            path: "/staff",
            icon: _jsx(Users, { className: "h-5 w-5" }),
        },
        {
            name: "Reports",
            path: "/reports",
            icon: _jsx(BarChart4, { className: "h-5 w-5" }),
        },
    ];
    const utilityItems = [
        {
            name: "Settings",
            path: "/settings",
            icon: _jsx(Settings, { className: "h-5 w-5" }),
        },
        {
            name: "Notifications",
            path: "/notifications",
            icon: _jsx(Bell, { className: "h-5 w-5" }),
        },
        {
            name: "Help",
            path: "/help",
            icon: _jsx(HelpCircle, { className: "h-5 w-5" }),
        },
    ];
    return (_jsxs("div", { className: cn("flex flex-col h-screen bg-card border-r transition-all duration-300", collapsed ? "w-16" : "w-64", className), children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b", children: [!collapsed && _jsx("h1", { className: "text-xl font-bold", children: "Print Shop" }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => setCollapsed(!collapsed), className: "ml-auto", children: collapsed ? _jsx(Menu, { className: "h-5 w-5" }) : _jsx(X, { className: "h-5 w-5" }) })] }), _jsxs("nav", { className: "flex-1 py-4", children: [_jsx("ul", { className: "space-y-1 px-2", children: navItems.map((item) => (_jsx("li", { children: _jsx(Link, { to: item.path, children: _jsxs(Button, { variant: isActive(item.path) ? "secondary" : "ghost", className: cn("w-full justify-start", collapsed ? "justify-center px-2" : "px-4"), children: [item.icon, !collapsed && _jsx("span", { className: "ml-2", children: item.name })] }) }) }, item.path))) }), _jsxs("div", { className: "mt-8", children: [!collapsed && (_jsx("div", { className: "px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "System" })), _jsx("ul", { className: "space-y-1 px-2", children: utilityItems.map((item) => (_jsx("li", { children: _jsx(Link, { to: item.path, children: _jsxs(Button, { variant: isActive(item.path) ? "secondary" : "ghost", className: cn("w-full justify-start", collapsed ? "justify-center px-2" : "px-4"), children: [item.icon, !collapsed && _jsx("span", { className: "ml-2", children: item.name })] }) }) }, item.path))) })] })] }), _jsx("div", { className: "p-4 border-t", children: !collapsed && (_jsx("div", { className: "text-sm text-muted-foreground", children: "Print Shop Manager v1.0" })) })] }));
}
