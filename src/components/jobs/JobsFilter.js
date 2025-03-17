import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Search, Filter, Calendar as CalendarIcon, X, ChevronDown, } from "lucide-react";
import { format } from "date-fns";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem, } from "../ui/dropdown-menu";
import { Calendar } from "../ui/calendar";
const JobsFilter = ({ onFilterChange = () => { } }) => {
    const [filters, setFilters] = useState({
        search: "",
        status: [],
        priority: [],
        dateRange: {
            from: undefined,
            to: undefined,
        },
        client: [],
    });
    const [activeFilters, setActiveFilters] = useState([]);
    // Mock client list for dropdown
    const clientOptions = [
        "Acme Corp",
        "Globex Industries",
        "Wayne Enterprises",
        "Stark Industries",
        "Umbrella Corporation",
    ];
    const handleSearchChange = (e) => {
        const newFilters = { ...filters, search: e.target.value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };
    const handleStatusChange = (status) => {
        let newStatuses;
        if (filters.status.includes(status)) {
            newStatuses = filters.status.filter((s) => s !== status);
        }
        else {
            newStatuses = [...filters.status, status];
        }
        const newFilters = { ...filters, status: newStatuses };
        setFilters(newFilters);
        updateActiveFilters(newFilters);
        onFilterChange(newFilters);
    };
    const handlePriorityChange = (priority) => {
        let newPriorities;
        if (filters.priority.includes(priority)) {
            newPriorities = filters.priority.filter((p) => p !== priority);
        }
        else {
            newPriorities = [...filters.priority, priority];
        }
        const newFilters = { ...filters, priority: newPriorities };
        setFilters(newFilters);
        updateActiveFilters(newFilters);
        onFilterChange(newFilters);
    };
    const handleClientChange = (client) => {
        let newClients;
        if (filters.client.includes(client)) {
            newClients = filters.client.filter((c) => c !== client);
        }
        else {
            newClients = [...filters.client, client];
        }
        const newFilters = { ...filters, client: newClients };
        setFilters(newFilters);
        updateActiveFilters(newFilters);
        onFilterChange(newFilters);
    };
    const handleDateRangeChange = (range) => {
        const newFilters = { ...filters, dateRange: range };
        setFilters(newFilters);
        updateActiveFilters(newFilters);
        onFilterChange(newFilters);
    };
    const updateActiveFilters = (currentFilters) => {
        const active = [];
        if (currentFilters.status.length > 0) {
            active.push("Status");
        }
        if (currentFilters.priority.length > 0) {
            active.push("Priority");
        }
        if (currentFilters.client.length > 0) {
            active.push("Client");
        }
        if (currentFilters.dateRange.from || currentFilters.dateRange.to) {
            active.push("Date");
        }
        setActiveFilters(active);
    };
    const clearFilter = (filterType) => {
        let newFilters = { ...filters };
        switch (filterType) {
            case "Status":
                newFilters.status = [];
                break;
            case "Priority":
                newFilters.priority = [];
                break;
            case "Client":
                newFilters.client = [];
                break;
            case "Date":
                newFilters.dateRange = { from: undefined, to: undefined };
                break;
            default:
                break;
        }
        setFilters(newFilters);
        updateActiveFilters(newFilters);
        onFilterChange(newFilters);
    };
    const clearAllFilters = () => {
        const newFilters = {
            search: "",
            status: [],
            priority: [],
            dateRange: {
                from: undefined,
                to: undefined,
            },
            client: [],
        };
        setFilters(newFilters);
        setActiveFilters([]);
        onFilterChange(newFilters);
    };
    const formatDateRange = () => {
        const { from, to } = filters.dateRange;
        if (from && to) {
            return `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`;
        }
        if (from) {
            return `From ${format(from, "MMM d, yyyy")}`;
        }
        if (to) {
            return `Until ${format(to, "MMM d, yyyy")}`;
        }
        return "Select dates";
    };
    return (_jsx("div", { className: "w-full bg-white p-4 rounded-md shadow-sm border border-gray-200", children: _jsxs("div", { className: "flex flex-col space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", size: 18 }), _jsx(Input, { placeholder: "Search jobs by title, client, or description...", value: filters.search, onChange: handleSearchChange, className: "pl-10 w-full" })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "flex items-center gap-2", children: [_jsx(Filter, { size: 16 }), "Status", _jsx(ChevronDown, { size: 16 })] }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-48", children: [_jsx(DropdownMenuCheckboxItem, { checked: filters.status.includes("pending"), onCheckedChange: () => handleStatusChange("pending"), children: "Pending" }), _jsx(DropdownMenuCheckboxItem, { checked: filters.status.includes("in_progress"), onCheckedChange: () => handleStatusChange("in_progress"), children: "In Progress" }), _jsx(DropdownMenuCheckboxItem, { checked: filters.status.includes("review"), onCheckedChange: () => handleStatusChange("review"), children: "Review" }), _jsx(DropdownMenuCheckboxItem, { checked: filters.status.includes("completed"), onCheckedChange: () => handleStatusChange("completed"), children: "Completed" }), _jsx(DropdownMenuCheckboxItem, { checked: filters.status.includes("cancelled"), onCheckedChange: () => handleStatusChange("cancelled"), children: "Cancelled" })] })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "flex items-center gap-2", children: [_jsx(Filter, { size: 16 }), "Priority", _jsx(ChevronDown, { size: 16 })] }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-48", children: [_jsx(DropdownMenuCheckboxItem, { checked: filters.priority.includes("low"), onCheckedChange: () => handlePriorityChange("low"), children: "Low" }), _jsx(DropdownMenuCheckboxItem, { checked: filters.priority.includes("medium"), onCheckedChange: () => handlePriorityChange("medium"), children: "Medium" }), _jsx(DropdownMenuCheckboxItem, { checked: filters.priority.includes("high"), onCheckedChange: () => handlePriorityChange("high"), children: "High" }), _jsx(DropdownMenuCheckboxItem, { checked: filters.priority.includes("urgent"), onCheckedChange: () => handlePriorityChange("urgent"), children: "Urgent" })] })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "flex items-center gap-2", children: [_jsx(Filter, { size: 16 }), "Client", _jsx(ChevronDown, { size: 16 })] }) }), _jsx(DropdownMenuContent, { align: "end", className: "w-48", children: clientOptions.map((client) => (_jsx(DropdownMenuCheckboxItem, { checked: filters.client.includes(client), onCheckedChange: () => handleClientChange(client), children: client }, client))) })] }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "flex items-center gap-2", children: [_jsx(CalendarIcon, { size: 16 }), formatDateRange()] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "end", children: _jsx(Calendar, { mode: "range", selected: {
                                            from: filters.dateRange.from,
                                            to: filters.dateRange.to,
                                        }, onSelect: handleDateRangeChange, initialFocus: true }) })] })] }), activeFilters.length > 0 && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Active filters:" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [activeFilters.map((filter) => (_jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [filter, _jsx(X, { size: 14, className: "cursor-pointer", onClick: () => clearFilter(filter) })] }, filter))), activeFilters.length > 1 && (_jsx(Button, { variant: "ghost", size: "sm", onClick: clearAllFilters, className: "text-xs h-6", children: "Clear all" }))] })] }))] }) }));
};
export default JobsFilter;
