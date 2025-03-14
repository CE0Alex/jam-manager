import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { ScheduleEvent } from "@/types";
import { ChevronDown, Trash2, Clock, Calendar } from "lucide-react";

interface BulkScheduleActionsProps {
  selectedEvents: string[];
  onClearSelection: () => void;
  onEventsUpdated?: () => void;
}

export default function BulkScheduleActions({
  selectedEvents,
  onClearSelection,
  onEventsUpdated,
}: BulkScheduleActionsProps) {
  const { schedule, updateScheduleEvent, deleteScheduleEvent } =
    useAppContext();
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  const handleReschedule = () => {
    const { days, hours, minutes } = rescheduleData;
    const totalMinutes = days * 24 * 60 + hours * 60 + minutes;

    if (totalMinutes === 0) {
      toast({
        title: "No time adjustment",
        description: "Please specify a time adjustment for rescheduling",
      });
      return;
    }

    let successCount = 0;
    let failCount = 0;

    selectedEvents.forEach((eventId) => {
      const event = schedule.find((e) => e.id === eventId);
      if (!event) return;

      try {
        const startTime = new Date(event.startTime);
        const endTime = new Date(event.endTime);

        // Add the specified time
        startTime.setMinutes(startTime.getMinutes() + totalMinutes);
        endTime.setMinutes(endTime.getMinutes() + totalMinutes);

        const updatedEvent: ScheduleEvent = {
          ...event,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        };

        updateScheduleEvent(updatedEvent);
        successCount++;
      } catch (error) {
        console.error("Error rescheduling event:", error);
        failCount++;
      }
    });

    setIsRescheduleDialogOpen(false);
    onClearSelection();

    if (onEventsUpdated) {
      onEventsUpdated();
    }

    toast({
      title: "Bulk Reschedule Complete",
      description: `Successfully rescheduled ${successCount} events${failCount > 0 ? `. Failed to reschedule ${failCount} events.` : ""}`,
    });
  };

  const handleDelete = () => {
    let count = 0;

    selectedEvents.forEach((eventId) => {
      try {
        deleteScheduleEvent(eventId);
        count++;
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    });

    setIsDeleteDialogOpen(false);
    onClearSelection();

    if (onEventsUpdated) {
      onEventsUpdated();
    }

    toast({
      title: "Bulk Delete Complete",
      description: `Successfully deleted ${count} events`,
    });
  };

  if (selectedEvents.length === 0) return null;

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">
        {selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}{" "}
        selected
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Actions <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsRescheduleDialogOpen(true)}>
            <Clock className="mr-2 h-4 w-4" />
            Reschedule
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        Cancel
      </Button>

      {/* Reschedule Dialog */}
      <Dialog
        open={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Events</DialogTitle>
            <DialogDescription>
              Adjust the timing for {selectedEvents.length} selected event
              {selectedEvents.length !== 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="days">Days</Label>
              <Input
                id="days"
                type="number"
                value={rescheduleData.days}
                onChange={(e) =>
                  setRescheduleData((prev) => ({
                    ...prev,
                    days: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                value={rescheduleData.hours}
                onChange={(e) =>
                  setRescheduleData((prev) => ({
                    ...prev,
                    hours: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                value={rescheduleData.minutes}
                onChange={(e) =>
                  setRescheduleData((prev) => ({
                    ...prev,
                    minutes: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Enter positive values to move events forward in time, or negative
            values to move them backward.
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRescheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReschedule}>Reschedule Events</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Events</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedEvents.length} selected
              event{selectedEvents.length !== 1 ? "s" : ""}? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Events
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
