import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import App from '@/App';

// Mock all lazily loaded components
jest.mock('../pages/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard">Dashboard Content</div>;
  };
});

jest.mock('../components/jobs/JobCreationForm', () => {
  return function MockJobCreationForm() {
    return <div data-testid="job-creation-form">Job Creation Form</div>;
  };
});

jest.mock('../components/schedule/ScheduleView', () => {
  return function MockScheduleView() {
    return <div data-testid="schedule-view">Schedule View</div>;
  };
});

// Mocking the context
jest.mock('../context/AppContext', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="app-provider">{children}</div>,
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
    render(
      <HashRouter>
        <App />
      </HashRouter>
    );
    
    // Wait for lazy loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('app-provider')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  it('handles route to schedule page correctly', async () => {
    // Setup test with route to schedule
    window.history.pushState({}, 'Schedule', '#/schedule');
    
    render(
      <HashRouter>
        <App />
      </HashRouter>
    );
    
    // Wait for lazy loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('app-provider')).toBeInTheDocument();
      expect(screen.getByTestId('schedule-view')).toBeInTheDocument();
    });
  });

  it('handles route to job creation page correctly', async () => {
    // Setup test with route to job creation
    window.history.pushState({}, 'New Job', '#/jobs/new');
    
    render(
      <HashRouter>
        <App />
      </HashRouter>
    );
    
    // Wait for lazy loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('app-provider')).toBeInTheDocument();
      expect(screen.getByTestId('job-creation-form')).toBeInTheDocument();
    });
  });
});