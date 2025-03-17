import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import StaffDetails from "@/components/staff/StaffDetails";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
export default function StaffDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getStaffById } = useAppContext();
    const staffMember = id ? getStaffById(id) : undefined;
    const handleEditStaff = (staffId) => {
        navigate(`/staff/${staffId}/edit`);
    };
    if (!staffMember) {
        return (_jsx(MainLayout, { title: "Staff Member Not Found", children: _jsxs("div", { className: "flex flex-col items-center justify-center h-64", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Staff Member Not Found" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "The staff member you're looking for doesn't exist or has been deleted." }), _jsxs(Button, { onClick: () => navigate("/staff"), children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Staff"] })] }) }));
    }
    return (_jsx(MainLayout, { title: `Staff Details: ${staffMember.name}`, children: _jsx(StaffDetails, { staffMember: staffMember, onEditStaff: handleEditStaff }) }));
}
