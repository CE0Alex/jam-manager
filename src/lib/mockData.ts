import {
  Job,
  JobStatus,
  JobPriority,
  StaffMember,
  ScheduleEvent,
  FeedbackItem,
  Machine,
} from "@/types";
import { addDays, format, subDays } from "date-fns";

// Helper to generate dates relative to today
const today = new Date();
const formatDate = (date: Date) => format(date, "yyyy-MM-dd");

// Sample job data for testing
export const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "INV-12345",
    client: "John Smith",
    description: "500 business cards, double-sided, premium stock",
    status: "in_progress",
    deadline: format(addDays(today, 3), "yyyy-MM-dd"),
    createdAt: format(subDays(today, 2), "yyyy-MM-dd"),
    updatedAt: format(today, "yyyy-MM-dd"),
    assignedTo: "staff-3",
    priority: "medium",
    jobType: "digital_printing",
    estimatedHours: 2,
    notes: "Client requested rush delivery",
  },
  {
    id: "job-2",
    title: "INV-67890",
    client: "Sarah Johnson",
    description: "3 large format banners for outdoor display",
    status: "pending",
    deadline: format(addDays(today, 7), "yyyy-MM-dd"),
    createdAt: format(subDays(today, 1), "yyyy-MM-dd"),
    updatedAt: format(today, "yyyy-MM-dd"),
    priority: "high",
    jobType: "wide_format",
    estimatedHours: 5,
  },
  {
    id: "job-3",
    title: "INV-24680",
    client: "David Williams",
    description: "1000 tri-fold brochures, full color",
    status: "review",
    deadline: format(addDays(today, 1), "yyyy-MM-dd"),
    createdAt: format(subDays(today, 5), "yyyy-MM-dd"),
    updatedAt: format(subDays(today, 1), "yyyy-MM-dd"),
    assignedTo: "staff-4",
    priority: "urgent",
    jobType: "digital_printing",
    estimatedHours: 4,
  },
];

// Keep the staff members we created (Mike, Jordan, Isaac, Aaron)
export const mockStaff: StaffMember[] = [
  {
    id: "staff-1",
    name: "Mike",
    role: "Sales Representative",
    email: "mike@printshop.com",
    phone: "555-123-4567",
    skills: ["Client Relations", "Quoting", "Project Planning"],
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    assignedJobs: [],
    performanceMetrics: {
      completionRate: 95,
      onTimeRate: 92,
      qualityScore: 88,
    },
    availabilityHours: {
      monday: { start: "08:00", end: "17:00" },
      tuesday: { start: "08:00", end: "17:00" },
      wednesday: { start: "08:00", end: "17:00" },
      thursday: { start: "08:00", end: "17:00" },
      friday: { start: "08:00", end: "17:00" },
    },
  },
  {
    id: "staff-2",
    name: "Jordan",
    role: "Sales Manager",
    email: "jordan@printshop.com",
    phone: "555-987-6543",
    skills: ["Account Management", "Sales Strategy", "Client Presentations"],
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    assignedJobs: [],
    performanceMetrics: {
      completionRate: 98,
      onTimeRate: 95,
      qualityScore: 90,
    },
    availabilityHours: {
      monday: { start: "08:00", end: "17:00" },
      tuesday: { start: "08:00", end: "17:00" },
      wednesday: { start: "08:00", end: "17:00" },
      thursday: { start: "08:00", end: "17:00" },
      friday: { start: "08:00", end: "17:00" },
    },
  },
  {
    id: "staff-3",
    name: "Isaac",
    role: "Production Specialist",
    email: "isaac@printshop.com",
    phone: "555-456-7890",
    skills: ["Digital Printing", "Large Format", "Color Calibration"],
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    assignedJobs: ["job-1"],
    performanceMetrics: {
      completionRate: 99,
      onTimeRate: 97,
      qualityScore: 94,
    },
    availabilityHours: {
      monday: { start: "08:00", end: "17:00" },
      tuesday: { start: "08:00", end: "17:00" },
      wednesday: { start: "08:00", end: "17:00" },
      thursday: { start: "08:00", end: "17:00" },
      friday: { start: "08:00", end: "17:00" },
    },
    blockedTimes: [],
  },
  {
    id: "staff-4",
    name: "Aaron",
    role: "Production Manager",
    email: "aaron@printshop.com",
    phone: "555-789-0123",
    skills: ["Binding", "Cutting", "Folding", "Quality Control"],
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    assignedJobs: ["job-3"],
    performanceMetrics: {
      completionRate: 94,
      onTimeRate: 90,
      qualityScore: 92,
    },
    availabilityHours: {
      monday: { start: "08:00", end: "17:00" },
      tuesday: { start: "08:00", end: "17:00" },
      wednesday: { start: "08:00", end: "17:00" },
      thursday: { start: "08:00", end: "17:00" },
      friday: { start: "08:00", end: "17:00" },
    },
    blockedTimes: [],
  },
];

