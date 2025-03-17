import { jsx as _jsx } from "react/jsx-runtime";
import MainLayout from "@/components/layout/MainLayout";
import StaffManagement from "@/components/staff/StaffManagement";
export default function StaffManagementPage() {
    return (_jsx(MainLayout, { title: "Staff Management", children: _jsx(StaffManagement, {}) }));
}
