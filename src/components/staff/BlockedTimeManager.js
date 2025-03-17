import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
export default function BlockedTimeManager({ blockedTimes = [], onUpdate, }) {
    const [newBlockedTime, setNewBlockedTime] = useState({
        date: format(new Date(), "yyyy-MM-dd"),
        start: "09:00",
        end: "17:00",
        reason: "",
    });
    const handleAddBlockedTime = () => {
        if (!newBlockedTime.date || !newBlockedTime.start || !newBlockedTime.end) {
            return;
        }
        onUpdate([...blockedTimes, newBlockedTime]);
        // Reset form
        setNewBlockedTime({
            date: format(new Date(), "yyyy-MM-dd"),
            start: "09:00",
            end: "17:00",
            reason: "",
        });
    };
    const handleRemoveBlockedTime = (index) => {
        const updatedBlockedTimes = [...blockedTimes];
        updatedBlockedTimes.splice(index, 1);
        onUpdate(updatedBlockedTimes);
    };
    const handleDateSelect = (date) => {
        if (date) {
            setNewBlockedTime({
                ...newBlockedTime,
                date: format(date, "yyyy-MM-dd"),
            });
        }
    };
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Manage Blocked Time" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "blocked-date", children: "Date" }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn("w-full justify-start text-left font-normal", !newBlockedTime.date && "text-muted-foreground"), children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), newBlockedTime.date
                                                            ? format(new Date(newBlockedTime.date), "PPP")
                                                            : "Select date"] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: _jsx(Calendar, { mode: "single", selected: new Date(newBlockedTime.date), onSelect: handleDateSelect, initialFocus: true }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "blocked-start", children: "Start Time" }), _jsxs(Select, { value: newBlockedTime.start, onValueChange: (value) => setNewBlockedTime({
                                            ...newBlockedTime,
                                            start: value,
                                        }), children: [_jsx(SelectTrigger, { id: "blocked-start", children: _jsx(SelectValue, { placeholder: "Start time" }) }), _jsx(SelectContent, { children: Array.from({ length: 19 }, (_, i) => {
                                                    const hour = Math.floor(i / 2) + 8;
                                                    const minute = i % 2 === 0 ? "00" : "30";
                                                    const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                                                    const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
                                                    return (_jsx(SelectItem, { value: time, children: displayTime }, time));
                                                }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "blocked-end", children: "End Time" }), _jsxs(Select, { value: newBlockedTime.end, onValueChange: (value) => setNewBlockedTime({
                                            ...newBlockedTime,
                                            end: value,
                                        }), children: [_jsx(SelectTrigger, { id: "blocked-end", children: _jsx(SelectValue, { placeholder: "End time" }) }), _jsx(SelectContent, { children: Array.from({ length: 19 }, (_, i) => {
                                                    const hour = Math.floor(i / 2) + 8;
                                                    const minute = i % 2 === 0 ? "00" : "30";
                                                    const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                                                    const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
                                                    return (_jsx(SelectItem, { value: time, children: displayTime }, time));
                                                }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "blocked-reason", children: "Reason (Optional)" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { id: "blocked-reason", value: newBlockedTime.reason, onChange: (e) => setNewBlockedTime({
                                                    ...newBlockedTime,
                                                    reason: e.target.value,
                                                }) }), _jsx(Button, { type: "button", onClick: handleAddBlockedTime, size: "icon", children: _jsx(Plus, { className: "h-4 w-4" }) })] })] })] }), _jsx("div", { className: "border rounded-md", children: blockedTimes.length === 0 ? (_jsx("div", { className: "p-4 text-center text-muted-foreground", children: "No blocked times added yet" })) : (_jsx("div", { className: "divide-y", children: blockedTimes.map((blockedTime, index) => (_jsxs("div", { className: "p-4 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: format(new Date(blockedTime.date), "PPP") }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [blockedTime.start, " - ", blockedTime.end, blockedTime.reason && `: ${blockedTime.reason}`] })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleRemoveBlockedTime(index), children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, index))) })) })] })] }));
}
