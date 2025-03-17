import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Wand2, AlertTriangle } from "lucide-react";
export default function AutoScheduleDialog({ trigger, onScheduleSuccess, }) {
    const { jobs, autoScheduleJob } = useAppContext();
    const [open, setOpen] = useState(false);
    const [selectedJobs, setSelectedJobs] = useState([]);
    const [isScheduling, setIsScheduling] = useState(false);
    // Get unscheduled jobs (pending or in_progress without events)
    const unscheduledJobs = jobs.filter((job) => (job.status === "pending" || job.status === "in_progress") &&
        !job.assignedTo);
    const handleToggleJob = (jobId) => {
        setSelectedJobs((prev) => prev.includes(jobId)
            ? prev.filter((id) => id !== jobId)
            : [...prev, jobId]);
    };
    const handleSelectAll = () => {
        if (selectedJobs.length === unscheduledJobs.length) {
            setSelectedJobs([]);
        }
        else {
            setSelectedJobs(unscheduledJobs.map((job) => job.id));
        }
    };
    const handleAutoSchedule = async () => {
        if (selectedJobs.length === 0) {
            toast({
                title: "No jobs selected",
                description: "Please select at least one job to schedule",
                variant: "destructive",
            });
            return;
        }
        setIsScheduling(true);
        // Track results
        const results = {
            success: 0,
            failed: 0,
        };
        // Process each selected job
        for (const jobId of selectedJobs) {
            const result = autoScheduleJob(jobId);
            if (result) {
                results.success++;
            }
            else {
                results.failed++;
            }
        }
        setIsScheduling(false);
        // Show results
        if (results.success > 0) {
            toast({
                title: "Auto-scheduling complete",
                description: `Successfully scheduled ${results.success} job${results.success !== 1 ? "s" : ""}${results.failed > 0 ? `. Failed to schedule ${results.failed} job${results.failed !== 1 ? "s" : ""}.` : ""}`,
            });
            // Close dialog and call success callback
            setOpen(false);
            if (onScheduleSuccess) {
                onScheduleSuccess();
            }
        }
        else {
            toast({
                title: "Auto-scheduling failed",
                description: "Could not find suitable time slots for the selected jobs. Please try scheduling manually.",
                variant: "destructive",
            });
        }
    };
    return (_jsxs(Dialog, { open: open, onOpenChange: setOpen, children: [_jsx(DialogTrigger, { asChild: true, children: trigger || (_jsxs(Button, { children: [_jsx(Wand2, { className: "h-4 w-4 mr-2" }), "Auto-Schedule"] })) }), _jsxs(DialogContent, { className: "sm:max-w-[600px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Auto-Schedule Jobs" }), _jsx(DialogDescription, { children: "Automatically schedule unassigned jobs based on staff availability, machine capacity, and job priorities." })] }), _jsx("div", { className: "py-4 space-y-4", children: unscheduledJobs.length === 0 ? (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-muted-foreground", children: "No unscheduled jobs found. All jobs are either already scheduled or completed." }) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { className: "text-base font-medium", children: "Select Jobs to Schedule" }), _jsx(Button, { variant: "outline", size: "sm", onClick: handleSelectAll, children: selectedJobs.length === unscheduledJobs.length
                                                ? "Deselect All"
                                                : "Select All" })] }), _jsx("div", { className: "border rounded-md divide-y max-h-[300px] overflow-y-auto", children: unscheduledJobs.map((job) => (_jsxs("div", { className: "flex items-center space-x-3 p-3 hover:bg-muted/50", children: [_jsx(Checkbox, { id: `job-${job.id}`, checked: selectedJobs.includes(job.id), onCheckedChange: () => handleToggleJob(job.id) }), _jsxs("div", { className: "flex-1", children: [_jsx(Label, { htmlFor: `job-${job.id}`, className: "font-medium cursor-pointer", children: job.title }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [job.client, " \u2022 Due", " ", format(new Date(job.deadline), "MMM d, yyyy")] })] }), _jsxs("div", { className: "text-sm", children: [job.estimatedHours, " hrs"] })] }, job.id))) }), _jsxs("div", { className: "flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-md", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "text-sm text-yellow-700", children: [_jsx("p", { className: "font-medium text-yellow-800", children: "Auto-scheduling considerations:" }), _jsxs("ul", { className: "list-disc list-inside mt-1 space-y-1", children: [_jsx("li", { children: "Jobs will be scheduled based on staff availability and machine capacity" }), _jsx("li", { children: "Priority will be given to jobs with earlier deadlines" }), _jsx("li", { children: "Some jobs may not be scheduled if no suitable time slots are found" })] })] })] })] })) }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleAutoSchedule, disabled: selectedJobs.length === 0 || isScheduling, children: isScheduling ? "Scheduling..." : "Auto-Schedule Selected Jobs" })] })] })] }));
}
