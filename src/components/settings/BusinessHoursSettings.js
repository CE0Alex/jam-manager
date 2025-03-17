import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Plus, X } from "lucide-react";
import { formatTime12Hour } from "@/lib/timeUtils";
import { format } from "date-fns";
export default function BusinessHoursSettings() {
    const { settings, updateBusinessHours, applyDefaultAvailabilityToStaff } = useAppContext();
    // Initialize with default weekly hours (8am-5pm for weekdays, closed weekends)
    const [businessHours, setBusinessHours] = useState({
        monday: { start: settings.businessHours.start, end: settings.businessHours.end, isOpen: true },
        tuesday: { start: settings.businessHours.start, end: settings.businessHours.end, isOpen: true },
        wednesday: { start: settings.businessHours.start, end: settings.businessHours.end, isOpen: true },
        thursday: { start: settings.businessHours.start, end: settings.businessHours.end, isOpen: true },
        friday: { start: settings.businessHours.start, end: settings.businessHours.end, isOpen: true },
        saturday: { start: "09:00", end: "13:00", isOpen: false },
        sunday: { start: "09:00", end: "13:00", isOpen: false },
        holidays: []
    });
    const [activeTab, setActiveTab] = useState("general");
    const [applyToAll, setApplyToAll] = useState(false);
    const [newHolidayDate, setNewHolidayDate] = useState(undefined);
    const [newHolidayName, setNewHolidayName] = useState("");
    // Generate time options for 12-hour format
    const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
        const hour = Math.floor(i / 2);
        const minute = i % 2 === 0 ? "00" : "30";
        const time24h = `${hour.toString().padStart(2, "0")}:${minute}`;
        return {
            value: time24h,
            label: formatTime12Hour(time24h)
        };
    });
    const handleDailyHoursChange = (day, field, value) => {
        setBusinessHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }));
    };
    const handleAddHoliday = () => {
        if (!newHolidayDate || !newHolidayName.trim()) {
            toast({
                title: "Missing Information",
                description: "Please provide both a date and name for the holiday.",
                variant: "destructive"
            });
            return;
        }
        const formattedDate = format(newHolidayDate, "yyyy-MM-dd");
        setBusinessHours(prev => ({
            ...prev,
            holidays: [
                ...prev.holidays,
                { date: formattedDate, name: newHolidayName.trim() }
            ]
        }));
        // Reset form
        setNewHolidayDate(undefined);
        setNewHolidayName("");
    };
    const handleRemoveHoliday = (index) => {
        setBusinessHours(prev => ({
            ...prev,
            holidays: prev.holidays.filter((_, i) => i !== index)
        }));
    };
    const handleSave = () => {
        // For compatibility with existing system, use Monday's hours as the default
        updateBusinessHours({
            start: businessHours.monday.start,
            end: businessHours.monday.end,
            // Store the complete weekly schedule in a new field
            weeklySchedule: {
                monday: businessHours.monday,
                tuesday: businessHours.tuesday,
                wednesday: businessHours.wednesday,
                thursday: businessHours.thursday,
                friday: businessHours.friday,
                saturday: businessHours.saturday,
                sunday: businessHours.sunday
            },
            holidays: businessHours.holidays
        });
        if (applyToAll) {
            applyDefaultAvailabilityToStaff();
        }
        toast({
            title: "Settings Saved",
            description: "Business hours have been updated successfully."
        });
    };
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Business Hours" }), _jsx(CardDescription, { children: "Set the default business hours for your company. These hours will be used as defaults for staff availability." })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "general", children: "General Hours" }), _jsx(TabsTrigger, { value: "holidays", children: "Holidays & Closures" })] }), _jsxs(TabsContent, { value: "general", className: "space-y-6 mt-4", children: [_jsx("div", { className: "space-y-4", children: Object.entries(businessHours)
                                        .filter(([key]) => key !== 'holidays')
                                        .map(([day, hours]) => (_jsxs("div", { className: "flex items-center space-x-4 p-2 border rounded-md", children: [_jsxs("div", { className: "flex items-center w-20", children: [_jsx(Switch, { id: `${day}-active`, checked: hours.isOpen, onCheckedChange: (checked) => handleDailyHoursChange(day, 'isOpen', checked) }), _jsx(Label, { htmlFor: `${day}-active`, className: "ml-2 capitalize", children: day })] }), hours.isOpen ? (_jsxs("div", { className: "flex flex-1 items-center space-x-2", children: [_jsxs(Select, { value: hours.start, onValueChange: (value) => handleDailyHoursChange(day, 'start', value), disabled: !hours.isOpen, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: timeOptions.map((time) => (_jsx(SelectItem, { value: time.value, children: time.label }, `${day}-start-${time.value}`))) })] }), _jsx("span", { children: "to" }), _jsxs(Select, { value: hours.end, onValueChange: (value) => handleDailyHoursChange(day, 'end', value), disabled: !hours.isOpen, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: timeOptions.map((time) => (_jsx(SelectItem, { value: time.value, children: time.label }, `${day}-end-${time.value}`))) })] })] })) : (_jsx("div", { className: "text-muted-foreground", children: "Closed" }))] }, day))) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "applyToAll", checked: applyToAll, onCheckedChange: setApplyToAll }), _jsx(Label, { htmlFor: "applyToAll", children: "Apply these hours to all staff availability" })] })] }), _jsx(TabsContent, { value: "holidays", className: "space-y-6 mt-4", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx("h3", { className: "text-sm font-medium", children: "Holidays & Special Closures" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Add dates when your business will be closed for holidays or special events." })] }), businessHours.holidays.length > 0 ? (_jsx("div", { className: "space-y-2", children: businessHours.holidays.map((holiday, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded-md", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: holiday.name }), _jsxs("span", { className: "text-muted-foreground ml-2", children: ["(", format(new Date(holiday.date), "MMMM d, yyyy"), ")"] })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleRemoveHoliday(index), children: _jsx(X, { className: "h-4 w-4" }) })] }, index))) })) : (_jsx("div", { className: "text-center py-6 text-muted-foreground", children: "No holidays or closures added yet" })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-md p-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "holiday-date", children: "Date" }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "w-full justify-start text-left font-normal mt-1", children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), newHolidayDate ? (format(newHolidayDate, "MMMM d, yyyy")) : (_jsx("span", { children: "Select date" }))] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: _jsx(Calendar, { mode: "single", selected: newHolidayDate, onSelect: setNewHolidayDate, initialFocus: true }) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "holiday-name", children: "Description" }), _jsx(Input, { id: "holiday-name", placeholder: "e.g. Christmas Day", value: newHolidayName, onChange: (e) => setNewHolidayName(e.target.value), className: "mt-1" })] }), _jsx("div", { className: "flex items-end", children: _jsxs(Button, { className: "w-full", onClick: handleAddHoliday, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Add Holiday"] }) })] })] }) })] }) }), _jsx(CardFooter, { children: _jsx(Button, { onClick: handleSave, children: "Save Changes" }) })] }));
}
