import { Suspense, lazy } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import { AppProvider } from "./context/AppContext";
import MainLayout from "./components/layout/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import FeedbackDrawer from "./components/layout/FeedbackDrawer";

// Lazy load components to improve initial load time
const Dashboard = lazy(() => import("./pages/Dashboard"));
const JobCreationForm = lazy(() => import("./components/jobs/JobCreationForm"));
const JobDetail = lazy(() => import("./components/jobs/JobDetail"));
const JobForm = lazy(() => import("./components/jobs/JobForm"));
const ScheduleJobForm = lazy(() => import("./components/schedule/ScheduleJobForm"));
const StaffManagementPage = lazy(() => import("./pages/StaffManagementPage"));
const StaffDetailPage = lazy(() => import("./pages/StaffDetailPage"));
const StaffFormPage = lazy(() => import("./pages/StaffFormPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const UnifiedJobWorkflow = lazy(() => import("./components/jobs/UnifiedJobWorkflow"));

function App() {
  // Handle Tempo routes
  const tempoRoutes = import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <AppProvider>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        {/* Tempo routes */}
        {tempoRoutes}

        {/* Only render these routes if tempoRoutes is not active */}
        {!tempoRoutes && (
          <Routes>
            {/* Main routes */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Jobs Routes - Simplified */}
            <Route path="jobs" element={<MainLayout title="Job Management"><UnifiedJobWorkflow /></MainLayout>} />
            <Route path="jobs/new" element={<MainLayout title="Create New Job"><JobCreationForm /></MainLayout>} />
            <Route path="jobs/:id" element={<MainLayout title="Job Details"><JobDetail /></MainLayout>} />
            <Route path="jobs/:id/edit" element={<MainLayout title="Edit Job"><JobForm /></MainLayout>} />
            
            {/* Schedule Routes - Fixed */}
            <Route 
              path="schedule" 
              element={<MainLayout title="Production Schedule"><lazy(() => import("./components/schedule/ScheduleView")) /></MainLayout>} 
            />
            <Route path="schedule/new" element={<MainLayout title="Schedule Job"><ScheduleJobForm /></MainLayout>} />
            
            {/* Staff Routes */}
            <Route path="staff" element={<StaffManagementPage />} />
            <Route path="staff/new" element={<StaffFormPage />} />
            <Route path="staff/:id" element={<StaffDetailPage />} />
            <Route path="staff/:id/edit" element={<StaffFormPage />} />

            {/* Reports Route */}
            <Route path="reports" element={<ReportsPage />} />

            {/* System Routes */}
            <Route path="settings" element={<SettingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="help" element={<HelpPage />} />

            {/* Tempo route */}
            {import.meta.env.VITE_TEMPO === "true" && <Route path="tempobook/*" element={<div />} />}

            {/* Catch-all route */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        )}
      </Suspense>
      <FeedbackDrawer />
      <Toaster />
    </AppProvider>
  );
}

export default App;