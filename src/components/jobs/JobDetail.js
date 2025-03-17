import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, Clock, Edit, Trash2, FileText, ArrowLeft, } from "lucide-react";
import JobStatusBadge from "./JobStatusBadge";
import JobPriorityBadge from "./JobPriorityBadge";
import JobTypeBadge from "./JobTypeBadge";
import StaffAvatar from "../staff/StaffAvatar";
import { useParams } from "react-router-dom";
export default function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getJobById, deleteJob, staff } = useAppContext();
    const job = getJobById(id || "");
    const [isDeleting, setIsDeleting] = useState(false);
    if (!job) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center h-64", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Job Not Found" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "The job you're looking for doesn't exist or has been deleted." }), _jsxs(Button, { onClick: () => navigate("/jobs"), children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Jobs"] })] }));
    }
    const handleDelete = () => {
        setIsDeleting(true);
        deleteJob(job.id);
        navigate("/jobs");
    };
    const getStaffName = (staffId) => {
        if (!staffId)
            return "Unassigned";
        const staffMember = staff.find((s) => s.id === staffId);
        return staffMember ? staffMember.name : "Unknown";
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: () => navigate("/jobs"), children: _jsx(ArrowLeft, { className: "h-4 w-4" }) }), _jsxs("h2", { className: "text-2xl font-bold", children: ["Invoice: ", job.title] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Button, { variant: "outline", onClick: () => navigate(`/schedule`, {
                                    state: { activeJob: job.id, openScheduler: true }
                                }), children: [_jsx(Calendar, { className: "h-4 w-4 mr-2" }), "Schedule"] }), _jsx(Link, { to: `/jobs/${job.id}/edit`, children: _jsxs(Button, { variant: "outline", children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Edit"] }) }), _jsxs(Button, { variant: "destructive", onClick: () => {
                                    if (confirm("Are you sure you want to delete this job?")) {
                                        handleDelete();
                                    }
                                }, disabled: isDeleting, children: [_jsx(Trash2, { className: "h-4 w-4 mr-2" }), "Delete"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs(Card, { className: "md:col-span-2", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Job Details" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Description" }), _jsx("p", { children: job.description })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Client" }), _jsx("p", { children: job.client })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Assigned To" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(StaffAvatar, { staffId: job.assignedTo, size: "sm" }), _jsx("span", { children: getStaffName(job.assignedTo) })] })] })] }), job.notes && (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Notes" }), _jsx("p", { children: job.notes })] })), job.fileUrl && (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Job Ticket File" }), _jsxs("div", { className: "flex flex-col space-y-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(FileText, { className: "h-4 w-4 mr-2 text-muted-foreground" }), _jsx("a", { href: job.fileUrl, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:underline", children: "View Job Ticket" })] }), job.fileUrl.startsWith("blob:") ? (_jsx("div", { className: "text-xs text-amber-600", children: "Note: This file is stored temporarily. In a production environment, files would be stored permanently in cloud storage." })) : null] })] }))] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Status Information" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Status" }), _jsx(JobStatusBadge, { status: job.status })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Priority" }), _jsx(JobPriorityBadge, { priority: job.priority })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Job Type" }), _jsx(JobTypeBadge, { jobType: job.jobType })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Deadline" }), _jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "h-4 w-4 mr-2 text-muted-foreground" }), _jsx("span", { children: format(new Date(job.deadline), "MMMM d, yyyy") })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Estimated Hours" }), _jsxs("div", { className: "flex items-center", children: [_jsx(Clock, { className: "h-4 w-4 mr-2 text-muted-foreground" }), _jsxs("span", { children: [job.estimatedHours, " hours"] })] })] }), job.actualHours !== undefined && (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Actual Hours" }), _jsxs("div", { className: "flex items-center", children: [_jsx(Clock, { className: "h-4 w-4 mr-2 text-muted-foreground" }), _jsxs("span", { children: [job.actualHours, " hours"] })] })] }))] }), _jsx(CardFooter, { className: "flex flex-col items-start space-y-2", children: _jsxs("div", { className: "text-sm text-muted-foreground", children: [_jsxs("div", { children: ["Created: ", format(new Date(job.createdAt), "MMM d, yyyy")] }), _jsxs("div", { children: ["Last Updated: ", format(new Date(job.updatedAt), "MMM d, yyyy")] })] }) })] })] })] }));
}
