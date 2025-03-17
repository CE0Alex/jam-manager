import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import JobStatusBadge from "./JobStatusBadge";
import JobPriorityBadge from "./JobPriorityBadge";
import JobTypeBadge from "./JobTypeBadge";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import StaffAvatar from "../staff/StaffAvatar";
import CreateJobDialog from "./CreateJobDialog";
const JobsTable = ({ jobs = [], onViewJob = () => { }, onEditJob = () => { }, onDeleteJob = () => { }, onAssignJob = () => { }, onArchiveJob = () => { }, onCreateJob, onSelectionChange, }) => {
    const navigate = useNavigate();
    const [selectedJobs, setSelectedJobs] = useState([]);
    const [sortField, setSortField] = useState("deadline");
    const [sortDirection, setSortDirection] = useState("asc");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const handleSort = (field) => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        }
        else {
            setSortField(field);
            setSortDirection("asc");
        }
    };
    const sortedJobs = [...jobs].sort((a, b) => {
        const direction = sortDirection === "asc" ? 1 : -1;
        switch (sortField) {
            case "title":
                return a.title.localeCompare(b.title) * direction;
            case "client":
                return a.client.localeCompare(b.client) * direction;
            case "deadline":
                return ((new Date(a.deadline).getTime() - new Date(b.deadline).getTime()) *
                    direction);
            case "status":
                return a.status.localeCompare(b.status) * direction;
            case "priority":
                const priorityOrder = { low: 0, medium: 1, high: 2, urgent: 3 };
                return ((priorityOrder[a.priority] -
                    priorityOrder[b.priority]) *
                    direction);
            case "jobType":
                return a.jobType.localeCompare(b.jobType) * direction;
            default:
                return 0;
        }
    });
    const toggleSelectAll = () => {
        const newSelection = selectedJobs.length === jobs.length ? [] : jobs.map((job) => job.id);
        setSelectedJobs(newSelection);
        if (onSelectionChange) {
            onSelectionChange(newSelection);
        }
    };
    const toggleSelectJob = (jobId) => {
        const newSelection = selectedJobs.includes(jobId)
            ? selectedJobs.filter((id) => id !== jobId)
            : [...selectedJobs, jobId];
        setSelectedJobs(newSelection);
        if (onSelectionChange) {
            onSelectionChange(newSelection);
        }
    };
    const renderSortIcon = (field) => {
        if (sortField !== field)
            return null;
        return sortDirection === "asc" ? (_jsx(ChevronUp, { className: "ml-1 h-4 w-4" })) : (_jsx(ChevronDown, { className: "ml-1 h-4 w-4" }));
    };
    const handleCreateJob = () => {
        if (onCreateJob) {
            onCreateJob();
        }
        else {
            setIsCreateDialogOpen(true);
        }
        console.log("Create job button clicked");
    };
    return (_jsxs("div", { className: "w-full bg-white rounded-md border", children: [jobs.length === 0 ? (_jsx("div", { className: "flex flex-col items-center justify-center py-8 text-center", children: _jsx("p", { className: "text-muted-foreground mb-4", children: "No jobs found. Create a new job to get started." }) })) : (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "w-[50px]", children: _jsx(Checkbox, { checked: selectedJobs.length === jobs.length && jobs.length > 0, onCheckedChange: toggleSelectAll, "aria-label": "Select all jobs" }) }), _jsx(TableHead, { className: "cursor-pointer", onClick: () => handleSort("title"), children: _jsxs("div", { className: "flex items-center", children: ["Invoice Number ", renderSortIcon("title")] }) }), _jsx(TableHead, { className: "cursor-pointer", onClick: () => handleSort("client"), children: _jsxs("div", { className: "flex items-center", children: ["Client ", renderSortIcon("client")] }) }), _jsx(TableHead, { className: "cursor-pointer", onClick: () => handleSort("deadline"), children: _jsxs("div", { className: "flex items-center", children: ["Deadline ", renderSortIcon("deadline")] }) }), _jsx(TableHead, { className: "cursor-pointer", onClick: () => handleSort("status"), children: _jsxs("div", { className: "flex items-center", children: ["Status ", renderSortIcon("status")] }) }), _jsx(TableHead, { className: "cursor-pointer", onClick: () => handleSort("priority"), children: _jsxs("div", { className: "flex items-center", children: ["Priority ", renderSortIcon("priority")] }) }), _jsx(TableHead, { className: "cursor-pointer", onClick: () => handleSort("jobType"), children: _jsxs("div", { className: "flex items-center", children: ["Job Type ", renderSortIcon("jobType")] }) }), _jsx(TableHead, { children: "Assigned To" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: sortedJobs.map((job) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx(Checkbox, { checked: selectedJobs.includes(job.id), onCheckedChange: () => toggleSelectJob(job.id), "aria-label": `Select job ${job.title}` }) }), _jsx(TableCell, { className: "font-medium", children: job.title }), _jsx(TableCell, { children: job.client }), _jsx(TableCell, { children: format(new Date(job.deadline), "MMM d, yyyy") }), _jsx(TableCell, { children: _jsx(JobStatusBadge, { status: job.status }) }), _jsx(TableCell, { children: _jsx(JobPriorityBadge, { priority: job.priority }) }), _jsx(TableCell, { children: _jsx(JobTypeBadge, { jobType: job.jobType }) }), _jsx(TableCell, { children: _jsx(StaffAvatar, { staffId: job.assignedTo, size: "sm" }) }), _jsx(TableCell, { className: "text-right", children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "icon", children: [_jsx(MoreHorizontal, { className: "h-4 w-4" }), _jsx("span", { className: "sr-only", children: "Open menu" })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuItem, { onClick: () => onViewJob(job.id), children: "View Details" }), _jsx(DropdownMenuItem, { onClick: () => onEditJob(job.id), children: "Edit Job" }), _jsx(DropdownMenuItem, { onClick: () => onAssignJob(job.id), children: "Assign Staff" }), _jsx(DropdownMenuItem, { onClick: () => onArchiveJob(job.id), children: "Archive Job" }), _jsx(DropdownMenuItem, { className: "text-destructive", onClick: () => onDeleteJob(job.id), children: "Delete Job" })] })] }) })] }, job.id))) })] })), _jsx(CreateJobDialog, { open: isCreateDialogOpen, triggerButton: false, onOpenChange: setIsCreateDialogOpen })] }));
};
export default JobsTable;
