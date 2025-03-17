import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
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
                errorInfo: null,
            }
        });
        Object.defineProperty(this, "handleReset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                });
            }
        });
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error, errorInfo: null };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
        // You could also log to an error reporting service here
    }
    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (_jsx("div", { className: "flex items-center justify-center h-screen p-4", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs(Alert, { variant: "destructive", className: "mb-4", children: [_jsx(AlertTitle, { className: "text-lg", children: "Something went wrong" }), _jsx(AlertDescription, { className: "mt-2", children: this.state.error?.message || "An unexpected error occurred" })] }), _jsx("div", { className: "text-sm text-muted-foreground mb-4", children: _jsxs("details", { children: [_jsx("summary", { children: "Technical Details" }), _jsxs("pre", { className: "mt-2 whitespace-pre-wrap text-xs", children: [this.state.error?.toString() || "Unknown error", this.state.errorInfo?.componentStack || ""] })] }) }), _jsxs("div", { className: "flex justify-between", children: [_jsxs(Button, { onClick: this.handleReset, className: "flex items-center gap-2", children: [_jsx(RefreshCcw, { className: "h-4 w-4" }), "Try Again"] }), _jsx(Button, { variant: "outline", onClick: () => window.location.href = "/", children: "Return to Dashboard" })] })] }) }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
