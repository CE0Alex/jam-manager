import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
// Import SimpleProductionCalendar directly - this is our safe fallback
import SimpleProductionCalendar from "./SimpleProductionCalendar";
// Import our fixed component - use a variable to hold it
let ProductionCalendarFixed = null;

// Safely try to import the fixed component
try {
  // Use dynamic import for the fixed component too
  const loadFixedCalendar = async () => {
    try {
      const fixedModule = await import("./ProductionCalendar.fixed.js");
      if (fixedModule && fixedModule.default) {
        ProductionCalendarFixed = fixedModule.default;
        console.log("Successfully loaded ProductionCalendar.fixed.js");
      } else {
        throw new Error("Fixed module loaded but default export not found");
      }
    } catch (e) {
      console.warn("Failed to load ProductionCalendar.fixed.js:", e.message);
      // Fallback to SimpleProductionCalendar if fixed component fails to load
      ProductionCalendarFixed = SimpleProductionCalendar;
    }
  };
  
  // Start loading the fixed component
  loadFixedCalendar();
} catch (e) {
  console.warn("Failed to setup dynamic import for fixed component:", e.message);
  // Fallback to SimpleProductionCalendar
  ProductionCalendarFixed = SimpleProductionCalendar;
}

// Initialize with fixed component which itself uses the fallback internally
let ProductionCalendarComponent = null;

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
      // Use the fixed component as fallback
      ProductionCalendarComponent = ProductionCalendarFixed || SimpleProductionCalendar;
    }
  };
  
  // Start the loading process
  loadProductionCalendar();
} catch (e) {
  console.warn("Failed to setup dynamic import, using fallback:", e.message);
  // Use the fixed component as fallback
  ProductionCalendarComponent = ProductionCalendarFixed || SimpleProductionCalendar;
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
    // State to hold the actual component to render
    const [calendarComponent, setCalendarComponent] = useState(null);
    
    // Effect to initialize the calendar component
    useEffect(() => {
        // Set initial component
        if (!calendarComponent) {
            if (ProductionCalendarComponent) {
                setCalendarComponent(ProductionCalendarComponent);
                if (ProductionCalendarComponent !== ProductionCalendarFixed && 
                    ProductionCalendarComponent !== SimpleProductionCalendar) {
                    setCalendarLoaded(true);
                }
            } else {
                // Ultimate fallback
                setCalendarComponent(SimpleProductionCalendar);
            }
        }
        
        // Try again after a short delay to see if dynamic imports completed
        const timer = setTimeout(() => {
            if (ProductionCalendarComponent && 
                ProductionCalendarComponent !== ProductionCalendarFixed && 
                ProductionCalendarComponent !== SimpleProductionCalendar) {
                setCalendarComponent(ProductionCalendarComponent);
                setCalendarLoaded(true);
                console.log("ProductionCalendar loaded on retry");
            } else if (ProductionCalendarFixed && 
                       ProductionCalendarFixed !== SimpleProductionCalendar) {
                setCalendarComponent(ProductionCalendarFixed);
                console.log("Using ProductionCalendarFixed component");
            } else {
                setCalendarComponent(SimpleProductionCalendar);
                console.log("Using SimpleProductionCalendar as ultimate fallback");
            }
        }, 1000);
        
        return () => clearTimeout(timer);
    }, [calendarComponent]);
    
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
            // If no component is available yet, show loading
            if (!calendarComponent) {
                return _jsx("div", { className: "p-8 text-center", children: "Loading calendar..." });
            }
            
            console.log("Rendering calendar component:", 
                        calendarComponent === SimpleProductionCalendar ? "SimpleProductionCalendar (ultimate fallback)" :
                        calendarComponent === ProductionCalendarFixed ? "ProductionCalendarFixed (fallback)" : 
                        "ProductionCalendar");
                        
            const CalendarToRender = calendarComponent;
            return _jsx(CalendarToRender, { 
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
