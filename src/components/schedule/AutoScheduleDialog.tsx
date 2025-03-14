import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Wand2, AlertTriangle } from "lucide-react";
import { Job } from "@/types";

interface AutoScheduleDialogProps {
  trigger?: React.ReactNode;
  onScheduleSuccess?: () => void;
}

export default function AutoScheduleDialog({
  trigger,
  onScheduleSuccess,
}: AutoScheduleDialogProps) {
  const { jobs, autoScheduleJob } = useAppContext();
  const [open, setOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);

  // Get unscheduled jobs (pending or in_progress without events)
  const unscheduledJobs = jobs.filter(
    (job) =>
      (job.status === "pending" || job.status === "in_progress") &&
      !job.assignedTo,
  );

  const handleToggleJob = (jobId: string) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId],
    );
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === unscheduledJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(unscheduledJobs.map((job) => job.id));
    }
  };

  const handleAutoSchedule = async () => {
    if (selectedJobs.length === 0) {
      toast({
        title: "No jobs selected",
        description: "Please select at least one job to schedule",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);

    // Track results
    const results = {
      success: 0,
      failed: 0,
    };

    // Process each selected job
    for (const jobId of selectedJobs) {
      const result = autoScheduleJob(jobId);
      if (result) {
        results.success++;
      } else {
        results.failed++;
      }
    }

    setIsScheduling(false);

    // Show results
    if (results.success > 0) {
      toast({
        title: "Auto-scheduling complete",
        description: `Successfully scheduled ${results.success} job${results.success !== 1 ? "s" : ""}${results.failed > 0 ? `. Failed to schedule ${results.failed} job${results.failed !== 1 ? "s" : ""}.` : ""}`,
      });

      // Close dialog and call success callback
      setOpen(false);
      if (onScheduleSuccess) {
        onScheduleSuccess();
      }
    } else {
      toast({
        title: "Auto-scheduling failed",
        description:
          "Could not find suitable time slots for the selected jobs. Please try scheduling manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Wand2 className="h-4 w-4 mr-2" />
            Auto-Schedule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Auto-Schedule Jobs</DialogTitle>
          <DialogDescription>
            Automatically schedule unassigned jobs based on staff availability,
            machine capacity, and job priorities.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {unscheduledJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No unscheduled jobs found. All jobs are either already scheduled
                or completed.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Select Jobs to Schedule
                </Label>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedJobs.length === unscheduledJobs.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
                {unscheduledJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center space-x-3 p-3 hover:bg-muted/50"
                  >
                    <Checkbox
                      id={`job-${job.id}`}
                      checked={selectedJobs.includes(job.id)}
                      onCheckedChange={() => handleToggleJob(job.id)}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`job-${job.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {job.title}
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        {job.client} • Due{" "}
                        {format(new Date(job.deadline), "MMM d, yyyy")}
                      </div>
                    </div>
                    <div className="text-sm">{job.estimatedHours} hrs</div>
                  </div>
                ))}
              </div>

              <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium text-yellow-800">
                    Auto-scheduling considerations:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>
                      Jobs will be scheduled based on staff availability and
                      machine capacity
                    </li>
                    <li>
                      Priority will be given to jobs with earlier deadlines
                    </li>
                    <li>
                      Some jobs may not be scheduled if no suitable time slots
                      are found
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAutoSchedule}
            disabled={selectedJobs.length === 0 || isScheduling}
          >
            {isScheduling ? "Scheduling..." : "Auto-Schedule Selected Jobs"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
