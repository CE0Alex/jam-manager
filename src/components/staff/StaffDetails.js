import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, Calendar, Award, Edit } from "lucide-react";
import AssignedJobs from "./AssignedJobs";
import PerformanceMetrics from "./PerformanceMetrics";
import StaffAvailabilityEditor from "./StaffAvailabilityEditor";
import { useAppContext } from "@/context/AppContext";
const StaffDetails = ({ staffMember, onEditStaff = () => { }, }) => {
    const [activeTab, setActiveTab] = useState("overview");
    const { updateStaffMember } = useAppContext();
    // Default staff member data if none provided
    const defaultStaffMember = {
        id: "",
        name: "",
        role: "",
        email: "",
        phone: "",
        skills: [],
        availability: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false,
        },
        assignedJobs: [],
        performanceMetrics: {
            completionRate: 0,
            onTimeRate: 0,
            qualityScore: 0,
        },
    };
    const staff = staffMember || defaultStaffMember;
    const getInitials = (name) => {
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase();
    };
    const formatAvailability = (availability) => {
        const days = [
            { key: "monday", label: "Mon" },
            { key: "tuesday", label: "Tue" },
            { key: "wednesday", label: "Wed" },
            { key: "thursday", label: "Thu" },
            { key: "friday", label: "Fri" },
            { key: "saturday", label: "Sat" },
            { key: "sunday", label: "Sun" },
        ];
        return (_jsx("div", { className: "flex space-x-1", children: days.map((day) => (_jsx(Badge, { variant: availability[day.key]
                    ? "default"
                    : "outline", className: availability[day.key]
                    ? "bg-green-100 text-green-800"
                    : "text-gray-400", children: day.label }, day.key))) }));
    };
    return (_jsxs("div", { className: "w-full h-full bg-white rounded-lg overflow-hidden", children: [_jsxs("div", { className: "p-6 border-b", children: [_jsxs("div", { className: "flex justify-between items-start mb-6", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs(Avatar, { className: "h-16 w-16", children: [_jsx(AvatarImage, { src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.id}`, alt: staff.name }), _jsx(AvatarFallback, { children: getInitials(staff.name) })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: staff.name }), _jsx("p", { className: "text-gray-500", children: staff.role })] })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => onEditStaff(staff.id), children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Edit Profile"] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-gray-500 mb-2", children: "Contact Information" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Mail, { className: "h-4 w-4 text-gray-400 mr-2" }), _jsx("span", { children: staff.email })] }), staff.phone && (_jsxs("div", { className: "flex items-center", children: [_jsx(Phone, { className: "h-4 w-4 text-gray-400 mr-2" }), _jsx("span", { children: staff.phone })] }))] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-gray-500 mb-2", children: "Availability" }), formatAvailability(staff.availability)] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsx("div", { className: "px-6 border-b", children: _jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "jobs", children: "Assigned Jobs" }), _jsx(TabsTrigger, { value: "performance", children: "Performance" }), _jsx(TabsTrigger, { value: "availability", children: "Availability" })] }) }), _jsx(TabsContent, { value: "overview", className: "p-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Skills & Expertise" }) }), _jsx(CardContent, { children: _jsx("div", { className: "flex flex-wrap gap-2", children: staff.skills.map((skill, index) => (_jsx(Badge, { variant: "secondary", children: skill }, index))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Performance Summary" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between mb-1", children: [_jsx("span", { className: "text-sm", children: "Completion Rate" }), _jsxs("span", { className: "text-sm font-medium", children: [staff.performanceMetrics?.completionRate || 0, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full", style: {
                                                                        width: `${staff.performanceMetrics?.completionRate || 0}%`,
                                                                    } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between mb-1", children: [_jsx("span", { className: "text-sm", children: "On-Time Delivery" }), _jsxs("span", { className: "text-sm font-medium", children: [staff.performanceMetrics?.onTimeRate || 0, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-600 h-2 rounded-full", style: {
                                                                        width: `${staff.performanceMetrics?.onTimeRate || 0}%`,
                                                                    } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between mb-1", children: [_jsx("span", { className: "text-sm", children: "Quality Score" }), _jsxs("span", { className: "text-sm font-medium", children: [staff.performanceMetrics?.qualityScore || 0, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-purple-600 h-2 rounded-full", style: {
                                                                        width: `${staff.performanceMetrics?.qualityScore || 0}%`,
                                                                    } }) })] })] }) })] }), _jsxs(Card, { className: "md:col-span-2", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Activity" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex", children: [_jsx("div", { className: "mr-4 flex-shrink-0", children: _jsx(Calendar, { className: "h-5 w-5 text-gray-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Completed job #1082 - Business Cards for XYZ Corp" }), _jsx("p", { className: "text-sm text-gray-500", children: "Yesterday at 2:30 PM" })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "flex", children: [_jsx("div", { className: "mr-4 flex-shrink-0", children: _jsx(Award, { className: "h-5 w-5 text-gray-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Received 5-star rating from client ABC Inc" }), _jsx("p", { className: "text-sm text-gray-500", children: "2 days ago" })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "flex", children: [_jsx("div", { className: "mr-4 flex-shrink-0", children: _jsx(Calendar, { className: "h-5 w-5 text-gray-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Assigned to new job #1095 - Event Banners" }), _jsx("p", { className: "text-sm text-gray-500", children: "3 days ago" })] })] })] }) })] })] }) }), _jsx(TabsContent, { value: "jobs", className: "p-6", children: _jsx(AssignedJobs, { staffId: staff.id }) }), _jsx(TabsContent, { value: "performance", className: "p-6", children: _jsx(PerformanceMetrics, { staffMember: staff }) }), _jsx(TabsContent, { value: "availability", className: "p-6", children: _jsx(StaffAvailabilityEditor, { staffMember: staff, onSave: (updatedStaff) => {
                                updateStaffMember(updatedStaff);
                            } }) })] })] }));
};
export default StaffDetails;
