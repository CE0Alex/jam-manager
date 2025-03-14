import { Badge } from "@/components/ui/badge";
import { JobType } from "@/types";

interface JobTypeBadgeProps {
  jobType: JobType;
}

export default function JobTypeBadge({ jobType }: JobTypeBadgeProps) {
  const getJobTypeDetails = (type: JobType) => {
    switch (type) {
      case "embroidery":
        return {
          label: "Embroidery",
          variant: "outline",
          className:
            "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100",
        };
      case "screen_printing":
        return {
          label: "Screen Printing",
          variant: "outline",
          className:
            "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
        };
      case "digital_printing":
        return {
          label: "Digital Printing",
          variant: "outline",
          className:
            "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
        };
      case "wide_format":
        return {
          label: "Wide Format",
          variant: "outline",
          className:
            "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100",
        };
      case "central_facility":
        return {
          label: "Central Facility",
          variant: "outline",
          className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
        };
      default:
        return { label: "Unknown", variant: "outline", className: "" };
    }
  };

  const { label, variant, className } = getJobTypeDetails(jobType);

  return (
    <Badge variant={variant as any} className={className}>
      {label}
    </Badge>
  );
}
