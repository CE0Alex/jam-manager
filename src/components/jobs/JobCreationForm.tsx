import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { JobPriority, JobStatus, JobType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, AlertCircle, FileText, Eye } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PdfPreview from "./PdfPreview";

export default function JobCreationForm() {
  const navigate = useNavigate();
  const { addJob, staff, setJobFilters } = useAppContext();
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);

  const [formData, setFormData] = useState<{
    title: string;
    client: string;
    description: string;
    status: JobStatus;
    deadline: string;
    assignedTo?: string;
    priority: JobPriority;
    jobType: JobType;
    fileUrl?: string;
    estimatedHours: number;
    notes?: string;
  }>({
    title: "",
    client: "",
    description: "",
    status: "pending",
    deadline: format(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd",
    ),
    assignedTo: undefined,
    priority: "medium",
    jobType: "digital_printing",
    fileUrl: "",
    estimatedHours: 1,
    notes: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      errors.title = "Job title is required";
    }

    if (!formData.client.trim()) {
      errors.client = "Client name is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.deadline) {
      errors.deadline = "Deadline is required";
    }

    if (!formData.estimatedHours || formData.estimatedHours <= 0) {
      errors.estimatedHours = "Valid estimated hours are required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      addJob({
        ...formData,
        estimatedHours: Number(formData.estimatedHours),
        assignedTo:
          formData.assignedTo === "unassigned"
            ? undefined
            : formData.assignedTo,
      });
      toast({
        title: "Success",
        description: "Job created successfully",
      });
      // Reset filters to ensure new job is visible
      setJobFilters({});
      navigate("/schedule");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "There was a problem creating the job",
        variant: "destructive",
      });
    }
  };

  // PDF Upload Handlers
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
        console.log("PDF file selected:", file.name);
      } else {
        console.log("Not a PDF file:", file.type);
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
  };

  const handleParsePdf = async () => {
    if (!pdfFile) return;

    // Show loading state
    toast({
      title: "Processing PDF",
      description: "Extracting information from your job ticket...",
    });

    try {
      // Import the storage and parser functions
      const { uploadFile } = await import("@/lib/storage");
      const { parsePdfJobTicket } = await import("@/lib/pdfParser");

      // First try to extract data from the PDF before uploading
      // This ensures we don't waste storage if parsing fails completely
      console.log("Starting PDF data extraction...");
      let extractedData: any = {};
      let extractionSuccessful = false;

      try {
        // Extract data from the PDF
        extractedData = await parsePdfJobTicket(pdfFile);

        // Check if we got meaningful data (at least a title)
        extractionSuccessful = !!extractedData.title;
        console.log(
          "PDF data extraction result:",
          extractionSuccessful ? "Success" : "Limited data",
          extractedData,
        );
      } catch (extractError) {
        console.error("Error during PDF data extraction:", extractError);
        extractionSuccessful = false;
      }

      // Upload the file to Supabase storage
      console.log("Uploading PDF to storage...");
      const fileUrl = await uploadFile(pdfFile, "job-files");

      if (!fileUrl) {
        console.error("Failed to upload PDF to storage");
        toast({
          title: "Upload Failed",
          description:
            "Failed to upload the PDF, but you can still continue with manual entry.",
          variant: "destructive",
        });

        // Even if upload fails, continue to form with any extracted data
        if (extractionSuccessful) {
          setFormData((prev) => ({
            ...prev,
            ...extractedData,
          }));
        }

        setActiveTab("form");
        return;
      }

      // Update form with extracted data and the file URL
      setFormData((prev) => ({
        ...prev,
        ...(extractionSuccessful ? extractedData : {}),
        fileUrl: fileUrl, // Always set the fileUrl
      }));

      // Show appropriate toast based on extraction success
      if (extractionSuccessful) {
        toast({
          title: "PDF Processed Successfully",
          description:
            "Job information has been extracted. Please review and edit if needed.",
        });
      } else {
        toast({
          title: "Limited Data Extraction",
          description:
            "Limited information could be extracted from the PDF. The file has been attached, but please review and complete the form.",
          variant: "warning",
        });
      }

      // Switch to form tab regardless of extraction success/failure
      setActiveTab("form");
    } catch (error) {
      console.error("Error in PDF processing workflow:", error);
      toast({
        title: "Error Processing PDF",
        description:
          "An unexpected error occurred. Please try again or fill the form manually.",
        variant: "destructive",
      });
      setActiveTab("form");
    }
  };

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create New Job</h1>
        <p className="text-muted-foreground mt-1">
          Add a new job to the system by filling out the form or uploading a PDF
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="form">Manual Entry</TabsTrigger>
          <TabsTrigger value="upload">Upload PDF</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <form onSubmit={handleSubmit} noValidate>
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.keys(validationErrors).length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please correct the errors below before submitting.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className={
                        validationErrors.title ? "text-destructive" : ""
                      }
                    >
                      Invoice Number *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={
                        validationErrors.title ? "border-destructive" : ""
                      }
                      aria-invalid={!!validationErrors.title}
                    />
                    {validationErrors.title && (
                      <p className="text-sm text-destructive">
                        {validationErrors.title}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="client"
                      className={
                        validationErrors.client ? "text-destructive" : ""
                      }
                    >
                      Client Name *
                    </Label>
                    <Input
                      id="client"
                      name="client"
                      value={formData.client}
                      onChange={handleChange}
                      className={
                        validationErrors.client ? "border-destructive" : ""
                      }
                      aria-invalid={!!validationErrors.client}
                    />
                    {validationErrors.client && (
                      <p className="text-sm text-destructive">
                        {validationErrors.client}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className={
                      validationErrors.description ? "text-destructive" : ""
                    }
                  >
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className={
                      validationErrors.description ? "border-destructive" : ""
                    }
                    aria-invalid={!!validationErrors.description}
                  />
                  {validationErrors.description && (
                    <p className="text-sm text-destructive">
                      {validationErrors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleSelectChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">In Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        handleSelectChange("priority", value as JobPriority)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select
                      value={formData.jobType}
                      onValueChange={(value) =>
                        handleSelectChange("jobType", value as JobType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="embroidery">Embroidery</SelectItem>
                        <SelectItem value="screen_printing">
                          Screen Printing
                        </SelectItem>
                        <SelectItem value="digital_printing">
                          Digital Printing
                        </SelectItem>
                        <SelectItem value="wide_format">Wide Format</SelectItem>
                        <SelectItem value="central_facility">
                          Central Facility
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="deadline"
                      className={
                        validationErrors.deadline ? "text-destructive" : ""
                      }
                    >
                      Deadline *
                    </Label>
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={handleChange}
                      className={
                        validationErrors.deadline ? "border-destructive" : ""
                      }
                      aria-invalid={!!validationErrors.deadline}
                    />
                    {validationErrors.deadline && (
                      <p className="text-sm text-destructive">
                        {validationErrors.deadline}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Select
                      value={formData.assignedTo || "unassigned"}
                      onValueChange={(value) =>
                        handleSelectChange("assignedTo", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {staff.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="estimatedHours"
                      className={
                        validationErrors.estimatedHours
                          ? "text-destructive"
                          : ""
                      }
                    >
                      Estimated Hours *
                    </Label>
                    <Input
                      id="estimatedHours"
                      name="estimatedHours"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={formData.estimatedHours}
                      onChange={handleChange}
                      className={
                        validationErrors.estimatedHours
                          ? "border-destructive"
                          : ""
                      }
                      aria-invalid={!!validationErrors.estimatedHours}
                    />
                    {validationErrors.estimatedHours && (
                      <p className="text-sm text-destructive">
                        {validationErrors.estimatedHours}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fileUrl">File URL</Label>
                  <Input
                    id="fileUrl"
                    name="fileUrl"
                    value={formData.fileUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/files/job-file.pdf"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Additional information about the job"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Job</Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Job PDF</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      <Button
                        variant="outline"
                        type="button"
                        className="mt-2"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById("pdf-upload")?.click();
                        }}
                      >
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
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowPdfPreview(!showPdfPreview)}
                    className="flex items-center"
                  >
                    {showPdfPreview ? (
                      <>Hide Preview</>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview PDF
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleParsePdf}
                    className="flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Extract Job Data
                  </Button>
                </div>
              )}

              {showPdfPreview && pdfFile && (
                <div className="mt-4">
                  <PdfPreview
                    file={pdfFile}
                    onClose={() => setShowPdfPreview(false)}
                  />
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
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button onClick={() => setActiveTab("form")} disabled={!pdfFile}>
                Continue to Form
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
