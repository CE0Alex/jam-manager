import { Job, StaffMember, ScheduleEvent, Machine } from "@/types";
import { addDays, format, subDays } from "date-fns";

// Default staff members - the 4 owners of the print shop
export const mockStaff: StaffMember[] = [
  {
    id: "staff-1",
    name: "John Smith",
    role: "Production Manager",
    email: "john@example.com",
    phone: "555-1234",
    skills: ["printing", "design", "management"],
    jobTypeCapabilities: ["print", "design", "large_format"],
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
      qualityScore: 4.8,
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
    name: "Jane Doe",
    role: "Graphic Designer",
    email: "jane@example.com",
    phone: "555-5678",
    skills: ["design", "illustration", "typography"],
    jobTypeCapabilities: ["design", "branding"],
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
      qualityScore: 4.9,
    },
    availabilityHours: {
      monday: { start: "09:00", end: "18:00" },
      tuesday: { start: "09:00", end: "18:00" },
      wednesday: { start: "09:00", end: "18:00" },
      thursday: { start: "09:00", end: "18:00" },
      friday: { start: "09:00", end: "18:00" },
    },
  },
  {
    id: "staff-3",
    name: "Mike Johnson",
    role: "Print Operator",
    email: "mike@example.com",
    phone: "555-9012",
    skills: ["printing", "binding", "finishing"],
    jobTypeCapabilities: ["print", "finishing"],
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
      completionRate: 92,
      onTimeRate: 90,
      qualityScore: 4.5,
    },
    availabilityHours: {
      monday: { start: "07:00", end: "16:00" },
      tuesday: { start: "07:00", end: "16:00" },
      wednesday: { start: "07:00", end: "16:00" },
      thursday: { start: "07:00", end: "16:00" },
      friday: { start: "07:00", end: "16:00" },
    },
  },
  {
    id: "staff-4",
    name: "Sarah Williams",
    role: "Customer Service",
    email: "sarah@example.com",
    phone: "555-3456",
    skills: ["customer service", "sales", "order processing"],
    jobTypeCapabilities: ["customer_service", "sales"],
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
      completionRate: 97,
      onTimeRate: 98,
      qualityScore: 4.7,
    },
    availabilityHours: {
      monday: { start: "08:30", end: "17:30" },
      tuesday: { start: "08:30", end: "17:30" },
      wednesday: { start: "08:30", end: "17:30" },
      thursday: { start: "08:30", end: "17:30" },
      friday: { start: "08:30", end: "17:30" },
    },
  },
];

// Empty initial data arrays for other entities
export const mockJobs: Job[] = [];
export const mockMachines: Machine[] = [];
export const mockSchedule: ScheduleEvent[] = [];

// Generate empty dashboard metrics
export function generateDashboardMetrics() {
  return {
    upcomingDeadlines: [],
    capacityUtilization: 65,
    jobStatusDistribution: {
      pending: 12,
      in_progress: 8,
      review: 4,
      completed: 20,
      cancelled: 2,
      archived: 5
    },
    staffWorkload: {},
    machineUtilization: {}
  };
}
