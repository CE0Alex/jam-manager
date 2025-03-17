import { jsx as _jsx } from "react/jsx-runtime";
import { Badge } from "@/components/ui/badge";
export default function JobStatusBadge({ status }) {
    const getStatusDetails = (status) => {
        switch (status) {
            case "pending":
                return {
                    label: "Pending",
                    variant: "outline",
                    className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
                };
            case "in_progress":
                return {
                    label: "In Progress",
                    variant: "outline",
                    className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
                };
            case "review":
                return {
                    label: "Review",
                    variant: "outline",
                    className: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100",
                };
            case "completed":
                return {
                    label: "Completed",
                    variant: "outline",
                    className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
                };
            case "cancelled":
                return {
                    label: "Cancelled",
                    variant: "outline",
                    className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
                };
            case "archived":
                return {
                    label: "Archived",
                    variant: "outline",
                    className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
                };
            default:
                return { label: "Unknown", variant: "outline", className: "" };
        }
    };
    const { label, variant, className } = getStatusDetails(status);
    return (_jsx(Badge, { variant: variant, className: className, children: label }));
}
