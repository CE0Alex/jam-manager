import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Job } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Edit,
  Trash2,
  FileText,
  User,
  ArrowLeft,
} from "lucide-react";
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
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The job you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => navigate("/jobs")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    setIsDeleting(true);
    deleteJob(job.id);
    navigate("/jobs");
  };

  const getStaffName = (staffId?: string) => {
    if (!staffId) return "Unassigned";
    const staffMember = staff.find((s) => s.id === staffId);
    return staffMember ? staffMember.name : "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/jobs")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Invoice: {job.title}</h2>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/schedule/job`, {
              state: { preselectedJobId: job.id }
            })}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Link to={`/jobs/${job.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Are you sure you want to delete this job?")) {
                handleDelete();
              }
            }}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Description
              </h3>
              <p>{job.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Client
                </h3>
                <p>{job.client}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Assigned To
                </h3>
                <div className="flex items-center gap-2">
                  <StaffAvatar staffId={job.assignedTo} size="sm" />
                  <span>{getStaffName(job.assignedTo)}</span>
                </div>
              </div>
            </div>

            {job.notes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Notes
                </h3>
                <p>{job.notes}</p>
              </div>
            )}

            {job.fileUrl && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Job Ticket File
                </h3>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a
                      href={job.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Job Ticket
                    </a>
                  </div>
                  {job.fileUrl.startsWith("blob:") ? (
                    <div className="text-xs text-amber-600">
                      Note: This file is stored temporarily. In a production
                      environment, files would be stored permanently in cloud
                      storage.
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Status
              </h3>
              <JobStatusBadge status={job.status} />
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Priority
              </h3>
              <JobPriorityBadge priority={job.priority} />
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Job Type
              </h3>
              <JobTypeBadge jobType={job.jobType} />
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Deadline
              </h3>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{format(new Date(job.deadline), "MMMM d, yyyy")}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Estimated Hours
              </h3>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{job.estimatedHours} hours</span>
              </div>
            </div>

            {job.actualHours !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Actual Hours
                </h3>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{job.actualHours} hours</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-start space-y-2">
            <div className="text-sm text-muted-foreground">
              <div>
                Created: {format(new Date(job.createdAt), "MMM d, yyyy")}
              </div>
              <div>
                Last Updated: {format(new Date(job.updatedAt), "MMM d, yyyy")}
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
