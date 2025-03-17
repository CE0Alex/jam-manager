import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppContext } from "@/context/AppContext";
const StaffList = ({ staffMembers = [], onSelectStaff = () => { }, selectedStaffId, }) => {
    const { staff } = useAppContext();
    const [searchQuery, setSearchQuery] = useState("");
    // Use provided staff members or fall back to context
    const allStaff = staffMembers.length > 0 ? staffMembers : staff;
    const filteredStaff = allStaff.filter((staff) => staff.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return (_jsx(Card, { className: "h-full w-full bg-white", children: _jsxs(CardContent, { className: "p-4 flex flex-col h-full", children: [_jsxs("div", { className: "relative mb-4", children: [_jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search staff...", className: "pl-9", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsx(ScrollArea, { className: "flex-1", children: _jsxs("div", { className: "space-y-2", children: [filteredStaff.map((staff) => (_jsxs("div", { className: `p-3 rounded-md cursor-pointer transition-colors ${selectedStaffId === staff.id ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-muted"}`, onClick: () => onSelectStaff(staff.id), children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Avatar, { children: [_jsx(AvatarImage, { src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.id}` }), _jsx(AvatarFallback, { children: staff.name.substring(0, 2).toUpperCase() })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "font-medium truncate", children: staff.name }), _jsx("div", { className: "text-sm text-muted-foreground truncate", children: staff.role })] })] }), _jsxs("div", { className: "mt-2 flex flex-wrap gap-1", children: [staff.skills.slice(0, 3).map((skill, index) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: skill }, index))), staff.skills.length > 3 && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: ["+", staff.skills.length - 3] }))] }), _jsxs("div", { className: "mt-2 text-xs text-muted-foreground", children: [staff.assignedJobs.length, " assigned job", staff.assignedJobs.length !== 1 ? "s" : ""] })] }, staff.id))), filteredStaff.length === 0 && (_jsx("div", { className: "py-8 text-center text-muted-foreground", children: "No staff members found" }))] }) })] }) }));
};
export default StaffList;
