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
} from "@/types";
import {
  mockStaff,
  mockJobs,
  mockMachines,
  mockSchedule,
  generateDashboardMetrics,
} from "@/lib/mockData";
import { addDays, format } from "date-fns";

interface AppContextType {
  // Jobs
  jobs: Job[];
  addJob: (job: Omit<Job, "id" | "createdAt" | "updatedAt">) => void;
  updateJob: (job: Job) => void;
  deleteJob: (id: string) => void;
  getJobById: (id: string) => Job | undefined;
  filteredJobs: Job[];
  setJobFilters: (filters: JobFilters) => void;

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
  addScheduleEvent: (event: Omit<ScheduleEvent, "id">) => void;
  updateScheduleEvent: (event: ScheduleEvent) => void;
  deleteScheduleEvent: (id: string) => void;
  getScheduleForDate: (date: Date) => ScheduleEvent[];
  autoScheduleJob: (jobId: string) => ScheduleEvent | null;

  // Feedback
  feedback: FeedbackItem[];
  addFeedback: (feedback: Omit<FeedbackItem, "id">) => void;

  // Dashboard
  dashboardMetrics: DashboardMetrics;
  refreshDashboard: () => void;
}

interface JobFilters {
  status?: JobStatus[];
  priority?: string[];
  jobType?: JobType[];
  assignedTo?: string[];
  searchTerm?: string;
  dateRange?: { start: Date | null; end: Date | null };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Load data from localStorage or use mock data as defaults
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const storedData = localStorage.getItem(key);
      return storedData ? JSON.parse(storedData) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
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
      }
    } catch (error) {
      console.error("Error initializing localStorage:", error);
    }
  }, []);

  // State for jobs, staff, schedule
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
    // Ensure we're working with the latest data
    const currentJobs = jobs;
    const currentSchedule = schedule;
    const currentStaff = staff;
    const currentMachines = machines;
    // Calculate job status distribution
    const jobStatusDistribution: Record<JobStatus, number> = {
      pending: 0,
      in_progress: 0,
      review: 0,
      completed: 0,
      cancelled: 0,
    };

    currentJobs.forEach((job) => {
      jobStatusDistribution[job.status]++;
    });

    // Calculate upcoming deadlines
    const today = new Date();
    const upcomingDeadlines = currentJobs
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
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      );

    // Calculate staff workload
    const staffWorkload: Record<string, number> = {};
    currentStaff.forEach((staffMember) => {
      const assignedJobsCount = currentJobs.filter(
        (job) => job.assignedTo === staffMember.id,
      ).length;
      staffWorkload[staffMember.id] = assignedJobsCount;
    });

    // Calculate machine utilization
    const machineUtilization: Record<string, number> = {};
    currentMachines.forEach((machine) => {
      const machineEvents = currentSchedule.filter(
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
    const totalCapacity = currentStaff.length * 40; // 40 hours per week per staff
    const totalScheduled = currentSchedule.reduce((total, event) => {
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
    setSchedule([...schedule, newEvent]);
  };

  const updateScheduleEvent = (event: ScheduleEvent) => {
    setSchedule(schedule.map((e) => (e.id === event.id ? event : e)));
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
  const autoScheduleJob = (jobId: string): ScheduleEvent | null => {
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
    return createdEvent;
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

  const contextValue: AppContextType = {
    // Jobs
    jobs,
    addJob,
    updateJob,
    deleteJob,
    getJobById,
    filteredJobs,
    setJobFilters,

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
