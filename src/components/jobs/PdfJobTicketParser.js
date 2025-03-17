import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
const PdfJobTicketParser = ({ data, rawText = '', fileName, fileSize, onDataUpdate }) => {
    const [activeTab, setActiveTab] = useState("auto");
    const [manualData, setManualData] = useState({ ...data });
    // Format file size for display
    const formattedSize = fileSize
        ? fileSize < 1024 * 1024
            ? `${(fileSize / 1024).toFixed(2)} KB`
            : `${(fileSize / 1024 / 1024).toFixed(2)} MB`
        : undefined;
    // Format the deadline for display
    const formattedDeadline = data.deadline
        ? format(new Date(data.deadline), 'PPP')
        : 'Not specified';
    const handleManualUpdate = (field, value) => {
        const updatedData = { ...manualData, [field]: value };
        setManualData(updatedData);
        if (onDataUpdate) {
            onDataUpdate(updatedData);
        }
    };
    const applyManualData = () => {
        if (onDataUpdate) {
            onDataUpdate(manualData);
        }
        setActiveTab("auto");
    };
    return (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { className: "flex flex-row items-center gap-3 pb-2", children: [_jsx(FileText, { className: "h-5 w-5 text-primary" }), _jsxs("div", { className: "flex-1", children: [_jsx(CardTitle, { className: "text-base", children: "Extracted Data from PDF" }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx("span", { children: fileName }), formattedSize && (_jsxs(_Fragment, { children: [_jsx("span", { children: "\u2022" }), _jsx("span", { children: formattedSize })] }))] })] })] }), _jsx(Separator, {}), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2 px-6 pt-2", children: [_jsx(TabsTrigger, { value: "auto", children: "Auto Extracted" }), _jsx(TabsTrigger, { value: "manual", children: "Manual Extract" })] }), _jsx(TabsContent, { value: "auto", className: "pt-2", children: _jsx(CardContent, { className: "pt-4", children: _jsx(ScrollArea, { className: "h-[300px] pr-4", children: _jsxs("div", { className: "space-y-4", children: [data.title && (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold mb-1", children: "Invoice Number" }), _jsx("p", { className: "text-sm text-foreground", children: data.title })] })), data.client && (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold mb-1", children: "Client" }), _jsx("p", { className: "text-sm text-foreground", children: data.client })] })), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold mb-1", children: "Deadline" }), _jsx("p", { className: "text-sm text-foreground", children: formattedDeadline })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold mb-1", children: "Priority" }), _jsx(Badge, { variant: data.priority === 'high' ? 'destructive' :
                                                        data.priority === 'medium' ? 'default' :
                                                            'outline', children: data.priority || 'Medium' })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold mb-1", children: "Estimated Hours" }), _jsxs("p", { className: "text-sm text-foreground", children: [data.estimatedHours || '1', " hours"] })] }), data.description && (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold mb-1", children: "Description" }), _jsx("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap", children: data.description })] })), data.notes && (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold mb-1", children: "Notes" }), _jsx("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap", children: data.notes })] })), Object.entries(data).filter(([key]) => !['title', 'client', 'deadline', 'priority', 'estimatedHours', 'description', 'notes'].includes(key)).map(([key, value]) => (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold mb-1", children: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1') }), _jsx("p", { className: "text-sm text-muted-foreground", children: typeof value === 'string' ? value : JSON.stringify(value) })] }, key)))] }) }) }) }), _jsx(TabsContent, { value: "manual", className: "pt-2", children: _jsxs(CardContent, { className: "pt-4", children: [_jsxs("div", { className: "mb-4 p-2 border border-yellow-200 bg-yellow-50 rounded-md text-yellow-800 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx("p", { className: "text-xs", children: "If automatic extraction didn't work correctly, you can manually enter the correct data here." })] }), _jsxs("div", { className: "space-y-6", children: [rawText && (_jsxs("div", { className: "mb-4", children: [_jsx(Label, { htmlFor: "rawText", children: "Raw Text from PDF" }), _jsx(ScrollArea, { className: "h-[100px] border rounded-md p-2 text-xs font-mono", children: _jsx("pre", { className: "whitespace-pre-wrap", children: rawText }) })] })), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "manual-title", children: "Invoice Number" }), _jsx(Input, { id: "manual-title", value: manualData.title || '', onChange: (e) => handleManualUpdate('title', e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "manual-client", children: "Client" }), _jsx(Input, { id: "manual-client", value: manualData.client || '', onChange: (e) => handleManualUpdate('client', e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "manual-deadline", children: "Deadline" }), _jsx(Input, { id: "manual-deadline", type: "date", value: manualData.deadline?.split('T')[0] || '', onChange: (e) => handleManualUpdate('deadline', e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "manual-hours", children: "Estimated Hours" }), _jsx(Input, { id: "manual-hours", type: "number", min: "0.1", step: "0.1", value: manualData.estimatedHours || 1, onChange: (e) => handleManualUpdate('estimatedHours', parseFloat(e.target.value)) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "manual-description", children: "Description" }), _jsx(Textarea, { id: "manual-description", value: manualData.description || '', onChange: (e) => handleManualUpdate('description', e.target.value), rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "manual-notes", children: "Notes" }), _jsx(Textarea, { id: "manual-notes", value: manualData.notes || '', onChange: (e) => handleManualUpdate('notes', e.target.value), rows: 3 })] })] }), _jsx(Button, { className: "w-full mt-4", onClick: applyManualData, children: "Apply Manual Data" })] })] })] }) })] })] }));
};
export default PdfJobTicketParser;
