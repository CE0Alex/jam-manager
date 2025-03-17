import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
// Import SimpleProductionCalendar directly - this is our safe fallback
import SimpleProductionCalendar from "./SimpleProductionCalendar";
// Import our fixed component
import ProductionCalendarFixed from "./ProductionCalendar.fixed.js";

// Initialize with fixed component which itself uses the fallback internally
let ProductionCalendarComponent = ProductionCalendarFixed;

// Attempt to load the full version if available
try {
  // Use dynamic import with a proper error boundary
  const loadProductionCalendar = async () => {
    try {
      const module = await import("./ProductionCalendar");
      if (module && module.default) {
        ProductionCalendarComponent = module.default;
        console.log("Successfully loaded ProductionCalendar dynamically");
      }
    } catch (e) {
      console.warn("Using ProductionCalendarFixed as fallback:", e.message);
    }
  };
  
  // Start the loading process
  loadProductionCalendar();
} catch (e) {
  console.warn("Failed to setup dynamic import, using ProductionCalendarFixed:", e.message);
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addDays, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
// Debug statement to confirm file is loaded
console.log("ScheduleView component loaded successfully");
const ScheduleView = ({ initialTab = "calendar", }) => {
    const location = useLocation();
    const { getJobById, jobs, schedule, staff } = useAppContext();
    // State to handle showing the production calendar dialog for a specific job
    const [selectedJobForSchedule, setSelectedJobForSchedule] = useState(null);
    // State to track if the real calendar loaded
    const [calendarLoaded, setCalendarLoaded] = useState(false);
    
    // Effect to check if the ProductionCalendar loaded
    useEffect(() => {
        // If the component was loaded successfully, update state
        if (ProductionCalendarComponent !== ProductionCalendarFixed) {
            setCalendarLoaded(true);
        }
        
        // Try again after a short delay
        const timer = setTimeout(() => {
            if (ProductionCalendarComponent !== ProductionCalendarFixed) {
                setCalendarLoaded(true);
                console.log("ProductionCalendar loaded on retry");
            } else {
                console.log("Still using fallback calendar component");
            }
        }, 1000);
        
        return () => clearTimeout(timer);
    }, []);
    
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
    
    // Add extra error boundary for safety
    const renderCalendarSafely = () => {
        try {
            console.log("Rendering calendar component, using:", 
                        ProductionCalendarComponent === ProductionCalendarFixed ? 
                        "ProductionCalendarFixed (fallback)" : "ProductionCalendar");
                        
            return _jsx(ProductionCalendarComponent, { 
                initialJob: selectedJobForSchedule, 
                onScheduled: () => setSelectedJobForSchedule(null) 
            });
        } catch (error) {
            console.error("Error rendering calendar component:", error);
            // Ultimate fallback is SimpleProductionCalendar
            return _jsx(SimpleProductionCalendar, {
                initialJob: selectedJobForSchedule,
                onScheduled: () => setSelectedJobForSchedule(null)
            });
        }
    }

    return (_jsxs("div", { className: "container mx-auto p-4 space-y-6 bg-background", children: [
        _jsxs("div", { className: "flex flex-col space-y-2", children: [
            _jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Production Schedule" }), 
            _jsx("p", { className: "text-muted-foreground", children: "Manage your production schedule" })
        ] }), 
        renderCalendarSafely(),
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
