import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import DashboardView from "../dashboard/DashboardView";
import JobsView from "../jobs/JobsView";
import ScheduleView from "../schedule/ScheduleView";
import StaffView from "../staff/StaffView";
const MainContent = ({ activeView = "dashboard", }) => {
    const [currentView, setCurrentView] = useState(activeView);
    // This effect would typically be used to respond to navigation changes
    // from a parent component like a Sidebar
    React.useEffect(() => {
        setCurrentView(activeView);
    }, [activeView]);
    return (_jsxs("div", { className: "flex-1 overflow-auto bg-gray-50", children: [currentView === "dashboard" && _jsx(DashboardView, {}), currentView === "jobs" && _jsx(JobsView, {}), currentView === "schedule" && _jsx(ScheduleView, {}), currentView === "staff" && _jsx(StaffView, {})] }));
};
export default MainContent;
