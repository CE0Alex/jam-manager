import React from "react";
import { ScheduleConflict } from "@/lib/scheduling";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { X, AlertCircle, Clock, User, Wrench } from "lucide-react";

interface ScheduleConflictAlertProps {
  conflicts: ScheduleConflict[];
  onDismiss?: () => void;
}

export default function ScheduleConflictAlert({ 
  conflicts, 
  onDismiss 
}: ScheduleConflictAlertProps) {
  if (conflicts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "staff":
        return <User className="h-4 w-4" />;
      case "machine":
        return <Wrench className="h-4 w-4" />;
      case "time":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-3 my-4">
      {conflicts.map((conflict, index) => (
        <Alert 
          key={index} 
          variant={conflict.severity === "error" ? "destructive" : "default"}
          className="flex items-start"
        >
          <div className="flex items-start flex-1">
            <div className="mr-2">
              {getIcon(conflict.type)}
            </div>
            <div className="flex-1">
              <AlertTitle className="font-medium text-sm">
                {conflict.type === "staff" && "Staff Conflict"}
                {conflict.type === "machine" && "Machine Conflict"}
                {conflict.type === "time" && "Time Conflict"}
                {conflict.type === "availability" && "Availability Conflict"}
              </AlertTitle>
              <AlertDescription className="text-sm">
                {conflict.message}
                {conflict.details && (
                  <div className="mt-1 text-xs opacity-80">{conflict.details}</div>
                )}
              </AlertDescription>
            </div>
          </div>
          {onDismiss && (
            <button 
              onClick={onDismiss} 
              className="ml-2 flex-shrink-0 text-sm p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </Alert>
      ))}
    </div>
  );
}
