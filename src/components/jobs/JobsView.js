import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import JobsFilter from "./JobsFilter";
import JobsTable from "./JobsTable";
import { useAppContext } from "@/context/AppContext";
import CreateJobDialog from "./CreateJobDialog";
const JobsView = ({ jobs: propJobs, onCreateJob }) => {
    const navigate = useNavigate();
    const { jobs: contextJobs, filteredJobs: contextFilteredJobs, deleteJob, setJobFilters, } = useAppContext();
    // State for dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    // Use provided jobs or fall back to context
    const allJobs = propJobs || contextJobs;
    const handleViewJob = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };
    const handleEditJob = (jobId) => {
        navigate(`/jobs/${jobId}/edit`);
    };
    const handleDeleteJob = (jobId) => {
        if (window.confirm("Are you sure you want to delete this job?")) {
            deleteJob(jobId);
        }
    };
    const handleFilterChange = (filters) => {
        setJobFilters(filters);
    };
    const handleCreateJob = () => {
        if (onCreateJob) {
            onCreateJob();
        }
        else {
            // Instead of navigating, open the dialog
            setDialogOpen(true);
        }
    };
    return (_jsxs("div", { className: "p-6 bg-gray-50 min-h-screen", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Job Management" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "View and manage all print jobs in your system" })] }), _jsxs(Button, { onClick: handleCreateJob, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create New Job"] })] }), _jsx("div", { className: "mb-6", children: _jsx(JobsFilter, { onFilterChange: handleFilterChange }) }), _jsx(JobsTable, { jobs: contextFilteredJobs.length > 0 ? contextFilteredJobs : allJobs, onViewJob: handleViewJob, onEditJob: handleEditJob, onDeleteJob: handleDeleteJob, onCreateJob: handleCreateJob }), _jsx(CreateJobDialog, { open: dialogOpen, onOpenChange: setDialogOpen })] }));
};
export default JobsView;
