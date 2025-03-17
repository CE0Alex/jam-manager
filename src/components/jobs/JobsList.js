import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { format } from "date-fns";
import { Eye, Edit, Trash2, Plus, Filter } from "lucide-react";
import JobStatusBadge from "./JobStatusBadge";
import JobPriorityBadge from "./JobPriorityBadge";
export default function JobsList() {
    const { filteredJobs, setJobFilters, deleteJob, staff } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [assigneeFilter, setAssigneeFilter] = useState("all");
    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };
    const applyFilters = () => {
        const filters = { searchTerm };
        if (statusFilter !== "all") {
            filters.status = [statusFilter];
        }
        if (priorityFilter !== "all") {
            filters.priority = [priorityFilter];
        }
        if (assigneeFilter !== "all") {
            filters.assignedTo = [assigneeFilter];
        }
        setJobFilters(filters);
    };
    const resetFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setPriorityFilter("all");
        setAssigneeFilter("all");
        setJobFilters({});
    };
    const getStaffName = (staffId) => {
        if (!staffId)
            return "Unassigned";
        const staffMember = staff.find((s) => s.id === staffId);
        return staffMember ? staffMember.name : "Unknown";
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Jobs" }), _jsx(Link, { to: "/jobs/new", children: _jsxs(Button, { children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "New Job"] }) })] }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-4 mb-6", children: [_jsx("form", { onSubmit: handleSearch, className: "flex-1", children: _jsx(Input, { placeholder: "Search jobs...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full" }) }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs(Select, { value: statusFilter, onValueChange: (value) => setStatusFilter(value), children: [_jsx(SelectTrigger, { className: "w-[140px]", children: _jsx(SelectValue, { placeholder: "Status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), _jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "in_progress", children: "In Progress" }), _jsx(SelectItem, { value: "review", children: "In Review" }), _jsx(SelectItem, { value: "completed", children: "Completed" }), _jsx(SelectItem, { value: "cancelled", children: "Cancelled" })] })] }), _jsxs(Select, { value: priorityFilter, onValueChange: (value) => setPriorityFilter(value), children: [_jsx(SelectTrigger, { className: "w-[140px]", children: _jsx(SelectValue, { placeholder: "Priority" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Priorities" }), _jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "urgent", children: "Urgent" })] })] }), _jsxs(Select, { value: assigneeFilter, onValueChange: setAssigneeFilter, children: [_jsx(SelectTrigger, { className: "w-[140px]", children: _jsx(SelectValue, { placeholder: "Assignee" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Staff" }), _jsx(SelectItem, { value: "unassigned", children: "Unassigned" }), staff.map((member) => (_jsx(SelectItem, { value: member.id, children: member.name }, member.id)))] })] }), _jsxs(Button, { variant: "outline", onClick: applyFilters, children: [_jsx(Filter, { className: "h-4 w-4 mr-2" }), "Filter"] }), _jsx(Button, { variant: "ghost", onClick: resetFilters, children: "Reset" })] })] }), _jsx("div", { className: "rounded-md border", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Job Title" }), _jsx(TableHead, { children: "Client" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Priority" }), _jsx(TableHead, { children: "Deadline" }), _jsx(TableHead, { children: "Assigned To" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: filteredJobs.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center h-24 text-muted-foreground", children: "No jobs found" }) })) : (filteredJobs.map((job) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: job.title }), _jsx(TableCell, { children: job.client }), _jsx(TableCell, { children: _jsx(JobStatusBadge, { status: job.status }) }), _jsx(TableCell, { children: _jsx(JobPriorityBadge, { priority: job.priority }) }), _jsx(TableCell, { children: format(new Date(job.deadline), "MMM d, yyyy") }), _jsx(TableCell, { children: getStaffName(job.assignedTo) }), _jsx(TableCell, { className: "text-right", children: _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Link, { to: `/jobs/${job.id}`, children: _jsx(Button, { variant: "ghost", size: "icon", children: _jsx(Eye, { className: "h-4 w-4" }) }) }), _jsx(Link, { to: `/jobs/${job.id}/edit`, children: _jsx(Button, { variant: "ghost", size: "icon", children: _jsx(Edit, { className: "h-4 w-4" }) }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
                                                                    if (confirm("Are you sure you want to delete this job?")) {
                                                                        deleteJob(job.id);
                                                                    }
                                                                }, children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) })] }, job.id)))) })] }) })] }) })] }));
}
