import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import ReportsView from "@/components/reports/ReportsView";

export default function ReportsPage() {
  return (
    <MainLayout title="Production Reports">
      <ReportsView />
    </MainLayout>
  );
}
