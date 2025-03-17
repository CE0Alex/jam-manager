import { jsx as _jsx } from "react/jsx-runtime";
import MainLayout from "@/components/layout/MainLayout";
import ReportsView from "@/components/reports/ReportsView";
export default function ReportsPage() {
    return (_jsx(MainLayout, { title: "Production Reports", children: _jsx(ReportsView, {}) }));
}
