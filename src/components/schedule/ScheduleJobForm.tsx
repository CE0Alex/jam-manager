import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { ScheduleEvent } from "@/types";
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

export default function ScheduleJobForm() {
  const navigate = useNavigate();
  const { jobs, staff, addScheduleEvent } = useAppContext();

  const [formData, setFormData] = useState<{
    jobId: string;
    staffId: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    notes: string;
  }>({
    jobId: "",
    staffId: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endDate: format(new Date(), "yyyy-MM-dd"),
    endTime: "10:30",
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

    if (!formData.jobId) {
      errors.jobId = "Job selection is required";
    }

    if (!formData.startDate || !formData.startTime) {
      errors.startDate = "Start date and time are required";
    }

    if (!formData.endDate || !formData.endTime) {
      errors.endDate = "End date and time are required";
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

    // Combine date and time into ISO strings
    const startTime = `${formData.startDate}T${formData.startTime}:00`;
    const endTime = `${formData.endDate}T${formData.endTime}:00`;

    try {
      addScheduleEvent({
        jobId: formData.jobId,
        staffId: formData.staffId || undefined,
        startTime,
        endTime,
        notes: formData.notes || undefined,
      });

      toast({
        title: "Success",
        description: "Job scheduled successfully",
      });
      navigate("/schedule");
    } catch (error) {
      console.error("Error scheduling job:", error);
      toast({
        title: "Error",
        description: "There was a problem scheduling the job",
        variant: "destructive",
      });
    }
  };

  // Filter out completed and cancelled jobs
  const availableJobs = jobs.filter(
    (job) => job.status !== "completed" && job.status !== "cancelled",
  );

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Schedule Existing Job
        </h1>
        <p className="text-muted-foreground mt-1">
          Add a job to the production schedule by selecting from existing jobs
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Schedule Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="jobId"
                className={validationErrors.jobId ? "text-destructive" : ""}
              >
                Job *
              </Label>
              <Select
                value={formData.jobId}
                onValueChange={(value) => handleSelectChange("jobId", value)}
                required
              >
                <SelectTrigger
                  className={validationErrors.jobId ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {availableJobs.length === 0 ? (
                    <SelectItem value="" disabled>
                      No active jobs available
                    </SelectItem>
                  ) : (
                    availableJobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} - {job.client}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {validationErrors.jobId && (
                <p className="text-sm text-destructive">
                  {validationErrors.jobId}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staffId">Assigned Staff</Label>
              <Select
                value={formData.staffId}
                onValueChange={(value) => handleSelectChange("staffId", value)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="startDate"
                  className={
                    validationErrors.startDate ? "text-destructive" : ""
                  }
                >
                  Start Date *
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={
                    validationErrors.startDate ? "border-destructive" : ""
                  }
                  required
                />
                {validationErrors.startDate && (
                  <p className="text-sm text-destructive">
                    {validationErrors.startDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(value) =>
                    handleSelectChange("startTime", value)
                  }
                  required
                >
                  <SelectTrigger id="startTime">
                    <SelectValue placeholder="Start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 19 }, (_, i) => {
                      const hour = Math.floor(i / 2) + 8;
                      const minute = i % 2 === 0 ? "00" : "30";
                      const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                      const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
                      return (
                        <SelectItem key={time} value={time}>
                          {displayTime}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="endDate"
                  className={validationErrors.endDate ? "text-destructive" : ""}
                >
                  End Date *
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={
                    validationErrors.endDate ? "border-destructive" : ""
                  }
                  required
                />
                {validationErrors.endDate && (
                  <p className="text-sm text-destructive">
                    {validationErrors.endDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Select
                  value={formData.endTime}
                  onValueChange={(value) =>
                    handleSelectChange("endTime", value)
                  }
                  required
                >
                  <SelectTrigger id="endTime">
                    <SelectValue placeholder="End time" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 19 }, (_, i) => {
                      const hour = Math.floor(i / 2) + 8;
                      const minute = i % 2 === 0 ? "00" : "30";
                      const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                      const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
                      return (
                        <SelectItem key={time} value={time}>
                          {displayTime}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional information about this schedule"
                rows={3}
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
            <Button type="submit">Schedule Job</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
