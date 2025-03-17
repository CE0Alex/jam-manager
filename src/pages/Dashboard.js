import { jsx as _jsx } from "react/jsx-runtime";
import MainLayout from "../components/layout/MainLayout";
import DashboardView from "../components/dashboard/DashboardView";
const Dashboard = () => {
    return (_jsx(MainLayout, { title: "Dashboard", children: _jsx(DashboardView, {}) }));
};
export default Dashboard;
