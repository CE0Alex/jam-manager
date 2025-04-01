import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { ScheduleEvent } from "@/types";
import { toast } from "@/components/ui/use-toast";
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
import { format, addHours } from "date-fns";
import { detectScheduleConflicts } from "@/lib/scheduling";

interface ScheduleEventFormProps {
  event?: ScheduleEvent;
  isEditing?: boolean;
}

export default function ScheduleEventForm({
  event,
  isEditing = false,
}: ScheduleEventFormProps) {
  const navigate = useNavigate();
  const { addScheduleEvent, updateScheduleEvent, jobs, staff, schedule } =
    useAppContext();

  // Format date and time for input fields
  const formatDateTimeForInput = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: format(date, "yyyy-MM-dd"),
      time: format(date, "HH:mm"),
    };
  };

  const [formData, setFormData] = useState<{
    jobId: string;
    staffId: string;
    startDate: string;
    startTime: string;
    notes: string;
  }>({
    jobId: "",
    staffId: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    notes: "",
  });

  // Selected job for duration calculation
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    if (event && isEditing) {
      const { date: startDate, time: startTime } = formatDateTimeForInput(
        event.startTime,
      );

      setFormData({
        jobId: event.jobId,
        staffId: event.staffId || "",
        startDate,
        startTime,
        notes: event.notes || "",
      });

      // Find the job to get its estimated hours
      const job = jobs.find((j) => j.id === event.jobId);
      if (job) {
        setSelectedJob(job);
      }
    }
  }, [event, isEditing, jobs]);

  // Update selected job when jobId changes
  useEffect(() => {
    if (formData.jobId) {
      const job = jobs.find((j) => j.id === formData.jobId);
      if (job) {
        setSelectedJob(job);
      }
    } else {
      setSelectedJob(null);
    }
  }, [formData.jobId, jobs]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateEndTime = () => {
    if (!selectedJob || !formData.startDate || !formData.startTime) {
      return { endDate: formData.startDate, endTime: formData.startTime };
    }

    const estimatedHours = selectedJob.estimatedHours || 1;
    const startDateTime = new Date(
      `${formData.startDate}T${formData.startTime}:00`,
    );
    const endDateTime = addHours(startDateTime, estimatedHours);

    return {
      endDate: format(endDateTime, "yyyy-MM-dd"),
      endTime: format(endDateTime, "HH:mm"),
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedJob) {
      toast({
        title: "Job Required",
        description: "Please select a job to schedule",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time into ISO strings
    const startTime = `${formData.startDate}T${formData.startTime}:00`;
    const { endDate, endTime } = calculateEndTime();
    const endTimeISO = `${endDate}T${endTime}:00`;

    // Create a temporary event object for conflict detection
    const tempEvent: ScheduleEvent = {
      id: event?.id || `temp-${Date.now()}`,
      jobId: formData.jobId,
      staffId: formData.staffId || undefined,
      startTime,
      endTime: endTimeISO,
      notes: formData.notes || undefined,
    };

    // Use the main conflict detection function
    const conflicts = detectScheduleConflicts(
      tempEvent,
      schedule,
      staff,
      isEditing
    );

    if (conflicts.length > 0) {
      toast({
        title: "Scheduling Conflict",
        description: conflicts[0].message,
        variant: "destructive",
      });
      return;
    }

    if (isEditing && event) {
      updateScheduleEvent({
        ...event,
        jobId: formData.jobId,
        staffId: formData.staffId || undefined,
        startTime,
        endTime: endTimeISO,
        notes: formData.notes || undefined,
      });
      navigate(`/schedule`);
    } else {
      addScheduleEvent({
        jobId: formData.jobId,
        staffId: formData.staffId || undefined,
        startTime,
        endTime: endTimeISO,
        notes: formData.notes || undefined,
      });
      navigate("/schedule");
    }
  };

  // Filter out completed and cancelled jobs
  const availableJobs = jobs.filter(
    (job) => job.status !== "completed" && job.status !== "cancelled",
  );

  // Calculate end time for display
  const { endDate, endTime } = calculateEndTime();

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Schedule Event" : "Create New Schedule Event"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobId">Job *</Label>
            <Select
              value={formData.jobId}
              onValueChange={(value) => handleSelectChange("jobId", value)}
              required
            >
              <SelectTrigger>
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
                      {job.title} ({job.estimatedHours}h)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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
                <SelectItem value="">Unassigned</SelectItem>
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
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
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

          {selectedJob && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h3 className="font-medium mb-2">Calculated Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Start:</span>{" "}
                  {formData.startDate} at {formData.startTime}
                </div>
                <div>
                  <span className="text-gray-500">End:</span> {endDate} at{" "}
                  {endTime}
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-500">Duration:</span>{" "}
                  {selectedJob.estimatedHours} hour(s) based on job estimate
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional information about the schedule"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? "Update Event" : "Create Event"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
