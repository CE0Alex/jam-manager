import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/components/ui/use-toast";
import { Upload, X } from "lucide-react";
export default function FeedbackForm({ onSubmitSuccess }) {
    const { staff, addFeedback } = useAppContext();
    const [screenshot, setScreenshot] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [formData, setFormData] = useState({
        submitter: "",
        importance: "medium",
        page: "",
        attemptedAction: "",
        actualResult: "",
        expectedResult: "",
        screenshotUrl: "",
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = () => {
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith("image/")) {
                setScreenshot(file);
                // In a real app, we would upload this to storage and get a URL
                // For now, we'll create a temporary object URL
                const screenshotUrl = URL.createObjectURL(file);
                setFormData((prev) => ({ ...prev, screenshotUrl }));
            }
        }
    };
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith("image/")) {
                setScreenshot(file);
                // In a real app, we would upload this to storage and get a URL
                // For now, we'll create a temporary object URL
                const screenshotUrl = URL.createObjectURL(file);
                setFormData((prev) => ({ ...prev, screenshotUrl }));
            }
        }
    };
    const handleRemoveFile = () => {
        if (formData.screenshotUrl) {
            URL.revokeObjectURL(formData.screenshotUrl);
        }
        setScreenshot(null);
        setFormData((prev) => ({ ...prev, screenshotUrl: "" }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.submitter || !formData.page || !formData.attemptedAction) {
            toast({
                title: "Missing information",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }
        try {
            addFeedback({
                ...formData,
                createdAt: new Date().toISOString(),
            });
            toast({
                title: "Feedback submitted",
                description: "Thank you for your feedback",
            });
            // Reset form
            setFormData({
                submitter: "",
                importance: "medium",
                page: "",
                attemptedAction: "",
                actualResult: "",
                expectedResult: "",
                screenshotUrl: "",
            });
            setScreenshot(null);
            if (onSubmitSuccess) {
                onSubmitSuccess();
            }
        }
        catch (error) {
            toast({
                title: "Error",
                description: "There was a problem submitting your feedback",
                variant: "destructive",
            });
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "submitter", children: "Submitted By *" }), _jsxs(Select, { value: formData.submitter, onValueChange: (value) => handleSelectChange("submitter", value), required: true, children: [_jsx(SelectTrigger, { id: "submitter", children: _jsx(SelectValue, { placeholder: "Select staff member" }) }), _jsx(SelectContent, { children: staff.map((member) => (_jsx(SelectItem, { value: member.id, children: member.name }, member.id))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "importance", children: "Importance" }), _jsxs(Select, { value: formData.importance, onValueChange: (value) => handleSelectChange("importance", value), children: [_jsx(SelectTrigger, { id: "importance", children: _jsx(SelectValue, { placeholder: "Select importance" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "critical", children: "Critical" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "page", children: "Page/Section *" }), _jsxs(Select, { value: formData.page, onValueChange: (value) => handleSelectChange("page", value), required: true, children: [_jsx(SelectTrigger, { id: "page", children: _jsx(SelectValue, { placeholder: "Select page or section" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "dashboard", children: "Dashboard" }), _jsx(SelectItem, { value: "jobs", children: "Jobs Management" }), _jsx(SelectItem, { value: "schedule", children: "Production Schedule" }), _jsx(SelectItem, { value: "staff", children: "Staff Management" }), _jsx(SelectItem, { value: "reports", children: "Reports" }), _jsx(SelectItem, { value: "other", children: "Other" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "attemptedAction", children: "What were you trying to do? *" }), _jsx(Textarea, { id: "attemptedAction", name: "attemptedAction", value: formData.attemptedAction, onChange: handleChange, placeholder: "Describe what you were attempting to do", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "actualResult", children: "What happened?" }), _jsx(Textarea, { id: "actualResult", name: "actualResult", value: formData.actualResult, onChange: handleChange, placeholder: "Describe what actually happened" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "expectedResult", children: "What did you expect to happen?" }), _jsx(Textarea, { id: "expectedResult", name: "expectedResult", value: formData.expectedResult, onChange: handleChange, placeholder: "Describe what you expected to happen" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Screenshot (optional)" }), _jsx("div", { className: `border-2 border-dashed rounded-lg p-4 text-center ${isDragging ? "border-primary bg-primary/5" : "border-gray-300"}`, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, children: !screenshot ? (_jsxs("div", { className: "flex flex-col items-center justify-center space-y-2", children: [_jsx(Upload, { className: "h-8 w-8 text-gray-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "Drag and drop your screenshot here" }), _jsx("p", { className: "text-xs text-gray-500", children: "or click to browse files" })] }), _jsx("input", { type: "file", accept: "image/*", className: "hidden", id: "screenshot-upload", onChange: handleFileChange }), _jsx("label", { htmlFor: "screenshot-upload", children: _jsx(Button, { variant: "outline", type: "button", className: "mt-2", size: "sm", children: "Browse Files" }) })] })) : (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded-md", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 bg-primary/10 rounded-md", children: _jsx(Upload, { className: "h-4 w-4 text-primary" }) }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "font-medium text-sm", children: screenshot.name }), _jsxs("p", { className: "text-xs text-gray-500", children: [Math.round(screenshot.size / 1024), " KB"] })] })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: handleRemoveFile, type: "button", children: _jsx(X, { className: "h-4 w-4" }) })] })) }), formData.screenshotUrl && (_jsxs("div", { className: "mt-2", children: [_jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Preview:" }), _jsx("img", { src: formData.screenshotUrl, alt: "Screenshot preview", className: "max-h-40 rounded-md border" })] }))] }), _jsx(Button, { type: "submit", className: "w-full", children: "Submit Feedback" })] }));
}
