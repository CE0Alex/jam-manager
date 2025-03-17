import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { format, addHours } from "date-fns";
export default function ScheduleEventForm({ event, isEditing = false, }) {
    const navigate = useNavigate();
    const { addScheduleEvent, updateScheduleEvent, jobs, staff, schedule } = useAppContext();
    // Format date and time for input fields
    const formatDateTimeForInput = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return {
            date: format(date, "yyyy-MM-dd"),
            time: format(date, "HH:mm"),
        };
    };
    const [formData, setFormData] = useState({
        jobId: "",
        staffId: "",
        startDate: format(new Date(), "yyyy-MM-dd"),
        startTime: "09:00",
        notes: "",
    });
    // Selected job for duration calculation
    const [selectedJob, setSelectedJob] = useState(null);
    useEffect(() => {
        if (event && isEditing) {
            const { date: startDate, time: startTime } = formatDateTimeForInput(event.startTime);
            setFormData({
                jobId: event.jobId,
                staffId: event.staffId || "",
                startDate,
                startTime,
                notes: event.notes || "",
            });
            // Find the job to get its estimated hours
            const job = jobs.find((j) => j.id === event.jobId);
            if (job) {
                setSelectedJob(job);
            }
        }
    }, [event, isEditing, jobs]);
    // Update selected job when jobId changes
    useEffect(() => {
        if (formData.jobId) {
            const job = jobs.find((j) => j.id === formData.jobId);
            if (job) {
                setSelectedJob(job);
            }
        }
        else {
            setSelectedJob(null);
        }
    }, [formData.jobId, jobs]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const calculateEndTime = () => {
        if (!selectedJob || !formData.startDate || !formData.startTime) {
            return { endDate: formData.startDate, endTime: formData.startTime };
        }
        const estimatedHours = selectedJob.estimatedHours || 1;
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00`);
        const endDateTime = addHours(startDateTime, estimatedHours);
        return {
            endDate: format(endDateTime, "yyyy-MM-dd"),
            endTime: format(endDateTime, "HH:mm"),
        };
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedJob) {
            toast({
                title: "Job Required",
                description: "Please select a job to schedule",
                variant: "destructive",
            });
            return;
        }
        // Combine date and time into ISO strings
        const startTime = `${formData.startDate}T${formData.startTime}:00`;
        const { endDate, endTime } = calculateEndTime();
        const endTimeISO = `${endDate}T${endTime}:00`;
        // Check if this time slot is available for the staff member
        const isSlotAvailable = checkStaffAvailability(formData.staffId, new Date(startTime), new Date(endTimeISO), event?.id);
        if (!isSlotAvailable) {
            toast({
                title: "Scheduling Conflict",
                description: "This staff member is already scheduled during this time period.",
                variant: "destructive",
            });
            return;
        }
        if (isEditing && event) {
            updateScheduleEvent({
                ...event,
                jobId: formData.jobId,
                staffId: formData.staffId || undefined,
                startTime,
                endTime: endTimeISO,
                notes: formData.notes || undefined,
            });
            navigate(`/schedule`);
        }
        else {
            addScheduleEvent({
                jobId: formData.jobId,
                staffId: formData.staffId || undefined,
                startTime,
                endTime: endTimeISO,
                notes: formData.notes || undefined,
            });
            navigate("/schedule");
        }
    };
    // Check if a staff member is available during the specified time period
    const checkStaffAvailability = (staffId, startTime, endTime, currentEventId) => {
        if (!staffId)
            return true; // If no staff assigned, no conflict
        // Get all events for this staff member
        const staffEvents = schedule.filter((event) => event.staffId === staffId &&
            (!currentEventId || event.id !== currentEventId));
        // Check for time conflicts
        return !staffEvents.some((event) => {
            const eventStart = new Date(event.startTime);
            const eventEnd = new Date(event.endTime);
            // Check if there's an overlap
            return startTime < eventEnd && endTime > eventStart;
        });
    };
    // Filter out completed and cancelled jobs
    const availableJobs = jobs.filter((job) => job.status !== "completed" && job.status !== "cancelled");
    // Calculate end time for display
    const { endDate, endTime } = calculateEndTime();
    return (_jsx("form", { onSubmit: handleSubmit, children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: isEditing ? "Edit Schedule Event" : "Create New Schedule Event" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "jobId", children: "Job *" }), _jsxs(Select, { value: formData.jobId, onValueChange: (value) => handleSelectChange("jobId", value), required: true, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select a job" }) }), _jsx(SelectContent, { children: availableJobs.length === 0 ? (_jsx(SelectItem, { value: "", disabled: true, children: "No active jobs available" })) : (availableJobs.map((job) => (_jsxs(SelectItem, { value: job.id, children: [job.title, " (", job.estimatedHours, "h)"] }, job.id)))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "staffId", children: "Assigned Staff" }), _jsxs(Select, { value: formData.staffId, onValueChange: (value) => handleSelectChange("staffId", value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select staff member" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "", children: "Unassigned" }), staff.map((member) => (_jsx(SelectItem, { value: member.id, children: member.name }, member.id)))] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "startDate", children: "Start Date *" }), _jsx(Input, { id: "startDate", name: "startDate", type: "date", value: formData.startDate, onChange: handleChange, required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "startTime", children: "Start Time *" }), _jsxs(Select, { value: formData.startTime, onValueChange: (value) => handleSelectChange("startTime", value), required: true, children: [_jsx(SelectTrigger, { id: "startTime", children: _jsx(SelectValue, { placeholder: "Start time" }) }), _jsx(SelectContent, { children: Array.from({ length: 19 }, (_, i) => {
                                                        const hour = Math.floor(i / 2) + 8;
                                                        const minute = i % 2 === 0 ? "00" : "30";
                                                        const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                                                        const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
                                                        return (_jsx(SelectItem, { value: time, children: displayTime }, time));
                                                    }) })] })] })] }), selectedJob && (_jsxs("div", { className: "p-4 bg-blue-50 rounded-md", children: [_jsx("h3", { className: "font-medium mb-2", children: "Calculated Schedule" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Start:" }), " ", formData.startDate, " at ", formData.startTime] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "End:" }), " ", endDate, " at", " ", endTime] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("span", { className: "text-gray-500", children: "Duration:" }), " ", selectedJob.estimatedHours, " hour(s) based on job estimate"] })] })] })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "notes", children: "Notes" }), _jsx(Textarea, { id: "notes", name: "notes", value: formData.notes, onChange: handleChange, placeholder: "Additional information about the schedule" })] })] }), _jsxs(CardFooter, { className: "flex justify-between", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => navigate(-1), children: "Cancel" }), _jsx(Button, { type: "submit", children: isEditing ? "Update Event" : "Create Event" })] })] }) }));
}
