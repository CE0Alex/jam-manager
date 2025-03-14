import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlockedTime {
  date: string;
  start: string;
  end: string;
  reason?: string;
}

interface BlockedTimeManagerProps {
  blockedTimes: BlockedTime[];
  onUpdate: (blockedTimes: BlockedTime[]) => void;
}

export default function BlockedTimeManager({
  blockedTimes = [],
  onUpdate,
}: BlockedTimeManagerProps) {
  const [newBlockedTime, setNewBlockedTime] = useState<BlockedTime>({
    date: format(new Date(), "yyyy-MM-dd"),
    start: "09:00",
    end: "17:00",
    reason: "",
  });

  const handleAddBlockedTime = () => {
    if (!newBlockedTime.date || !newBlockedTime.start || !newBlockedTime.end) {
      return;
    }

    onUpdate([...blockedTimes, newBlockedTime]);

    // Reset form
    setNewBlockedTime({
      date: format(new Date(), "yyyy-MM-dd"),
      start: "09:00",
      end: "17:00",
      reason: "",
    });
  };

  const handleRemoveBlockedTime = (index: number) => {
    const updatedBlockedTimes = [...blockedTimes];
    updatedBlockedTimes.splice(index, 1);
    onUpdate(updatedBlockedTimes);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setNewBlockedTime({
        ...newBlockedTime,
        date: format(date, "yyyy-MM-dd"),
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Blocked Time</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="blocked-date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !newBlockedTime.date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newBlockedTime.date
                    ? format(new Date(newBlockedTime.date), "PPP")
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(newBlockedTime.date)}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blocked-start">Start Time</Label>
            <Select
              value={newBlockedTime.start}
              onValueChange={(value) =>
                setNewBlockedTime({
                  ...newBlockedTime,
                  start: value,
                })
              }
            >
              <SelectTrigger id="blocked-start">
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
            <Label htmlFor="blocked-end">End Time</Label>
            <Select
              value={newBlockedTime.end}
              onValueChange={(value) =>
                setNewBlockedTime({
                  ...newBlockedTime,
                  end: value,
                })
              }
            >
              <SelectTrigger id="blocked-end">
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

          <div className="space-y-2">
            <Label htmlFor="blocked-reason">Reason (Optional)</Label>
            <div className="flex space-x-2">
              <Input
                id="blocked-reason"
                value={newBlockedTime.reason}
                onChange={(e) =>
                  setNewBlockedTime({
                    ...newBlockedTime,
                    reason: e.target.value,
                  })
                }
              />
              <Button type="button" onClick={handleAddBlockedTime} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border rounded-md">
          {blockedTimes.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No blocked times added yet
            </div>
          ) : (
            <div className="divide-y">
              {blockedTimes.map((blockedTime, index) => (
                <div
                  key={index}
                  className="p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">
                      {format(new Date(blockedTime.date), "PPP")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {blockedTime.start} - {blockedTime.end}
                      {blockedTime.reason && `: ${blockedTime.reason}`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveBlockedTime(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
