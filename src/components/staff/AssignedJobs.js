import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { AlertCircle, CheckCircle, Clock, Edit, Eye } from "lucide-react";
const getPriorityColor = (priority) => {
    switch (priority) {
        case "low":
            return "bg-blue-100 text-blue-800";
        case "medium":
            return "bg-green-100 text-green-800";
        case "high":
            return "bg-amber-100 text-amber-800";
        case "urgent":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};
const getStatusIcon = (status) => {
    switch (status) {
        case "pending":
            return _jsx(Clock, { className: "h-4 w-4 text-yellow-500" });
        case "in_progress":
            return _jsx(Clock, { className: "h-4 w-4 text-blue-500" });
        case "review":
            return _jsx(AlertCircle, { className: "h-4 w-4 text-purple-500" });
        case "completed":
            return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
        case "cancelled":
            return _jsx(AlertCircle, { className: "h-4 w-4 text-red-500" });
        default:
            return null;
    }
};
const AssignedJobs = ({ staffId = "1", jobs = mockJobs, onViewJob = () => { }, }) => {
    const [sortField, setSortField] = useState("deadline");
    const [sortDirection, setSortDirection] = useState("asc");
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
        if (sortField === "deadline" ||
            sortField === "createdAt" ||
            sortField === "updatedAt") {
            const dateA = new Date(a[sortField]);
            const dateB = new Date(b[sortField]);
            return sortDirection === "asc"
                ? dateA.getTime() - dateB.getTime()
                : dateB.getTime() - dateA.getTime();
        }
        if (a[sortField] < b[sortField])
            return sortDirection === "asc" ? -1 : 1;
        if (a[sortField] > b[sortField])
            return sortDirection === "asc" ? 1 : -1;
        return 0;
    });
    return (_jsxs(Card, { className: "w-full bg-white", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-xl font-semibold", children: "Assigned Jobs" }) }), _jsx(CardContent, { children: jobs.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-center", children: [_jsx("p", { className: "text-muted-foreground mb-4", children: "No jobs assigned to this staff member yet." }), _jsx(Button, { variant: "outline", children: "Assign New Job" })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsxs(TableHead, { className: "cursor-pointer", onClick: () => handleSort("title"), children: ["Job Title", sortField === "title" && (_jsx("span", { className: "ml-1", children: sortDirection === "asc" ? "↑" : "↓" }))] }), _jsxs(TableHead, { className: "cursor-pointer", onClick: () => handleSort("client"), children: ["Client", sortField === "client" && (_jsx("span", { className: "ml-1", children: sortDirection === "asc" ? "↑" : "↓" }))] }), _jsxs(TableHead, { className: "cursor-pointer", onClick: () => handleSort("deadline"), children: ["Deadline", sortField === "deadline" && (_jsx("span", { className: "ml-1", children: sortDirection === "asc" ? "↑" : "↓" }))] }), _jsxs(TableHead, { className: "cursor-pointer", onClick: () => handleSort("status"), children: ["Status", sortField === "status" && (_jsx("span", { className: "ml-1", children: sortDirection === "asc" ? "↑" : "↓" }))] }), _jsxs(TableHead, { className: "cursor-pointer", onClick: () => handleSort("priority"), children: ["Priority", sortField === "priority" && (_jsx("span", { className: "ml-1", children: sortDirection === "asc" ? "↑" : "↓" }))] }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: sortedJobs.map((job) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: job.title }), _jsx(TableCell, { children: job.client }), _jsxs(TableCell, { children: [format(new Date(job.deadline), "MMM dd, yyyy"), new Date(job.deadline) < new Date() && (_jsx(Badge, { variant: "destructive", className: "ml-2", children: "Overdue" }))] }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-1", children: [getStatusIcon(job.status), _jsx("span", { className: "capitalize", children: job.status.replace("_", " ") })] }) }), _jsx(TableCell, { children: _jsx(Badge, { className: getPriorityColor(job.priority), children: job.priority.charAt(0).toUpperCase() +
                                                    job.priority.slice(1) }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => onViewJob(job.id), children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", children: _jsx(Edit, { className: "h-4 w-4" }) })] }) })] }, job.id))) })] }) })) })] }));
};
// Mock data for development
const mockJobs = [];
export default AssignedJobs;
