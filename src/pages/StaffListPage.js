import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import StaffList from "@/components/staff/StaffList";
import StaffDetails from "@/components/staff/StaffDetails";
export default function StaffListPage() {
    const navigate = useNavigate();
    const { staff } = useAppContext();
    const [selectedStaffId, setSelectedStaffId] = useState(staff.length > 0 ? staff[0].id : undefined);
    const selectedStaffMember = staff.find((s) => s.id === selectedStaffId);
    const handleSelectStaff = (staffId) => {
        setSelectedStaffId(staffId);
    };
    const handleEditStaff = (staffId) => {
        navigate(`/staff/${staffId}/edit`);
    };
    return (_jsxs(MainLayout, { title: "Staff Management", onSearch: (term) => console.log("Search term:", term), children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Staff Management" }), _jsxs(Button, { onClick: () => navigate("/staff/new"), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Staff Member"] })] }), _jsxs("div", { className: "flex h-[calc(100vh-12rem)] gap-6", children: [_jsx("div", { className: "w-1/4 h-full", children: _jsx(StaffList, { staffMembers: staff, onSelectStaff: handleSelectStaff, selectedStaffId: selectedStaffId }) }), _jsx("div", { className: "w-3/4 h-full", children: selectedStaffMember ? (_jsx(StaffDetails, { staffMember: selectedStaffMember, onEditStaff: handleEditStaff })) : (_jsx("div", { className: "h-full flex items-center justify-center text-gray-500", children: staff.length > 0 ? ("Select a staff member to view details") : (_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "mb-4", children: "No staff members found" }), _jsxs(Button, { onClick: () => navigate("/staff/new"), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Staff Member"] })] })) })) })] })] }));
}