// Mock Machines
export const mockMachines: Machine[] = [
  {
    id: "machine-1",
    name: "Digital Press 1",
    type: "Digital Printer",
    capabilities: ["Full Color", "Double-sided", "Letter", "Legal", "Tabloid"],
    hoursPerDay: 8,
    status: "operational",
  },
  {
    id: "machine-2",
    name: "Large Format Printer",
    type: "Wide Format",
    capabilities: ["Banners", "Posters", "Vinyl"],
    hoursPerDay: 6,
    status: "operational",
  },
];

// Mock Schedule Events
export const mockSchedule: ScheduleEvent[] = [
  {
    id: "event-1",
    jobId: "job-1",
    staffId: "staff-3",
    machineId: "machine-1",
    startTime: `${format(addDays(today, 1), "yyyy-MM-dd")}T09:00:00`,
    endTime: `${format(addDays(today, 1), "yyyy-MM-dd")}T11:00:00`,
    notes: "Production run for business cards",
  },
  {
    id: "event-2",
    jobId: "job-3",
    staffId: "staff-4",
    machineId: "machine-1",
    startTime: `${format(today, "yyyy-MM-dd")}T13:00:00`,
    endTime: `${format(today, "yyyy-MM-dd")}T17:00:00`,
    notes: "Brochure production",
  },
];

// Mock Feedback Items
export const mockFeedback: FeedbackItem[] = [];

// Generate dashboard metrics
export const generateDashboardMetrics = () => {
  // Calculate job status distribution from mockJobs
  const jobStatusDistribution: Record<JobStatus, number> = {
    pending: 0,
    in_progress: 0,
    review: 0,
    completed: 0,
    cancelled: 0,
  };

  mockJobs.forEach((job) => {
    jobStatusDistribution[job.status]++;
  });

  // Calculate upcoming deadlines
  const upcomingDeadlines = mockJobs
    .filter((job) => {
      const deadline = new Date(job.deadline);
      const cutoffDate = addDays(today, 7);
      return (
        job.status !== "completed" &&
        job.status !== "cancelled" &&
        deadline <= cutoffDate
      );
    })
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    );

  // Calculate staff workload
  const staffWorkload: Record<string, number> = {};
  mockStaff.forEach((staff) => {
    staffWorkload[staff.id] = staff.assignedJobs.length;
  });

  // Calculate machine utilization
  const machineUtilization: Record<string, number> = {};
  mockMachines.forEach((machine) => {
    const machineEvents = mockSchedule.filter(
      (event) => event.machineId === machine.id,
    );
    const totalHours = machineEvents.reduce((total, event) => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
    const utilization = Math.min(
      100,
      (totalHours / (machine.hoursPerDay * 5)) * 100,
    );
    machineUtilization[machine.id] = Math.round(utilization);
  });

  // Calculate overall capacity utilization
  const totalCapacity = mockStaff.length * 40; // 40 hours per week per staff
  const totalScheduled = mockSchedule.reduce((total, event) => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);
  const capacityUtilization = Math.min(
    100,
    Math.round((totalScheduled / totalCapacity) * 100),
  );

  return {
    upcomingDeadlines,
    capacityUtilization,
    jobStatusDistribution,
    staffWorkload,
    machineUtilization,
  };
};
