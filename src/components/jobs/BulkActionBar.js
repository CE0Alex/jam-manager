import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Archive, Trash2, Tag, Users, Calendar, AlertTriangle } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
// Helper functions for formatting
const formatStatus = (status) => {
    const statusMap = {
        pending: "Pending",
        in_progress: "In Progress",
        review: "In Review",
        completed: "Completed",
        cancelled: "Cancelled",
        archived: "Archived"
    };
    return statusMap[status] || status;
};
const formatPriority = (priority) => {
    const priorityMap = {
        low: "Low",
        medium: "Medium",
        high: "High",
        urgent: "Urgent"
    };
    return priorityMap[priority] || priority;
};
export default function BulkActionBar({ selectedJobIds, onClearSelection, onActionComplete }) {
    const { jobs, staff, updateJob, deleteJob } = useAppContext();
    const navigate = useNavigate();
    const [showDialog, setShowDialog] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);
    const [newStatus, setNewStatus] = useState("pending");
    const [newPriority, setPriority] = useState("medium");
    const [newStaffId, setNewStaffId] = useState("");
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    // Get count of selected jobs
    const selectedCount = selectedJobIds.length;
    // Get selected jobs data
    const selectedJobs = jobs.filter(job => selectedJobIds.includes(job.id));
    const handleAction = (action) => {
        setCurrentAction(action);
        setShowDialog(true);
    };
    const executeAction = async () => {
        if (selectedJobIds.length === 0)
            return;
        setIsProcessing(true);
        try {
            switch (currentAction) {
                case 'status':
                    if (!newStatus) {
                        toast({
                            title: "Error",
                            description: "Please select a status",
                            variant: "destructive"
                        });
                        setIsProcessing(false);
                        return;
                    }
                    // Get the existing jobs to update
                    const jobsToUpdate = jobs.filter(job => selectedJobIds.includes(job.id));
                    // Track any jobs that failed to update
                    const failedJobs = [];
                    // Update each job individually to avoid batch failures
                    for (const job of jobsToUpdate) {
                        try {
                            const updatedJob = {
                                ...job,
                                status: newStatus,
                                updatedAt: new Date().toISOString()
                            };
                            updateJob(updatedJob);
                        }
                        catch (updateError) {
                            console.error(`Failed to update job ${job.id}:`, updateError);
                            failedJobs.push(job.title);
                        }
                    }
                    // Provide appropriate feedback
                    if (failedJobs.length > 0) {
                        if (failedJobs.length === jobsToUpdate.length) {
                            // All updates failed
                            toast({
                                title: "Update Failed",
                                description: "Failed to update any of the selected jobs.",
                                variant: "destructive"
                            });
                        }
                        else {
                            // Some updates failed
                            toast({
                                title: "Partial Update",
                                description: `Updated ${jobsToUpdate.length - failedJobs.length} jobs, but ${failedJobs.length} failed.`,
                                variant: "default"
                            });
                        }
                    }
                    else {
                        // All updates succeeded
                        toast({
                            title: `${selectedJobIds.length} Jobs Updated`,
                            description: `All jobs have been updated to status: ${formatStatus(newStatus)}`
                        });
                    }
                    break;
                case 'priority':
                    // Similar implementation for priority updates
                    if (!newPriority) {
                        toast({
                            title: "Error",
                            description: "Please select a priority level",
                            variant: "destructive"
                        });
                        setIsProcessing(false);
                        return;
                    }
                    // Get jobs to update priority
                    const priorityJobsToUpdate = jobs.filter(job => selectedJobIds.includes(job.id));
                    const priorityFailedJobs = [];
                    // Update each job individually
                    for (const job of priorityJobsToUpdate) {
                        try {
                            const updatedJob = {
                                ...job,
                                priority: newPriority,
                                updatedAt: new Date().toISOString()
                            };
                            updateJob(updatedJob);
                        }
                        catch (updateError) {
                            console.error(`Failed to update priority for job ${job.id}:`, updateError);
                            priorityFailedJobs.push(job.title);
                        }
                    }
                    // Provide feedback
                    if (priorityFailedJobs.length > 0) {
                        if (priorityFailedJobs.length === priorityJobsToUpdate.length) {
                            toast({
                                title: "Update Failed",
                                description: "Failed to update priority for any of the selected jobs.",
                                variant: "destructive"
                            });
                        }
                        else {
                            toast({
                                title: "Partial Update",
                                description: `Updated priority for ${priorityJobsToUpdate.length - priorityFailedJobs.length} jobs, but ${priorityFailedJobs.length} failed.`,
                                variant: "default"
                            });
                        }
                    }
                    else {
                        toast({
                            title: `${selectedJobIds.length} Jobs Updated`,
                            description: `All jobs have been updated to priority: ${formatPriority(newPriority)}`
                        });
                    }
                    break;
                case 'archive':
                    console.log(`Archiving ${selectedJobIds.length} jobs`);
                    jobs.forEach(job => {
                        console.log(`Archiving job ${job.id}`);
                        updateJob({
                            ...job,
                            status: 'archived'
                        });
                    });
                    break;
                case 'delete':
                    if (deleteConfirmation !== `delete-${selectedCount}`) {
                        return; // Don't proceed if confirmation doesn't match
                    }
                    console.log(`Deleting ${selectedJobIds.length} jobs`);
                    // Create a copy of the array to avoid issues with array mutations during iteration
                    const jobIdsToDelete = [...selectedJobIds];
                    // Delete all jobs without awaiting between deletions
                    jobIdsToDelete.forEach(jobId => {
                        console.log(`Deleting job: ${jobId}`);
                        deleteJob(jobId);
                    });
                    break;
                case 'reassign':
                    console.log(`Reassigning ${selectedJobIds.length} jobs to staff: ${newStaffId || 'unassigned'}`);
                    jobs.forEach(job => {
                        console.log(`Reassigning job ${job.id} to staff: ${newStaffId || 'unassigned'}`);
                        updateJob({
                            ...job,
                            assignedTo: newStaffId || undefined
                        });
                    });
                    break;
                case 'schedule':
                    // Navigate to scheduling interface with selected job IDs
                    navigate('/schedule', { state: { bulkScheduleJobs: selectedJobIds } });
                    break;
                default:
                    toast({
                        title: "Action Not Implemented",
                        description: `The action '${currentAction}' is not implemented yet.`,
                        variant: "default"
                    });
            }
            onActionComplete();
            setShowDialog(false);
            onClearSelection();
        }
        catch (error) {
            console.error("Error executing bulk action:", error);
            toast({
                title: "Error",
                description: `Failed to ${currentAction} the selected jobs. Please try again.`,
                variant: "destructive"
            });
        }
        finally {
            setIsProcessing(false);
        }
    };
    const renderDialogContent = () => {
        switch (currentAction) {
            case 'status':
                return (_jsxs(_Fragment, { children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: ["Change Status for ", selectedCount, " Jobs"] }), _jsx(DialogDescription, { children: "Select a new status to apply to all selected jobs." })] }), _jsxs("div", { className: "py-4", children: [_jsx(Label, { htmlFor: "new-status", children: "New Status" }), _jsxs(Select, { value: newStatus, onValueChange: (value) => setNewStatus(value), children: [_jsx(SelectTrigger, { id: "new-status", children: _jsx(SelectValue, { placeholder: "Select a status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "in_progress", children: "In Progress" }), _jsx(SelectItem, { value: "review", children: "In Review" }), _jsx(SelectItem, { value: "completed", children: "Completed" }), _jsx(SelectItem, { value: "cancelled", children: "Cancelled" }), _jsx(SelectItem, { value: "archived", children: "Archived" })] })] })] })] }));
            case 'priority':
                return (_jsxs(_Fragment, { children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: ["Change Priority for ", selectedCount, " Jobs"] }), _jsx(DialogDescription, { children: "Select a new priority level to apply to all selected jobs." })] }), _jsxs("div", { className: "py-4", children: [_jsx(Label, { htmlFor: "new-priority", children: "New Priority" }), _jsxs(Select, { value: newPriority, onValueChange: (value) => setPriority(value), children: [_jsx(SelectTrigger, { id: "new-priority", children: _jsx(SelectValue, { placeholder: "Select a priority" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "urgent", children: "Urgent" })] })] })] })] }));
            case 'archive':
                return (_jsxs(_Fragment, { children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: ["Archive ", selectedCount, " Jobs"] }), _jsx(DialogDescription, { children: "Are you sure you want to archive these jobs? They will be moved to the archive and hidden from the main job list." })] }), _jsxs("div", { className: "py-4", children: [_jsx("p", { children: "This action will archive the following jobs:" }), _jsxs("ul", { className: "mt-2 ml-6 list-disc", children: [selectedJobs.slice(0, 5).map(job => (_jsxs("li", { className: "text-sm", children: [job.title, " - ", job.client] }, job.id))), selectedJobs.length > 5 && (_jsxs("li", { className: "text-sm italic", children: ["...and ", selectedJobs.length - 5, " more"] }))] })] })] }));
            case 'delete':
                return (_jsxs(_Fragment, { children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center text-destructive", children: [_jsx(AlertTriangle, { className: "mr-2 h-5 w-5" }), "Delete ", selectedCount, " Jobs"] }), _jsx(DialogDescription, { children: "This action is irreversible. These jobs will be permanently deleted from the system." })] }), _jsxs("div", { className: "py-4", children: [_jsx("p", { className: "mb-2", children: "You are about to delete:" }), _jsxs("ul", { className: "mt-2 ml-6 list-disc", children: [selectedJobs.slice(0, 5).map(job => (_jsxs("li", { className: "text-sm", children: [job.title, " - ", job.client] }, job.id))), selectedJobs.length > 5 && (_jsxs("li", { className: "text-sm italic", children: ["...and ", selectedJobs.length - 5, " more"] }))] }), _jsxs("div", { className: "mt-4 border border-destructive/50 rounded-md p-4 bg-destructive/5", children: [_jsxs(Label, { htmlFor: "delete-confirmation", className: "text-destructive font-medium block mb-2", children: ["Type \"delete-", selectedCount, "\" to confirm:"] }), _jsx(Input, { id: "delete-confirmation", value: deleteConfirmation, onChange: (e) => setDeleteConfirmation(e.target.value), className: "border-destructive" })] })] })] }));
            case 'reassign':
                return (_jsxs(_Fragment, { children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: ["Reassign ", selectedCount, " Jobs"] }), _jsx(DialogDescription, { children: "Select a staff member to assign these jobs to. Leave blank to unassign." })] }), _jsxs("div", { className: "py-4", children: [_jsx(Label, { htmlFor: "staff-assignment", children: "Assign to Staff" }), _jsxs(Select, { value: newStaffId, onValueChange: setNewStaffId, children: [_jsx(SelectTrigger, { id: "staff-assignment", children: _jsx(SelectValue, { placeholder: "Select a staff member" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "", children: "Unassign" }), staff.map(member => (_jsx(SelectItem, { value: member.id, children: member.name }, member.id)))] })] })] })] }));
            case 'schedule':
                return (_jsxs(_Fragment, { children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: ["Schedule ", selectedCount, " Jobs"] }), _jsx(DialogDescription, { children: "The selected jobs will be added to the scheduling interface." })] }), _jsxs("div", { className: "py-4", children: [_jsx("p", { children: "You'll be redirected to the scheduling interface to assign dates and times for:" }), _jsxs("ul", { className: "mt-2 ml-6 list-disc", children: [selectedJobs.slice(0, 5).map(job => (_jsxs("li", { className: "text-sm", children: [job.title, " - ", job.client] }, job.id))), selectedJobs.length > 5 && (_jsxs("li", { className: "text-sm italic", children: ["...and ", selectedJobs.length - 5, " more"] }))] })] })] }));
            default:
                return null;
        }
    };
    const getDialogActionLabel = () => {
        switch (currentAction) {
            case 'status': return 'Change Status';
            case 'priority': return 'Change Priority';
            case 'archive': return 'Archive Jobs';
            case 'delete': return 'Delete Jobs';
            case 'reassign': return 'Reassign Jobs';
            case 'schedule': return 'Continue to Scheduling';
            default: return 'Continue';
        }
    };
    if (selectedJobIds.length === 0)
        return null;
    return (_jsxs("div", { className: "bg-primary/5 border border-primary/20 rounded-md px-4 py-3 mb-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsxs("span", { className: "font-medium mr-2", children: [selectedCount, " jobs selected"] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClearSelection, children: "Clear" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleAction('status'), className: "flex items-center", children: [_jsx(Tag, { className: "h-4 w-4 mr-1" }), "Status"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleAction('priority'), className: "flex items-center", children: [_jsx(Tag, { className: "h-4 w-4 mr-1" }), "Priority"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleAction('reassign'), className: "flex items-center", children: [_jsx(Users, { className: "h-4 w-4 mr-1" }), "Reassign"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleAction('schedule'), className: "flex items-center", children: [_jsx(Calendar, { className: "h-4 w-4 mr-1" }), "Schedule"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleAction('archive'), className: "flex items-center", children: [_jsx(Archive, { className: "h-4 w-4 mr-1" }), "Archive"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleAction('delete'), className: "flex items-center text-destructive", children: [_jsx(Trash2, { className: "h-4 w-4 mr-1" }), "Delete"] })] }), _jsx(Dialog, { open: showDialog, onOpenChange: setShowDialog, children: _jsxs(DialogContent, { children: [renderDialogContent(), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowDialog(false), disabled: isProcessing, children: "Cancel" }), _jsx(Button, { variant: currentAction === 'delete' ? 'destructive' : 'default', onClick: executeAction, disabled: isProcessing ||
                                        (currentAction === 'delete' && deleteConfirmation !== `delete-${selectedCount}`), children: isProcessing ? 'Processing...' : getDialogActionLabel() })] })] }) })] }));
}
