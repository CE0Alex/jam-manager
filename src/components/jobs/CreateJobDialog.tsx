import React, { useState } from "react";
import { PlusCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobForm from "./JobForm";

interface CreateJobDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CreateJobDialog = ({
  open = false,
  onOpenChange,
}: CreateJobDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>("form");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

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
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setPdfFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setPdfFile(file);
      }
    }
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
  };

  const handleParsePdf = () => {
    // This would be implemented with actual PDF parsing functionality
    console.log("Parsing PDF:", pdfFile?.name);
    // After parsing, you would typically switch to the form tab with pre-filled data
    setActiveTab("form");
  };

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPdfFile(null);
      setActiveTab("form");
    }
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create New Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Create a new job by filling out the form or uploading a PDF to
            extract job details.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Manual Entry</TabsTrigger>
            <TabsTrigger value="upload">Upload PDF</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="mt-4">
            <JobForm />
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? "border-primary bg-primary/5" : "border-gray-300"}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!pdfFile ? (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Upload className="h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-lg font-medium">
                        Drag and drop your PDF here
                      </p>
                      <p className="text-sm text-gray-500">
                        or click to browse files
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      id="pdf-upload"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="pdf-upload">
                      <Button variant="outline" type="button" className="mt-2">
                        Browse Files
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-md">
                        <Upload className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{pdfFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {Math.round(pdfFile.size / 1024)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {pdfFile && (
                <div className="flex justify-end">
                  <Button onClick={handleParsePdf}>Parse PDF</Button>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">
                  How PDF parsing works:
                </h3>
                <p className="text-sm text-gray-500">
                  Upload a PDF invoice or job specification, and our system will
                  attempt to extract key information like client name, job
                  details, and deadlines. You'll be able to review and edit the
                  extracted information before creating the job.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-start">
          <div className="w-full flex justify-between items-center">
            <p className="text-xs text-gray-500">
              * Required fields must be filled
            </p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobDialog;
