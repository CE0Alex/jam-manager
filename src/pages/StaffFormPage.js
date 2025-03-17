import { jsx as _jsx } from "react/jsx-runtime";
import { useParams } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import StaffForm from "@/components/staff/StaffForm";
import MainLayout from "@/components/layout/MainLayout";
export default function StaffFormPage() {
    const { id } = useParams();
    const { getStaffById } = useAppContext();
    const staffMember = id ? getStaffById(id) : undefined;
    const isEditing = Boolean(staffMember);
    return (_jsx(MainLayout, { title: isEditing ? "Edit Staff Member" : "Add New Staff Member", children: _jsx("div", { className: "max-w-4xl mx-auto", children: _jsx(StaffForm, { staffMember: staffMember, isEditing: isEditing }) }) }));
}
