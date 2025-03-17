import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Job,
  StaffMember,
  ScheduleEvent,
  DashboardMetrics,
  JobStatus,
  FeedbackItem,
  Machine,
  JobType,
  BusinessHours,
  AppSettings,
  JobTypeDefinition,
  ScheduleConflict,
  AutoScheduleOptions,
} from "@/types";
import {
  mockStaff,
  mockJobs,
  mockMachines,
  mockSchedule,
  generateDashboardMetrics,
} from "@/lib/mockData";
import { addDays, format } from "date-fns";
import { detectScheduleConflicts, hasScheduleConflicts } from "@/lib/scheduling";

interface AppContextType {
  // Jobs
  jobs: Job[];
  addJob: (job: Omit<Job, "id" | "createdAt" | "updatedAt">) => Job;
  updateJob: (job: Job) => void;
  deleteJob: (id: string) => void;
  getJobById: (id: string) => Job | undefined;
  filteredJobs: Job[];
  setJobFilters: (filters: JobFilters) => void;

  // Job Types
  jobTypes: JobTypeDefinition[];
  updateJobTypes: (types: JobTypeDefinition[]) => void;

  // Staff
  staff: StaffMember[];
  addStaffMember: (staff: Omit<StaffMember, "id">) => void;
  updateStaffMember: (staff: StaffMember) => void;
  deleteStaffMember: (id: string) => void;
  getStaffById: (id: string) => StaffMember | undefined;

  // Machines
  machines: Machine[];
  addMachine: (machine: Omit<Machine, "id">) => void;
  updateMachine: (machine: Machine) => void;
  deleteMachine: (id: string) => void;
  getMachineById: (id: string) => Machine | undefined;

  // Schedule
  schedule: ScheduleEvent[];
  addScheduleEvent: (event: Omit<ScheduleEvent, "id">) => ScheduleEventResult;
  updateScheduleEvent: (event: ScheduleEvent) => UpdateScheduleEventResult;
  deleteScheduleEvent: (id: string) => void;
  getScheduleForDate: (date: Date) => ScheduleEvent[];
  autoScheduleJob: (jobId: string, options?: AutoScheduleOptions) => ScheduleEventResult | null;

  // Feedback
  feedback: FeedbackItem[];
  addFeedback: (feedback: Omit<FeedbackItem, "id">) => void;

  // Dashboard
  dashboardMetrics: DashboardMetrics;
  refreshDashboard: () => void;
  
  // Settings
  settings: AppSettings;
  updateBusinessHours: (hours: BusinessHours) => void;
  applyDefaultAvailabilityToStaff: (staffId?: string) => void;
}

interface JobFilters {
  status?: JobStatus[];
  priority?: string[];
  jobType?: JobType[];
  assignedTo?: string[];
  searchTerm?: string;
  dateRange?: { start: Date | null; end: Date | null };
}

// Add a new type for the schedule event result
export interface ScheduleEventResult {
  event: ScheduleEvent;
  conflicts: ScheduleConflict[];
  hasErrors: boolean;
}

// Add a new type for the update schedule event result
export interface UpdateScheduleEventResult {
  conflicts: ScheduleConflict[];
  hasErrors: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Load data from localStorage or use mock data as defaults
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const storedData = localStorage.getItem(key);
      if (!storedData) {
        console.warn(`No data found for ${key} in localStorage, using default value:`, defaultValue);
        return defaultValue;
      }

