import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffList from "./StaffList";
import StaffDetails from "./StaffDetails";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
const StaffView = ({ staffMembers } = {}) => {
    const navigate = useNavigate();
    const { staff } = useAppContext();
    const [selectedStaffId, setSelectedStaffId] = useState(staff.length > 0 ? staff[0].id : undefined);
    // Use provided staff members or fall back to context
    const allStaff = staffMembers?.length ? staffMembers : staff;
    const selectedStaffMember = allStaff.find((s) => s.id === selectedStaffId);
    const handleSelectStaff = (staffId) => {
        setSelectedStaffId(staffId);
    };
    const handleEditStaff = (staffId) => {
        navigate(`/staff/${staffId}/edit`);
    };
    return (_jsxs("div", { className: "flex h-full w-full bg-gray-50", children: [_jsxs("div", { className: "w-1/4 p-4 border-r border-gray-200", children: [_jsxs("div", { className: "mb-4 flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Staff Members" }), _jsxs(Button, { size: "sm", onClick: () => navigate("/staff/new"), children: [_jsx(Plus, { className: "h-4 w-4 mr-1" }), "Add"] })] }), _jsx(StaffList, { staffMembers: allStaff, onSelectStaff: handleSelectStaff, selectedStaffId: selectedStaffId })] }), _jsx("div", { className: "w-3/4 p-4", children: selectedStaffMember ? (_jsx(StaffDetails, { staffMember: selectedStaffMember, onEditStaff: handleEditStaff })) : (_jsx("div", { className: "h-full flex items-center justify-center text-gray-500", children: allStaff.length > 0 ? ("Select a staff member to view details") : (_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "mb-4", children: "No staff members found" }), _jsxs(Button, { onClick: () => navigate("/staff/new"), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Staff Member"] })] })) })) })] }));
};
export default StaffView;
