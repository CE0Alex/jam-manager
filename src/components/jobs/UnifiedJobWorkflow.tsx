import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { format, addHours } from "date-fns";
import { ArrowRight, Calendar, Check } from "lucide-react";
import JobCreationForm from "./JobCreationForm";
import JobsTable from "./JobsTable";
import JobsFilter from "./JobsFilter";
import { Job, JobStatus, JobPriority, JobType, ScheduleEvent } from "@/types";

interface UnifiedJobWorkflowProps {
  initialTab?: "jobs" | "create";
}

export default function UnifiedJobWorkflow({
  initialTab = "jobs",
}: UnifiedJobWorkflowProps) {
  const navigate = useNavigate();
  const { jobs, addJob, addScheduleEvent, staff, schedule } = useAppContext();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [createdJob, setCreatedJob] = useState<Job | null>(null);
  const [schedulingStep, setSchedulingStep] = useState<boolean>(false);

  // Form data for scheduling
  const [scheduleData, setScheduleData] = useState<{
    staffId: string;
    startDate: string;
    startTime: string;
    notes: string;
  }>({
    staffId: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    notes: "",
  });

  // Handle job creation
  const handleJobCreated = (job: Job) => {
    setCreatedJob(job);
    setSchedulingStep(true);
    setActiveTab("jobs"); // Ensure we're on the jobs tab
    toast({
      title: "Job Created",
      description: "Now let's schedule this job",
    });
  };

  // Handle job selection for scheduling
  const handleJobSelected = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setCreatedJob(job);
      setSchedulingStep(true);
    }
  };

  // Handle schedule data change
  const handleScheduleChange = (name: string, value: string) => {
    setScheduleData((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate end time based on job's estimated hours
  const calculateEndTime = () => {
    if (!createdJob || !scheduleData.startDate || !scheduleData.startTime) {
      return {
        endDate: scheduleData.startDate,
        endTime: scheduleData.startTime,
      };
    }

    const estimatedHours = createdJob.estimatedHours || 1;
    const startDateTime = new Date(
      `${scheduleData.startDate}T${scheduleData.startTime}:00`,
    );
    const endDateTime = addHours(startDateTime, estimatedHours);

    return {
      endDate: format(endDateTime, "yyyy-MM-dd"),
      endTime: format(endDateTime, "HH:mm"),
    };
  };

  // Check if staff member is available
  const checkStaffAvailability = (
    staffId: string,
    startTime: Date,
    endTime: Date,
  ) => {
    if (!staffId) return true; // If no staff assigned, no conflict

    // Get all events for this staff member
    const staffEvents = schedule.filter((event) => event.staffId === staffId);

    // Check for time conflicts
    return !staffEvents.some((event) => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);

      // Check if there's an overlap
      return startTime < eventEnd && endTime > eventStart;
    });
  };

  // Handle schedule submission
  const handleScheduleSubmit = () => {
    if (!createdJob) return;

    // Combine date and time into ISO strings
    const startTime = `${scheduleData.startDate}T${scheduleData.startTime}:00`;
    const { endDate, endTime } = calculateEndTime();
    const endTimeISO = `${endDate}T${endTime}:00`;

    // Check staff availability if staff is assigned
    if (scheduleData.staffId) {
      const isAvailable = checkStaffAvailability(
        scheduleData.staffId,
        new Date(startTime),
        new Date(endTimeISO),
      );

      if (!isAvailable) {
        toast({
          title: "Scheduling Conflict",
          description:
            "This staff member is already scheduled during this time period.",
          variant: "destructive",
        });
        return;
      }
    }

    // Create schedule event
    addScheduleEvent({
      jobId: createdJob.id,
      staffId: scheduleData.staffId || undefined,
      startTime,
      endTime: endTimeISO,
      notes: scheduleData.notes || undefined,
    });

    toast({
      title: "Success",
      description: "Job scheduled successfully",
    });

    // Reset and go back to jobs list
    setCreatedJob(null);
    setSchedulingStep(false);
    setActiveTab("jobs");
  };

  // Handle job actions
  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleEditJob = (jobId: string) => {
    navigate(`/jobs/${jobId}/edit`);
  };

  const handleDeleteJob = (jobId: string) => {
    // Implement delete confirmation
  };

  const handleAssignJob = (jobId: string) => {
    handleJobSelected(jobId);
  };

  // Render scheduling step
  const renderSchedulingStep = () => {
    if (!createdJob) return null;

    const { endDate, endTime } = calculateEndTime();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Schedule Job: {createdJob.title}
          </h2>
          <Button
            variant="outline"
            onClick={() => {
              setSchedulingStep(false);
              setCreatedJob(null);
            }}
          >
            Back to Jobs
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-medium mb-4">Job Details</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Invoice:</span> {createdJob.title}
              </div>
              <div>
                <span className="font-medium">Client:</span> {createdJob.client}
              </div>
              <div>
                <span className="font-medium">Description:</span>{" "}
                {createdJob.description}
              </div>
              <div>
                <span className="font-medium">Deadline:</span>{" "}
                {format(new Date(createdJob.deadline), "MMM d, yyyy")}
              </div>
              <div>
                <span className="font-medium">Estimated Hours:</span>{" "}
                {createdJob.estimatedHours}
              </div>
              <div>
                <span className="font-medium">Priority:</span>{" "}
                {createdJob.priority}
              </div>
              <div>
                <span className="font-medium">Job Type:</span>{" "}
                {createdJob.jobType.replace("_", " ")}
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-medium mb-4">Schedule Details</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Assigned Staff
                </label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={scheduleData.staffId}
                  onChange={(e) =>
                    handleScheduleChange("staffId", e.target.value)
                  }
                >
                  <option value="">Unassigned</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-md bg-background"
                    value={scheduleData.startDate}
                    onChange={(e) =>
                      handleScheduleChange("startDate", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Start Time
                  </label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={scheduleData.startTime}
                    onChange={(e) =>
                      handleScheduleChange("startTime", e.target.value)
                    }
                  >
                    {Array.from({ length: 19 }, (_, i) => {
                      const hour = Math.floor(i / 2) + 8;
                      const minute = i % 2 === 0 ? "00" : "30";
                      const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                      const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
                      return (
                        <option key={time} value={time}>
                          {displayTime}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium mb-2">Calculated Schedule</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Start:</span>{" "}
                    {scheduleData.startDate} at {scheduleData.startTime}
                  </div>
                  <div>
                    <span className="text-gray-500">End:</span> {endDate} at{" "}
                    {endTime}
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Duration:</span>{" "}
                    {createdJob.estimatedHours} hour(s) based on job estimate
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Notes</label>
                <textarea
                  className="w-full p-2 border rounded-md bg-background"
                  rows={3}
                  value={scheduleData.notes}
                  onChange={(e) =>
                    handleScheduleChange("notes", e.target.value)
                  }
                  placeholder="Additional information about this schedule"
                ></textarea>
              </div>

              <Button className="w-full mt-4" onClick={handleScheduleSubmit}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Job
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {schedulingStep ? (
        renderSchedulingStep()
      ) : (
        <>
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Job Management
            </h1>
            <p className="text-muted-foreground">
              Create, view, and schedule jobs in one unified workflow
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="jobs">View Jobs</TabsTrigger>
              <TabsTrigger value="create">Create New Job</TabsTrigger>
            </TabsList>

            <TabsContent value="jobs" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">All Jobs</h2>
                <Button onClick={() => setActiveTab("create")}>
                  Create New Job
                </Button>
              </div>

              <JobsFilter />

              <JobsTable
                jobs={jobs}
                onViewJob={handleViewJob}
                onEditJob={handleEditJob}
                onDeleteJob={handleDeleteJob}
                onAssignJob={handleAssignJob}
              />
            </TabsContent>

            <TabsContent value="create">
              <div className="bg-card rounded-lg border p-6">
                <JobCreationForm onJobCreated={handleJobCreated} />
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
