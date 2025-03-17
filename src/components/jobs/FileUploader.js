import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Eye, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import PdfPreview from "./PdfPreview";
import { uploadFile } from "@/lib/storage";
export default function FileUploader({ onFileUploaded, accept = "application/pdf", maxSize = 10, // 10MB default
initialFileUrl, }) {
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(initialFileUrl || null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    // Handle drag events
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
            const droppedFile = e.dataTransfer.files[0];
            handleFile(droppedFile);
        }
    };
    // Handle file selection
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            handleFile(selectedFile);
        }
    };
    // Process the file
    const handleFile = (selectedFile) => {
        // Check file type
        if (!selectedFile.type.match(accept)) {
            toast({
                title: "Invalid file type",
                description: `Please select a ${accept} file`,
                variant: "destructive",
            });
            return;
        }
        // Check file size
        if (selectedFile.size > maxSize * 1024 * 1024) {
            toast({
                title: "File too large",
                description: `File size must be less than ${maxSize}MB`,
                variant: "destructive",
            });
            return;
        }
        setFile(selectedFile);
        const tempUrl = URL.createObjectURL(selectedFile);
        setFileUrl(tempUrl);
    };
    // Remove the file
    const handleRemoveFile = () => {
        if (fileUrl && fileUrl.startsWith("blob:")) {
            URL.revokeObjectURL(fileUrl);
        }
        setFile(null);
        setFileUrl(null);
        setShowPreview(false);
    };
    // Upload the file to storage
    const handleUpload = async () => {
        if (!file)
            return;
        setIsUploading(true);
        try {
            const url = await uploadFile(file);
            if (url) {
                // Clean up the temporary blob URL if it exists
                if (fileUrl && fileUrl.startsWith("blob:") && fileUrl !== url) {
                    URL.revokeObjectURL(fileUrl);
                }
                setFileUrl(url);
                onFileUploaded(url);
                toast({
                    title: "File uploaded",
                    description: "File has been uploaded successfully",
                });
            }
            else {
                // If upload fails, keep using the blob URL as fallback
                if (fileUrl && fileUrl.startsWith("blob:")) {
                    onFileUploaded(fileUrl);
                    toast({
                        title: "Using local file",
                        description: "File will be available temporarily. For permanent storage, please try again later.",
                    });
                }
                else {
                    throw new Error("Failed to upload file");
                }
            }
        }
        catch (error) {
            console.error("Error uploading file:", error);
            // If we have a blob URL, use it as fallback
            if (fileUrl && fileUrl.startsWith("blob:")) {
                onFileUploaded(fileUrl);
                toast({
                    title: "Using local file",
                    description: "Upload to cloud storage failed. File will be available temporarily.",
                    variant: "warning",
                });
            }
            else {
                toast({
                    title: "Upload failed",
                    description: "There was a problem uploading your file",
                    variant: "destructive",
                });
            }
        }
        finally {
            setIsUploading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: `border-2 border-dashed rounded-lg p-6 text-center ${isDragging ? "border-primary bg-primary/5" : "border-gray-300"}`, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, children: !fileUrl ? (_jsxs("div", { className: "flex flex-col items-center justify-center space-y-2", children: [_jsx(Upload, { className: "h-10 w-10 text-gray-400" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Drag and drop your file here" }), _jsx("p", { className: "text-sm text-gray-500", children: "or click to browse files" })] }), _jsx("input", { type: "file", accept: accept, className: "hidden", id: "file-upload", onChange: handleFileChange }), _jsx("label", { htmlFor: "file-upload", children: _jsx(Button, { variant: "outline", type: "button", className: "mt-2", onClick: (e) => {
                                    e.preventDefault();
                                    document.getElementById("file-upload")?.click();
                                }, children: "Browse Files" }) })] })) : (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded-md", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 bg-primary/10 rounded-md", children: _jsx(FileText, { className: "h-5 w-5 text-primary" }) }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "font-medium", children: file?.name || "Uploaded file" }), _jsx("p", { className: "text-xs text-gray-500", children: file ? `${Math.round(file.size / 1024)} KB` : "" })] })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: handleRemoveFile, children: _jsx(X, { className: "h-4 w-4" }) })] })) }), fileUrl && (_jsxs("div", { className: "flex justify-between", children: [_jsx(Button, { variant: "outline", onClick: () => setShowPreview(!showPreview), className: "flex items-center", children: showPreview ? (_jsx(_Fragment, { children: "Hide Preview" })) : (_jsxs(_Fragment, { children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "Preview File"] })) }), file && fileUrl.startsWith("blob:") && (_jsxs(Button, { onClick: handleUpload, disabled: isUploading, className: "flex items-center", children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), isUploading ? "Uploading..." : "Upload to Storage"] }))] })), showPreview && fileUrl && fileUrl.endsWith(".pdf") && (_jsx("div", { className: "mt-2", children: _jsx(PdfPreview, { file: file || new Blob(), onClose: () => setShowPreview(false), fileUrl: fileUrl }) }))] }));
}
