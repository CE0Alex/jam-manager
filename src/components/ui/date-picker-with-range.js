"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
export default function DatePickerWithRange({ className, }) {
    const [date, setDate] = React.useState({
        from: new Date(2022, 0, 20),
        to: addDays(new Date(2022, 0, 20), 20),
    });
    return (_jsx("div", { className: cn("grid gap-2", className), children: _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { id: "date", variant: "outline", className: cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground"), children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), date?.from ? (date.to ? (_jsxs(_Fragment, { children: [format(date.from, "LLL dd, y"), " -", " ", format(date.to, "LLL dd, y")] })) : (format(date.from, "LLL dd, y"))) : (_jsx("span", { children: "Pick a date" }))] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: _jsx(Calendar, { initialFocus: true, mode: "range", defaultMonth: date?.from, selected: date, onSelect: setDate, numberOfMonths: 2 }) })] }) }));
}
