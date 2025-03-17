import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
export default function StaffForm({ staffMember, isEditing = false, }) {
    const navigate = useNavigate();
    const { addStaffMember, updateStaffMember, settings, applyDefaultAvailabilityToStaff, jobTypes } = useAppContext();
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        email: "",
        phone: "",
        skills: [],
        newSkill: "",
        jobTypeCapabilities: [],
        availability: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
        },
        availabilityHours: {
            monday: { start: settings.businessHours.start, end: settings.businessHours.end },
            tuesday: { start: settings.businessHours.start, end: settings.businessHours.end },
            wednesday: { start: settings.businessHours.start, end: settings.businessHours.end },
            thursday: { start: settings.businessHours.start, end: settings.businessHours.end },
            friday: { start: settings.businessHours.start, end: settings.businessHours.end },
            saturday: { start: settings.businessHours.start, end: settings.businessHours.end },
            sunday: { start: settings.businessHours.start, end: settings.businessHours.end },
        },
    });
    const [validationErrors, setValidationErrors] = useState({});
    useEffect(() => {
        if (staffMember && isEditing) {
            setFormData({
                name: staffMember.name,
                role: staffMember.role,
                email: staffMember.email,
                phone: staffMember.phone || "",
                skills: [...staffMember.skills],
                newSkill: "",
                jobTypeCapabilities: staffMember.jobTypeCapabilities || [],
                availability: { ...staffMember.availability },
                availabilityHours: staffMember.availabilityHours || {
                    monday: { start: settings.businessHours.start, end: settings.businessHours.end },
                    tuesday: { start: settings.businessHours.start, end: settings.businessHours.end },
                    wednesday: { start: settings.businessHours.start, end: settings.businessHours.end },
                    thursday: { start: settings.businessHours.start, end: settings.businessHours.end },
                    friday: { start: settings.businessHours.start, end: settings.businessHours.end },
                    saturday: { start: settings.businessHours.start, end: settings.businessHours.end },
                    sunday: { start: settings.businessHours.start, end: settings.businessHours.end },
                },
            });
        }
    }, [staffMember, isEditing]);
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
    const handleAvailabilityChange = (day, checked) => {
        setFormData((prev) => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: checked,
            },
        }));
    };
    const handleHoursChange = (day, field, value) => {
        setFormData((prev) => ({
            ...prev,
            availabilityHours: {
                ...prev.availabilityHours,
                [day]: {
                    ...prev.availabilityHours[day],
                    [field]: value,
                },
            },
        }));
    };
    const addSkill = () => {
        if (formData.newSkill.trim() &&
            !formData.skills.includes(formData.newSkill.trim())) {
            setFormData((prev) => ({
                ...prev,
                skills: [...prev.skills, prev.newSkill.trim()],
                newSkill: "",
            }));
        }
    };
    const removeSkill = (skill) => {
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.filter((s) => s !== skill),
        }));
    };
    const toggleJobTypeCapability = (jobTypeId) => {
        setFormData((prev) => {
            if (prev.jobTypeCapabilities.includes(jobTypeId)) {
                // Remove the job type if it's already selected
                return {
                    ...prev,
                    jobTypeCapabilities: prev.jobTypeCapabilities.filter(id => id !== jobTypeId)
                };
            }
            else {
                // Add the job type if it's not already selected
                return {
                    ...prev,
                    jobTypeCapabilities: [...prev.jobTypeCapabilities, jobTypeId]
                };
            }
        });
    };
    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) {
            errors.name = "Name is required";
        }
        if (!formData.role.trim()) {
            errors.role = "Role is required";
        }
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        }
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            errors.email = "Invalid email format";
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        if (isEditing && staffMember) {
            updateStaffMember({
                ...staffMember,
                name: formData.name,
                role: formData.role,
                email: formData.email,
                phone: formData.phone || undefined,
                skills: formData.skills,
                jobTypeCapabilities: formData.jobTypeCapabilities,
                availability: formData.availability,
                availabilityHours: formData.availabilityHours,
            });
            navigate(`/staff`);
        }
        else {
            addStaffMember({
                name: formData.name,
                role: formData.role,
                email: formData.email,
                phone: formData.phone || undefined,
                skills: formData.skills,
                jobTypeCapabilities: formData.jobTypeCapabilities,
                availability: formData.availability,
                availabilityHours: formData.availabilityHours,
                assignedJobs: [],
                performanceMetrics: {
                    completionRate: 0,
                    onTimeRate: 0,
                    qualityScore: 0,
                },
            });
            navigate("/staff");
        }
    };
    const days = [
        { key: "monday", label: "Monday" },
        { key: "tuesday", label: "Tuesday" },
        { key: "wednesday", label: "Wednesday" },
        { key: "thursday", label: "Thursday" },
        { key: "friday", label: "Friday" },
        { key: "saturday", label: "Saturday" },
        { key: "sunday", label: "Sunday" },
    ];
    return (_jsx("form", { onSubmit: handleSubmit, children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: isEditing ? "Edit Staff Member" : "Add New Staff Member" }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", className: validationErrors.name ? "text-destructive" : "", children: "Name *" }), _jsx(Input, { id: "name", name: "name", value: formData.name, onChange: handleChange, className: validationErrors.name ? "border-destructive" : "" }), validationErrors.name && (_jsx("p", { className: "text-sm text-destructive", children: validationErrors.name }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "role", className: validationErrors.role ? "text-destructive" : "", children: "Role *" }), _jsx(Input, { id: "role", name: "role", value: formData.role, onChange: handleChange, className: validationErrors.role ? "border-destructive" : "" }), validationErrors.role && (_jsx("p", { className: "text-sm text-destructive", children: validationErrors.role }))] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", className: validationErrors.email ? "text-destructive" : "", children: "Email *" }), _jsx(Input, { id: "email", name: "email", type: "email", value: formData.email, onChange: handleChange, className: validationErrors.email ? "border-destructive" : "" }), validationErrors.email && (_jsx("p", { className: "text-sm text-destructive", children: validationErrors.email }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phone", children: "Phone" }), _jsx(Input, { id: "phone", name: "phone", value: formData.phone, onChange: handleChange, placeholder: "Optional" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Job Type Capabilities" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Select the types of jobs this staff member can work on" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2", children: jobTypes.map((jobType) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: `job-type-${jobType.id}`, checked: formData.jobTypeCapabilities.includes(jobType.id), onCheckedChange: () => toggleJobTypeCapability(jobType.id) }), _jsx(Label, { htmlFor: `job-type-${jobType.id}`, className: "cursor-pointer", children: jobType.name })] }, jobType.id))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Additional Skills" }), _jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: formData.skills.map((skill) => (_jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [skill, _jsx(X, { className: "h-3 w-3 cursor-pointer", onClick: () => removeSkill(skill) })] }, skill))) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: "Add a skill", value: formData.newSkill, name: "newSkill", onChange: handleChange, onKeyDown: (e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            addSkill();
                                                        }
                                                    } }), _jsx(Button, { type: "button", size: "icon", onClick: addSkill, children: _jsx(Plus, { className: "h-4 w-4" }) })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Label, { children: "Availability" }), _jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => {
                                                // Apply business hours to all days that are enabled
                                                const updatedHours = { ...formData.availabilityHours };
                                                Object.keys(formData.availability).forEach(day => {
                                                    if (formData.availability[day]) {
                                                        updatedHours[day] = {
                                                            start: settings.businessHours.start,
                                                            end: settings.businessHours.end
                                                        };
                                                    }
                                                });
                                                setFormData(prev => ({
                                                    ...prev,
                                                    availabilityHours: updatedHours
                                                }));
                                            }, children: "Apply Business Hours" })] }), _jsx("div", { className: "space-y-4", children: days.map((day) => (_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2 w-1/4", children: [_jsx(Checkbox, { id: `${day.key}-available`, checked: formData.availability[day.key], onCheckedChange: (checked) => handleAvailabilityChange(day.key, checked) }), _jsx(Label, { htmlFor: `${day.key}-available`, children: day.label })] }), formData.availability[day.key] && (_jsx("div", { className: "flex items-center space-x-2 w-3/4", children: _jsxs("div", { className: "grid grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: `${day.key}-start`, children: "Start Time" }), _jsxs(Select, { value: formData.availabilityHours[day.key]?.start || "08:00", onValueChange: (value) => handleHoursChange(day.key, "start", value), children: [_jsx(SelectTrigger, { id: `${day.key}-start`, children: _jsx(SelectValue, { placeholder: "Start time" }) }), _jsx(SelectContent, { children: Array.from({ length: 19 }, (_, i) => {
                                                                                const hour = Math.floor(i / 2) + 8;
                                                                                const minute = i % 2 === 0 ? "00" : "30";
                                                                                const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                                                                                const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
                                                                                return (_jsx(SelectItem, { value: time, children: displayTime }, time));
                                                                            }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: `${day.key}-end`, children: "End Time" }), _jsxs(Select, { value: formData.availabilityHours[day.key]?.end || "17:00", onValueChange: (value) => handleHoursChange(day.key, "end", value), children: [_jsx(SelectTrigger, { id: `${day.key}-end`, children: _jsx(SelectValue, { placeholder: "End time" }) }), _jsx(SelectContent, { children: Array.from({ length: 19 }, (_, i) => {
                                                                                const hour = Math.floor(i / 2) + 8;
                                                                                const minute = i % 2 === 0 ? "00" : "30";
                                                                                const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                                                                                const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
                                                                                return (_jsx(SelectItem, { value: time, children: displayTime }, time));
                                                                            }) })] })] })] }) }))] }, day.key))) })] })] }), _jsxs(CardFooter, { className: "flex justify-between", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => navigate(-1), children: "Cancel" }), _jsx(Button, { type: "submit", children: isEditing ? "Update Staff Member" : "Add Staff Member" })] })] }) }));
}
