import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import JobsFilter from "./JobsFilter";
import JobsTable from "./JobsTable";
import { Job, JobStatus, JobPriority } from "@/types";
import { useAppContext } from "@/context/AppContext";
import CreateJobDialog from "./CreateJobDialog";

interface JobsViewProps {
  jobs?: Job[];
  onCreateJob?: () => void;
}

const JobsView: React.FC<JobsViewProps> = ({ jobs: propJobs, onCreateJob }) => {
  const navigate = useNavigate();
  const {
    jobs: contextJobs,
    filteredJobs: contextFilteredJobs,
    deleteJob,
    setJobFilters,
  } = useAppContext();
  
  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);

  // Use provided jobs or fall back to context
  const allJobs = propJobs || contextJobs;

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleEditJob = (jobId: string) => {
    navigate(`/jobs/${jobId}/edit`);
  };

  const handleDeleteJob = (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      deleteJob(jobId);
    }
  };

  const handleFilterChange = (filters: {
    status?: JobStatus[];
    priority?: JobPriority[];
    searchTerm?: string;
  }) => {
    setJobFilters(filters);
  };

  const handleCreateJob = () => {
    if (onCreateJob) {
      onCreateJob();
    } else {
      // Instead of navigating, open the dialog
      setDialogOpen(true);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all print jobs in your system
          </p>
        </div>
        {/* Use the Button to trigger the dialog */}
        <Button onClick={handleCreateJob}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Job
        </Button>
      </div>

      <div className="mb-6">
        <JobsFilter onFilterChange={handleFilterChange} />
      </div>

      <JobsTable
        jobs={contextFilteredJobs.length > 0 ? contextFilteredJobs : allJobs}
        onViewJob={handleViewJob}
        onEditJob={handleEditJob}
        onDeleteJob={handleDeleteJob}
        onCreateJob={handleCreateJob}
      />

      {/* Add the CreateJobDialog component */}
      <CreateJobDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default JobsView;
