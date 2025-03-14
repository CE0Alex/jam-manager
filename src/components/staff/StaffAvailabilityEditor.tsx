import React, { useState } from "react";
import { StaffMember } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BlockedTimeManager from "./BlockedTimeManager";

interface StaffAvailabilityEditorProps {
  staffMember: StaffMember;
  onSave: (updatedStaff: StaffMember) => void;
}

const StaffAvailabilityEditor: React.FC<StaffAvailabilityEditorProps> = ({
  staffMember,
  onSave,
}) => {
  const [availability, setAvailability] = useState({
    ...staffMember.availability,
  });

  const [availabilityHours, setAvailabilityHours] = useState(
    staffMember.availabilityHours || {
      monday: { start: "08:00", end: "17:00" },
      tuesday: { start: "08:00", end: "17:00" },
      wednesday: { start: "08:00", end: "17:00" },
      thursday: { start: "08:00", end: "17:00" },
      friday: { start: "08:00", end: "17:00" },
      saturday: { start: "08:00", end: "17:00" },
      sunday: { start: "08:00", end: "17:00" },
    },
  );

  const [blockedTimes, setBlockedTimes] = useState<
    Array<{
      date: string;
      start: string;
      end: string;
      reason?: string;
    }>
  >(staffMember.blockedTimes || []);

  const handleAvailabilityChange = (day: string, checked: boolean) => {
    setAvailability({
      ...availability,
      [day]: checked,
    });
  };

  const handleHoursChange = (
    day: string,
    field: "start" | "end",
    value: string,
  ) => {
    setAvailabilityHours({
      ...availabilityHours,
      [day]: {
        ...availabilityHours[day as keyof typeof availabilityHours],
        [field]: value,
      },
    });
  };

  const handleUpdateBlockedTimes = (
    newBlockedTimes: Array<{
      date: string;
      start: string;
      end: string;
      reason?: string;
    }>,
  ) => {
    setBlockedTimes(newBlockedTimes);
  };

  const handleSave = () => {
    const updatedStaff = {
      ...staffMember,
      availability,
      availabilityHours,
      blockedTimes,
    };
    onSave(updatedStaff);
  };

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Availability Settings for {staffMember.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
            <TabsTrigger value="blocked">Blocked Times</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            <div className="grid gap-6">
              {days.map((day) => (
                <div key={day.key} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 w-1/4">
                    <Checkbox
                      id={`${day.key}-available`}
                      checked={
                        availability[day.key as keyof typeof availability]
                      }
                      onCheckedChange={(checked) =>
                        handleAvailabilityChange(day.key, checked as boolean)
                      }
                    />
                    <Label htmlFor={`${day.key}-available`}>{day.label}</Label>
                  </div>

                  {availability[day.key as keyof typeof availability] && (
                    <div className="flex items-center space-x-2 w-3/4">
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="space-y-2">
                          <Label htmlFor={`${day.key}-start`}>Start Time</Label>
                          <Select
                            value={
                              availabilityHours[
                                day.key as keyof typeof availabilityHours
                              ]?.start || "08:00"
                            }
                            onValueChange={(value) =>
                              handleHoursChange(day.key, "start", value)
                            }
                          >
                            <SelectTrigger id={`${day.key}-start`}>
                              <SelectValue placeholder="Start time" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 19 }, (_, i) => {
                                const hour = Math.floor(i / 2) + 8;
                                const minute = i % 2 === 0 ? "00" : "30";
                                const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                                const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
                                return (
                                  <SelectItem key={time} value={time}>
                                    {displayTime}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${day.key}-end`}>End Time</Label>
                          <Select
                            value={
                              availabilityHours[
                                day.key as keyof typeof availabilityHours
                              ]?.end || "17:00"
                            }
                            onValueChange={(value) =>
                              handleHoursChange(day.key, "end", value)
                            }
                          >
                            <SelectTrigger id={`${day.key}-end`}>
                              <SelectValue placeholder="End time" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 19 }, (_, i) => {
                                const hour = Math.floor(i / 2) + 8;
                                const minute = i % 2 === 0 ? "00" : "30";
                                const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                                const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
                                return (
                                  <SelectItem key={time} value={time}>
                                    {displayTime}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="blocked" className="space-y-4">
            <BlockedTimeManager
              blockedTimes={blockedTimes}
              onUpdate={handleUpdateBlockedTimes}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>Save Availability</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffAvailabilityEditor;
