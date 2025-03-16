import { Job, StaffMember, ScheduleEvent, Machine } from "@/types";
import { addDays, format, subDays } from "date-fns";

// Default staff members - the 4 owners of the print shop
export const mockStaff: StaffMember[] = [
  {
    id: "staff-1",
    name: "Isaac",
    role: "Production Manager",
    email: "isaac@printshop.com",
    phone: "555-123-4567",
    skills: [
      "Management",
      "Digital Printing",
      "Screen Printing",
      "Production Planning",
    ],
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
      qualityScore: 98,
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
    name: "Aaron",
    role: "Production Specialist",
    email: "aaron@printshop.com",
    phone: "555-234-5678",
    skills: [
      "Machine Operation",
      "Quality Control",
      "Digital Printing",
      "Screen Printing",
    ],
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
      completionRate: 90,
      onTimeRate: 88,
      qualityScore: 95,
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
    name: "Mike",
    role: "Sales Manager",
    email: "mike@printshop.com",
    phone: "555-345-6789",
    skills: ["Client Relations", "Sales", "Marketing", "Project Management"],
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
    id: "staff-4",
    name: "Jordan",
    role: "Sales Representative",
    email: "jordan@printshop.com",
    phone: "555-456-7890",
    skills: [
      "Client Relations",
      "Order Processing",
      "Sales",
      "Customer Service",
    ],
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
      completionRate: 96,
      onTimeRate: 94,
      qualityScore: 97,
    },
    availabilityHours: {
      monday: { start: "09:00", end: "18:00" },
      tuesday: { start: "09:00", end: "18:00" },
      wednesday: { start: "09:00", end: "18:00" },
      thursday: { start: "09:00", end: "18:00" },
      friday: { start: "09:00", end: "18:00" },
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
    capacityUtilization: 0,
    jobStatusDistribution: {
      pending: 0,
      in_progress: 0,
      review: 0,
      completed: 0,
      cancelled: 0,
    },
    staffWorkload: {},
    machineUtilization: {},
  };
}
