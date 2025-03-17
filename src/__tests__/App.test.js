import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, waitFor } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import App from '@/App';
// Mock all lazily loaded components
jest.mock('../pages/Dashboard', () => {
    return function MockDashboard() {
        return _jsx("div", { "data-testid": "dashboard", children: "Dashboard Content" });
    };
});
jest.mock('../components/jobs/JobCreationForm', () => {
    return function MockJobCreationForm() {
        return _jsx("div", { "data-testid": "job-creation-form", children: "Job Creation Form" });
    };
});
jest.mock('../components/schedule/ScheduleView', () => {
    return function MockScheduleView() {
        return _jsx("div", { "data-testid": "schedule-view", children: "Schedule View" });
    };
});
// Mocking the context
jest.mock('../context/AppContext', () => ({
    AppProvider: ({ children }) => _jsx("div", { "data-testid": "app-provider", children: children }),
    useAppContext: () => ({
        jobs: [],
        staff: [],
        machines: [],
        schedule: [],
        addJob: jest.fn(),
        updateJob: jest.fn(),
        deleteJob: jest.fn(),
        filteredJobs: [],
        setJobFilters: jest.fn(),
        // Add other context values as needed
    }),
}));
describe('App Component Routing', () => {
    it('renders dashboard by default', async () => {
        render(_jsx(HashRouter, { children: _jsx(App, {}) }));
        // Wait for lazy loading to complete
        await waitFor(() => {
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
            expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        });
    });
    it('handles route to schedule page correctly', async () => {
        // Setup test with route to schedule
        window.history.pushState({}, 'Schedule', '#/schedule');
        render(_jsx(HashRouter, { children: _jsx(App, {}) }));
        // Wait for lazy loading to complete
        await waitFor(() => {
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
            expect(screen.getByTestId('schedule-view')).toBeInTheDocument();
        });
    });
    it('handles route to job creation page correctly', async () => {
        // Setup test with route to job creation
        window.history.pushState({}, 'New Job', '#/jobs/new');
        render(_jsx(HashRouter, { children: _jsx(App, {}) }));
        // Wait for lazy loading to complete
        await waitFor(() => {
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
            expect(screen.getByTestId('job-creation-form')).toBeInTheDocument();
        });
    });
});
