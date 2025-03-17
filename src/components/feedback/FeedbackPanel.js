import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, ListChecks } from "lucide-react";
import FeedbackForm from "./FeedbackForm";
import FeedbackList from "./FeedbackList";
export default function FeedbackPanel() {
    const [activeTab, setActiveTab] = useState("submit");
    const handleSubmitSuccess = () => {
        // Switch to the list tab after successful submission
        setActiveTab("list");
    };
    return (_jsxs(Card, { className: "w-full h-full border-0 rounded-none", children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { children: "Feedback & Bug Reports" }) }), _jsx(CardContent, { children: _jsxs(Tabs, { value: activeTab, onValueChange: (value) => setActiveTab(value), children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2 mb-4", children: [_jsxs(TabsTrigger, { value: "submit", className: "flex items-center gap-2", children: [_jsx(MessageSquare, { className: "h-4 w-4" }), "Submit Feedback"] }), _jsxs(TabsTrigger, { value: "list", className: "flex items-center gap-2", children: [_jsx(ListChecks, { className: "h-4 w-4" }), "View All"] })] }), _jsx(TabsContent, { value: "submit", className: "mt-0", children: _jsx(FeedbackForm, { onSubmitSuccess: handleSubmitSuccess }) }), _jsx(TabsContent, { value: "list", className: "mt-0", children: _jsx(FeedbackList, {}) })] }) })] }));
}
