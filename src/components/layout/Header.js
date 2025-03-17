import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
export default function Header({ title, onSearch }) {
    const [searchTerm, setSearchTerm] = useState("");
    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(searchTerm);
        }
    };
    return (_jsxs("header", { className: "bg-background border-b py-3 px-6 flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-bold", children: title }), _jsxs("div", { className: "flex items-center space-x-4", children: [onSearch && (_jsxs("form", { onSubmit: handleSearch, className: "relative", children: [_jsx(Input, { type: "search", placeholder: "Search...", className: "w-64 pl-9", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }), _jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" })] })), _jsx(Button, { variant: "ghost", size: "icon", children: _jsx(Bell, { className: "h-5 w-5" }) }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", className: "rounded-full", children: _jsx(User, { className: "h-5 w-5" }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuLabel, { children: "My Account" }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuItem, { children: "Profile" }), _jsx(DropdownMenuItem, { children: "Settings" }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuItem, { children: "Logout" })] })] })] })] }));
}
