import type { ScheduleConflict } from "@/lib/scheduling/conflictDetection";
export type { ScheduleConflict };

export interface AutoScheduleOptions {
  preferredStaffId?: string;
  preferredDate?: Date;
  ignoreConflicts?: boolean;
  maxSuggestions?: number;
  daysToCheck?: number;
}

export type JobType = string;

export interface JobTypeDefinition {
  id: string;
  name: string;
  description?: string;
};

export interface Job {
  id: string;
  title: string;
  client: string;
  description: string;
  status: JobStatus;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  priority: JobPriority;
  jobType: JobType;
  fileUrl?: string;
  estimatedHours: number;
  actualHours?: number;
  notes?: string;
  requiredMachines?: string[];
  dependencies?: string[];
}

export type JobStatus =
  | "pending"
  | "in_progress"
  | "review"
  | "completed"
  | "cancelled"
  | "archived";
export type JobPriority = "low" | "medium" | "high" | "urgent";

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  skills: string[];
  jobTypeCapabilities: JobType[];
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  assignedJobs: string[];
  performanceMetrics?: {
    completionRate: number;
    onTimeRate: number;
    qualityScore: number;
  };
  availabilityHours?: {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };
  blockedTimes?: Array<{
    date: string;
    start: string;
    end: string;
    reason?: string;
  }>;
}

export interface ScheduleEvent {
  id: string;
  jobId: string;
  staffId?: string;
  machineId?: string;
  startTime: string;
  endTime: string;
  notes?: string;
  color?: string;
  isAutoScheduled?: boolean;
}

export interface FeedbackItem {
  id?: string;
  submitter: string;
  importance: "low" | "medium" | "high" | "critical";
  page: string;
  attemptedAction: string;
  actualResult: string;
  expectedResult: string;
  screenshotUrl?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  upcomingDeadlines: Job[];
  capacityUtilization: number;
  jobStatusDistribution: Record<JobStatus, number>;
  staffWorkload: Record<string, number>;
  machineUtilization?: Record<string, number>;
}

export * from "./machine";
export * from "./settings";
