import { Suspense } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import { AppProvider } from "./context/AppContext";
import Dashboard from "./pages/Dashboard";
import JobCreationForm from "./components/jobs/JobCreationForm";
import JobDetail from "./components/jobs/JobDetail";
import JobForm from "./components/jobs/JobForm";
import ScheduleJobForm from "./components/schedule/ScheduleJobForm";
import MainLayout from "./components/layout/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import StaffManagementPage from "./pages/StaffManagementPage";
import StaffDetailPage from "./pages/StaffDetailPage";
import StaffFormPage from "./pages/StaffFormPage";
import ReportsPage from "./pages/ReportsPage";
import FeedbackDrawer from "./components/layout/FeedbackDrawer";

function App() {
  return (
    <AppProvider>
      <Suspense fallback={<p>Loading...</p>}>
        {/* Tempo routes */}
        {import.meta.env.VITE_TEMPO && useRoutes(routes)}

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="jobs" element={<Dashboard />} />
          <Route
            path="jobs/new"
            element={
              <MainLayout title="Create New Job">
                <JobCreationForm />
              </MainLayout>
            }
          />
          <Route
            path="jobs/:id"
            element={
              <MainLayout title="Job Details">
                <JobDetail />
              </MainLayout>
            }
          />
          <Route
            path="jobs/:id/edit"
            element={
              <MainLayout title="Edit Job">
                <JobForm />
              </MainLayout>
            }
          />
          <Route path="schedule" element={<Dashboard />} />
          <Route
            path="schedule/new"
            element={
              <MainLayout title="Schedule Job">
                <ScheduleJobForm />
              </MainLayout>
            }
          />
          <Route path="schedule/:id" element={<Dashboard />} />

          {/* Staff Routes */}
          <Route path="staff" element={<StaffManagementPage />} />
          <Route path="staff/new" element={<StaffFormPage />} />
          <Route path="staff/:id" element={<StaffDetailPage />} />
          <Route path="staff/:id/edit" element={<StaffFormPage />} />

          {/* Reports Route */}
          <Route path="reports" element={<ReportsPage />} />

          {/* Add this before any catchall route */}
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="tempobook/*" />
          )}
        </Routes>
      </Suspense>
      <FeedbackDrawer />
      <Toaster />
    </AppProvider>
  );
}

export default App;
