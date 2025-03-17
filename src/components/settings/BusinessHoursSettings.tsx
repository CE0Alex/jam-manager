import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Plus, X } from "lucide-react";
import { formatTime12Hour } from "@/lib/timeUtils";
import { format } from "date-fns";

// Add types for daily hours
interface DailyHours {
  start: string;
  end: string;
  isOpen: boolean;
}

interface BusinessHoursData {
  monday: DailyHours;
  tuesday: DailyHours;
  wednesday: DailyHours;
  thursday: DailyHours;
  friday: DailyHours;
  saturday: DailyHours;
  sunday: DailyHours;
  holidays: {
    date: string;
    name: string;
  }[];
}

export default function BusinessHoursSettings() {
  const { settings, updateBusinessHours, applyDefaultAvailabilityToStaff } = useAppContext();
  
  // Initialize with default weekly hours (8am-5pm for weekdays, closed weekends)
  const [businessHours, setBusinessHours] = useState<BusinessHoursData>({
    monday: { start: settings.businessHours.start, end: settings.businessHours.end, isOpen: true },
    tuesday: { start: settings.businessHours.start, end: settings.businessHours.end, isOpen: true },
    wednesday: { start: settings.businessHours.start, end: settings.businessHours.end, isOpen: true },
    thursday: { start: settings.businessHours.start, end: settings.businessHours.end, isOpen: true },
    friday: { start: settings.businessHours.start, end: settings.businessHours.end, isOpen: true },
    saturday: { start: "09:00", end: "13:00", isOpen: false },
    sunday: { start: "09:00", end: "13:00", isOpen: false },
    holidays: []
  });

  const [activeTab, setActiveTab] = useState("general");
  const [applyToAll, setApplyToAll] = useState(false);
  const [newHolidayDate, setNewHolidayDate] = useState<Date | undefined>(undefined);
  const [newHolidayName, setNewHolidayName] = useState("");
  
  // Generate time options for 12-hour format
  const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    const time24h = `${hour.toString().padStart(2, "0")}:${minute}`;
    return { 
      value: time24h,
      label: formatTime12Hour(time24h)
    };
  });
  
  const handleDailyHoursChange = (day: keyof Omit<BusinessHoursData, 'holidays'>, field: keyof DailyHours, value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleAddHoliday = () => {
    if (!newHolidayDate || !newHolidayName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a date and name for the holiday.",
        variant: "destructive"
      });
      return;
    }

    const formattedDate = format(newHolidayDate, "yyyy-MM-dd");
    
    setBusinessHours(prev => ({
      ...prev,
      holidays: [
        ...prev.holidays,
        { date: formattedDate, name: newHolidayName.trim() }
      ]
    }));

    // Reset form
    setNewHolidayDate(undefined);
    setNewHolidayName("");
  };

  const handleRemoveHoliday = (index: number) => {
    setBusinessHours(prev => ({
      ...prev,
      holidays: prev.holidays.filter((_, i) => i !== index)
    }));
  };
  
  const handleSave = () => {
    // For compatibility with existing system, use Monday's hours as the default
    updateBusinessHours({
      start: businessHours.monday.start,
      end: businessHours.monday.end,
      // Store the complete weekly schedule in a new field
      weeklySchedule: {
        monday: businessHours.monday,
        tuesday: businessHours.tuesday,
        wednesday: businessHours.wednesday,
        thursday: businessHours.thursday,
        friday: businessHours.friday,
        saturday: businessHours.saturday,
        sunday: businessHours.sunday
      },
      holidays: businessHours.holidays
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General Hours</TabsTrigger>
            <TabsTrigger value="holidays">Holidays & Closures</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6 mt-4">
            <div className="space-y-4">
              {/* Days of the week */}
              {Object.entries(businessHours)
                .filter(([key]) => key !== 'holidays')
                .map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-4 p-2 border rounded-md">
                    <div className="flex items-center w-20">
                      <Switch
                        id={`${day}-active`}
                        checked={hours.isOpen}
                        onCheckedChange={(checked) => 
                          handleDailyHoursChange(day as keyof Omit<BusinessHoursData, 'holidays'>, 'isOpen', checked)}
                      />
                      <Label htmlFor={`${day}-active`} className="ml-2 capitalize">
                        {day}
                      </Label>
                    </div>
                    
                    {hours.isOpen ? (
                      <div className="flex flex-1 items-center space-x-2">
                        <Select 
                          value={hours.start}
                          onValueChange={(value) => 
                            handleDailyHoursChange(day as keyof Omit<BusinessHoursData, 'holidays'>, 'start', value)}
                          disabled={!hours.isOpen}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={`${day}-start-${time.value}`} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <span>to</span>
                        
                        <Select
                          value={hours.end}
                          onValueChange={(value) => 
                            handleDailyHoursChange(day as keyof Omit<BusinessHoursData, 'holidays'>, 'end', value)}
                          disabled={!hours.isOpen}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={`${day}-end-${time.value}`} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">Closed</div>
                    )}
                  </div>
              ))}
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
          </TabsContent>
          
          <TabsContent value="holidays" className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-medium">Holidays & Special Closures</h3>
                <p className="text-muted-foreground text-sm">Add dates when your business will be closed for holidays or special events.</p>
              </div>
              
              {/* Existing holidays list */}
              {businessHours.holidays.length > 0 ? (
                <div className="space-y-2">
                  {businessHours.holidays.map((holiday, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <span className="font-medium">{holiday.name}</span>
                        <span className="text-muted-foreground ml-2">({format(new Date(holiday.date), "MMMM d, yyyy")})</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveHoliday(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No holidays or closures added yet
                </div>
              )}
              
              {/* Add new holiday form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-md p-4">
                <div>
                  <Label htmlFor="holiday-date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newHolidayDate ? (
                          format(newHolidayDate, "MMMM d, yyyy")
                        ) : (
                          <span>Select date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newHolidayDate}
                        onSelect={setNewHolidayDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="holiday-name">Description</Label>
                  <Input
                    id="holiday-name"
                    placeholder="e.g. Christmas Day"
                    value={newHolidayName}
                    onChange={(e) => setNewHolidayName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button 
                    className="w-full" 
                    onClick={handleAddHoliday}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Holiday
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
