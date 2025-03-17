import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private resetApplication = () => {
    if (window.resetStorage) {
      window.resetStorage();
    } else {
      try {
        localStorage.clear();
        window.location.reload();
      } catch (error) {
        console.error('Failed to reset application:', error);
        alert('Failed to reset. Please try refreshing the page manually.');
      }
    }
  };

  private resetJobTypes = () => {
    try {
      // Define default job types
      const defaultJobTypes = [
        { id: "embroidery", name: "Embroidery", description: "Machine embroidery services" },
        { id: "screen_printing", name: "Screen Printing", description: "Traditional screen printing services" },
        { id: "digital_printing", name: "Digital Printing", description: "Print for digital media" },
        { id: "wide_format", name: "Wide Format", description: "Large format printing services" },
        { id: "central_facility", name: "Central Facility", description: "Services at the central production facility" },
      ];
      
      // Reset just the job types and reload
      localStorage.setItem('jobTypes', JSON.stringify(defaultJobTypes));
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset job types:', error);
      alert('Failed to reset job types. Please try refreshing the page manually.');
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen p-4">
          <div className="bg-red-50 border border-red-300 rounded-md p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-red-700 mb-4">Something went wrong</h2>
            <p className="mb-4">The application encountered an error. Please try the following:</p>
            
            <div className="bg-white p-4 mb-4 rounded border border-red-200 overflow-auto max-h-40">
              <p className="font-mono text-sm text-red-800">
                {this.state.error?.toString() || 'Unknown error'}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Reset Options:</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={this.resetJobTypes}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                  >
                    Reset Job Types
                  </button>
                  <button
                    onClick={this.resetApplication}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Reset All Data
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">If problems persist:</h3>
                <ul className="list-disc list-inside text-sm">
                  <li>Check your browser console for more details (F12)</li>
                  <li>Clear your browser cache and reload</li>
                  <li>Try using a different browser</li>
                  <li>Contact support if the issue continues</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 