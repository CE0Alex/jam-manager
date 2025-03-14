import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, isSameDay } from "date-fns";
import { Link } from "react-router-dom";
import { Calendar, Clock, AlertTriangle, CheckCircle, User, Filter } from "lucide-react";
import { StaffMember, Job } from "@/types";

interface WorkloadDashboardProps {
  initialView?: "list" | "calendar" | "metrics";
}

export default function WorkloadDashboard({
  initialView = "list",
}: WorkloadDashboardProps) {
  const { staff, jobs, schedule } = useAppContext();
  const [activeView, setActiveView] = useState<"list" | "calendar" | "metrics">(initialView);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("week");

  // Get staff workload data
  const getStaffWorkload = (staffMember: StaffMember) => {
    // Get assigned jobs
    const assignedJobs = jobs.filter(job => job.assignedTo === staffMember.id);
    
    // Get scheduled events for this staff member
    const staffEvents = schedule.filter(event => event.staffId === staffMember.id);
    
    // Calculate total hours scheduled
    let scheduledHours = 0;
    staffEvents.forEach(event => {
      const startTime = new Date(event.startTime);
      const endTime = new Date(event.endTime);
      
      // Filter by time range
      const today = new Date();
      const endDate = timeRange === "today" ? today : 
                     timeRange === "week" ? addDays(today, 7) : 
                     addDays(today, 30);
      
      if (startTime <= endDate) {
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        scheduledHours += durationHours;
      }
    });
    
    // Calculate capacity (simplified)
    // In a real app, you would use actual availability data
    const dailyCapacity = 8; // 8 hours per day
    const workDaysPerWeek = Object.values(staffMember.availability).filter(Boolean).length;
    const totalCapacity = timeRange === "today" ? dailyCapacity : 
                         timeRange === "week" ? (workDaysPerWeek * dailyCapacity) : 
                         (workDaysPerWeek * 4 * dailyCapacity); // Approx 4 weeks in a month
    
    // Calculate utilization percentage
    const utilization = totalCapacity > 0 ? (scheduledHours / totalCapacity) * 100 : 0;
    
    // Get upcoming deadlines
    const upcomingDeadlines = assignedJobs
      .filter(job => {
        const deadline = new Date(job.deadline);
        const today = new Date();
        const maxDate = timeRange === "today" ? today : 
                      timeRange === "week" ? addDays(today, 7) : 
                      addDays(today, 30);
        return deadline <= maxDate && job.status !== "completed" && job.status !== "cancelled";
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    
    return {
      assignedJobs,
      scheduledHours,
      totalCapacity,
      utilization: Math.min(utilization, 100), // Cap at 100%
      isOverCapacity: utilization > 100,
      upcomingDeadlines
    };
  };

  // Get utilization color based on percentage
  const getUtilizationColor = (percentage: number) => {
    if (percentage > 100) return "bg-red-500";
    if (percentage > 90) return "bg-amber-500";
    if (percentage > 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  // Render list view
  const renderListView = () => {
    const filteredStaff = selectedStaffId 
      ? staff.filter(s => s.id === selectedStaffId)
      : staff;

    return (
      <div className="space-y-6">
        {filteredStaff.map(staffMember => {
          const { 
            assignedJobs, 
            scheduledHours, 
            totalCapacity, 
            utilization, 
            isOverCapacity,
            upcomingDeadlines 
          } = getStaffWorkload(staffMember);
          
          return (
            <Card key={staffMember.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staffMember.id}`}
                        alt={staffMember.name}
                      />
                      <AvatarFallback>{getInitials(staffMember.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{staffMember.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{staffMember.role}</p>
                    </div>
                  </div>
                  <Link to={`/staff/${staffMember.id}`}>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Workload section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Workload</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Capacity Utilization</span>
                        <span className="font-medium">
                          {Math.round(utilization)}%
                        </span>
                      </div>
                      <Progress 
                        value={utilization} 
                        className={getUtilizationColor(utilization)}
                      />
                      <div className="text-xs text-muted-foreground">
                        {scheduledHours.toFixed(1)} / {totalCapacity.toFixed(1)} hours
                        {isOverCapacity && (
                          <Badge variant="destructive" className="ml-2">
                            Over Capacity
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>
                        Available: {Object.entries(staffMember.availability)
                          .filter(([_, isAvailable]) => isAvailable)
                          .map(([day]) => day.substring(0, 3))
                          .join(", ")}
                      </span>
                    </div>
                  </div>

                  {/* Assigned jobs section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Assigned Jobs</h3>
                    <div className="space-y-2">
                      {assignedJobs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No jobs assigned</p>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Total Jobs</span>
                            <span className="font-medium">{assignedJobs.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>In Progress</span>
                            <span className="font-medium">
                              {assignedJobs.filter(job => job.status === "in_progress").length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Pending</span>
                            <span className="font-medium">
                              {assignedJobs.filter(job => job.status === "pending").length}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upcoming deadlines section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Upcoming Deadlines</h3>
                    {upcomingDeadlines.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
                    ) : (
                      <div className="space-y-2">
                        {upcomingDeadlines.slice(0, 3).map(job => {
                          const deadline = new Date(job.deadline);
                          const isToday = isSameDay(deadline, new Date());
                          const isPast = deadline < new Date();
                          
                          return (
                            <div key={job.id} className="text-sm">
                              <div className="font-medium truncate">{job.title}</div>
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span className={`${isPast ? "text-red-500" : isToday ? "text-amber-500" : ""}`}>
                                  {format(deadline, "MMM d, yyyy")}
                                  {isPast && " (Overdue)"}
                                  {isToday && " (Today)"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {upcomingDeadlines.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{upcomingDeadlines.length - 3} more deadlines
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // Render calendar view
  const renderCalendarView = () => {
    // This would be a calendar showing staff assignments
    // For simplicity, we'll just show a placeholder
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 mx-auto text-muted-foreground" />
        <h3 className="text-lg font-medium mt-4">Staff Calendar View</h3>
        <p className="text-muted-foreground mt-2">
          A calendar view showing all staff assignments would be implemented here.
        </p>
      </div>
    );
  };

  // Render metrics view
  const renderMetricsView = () => {
    // Calculate overall metrics
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(job => job.status === "completed").length;
    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
    
    // Calculate staff metrics
    const staffMetrics = staff.map(staffMember => {
      const assignedJobs = jobs.filter(job => job.assignedTo === staffMember.id);
      const completedJobs = assignedJobs.filter(job => job.status === "completed");
      const completionRate = assignedJobs.length > 0 ? 
        (completedJobs.length / assignedJobs.length) * 100 : 0;
      
      // Calculate on-time rate
      const onTimeJobs = completedJobs.filter(job => {
        const completionDate = new Date(job.updatedAt);
        const deadline = new Date(job.deadline);
        return completionDate <= deadline;
      });
      const onTimeRate = completedJobs.length > 0 ? 
        (onTimeJobs.length / completedJobs.length) * 100 : 0;
      
      return {
        staffMember,
        assignedCount: assignedJobs.length,
        completedCount: completedJobs.length,
        completionRate,
        onTimeRate
      };
    });
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-