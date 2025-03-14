import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import StaffManagement from "@/components/staff/StaffManagement";

export default function StaffManagementPage() {
  return (
    <MainLayout title="Staff Management">
      <StaffManagement />
    </MainLayout>
  );
}
