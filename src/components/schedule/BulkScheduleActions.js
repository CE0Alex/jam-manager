import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { ChevronDown, Trash2, Clock } from "lucide-react";
export default function BulkScheduleActions({ selectedEvents, onClearSelection, onEventsUpdated, }) {
    const { schedule, updateScheduleEvent, deleteScheduleEvent } = useAppContext();
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
            if (!event)
                return;
            try {
                const startTime = new Date(event.startTime);
                const endTime = new Date(event.endTime);
                // Add the specified time
                startTime.setMinutes(startTime.getMinutes() + totalMinutes);
                endTime.setMinutes(endTime.getMinutes() + totalMinutes);
                const updatedEvent = {
                    ...event,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                };
                updateScheduleEvent(updatedEvent);
                successCount++;
            }
            catch (error) {
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
            }
            catch (error) {
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
    if (selectedEvents.length === 0)
        return null;
    return (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-sm font-medium", children: [selectedEvents.length, " event", selectedEvents.length !== 1 ? "s" : "", " ", "selected"] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: ["Actions ", _jsx(ChevronDown, { className: "ml-2 h-4 w-4" })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsxs(DropdownMenuItem, { onClick: () => setIsRescheduleDialogOpen(true), children: [_jsx(Clock, { className: "mr-2 h-4 w-4" }), "Reschedule"] }), _jsxs(DropdownMenuItem, { onClick: () => setIsDeleteDialogOpen(true), children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Delete"] })] })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClearSelection, children: "Cancel" }), _jsx(Dialog, { open: isRescheduleDialogOpen, onOpenChange: setIsRescheduleDialogOpen, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Reschedule Events" }), _jsxs(DialogDescription, { children: ["Adjust the timing for ", selectedEvents.length, " selected event", selectedEvents.length !== 1 ? "s" : ""] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "days", children: "Days" }), _jsx(Input, { id: "days", type: "number", value: rescheduleData.days, onChange: (e) => setRescheduleData((prev) => ({
                                                ...prev,
                                                days: parseInt(e.target.value) || 0,
                                            })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "hours", children: "Hours" }), _jsx(Input, { id: "hours", type: "number", value: rescheduleData.hours, onChange: (e) => setRescheduleData((prev) => ({
                                                ...prev,
                                                hours: parseInt(e.target.value) || 0,
                                            })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "minutes", children: "Minutes" }), _jsx(Input, { id: "minutes", type: "number", value: rescheduleData.minutes, onChange: (e) => setRescheduleData((prev) => ({
                                                ...prev,
                                                minutes: parseInt(e.target.value) || 0,
                                            })) })] })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Enter positive values to move events forward in time, or negative values to move them backward." }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsRescheduleDialogOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleReschedule, children: "Reschedule Events" })] })] }) }), _jsx(Dialog, { open: isDeleteDialogOpen, onOpenChange: setIsDeleteDialogOpen, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Delete Events" }), _jsxs(DialogDescription, { children: ["Are you sure you want to delete ", selectedEvents.length, " selected event", selectedEvents.length !== 1 ? "s" : "", "? This action cannot be undone."] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsDeleteDialogOpen(false), children: "Cancel" }), _jsx(Button, { variant: "destructive", onClick: handleDelete, children: "Delete Events" })] })] }) })] }));
}
