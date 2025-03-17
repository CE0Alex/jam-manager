import React from "react";
import MainLayout from "../components/layout/MainLayout";
import DashboardView from "../components/dashboard/DashboardView";

const Dashboard: React.FC = () => {
  return (
    <MainLayout title="Dashboard">
      <DashboardView />
    </MainLayout>
  );
};

export default Dashboard;
