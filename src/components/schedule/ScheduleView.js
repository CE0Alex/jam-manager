import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addDays, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Plus, CalendarPlus } from "lucide-react";
// Import the ProductionCalendar component from index
import { ProductionCalendar } from "./index";

const ScheduleView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { schedule, jobs, getJobById } = useAppContext();
    
    // State to handle showing the production calendar dialog for a specific job
    const [selectedJobForSchedule, setSelectedJobForSchedule] = useState(null);
    
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
    }, []).length;
    
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
        const state = location.state;
        if (state?.activeJob && state?.openScheduler) {
            const job = getJobById(state.activeJob);
            if (job) {
                // Set the job for scheduling
                setSelectedJobForSchedule(job);
                // Clear the location state after using it
                window.history.replaceState({}, document.title);
            }
        }
    }, [location, getJobById]);
    
    // Navigate to the job scheduling form
    const handleScheduleJobClick = () => {
        navigate('/jobs/schedule');
    };
    
    // Render the full-featured ProductionCalendar component
    const renderCalendar = () => {
        return _jsx(ProductionCalendar, {
            initialJob: selectedJobForSchedule,
            initialDate: new Date(),
            initialView: "week",
            onScheduled: () => setSelectedJobForSchedule(null)
        });
    };

    return (_jsxs("div", { className: "container mx-auto p-4 space-y-6 bg-background", children: [
        _jsxs("div", { className: "flex justify-between items-center", children: [
            _jsxs("div", { children: [
                _jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Production Schedule" }), 
                _jsx("p", { className: "text-muted-foreground", children: "Manage your production schedule" })
            ]}),
            _jsxs(Button, { 
                onClick: handleScheduleJobClick,
                className: "flex items-center gap-2",
                children: [
                    _jsx(CalendarPlus, { size: 16 }),
                    "Schedule Job"
                ]
            })
        ]}),
        renderCalendar(),
        _jsxs(Card, { className: "mt-6", children: [
            _jsx(CardHeader, { children: _jsx(CardTitle, { children: "Schedule Overview" }) }), 
            _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
                _jsxs("div", { className: "p-4 rounded-lg bg-primary/10 border", children: [
                    _jsx("h3", { className: "font-medium mb-2", children: "Upcoming Jobs" }), 
                    _jsx("p", { className: "text-2xl font-bold", children: upcomingJobs }), 
                    _jsx("p", { className: "text-sm text-muted-foreground", children: "Next 7 days" })
                ] }), 
                _jsxs("div", { className: "p-4 rounded-lg bg-primary/10 border", children: [
                    _jsx("h3", { className: "font-medium mb-2", children: "Staff Assigned" }), 
                    _jsx("p", { className: "text-2xl font-bold", children: staffAssigned }), 
                    _jsx("p", { className: "text-sm text-muted-foreground", children: "Across all scheduled jobs" })
                ] }), 
                _jsxs("div", { className: "p-4 rounded-lg bg-primary/10 border", children: [
                    _jsx("h3", { className: "font-medium mb-2", children: "Today's Jobs" }), 
                    _jsx("p", { className: "text-2xl font-bold", children: todaysJobs }), 
                    _jsx("p", { className: "text-sm text-muted-foreground", children: "Scheduled for today" })
                ] })
            ] }) })
        ] })
    ] }));
};

export default ScheduleView;
