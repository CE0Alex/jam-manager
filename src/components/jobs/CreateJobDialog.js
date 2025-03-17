import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useId, useRef } from "react";
import { PlusCircle, Upload, X, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import JobForm from "./JobForm";
import { parsePdfJobTicket } from "@/lib/pdfParser";
import PdfPreview from "./PdfPreview";
import PdfJobTicketParser from "./PdfJobTicketParser";
const CreateJobDialog = ({ open = false, onOpenChange, triggerButton = true, }) => {
    // Add a ref for the file input
    const fileInputRef = useRef(null);
    // Generate a unique ID for this dialog instance
    const dialogId = useId();
    const fileInputId = `pdf-upload-${dialogId}`;
    const [activeTab, setActiveTab] = useState("form");
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isParsingPdf, setIsParsingPdf] = useState(false);
    const [extractedData, setExtractedData] = useState(null);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [showParsedData, setShowParsedData] = useState(false);
    const [rawPdfText, setRawPdfText] = useState('');
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = () => {
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === "application/pdf") {
                setPdfFile(file);
                const url = URL.createObjectURL(file);
                setPdfPreviewUrl(url);
                setExtractedData(null); // Reset extracted data when new file is dropped
                setShowParsedData(false);
            }
            else {
                toast({
                    title: "Invalid file type",
                    description: "Please upload a PDF file",
                    variant: "destructive",
                });
            }
        }
    };
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === "application/pdf") {
                setPdfFile(file);
                const url = URL.createObjectURL(file);
                setPdfPreviewUrl(url);
                setExtractedData(null); // Reset extracted data when new file is selected
                setShowParsedData(false);
            }
            else {
                toast({
                    title: "Invalid file type",
                    description: "Please upload a PDF file",
                    variant: "destructive",
                });
            }
        }
    };
    const handleRemoveFile = () => {
        if (pdfPreviewUrl) {
            URL.revokeObjectURL(pdfPreviewUrl);
        }
        setPdfFile(null);
        setPdfPreviewUrl(null);
        setExtractedData(null);
        setShowParsedData(false);
    };
    const handleParsePdf = async () => {
        if (!pdfFile)
            return;
        setIsParsingPdf(true);
        let extractedText = '';
        try {
            // Ensure PDF.js worker is initialized first
            try {
                const { setupPdfWorker } = await import("@/lib/pdfParser");
                await setupPdfWorker();
                console.log("Worker setup completed before parsing");
            }
            catch (workerError) {
                console.warn("Worker setup failed, but proceeding with parsing attempt:", workerError);
            }
            // Extract text to display even if parsing fails
            try {
                const { extractTextFromPdf } = await import("@/lib/pdfParser");
                extractedText = await extractTextFromPdf(pdfFile);
                console.log("Text extraction successful, length:", extractedText.length);
            }
            catch (textError) {
                console.error("Failed to extract text:", textError);
                toast({
                    title: "Text Extraction Failed",
                    description: "We couldn't read the PDF content. Try a different PDF or manually enter job details.",
                    variant: "destructive",
                });
            }
            // Use the pdfParser to extract job data
            const parsedData = await parsePdfJobTicket(pdfFile);
            // Even if parsing returns minimal data, still show it
            setExtractedData(parsedData);
            setRawPdfText(extractedText); // Store raw text
            setShowParsedData(true);
            // Check if parsing got meaningful data or fell back to defaults
            if (parsedData.title && parsedData.title.includes(pdfFile.name.split('.')[0])) {
                // The parser likely fell back to defaults based on filename
                toast({
                    title: "Limited Data Extracted",
                    description: "We extracted basic information from your file. Please review and add missing details.",
                    variant: "default",
                });
            }
            else {
                toast({
                    title: "PDF Parsed Successfully",
                    description: "Job details have been extracted from the PDF",
                });
            }
        }
        catch (error) {
            console.error("Error parsing PDF:", error);
            // Create some default data rather than failing completely
            const filename = pdfFile.name.split('.')[0].replace(/[_-]/g, ' ');
            setExtractedData({
                title: filename,
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
                priority: "medium",
                estimatedHours: 1,
                notes: "PDF parsing failed. Please enter job information manually."
            });
            setRawPdfText(extractedText || "Text extraction failed"); // Store whatever text we got
            setShowParsedData(true);
            toast({
                title: "PDF Parsing Failed",
                description: "We've created a basic job form. Please fill in the details manually.",
                variant: "destructive",
            });
        }
        finally {
            setIsParsingPdf(false);
        }
    };
    const handleContinueToForm = () => {
        setActiveTab("form");
    };
    // Reset state when dialog closes
    const handleOpenChange = (open) => {
        if (!open) {
            if (pdfPreviewUrl) {
                URL.revokeObjectURL(pdfPreviewUrl);
            }
            setPdfFile(null);
            setPdfPreviewUrl(null);
            setExtractedData(null);
            setActiveTab("form");
            setShowPdfPreview(false);
            setShowParsedData(false);
        }
        if (onOpenChange) {
            onOpenChange(open);
        }
    };
    const togglePdfPreview = () => {
        setShowPdfPreview(!showPdfPreview);
    };
    // Add a new function to trigger the file input click
    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    return (_jsxs(Dialog, { open: open, onOpenChange: handleOpenChange, children: [triggerButton && (_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "gap-2", children: [_jsx(PlusCircle, { className: "h-4 w-4" }), "Create New Job"] }) })), _jsxs(DialogContent, { className: "sm:max-w-[700px] max-h-[90vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Create New Job" }), _jsx(DialogDescription, { children: "Create a new job by filling out the form or uploading a PDF to extract job details." })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "form", children: "Manual Entry" }), _jsx(TabsTrigger, { value: "upload", children: "Upload PDF" })] }), _jsx(TabsContent, { value: "form", className: "py-4", children: _jsx(JobForm, { prefilledData: {
                                        ...extractedData,
                                        fileUrl: pdfPreviewUrl || undefined,
                                    }, pdfFile: pdfFile, onJobCreated: () => {
                                        if (onOpenChange) {
                                            onOpenChange(false);
                                        }
                                    } }) }), _jsx(TabsContent, { value: "upload", className: "py-4", children: !showParsedData ? (_jsx("div", { className: `border-2 border-dashed rounded-md p-8 text-center transition-colors duration-200 ${isDragging
                                        ? "border-primary bg-primary/10"
                                        : "border-muted hover:border-primary/50 hover:bg-muted/50"}`, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, onClick: !pdfFile ? handleBrowseClick : undefined, tabIndex: 0, role: "button", "aria-label": "Drag and drop area for PDF upload", children: pdfFile ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-center gap-4", children: [_jsx(FileText, { className: "h-12 w-12 text-primary" }), _jsxs("div", { className: "text-left", children: [_jsx("h3", { className: "font-medium", children: pdfFile.name }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [(pdfFile.size / 1024 / 1024).toFixed(2), " MB"] })] })] }), _jsxs("div", { className: "flex flex-wrap gap-2 justify-center", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: togglePdfPreview, children: showPdfPreview ? "Hide Preview" : "Show Preview" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: handleRemoveFile, children: [_jsx(X, { className: "h-4 w-4 mr-1" }), "Remove"] }), _jsx(Button, { onClick: handleParsePdf, disabled: isParsingPdf, className: "gap-2", children: isParsingPdf ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 animate-spin" }), "Parsing..."] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "h-4 w-4" }), "Extract Details"] })) })] }), showPdfPreview && pdfPreviewUrl && (_jsx("div", { className: "mt-4 max-h-[300px] overflow-auto", children: _jsx(PdfPreview, { file: pdfFile, fileUrl: pdfPreviewUrl, onClose: togglePdfPreview }) }))] })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Upload, { className: "h-12 w-12 mx-auto text-muted-foreground" }), _jsx("h3", { className: "mt-2 font-medium", children: "Upload Job Ticket PDF" }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Drag and drop your PDF file here, or click to browse" })] }), _jsxs("div", { children: [_jsxs(Button, { variant: "outline", size: "sm", className: "w-full", onClick: (e) => {
                                                            e.stopPropagation(); // Prevent double triggering
                                                            handleBrowseClick();
                                                        }, type: "button", children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Browse Files"] }), _jsx("input", { ref: fileInputRef, id: fileInputId, type: "file", accept: "application/pdf", className: "hidden", onChange: handleFileChange, "aria-label": "Upload PDF file" }), _jsx("p", { className: "text-xs text-muted-foreground mt-2 text-center", children: "Supports PDF files only" })] })] })) })) : (_jsxs("div", { className: "space-y-4", children: [extractedData && pdfFile && (_jsx(PdfJobTicketParser, { data: extractedData, fileName: pdfFile.name, fileSize: pdfFile.size, rawText: rawPdfText, onDataUpdate: (updatedData) => {
                                                setExtractedData(updatedData);
                                            } })), _jsxs("div", { className: "flex justify-end gap-2 mt-4", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                                        setShowParsedData(false);
                                                        setExtractedData(null);
                                                    }, children: "Try Again" }), _jsx(Button, { onClick: handleContinueToForm, children: "Continue to Form" })] })] })) })] })] })] }));
};
export default CreateJobDialog;
