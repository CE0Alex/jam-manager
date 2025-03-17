// Default staff members - the 4 owners of the print shop
export const mockStaff = [
    {
        id: "staff-1",
        name: "Isaac Johnson",
        role: "Production Manager",
        email: "isaac@example.com",
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
        name: "Aaron Wilson",
        role: "Production Manager",
        email: "aaron@example.com",
        phone: "555-5678",
        skills: ["printing", "binding", "production planning"],
        jobTypeCapabilities: ["print", "finishing", "large_format"],
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
        name: "Mike Barnes",
        role: "Sales Manager",
        email: "mike@example.com",
        phone: "555-9012",
        skills: ["sales", "customer service", "project management"],
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
        name: "Jordan Smith",
        role: "Sales Manager",
        email: "jordan@example.com",
        phone: "555-3456",
        skills: ["sales", "marketing", "client relations"],
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
export const mockJobs = [];
export const mockMachines = [];
export const mockSchedule = [];
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
