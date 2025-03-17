import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
export default function JobCreationForm({ onJobCreated, }) {
    const navigate = useNavigate();
    const { addJob } = useAppContext();
    const [createdJobId, setCreatedJobId] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        client: "",
        description: "",
        status: "pending",
        deadline: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        priority: "medium",
        jobType: "digital_printing",
        fileUrl: "",
        estimatedHours: 1,
        notes: "",
    });
    const [validationErrors, setValidationErrors] = useState({});
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear validation error when field is edited
        if (validationErrors[name]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };
    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear validation error when field is edited
        if (validationErrors[name]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };
    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) {
            errors.title = "Job title is required";
        }
        if (!formData.client.trim()) {
            errors.client = "Client name is required";
        }
        if (!formData.description.trim()) {
            errors.description = "Description is required";
        }
        if (!formData.deadline) {
            errors.deadline = "Deadline is required";
        }
        if (!formData.estimatedHours || formData.estimatedHours <= 0) {
            errors.estimatedHours = "Valid estimated hours are required";
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }
        try {
            const newJob = addJob({
                ...formData,
                estimatedHours: Number(formData.estimatedHours),
            });
            toast({
                title: "Success",
                description: "Job created successfully",
            });
            // Store the created job ID
            if (newJob) {
                setCreatedJobId(newJob.id);
            }
            // Always call onJobCreated if a job was created successfully
            if (newJob && onJobCreated) {
                onJobCreated(newJob);
            }
        }
        catch (error) {
            console.error("Error submitting form:", error);
            toast({
                title: "Error",
                description: "There was a problem creating the job",
                variant: "destructive",
            });
        }
    };
    const handleScheduleJob = () => {
        // Navigate to the interactive scheduler instead of the standalone form
        navigate("/jobs", { state: { activeJob: createdJobId, openScheduler: true } });
    };
    return (_jsx("form", { onSubmit: handleSubmit, noValidate: true, children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Job Details" }), Object.keys(validationErrors).length > 0 && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Please correct the errors below before submitting." })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "title", className: validationErrors.title ? "text-destructive" : "", children: "Invoice Number *" }), _jsx(Input, { id: "title", name: "title", value: formData.title, onChange: handleChange, className: validationErrors.title ? "border-destructive" : "", "aria-invalid": !!validationErrors.title }), validationErrors.title && (_jsx("p", { className: "text-sm text-destructive", children: validationErrors.title }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "client", className: validationErrors.client ? "text-destructive" : "", children: "Client Name *" }), _jsx(Input, { id: "client", name: "client", value: formData.client, onChange: handleChange, className: validationErrors.client ? "border-destructive" : "", "aria-invalid": !!validationErrors.client }), validationErrors.client && (_jsx("p", { className: "text-sm text-destructive", children: validationErrors.client }))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", className: validationErrors.description ? "text-destructive" : "", children: "Description *" }), _jsx(Textarea, { id: "description", name: "description", value: formData.description, onChange: handleChange, rows: 3, className: validationErrors.description ? "border-destructive" : "", "aria-invalid": !!validationErrors.description }), validationErrors.description && (_jsx("p", { className: "text-sm text-destructive", children: validationErrors.description }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "status", children: "Status" }), _jsxs(Select, { value: formData.status, onValueChange: (value) => handleSelectChange("status", value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "in_progress", children: "In Progress" }), _jsx(SelectItem, { value: "review", children: "In Review" }), _jsx(SelectItem, { value: "completed", children: "Completed" }), _jsx(SelectItem, { value: "cancelled", children: "Cancelled" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "priority", children: "Priority" }), _jsxs(Select, { value: formData.priority, onValueChange: (value) => handleSelectChange("priority", value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select priority" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "urgent", children: "Urgent" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "jobType", children: "Job Type" }), _jsxs(Select, { value: formData.jobType, onValueChange: (value) => handleSelectChange("jobType", value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select job type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "embroidery", children: "Embroidery" }), _jsx(SelectItem, { value: "screen_printing", children: "Screen Printing" }), _jsx(SelectItem, { value: "digital_printing", children: "Digital Printing" }), _jsx(SelectItem, { value: "wide_format", children: "Wide Format" }), _jsx(SelectItem, { value: "central_facility", children: "Central Facility" })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "deadline", className: validationErrors.deadline ? "text-destructive" : "", children: "Deadline *" }), _jsx(Input, { id: "deadline", name: "deadline", type: "date", value: formData.deadline, onChange: handleChange, className: validationErrors.deadline ? "border-destructive" : "", "aria-invalid": !!validationErrors.deadline }), validationErrors.deadline && (_jsx("p", { className: "text-sm text-destructive", children: validationErrors.deadline }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "estimatedHours", className: validationErrors.estimatedHours ? "text-destructive" : "", children: "Estimated Hours *" }), _jsx(Input, { id: "estimatedHours", name: "estimatedHours", type: "number", min: "0.5", step: "0.5", value: formData.estimatedHours, onChange: handleChange, className: validationErrors.estimatedHours ? "border-destructive" : "", "aria-invalid": !!validationErrors.estimatedHours }), validationErrors.estimatedHours && (_jsx("p", { className: "text-sm text-destructive", children: validationErrors.estimatedHours }))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "fileUrl", children: "Job Ticket File URL" }), _jsx(Input, { id: "fileUrl", name: "fileUrl", value: formData.fileUrl, onChange: handleChange, placeholder: "https://example.com/files/job-file.pdf" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "notes", children: "Notes" }), _jsx(Textarea, { id: "notes", name: "notes", value: formData.notes, onChange: handleChange, rows: 3, placeholder: "Additional information about the job" })] })] }), _jsx("div", { className: "flex justify-end space-x-4", children: createdJobId ? (_jsxs(_Fragment, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => navigate("/jobs"), children: "View All Jobs" }), _jsx(Button, { type: "button", onClick: handleScheduleJob, children: "Schedule This Job" })] })) : (_jsx(Button, { type: "submit", variant: "default", children: "Create Job" })) })] }) }));
}
