import React, { useState } from "react";
import DashboardView from "../dashboard/DashboardView";
import JobsView from "../jobs/JobsView";
import ScheduleView from "../schedule/ScheduleView";
import StaffView from "../staff/StaffView";

export type ContentView =
  | "dashboard"
  | "jobs"
  | "schedule"
  | "staff"
  | "reports";

interface MainContentProps {
  activeView?: ContentView;
}

const MainContent: React.FC<MainContentProps> = ({
  activeView = "dashboard",
}) => {
  const [currentView, setCurrentView] = useState<ContentView>(activeView);

  // This effect would typically be used to respond to navigation changes
  // from a parent component like a Sidebar
  React.useEffect(() => {
    setCurrentView(activeView);
  }, [activeView]);

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {currentView === "dashboard" && <DashboardView />}
      {currentView === "jobs" && <JobsView />}
      {currentView === "schedule" && <ScheduleView />}
      {currentView === "staff" && <StaffView />}
    </div>
  );
};

export default MainContent;
