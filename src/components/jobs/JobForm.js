import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
export default function JobForm({ job: propJob, isEditing: propIsEditing = false, prefilledData, pdfFile, onJobCreated, }) {
    const { id } = useParams();
    const { getJobById } = useAppContext();
    // If we have an ID from the URL, we're editing
    const isEditing = propIsEditing || !!id;
    const job = propJob || (id ? getJobById(id) : undefined);
    const navigate = useNavigate();
    const { addJob, updateJob, staff } = useAppContext();
    const [formData, setFormData] = useState({
        title: prefilledData?.title || "",
        client: prefilledData?.client || "",
        description: prefilledData?.description || "",
        status: "pending",
        deadline: prefilledData?.deadline || format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        priority: prefilledData?.priority || "medium",
        jobType: prefilledData?.jobType || "digital_printing",
        fileUrl: prefilledData?.fileUrl || "",
        estimatedHours: prefilledData?.estimatedHours || 1,
        notes: prefilledData?.notes || "",
    });
    const [validationErrors, setValidationErrors] = useState({});
    useEffect(() => {
        if (job && isEditing) {
            setFormData({
                title: job.title,
                client: job.client,
                description: job.description,
                status: job.status,
                deadline: job.deadline,
                priority: job.priority,
                jobType: job.jobType,
                fileUrl: job.fileUrl || "",
                estimatedHours: job.estimatedHours,
                notes: job.notes || "",
            });
        }
    }, [job, isEditing]);
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
    const handleSubmit = async (e) => {
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
            // Handle file URL - if it's a blob URL, we need to upload the file to storage
            let permanentFileUrl = formData.fileUrl;
            // If we have an uploaded PDF file from PDF parsing
            if (pdfFile) {
                try {
                    const { uploadFile } = await import("@/lib/storage");
                    const uploadedUrl = await uploadFile(pdfFile);
                    if (uploadedUrl) {
                        console.log("Successfully uploaded PDF to permanent storage");
                        permanentFileUrl = uploadedUrl;
                    }
                    else {
                        console.warn("Failed to upload PDF to permanent storage");
                    }
                }
                catch (uploadError) {
                    console.error("Error uploading PDF file:", uploadError);
                }
            }
            // Handle blob URLs from other sources
            else if (formData.fileUrl && formData.fileUrl.startsWith("blob:")) {
                // This is a temporary blob URL, we need to fetch the file and upload it
                try {
                    const { uploadFile } = await import("@/lib/storage");
                    const response = await fetch(formData.fileUrl);
                    const blob = await response.blob();
                    // Extract filename from the URL or use a default name
                    let filename = "job-file.pdf";
                    try {
                        // Try to get the original filename from the URL
                        const urlParts = new URL(formData.fileUrl).pathname.split("/");
                        const lastPart = urlParts[urlParts.length - 1];
                        if (lastPart && lastPart.includes(".")) {
                            filename = lastPart;
                        }
                    }
                    catch (e) {
                        console.log("Could not parse filename from URL, using default");
                    }
                    const file = new File([blob], filename, {
                        type: blob.type || "application/pdf",
                    });
                    console.log("Attempting to upload blob to permanent storage");
                    const uploadedUrl = await uploadFile(file);
                    if (uploadedUrl) {
                        console.log("Successfully uploaded blob to permanent storage");
                        permanentFileUrl = uploadedUrl;
                    }
                    else {
                        console.warn("Failed to upload to permanent storage, keeping blob URL");
                        // Continue with the blob URL if upload fails
                    }
                }
                catch (uploadError) {
                    console.error("Error uploading file:", uploadError);
                    toast({
                        title: "Upload Error",
                        description: "Failed to upload the file. The job will be created without the file attachment.",
                        variant: "destructive",
                    });
                }
            }
            if (isEditing && job) {
                // Update existing job
                const updatedJob = {
                    ...job,
                    ...formData,
                    fileUrl: permanentFileUrl || job.fileUrl,
                };
                updateJob(updatedJob);
                toast({
                    title: "Success",
                    description: "Job updated successfully",
                });
                navigate(`/jobs/${job.id}`);
            }
            else {
                // Create new job
                const newJob = {
                    ...formData,
                    id: `job-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    fileUrl: permanentFileUrl,
                    jobType: formData.jobType,
                    estimatedHours: Number(formData.estimatedHours),
                };
                addJob(newJob);
                toast({
                    title: "Success",
                    description: "Job created successfully",
                });
                if (onJobCreated) {
                    onJobCreated();
                }
                else {
                    navigate(`/jobs/${newJob.id}`);
                }
            }
        }
        catch (error) {
            console.error("Error submitting form:", error);
            toast({
                title: "Error",
                description: "There was a problem saving the job",
                variant: "destructive",
            });
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "max-h-[70vh] overflow-y-auto pr-2", children: [Object.keys(validationErrors).length > 0 && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Please correct the errors below before submitting." })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "title", className: validationErrors.title ? "text-destructive" : "", children: "Invoice Number *" }), _jsx(Input, { id: "title", name: "title", value: formData.title, onChange: handleChange, className: validationErrors.title ? "border-destructive" : "", "aria-invalid": !!validationErrors.title }), validationErrors.title && (_jsx("p", { className: "text-sm text-destructive", children: validationErrors.title }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "client", className: validationErrors.client ? "text-destructive" : "", children: "Client Name *" }), _jsx(Input, { id: "client", name: "client", value: formData.client, onChange: handleChange, className: validationErrors.client ? "border-destructive" : "", "aria-invalid": !!validationErrors.client }), validationErrors.client && (_jsx("p", { className: "text-sm text-destructive", children: validationErrors.client }))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", className: validationErrors.description ? "text-destructive" : "", children: "Description *" }), _jsx(Textarea, { id: "description", name: "description", value: formData.description, onChange: handleChange, rows: 3, className: validationErrors.description ? "border-destructive" : "", "aria-invalid": !!validationErrors.description }), validationErrors.description && (_jsx("p", { className: "text-sm text-destructive", children: validationErrors.description }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "status", children: "Status" }), _jsxs(Select, { value: formData.status, onValueChange: (value) => handleSelectChange("status", value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "in_progress", children: "In Progress" }), _jsx(SelectItem, { value: "review", children: "In Review" }), _jsx(SelectItem, { value: "completed", children: "Completed" }), _jsx(SelectItem, { value: "cancelled", children: "Cancelled" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "priority", children: "Priority" }), _jsxs(Select, { value: formData.priority, onValueChange: (value) => handleSelectChange("priority", value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select priority" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "urgent", children: "Urgent" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "jobType", children: "Job Type" }), _jsxs(Select, { value: formData.jobType, onValueChange: (value) => handleSelectChange("jobType", value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select job type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "embroidery", children: "Embroidery" }), _jsx(SelectItem, { value: "screen_printing", children: "Screen Printing" }), _jsx(SelectItem, { value: "digital_printing", children: "Digital Printing" }), _jsx(SelectItem, { value: "wide_format", children: "Wide Format" }), _jsx(SelectItem, { value: "central_facility", children: "Central Facility" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "deadline", className: validationErrors.deadline ? "text-destructive" : "", children: "Deadline *" }), _jsx(Input, { id: "deadline", name: "deadline", type: "date", value: formData.deadline, onChange: handleChange, className: validationErrors.deadline ? "border-destructive" : "", "aria-invalid": !!validationErrors.deadline }), validationErrors.deadline && (_jsx("p", { className: "text-sm text-destructive", children: validationErrors.deadline }))] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "assignedTo", children: "Assigned To" }), _jsx("div", { className: "text-sm text-muted-foreground bg-muted p-2 rounded", children: "Jobs will be assigned to staff during scheduling" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "estimatedHours", className: validationErrors.estimatedHours ? "text-destructive" : "", children: "Estimated Hours *" }), _jsx(Input, { id: "estimatedHours", name: "estimatedHours", type: "number", min: "0.5", step: "0.5", value: formData.estimatedHours, onChange: handleChange, className: validationErrors.estimatedHours ? "border-destructive" : "", "aria-invalid": !!validationErrors.estimatedHours }), validationErrors.estimatedHours && (_jsx("p", { className: "text-sm text-destructive", children: validationErrors.estimatedHours }))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "fileUrl", children: "Job Ticket File URL" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { id: "fileUrl", name: "fileUrl", value: formData.fileUrl, onChange: handleChange, placeholder: "https://example.com/files/job-file.pdf" }), formData.fileUrl && (_jsx(Button, { type: "button", variant: "outline", size: "icon", onClick: () => window.open(formData.fileUrl, "_blank"), children: _jsx(Eye, { className: "h-4 w-4" }) }))] }), formData.fileUrl && formData.fileUrl.startsWith("blob:") && (_jsx("p", { className: "text-xs text-amber-600 mt-1", children: "Note: This file is stored temporarily. In a production environment, files would be stored permanently in cloud storage." }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "notes", children: "Notes" }), _jsx(Textarea, { id: "notes", name: "notes", value: formData.notes, onChange: handleChange, rows: 3, placeholder: "Additional information about the job" })] })] }), _jsx("div", { className: "flex justify-end mt-4", children: _jsx(Button, { type: "submit", children: isEditing ? "Update Job" : "Create Job" }) })] }));
}
