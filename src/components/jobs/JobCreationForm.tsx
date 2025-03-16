import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { JobPriority, JobStatus, JobType, Job } from "@/types";
import { Button } from "@/components/ui/button";
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
import { toast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface JobCreationFormProps {
  onJobCreated?: (job: Job) => void;
}

export default function JobCreationForm({
  onJobCreated,
}: JobCreationFormProps) {
  const navigate = useNavigate();
  const { addJob } = useAppContext();
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    client: string;
    description: string;
    status: JobStatus;
    deadline: string;
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
      const newJob = addJob({
        ...formData,
        estimatedHours: Number(formData.estimatedHours),
      });

      toast({
        title: "Success",
        description: "Job created successfully",
      });

      // Store the created job ID
      if (newJob) {
        setCreatedJobId(newJob.id);
      }

      // Always call onJobCreated if a job was created successfully
      if (newJob && onJobCreated) {
        onJobCreated(newJob);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "There was a problem creating the job",
        variant: "destructive",
      });
    }
  };
  
  const handleScheduleJob = () => {
    // Navigate to the schedule page
    navigate("/schedule/new");
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Job Details</h2>

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="flex justify-end space-x-4">
          {createdJobId ? (
            <>
              <Button type="button" variant="outline" onClick={() => navigate("/jobs")}>
                View All Jobs
              </Button>
              <Button type="button" onClick={handleScheduleJob}>
                Schedule This Job
              </Button>
            </>
          ) : (
            <Button type="submit" variant="default">
              Create Job
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
