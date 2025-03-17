import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import BlockedTimeManager from "./BlockedTimeManager";
const StaffAvailabilityEditor = ({ staffMember, onSave, }) => {
    const [availability, setAvailability] = useState({
        ...staffMember.availability,
    });
    const [availabilityHours, setAvailabilityHours] = useState(staffMember.availabilityHours || {
        monday: { start: "08:00", end: "17:00" },
        tuesday: { start: "08:00", end: "17:00" },
        wednesday: { start: "08:00", end: "17:00" },
        thursday: { start: "08:00", end: "17:00" },
        friday: { start: "08:00", end: "17:00" },
        saturday: { start: "08:00", end: "17:00" },
        sunday: { start: "08:00", end: "17:00" },
    });
    const [blockedTimes, setBlockedTimes] = useState(staffMember.blockedTimes || []);
    const handleAvailabilityChange = (day, checked) => {
        setAvailability({
            ...availability,
            [day]: checked,
        });
    };
    const handleHoursChange = (day, field, value) => {
        setAvailabilityHours({
            ...availabilityHours,
            [day]: {
                ...availabilityHours[day],
                [field]: value,
            },
        });
    };
    const handleUpdateBlockedTimes = (newBlockedTimes) => {
        setBlockedTimes(newBlockedTimes);
    };
    const handleSave = () => {
        const updatedStaff = {
            ...staffMember,
            availability,
            availabilityHours,
            blockedTimes,
        };
        onSave(updatedStaff);
    };
    const days = [
        { key: "monday", label: "Monday" },
        { key: "tuesday", label: "Tuesday" },
        { key: "wednesday", label: "Wednesday" },
        { key: "thursday", label: "Thursday" },
        { key: "friday", label: "Friday" },
        { key: "saturday", label: "Saturday" },
        { key: "sunday", label: "Sunday" },
    ];
    return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { children: ["Availability Settings for ", staffMember.name] }) }), _jsxs(CardContent, { children: [_jsxs(Tabs, { defaultValue: "weekly", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "weekly", children: "Weekly Schedule" }), _jsx(TabsTrigger, { value: "blocked", children: "Blocked Times" })] }), _jsx(TabsContent, { value: "weekly", className: "space-y-4", children: _jsx("div", { className: "grid gap-6", children: days.map((day) => (_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2 w-1/4", children: [_jsx(Checkbox, { id: `${day.key}-available`, checked: availability[day.key], onCheckedChange: (checked) => handleAvailabilityChange(day.key, checked) }), _jsx(Label, { htmlFor: `${day.key}-available`, children: day.label })] }), availability[day.key] && (_jsx("div", { className: "flex items-center space-x-2 w-3/4", children: _jsxs("div", { className: "grid grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: `${day.key}-start`, children: "Start Time" }), _jsxs(Select, { value: availabilityHours[day.key]?.start || "08:00", onValueChange: (value) => handleHoursChange(day.key, "start", value), children: [_jsx(SelectTrigger, { id: `${day.key}-start`, children: _jsx(SelectValue, { placeholder: "Start time" }) }), _jsx(SelectContent, { children: Array.from({ length: 19 }, (_, i) => {
                                                                                const hour = Math.floor(i / 2) + 8;
                                                                                const minute = i % 2 === 0 ? "00" : "30";
                                                                                const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                                                                                const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
                                                                                return (_jsx(SelectItem, { value: time, children: displayTime }, time));
                                                                            }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: `${day.key}-end`, children: "End Time" }), _jsxs(Select, { value: availabilityHours[day.key]?.end || "17:00", onValueChange: (value) => handleHoursChange(day.key, "end", value), children: [_jsx(SelectTrigger, { id: `${day.key}-end`, children: _jsx(SelectValue, { placeholder: "End time" }) }), _jsx(SelectContent, { children: Array.from({ length: 19 }, (_, i) => {
                                                                                const hour = Math.floor(i / 2) + 8;
                                                                                const minute = i % 2 === 0 ? "00" : "30";
                                                                                const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                                                                                const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
                                                                                return (_jsx(SelectItem, { value: time, children: displayTime }, time));
                                                                            }) })] })] })] }) }))] }, day.key))) }) }), _jsx(TabsContent, { value: "blocked", className: "space-y-4", children: _jsx(BlockedTimeManager, { blockedTimes: blockedTimes, onUpdate: handleUpdateBlockedTimes }) })] }), _jsx("div", { className: "mt-6 flex justify-end", children: _jsx(Button, { onClick: handleSave, children: "Save Availability" }) })] })] }));
};
export default StaffAvailabilityEditor;
