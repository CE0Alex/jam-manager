import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { useAppContext } from "@/context/AppContext";
import { X, Plus, Pencil, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
export default function JobTypeSettings() {
    const { jobTypes, updateJobTypes } = useAppContext();
    const [newJobType, setNewJobType] = useState("");
    const [newJobTypeId, setNewJobTypeId] = useState("");
    const [newJobTypeDescription, setNewJobTypeDescription] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const handleAddJobType = () => {
        if (!newJobType.trim()) {
            toast({
                title: "Error",
                description: "Job type name cannot be empty",
                variant: "destructive",
            });
            return;
        }
        if (!newJobTypeId.trim()) {
            toast({
                title: "Error",
                description: "Job type ID cannot be empty",
                variant: "destructive",
            });
            return;
        }
        // Validate job type ID - only allow lowercase letters, numbers, and underscores
        const idRegex = /^[a-z0-9_]+$/;
        if (!idRegex.test(newJobTypeId)) {
            toast({
                title: "Error",
                description: "Job type ID can only contain lowercase letters, numbers, and underscores",
                variant: "destructive",
            });
            return;
        }
        // Check if ID already exists
        if (jobTypes.some(jt => jt.id === newJobTypeId)) {
            toast({
                title: "Error",
                description: "Job type ID already exists",
                variant: "destructive",
            });
            return;
        }
        updateJobTypes([
            ...jobTypes,
            {
                id: newJobTypeId,
                name: newJobType,
                description: newJobTypeDescription,
            },
        ]);
        // Reset form
        setNewJobType("");
        setNewJobTypeId("");
        setNewJobTypeDescription("");
        toast({
            title: "Success",
            description: "Job type added successfully",
        });
    };
    const handleRemoveJobType = (id) => {
        // Check if any jobs are using this job type
        // In a real app, you would check this before deleting
        const updatedJobTypes = jobTypes.filter(jt => jt.id !== id);
        updateJobTypes(updatedJobTypes);
        toast({
            title: "Success",
            description: "Job type removed successfully",
        });
    };
    const startEditing = (jobType) => {
        setEditingId(jobType.id);
        setEditName(jobType.name);
        setEditDescription(jobType.description || "");
    };
    const saveEdit = () => {
        if (!editName.trim()) {
            toast({
                title: "Error",
                description: "Job type name cannot be empty",
                variant: "destructive",
            });
            return;
        }
        const updatedJobTypes = jobTypes.map(jt => jt.id === editingId
            ? { ...jt, name: editName, description: editDescription }
            : jt);
        updateJobTypes(updatedJobTypes);
        setEditingId(null);
        toast({
            title: "Success",
            description: "Job type updated successfully",
        });
    };
    const cancelEdit = () => {
        setEditingId(null);
    };
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Job Types" }), _jsx(CardDescription, { children: "Configure the types of jobs handled by your production facility" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "newJobTypeId", children: "Job Type ID" }), _jsx(Input, { id: "newJobTypeId", value: newJobTypeId, onChange: (e) => setNewJobTypeId(e.target.value), placeholder: "e.g. screen_printing" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Lowercase with underscores, no spaces" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "newJobType", children: "Job Type Name" }), _jsx(Input, { id: "newJobType", value: newJobType, onChange: (e) => setNewJobType(e.target.value), placeholder: "e.g. Screen Printing" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "newJobTypeDescription", children: "Description" }), _jsx(Input, { id: "newJobTypeDescription", value: newJobTypeDescription, onChange: (e) => setNewJobTypeDescription(e.target.value), placeholder: "Optional description" })] })] }), _jsxs(Button, { onClick: handleAddJobType, className: "w-full md:w-auto", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Job Type"] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Current Job Types" }), _jsx("div", { className: "border rounded-md", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "ID" }), _jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Description" }), _jsx(TableHead, { className: "w-[100px]", children: "Actions" })] }) }), _jsx(TableBody, { children: jobTypes.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 4, className: "text-center text-muted-foreground py-6", children: "No job types defined yet" }) })) : (jobTypes.map((jobType) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-mono text-sm", children: jobType.id }), _jsx(TableCell, { children: editingId === jobType.id ? (_jsx(Input, { value: editName, onChange: (e) => setEditName(e.target.value) })) : (jobType.name) }), _jsx(TableCell, { children: editingId === jobType.id ? (_jsx(Input, { value: editDescription, onChange: (e) => setEditDescription(e.target.value) })) : (jobType.description || "-") }), _jsx(TableCell, { children: editingId === jobType.id ? (_jsxs("div", { className: "flex space-x-1", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: saveEdit, title: "Save", children: _jsx(Save, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "icon", onClick: cancelEdit, title: "Cancel", children: _jsx(X, { className: "h-4 w-4" }) })] })) : (_jsxs("div", { className: "flex space-x-1", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => startEditing(jobType), title: "Edit", children: _jsx(Pencil, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleRemoveJobType(jobType.id), title: "Remove", children: _jsx(X, { className: "h-4 w-4" }) })] })) })] }, jobType.id)))) })] }) })] })] })] }));
}
