export interface DailyHours {
  start: string; // format: "HH:MM" (24-hour format)
  end: string; // format: "HH:MM" (24-hour format)
  isOpen: boolean;
}

export interface BusinessHours {
  start: string; // format: "HH:MM" (24-hour format)
  end: string; // format: "HH:MM" (24-hour format)
  weeklySchedule?: {
    monday: DailyHours;
    tuesday: DailyHours;
    wednesday: DailyHours;
    thursday: DailyHours;
    friday: DailyHours;
    saturday: DailyHours;
    sunday: DailyHours;
  };
  holidays?: Array<{
    date: string; // format: "YYYY-MM-DD"
    name: string;
  }>;
}

export interface AppSettings {
  businessHours: BusinessHours;
}
