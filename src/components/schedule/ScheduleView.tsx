import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import EnhancedCalendar from "./EnhancedCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { addDays, format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";

// Debug statement to confirm file is loaded
console.log("ScheduleView component loaded successfully");

interface ScheduleViewProps {
  initialTab?: "calendar";
}

const ScheduleView = ({
  initialTab = "calendar",
}: ScheduleViewProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getJobById, jobs, schedule, staff } = useAppContext();
  
  // State to handle showing the production calendar dialog for a specific job
  const [selectedJobForSchedule, setSelectedJobForSchedule] = useState<any>(null);
  
  // Calculate upcoming jobs (next 7 days)
  const upcomingJobs = jobs.filter(job => {
    const deadline = new Date(job.deadline);
    const today = new Date();
    const sevenDaysFromNow = addDays(today, 7);
    
    return deadline >= today && deadline <= sevenDaysFromNow;
  }).length;
  
  // Calculate staff assigned to jobs
  const staffAssigned = schedule.reduce((uniqueStaff, event) => {
    if (event.staffId && !uniqueStaff.includes(event.staffId)) {
      uniqueStaff.push(event.staffId);
    }
    return uniqueStaff;
  }, [] as string[]).length;
  
  // Calculate today's jobs
  const todaysJobs = schedule.filter(event => {
    const eventDate = parseISO(event.startTime);
    const today = new Date();
    
    return isWithinInterval(eventDate, {
      start: startOfDay(today),
      end: endOfDay(today)
    });
  }).length;
  
  // Check for state params from navigation - for schedule job button in job detail
  useEffect(() => {
    const state = location.state as { activeJob?: string; openScheduler?: boolean } | null;
    
    if (state?.activeJob && state?.openScheduler) {
      const job = getJobById(state.activeJob);
      if (job) {
        // Instead of showing a popup, navigate to the Schedule Job page
        navigate("/schedule/job", { state: { preselectedJobId: state.activeJob } });
        
        // Clear the location state after using it
        window.history.replaceState({}, document.title);
      }
    }
  }, [location, getJobById, navigate]);

  return (
    <div className="container mx-auto p-4 space-y-6 bg-background">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Production Schedule
        </h1>
        <p className="text-muted-foreground">
          Manage your production schedule
        </p>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={() => navigate('/schedule/job')}>
          Schedule Job
        </Button>
      </div>

      <EnhancedCalendar />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Schedule Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border">
              <h3 className="font-medium mb-2">Upcoming Jobs</h3>
              <p className="text-2xl font-bold">{upcomingJobs}</p>
              <p className="text-sm text-muted-foreground">Next 7 days</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border">
              <h3 className="font-medium mb-2">Staff Assigned</h3>
              <p className="text-2xl font-bold">{staffAssigned}</p>
              <p className="text-sm text-muted-foreground">
                Across all scheduled jobs
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border">
              <h3 className="font-medium mb-2">Today's Jobs</h3>
              <p className="text-2xl font-bold">{todaysJobs}</p>
              <p className="text-sm text-muted-foreground">
                Scheduled for today
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleView;
