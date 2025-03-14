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

interface ScheduleEventFormProps {
  event?: ScheduleEvent;
  isEditing?: boolean;
}

export default function ScheduleEventForm({
  event,
  isEditing = false,
}: ScheduleEventFormProps) {
  const navigate = useNavigate();
  const { addScheduleEvent, updateScheduleEvent, jobs, staff } =
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

  useEffect(() => {
    if (event && isEditing) {
      const { date: startDate, time: startTime } = formatDateTimeForInput(
        event.startTime,
      );
      const { date: endDate, time: endTime } = formatDateTimeForInput(
        event.endTime,
      );

      setFormData({
        jobId: event.jobId,
        staffId: event.staffId || "",
        startDate,
        startTime,
        endDate,
        endTime,
        notes: event.notes || "",
      });
    }
  }, [event, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Combine date and time into ISO strings
    const startTime = `${formData.startDate}T${formData.startTime}:00`;
    const endTime = `${formData.endDate}T${formData.endTime}:00`;

    if (isEditing && event) {
      updateScheduleEvent({
        ...event,
        jobId: formData.jobId,
        staffId: formData.staffId || undefined,
        startTime,
        endTime,
        notes: formData.notes || undefined,
      });
      navigate(`/schedule`);
    } else {
      addScheduleEvent({
        jobId: formData.jobId,
        staffId: formData.staffId || undefined,
        startTime,
        endTime,
        notes: formData.notes || undefined,
      });
      navigate("/schedule");
    }
  };

  // Filter out completed and cancelled jobs
  const availableJobs = jobs.filter(
    (job) => job.status !== "completed" && job.status !== "cancelled",
  );

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
                      {job.title}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Select
                value={formData.endTime}
                onValueChange={(value) => handleSelectChange("endTime", value)}
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
