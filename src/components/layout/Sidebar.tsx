import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  FileText,
  Calendar,
  Users,
  BarChart4,
  Menu,
  X,
  Settings,
  HelpCircle,
  Bell,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
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

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
      name: "Jobs",
      path: "/jobs",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Schedule",
      path: "/schedule",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Staff",
      path: "/staff",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart4 className="h-5 w-5" />,
    },
  ];

  const utilityItems = [
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      name: "Help",
      path: "/help",
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-card border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && <h1 className="text-xl font-bold">Print Shop</h1>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed ? "justify-center px-2" : "px-4",
                  )}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-2">{item.name}</span>}
                </Button>
              </Link>
            </li>
          ))}
        </ul>

        {/* Utility Navigation */}
        <div className="mt-8">
          {!collapsed && (
            <div className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              System
            </div>
          )}
          <ul className="space-y-1 px-2">
            {utilityItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      collapsed ? "justify-center px-2" : "px-4",
                    )}
                  >
                    {item.icon}
                    {!collapsed && <span className="ml-2">{item.name}</span>}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t">
        {!collapsed && (
          <div className="text-sm text-muted-foreground">
            Print Shop Manager v1.0
          </div>
        )}
      </div>
    </div>
  );
}
