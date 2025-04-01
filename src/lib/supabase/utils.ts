import { 
  Job, 
  StaffMember, 
  Machine, 
  ScheduleEvent, 
  FeedbackItem,
  AppSettings,
  JobTypeDefinition
} from "@/types";
import { 
  SupabaseJob, 
  SupabaseStaff, 
  SupabaseMachine, 
  SupabaseScheduleEvent, 
  SupabaseFeedback,
  SupabaseAppData,
  SupabaseJobType 
} from "@/types/supabase";

// Convert frontend Staff model to Supabase model
export function staffToSupabase(staff: StaffMember): Omit<SupabaseStaff, "created_at"> {
  return {
    id: staff.id,
    name: staff.name,
    role: staff.role,
    email: staff.email,
    phone: staff.phone || null,
    skills: staff.skills,
    job_type_capabilities: staff.jobTypeCapabilities,
    availability: staff.availability,
    assigned_jobs: staff.assignedJobs,
    performance_metrics: staff.performanceMetrics || null,
    availability_hours: staff.availabilityHours || null,
    blocked_times: staff.blockedTimes || null
  };
}

// Convert Supabase Staff model to frontend model
export function staffFromSupabase(staff: SupabaseStaff): StaffMember {
  return {
    id: staff.id,
    name: staff.name,
    role: staff.role || "",
    email: staff.email || "",
    phone: staff.phone || undefined,
    skills: staff.skills || [],
    jobTypeCapabilities: staff.job_type_capabilities || [],
    availability: staff.availability,
    assignedJobs: staff.assigned_jobs || [],
    performanceMetrics: staff.performance_metrics || undefined,
    availabilityHours: staff.availability_hours || undefined,
    blockedTimes: staff.blocked_times || undefined
  };
}

// Convert frontend Job model to Supabase model
export function jobToSupabase(job: Job): Omit<SupabaseJob, "created_at" | "updated_at"> {
  return {
    id: job.id,
    title: job.title,
    client: job.client,
    description: job.description,
    status: job.status,
    deadline: job.deadline,
    assigned_to: job.assignedTo || null,
    priority: job.priority,
    job_type: job.jobType,
    file_url: job.fileUrl || null,
    estimated_hours: job.estimatedHours,
    actual_hours: job.actualHours || null,
    notes: job.notes || null,
    required_machines: job.requiredMachines || null,
    dependencies: job.dependencies || null
  };
}

// Convert Supabase Job model to frontend model
export function jobFromSupabase(job: SupabaseJob): Job {
  return {
    id: job.id,
    title: job.title,
    client: job.client,
    description: job.description || "",
    status: job.status as any,
    deadline: job.deadline || "",
    createdAt: job.created_at,
    updatedAt: job.updated_at,
    assignedTo: job.assigned_to || undefined,
    priority: job.priority as any,
    jobType: job.job_type as any,
    fileUrl: job.file_url || undefined,
    estimatedHours: job.estimated_hours || 0,
    actualHours: job.actual_hours || undefined,
    notes: job.notes || undefined,
    requiredMachines: job.required_machines || undefined,
    dependencies: job.dependencies || undefined
  };
}

// Convert frontend Machine model to Supabase model
export function machineToSupabase(machine: Machine): Omit<SupabaseMachine, "created_at"> {
  return {
    id: machine.id,
    name: machine.name,
    type: machine.type,
    status: machine.status,
    capabilities: machine.capabilities,
    maintenance_schedule: machine.maintenanceSchedule || null,
    location: null, // Machine doesn't have location in frontend model
    hours_per_day: machine.hoursPerDay || null
  };
}

// Convert Supabase Machine model to frontend model
export function machineFromSupabase(machine: SupabaseMachine): Machine {
  return {
    id: machine.id,
    name: machine.name,
    type: machine.type,
    status: machine.status as "operational" | "maintenance" | "offline",
    capabilities: machine.capabilities || [],
    maintenanceSchedule: machine.maintenance_schedule || undefined,
    hoursPerDay: machine.hours_per_day || undefined
  };
}

// Convert frontend ScheduleEvent model to Supabase model
export function scheduleEventToSupabase(event: ScheduleEvent): Omit<SupabaseScheduleEvent, "created_at"> {
  return {
    id: event.id,
    job_id: event.jobId,
    staff_id: event.staffId || null,
    machine_id: event.machineId || null,
    start_time: event.startTime,
    end_time: event.endTime,
    notes: event.notes || null,
    color: event.color || null,
    is_auto_scheduled: event.isAutoScheduled || false
  };
}

// Convert Supabase ScheduleEvent model to frontend model
export function scheduleEventFromSupabase(event: SupabaseScheduleEvent): ScheduleEvent {
  return {
    id: event.id,
    jobId: event.job_id,
    staffId: event.staff_id || undefined,
    machineId: event.machine_id || undefined,
    startTime: event.start_time,
    endTime: event.end_time,
    notes: event.notes || undefined,
    color: event.color || undefined,
    isAutoScheduled: event.is_auto_scheduled
  };
}

// Convert frontend FeedbackItem model to Supabase model
export function feedbackToSupabase(feedback: FeedbackItem): Omit<SupabaseFeedback, "created_at"> {
  // Handle id if present, otherwise omit it for new items
  const feedbackData: any = {
    submitter: feedback.submitter,
    importance: feedback.importance,
    page: feedback.page,
    attempted_action: feedback.attemptedAction,
    actual_result: feedback.actualResult,
    expected_result: feedback.expectedResult,
    screenshot_url: feedback.screenshotUrl || null
  };
  
  // Add id if present in the feedback item
  if ('id' in feedback) {
    feedbackData.id = (feedback as any).id;
  }
  
  return feedbackData;
}

// Convert Supabase FeedbackItem model to frontend model
export function feedbackFromSupabase(feedback: SupabaseFeedback): FeedbackItem & { id: string; createdAt: string } {
  return {
    id: feedback.id,
    submitter: feedback.submitter,
    importance: feedback.importance as "low" | "medium" | "high" | "critical",
    page: feedback.page,
    attemptedAction: feedback.attempted_action,
    actualResult: feedback.actual_result,
    expectedResult: feedback.expected_result,
    screenshotUrl: feedback.screenshot_url || undefined,
    createdAt: feedback.created_at
  };
}

// Convert frontend JobTypeDefinition model to Supabase model
export function jobTypeToSupabase(jobType: JobTypeDefinition): Omit<SupabaseJobType, "created_at" | "updated_at"> {
  return {
    id: jobType.id,
    name: jobType.name,
    description: jobType.description || null
  };
}

// Convert Supabase JobTypeDefinition model to frontend model
export function jobTypeFromSupabase(jobType: SupabaseJobType): JobTypeDefinition {
  return {
    id: jobType.id,
    name: jobType.name,
    description: jobType.description || ""
  };
}

// Convert frontend AppSettings model to Supabase model
export function appSettingsToSupabase(settings: AppSettings): { id: string; data: any } {
  return {
    id: "settings",
    data: settings
  };
}

// Convert Supabase AppSettings model to frontend model
export function appSettingsFromSupabase(appData: SupabaseAppData): AppSettings {
  return appData.data as AppSettings;
} 