import { Link } from "react-router-dom";
import { ScheduleEvent, JobStatus } from "@/types";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import StaffAvatar from "../staff/StaffAvatar";

interface ScheduleEventItemProps {
  event: ScheduleEvent;
  jobTitle: string;
  jobStatus: JobStatus;
  staffName: string;
  compact?: boolean;
}

export default function ScheduleEventItem({
  event,
  jobTitle,
  jobStatus,
  staffName,
  compact = false,
}: ScheduleEventItemProps) {
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);

  const statusColors: Record<JobStatus, string> = {
    pending: "bg-blue-100 border-blue-300 text-blue-800",
    in_progress: "bg-yellow-100 border-yellow-300 text-yellow-800",
    review: "bg-purple-100 border-purple-300 text-purple-800",
    completed: "bg-green-100 border-green-300 text-green-800",
    cancelled: "bg-red-100 border-red-300 text-red-800",
  };

  return (
    <Link to={`/schedule/${event.id}`}>
      <div
        className={`border rounded-md p-2 hover:shadow-md transition-shadow ${statusColors[jobStatus]}`}
      >
        <div className="font-medium truncate">Invoice: {jobTitle}</div>

        {!compact && event.notes && (
          <div className="text-sm truncate mt-1">{event.notes}</div>
        )}

        <div className="flex items-center text-xs mt-1 space-x-2">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
            </span>
          </div>

          {!compact && (
            <div className="flex items-center gap-1">
              <StaffAvatar
                staffId={event.staffId}
                size="sm"
                showTooltip={false}
              />
              <span>{staffName}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
