import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, lazy, useState, useEffect } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
// Use a try-catch to safely import routes
let routes = [];
try {
  routes = require("tempo-routes").default;
} catch (e) {
  console.warn("tempo-routes not available, using empty routes array");
  routes = [];
}
import { AppProvider } from "./context/AppContext";
import MainLayout from "./components/layout/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import FeedbackDrawer from "./components/layout/FeedbackDrawer";
import ErrorBoundary from "./components/ErrorBoundary";
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
// ScheduleView with retry for better reliability
const ScheduleView = lazyWithRetry(() => import("./components/schedule/ScheduleView"));
const ScheduleJobForm = lazyWithRetry(() => import("./components/schedule/ScheduleJobForm"));
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
    const [jobTypes, setJobTypes] = useState([]);
    const [localStorageKeys, setLocalStorageKeys] = useState([]);
    useEffect(() => {
        // Get job types from localStorage
        try {
            const jobTypesStr = localStorage.getItem('jobTypes');
            if (jobTypesStr) {
                setJobTypes(JSON.parse(jobTypesStr));
            }
            else {
                setJobTypes([]);
            }
            // Get all localStorage keys
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key)
                    keys.push(key);
            }
            setLocalStorageKeys(keys);
        }
        catch (error) {
            console.error('Error fetching debug data:', error);
        }
    }, [isOpen]);
    if (!import.meta.env.DEV)
        return null;
    return (_jsxs("div", { className: "fixed bottom-4 right-4 z-50", children: [_jsx("button", { onClick: () => setIsOpen(!isOpen), className: "bg-gray-800 text-white px-3 py-1 rounded-md text-sm", children: isOpen ? 'Close Debug' : 'Debug' }), isOpen && (_jsxs("div", { className: "bg-white border shadow-lg rounded-md p-4 mt-2 w-96 max-h-96 overflow-auto", children: [_jsx("h3", { className: "font-bold mb-2", children: "Debug Information" }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "font-semibold", children: "Local Storage Keys:" }), _jsx("ul", { className: "text-xs", children: localStorageKeys.length > 0 ? (localStorageKeys.map(key => (_jsxs("li", { className: "mb-1", children: [key, ": ", key === 'jobTypes'
                                            ? 'See below'
                                            : `${localStorage.getItem(key)?.substring(0, 30)}${localStorage.getItem(key)?.length > 30 ? '...' : ''}`] }, key)))) : (_jsx("li", { className: "text-red-600", children: "No localStorage keys found" })) })] }), _jsxs("div", { children: [_jsxs("h4", { className: "font-semibold", children: ["Job Types (", jobTypes.length, "):"] }), jobTypes.length > 0 ? (_jsx("ul", { className: "text-xs", children: jobTypes.map((type, index) => (_jsxs("li", { className: "mb-1", children: [type.id, ": ", type.name, " ", type.description ? `- ${type.description}` : ''] }, index))) })) : (_jsx("p", { className: "text-red-600 text-xs", children: "No job types found in localStorage" }))] }), _jsxs("div", { className: "mt-4 flex space-x-2", children: [_jsx("button", { onClick: () => window.resetStorage(), className: "bg-red-600 text-white px-2 py-1 rounded text-xs", children: "Reset All Data" }), _jsx("button", { onClick: () => {
                                    const defaultJobTypes = [
                                        { id: "embroidery", name: "Embroidery", description: "Machine embroidery services" },
                                        { id: "screen_printing", name: "Screen Printing", description: "Traditional screen printing services" },
                                        { id: "digital_printing", name: "Digital Printing", description: "Print for digital media" },
                                        { id: "wide_format", name: "Wide Format", description: "Large format printing services" },
                                        { id: "central_facility", name: "Central Facility", description: "Services at the central production facility" },
                                    ];
                                    localStorage.setItem('jobTypes', JSON.stringify(defaultJobTypes));
                                    window.location.reload();
                                }, className: "bg-yellow-500 text-white px-2 py-1 rounded text-xs", children: "Reset Job Types" })] })] }))] }));
};
function App() {
    // Handle Tempo routes safely
    const tempoEnabled = typeof import.meta !== 'undefined' && 
                        import.meta.env && 
                        import.meta.env.VITE_TEMPO === "true";
    const tempoRoutes = tempoEnabled ? useRoutes(routes) : null;
    return (_jsx(AppProvider, { children: _jsxs(ErrorBoundary, { children: [_jsxs(Suspense, { fallback: _jsxs("div", { className: "flex flex-col items-center justify-center h-screen", children: [_jsx("div", { className: "mb-4", children: "Loading application..." }), _jsxs("div", { className: "text-sm text-gray-500", children: ["If the application doesn't load within a few seconds, try refreshing the page.", _jsx("br", {}), "If the issue persists, please check the browser console for errors."] })] }), children: [tempoRoutes, !tempoRoutes && (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "jobs", element: _jsx(MainLayout, { title: "Job Management", children: _jsx(UnifiedJobWorkflow, {}) }) }), _jsx(Route, { path: "jobs/new", element: _jsx(MainLayout, { title: "Create New Job", children: _jsx("div", { className: "p-6", children: _jsx(CreateJobDialog, { open: true, triggerButton: false }) }) }) }), _jsx(Route, { path: "jobs/:id", element: _jsx(MainLayout, { title: "Job Details", children: _jsx(JobDetail, {}) }) }), _jsx(Route, { path: "jobs/:id/edit", element: _jsx(MainLayout, { title: "Edit Job", children: _jsx(JobForm, {}) }) }), _jsx(Route, { path: "schedule", element: _jsx(MainLayout, { title: "Production Schedule", children: _jsx(Suspense, { 
                  fallback: _jsx("div", { className: "p-8 text-center", children: "Loading production schedule..." }),
                  children: _jsx(ScheduleView, {})
                }) 
              }) }), _jsx(Route, { path: "jobs/schedule", element: _jsx(MainLayout, { title: "Schedule Job", children: _jsx(ScheduleJobForm, {}) }) }), _jsx(Route, { path: "staff", element: _jsx(StaffManagementPage, {}) }), _jsx(Route, { path: "staff/new", element: _jsx(StaffFormPage, {}) }), _jsx(Route, { path: "staff/:id", element: _jsx(StaffDetailPage, {}) }), _jsx(Route, { path: "staff/:id/edit", element: _jsx(StaffFormPage, {}) }), _jsx(Route, { path: "reports", element: _jsx(ReportsPage, {}) }), _jsx(Route, { path: "settings", element: _jsx(SettingsPage, {}) }), _jsx(Route, { path: "notifications", element: _jsx(NotificationsPage, {}) }), _jsx(Route, { path: "help", element: _jsx(HelpPage, {}) }), import.meta.env.VITE_TEMPO === "true" && _jsx(Route, { path: "tempobook/*", element: _jsx("div", {}) }), _jsx(Route, { path: "*", element: _jsx(Dashboard, {}) })] }))] }), _jsx(FeedbackDrawer, {}), _jsx(Toaster, {}), _jsx(DebugPanel, {})] }) }));
}
export default App;
