import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Job } from "@/types";
import JobStatusBadge from "./JobStatusBadge";
import JobPriorityBadge from "./JobPriorityBadge";
import JobTypeBadge from "./JobTypeBadge";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, MoreHorizontal, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import StaffAvatar from "../staff/StaffAvatar";

interface JobsTableProps {
  jobs?: Job[];
  onViewJob?: (jobId: string) => void;
  onEditJob?: (jobId: string) => void;
  onDeleteJob?: (jobId: string) => void;
  onAssignJob?: (jobId: string) => void;
  onCreateJob?: () => void;
}

type SortField =
  | "title"
  | "client"
  | "deadline"
  | "status"
  | "priority"
  | "jobType";
type SortDirection = "asc" | "desc";

const JobsTable = ({
  jobs = [],
  onViewJob = () => {},
  onEditJob = () => {},
  onDeleteJob = () => {},
  onAssignJob = () => {},
  onCreateJob,
}: JobsTableProps) => {
  const navigate = useNavigate();
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("deadline");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
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
        return (
          (new Date(a.deadline).getTime() - new Date(b.deadline).getTime()) *
          direction
        );
      case "status":
        return a.status.localeCompare(b.status) * direction;
      case "priority":
        const priorityOrder = { low: 0, medium: 1, high: 2, urgent: 3 };
        return (
          (priorityOrder[a.priority as keyof typeof priorityOrder] -
            priorityOrder[b.priority as keyof typeof priorityOrder]) *
          direction
        );
      case "jobType":
        return a.jobType.localeCompare(b.jobType) * direction;
      default:
        return 0;
    }
  });

  const toggleSelectAll = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.map((job) => job.id));
    }
  };

  const toggleSelectJob = (jobId: string) => {
    if (selectedJobs.includes(jobId)) {
      setSelectedJobs(selectedJobs.filter((id) => id !== jobId));
    } else {
      setSelectedJobs([...selectedJobs, jobId]);
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const handleCreateJob = () => {
    if (onCreateJob) {
      onCreateJob();
    } else {
      navigate("/jobs/new");
    }
    console.log("Create job button clicked");
  };

  return (
    <div className="w-full bg-white rounded-md border">
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground mb-4">
            No jobs found. Create a new job to get started.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedJobs.length === jobs.length && jobs.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all jobs"
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center">
                  Invoice Number {renderSortIcon("title")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("client")}
              >
                <div className="flex items-center">
                  Client {renderSortIcon("client")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("deadline")}
              >
                <div className="flex items-center">
                  Deadline {renderSortIcon("deadline")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  Status {renderSortIcon("status")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center">
                  Priority {renderSortIcon("priority")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("jobType")}
              >
                <div className="flex items-center">
                  Job Type {renderSortIcon("jobType")}
                </div>
              </TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedJobs.includes(job.id)}
                    onCheckedChange={() => toggleSelectJob(job.id)}
                    aria-label={`Select job ${job.title}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.client}</TableCell>
                <TableCell>
                  {format(new Date(job.deadline), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <JobStatusBadge status={job.status} />
                </TableCell>
                <TableCell>
                  <JobPriorityBadge priority={job.priority} />
                </TableCell>
                <TableCell>
                  <JobTypeBadge jobType={job.jobType} />
                </TableCell>
                <TableCell>
                  <StaffAvatar staffId={job.assignedTo} size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewJob(job.id)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditJob(job.id)}>
                        Edit Job
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAssignJob(job.id)}>
                        Assign Staff
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDeleteJob(job.id)}
                      >
                        Delete Job
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default JobsTable;
