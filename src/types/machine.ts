export interface Machine {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  hoursPerDay: number;
  maintenanceSchedule?: {
    lastMaintenance: string;
    nextMaintenance: string;
  };
  status: "operational" | "maintenance" | "offline";
}