      try {
        const parsedData = JSON.parse(storedData);
        console.log(`Successfully loaded ${key} from localStorage:`, 
          key === 'jobTypes' ? parsedData : `[${typeof parsedData}]`);
        return parsedData;
      } catch (parseError) {
        console.error(`Error parsing ${key} from localStorage:`, parseError);
        console.warn(`Resetting corrupted ${key} data to default value`);
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
    } catch (error) {
      console.error(`Error accessing ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  // Clear localStorage to ensure fresh data
  useEffect(() => {
    try {
      const hasInitialized = localStorage.getItem("hasInitialized");
      if (!hasInitialized) {
        localStorage.clear();
        localStorage.setItem("hasInitialized", "true");

        // Force set default job types directly to localStorage to ensure they exist
        localStorage.setItem("jobTypes", JSON.stringify(defaultJobTypes));
        console.log("Initialized localStorage with default job types:", defaultJobTypes);
      } else {
        // Check if jobTypes exist in localStorage and recreate if missing
        const storedJobTypes = localStorage.getItem("jobTypes");
        if (!storedJobTypes) {
          console.warn("Job types missing in localStorage, re-initializing...");
          localStorage.setItem("jobTypes", JSON.stringify(defaultJobTypes));
          // Force re-initialization of state
          setJobTypes([...defaultJobTypes]);
        }
      }
    } catch (error) {
      console.error("Error initializing localStorage:", error);
    }
  }, []);

  // Default business hours: 8am to 5pm
  // Default job types
  const defaultJobTypes: JobTypeDefinition[] = [
    { id: "embroidery", name: "Embroidery", description: "Machine embroidery services" },
    { id: "screen_printing", name: "Screen Printing", description: "Traditional screen printing services" },
    { id: "digital_printing", name: "Digital Printing", description: "Print for digital media" },
    { id: "wide_format", name: "Wide Format", description: "Large format printing services" },
    { id: "central_facility", name: "Central Facility", description: "Services at the central production facility" },
  ];

  const defaultSettings: AppSettings = {
    businessHours: {
      start: "08:00",
      end: "17:00",
    },
  };

  // State for jobs, staff, schedule, settings
  const [settings, setSettings] = useState<AppSettings>(
    loadFromStorage("settings", defaultSettings),
  );
  const [jobTypes, setJobTypes] = useState<JobTypeDefinition[]>(
    loadFromStorage("jobTypes", defaultJobTypes),
  );
  const [jobs, setJobs] = useState<Job[]>(loadFromStorage("jobs", mockJobs));
  const [staff, setStaff] = useState<StaffMember[]>(
    loadFromStorage("staff", mockStaff),
  );
  const [machines, setMachines] = useState<Machine[]>(
    loadFromStorage("machines", mockMachines),
  );
  const [schedule, setSchedule] = useState<ScheduleEvent[]>(
    loadFromStorage("schedule", mockSchedule),
  );
  const [feedback, setFeedback] = useState<FeedbackItem[]>(
    loadFromStorage("feedback", []),
  );
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>(
    generateDashboardMetrics(),
  );
  const [jobFilters, setJobFilters] = useState<JobFilters>({});
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs);

  // Apply filters to jobs
  useEffect(() => {
    let result = [...jobs];

    if (jobFilters.status && jobFilters.status.length > 0) {
      result = result.filter((job) => jobFilters.status?.includes(job.status));
    }

    if (jobFilters.priority && jobFilters.priority.length > 0) {
      result = result.filter((job) =>
        jobFilters.priority?.includes(job.priority),
      );
    }

    if (jobFilters.jobType && jobFilters.jobType.length > 0) {
      result = result.filter((job) =>
        jobFilters.jobType?.includes(job.jobType),
      );
    }

    if (jobFilters.assignedTo && jobFilters.assignedTo.length > 0) {
      result = result.filter(
        (job) =>
          job.assignedTo && jobFilters.assignedTo?.includes(job.assignedTo),
      );
    }

    if (jobFilters.searchTerm) {
      const term = jobFilters.searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(term) ||
          job.client.toLowerCase().includes(term) ||
          job.description.toLowerCase().includes(term),
      );
    }

    if (jobFilters.dateRange?.start && jobFilters.dateRange?.end) {
      result = result.filter((job) => {
        const jobDate = new Date(job.deadline);
        return (
          jobDate >= jobFilters.dateRange!.start! &&
          jobDate <= jobFilters.dateRange!.end!
        );
      });
    }

    setFilteredJobs(result);
  }, [jobs, jobFilters]);

  // Calculate dashboard metrics based on current data
  const calculateDashboardMetrics = () => {
    // Get upcoming deadlines (jobs due in the next 7 days)
    const now = new Date();
    const sevenDaysFromNow = addDays(now, 7);
    
    const upcomingDeadlines = jobs
      .filter(
        (job) =>
          job.status !== "completed" &&
          job.status !== "cancelled" &&
          job.status !== "archived" &&
          new Date(job.deadline) <= sevenDaysFromNow
      )
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    
    // Calculate capacity utilization (percentage of staff assigned to jobs)
    const assignedStaff = new Set();
    jobs.forEach((job) => {
      if (job.assignedTo && job.status !== "completed" && job.status !== "cancelled" && job.status !== "archived") {
        assignedStaff.add(job.assignedTo);
      }
    });
    
    const capacityUtilization = staff.length
      ? (assignedStaff.size / staff.length) * 100
      : 0;
    
    // Calculate job status distribution
    const jobStatusDistribution: Record<JobStatus, number> = {
      pending: 0,
      in_progress: 0,
      review: 0,
      completed: 0,
      cancelled: 0,
      archived: 0
    };
    
    jobs.forEach((job) => {
      jobStatusDistribution[job.status]++;
    });
    
    // Calculate staff workload (number of active jobs per staff member)
    const staffWorkload: Record<string, number> = {};
    staff.forEach((member) => {
      staffWorkload[member.id] = 0;
    });
    
    jobs.forEach((job) => {
      if (
        job.assignedTo &&
        job.status !== "completed" &&
        job.status !== "cancelled" &&
        job.status !== "archived"
      ) {
        staffWorkload[job.assignedTo] = (staffWorkload[job.assignedTo] || 0) + 1;
      }
    });
    
    // Calculate machine utilization if machines are available
    const machineUtilization: Record<string, number> = {};
    const currentMachines = machines;
    
    if (currentMachines.length > 0) {
      currentMachines.forEach((machine) => {
        machineUtilization[machine.id] = 0;
      });
      
      // Count scheduled events for each machine
      schedule.forEach((event) => {
        if (event.machineId) {
          machineUtilization[event.machineId] = (machineUtilization[event.machineId] || 0) + 1;
        }
      });
    }
    
    return {
      upcomingDeadlines,
      capacityUtilization,
      jobStatusDistribution,
      staffWorkload,
      machineUtilization
    };
  };

  // Refresh dashboard metrics
  const refreshDashboard = () => {
    // Force a recalculation with the latest data
    const updatedMetrics = calculateDashboardMetrics();
    setDashboardMetrics(updatedMetrics);
  };

  // Save data to localStorage when it changes - with debounce and error handling
  const saveToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  // Use a more efficient approach to save data and refresh dashboard
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage("jobs", jobs);
      refreshDashboard();
    }, 300); // Debounce for 300ms
    return () => clearTimeout(timeoutId);
  }, [jobs]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage("staff", staff);
      refreshDashboard();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [staff]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage("machines", machines);
      refreshDashboard();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [machines]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage("schedule", schedule);
      refreshDashboard();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [schedule]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage("feedback", feedback);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [feedback]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage("settings", settings);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [settings]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage("jobTypes", jobTypes);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [jobTypes]);

  // Job functions
  const addJob = (job: Omit<Job, "id" | "createdAt" | "updatedAt">): Job => {
    const now = format(new Date(), "yyyy-MM-dd");
    const newJob: Job = {
      ...job,
      id: `job-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setJobs([...jobs, newJob]);
    return newJob;
  };

  const updateJob = (job: Job) => {
    const updatedJob = {
      ...job,
      updatedAt: format(new Date(), "yyyy-MM-dd"),
    };
    setJobs(jobs.map((j) => (j.id === job.id ? updatedJob : j)));
  };

  const deleteJob = (id: string) => {
    // Remove the job from jobs array
    setJobs(jobs.filter((job) => job.id !== id));

    // Also remove any schedule events associated with this job
    setSchedule(schedule.filter((event) => event.jobId !== id));
  };

  const getJobById = (id: string) => {
    return jobs.find((job) => job.id === id);
  };

  // Staff functions
  const addStaffMember = (staffMember: Omit<StaffMember, "id">) => {
    const newStaffMember: StaffMember = {
      ...staffMember,
      id: `staff-${Date.now()}`,
    };
    setStaff([...staff, newStaffMember]);
  };

  const updateStaffMember = (staffMember: StaffMember) => {
    setStaff(staff.map((s) => (s.id === staffMember.id ? staffMember : s)));
  };

  const deleteStaffMember = (id: string) => {
    // Remove staff member
    setStaff(staff.filter((s) => s.id !== id));

    // Update any jobs that were assigned to this staff member
    setJobs(
      jobs.map((job) => {
        if (job.assignedTo === id) {
          return {
            ...job,
            assignedTo: undefined,
            updatedAt: format(new Date(), "yyyy-MM-dd"),
          };
        }
        return job;
      }),
    );

    // Remove staff from any scheduled events
    setSchedule(
      schedule.map((event) => {
        if (event.staffId === id) {
          return { ...event, staffId: undefined };
        }
        return event;
      }),
    );
  };

  const getStaffById = (id: string) => {
    return staff.find((s) => s.id === id);
  };

  // Machine functions
  const addMachine = (machine: Omit<Machine, "id">) => {
    const newMachine: Machine = {
      ...machine,
      id: `machine-${Date.now()}`,
    };
    setMachines([...machines, newMachine]);
  };

  const updateMachine = (machine: Machine) => {
    setMachines(machines.map((m) => (m.id === machine.id ? machine : m)));
  };

  const deleteMachine = (id: string) => {
    // Remove machine
    setMachines(machines.filter((m) => m.id !== id));

    // Update any schedule events that used this machine
    setSchedule(
      schedule.map((event) => {
        if (event.machineId === id) {
          return { ...event, machineId: undefined };
        }
        return event;
      }),
    );
  };

  const getMachineById = (id: string) => {
    return machines.find((m) => m.id === id);
  };

  // Schedule functions
  const addScheduleEvent = (event: Omit<ScheduleEvent, "id">) => {
    const newEvent: ScheduleEvent = {
      ...event,
      id: `event-${Date.now()}`,
    };
    
    // Check for conflicts before adding the event
    const conflicts = detectScheduleConflicts(newEvent, schedule, staff);
    
    // If there are conflicts with "error" severity, log them
    const hasErrors = conflicts.some(conflict => conflict.severity === "error");
    if (conflicts.length > 0) {
      console.warn("Scheduling conflicts detected:", conflicts);
      
      // Return conflicts along with the event so UI can handle them appropriately
      return { 
        event: newEvent, 
        conflicts, 
        hasErrors
      };
    }
    
    // No conflicts or only warnings, add the event
    setSchedule([...schedule, newEvent]);
    return { 
      event: newEvent, 
      conflicts: [],
      hasErrors: false
    };
  };

  const updateScheduleEvent = (event: ScheduleEvent) => {
    // Check for conflicts when updating an event
    const conflicts = detectScheduleConflicts(event, schedule, staff, true);
    
    // If there are conflicts with "error" severity, log them
    const hasErrors = conflicts.some(conflict => conflict.severity === "error");
    if (conflicts.length > 0) {
      console.warn("Scheduling conflicts detected during update:", conflicts);
      
      // Return conflicts so UI can handle them
      return {
        conflicts,
        hasErrors
      };
    }
    
    // No conflicts or only warnings, update the event
    setSchedule(schedule.map((e) => (e.id === event.id ? event : e)));
    return {
      conflicts: [],
      hasErrors: false
    };
  };

  const deleteScheduleEvent = (id: string) => {
    setSchedule(schedule.filter((e) => e.id !== id));
  };

  const getScheduleForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return schedule.filter((event) => {
      const eventDate = format(new Date(event.startTime), "yyyy-MM-dd");
      return eventDate === dateStr;
    });
  };

