import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';

// Component that will throw an error
const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console errors during tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child component</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('displays error UI when a child component throws', () => {
    // Using jest.spyOn to mock window.location.href assignment
    const locationAssignMock = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { href: locationAssignMock },
      writable: true
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    
    // Check if Technical Details can be expanded
    const details = screen.getByText('Technical Details');
    fireEvent.click(details);
    
    // Check if Try Again button is present
    const tryAgainButton = screen.getByText('Try Again');
    expect(tryAgainButton).toBeInTheDocument();
    
    // Check if Return to Dashboard button is present
    const dashboardButton = screen.getByText('Return to Dashboard');
    expect(dashboardButton).toBeInTheDocument();
  });

  it('shows custom fallback UI when provided', () => {
    const customFallback = <div data-testid="custom-fallback">Custom error UI</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
  });
});