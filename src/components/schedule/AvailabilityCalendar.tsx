import React, { useState, useEffect, useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format, addDays, parseISO, subDays, startOfDay, endOfDay, isSameDay } from "date-fns";
import { Calendar, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Layers, UserX, Clock } from "lucide-react";
import { generateTimeBlocks } from "@/lib/scheduling";

export default function AvailabilityCalendar() {
  const { staff, schedule, jobs } = useAppContext();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string>("all"); // "all" or staff ID
  const [viewType, setViewType] = useState<string>("day"); // "day" or "week"
  
  // Create job ID to title mapping for tooltips
  const jobTitles = useMemo(() => {
    const titles: Record<string, string> = {};
    jobs.forEach(job => {
      titles[job.id] = job.title;
    });
    return titles;
  }, [jobs]);
  
  // Generate time blocks for visualization
  const timeBlocks = useMemo(() => {
    if (viewType === "day") {
      // Filter staff if needed
      const filteredStaff = selectedStaff === "all" 
        ? staff
        : staff.filter(member => member.id === selectedStaff);
      
      return generateTimeBlocks(selectedDate, filteredStaff, schedule, true);
    } else if (viewType === "week") {
      // Generate blocks for each day in the week
      let allBlocks: any[] = [];
      
      for (let i = 0; i < 7; i++) {
        const day = addDays(startOfDay(selectedDate), i - selectedDate.getDay());
        
        // Filter staff if needed
        const filteredStaff = selectedStaff === "all" 
          ? staff
          : staff.filter(member => member.id === selectedStaff);
        
        const dayBlocks = generateTimeBlocks(day, filteredStaff, schedule, true);
        allBlocks = [...allBlocks, ...dayBlocks];
      }
      
      return allBlocks;
    }
    
    return [];
  }, [selectedDate, selectedStaff, viewType, staff, schedule]);

  // Navigate to previous/next day or week
  const navigatePrevious = () => {
    if (viewType === "day") {
      setSelectedDate(prev => subDays(prev, 1));
    } else {
      setSelectedDate(prev => subDays(prev, 7));
    }
  };
  
  const navigateNext = () => {
    if (viewType === "day") {
      setSelectedDate(prev => addDays(prev, 1));
    } else {
      setSelectedDate(prev => addDays(prev, 7));
    }
  };
  
  // Group blocks by hour for rendering
  const timeRows = useMemo(() => {
    const rows: Record<string, any[]> = {};
    
    // Create rows for each hour (8am to 6pm)
    for (let hour = 8; hour <= 18; hour++) {
      const hourKey = `${hour.toString().padStart(2, "0")}:00`;
      rows[hourKey] = [];
    }
    
    // Assign blocks to rows based on their start time
    timeBlocks.forEach(block => {
      const hour = format(block.start, "HH:00");
      if (rows[hour]) {
        rows[hour].push(block);
      }
    });
    
    return rows;
  }, [timeBlocks]);
  
  // Filter blocks by day for week view
  const getDayBlocks = (day: Date) => {
    return timeBlocks.filter(block => isSameDay(block.start, day));
  };
  
  // Get week days array for rendering week view
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startOfDay(selectedDate), i - selectedDate.getDay()));
    }
    return days;
  }, [selectedDate]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Staff Availability</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
              <div className="space-y-1 w-full md:w-48">
                <Label htmlFor="staff-select">Staff Member</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger id="staff-select">
                    <SelectValue placeholder="All Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {staff.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">
                  {viewType === "day" ? format(selectedDate, "EEEE, MMMM d, yyyy") : 
                    `Week of ${format(weekDays[0], "MMM d")} - ${format(weekDays[6], "MMM d, yyyy")}`}
                </div>
              </div>
            </div>
            
            <Tabs value={viewType} onValueChange={setViewType} className="w-full md:w-auto">
              <TabsList className="grid w-full md:w-[200px] grid-cols-2">
                <TabsTrigger value="day" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Day View
                </TabsTrigger>
                <TabsTrigger value="week" className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Week View
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center mb-2 gap-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-500 mr-1"></div>
                <span className="text-xs">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                <span className="text-xs">Scheduled</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-100 border border-red-500 mr-1"></div>
                <span className="text-xs">Unavailable</span>
              </div>
            </div>
            
            {viewType === "day" ? (
              <div className="border rounded-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Time
                      </th>
                      {selectedStaff === "all" ? (
                        staff.map(member => (
                          <th 
                            key={member.id} 
                            className="py-2 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {member.name}
                          </th>
                        ))
                      ) : (
                        <th className="py-2 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {staff.find(s => s.id === selectedStaff)?.name || "Staff"}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(timeRows).map(([hour, blocks]) => (
                      <tr key={hour} className="hover:bg-gray-50">
                        <td className="py-2 px-4 text-sm text-gray-900 align-top whitespace-nowrap">
                          {(() => {
                            const [h, m] = hour.split(':');
                            const hourNum = parseInt(h);
                            return `${hourNum > 12 ? hourNum - 12 : hourNum}:${m} ${hourNum >= 12 ? 'PM' : 'AM'}`;
                          })()}
                        </td>
                        
                        {selectedStaff === "all" ? (
                          staff.map(member => {
                            const staffBlocks = blocks.filter(block => block.staffId === member.id);
                            return (
                              <td key={member.id} className="py-2 px-4 text-sm text-gray-500">
                                {staffBlocks.length === 0 ? (
                                  <div className="h-6"></div>
                                ) : (
                                  <div className="space-y-1">
                                    {staffBlocks.map((block, idx) => (
                                      <div 
                                        key={idx}
                                        className={`
                                          rounded p-1 text-xs
                                          ${block.type === 'event' ? 'bg-blue-500 text-white' : ''}
                                          ${block.type === 'available' ? 'bg-blue-100 border border-blue-200' : ''}
                                          ${block.type === 'unavailable' ? 'bg-red-100 border border-red-200' : ''}
                                        `}
                                        title={block.title}
                                      >
                                        {block.type === 'event' && block.jobId && (
                                          <span>{jobTitles[block.jobId] || 'Job'}</span>
                                        )}
                                        {block.type !== 'event' && (
                                          <span>{block.title}</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            );
                          })
                        ) : (
                          <td className="py-2 px-4 text-sm text-gray-500">
                            {blocks.length === 0 ? (
                              <div className="h-6"></div>
                            ) : (
                              <div className="space-y-1">
                                {blocks.map((block, idx) => (
                                  <div 
                                    key={idx}
                                    className={`
                                      rounded p-1 text-xs
                                      ${block.type === 'event' ? 'bg-blue-500 text-white' : ''}
                                      ${block.type === 'available' ? 'bg-blue-100 border border-blue-200' : ''}
                                      ${block.type === 'unavailable' ? 'bg-red-100 border border-red-200' : ''}
                                    `}
                                    title={block.title}
                                  >
                                    {block.type === 'event' && block.jobId && (
                                      <>
                                        <span>{jobTitles[block.jobId] || 'Job'}</span>
                                        <span className="text-xs ml-1 opacity-80">
                                          ({format(block.start, "h:mm")} - {format(block.end, "h:mm a")})
                                        </span>
                                      </>
                                    )}
                                    {block.type !== 'event' && (
                                      <span>{block.title}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map(day => (
                  <div 
                    key={format(day, "yyyy-MM-dd")} 
                    className={`
                      border rounded-md overflow-hidden
                      ${isSameDay(day, new Date()) ? 'border-blue-500' : 'border-gray-200'}
                    `}
                  >
                    <div className={`
                      py-1 px-2 text-center font-medium text-sm
                      ${isSameDay(day, new Date()) ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700'}
                    `}>
                      {format(day, "EEE, MMM d")}
                    </div>
                    <div className="p-2 space-y-1 min-h-[100px]">
                      {getDayBlocks(day).length === 0 ? (
                        <div className="flex items-center justify-center h-full text-sm text-gray-400">
                          <UserX className="h-4 w-4 mr-1" />
                          No availability
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {getDayBlocks(day)
                            .filter(block => block.type === 'event')
                            .map((block, idx) => (
                              <div 
                                key={idx}
                                className="bg-blue-500 text-white rounded p-1 text-xs"
                                title={block.title}
                              >
                                <div className="font-medium">
                                  {jobTitles[block.jobId || ''] || 'Job'}
                                </div>
                                <div className="text-xs opacity-80">
                                  {format(block.start, "h:mm")} - {format(block.end, "h:mm a")}
                                </div>
                                {block.staffId && (
                                  <div className="text-xs opacity-80">
                                    {staff.find(s => s.id === block.staffId)?.name || 'Staff'}
                                  </div>
                                )}
                              </div>
                            ))}
                          
                          {getDayBlocks(day)
                            .filter(block => block.type === 'available')
                            .map((block, idx) => (
                              <div 
                                key={idx}
                                className="bg-blue-100 border border-blue-200 rounded p-1 text-xs"
                              >
                                <div className="font-medium">{block.title}</div>
                                <div className="text-xs">
                                  {format(block.start, "h:mm")} - {format(block.end, "h:mm a")}
                                </div>
                                {block.staffId && (
                                  <div className="text-xs">
                                    {staff.find(s => s.id === block.staffId)?.name || 'Staff'}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
