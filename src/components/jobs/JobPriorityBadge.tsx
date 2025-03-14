import { Badge } from "@/components/ui/badge";
import { JobPriority } from "@/types";

interface JobPriorityBadgeProps {
  priority: JobPriority;
}

export default function JobPriorityBadge({ priority }: JobPriorityBadgeProps) {
  const getPriorityDetails = (priority: JobPriority) => {
    switch (priority) {
      case "low":
        return {
          label: "Low",
          variant: "outline",
          className:
            "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
        };
      case "medium":
        return {
          label: "Medium",
          variant: "outline",
          className:
            "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
        };
      case "high":
        return {
          label: "High",
          variant: "outline",
          className:
            "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
        };
      case "urgent":
        return {
          label: "Urgent",
          variant: "outline",
          className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
        };
      default:
        return { label: "Unknown", variant: "outline", className: "" };
    }
  };

  const { label, variant, className } = getPriorityDetails(priority);

  return (
    <Badge variant={variant as any} className={className}>
      {label}
    </Badge>
  );
}
