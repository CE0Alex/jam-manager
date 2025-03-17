import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { X, AlertCircle, Clock, User, Wrench } from "lucide-react";
export default function ScheduleConflictAlert({ conflicts, onDismiss }) {
    if (conflicts.length === 0)
        return null;
    const getIcon = (type) => {
        switch (type) {
            case "staff":
                return _jsx(User, { className: "h-4 w-4" });
            case "machine":
                return _jsx(Wrench, { className: "h-4 w-4" });
            case "time":
                return _jsx(Clock, { className: "h-4 w-4" });
            default:
                return _jsx(AlertCircle, { className: "h-4 w-4" });
        }
    };
    return (_jsx("div", { className: "space-y-3 my-4", children: conflicts.map((conflict, index) => (_jsxs(Alert, { variant: conflict.severity === "error" ? "destructive" : "default", className: "flex items-start", children: [_jsxs("div", { className: "flex items-start flex-1", children: [_jsx("div", { className: "mr-2", children: getIcon(conflict.type) }), _jsxs("div", { className: "flex-1", children: [_jsxs(AlertTitle, { className: "font-medium text-sm", children: [conflict.type === "staff" && "Staff Conflict", conflict.type === "machine" && "Machine Conflict", conflict.type === "time" && "Time Conflict", conflict.type === "availability" && "Availability Conflict"] }), _jsxs(AlertDescription, { className: "text-sm", children: [conflict.message, conflict.details && (_jsx("div", { className: "mt-1 text-xs opacity-80", children: conflict.details }))] })] })] }), onDismiss && (_jsx("button", { onClick: onDismiss, className: "ml-2 flex-shrink-0 text-sm p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700", children: _jsx(X, { className: "h-4 w-4" }) }))] }, index))) }));
}