  // Auto-schedule a job based on staff availability and job requirements
  const autoScheduleJob = (jobId: string, options?: AutoScheduleOptions): ScheduleEventResult | null => {
    const job = getJobById(jobId);
    if (!job) return null;

    // Find available staff
    const availableStaff = staff.filter((s) => {
      // Check if staff has capacity
      return (
        s.availability.monday ||
        s.availability.tuesday ||
        s.availability.wednesday ||
        s.availability.thursday ||
        s.availability.friday
      ); // At least one day available
    });

    if (availableStaff.length === 0) return null;

    // Pick first available staff for simplicity
    const selectedStaff = availableStaff[0];

    // Find a suitable time slot based on staff availability
    const nextAvailableSlot = findNextAvailableTimeSlot(
      selectedStaff.id,
      job.estimatedHours,
    );
    if (!nextAvailableSlot) return null;

    // Create a new schedule event
    const newEvent: Omit<ScheduleEvent, "id"> = {
      jobId,
      staffId: selectedStaff.id,
      startTime: nextAvailableSlot.startTime.toISOString(),
      endTime: nextAvailableSlot.endTime.toISOString(),
      isAutoScheduled: true,
    };

    // Add the event to the schedule
    const createdEvent = {
      ...newEvent,
      id: `event-${Date.now()}`,
    };

    setSchedule([...schedule, createdEvent]);

    // Return the created event
    return { 
      event: createdEvent, 
      conflicts: [],
      hasErrors: false
    };
  };

