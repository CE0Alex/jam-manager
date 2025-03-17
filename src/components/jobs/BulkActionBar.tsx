import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Archive, 
  Trash2, 
  Edit, 
  Tag, 
  Users, 
  Calendar,
  AlertTriangle
} from "lucide-react";
import { JobStatus, JobPriority } from "@/types";
import { useAppContext } from "@/context/AppContext";

interface BulkActionBarProps {
  selectedJobIds: string[];
  onClearSelection: () => void;
  onActionComplete: () => void;
}

type ActionType = 'status' | 'priority' | 'archive' | 'delete' | 'reassign' | 'schedule';

// Helper functions for formatting
const formatStatus = (status: JobStatus): string => {
  const statusMap: Record<JobStatus, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    review: "In Review",
    completed: "Completed",
    cancelled: "Cancelled",
    archived: "Archived"
  };
  return statusMap[status] || status;
};

const formatPriority = (priority: JobPriority): string => {
  const priorityMap: Record<JobPriority, string> = {
    low: "Low",
    medium: "Medium", 
    high: "High",
    urgent: "Urgent"
  };
  return priorityMap[priority] || priority;
};

export default function BulkActionBar({ 
  selectedJobIds, 
  onClearSelection,
  onActionComplete
}: BulkActionBarProps) {
  const { jobs, staff, updateJob, deleteJob } = useAppContext();
  const navigate = useNavigate();
  
  const [showDialog, setShowDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
  const [newStatus, setNewStatus] = useState<JobStatus>("pending");
  const [newPriority, setPriority] = useState<JobPriority>("medium");
  const [newStaffId, setNewStaffId] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Get count of selected jobs
  const selectedCount = selectedJobIds.length;
  
  // Get selected jobs data
  const selectedJobs = jobs.filter(job => selectedJobIds.includes(job.id));

  const handleAction = (action: ActionType) => {
    setCurrentAction(action);
    setShowDialog(true);
  };

  const executeAction = async () => {
    if (selectedJobIds.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      switch (currentAction) {
        case 'status':
          if (!newStatus) {
            toast({
              title: "Error",
              description: "Please select a status",
              variant: "destructive"
            });
            setIsProcessing(false);
            return;
          }
          
          // Get the existing jobs to update
          const jobsToUpdate = jobs.filter(job => selectedJobIds.includes(job.id));
          
          // Track any jobs that failed to update
          const failedJobs: string[] = [];
          
          // Update each job individually to avoid batch failures
          for (const job of jobsToUpdate) {
            try {
              const updatedJob = {
                ...job,
                status: newStatus,
                updatedAt: new Date().toISOString()
              };
              updateJob(updatedJob);
            } catch (updateError) {
              console.error(`Failed to update job ${job.id}:`, updateError);
              failedJobs.push(job.title);
            }
          }
          
          // Provide appropriate feedback
          if (failedJobs.length > 0) {
            if (failedJobs.length === jobsToUpdate.length) {
              // All updates failed
              toast({
                title: "Update Failed",
                description: "Failed to update any of the selected jobs.",
                variant: "destructive"
              });
            } else {
              // Some updates failed
              toast({
                title: "Partial Update",
                description: `Updated ${jobsToUpdate.length - failedJobs.length} jobs, but ${failedJobs.length} failed.`,
                variant: "default"
              });
            }
          } else {
            // All updates succeeded
            toast({
              title: `${selectedJobIds.length} Jobs Updated`,
              description: `All jobs have been updated to status: ${formatStatus(newStatus)}`
            });
          }
          break;
          
        case 'priority':
          // Similar implementation for priority updates
          if (!newPriority) {
            toast({
              title: "Error",
              description: "Please select a priority level",
              variant: "destructive"
            });
            setIsProcessing(false);
            return;
          }
          
          // Get jobs to update priority
          const priorityJobsToUpdate = jobs.filter(job => selectedJobIds.includes(job.id));
          const priorityFailedJobs: string[] = [];
          
          // Update each job individually
          for (const job of priorityJobsToUpdate) {
            try {
              const updatedJob = {
                ...job,
                priority: newPriority,
                updatedAt: new Date().toISOString()
              };
              updateJob(updatedJob);
            } catch (updateError) {
              console.error(`Failed to update priority for job ${job.id}:`, updateError);
              priorityFailedJobs.push(job.title);
            }
          }
          
          // Provide feedback
          if (priorityFailedJobs.length > 0) {
            if (priorityFailedJobs.length === priorityJobsToUpdate.length) {
              toast({
                title: "Update Failed",
                description: "Failed to update priority for any of the selected jobs.",
                variant: "destructive"
              });
            } else {
              toast({
                title: "Partial Update", 
                description: `Updated priority for ${priorityJobsToUpdate.length - priorityFailedJobs.length} jobs, but ${priorityFailedJobs.length} failed.`,
                variant: "default"
              });
            }
          } else {
            toast({
              title: `${selectedJobIds.length} Jobs Updated`,
              description: `All jobs have been updated to priority: ${formatPriority(newPriority)}`
            });
          }
          break;
          
        case 'archive':
          console.log(`Archiving ${selectedJobIds.length} jobs`);
          jobs.forEach(job => {
            console.log(`Archiving job ${job.id}`);
            updateJob({
              ...job,
              status: 'archived' as JobStatus
            });
          });
          break;

        case 'delete':
          if (deleteConfirmation !== `delete-${selectedCount}`) {
            return; // Don't proceed if confirmation doesn't match
          }
          
          console.log(`Deleting ${selectedJobIds.length} jobs`);
          // Create a copy of the array to avoid issues with array mutations during iteration
          const jobIdsToDelete = [...selectedJobIds];
          
          // Delete all jobs without awaiting between deletions
          jobIdsToDelete.forEach(jobId => {
            console.log(`Deleting job: ${jobId}`);
            deleteJob(jobId);
          });
          break;

        case 'reassign':
          console.log(`Reassigning ${selectedJobIds.length} jobs to staff: ${newStaffId || 'unassigned'}`);
          jobs.forEach(job => {
            console.log(`Reassigning job ${job.id} to staff: ${newStaffId || 'unassigned'}`);
            updateJob({
              ...job,
              assignedTo: newStaffId || undefined
            });
          });
          break;

        case 'schedule':
          // Navigate to scheduling interface with selected job IDs
          navigate('/schedule', { state: { bulkScheduleJobs: selectedJobIds } });
          break;

        default:
          toast({
            title: "Action Not Implemented",
            description: `The action '${currentAction}' is not implemented yet.`,
            variant: "default"
          });
      }

      onActionComplete();
      setShowDialog(false);
      onClearSelection();
    } catch (error) {
      console.error("Error executing bulk action:", error);
      toast({
        title: "Error",
        description: `Failed to ${currentAction} the selected jobs. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderDialogContent = () => {
    switch (currentAction) {
      case 'status':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Change Status for {selectedCount} Jobs</DialogTitle>
              <DialogDescription>
                Select a new status to apply to all selected jobs.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="new-status">New Status</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as JobStatus)}>
                <SelectTrigger id="new-status">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">In Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'priority':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Change Priority for {selectedCount} Jobs</DialogTitle>
              <DialogDescription>
                Select a new priority level to apply to all selected jobs.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="new-priority">New Priority</Label>
              <Select value={newPriority} onValueChange={(value) => setPriority(value as JobPriority)}>
                <SelectTrigger id="new-priority">
                  <SelectValue placeholder="Select a priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'archive':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Archive {selectedCount} Jobs</DialogTitle>
              <DialogDescription>
                Are you sure you want to archive these jobs? They will be moved to the archive and hidden from the main job list.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>This action will archive the following jobs:</p>
              <ul className="mt-2 ml-6 list-disc">
                {selectedJobs.slice(0, 5).map(job => (
                  <li key={job.id} className="text-sm">{job.title} - {job.client}</li>
                ))}
                {selectedJobs.length > 5 && (
                  <li className="text-sm italic">...and {selectedJobs.length - 5} more</li>
                )}
              </ul>
            </div>
          </>
        );

      case 'delete':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center text-destructive">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Delete {selectedCount} Jobs
              </DialogTitle>
              <DialogDescription>
                This action is irreversible. These jobs will be permanently deleted from the system.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-2">You are about to delete:</p>
              <ul className="mt-2 ml-6 list-disc">
                {selectedJobs.slice(0, 5).map(job => (
                  <li key={job.id} className="text-sm">{job.title} - {job.client}</li>
                ))}
                {selectedJobs.length > 5 && (
                  <li className="text-sm italic">...and {selectedJobs.length - 5} more</li>
                )}
              </ul>
              
              <div className="mt-4 border border-destructive/50 rounded-md p-4 bg-destructive/5">
                <Label htmlFor="delete-confirmation" className="text-destructive font-medium block mb-2">
                  Type "delete-{selectedCount}" to confirm:
                </Label>
                <Input 
                  id="delete-confirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="border-destructive"
                />
              </div>
            </div>
          </>
        );

      case 'reassign':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Reassign {selectedCount} Jobs</DialogTitle>
              <DialogDescription>
                Select a staff member to assign these jobs to. Leave blank to unassign.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="staff-assignment">Assign to Staff</Label>
              <Select value={newStaffId} onValueChange={setNewStaffId}>
                <SelectTrigger id="staff-assignment">
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassign</SelectItem>
                  {staff.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'schedule':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Schedule {selectedCount} Jobs</DialogTitle>
              <DialogDescription>
                The selected jobs will be added to the scheduling interface.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>You'll be redirected to the scheduling interface to assign dates and times for:</p>
              <ul className="mt-2 ml-6 list-disc">
                {selectedJobs.slice(0, 5).map(job => (
                  <li key={job.id} className="text-sm">{job.title} - {job.client}</li>
                ))}
                {selectedJobs.length > 5 && (
                  <li className="text-sm italic">...and {selectedJobs.length - 5} more</li>
                )}
              </ul>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const getDialogActionLabel = () => {
    switch (currentAction) {
      case 'status': return 'Change Status';
      case 'priority': return 'Change Priority';
      case 'archive': return 'Archive Jobs';
      case 'delete': return 'Delete Jobs';
      case 'reassign': return 'Reassign Jobs';
      case 'schedule': return 'Continue to Scheduling';
      default: return 'Continue';
    }
  };

  if (selectedJobIds.length === 0) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-md px-4 py-3 mb-4 flex items-center justify-between">
      <div className="flex items-center">
        <span className="font-medium mr-2">{selectedCount} jobs selected</span>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Clear
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleAction('status')}
          className="flex items-center"
        >
          <Tag className="h-4 w-4 mr-1" />
          Status
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleAction('priority')}
          className="flex items-center"
        >
          <Tag className="h-4 w-4 mr-1" />
          Priority
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleAction('reassign')}
          className="flex items-center"
        >
          <Users className="h-4 w-4 mr-1" />
          Reassign
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleAction('schedule')}
          className="flex items-center"
        >
          <Calendar className="h-4 w-4 mr-1" />
          Schedule
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleAction('archive')}
          className="flex items-center"
        >
          <Archive className="h-4 w-4 mr-1" />
          Archive
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleAction('delete')}
          className="flex items-center text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
      
      {/* Bulk Action Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          {renderDialogContent()}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              variant={currentAction === 'delete' ? 'destructive' : 'default'} 
              onClick={executeAction}
              disabled={
                isProcessing || 
                (currentAction === 'delete' && deleteConfirmation !== `delete-${selectedCount}`)
              }
            >
              {isProcessing ? 'Processing...' : getDialogActionLabel()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
