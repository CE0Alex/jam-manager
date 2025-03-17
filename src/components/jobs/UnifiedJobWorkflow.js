import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import BulkActionBar from "./BulkActionBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { format, addHours } from "date-fns";
import { Calendar, ChevronLeft } from "lucide-react";
import FullCalendarScheduler from "../schedule/FullCalendarScheduler";
import JobsTable from "./JobsTable";
import JobsFilter from "./JobsFilter";
import CreateJobDialog from "./CreateJobDialog";
export default function UnifiedJobWorkflow({ initialTab = "jobs", }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { jobs, addJob, deleteJob, updateJob, addScheduleEvent, staff, schedule } = useAppContext();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [createdJob, setCreatedJob] = useState(null);
    const [schedulingStep, setSchedulingStep] = useState(false);
    const [selectedJobIds, setSelectedJobIds] = useState([]);
    // Check for state params from navigation
    useEffect(() => {
        const state = location.state;
        if (state?.activeJob && state?.openScheduler) {
            const job = jobs.find(j => j.id === state.activeJob);
            if (job) {
                setCreatedJob(job);
                setSchedulingStep(true);
            }
            // Clear the state to prevent re-triggering
            navigate(location.pathname, { replace: true });
        }
    }, [location, jobs, navigate]);
    // Handle job selection change
    const handleJobSelectionChange = (selectedIds) => {
        setSelectedJobIds(selectedIds);
    };
    // Clear job selection
    const clearJobSelection = () => {
        setSelectedJobIds([]);
    };
    // Handle bulk action completion
    const handleBulkActionComplete = () => {
        // Force a refresh by setting the selection to empty
        setSelectedJobIds([]);
        // Add a slight delay and then force another refresh to ensure UI is updated
        setTimeout(() => {
            setActiveTab(activeTab === "jobs" ? "jobs" : "jobs");
        }, 100);
    };
    // Form data for scheduling
    const [scheduleData, setScheduleData] = useState({
        staffId: "",
        startDate: format(new Date(), "yyyy-MM-dd"),
        startTime: "09:00",
        notes: "",
    });
    // Handle job creation
    const handleJobCreated = (job) => {
        // Redirect to schedule view with the new job ID
        navigate("/schedule", {
            state: {
                activeJob: job.id,
                openScheduler: true
            }
        });
    };
    // Handle job selection for scheduling
    const handleJobSelected = (jobId) => {
        const job = jobs.find((j) => j.id === jobId);
        if (job) {
            setCreatedJob(job);
            setSchedulingStep(true);
        }
    };
    // Handle schedule data change
    const handleScheduleChange = (name, value) => {
        setScheduleData((prev) => ({ ...prev, [name]: value }));
    };
    // Calculate end time based on job's estimated hours
    const calculateEndTime = () => {
        if (!createdJob || !scheduleData.startDate || !scheduleData.startTime) {
            return {
                endDate: scheduleData.startDate,
                endTime: scheduleData.startTime,
            };
        }
        const estimatedHours = createdJob.estimatedHours || 1;
        const startDateTime = new Date(`${scheduleData.startDate}T${scheduleData.startTime}:00`);
        const endDateTime = addHours(startDateTime, estimatedHours);
        return {
            endDate: format(endDateTime, "yyyy-MM-dd"),
            endTime: format(endDateTime, "HH:mm"),
        };
    };
    // Check if staff member is available
    const checkStaffAvailability = (staffId, startTime, endTime) => {
        if (!staffId)
            return true; // If no staff assigned, no conflict
        // Get all events for this staff member
        const staffEvents = schedule.filter((event) => event.staffId === staffId);
        // Check for time conflicts
        return !staffEvents.some((event) => {
            const eventStart = new Date(event.startTime);
            const eventEnd = new Date(event.endTime);
            // Check if there's an overlap
            return startTime < eventEnd && endTime > eventStart;
        });
    };
    // Handle schedule submission
    const handleScheduleSubmit = () => {
        if (!createdJob)
            return;
        // Combine date and time into ISO strings
        const startTime = `${scheduleData.startDate}T${scheduleData.startTime}:00`;
        const { endDate, endTime } = calculateEndTime();
        const endTimeISO = `${endDate}T${endTime}:00`;
        // Check staff availability if staff is assigned
        if (scheduleData.staffId) {
            const isAvailable = checkStaffAvailability(scheduleData.staffId, new Date(startTime), new Date(endTimeISO));
            if (!isAvailable) {
                toast({
                    title: "Scheduling Conflict",
                    description: "This staff member is already scheduled during this time period.",
                    variant: "destructive",
                });
                return;
            }
        }
        // Create schedule event
        addScheduleEvent({
            jobId: createdJob.id,
            staffId: scheduleData.staffId || undefined,
            startTime,
            endTime: endTimeISO,
            notes: scheduleData.notes || undefined,
        });
        toast({
            title: "Success",
            description: "Job scheduled successfully",
        });
        // Reset and go back to jobs list
        setCreatedJob(null);
        setSchedulingStep(false);
        setActiveTab("jobs");
    };
    // Handle job actions
    const handleViewJob = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };
    const handleEditJob = (jobId) => {
        navigate(`/jobs/${jobId}/edit`);
    };
    const handleDeleteJob = (jobId) => {
        if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            deleteJob(jobId);
            toast({
                title: "Job Deleted",
                description: "The job has been permanently deleted."
            });
        }
    };
    const handleArchiveJob = (jobId) => {
        const job = jobs.find(j => j.id === jobId);
        if (!job)
            return;
        // Update the job status to 'archived' (we'll need to add this to JobStatus type)
        updateJob({
            ...job,
            status: 'archived'
        });
        toast({
            title: "Job Archived",
            description: "The job has been archived and can be restored later."
        });
    };
    const handleAssignJob = (jobId) => {
        // Redirect to the Schedule module with the job ID
        navigate('/schedule', { state: { activeJob: jobId, openScheduler: true } });
    };
    // Render scheduling step
    const renderSchedulingStep = () => {
        if (!createdJob)
            return null;
        // This is for compatibility with the InteractiveScheduleCalendar props
        const handleTimeSlotSelect = (date, startTime, endTime) => {
            setScheduleData(prev => ({
                ...prev,
                startDate: date,
                startTime: startTime
            }));
        };
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h2", { className: "text-2xl font-bold flex items-center", children: [_jsx(Button, { variant: "ghost", size: "sm", className: "mr-2", onClick: () => {
                                        setSchedulingStep(false);
                                        setCreatedJob(null);
                                    }, children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), "Schedule Job: ", createdJob.title] }), _jsx(Button, { variant: "outline", onClick: () => {
                                setSchedulingStep(false);
                                setCreatedJob(null);
                            }, children: "Cancel" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-card p-6 rounded-lg border shadow-sm", children: [_jsx("h3", { className: "text-lg font-medium mb-4", children: "Job Details" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Invoice:" }), " ", createdJob.title] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Client:" }), " ", createdJob.client] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Description:" }), " ", createdJob.description] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Deadline:" }), " ", format(new Date(createdJob.deadline), "MMM d, yyyy")] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Estimated Hours:" }), " ", createdJob.estimatedHours] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Priority:" }), " ", createdJob.priority] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Job Type:" }), " ", createdJob.jobType.replace("_", " ")] })] }), _jsxs("div", { className: "mt-6 space-y-2", children: [_jsx("label", { className: "block text-sm font-medium", children: "Notes" }), _jsx("textarea", { className: "w-full p-2 border rounded-md bg-background", rows: 3, value: scheduleData.notes, onChange: (e) => handleScheduleChange("notes", e.target.value), placeholder: "Additional information about this schedule" })] }), _jsxs(Button, { className: "w-full mt-4", onClick: handleScheduleSubmit, children: [_jsx(Calendar, { className: "mr-2 h-4 w-4" }), "Schedule Job"] })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsxs("div", { className: "space-y-2 mb-4", children: [_jsx("label", { className: "block text-sm font-medium", children: "Assigned Staff" }), _jsxs("select", { className: "w-full p-2 border rounded-md bg-background", value: scheduleData.staffId, onChange: (e) => handleScheduleChange("staffId", e.target.value), children: [_jsx("option", { value: "", children: "Unassigned" }), staff.map((member) => (_jsx("option", { value: member.id, children: member.name }, member.id)))] })] }), _jsx(FullCalendarScheduler, { selectedJob: createdJob, selectedStaffId: scheduleData.staffId, onTimeSlotSelect: handleTimeSlotSelect })] })] })] }));
    };
    return (_jsx("div", { className: "space-y-6", children: schedulingStep ? (renderSchedulingStep()) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Job Management" }), _jsx("p", { className: "text-muted-foreground", children: "Create, view, and schedule jobs in one unified workflow" })] }), _jsx(BulkActionBar, { selectedJobIds: selectedJobIds, onClearSelection: clearJobSelection, onActionComplete: handleBulkActionComplete }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full max-w-md grid-cols-2", children: [_jsx(TabsTrigger, { value: "jobs", children: "View Jobs" }), _jsx(TabsTrigger, { value: "create", children: "Create New Job" })] }), _jsxs(TabsContent, { value: "jobs", className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-semibold", children: "All Jobs" }), _jsx(Button, { onClick: () => setActiveTab("create"), children: "Create New Job" })] }), _jsx(JobsFilter, {}), _jsx(JobsTable, { jobs: jobs, onViewJob: handleViewJob, onEditJob: handleEditJob, onDeleteJob: handleDeleteJob, onAssignJob: handleAssignJob, onArchiveJob: handleArchiveJob, onSelectionChange: handleJobSelectionChange })] }), _jsx(TabsContent, { value: "create", children: _jsx("div", { className: "bg-card rounded-lg border p-6", children: _jsx(CreateJobDialog, { open: true, triggerButton: false, onOpenChange: (open) => {
                                        if (!open) {
                                            setActiveTab("jobs");
                                        }
                                    } }) }) })] })] })) }));
}