  // Find the next available time slot for a staff member
  const findNextAvailableTimeSlot = (
    staffId: string,
    requiredHours: number,
  ) => {
    const staffMember = staff.find((s) => s.id === staffId);
    if (!staffMember) return null;

    // Get all existing events for this staff member
    const staffEvents = schedule
      .filter((event) => event.staffId === staffId)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );

    // Start from today
    let currentDate = new Date();
    currentDate.setHours(9, 0, 0, 0); // Start at 9 AM

    // Try to find a slot in the next 14 days
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const checkDate = addDays(currentDate, dayOffset);
      const dayOfWeek = format(checkDate, "EEEE").toLowerCase();

      // Skip days when staff is not available
      if (
        !staffMember.availability[
          dayOfWeek as keyof typeof staffMember.availability
        ]
      ) {
        continue;
      }

      // Get availability hours for this day
      const availabilityHours =
        staffMember.availabilityHours?.[
          dayOfWeek as keyof typeof staffMember.availabilityHours
        ];
      if (!availabilityHours) {
        // Default hours if not specified
        const dayStart = new Date(checkDate);
        dayStart.setHours(9, 0, 0, 0);

        const dayEnd = new Date(checkDate);
        dayEnd.setHours(17, 0, 0, 0);

        // Check for existing events on this day
        const dayEvents = staffEvents.filter((event) => {
          const eventStart = new Date(event.startTime);
          return (
            format(eventStart, "yyyy-MM-dd") === format(checkDate, "yyyy-MM-dd")
          );
        });

        // Find available slot
        const slot = findSlotInDay(dayStart, dayEnd, dayEvents, requiredHours);
        if (slot) return slot;

        continue;
      }

