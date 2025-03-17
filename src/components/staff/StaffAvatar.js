import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { useAppContext } from "@/context/AppContext";
export default function StaffAvatar({ staffId, size = "md", showTooltip = true, }) {
    const { staff } = useAppContext();
    const staffMember = staffId ? staff.find((s) => s.id === staffId) : undefined;
    // Size classes
    const sizeClasses = {
        sm: "h-6 w-6 text-xs",
        md: "h-8 w-8 text-sm",
        lg: "h-10 w-10 text-base",
    };
    // Get staff-specific color based on name
    const getStaffColor = (name) => {
        if (!name)
            return "bg-gray-200 text-gray-800";
        const nameLower = name.toLowerCase();
        if (nameLower.startsWith("mike")) {
            return "bg-blue-200 text-blue-800";
        }
        else if (nameLower.startsWith("isaac")) {
            return "bg-green-200 text-green-800";
        }
        else if (nameLower.startsWith("aaron")) {
            return "bg-purple-200 text-purple-800";
        }
        else if (nameLower.startsWith("jordan")) {
            return "bg-amber-200 text-amber-800";
        }
        else {
            return "bg-gray-200 text-gray-800";
        }
    };
    // Get first initial from name
    const getInitial = (name) => {
        if (!name)
            return "?";
        return name.charAt(0).toUpperCase();
    };
    const avatar = (_jsx(Avatar, { className: sizeClasses[size], children: _jsx(AvatarFallback, { className: getStaffColor(staffMember?.name), children: getInitial(staffMember?.name) }) }));
    if (!showTooltip || !staffMember) {
        return avatar;
    }
    return (_jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: avatar }), _jsxs(TooltipContent, { children: [_jsx("div", { className: "text-sm font-medium", children: staffMember.name }), _jsx("div", { className: "text-xs text-muted-foreground", children: staffMember.role })] })] }) }));
}
