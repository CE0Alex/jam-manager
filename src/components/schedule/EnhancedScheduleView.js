import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Sliders, Plus, Layers } from "lucide-react";
import EnhancedCalendar from "./EnhancedCalendar";
import ResourceCapacityPlanner from "./ResourceCapacityPlanner";
import MachineCapacityView from "./MachineCapacityView";
import AutoScheduleDialog from "./AutoScheduleDialog";
import BulkScheduleActions from "./BulkScheduleActions";
export default function EnhancedScheduleView() {
    const navigate = useNavigate();
    const { schedule, jobs, autoScheduleJob } = useAppContext();
    const [activeTab, setActiveTab] = useState("calendar");
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [selectedMachineId, setSelectedMachineId] = useState(null);
    const handleEventSelect = (eventId, isMultiSelect) => {
        if (isMultiSelect) {
            // Toggle selection
            setSelectedEvents((prev) => prev.includes(eventId)
                ? prev.filter((id) => id !== eventId)
                : [...prev, eventId]);
        }
        else {
            // Single selection
            setSelectedEvents([eventId]);
        }
    };
    const handleClearSelection = () => {
        setSelectedEvents([]);
    };
    const handleMachineSelect = (machineId) => {
        setSelectedMachineId(machineId);
        setActiveTab("calendar");
    };
    const handleScheduleRefresh = () => {
        // This would typically refresh data from an API
        // For now, we'll just clear selections
        setSelectedEvents([]);
        setSelectedMachineId(null);
    };
    // Auto-schedule unscheduled jobs when component mounts
    useEffect(() => {
        const unscheduledJobs = jobs.filter((job) => {
            // Check if job is not completed or cancelled
            if (job.status === "completed" || job.status === "cancelled")
                return false;
            // Check if job is already scheduled
            const isScheduled = schedule.some((event) => event.jobId === job.id);
            return !isScheduled;
        });
        // Auto-schedule each unscheduled job
        unscheduledJobs.forEach((job) => {
            autoScheduleJob(job.id);
        });
    }, []);
    return (_jsxs("div", { className: "container mx-auto p-4 space-y-6 bg-background", children: [_jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Enhanced Production Schedule" }), _jsx("p", { className: "text-muted-foreground", children: "Manage your production schedule with drag-and-drop, resource planning, and auto-scheduling" })] }), _jsx("div", { className: "flex justify-between items-center", children: _jsx(Tabs, { value: activeTab, onValueChange: (value) => setActiveTab(value), className: "w-full", children: _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsxs(TabsList, { children: [_jsxs(TabsTrigger, { value: "calendar", className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4" }), "Calendar View"] }), _jsxs(TabsTrigger, { value: "resources", className: "flex items-center gap-2", children: [_jsx(Sliders, { className: "h-4 w-4" }), "Resource Planning"] }), _jsxs(TabsTrigger, { value: "machines", className: "flex items-center gap-2", children: [_jsx(Layers, { className: "h-4 w-4" }), "Machine Capacity"] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(BulkScheduleActions, { selectedEvents: selectedEvents, onClearSelection: handleClearSelection, onEventsUpdated: handleScheduleRefresh }), _jsx(AutoScheduleDialog, { onScheduleSuccess: handleScheduleRefresh }), _jsxs(Button, { onClick: () => navigate("/schedule/new"), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "New Event"] })] })] }) }) }), _jsx(TabsContent, { value: "calendar", className: "space-y-4 mt-0", children: _jsx(EnhancedCalendar, { showResourceView: true, onEventSelect: handleEventSelect, selectedEvents: selectedEvents, selectedMachineId: selectedMachineId }) }), _jsx(TabsContent, { value: "resources", className: "space-y-4 mt-0", children: _jsx(ResourceCapacityPlanner, {}) }), _jsx(TabsContent, { value: "machines", className: "space-y-4 mt-0", children: _jsx(MachineCapacityView, { onMachineSelect: handleMachineSelect }) })] }));
}
