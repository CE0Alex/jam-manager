import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { ScheduleEvent } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addMinutes } from "date-fns";
import { formatTime12Hour, generateTimeOptions } from "@/lib/timeUtils";
import { toast } from "@/components/ui/use-toast";
import { Calendar, CalendarClock, Check, RefreshCcw, Wand2 } from "lucide-react";
import { detectScheduleConflicts } from "@/lib/scheduling";
import ScheduleConflictAlert from "./ScheduleConflictAlert";
import ScheduleSuggestions from "./ScheduleSuggestions";

export default function ScheduleJobForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobs, staff, schedule, settings, addScheduleEvent, getJobById, jobTypes } = useAppContext();

  const [activeTab, setActiveTab] = useState<string>("manual");
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

  const [conflicts, setConflicts] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [scheduleSuggestions, setScheduleSuggestions] = useState<any[]>([]);
  const [showIgnoreConflictsButton, setShowIgnoreConflictsButton] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

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
    
    // Clear conflicts when form changes
    setConflicts([]);
    setShowIgnoreConflictsButton(false);
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
    
    // Clear conflicts when form changes
    setConflicts([]);
    setShowIgnoreConflictsButton(false);
    
    // If job is selected, update the suggestions
    if (name === "jobId" && value) {
      generateSuggestions(value);
    }
    
    // Check staff availability when staff is selected
    if (name === "staffId" && value && value !== "unassigned") {
      const selectedStaff = staff.find(member => member.id === value);
      const selectedDate = new Date(formData.startDate);
      const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(selectedDate).toLowerCase();
      
      if (selectedStaff && !selectedStaff.availability[dayOfWeek as keyof typeof selectedStaff.availability]) {
        toast({
          title: "Staff Not Available",
          description: `${selectedStaff.name} is not available on ${dayOfWeek}s.`,
          variant: "destructive",
        });
      }
      
      // Regenerate suggestions when staff changes
      if (formData.jobId) {
        generateSuggestions(formData.jobId);
      }
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

    // Validate that end time is after start time
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}:00`);
    
    if (endDateTime <= startDateTime) {
      errors.endTime = "End time must be after start time";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkForConflicts = () => {
    if (!validateForm()) {
      return true; // Has validation errors
    }

    // Create a temporary event object to check for conflicts
    const tempEvent: ScheduleEvent = {
      id: "temp-event",
      jobId: formData.jobId,
      staffId: formData.staffId === "unassigned" ? undefined : formData.staffId,
      startTime: `${formData.startDate}T${formData.startTime}:00`,
      endTime: `${formData.endDate}T${formData.endTime}:00`,
      notes: formData.notes,
    };

    // Check for conflicts
    const detectedConflicts = detectScheduleConflicts(tempEvent, schedule, staff);
    
    setConflicts(detectedConflicts);
    return detectedConflicts.length > 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jobId || !formData.staffId || !formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const job = getJobById(formData.jobId);
    if (!job) {
      toast({
        title: "Error",
        description: "Job not found",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Format times for API
      const startDateTime = new Date(formData.startDate);
      const [startHour, startMinute] = formData.startTime.split(':').map(Number);
      startDateTime.setHours(startHour, startMinute, 0, 0);
      
      const endDateTime = new Date(formData.endDate);
      const [endHour, endMinute] = formData.endTime.split(':').map(Number);
      endDateTime.setHours(endHour, endMinute, 0, 0);
      
      // Create event object
      const event: Omit<ScheduleEvent, "id"> = {
        jobId: job.id,
        staffId: formData.staffId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        notes: formData.notes || "",
      };
      
      // Schedule the job
      const result = addScheduleEvent(event);
      
      // Handle the response which includes both the event and conflicts
      if (result && 'conflicts' in result && result.conflicts.length > 0) {
        // If there are conflicts, show them to the user
        const errorConflicts = result.conflicts.filter(c => c.severity === "error");
        const warningConflicts = result.conflicts.filter(c => c.severity === "warning");
        
        if (errorConflicts.length > 0) {
          // Show error for critical conflicts
          toast({
            title: "Scheduling Conflicts Detected",
            description: errorConflicts.map(c => c.message).join(", "),
            variant: "destructive"
          });
          return; // Don't proceed if there are error conflicts
        } else if (warningConflicts.length > 0) {
          // Show warning for non-critical conflicts but allow scheduling
          toast({
            title: "Scheduling Warnings",
            description: warningConflicts.map(c => c.message).join(", "),
            variant: "default"
          });
        }
      }
      
      toast({
        title: "Success",
        description: "Job scheduled successfully",
      });
      
      // Navigate to the schedule
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

  // Function to generate scheduling suggestions
  const generateSuggestions = (jobId: string) => {
    if (!jobId) return;
    
    setIsLoadingSuggestions(true);
    console.log("Generating suggestions for job ID:", jobId);
    
    // Get the job
    const job = getJobById(jobId);
    if (!job) {
      console.log("No job found with ID:", jobId);
      setIsLoadingSuggestions(false);
      return;
    }
    
    console.log("Job found:", job.title);
    console.log("Staff count:", staff.length);
    console.log("Schedule events count:", schedule.length);
    
    // Use the simpler scheduling utility
    import("@/lib/scheduling/autoScheduleUtils").then(module => {
      // Filter staff based on selection if a staff member is selected
      let staffToCheck;
      
      if (formData.staffId && formData.staffId !== "unassigned") {
        staffToCheck = staff.filter(s => s.id === formData.staffId);
      } else {
        // Filter by staff members who can handle this job type
        staffToCheck = staff.filter(s => {
          // If staff has no job type capabilities or empty array, assume they can handle all job types (for backward compatibility)
          if (!s.jobTypeCapabilities || s.jobTypeCapabilities.length === 0) {
            return true;
          }
          // Check if the staff member can handle this job type
          return s.jobTypeCapabilities.includes(job.jobType);
        });
      }
      
      // Log how many staff members are qualified for this job
      console.log(`Found ${staffToCheck.length} staff members qualified for this job type`);
      staffToCheck.forEach(s => console.log(` - ${s.name}`));
        
      const suggestions = module.findScheduleSuggestions(
        job,
        staffToCheck,
        schedule,
        5, // max suggestions
        10 // days to check
      );
      
      console.log("Suggestions generated:", suggestions.length);
      console.log("Suggestions:", suggestions);
      
      setScheduleSuggestions(suggestions);
      setIsLoadingSuggestions(false);
    }).catch(error => {
      console.error("Error loading scheduling utilities:", error);
      setIsLoadingSuggestions(false);
    });
  };

  // When job selection changes, generate suggestions
  useEffect(() => {
    if (formData.jobId && activeTab === "auto") {
      generateSuggestions(formData.jobId);
    }
  }, [formData.jobId, activeTab]);

  // Apply a suggestion to the form
  const applySuggestion = (suggestion: any) => {
    setFormData(prev => ({
      ...prev,
      staffId: suggestion.staffId,
      startDate: suggestion.date,
      startTime: suggestion.startTime,
      endDate: suggestion.date,
      endTime: suggestion.endTime,
    }));
    
    setActiveTab("manual");
    
    toast({
      title: "Suggestion Applied",
      description: `Schedule with ${suggestion.staffName} on ${format(new Date(suggestion.date), "MMM d")} has been applied. You can now review and submit.`,
    });
  };

  // Function to get available time slots based on staff member's availability
  const getAvailableTimeSlots = useMemo(() => {
    // If no staff selected, return default business hours
    if (!formData.staffId || formData.staffId === "unassigned") {
      return Array.from({ length: 19 }, (_, i) => {
        const hour = Math.floor(i / 2) + 8; // Start from 8 AM
        const minute = i % 2 === 0 ? "00" : "30";
        const time = `${hour.toString().padStart(2, "0")}:${minute}`;
        return time;
      });
    }

    const selectedDate = new Date(formData.startDate);
    const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(selectedDate).toLowerCase();
    
    // Get selected staff member
    const selectedStaff = staff.find(member => member.id === formData.staffId);
    
    if (!selectedStaff) {
      return [];
    }
    
    // Check if staff is available on this day
    if (!selectedStaff.availability[dayOfWeek as keyof typeof selectedStaff.availability]) {
      return [];
    }
    
    // Get availability hours for the selected day
    const availabilityHours = selectedStaff.availabilityHours?.[dayOfWeek as keyof typeof selectedStaff.availabilityHours];
    
    if (!availabilityHours) {
      // Use business hours as default if not specified
      const { start, end } = settings.businessHours;
      
      // Generate half-hour slots
      const startHour = parseInt(start.split(':')[0]);
      const endHour = parseInt(end.split(':')[0]);
      const startMinute = parseInt(start.split(':')[1]);
      const endMinute = parseInt(end.split(':')[1]);
      
      const slots = [];
      const startSlot = startHour * 2 + (startMinute === 30 ? 1 : 0);
      const endSlot = endHour * 2 + (endMinute === 30 ? 1 : 0);
      
      for (let i = startSlot; i <= endSlot; i++) {
        const hour = Math.floor(i / 2);
        const minute = i % 2 === 0 ? "00" : "30";
        const time = `${hour.toString().padStart(2, "0")}:${minute}`;
        slots.push(time);
      }
      
      return slots;
    }
    
    // Use staff's custom availability hours
    const { start, end } = availabilityHours;
    
    // Generate half-hour slots
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    const startMinute = parseInt(start.split(':')[1]);
    const endMinute = parseInt(end.split(':')[1]);
    
    const slots = [];
    const startSlot = startHour * 2 + (startMinute === 30 ? 1 : 0);
    const endSlot = endHour * 2 + (endMinute === 30 ? 1 : 0);
    
    for (let i = startSlot; i <= endSlot; i++) {
      const hour = Math.floor(i / 2);
      const minute = i % 2 === 0 ? "00" : "30";
      const time = `${hour.toString().padStart(2, "0")}:${minute}`;
      slots.push(time);
    }
    
    // Filter out times that are already scheduled
    const dateStr = formData.startDate;
    const staffSchedule = schedule.filter(event => {
      return event.staffId === formData.staffId && 
        new Date(event.startTime).toISOString().split('T')[0] === dateStr;
    });
    
    return slots.filter(timeSlot => {
      const [hour, minute] = timeSlot.split(':').map(Number);
      const slotDateTime = new Date(formData.startDate);
      slotDateTime.setHours(hour, minute, 0, 0);
      
      // Check if this time slot overlaps with any existing events
      return !staffSchedule.some(event => {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        return slotDateTime >= eventStart && slotDateTime < eventEnd;
      });
    });
  }, [formData.staffId, formData.startDate, staff, schedule, settings.businessHours]);

  // Filter out completed and cancelled jobs
  const availableJobs = jobs.filter(
    (job) => job.status !== "completed" && job.status !== "cancelled",
  );

  // Auto-calculate end time based on job's estimated hours when start time changes
  useEffect(() => {
    if (formData.jobId && formData.startDate && formData.startTime) {
      const job = getJobById(formData.jobId);
      if (job?.estimatedHours) {
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        const endDateTime = addMinutes(startDateTime, job.estimatedHours * 60);
        
        // Check if the end time exceeds business hours
        let adjustedEndDate = format(endDateTime, "yyyy-MM-dd");
        let adjustedEndTime = format(endDateTime, "HH:mm");
        
        // If staff is selected, check their availability
        if (formData.staffId && formData.staffId !== "unassigned") {
          const selectedStaff = staff.find(member => member.id === formData.staffId);
          const startDayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(startDateTime).toLowerCase();
          
          // Check if staff has availability on this day
          if (selectedStaff && selectedStaff.availability[startDayOfWeek as keyof typeof selectedStaff.availability]) {
            // Get availability hours for this day
            const availabilityHours = selectedStaff.availabilityHours?.[startDayOfWeek as keyof typeof selectedStaff.availabilityHours];
            
            // Use business hours as default if not specified
            const endHourStr = availabilityHours ? availabilityHours.end : settings.businessHours.end;
            const [endHour, endMin] = endHourStr.split(":").map(Number);
            
            // Calculate end of day availability
            const availabilityEnd = new Date(startDateTime);
            availabilityEnd.setHours(endHour, endMin, 0, 0);
            
            // If job would end after availability hours, adjust to the next available day
            if (endDateTime > availabilityEnd) {
              console.log("Job extends beyond availability hours, adjusting schedule");
              
              // Calculate remaining hours
              const hoursCompleted = (availabilityEnd.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
              const hoursRemaining = job.estimatedHours - hoursCompleted;
              
              if (hoursRemaining > 0) {
                // Set end time to end of availability for first day
                adjustedEndTime = endHourStr;
                
                // Show a toast to inform the user
                toast({
                  title: "Job spans multiple days",
                  description: `This job will take ${hoursRemaining.toFixed(1)} more hours on the next available day.`,
                });
              }
            }
          }
        } else {
          // If no staff selected, use default business hours
          const { end } = settings.businessHours;
          const [endHour, endMin] = end.split(":").map(Number);
          
          // Calculate end of business day
          const businessEnd = new Date(startDateTime);
          businessEnd.setHours(endHour, endMin, 0, 0);
          
          // If job would end after business hours, adjust to end of business day
          if (endDateTime > businessEnd) {
            adjustedEndTime = end;
            
            const hoursCompleted = (businessEnd.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
            const hoursRemaining = job.estimatedHours - hoursCompleted;
            
            if (hoursRemaining > 0) {
              toast({
                title: "Job spans multiple days",
                description: `This job will take ${hoursRemaining.toFixed(1)} more hours on the next business day.`,
              });
            }
          }
        }
        
        setFormData(prev => ({
          ...prev,
          endDate: adjustedEndDate,
          endTime: adjustedEndTime,
        }));
      }
    }
  }, [formData.jobId, formData.startDate, formData.startTime, formData.staffId, getJobById, staff, settings.businessHours]);

  // Handle preselected job from navigation state
  useEffect(() => {
    const state = location.state as { preselectedJobId?: string } | null;
    if (state?.preselectedJobId) {
      const job = getJobById(state.preselectedJobId);
      if (job) {
        setFormData(prev => ({
          ...prev,
          jobId: state.preselectedJobId
        }));
        
        // Generate suggestions for this job
        generateSuggestions(state.preselectedJobId);
        
        // Clear the location state after using it
        window.history.replaceState({}, document.title);
      }
    }
  }, [location, getJobById]);

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" /> Manual Scheduling
          </TabsTrigger>
          <TabsTrigger value="auto" className="flex items-center">
            <Wand2 className="mr-2 h-4 w-4" /> Smart Suggestions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual">
          <form onSubmit={handleSubmit} noValidate>
            <Card>
              <CardHeader>
                <CardTitle>Schedule Details</CardTitle>
                <CardDescription>
                  Manually select job, staff, and time for scheduling
                </CardDescription>
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
                  
                  {formData.jobId && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {(() => {
                        const job = getJobById(formData.jobId);
                        if (job) {
                          const jobTypeObj = job.jobType ? jobTypes.find(jt => jt.id === job.jobType) : null;
                          const jobTypeName = jobTypeObj ? jobTypeObj.name : job.jobType.replace('_', ' ');
                          return `Job Type: ${jobTypeName}, Estimated hours: ${job.estimatedHours}`;
                        }
                        return null;
                      })()}
                    </div>
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
                      {formData.jobId ? (
                        (() => {
                          const job = getJobById(formData.jobId);
                          const jobType = job?.jobType;
                          
                          // Filter staff by capability if a job is selected
                          const filteredStaff = staff.filter(member => {
                            // If staff has no job type capabilities or empty array, assume they can handle all jobs (for backward compatibility)
                            if (!member.jobTypeCapabilities || member.jobTypeCapabilities.length === 0) {
                              return true;
                            }
                            // If job type is available, check if staff can handle it
                            return jobType ? member.jobTypeCapabilities.includes(jobType) : true;
                          });
                          
                          return filteredStaff.map((member) => (
                            // Only render SelectItem if member.id exists and is not an empty string
                            member.id ? (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ) : null
                          ));
                        })()
                      ) : (
                        // If no job is selected, show all staff
                        staff.map((member) => (
                          // Only render SelectItem if member.id exists and is not an empty string
                          member.id ? (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ) : null
                        ))
                      )}
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
                    {formData.staffId && formData.staffId !== "unassigned" && getAvailableTimeSlots.length === 0 && (
                      <p className="text-sm text-destructive">
                        Selected staff is not available on this date. Please choose another date or staff member.
                      </p>
                    )}
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
                        {getAvailableTimeSlots.length === 0 ? (
                          <SelectItem value="" disabled>
                            No available times
                          </SelectItem>
                        ) : (
                          getAvailableTimeSlots.map((time) => {
                            // Skip empty time values
                            if (!time) return null;
                            return (
                              <SelectItem key={time} value={time}>
                                {formatTime12Hour(time)}
                              </SelectItem>
                            );
                          })
                        )}
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
                    <Label 
                      htmlFor="endTime"
                      className={validationErrors.endTime ? "text-destructive" : ""}
                    >
                      End Time *
                    </Label>
                    <Select
                      value={formData.endTime}
                      onValueChange={(value) =>
                        handleSelectChange("endTime", value)
                      }
                      required
                    >
                      <SelectTrigger 
                        id="endTime"
                        className={validationErrors.endTime ? "border-destructive" : ""}
                      >
                        <SelectValue placeholder="End time" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeOptions(8, 23, false).map((time) => {
                            // Skip empty time values
                            if (!time) return null;
                            return (
                              <SelectItem key={time} value={time}>
                                {formatTime12Hour(time)}
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                    {validationErrors.endTime && (
                      <p className="text-sm text-destructive">
                        {validationErrors.endTime}
                      </p>
                    )}
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
                
                {conflicts.length > 0 && (
                  <ScheduleConflictAlert 
                    conflicts={conflicts} 
                    onDismiss={() => setConflicts([])} 
                  />
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <div className="space-x-2">
                  {showIgnoreConflictsButton && (
                    <Button 
                      type="submit" 
                      variant="destructive"
                    >
                      Schedule Anyway
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (conflicts.length === 0 || showIgnoreConflictsButton) {
                        handleSubmit(e);
                      } else {
                        checkForConflicts();
                      }
                    }}
                  >
                    {conflicts.length === 0 ? "Schedule Job" : "Check Conflicts"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        
        <TabsContent value="auto">
          <Card>
            <CardHeader>
              <CardTitle>Smart Scheduling Suggestions</CardTitle>
              <CardDescription>
                Let the system suggest optimal schedules based on staff skills and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="autoJobId">Select Job</Label>
                  <Select
                    value={formData.jobId}
                    onValueChange={(value) => handleSelectChange("jobId", value)}
                  >
                    <SelectTrigger id="autoJobId">
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
                  
                  {formData.jobId && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {(() => {
                        const job = getJobById(formData.jobId);
                        if (job) {
                          const jobTypeObj = job.jobType ? jobTypes.find(jt => jt.id === job.jobType) : null;
                          const jobTypeName = jobTypeObj ? jobTypeObj.name : job.jobType.replace('_', ' ');
                          return `Job Type: ${jobTypeName}, Estimated hours: ${job.estimatedHours}`;
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
                
                {isLoadingSuggestions ? (
                  <div className="py-8 flex justify-center items-center">
                    <RefreshCcw className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Generating suggestions...</span>
                  </div>
                ) : formData.jobId ? (
                  <ScheduleSuggestions 
                    suggestions={scheduleSuggestions}
                    onSelect={applySuggestion}
                    onRefresh={() => generateSuggestions(formData.jobId)}
                  />
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <CalendarClock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Select a job above to see scheduling suggestions</p>
                  </div>
                )}
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
              {scheduleSuggestions.length > 0 && (
                <Button 
                  type="button" 
                  onClick={() => applySuggestion(scheduleSuggestions[0])}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Apply Best Match
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
