import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
const PdfPreview = ({ file, onClose, fileUrl: propFileUrl, }) => {
    const [pdfUrl, setPdfUrl] = useState(propFileUrl || null);
    const [isLoading, setIsLoading] = useState(!propFileUrl);
    useEffect(() => {
        // If we already have a URL from props, use that
        if (propFileUrl) {
            setPdfUrl(propFileUrl);
            setIsLoading(false);
            return;
        }
        // Otherwise create a blob URL from the file
        if (file && !pdfUrl) {
            const url = URL.createObjectURL(file);
            setPdfUrl(url);
            setIsLoading(false);
            // Clean up the URL when the component unmounts
            return () => {
                // Only revoke if we created this URL (not if it came from props)
                if (!propFileUrl) {
                    URL.revokeObjectURL(url);
                }
            };
        }
    }, [file, propFileUrl]);
    if (isLoading) {
        return (_jsx(Card, { className: "w-full h-[500px] flex items-center justify-center", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }));
    }
    return (_jsx(Card, { className: "w-full overflow-hidden", children: _jsxs(CardContent, { className: "p-0", children: [_jsx("div", { className: "flex justify-end p-2 bg-muted", children: _jsx(Button, { variant: "outline", size: "sm", onClick: onClose, children: "Close Preview" }) }), _jsx("div", { className: "h-[500px] w-full", children: pdfUrl ? (_jsx("iframe", { src: `${pdfUrl}#toolbar=0&navpanes=0`, className: "w-full h-full", title: "PDF Preview" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: "Unable to preview PDF" })) })] }) }));
};
export default PdfPreview;
