export interface BusinessHours {
  start: string; // format: "HH:MM" (24-hour format)
  end: string; // format: "HH:MM" (24-hour format)
}

export interface AppSettings {
  businessHours: BusinessHours;
}
