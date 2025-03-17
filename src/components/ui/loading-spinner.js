import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
export function LoadingSpinner({ size = "default", className, }) {
    const sizeClasses = {
        sm: "h-4 w-4",
        default: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
    };
    return (_jsx(Loader2, { className: cn("animate-spin text-primary", sizeClasses[size], className) }));
}
