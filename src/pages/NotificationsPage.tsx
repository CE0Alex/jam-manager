import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  FileText,
  User,
} from "lucide-react";
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

  const getIcon = (type: string) => {
    switch (type) {
      case "status":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "deadline":
        return <Calendar className="h-5 w-5 text-amber-500" />;
      case "assignment":
        return <User className="h-5 w-5 text-purple-500" />;
      case "completion":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "new":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "system":
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <MainLayout title="Notifications">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge className="ml-2">
              {notifications.filter((n) => !n.read).length}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Mark All as Read
            </Button>
            <Button variant="outline" size="sm">
              Clear All
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start p-4 rounded-lg ${notification.read ? "bg-background" : "bg-muted"}`}
                >
                  <div className="mr-4 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {notification.time}
                        </span>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button variant="outline" className="justify-start">
                <Bell className="mr-2 h-4 w-4" />
                Manage Notification Preferences
              </Button>
              <Button variant="outline" className="justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Configure Deadline Reminders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