      // Parse start and end times
      const [startHour, startMinute] = availabilityHours.start
        .split(":")
        .map(Number);
      const [endHour, endMinute] = availabilityHours.end.split(":").map(Number);

      // Set day start and end times
      const dayStart = new Date(checkDate);
      dayStart.setHours(startHour, startMinute, 0, 0);

      const dayEnd = new Date(checkDate);
      dayEnd.setHours(endHour, endMinute, 0, 0);

      // Get events for this day
      const dayEvents = staffEvents.filter((event) => {
        const eventStart = new Date(event.startTime);
        return (
          format(eventStart, "yyyy-MM-dd") === format(checkDate, "yyyy-MM-dd")
        );
      });

      // Find available slot
      const slot = findSlotInDay(dayStart, dayEnd, dayEvents, requiredHours);
      if (slot) return slot;
    }

    // If we get here, we couldn't find a suitable slot
    return null;
  };

  // Helper function to find an available slot in a day
  const findSlotInDay = (
    dayStart: Date,
    dayEnd: Date,
    dayEvents: ScheduleEvent[],
    requiredHours: number,
  ) => {
    // If no events, the whole day is available
    if (dayEvents.length === 0) {
      // Check if we have enough hours in the day
      const availableHours =
        (dayEnd.getTime() - dayStart.getTime()) / (1000 * 60 * 60);

      if (availableHours >= requiredHours) {
        // We can fit the job in this day
        const endTime = new Date(dayStart);
        endTime.setTime(dayStart.getTime() + requiredHours * 60 * 60 * 1000);

        return {
          startTime: dayStart,
          endTime: endTime,
        };
      } else {
        // Not enough hours in this day
        return null;
      }
    }

    // Sort events by start time
    dayEvents.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    // Check for gaps between events
    let timePointer = new Date(dayStart);

    for (const event of dayEvents) {
      const eventStart = new Date(event.startTime);

      // If there's a gap before this event
      if (eventStart.getTime() > timePointer.getTime()) {
        const gapHours =
          (eventStart.getTime() - timePointer.getTime()) / (1000 * 60 * 60);

        if (gapHours >= requiredHours) {
          // We found a suitable gap
          const endTime = new Date(timePointer);
          endTime.setTime(
            timePointer.getTime() + requiredHours * 60 * 60 * 1000,
          );

          return {
            startTime: timePointer,
            endTime: endTime,
          };
        }
      }

      // Move pointer to after this event
      timePointer = new Date(event.endTime);
    }

    // Check if there's time after the last event
    if (timePointer.getTime() < dayEnd.getTime()) {
      const remainingHours =
        (dayEnd.getTime() - timePointer.getTime()) / (1000 * 60 * 60);

      if (remainingHours >= requiredHours) {
        // We can fit the job after the last event
        const endTime = new Date(timePointer);
        endTime.setTime(timePointer.getTime() + requiredHours * 60 * 60 * 1000);

        return {
          startTime: timePointer,
          endTime: endTime,
        };
      }
    }

    return null;
  };

  // Feedback functions
  const addFeedback = (feedbackItem: Omit<FeedbackItem, "id">) => {
    const newFeedback = {
      ...feedbackItem,
      id: `feedback-${Date.now()}`,
    };
    setFeedback([...feedback, newFeedback]);
  };

  // Settings functions
  const updateBusinessHours = (hours: BusinessHours) => {
    setSettings({
      ...settings,
      businessHours: hours,
    });
  };

  // Update job types
  const updateJobTypes = (types: JobTypeDefinition[]) => {
    setJobTypes(types);
  };

  // Apply default business hours to a staff member's availability
  const applyDefaultAvailabilityToStaff = (staffId?: string) => {
    const { start, end } = settings.businessHours;
    
    if (staffId) {
      // Update a specific staff member
      const staffMember = staff.find((s) => s.id === staffId);
      if (!staffMember) return;

      const updatedStaff = {
        ...staffMember,
        availabilityHours: {
          monday: { start, end },
          tuesday: { start, end },
          wednesday: { start, end },
          thursday: { start, end },
          friday: { start, end },
          saturday: staffMember.availability.saturday 
            ? { start, end } 
            : undefined,
          sunday: staffMember.availability.sunday 
            ? { start, end } 
            : undefined,
        },
      };

      updateStaffMember(updatedStaff);
    } else {
      // Update all staff members
      const updatedStaff = staff.map((member) => ({
        ...member,
        availabilityHours: {
          monday: member.availability.monday ? { start, end } : undefined,
          tuesday: member.availability.tuesday ? { start, end } : undefined,
          wednesday: member.availability.wednesday ? { start, end } : undefined,
          thursday: member.availability.thursday ? { start, end } : undefined,
          friday: member.availability.friday ? { start, end } : undefined,
          saturday: member.availability.saturday ? { start, end } : undefined,
          sunday: member.availability.sunday ? { start, end } : undefined,
        },
      }));

      setStaff(updatedStaff);
    }
  };

  const contextValue: AppContextType = {
    // Jobs
    jobs,
    addJob,
    updateJob,
    deleteJob,
    getJobById,
    filteredJobs,
    setJobFilters,

    // Job Types
    jobTypes,
    updateJobTypes,

    // Staff
    staff,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    getStaffById,

    // Machines
    machines,
    addMachine,
    updateMachine,
    deleteMachine,
    getMachineById,

    // Schedule
    schedule,
    addScheduleEvent,
    updateScheduleEvent,
    deleteScheduleEvent,
    getScheduleForDate,
    autoScheduleJob,

    // Feedback
    feedback,
    addFeedback,

    // Dashboard
    dashboardMetrics,
    refreshDashboard,
    
    // Settings
    settings,
    updateBusinessHours,
    applyDefaultAvailabilityToStaff,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
