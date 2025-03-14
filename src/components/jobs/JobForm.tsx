import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Job, JobStatus, JobPriority, JobType } from "@/types";
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
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface JobFormProps {
  job?: Job;
  isEditing?: boolean;
}

export default function JobForm({
  job: propJob,
  isEditing: propIsEditing = false,
}: JobFormProps) {
  const { id } = useParams();
  const { getJobById } = useAppContext();

  // If we have an ID from the URL, we're editing
  const isEditing = propIsEditing || !!id;
  const job = propJob || (id ? getJobById(id) : undefined);
  const navigate = useNavigate();
  const { addJob, updateJob, staff } = useAppContext();

  const [formData, setFormData] = useState<{
    title: string;
    client: string;
    description: string;
    status: JobStatus;
    deadline: string;
    assignedTo?: string;
    priority: JobPriority;
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

  useEffect(() => {
    if (job && isEditing) {
      setFormData({
        title: job.title,
        client: job.client,
        description: job.description,
        status: job.status,
        deadline: job.deadline,
        assignedTo: job.assignedTo,
        priority: job.priority,
        jobType: job.jobType,
        fileUrl: job.fileUrl || "",
        estimatedHours: job.estimatedHours,
        notes: job.notes || "",
      });
    }
  }, [job, isEditing]);

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

  const handleSubmit = async (e: React.FormEvent) => {
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
      // Handle file URL - if it's a blob URL, we need to upload the file to storage
      let permanentFileUrl = formData.fileUrl;
      if (formData.fileUrl && formData.fileUrl.startsWith("blob:")) {
        // This is a temporary blob URL, we need to fetch the file and upload it
        try {
          const { uploadFile } = await import("@/lib/storage");
          const response = await fetch(formData.fileUrl);
          const blob = await response.blob();

          // Extract filename from the URL or use a default name
          let filename = "job-file.pdf";
          try {
            // Try to get the original filename from the URL
            const urlParts = new URL(formData.fileUrl).pathname.split("/");
            const lastPart = urlParts[urlParts.length - 1];
            if (lastPart && lastPart.includes(".")) {
              filename = lastPart;
            }
          } catch (e) {
            console.log("Could not parse filename from URL, using default");
          }

          const file = new File([blob], filename, {
            type: blob.type || "application/pdf",
          });

          console.log("Attempting to upload blob to permanent storage");
          const uploadedUrl = await uploadFile(file);

          if (uploadedUrl) {
            console.log("Successfully uploaded blob to permanent storage");
            permanentFileUrl = uploadedUrl;
          } else {
            console.warn(
              "Failed to upload to permanent storage, keeping blob URL",
            );
            // Continue with the blob URL if upload fails
          }
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          // Continue with the blob URL if upload fails
          toast({
            title: "File Storage Notice",
            description:
              "Using temporary storage for the file. It may not be available after the session ends.",
            variant: "warning",
          });
        }
      }

      if (isEditing && job) {
        updateJob({
          ...job,
          ...formData,
          fileUrl: permanentFileUrl,
          estimatedHours: Number(formData.estimatedHours),
          assignedTo:
            formData.assignedTo === "unassigned"
              ? undefined
              : formData.assignedTo,
        });
        toast({
          title: "Success",
          description: "Job updated successfully",
        });
        navigate(`/jobs/${job.id}`);
      } else {
        addJob({
          ...formData,
          fileUrl: permanentFileUrl,
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
        navigate("/schedule");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "There was a problem saving the job",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Job" : "Create New Job"}</CardTitle>
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
                className={validationErrors.title ? "text-destructive" : ""}
              >
                Invoice Number *
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={validationErrors.title ? "border-destructive" : ""}
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
                className={validationErrors.client ? "text-destructive" : ""}
              >
                Client Name *
              </Label>
              <Input
                id="client"
                name="client"
                value={formData.client}
                onChange={handleChange}
                className={validationErrors.client ? "border-destructive" : ""}
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
              className={validationErrors.description ? "text-destructive" : ""}
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
                onValueChange={(value) => handleSelectChange("status", value)}
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
                className={validationErrors.deadline ? "text-destructive" : ""}
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
                  validationErrors.estimatedHours ? "text-destructive" : ""
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
                  validationErrors.estimatedHours ? "border-destructive" : ""
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
            <Label htmlFor="fileUrl">Job Ticket File URL</Label>
            <div className="flex items-center gap-2">
              <Input
                id="fileUrl"
                name="fileUrl"
                value={formData.fileUrl}
                onChange={handleChange}
                placeholder="https://example.com/files/job-file.pdf"
              />
              {formData.fileUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(formData.fileUrl, "_blank")}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
            {formData.fileUrl && formData.fileUrl.startsWith("blob:") && (
              <p className="text-xs text-amber-600 mt-1">
                Note: This file is stored temporarily. In a production
                environment, files would be stored permanently in cloud storage.
              </p>
            )}
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
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? "Update Job" : "Create Job"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
