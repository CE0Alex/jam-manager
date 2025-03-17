import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Search, ChevronDown, ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
export default function FeedbackList() {
    const { feedback, staff } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [importanceFilter, setImportanceFilter] = useState(null);
    const [pageFilter, setPageFilter] = useState(null);
    const getStaffName = (staffId) => {
        const staffMember = staff.find((s) => s.id === staffId);
        return staffMember ? staffMember.name : "Unknown";
    };
    const getImportanceBadge = (importance) => {
        switch (importance) {
            case "low":
                return _jsx(Badge, { variant: "outline", children: "Low" });
            case "medium":
                return _jsx(Badge, { variant: "secondary", children: "Medium" });
            case "high":
                return _jsx(Badge, { variant: "default", children: "High" });
            case "critical":
                return _jsx(Badge, { variant: "destructive", children: "Critical" });
            default:
                return _jsx(Badge, { variant: "outline", children: "Unknown" });
        }
    };
    const filteredFeedback = feedback
        .filter((item) => {
        // Search term filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (item.attemptedAction.toLowerCase().includes(searchLower) ||
                item.actualResult.toLowerCase().includes(searchLower) ||
                item.expectedResult.toLowerCase().includes(searchLower));
        }
        return true;
    })
        .filter((item) => {
        // Importance filter
        if (importanceFilter) {
            return item.importance === importanceFilter;
        }
        return true;
    })
        .filter((item) => {
        // Page filter
        if (pageFilter) {
            return item.page === pageFilter;
        }
        return true;
    })
        // Sort by date (newest first)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const resetFilters = () => {
        setSearchTerm("");
        setImportanceFilter(null);
        setPageFilter(null);
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", size: 16 }), _jsx(Input, { placeholder: "Search feedback...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-9" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Select, { value: importanceFilter || "all", onValueChange: (value) => setImportanceFilter(value === "all" ? null : value), children: [_jsx(SelectTrigger, { className: "w-[130px]", children: _jsx(SelectValue, { placeholder: "Importance" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Importance" }), _jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "critical", children: "Critical" })] })] }), _jsxs(Select, { value: pageFilter || "all", onValueChange: (value) => setPageFilter(value === "all" ? null : value), children: [_jsx(SelectTrigger, { className: "w-[130px]", children: _jsx(SelectValue, { placeholder: "Page" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Pages" }), _jsx(SelectItem, { value: "dashboard", children: "Dashboard" }), _jsx(SelectItem, { value: "jobs", children: "Jobs" }), _jsx(SelectItem, { value: "schedule", children: "Schedule" }), _jsx(SelectItem, { value: "staff", children: "Staff" }), _jsx(SelectItem, { value: "reports", children: "Reports" }), _jsx(SelectItem, { value: "other", children: "Other" })] })] }), (searchTerm || importanceFilter || pageFilter) && (_jsx(Button, { variant: "ghost", onClick: resetFilters, size: "icon", children: _jsx(ChevronDown, { className: "h-4 w-4" }) }))] })] }), filteredFeedback.length === 0 ? (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No feedback found" })) : (_jsx(Accordion, { type: "multiple", className: "space-y-2", children: filteredFeedback.map((item, index) => (_jsxs(AccordionItem, { value: `item-${index}`, className: "border rounded-lg overflow-hidden", children: [_jsx(AccordionTrigger, { className: "px-4 py-3 hover:bg-muted/50", children: _jsxs("div", { className: "flex flex-1 justify-between items-center", children: [_jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium truncate max-w-md", children: item.attemptedAction }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [format(new Date(item.createdAt), "MMM d, yyyy h:mm a"), " \u2022", " ", getStaffName(item.submitter)] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", children: item.page }), getImportanceBadge(item.importance)] })] }) }), _jsx(AccordionContent, { className: "px-4 py-3 bg-muted/20", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-1", children: "What happened:" }), _jsx("p", { className: "text-sm", children: item.actualResult || "Not specified" })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-1", children: "Expected behavior:" }), _jsx("p", { className: "text-sm", children: item.expectedResult || "Not specified" })] }), item.screenshotUrl && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-1", children: "Screenshot:" }), _jsxs("div", { className: "relative", children: [_jsx("img", { src: item.screenshotUrl, alt: "Feedback screenshot", className: "max-h-60 rounded-md border" }), _jsx("a", { href: item.screenshotUrl, target: "_blank", rel: "noopener noreferrer", className: "absolute top-2 right-2 bg-background/80 p-1 rounded-md hover:bg-background", children: _jsx(ExternalLink, { className: "h-4 w-4" }) })] })] }))] }) })] }, index))) }))] }));
}
