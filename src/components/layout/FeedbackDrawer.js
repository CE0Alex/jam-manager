import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare } from "lucide-react";
import FeedbackPanel from "../feedback/FeedbackPanel";
export default function FeedbackDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    return (_jsxs(Sheet, { open: isOpen, onOpenChange: setIsOpen, children: [_jsx(SheetTrigger, { asChild: true, children: _jsx(Button, { variant: "outline", size: "icon", className: "fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50 bg-primary text-primary-foreground hover:bg-primary/90", children: _jsx(MessageSquare, { className: "h-6 w-6" }) }) }), _jsx(SheetContent, { className: "w-full sm:max-w-md md:max-w-lg overflow-auto", side: "right", children: _jsxs("div", { className: "h-full flex flex-col", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Feedback & Bug Reports" }), _jsx("div", { className: "flex-1 overflow-auto", children: _jsx(FeedbackPanel, {}) })] }) })] }));
}
