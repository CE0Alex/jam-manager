import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Eye, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import PdfPreview from "./PdfPreview";
import { uploadFile } from "@/lib/storage";

interface FileUploaderProps {
  onFileUploaded: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  initialFileUrl?: string;
}

export default function FileUploader({
  onFileUploaded,
  accept = "application/pdf",
  maxSize = 10, // 10MB default
  initialFileUrl,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(initialFileUrl || null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      handleFile(droppedFile);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      handleFile(selectedFile);
    }
  };

  // Process the file
  const handleFile = (selectedFile: File) => {
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
    if (!file) return;

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
      } else {
        // If upload fails, keep using the blob URL as fallback
        if (fileUrl && fileUrl.startsWith("blob:")) {
          onFileUploaded(fileUrl);
          toast({
            title: "Using local file",
            description:
              "File will be available temporarily. For permanent storage, please try again later.",
          });
        } else {
          throw new Error("Failed to upload file");
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);

      // If we have a blob URL, use it as fallback
      if (fileUrl && fileUrl.startsWith("blob:")) {
        onFileUploaded(fileUrl);
        toast({
          title: "Using local file",
          description:
            "Upload to cloud storage failed. File will be available temporarily.",
          variant: "warning",
        });
      } else {
        toast({
          title: "Upload failed",
          description: "There was a problem uploading your file",
          variant: "destructive",
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${isDragging ? "border-primary bg-primary/5" : "border-gray-300"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!fileUrl ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-10 w-10 text-gray-400" />
            <div>
              <p className="font-medium">Drag and drop your file here</p>
              <p className="text-sm text-gray-500">or click to browse files</p>
            </div>
            <input
              type="file"
              accept={accept}
              className="hidden"
              id="file-upload"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outline"
                type="button"
                className="mt-2"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("file-upload")?.click();
                }}
              >
                Browse Files
              </Button>
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">{file?.name || "Uploaded file"}</p>
                <p className="text-xs text-gray-500">
                  {file ? `${Math.round(file.size / 1024)} KB` : ""}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {fileUrl && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center"
          >
            {showPreview ? (
              <>Hide Preview</>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview File
              </>
            )}
          </Button>

          {file && fileUrl.startsWith("blob:") && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload to Storage"}
            </Button>
          )}
        </div>
      )}

      {showPreview && fileUrl && fileUrl.endsWith(".pdf") && (
        <div className="mt-2">
          <PdfPreview
            file={file || new Blob()}
            onClose={() => setShowPreview(false)}
            fileUrl={fileUrl}
          />
        </div>
      )}
    </div>
  );
}
