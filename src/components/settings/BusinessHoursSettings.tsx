import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function BusinessHoursSettings() {
  const { settings, updateBusinessHours, applyDefaultAvailabilityToStaff } = useAppContext();
  
  const [startTime, setStartTime] = useState(settings.businessHours.start);
  const [endTime, setEndTime] = useState(settings.businessHours.end);
  const [applyToAll, setApplyToAll] = useState(false);
  
  const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });
  
  const handleSave = () => {
    updateBusinessHours({
      start: startTime,
      end: endTime,
    });
    
    if (applyToAll) {
      applyDefaultAvailabilityToStaff();
    }
    
    toast({
      title: "Settings Saved",
      description: "Business hours have been updated successfully."
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Hours</CardTitle>
        <CardDescription>
          Set the default business hours for your company. These hours will be used as defaults for staff availability.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Select value={startTime} onValueChange={setStartTime}>
              <SelectTrigger id="startTime">
                <SelectValue placeholder="Start time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={`start-${time}`} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Select value={endTime} onValueChange={setEndTime}>
              <SelectTrigger id="endTime">
                <SelectValue placeholder="End time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={`end-${time}`} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="applyToAll"
            checked={applyToAll}
            onCheckedChange={setApplyToAll}
          />
          <Label htmlFor="applyToAll">
            Apply these hours to all staff availability
          </Label>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
