import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
class ErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                hasError: false,
                error: null,
                errorInfo: null
            }
        });
        Object.defineProperty(this, "resetApplication", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                if (window.resetStorage) {
                    window.resetStorage();
                }
                else {
                    try {
                        localStorage.clear();
                        window.location.reload();
                    }
                    catch (error) {
                        console.error('Failed to reset application:', error);
                        alert('Failed to reset. Please try refreshing the page manually.');
                    }
                }
            }
        });
        Object.defineProperty(this, "resetJobTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
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
                }
                catch (error) {
                    console.error('Failed to reset job types:', error);
                    alert('Failed to reset job types. Please try refreshing the page manually.');
                }
            }
        });
    }
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "flex flex-col items-center justify-center h-screen p-4", children: _jsxs("div", { className: "bg-red-50 border border-red-300 rounded-md p-6 max-w-2xl w-full", children: [_jsx("h2", { className: "text-2xl font-bold text-red-700 mb-4", children: "Something went wrong" }), _jsx("p", { className: "mb-4", children: "The application encountered an error. Please try the following:" }), _jsx("div", { className: "bg-white p-4 mb-4 rounded border border-red-200 overflow-auto max-h-40", children: _jsx("p", { className: "font-mono text-sm text-red-800", children: this.state.error?.toString() || 'Unknown error' }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: "Reset Options:" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { onClick: this.resetJobTypes, className: "bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded", children: "Reset Job Types" }), _jsx("button", { onClick: this.resetApplication, className: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded", children: "Reset All Data" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: "If problems persist:" }), _jsxs("ul", { className: "list-disc list-inside text-sm", children: [_jsx("li", { children: "Check your browser console for more details (F12)" }), _jsx("li", { children: "Clear your browser cache and reload" }), _jsx("li", { children: "Try using a different browser" }), _jsx("li", { children: "Contact support if the issue continues" })] })] })] })] }) }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
