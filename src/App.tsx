import { Suspense, lazy, useState, useEffect } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import { AppProvider } from "./context/AppContext";
import MainLayout from "./components/layout/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import FeedbackDrawer from "./components/layout/FeedbackDrawer";
import ErrorBoundary from "./components/ErrorBoundary";

// Add type declaration for resetStorage at the top of the file
declare global {
  interface Window {
    resetStorage: () => void;
  }
}

// Lazy load components with error handling to improve initial load time
const lazyWithRetry = (componentImport) => {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      // Try to import the component
      componentImport()
        .then(resolve)
        .catch((error) => {
          // If import fails, wait and retry once
          console.warn("Failed to load component, retrying...", error);
          setTimeout(() => {
            componentImport().then(resolve).catch(reject);
          }, 500);
        });
    });
  });
};

const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const JobCreationForm = lazyWithRetry(() => import("./components/jobs/JobCreationForm"));
const CreateJobDialog = lazyWithRetry(() => import("./components/jobs/CreateJobDialog"));
const JobDetail = lazyWithRetry(() => import("./components/jobs/JobDetail"));
const JobForm = lazyWithRetry(() => import("./components/jobs/JobForm"));
// Note: We're now importing ScheduleView directly instead of lazy loading it to avoid issues
import ScheduleView from "./components/schedule/ScheduleView";
const StaffManagementPage = lazyWithRetry(() => import("./pages/StaffManagementPage"));
const StaffDetailPage = lazyWithRetry(() => import("./pages/StaffDetailPage"));
const StaffFormPage = lazyWithRetry(() => import("./pages/StaffFormPage"));
const ReportsPage = lazyWithRetry(() => import("./pages/ReportsPage"));
const SettingsPage = lazyWithRetry(() => import("./pages/SettingsPage"));
const NotificationsPage = lazyWithRetry(() => import("./pages/NotificationsPage"));
const HelpPage = lazyWithRetry(() => import("./pages/HelpPage"));
const UnifiedJobWorkflow = lazyWithRetry(() => import("./components/jobs/UnifiedJobWorkflow"));

// Debug panel for development mode
const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [jobTypes, setJobTypes] = useState<any[]>([]);
  const [localStorageKeys, setLocalStorageKeys] = useState<string[]>([]);

  useEffect(() => {
    // Get job types from localStorage
    try {
      const jobTypesStr = localStorage.getItem('jobTypes');
      if (jobTypesStr) {
        setJobTypes(JSON.parse(jobTypesStr));
      } else {
        setJobTypes([]);
      }

      // Get all localStorage keys
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) keys.push(key);
      }
      setLocalStorageKeys(keys);
    } catch (error) {
      console.error('Error fetching debug data:', error);
    }
  }, [isOpen]);

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm"
      >
        {isOpen ? 'Close Debug' : 'Debug'}
      </button>

      {isOpen && (
        <div className="bg-white border shadow-lg rounded-md p-4 mt-2 w-96 max-h-96 overflow-auto">
          <h3 className="font-bold mb-2">Debug Information</h3>

          <div className="mb-4">
            <h4 className="font-semibold">Local Storage Keys:</h4>
            <ul className="text-xs">
              {localStorageKeys.length > 0 ? (
                localStorageKeys.map(key => (
                  <li key={key} className="mb-1">
                    {key}: {
                      key === 'jobTypes' 
                        ? 'See below'
                        : `${localStorage.getItem(key)?.substring(0, 30)}${localStorage.getItem(key)?.length > 30 ? '...' : ''}`
                    }
                  </li>
                ))
              ) : (
                <li className="text-red-600">No localStorage keys found</li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold">Job Types ({jobTypes.length}):</h4>
            {jobTypes.length > 0 ? (
              <ul className="text-xs">
                {jobTypes.map((type, index) => (
                  <li key={index} className="mb-1">
                    {type.id}: {type.name} {type.description ? `- ${type.description}` : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-red-600 text-xs">No job types found in localStorage</p>
            )}
          </div>

          <div className="mt-4 flex space-x-2">
            <button 
              onClick={() => (window as any).resetStorage()} 
              className="bg-red-600 text-white px-2 py-1 rounded text-xs"
            >
              Reset All Data
            </button>
            <button 
              onClick={() => {
                const defaultJobTypes = [
                  { id: "embroidery", name: "Embroidery", description: "Machine embroidery services" },
                  { id: "screen_printing", name: "Screen Printing", description: "Traditional screen printing services" },
                  { id: "digital_printing", name: "Digital Printing", description: "Print for digital media" },
                  { id: "wide_format", name: "Wide Format", description: "Large format printing services" },
                  { id: "central_facility", name: "Central Facility", description: "Services at the central production facility" },
                ];
                localStorage.setItem('jobTypes', JSON.stringify(defaultJobTypes));
                window.location.reload();
              }} 
              className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
            >
              Reset Job Types
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  // Handle Tempo routes
  const tempoRoutes = import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <AppProvider>
      <ErrorBoundary>
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="mb-4">Loading application...</div>
            <div className="text-sm text-gray-500">
              If the application doesn't load within a few seconds, try refreshing the page.
              <br/>
              If the issue persists, please check the browser console for errors.
            </div>
          </div>
        }>
          {/* Tempo routes */}
          {tempoRoutes}

          {/* Only render these routes if tempoRoutes is not active */}
          {!tempoRoutes && (
            <Routes>
              {/* Main routes */}
              <Route path="/" element={<Dashboard />} />
              
              {/* Jobs Routes - Simplified */}
              <Route path="jobs" element={<MainLayout title="Job Management"><UnifiedJobWorkflow /></MainLayout>} />
              <Route path="jobs/new" element={<MainLayout title="Create New Job"><div className="p-6"><CreateJobDialog open={true} triggerButton={false} /></div></MainLayout>} />
              <Route path="jobs/:id" element={<MainLayout title="Job Details"><JobDetail /></MainLayout>} />
              <Route path="jobs/:id/edit" element={<MainLayout title="Edit Job"><JobForm /></MainLayout>} />
              
              {/* Schedule Routes */}
              <Route 
                path="schedule" 
                element={
                  <MainLayout title="Production Schedule">
                    <ScheduleView />
                  </MainLayout>
                } 
              />
              
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
        {/* Add debug panel in development mode */}
        <DebugPanel />
      </ErrorBoundary>
    </AppProvider>
  );
}

export default App;