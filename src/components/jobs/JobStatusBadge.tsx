import { Badge } from "@/components/ui/badge";
import { JobStatus } from "@/types";

interface JobStatusBadgeProps {
  status: JobStatus;
}

export default function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const getStatusDetails = (status: JobStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          variant: "outline",
          className:
            "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
        };
      case "in_progress":
        return {
          label: "In Progress",
          variant: "outline",
          className:
            "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
        };
      case "review":
        return {
          label: "Review",
          variant: "outline",
          className:
            "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100",
        };
      case "completed":
        return {
          label: "Completed",
          variant: "outline",
          className:
            "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          variant: "outline",
          className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
        };
      default:
        return { label: "Unknown", variant: "outline", className: "" };
    }
  };

  const { label, variant, className } = getStatusDetails(status);

  return (
    <Badge variant={variant as any} className={className}>
      {label}
    </Badge>
  );
}
