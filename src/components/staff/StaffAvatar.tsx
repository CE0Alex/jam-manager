import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppContext } from "@/context/AppContext";

interface StaffAvatarProps {
  staffId?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export default function StaffAvatar({
  staffId,
  size = "md",
  showTooltip = true,
}: StaffAvatarProps) {
  const { staff } = useAppContext();
  const staffMember = staffId ? staff.find((s) => s.id === staffId) : undefined;

  // Size classes
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  // Get staff-specific color based on name
  const getStaffColor = (name?: string) => {
    if (!name) return "bg-gray-200 text-gray-800";

    const nameLower = name.toLowerCase();
    if (nameLower.startsWith("mike")) {
      return "bg-blue-200 text-blue-800";
    } else if (nameLower.startsWith("isaac")) {
      return "bg-green-200 text-green-800";
    } else if (nameLower.startsWith("aaron")) {
      return "bg-purple-200 text-purple-800";
    } else if (nameLower.startsWith("jordan")) {
      return "bg-amber-200 text-amber-800";
    } else {
      return "bg-gray-200 text-gray-800";
    }
  };

  // Get first initial from name
  const getInitial = (name?: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const avatar = (
    <Avatar className={sizeClasses[size]}>
      <AvatarFallback className={getStaffColor(staffMember?.name)}>
        {getInitial(staffMember?.name)}
      </AvatarFallback>
    </Avatar>
  );

  if (!showTooltip || !staffMember) {
    return avatar;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{avatar}</TooltipTrigger>
        <TooltipContent>
          <div className="text-sm font-medium">{staffMember.name}</div>
          <div className="text-xs text-muted-foreground">
            {staffMember.role}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
