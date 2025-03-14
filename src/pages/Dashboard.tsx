import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import MainContent from "../components/layout/MainContent";

type ViewType = "dashboard" | "jobs" | "schedule" | "staff";

const Dashboard: React.FC = () => {
  const location = useLocation();
  const [activeView, setActiveView] = useState<ViewType>("dashboard");

  // Map routes to views
  React.useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") {
      setActiveView("dashboard");
    } else if (path === "/jobs") {
      setActiveView("jobs");
    } else if (path === "/schedule") {
      setActiveView("schedule");
    } else if (path === "/staff") {
      setActiveView("staff");
    }
  }, [location]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <MainContent activeView={activeView} />
    </div>
  );
};

export default Dashboard;
