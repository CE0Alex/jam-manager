// This is a robust component that implements the full ProductionCalendar functionality
// but with fixes to ensure it builds correctly
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, 
  isSameDay, parseISO, startOfMonth, endOfMonth, isSameMonth, 
  addMonths, subMonths 
} from "date-fns";
import { 
  ChevronLeft, ChevronRight, Plus, Calendar, 
  Users, Wand2, Clock, Star, Grid3X3, List 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatTime12Hour } from "@/lib/timeUtils";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import * as autoScheduleUtils from "@/lib/scheduling/autoScheduleUtils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Create a proper wrapper component that implements the ProductionCalendar functionality
const ProductionCalendarFixed = (props) => {
  console.log('ProductionCalendar.fixed rendering with props:', props);
  
  const { 
    initialDate = new Date(), 
    initialView = "week", 
    initialJob = null, 
    onScheduled 
  } = props;
  
    const { schedule = [], jobs = [], staff = [], addScheduleEvent } = useAppContext?.() || {};
    const navigate = useNavigate();
  
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [view, setView] = useState(initialView);
    const [activeTab, setActiveTab] = useState("schedule");
  
    // Interactive Schedule Dialog state
    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedStaffId, setSelectedStaffId] = useState("unassigned");
    const [scheduleSuggestions, setScheduleSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [scheduleData, setScheduleData] = useState({
        startDate: format(new Date(), "yyyy-MM-dd"),
        startTime: "09:00",
        endTime: "",
        notes: ""
    });
  
    // Calculate the start and end of the current week
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // End on Sunday
  
    // Generate array of days for the week view
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Initialize with initialJob if provided
  useEffect(() => {
    if (initialJob && onScheduled) {
      // Set the job for the schedule dialog
      openScheduleDialog(initialJob);
    }
  }, [initialJob, onScheduled]);
  
    // Handle calendar navigation based on the view
    const handleCalendarNavigation = (direction) => {
        switch (view) {
            case 'month':
                if (direction === 'prev') {
                    setCurrentDate(subMonths(currentDate, 1));
        } else {
                    setCurrentDate(addMonths(currentDate, 1));
                }
                break;
            case 'week':
                if (direction === 'prev') {
                    setCurrentDate(addDays(currentDate, -7));
        } else {
                    setCurrentDate(addDays(currentDate, 7));
                }
                break;
            case 'day':
                if (direction === 'prev') {
                    setCurrentDate(addDays(currentDate, -1));
        } else {
                    setCurrentDate(addDays(currentDate, 1));
                }
                break;
        }
    };
  
    // Get events for a specific day
    const getEventsForDay = (date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        return schedule.filter((event) => {
            const eventStart = new Date(event.startTime);
            const eventStartDate = format(eventStart, "yyyy-MM-dd");
            return eventStartDate === dateStr;
        });
    };

    // Get job and staff details for an event
    const getEventDetails = (jobId, staffId) => {
        const job = jobs.find((j) => j.id === jobId);
    const staffMember = staffId ? staff.find((s) => s.id === staffId) : undefined;
    
        return {
            jobTitle: job?.title || "Unknown Job",
            jobStatus: (job?.status || "pending"),
            staffName: staffMember?.name || "Unassigned",
        };
    };

    // Open the schedule dialog with a selected job
    const openScheduleDialog = (job) => {
        setSelectedJob(job);
        setSelectedStaffId("unassigned");
        setScheduleData({
            startDate: format(new Date(), "yyyy-MM-dd"),
            startTime: "09:00",
            endTime: "",
            notes: ""
        });
        setIsScheduleDialogOpen(true);
    
        // Generate scheduling suggestions
        generateScheduleSuggestions(job);
    };

    // Close the schedule dialog
    const closeScheduleDialog = () => {
        setIsScheduleDialogOpen(false);
        setSelectedJob(null);
        setSelectedStaffId("unassigned");
    
    // Call onScheduled to signal completion
    if (onScheduled && typeof onScheduled === 'function') {
      onScheduled();
    }
  };

    // Generate scheduling suggestions for a job
    const generateScheduleSuggestions = (job) => {
    if (!job) return;
    
        setIsLoadingSuggestions(true);
        setScheduleSuggestions([]);
    
    try {
      // Check if autoScheduleUtils is available and has the function
      if (typeof autoScheduleUtils?.findScheduleSuggestions === 'function') {
        const suggestions = autoScheduleUtils.findScheduleSuggestions(
          job, 
          staff, 
          schedule, 
          3, // limit to 3 suggestions for UI simplicity
            10 // days to check
            );
        setScheduleSuggestions(suggestions || []);
      } else {
        console.warn('autoScheduleUtils.findScheduleSuggestions is not available');
        setScheduleSuggestions([]);
        }
    } catch (error) {
            console.error("Error generating suggestions:", error);
            toast({
                title: "Failed to generate suggestions",
                description: "There was an error generating schedule suggestions.",
                variant: "destructive",
            });
    } finally {
            setIsLoadingSuggestions(false);
        }
    };

    // Apply a scheduling suggestion
    const applySuggestion = (suggestion) => {
        setSelectedStaffId(suggestion.staffId);
        setScheduleData({
            startDate: suggestion.date,
            startTime: suggestion.startTime,
            endTime: suggestion.endTime,
            notes: ""
        });
    
        toast({
            title: "Suggestion Applied",
            description: `Schedule with ${suggestion.staffName} on ${format(parseISO(suggestion.date), "MMM d")} has been applied.`,
        });
    };

    // Submit the schedule
    const handleScheduleSubmit = () => {
    if (!selectedJob) return;
    
        // Validate required fields
        if (!scheduleData.startDate || !scheduleData.startTime || !scheduleData.endTime) {
            toast({
                title: "Missing Information",
                description: "Please fill out all required scheduling fields",
                variant: "destructive"
            });
            return;
        }
    
        try {
            // Format the times
            const startDateTime = new Date(scheduleData.startDate);
            const [startHour, startMinute] = scheduleData.startTime.split(":").map(Number);
            startDateTime.setHours(startHour, startMinute);
      
            const endDateTime = new Date(scheduleData.startDate);
            const [endHour, endMinute] = scheduleData.endTime.split(":").map(Number);
            endDateTime.setHours(endHour, endMinute);
      
            // Check if end time is before start time (might be the next day)
            if (endDateTime <= startDateTime) {
                endDateTime.setDate(endDateTime.getDate() + 1);
            }
      
            // Create the event
            const event = {
                jobId: selectedJob.id,
                staffId: selectedStaffId,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                notes: scheduleData.notes || undefined
            };
      
      // Add the event to the schedule
      if (typeof addScheduleEvent === 'function') {
        addScheduleEvent(event);
        
            toast({
                title: "Job Scheduled",
          description: `${selectedJob.title} has been scheduled successfully.`,
            });
        
            // Close the dialog
        closeScheduleDialog();
      } else {
        console.error("addScheduleEvent is not a function");
        toast({
          title: "Error",
          description: "Could not schedule job. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
            console.error("Error scheduling job:", error);
            toast({
        title: "Error",
        description: "There was an error scheduling the job.",
                variant: "destructive"
            });
        }
    };

  // Helper function to check staff availability
  const getStaffAvailability = (date, staffId) => {
    // This is a simplified implementation - in a real app, you'd check against a real availability system
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember || !staffMember.availability) return true;
    
    const dayOfWeek = format(date, 'EEEE').toLowerCase();
    return staffMember.availability[dayOfWeek]?.available !== false;
  };

  // Render day view 
  const renderDayView = () => {
    const dayEvents = getEventsForDay(currentDate);
    
    return _jsxs("div", {
      className: "mt-4 space-y-4",
      children: [
        // Filter controls
        _jsxs("div", {
          className: "flex items-center space-x-2 mb-4",
          children: [
            _jsx(Button, {
              variant: selectedStaffId === "unassigned" ? "default" : "outline",
              size: "sm",
              onClick: () => setSelectedStaffId("unassigned"),
              children: "All Staff"
            }),
            staff.map((staffMember) => (
              _jsx(Button, {
                variant: selectedStaffId === staffMember.id ? "default" : "outline",
                size: "sm",
                onClick: () => setSelectedStaffId(staffMember.id),
                children: staffMember.name
              }, staffMember.id)
            ))
          ]
        }),
        
        // Events list
        _jsx("div", {
          className: "space-y-2",
          children: dayEvents.length > 0 
            ? dayEvents
              .filter(event => selectedStaffId === "unassigned" || event.staffId === selectedStaffId)
              .map((event) => {
                const { jobTitle, jobStatus, staffName } = getEventDetails(event.jobId, event.staffId);
                return _jsxs("div", {
                  className: "border rounded-md p-3 hover:bg-secondary/10",
                  children: [
                    _jsxs("div", {
                      className: "flex justify-between items-start",
                      children: [
                        _jsxs("div", {
                          children: [
                            _jsx("div", {
                              className: "font-medium",
                              children: jobTitle
                            }),
                            _jsxs("div", {
                              className: "text-sm text-muted-foreground",
                              children: [
                                formatTime12Hour(new Date(event.startTime)),
                                " - ",
                                formatTime12Hour(new Date(event.endTime))
                              ]
                            })
                          ]
                        }),
                        _jsxs("div", {
                          className: "flex items-center space-x-2",
                          children: [
                            _jsx(Badge, {
                              variant: jobStatus === "completed" ? "success" : 
                                      jobStatus === "in_progress" ? "warning" : "outline",
                              children: jobStatus.replace("_", " ")
                            }),
                            _jsx(Button, {
                              variant: "ghost",
                              size: "icon",
                              onClick: () => navigate(`/jobs/${event.jobId}`),
                              children: _jsx(ChevronRight, { className: "h-4 w-4" })
                            })
                          ]
                        })
                      ]
                    }),
                    _jsxs("div", {
                      className: "mt-2 flex items-center space-x-2 text-sm",
                      children: [
                        _jsx(Users, { className: "h-4 w-4 mr-1" }),
                        _jsx("span", { children: staffName })
                      ]
                    }),
                    event.notes && _jsx("div", {
                      className: "mt-2 text-sm border-t pt-2",
                      children: event.notes
                    })
                  ]
                }, event.id);
              })
            : _jsx("div", {
              className: "text-center py-8 text-muted-foreground",
              children: "No events scheduled for this day"
            })
        }),
        
        // Add event button
        _jsx("div", {
          className: "flex justify-center mt-4",
          children: _jsxs(Button, {
            onClick: () => navigate("/jobs"),
            children: [
              _jsx(Plus, { className: "h-4 w-4 mr-2" }),
              "Schedule New Job"
            ]
          })
        })
      ]
    });
  };

  // Render month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 }); // End on Sunday
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Create weekday headers
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    return _jsxs("div", { 
      className: "mt-4", 
      children: [
        _jsx("div", { 
          className: "grid grid-cols-7 gap-1 text-center border-b pb-2", 
          children: dayNames.map(day => (
            _jsx("div", { 
              className: "font-medium", 
              children: day 
            }, day)
          )) 
        }),
        _jsx("div", { 
          className: "grid grid-cols-7 gap-1 mt-2", 
          children: days.map(day => {
            const formattedDate = format(day, "d");
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, monthStart);
            const dayString = format(day, "yyyy-MM-dd");
            const isSelected = dayString === scheduleData.startDate;
            const dayEvents = getEventsForDay(day);
            const isStaffAvailable = selectedStaffId && selectedStaffId !== "unassigned"
              ? getStaffAvailability(day, selectedStaffId)
              : true;
            
            return _jsxs("div", { 
              className: `
                p-1 h-20 border rounded-md relative
                ${isCurrentMonth ? "" : "bg-gray-50 text-gray-400"}
                ${isToday ? "bg-blue-50" : ""}
                ${isSelected ? "ring-2 ring-primary" : ""}
                ${!isStaffAvailable && isCurrentMonth ? "bg-gray-100" : ""}
                cursor-pointer hover:bg-gray-50
              `, 
              onClick: () => {
                if (isCurrentMonth) {
                  setScheduleData(prev => ({ ...prev, startDate: dayString }));
                }
              }, 
              children: [
                _jsxs("div", { 
                  className: "flex justify-between items-start", 
                  children: [
                    _jsx("span", { 
                      className: `text-sm ${isToday ? "bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center" : ""}`, 
                      children: formattedDate 
                    }),
                    isCurrentMonth && !isStaffAvailable && (
                      _jsx("span", { 
                        className: "text-xs bg-red-100 text-red-800 px-1 rounded", 
                        children: "Off" 
                      })
                    )
                  ] 
                }),
                _jsx("div", { 
                  className: "overflow-y-auto h-12 mt-1 text-xs", 
                  children: dayEvents.length > 0 && (
                    _jsx("div", { 
                      className: "mb-1", 
                      children: _jsxs(Badge, { 
                        variant: "outline", 
                        className: "text-xs", 
                        children: [
                          dayEvents.length, 
                          " event", 
                          dayEvents.length !== 1 ? 's' : ''
                        ] 
                      }) 
                    })
                  ) 
                })
              ] 
            }, day.toString());
          }) 
        })
      ] 
    });
  };

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // End on Sunday
    // Generate array of days for the week view
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return _jsxs("div", { 
      className: "mt-4", 
      children: [
        _jsx("div", { 
          className: "grid grid-cols-7 gap-1 mb-4", 
          children: weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            const dayString = format(day, "yyyy-MM-dd");
            const isSelected = dayString === scheduleData.startDate;
            const isStaffAvailable = selectedStaffId && selectedStaffId !== "unassigned"
              ? getStaffAvailability(day, selectedStaffId)
              : true;
            
            return _jsxs("div", { 
              className: `
                text-center p-2 rounded-md cursor-pointer
                ${isToday ? "bg-blue-50" : "hover:bg-gray-100"}
                ${isSelected ? "ring-2 ring-primary" : ""}
                ${!isStaffAvailable ? "bg-gray-100" : ""}
              `, 
              onClick: () => setScheduleData(prev => ({ ...prev, startDate: dayString })), 
              children: [
                _jsx("div", { 
                  className: "font-medium", 
                  children: format(day, "EEE") 
                }),
                _jsx("div", { 
                  children: format(day, "MMM d") 
                }),
                !isStaffAvailable && (
                  _jsx("div", { 
                    className: "text-xs mt-1 text-red-500", 
                    children: "Staff Unavailable" 
                  })
                )
              ] 
            }, format(day, "yyyy-MM-dd"));
          }) 
        }),
        
        // Daily Events
        _jsx("div", { 
          className: "space-y-4", 
          children: weekDays.map((day) => {
            const dayEvents = getEventsForDay(day)
              .filter(event => selectedStaffId === "unassigned" || event.staffId === selectedStaffId);
            
            if (dayEvents.length === 0) return null;
            
            return _jsxs("div", { 
              className: "border rounded-md p-4", 
              children: [
                _jsx("h3", { 
                  className: "font-medium mb-2", 
                  children: format(day, "EEEE, MMMM d") 
                }),
                _jsx("div", { 
                  className: "space-y-2", 
                  children: dayEvents.map((event) => {
                    const { jobTitle, jobStatus, staffName } = getEventDetails(event.jobId, event.staffId);
                    
                    return _jsxs("div", { 
                      className: "flex justify-between items-center p-2 border-b last:border-0", 
                      children: [
                        _jsxs("div", { 
                          children: [
                            _jsx("div", { 
                              className: "font-medium", 
                              children: jobTitle 
                            }),
                            _jsxs("div", { 
                              className: "text-xs text-muted-foreground flex items-center", 
                              children: [
                                _jsx(Clock, { className: "h-3 w-3 mr-1" }),
                                formatTime12Hour(new Date(event.startTime)),
                                " - ",
                                formatTime12Hour(new Date(event.endTime))
                              ] 
                            }),
                            _jsxs("div", { 
                              className: "text-xs text-muted-foreground flex items-center", 
                              children: [
                                _jsx(Users, { className: "h-3 w-3 mr-1" }),
                                staffName
                              ] 
                            })
                          ] 
                        }),
                        _jsxs("div", { 
                          className: "flex items-center", 
                          children: [
                            _jsx(Badge, { 
                              variant: jobStatus === "completed" ? "success" : 
                                      jobStatus === "in_progress" ? "warning" : "outline",
                              className: "mr-2",
                              children: jobStatus.replace("_", " ")
                            }),
                            _jsx(Button, { 
                              variant: "ghost", 
                              size: "icon",
                              onClick: () => navigate(`/jobs/${event.jobId}`),
                              children: _jsx(ChevronRight, { className: "h-4 w-4" })
                            })
                          ] 
                        })
                      ] 
                    }, event.id);
                  }) 
                })
              ] 
            }, format(day, "yyyy-MM-dd"));
          }) 
        })
      ] 
    });
  };

  // Use the full implementation instead of SimpleProductionCalendar
  try {
    // Render the calendar view with the schedule dialog
    return _jsxs("div", {
      className: "space-y-4",
      children: [
        _jsxs("div", {
          className: "flex justify-between items-center",
          children: [
            _jsx("div", {
              className: "flex items-center space-x-4",
              children: _jsxs(Tabs, {
                value: view,
                onValueChange: setView,
                className: "w-auto",
                children: [
                  _jsxs(TabsList, {
                    children: [
                      _jsx(TabsTrigger, { value: "day", children: "Day" }),
                      _jsx(TabsTrigger, { value: "week", children: "Week" }),
                      _jsx(TabsTrigger, { value: "month", children: "Month" })
                    ]
                  })
                ]
              })
            }),
            _jsxs("div", {
              className: "flex space-x-2",
              children: [
                _jsx(Button, {
                  variant: "outline",
                  size: "sm",
                  onClick: () => handleCalendarNavigation("prev"),
                  children: _jsx(ChevronLeft, { className: "h-4 w-4" })
                }),
                _jsx(Button, {
                  variant: "outline",
                  size: "sm",
                  onClick: () => setCurrentDate(new Date()),
                  children: "Today"
                }),
                _jsx(Button, {
                  variant: "outline",
                  size: "sm",
                  onClick: () => handleCalendarNavigation("next"),
                  children: _jsx(ChevronRight, { className: "h-4 w-4" })
                })
              ]
            })
          ]
        }),
        
        _jsx(Card, {
          children: _jsxs(CardContent, {
            className: "p-4",
            children: [
              _jsx("div", {
                className: "mb-4 text-lg font-medium",
                children: view === "day"
                  ? format(currentDate, "MMMM d, yyyy")
                  : view === "week"
                    ? `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
                    : format(currentDate, "MMMM yyyy")
              }),
              
              // Render the appropriate view based on selection
              view === "day" ? renderDayView() :
              view === "week" ? renderWeekView() :
              renderMonthView()
            ]
          })
        }),
        
        // Schedule Dialog
        isScheduleDialogOpen && _jsx(Dialog, {
          open: isScheduleDialogOpen,
          onOpenChange: setIsScheduleDialogOpen,
          children: _jsxs(DialogContent, {
            className: "max-w-3xl",
            children: [
              _jsxs(DialogHeader, {
                children: [
                  _jsx(DialogTitle, {
                    children: `Schedule Job: ${selectedJob?.title || ""}`
                  }),
                  _jsx(DialogDescription, {
                    children: "Select a staff member and time to schedule this job."
                  })
                ]
              }),
              
              _jsxs("div", {
                className: "grid gap-4 py-4",
                children: [
                  _jsxs("div", {
                    className: "flex flex-col space-y-2",
                    children: [
                      _jsx("label", {
                        className: "text-sm font-medium",
                        children: "Assign Staff"
                      }),
                      _jsxs(Select, {
                        value: selectedStaffId,
                        onValueChange: setSelectedStaffId,
                        children: [
                          _jsx(SelectTrigger, {
                            children: _jsx(SelectValue, {
                              placeholder: "Select Staff"
                            })
                          }),
                          _jsxs(SelectContent, {
                            children: [
                              _jsx(SelectItem, {
                                value: "unassigned",
                                children: "Unassigned"
                              }),
                              staff.map((staffMember) => (
                                _jsx(SelectItem, {
                                  value: staffMember.id,
                                  children: staffMember.name
                                }, staffMember.id)
                              ))
                            ]
                          })
                        ]
                      })
                    ]
                  }),
                  
                  // Scheduling suggestions
                  _jsxs("div", {
                    className: "border rounded-md p-4",
                    children: [
                      _jsxs("div", {
                        className: "flex items-center justify-between mb-2",
                        children: [
                          _jsxs("h3", {
                            className: "text-sm font-medium flex items-center",
                            children: [
                              _jsx(Wand2, { className: "h-4 w-4 mr-1" }),
                              "AI Scheduling Suggestions"
                            ]
                          })
                        ]
                      }),
                      
                      isLoadingSuggestions
                        ? _jsx("div", {
                            className: "flex justify-center py-4",
                            children: _jsx(LoadingSpinner, { size: "md" })
                          })
                        : scheduleSuggestions.length > 0
                          ? _jsx("div", {
                              className: "space-y-2",
                              children: scheduleSuggestions.map((suggestion, index) => (
                                _jsxs("div", {
                                  className: "flex items-center justify-between border rounded p-2 bg-secondary/10",
                                  children: [
                                    _jsxs("div", {
                                      children: [
                                        _jsxs("div", {
                                          className: "font-medium text-sm",
                                          children: [
                                            format(parseISO(suggestion.date), "MMM d"),
                                            " ",
                                            suggestion.startTime,
                                            " - ",
                                            suggestion.endTime
                                          ]
                                        }),
                                        _jsxs("div", {
                                          className: "text-xs text-muted-foreground",
                                          children: [
                                            "With ",
                                            suggestion.staffName || "Unassigned"
                                          ]
                                        })
                                      ]
                                    }),
                                    _jsx(Button, {
                                      variant: "outline",
                                      size: "sm",
                                      onClick: () => applySuggestion(suggestion),
                                      children: "Apply"
                                    })
                                  ]
                                }, index)
                              ))
                            })
                          : _jsx("div", {
                              className: "text-center py-2 text-muted-foreground text-sm",
                              children: "No scheduling suggestions available"
                            })
                    ]
                  }),
                  
                  // Manual scheduling form
                  _jsxs("div", {
                    className: "grid grid-cols-3 gap-4",
                    children: [
                      _jsxs("div", {
                        className: "flex flex-col space-y-2",
                        children: [
                          _jsx("label", {
                            className: "text-sm font-medium",
                            children: "Date"
                          }),
                          _jsx("input", {
                            type: "date",
                            className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
                            value: scheduleData.startDate,
                            onChange: (e) => setScheduleData({
                              ...scheduleData,
                              startDate: e.target.value
                            })
                          })
                        ]
                      }),
                      _jsxs("div", {
                        className: "flex flex-col space-y-2",
                        children: [
                          _jsx("label", {
                            className: "text-sm font-medium",
                            children: "Start Time"
                          }),
                          _jsx("input", {
                            type: "time",
                            className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
                            value: scheduleData.startTime,
                            onChange: (e) => setScheduleData({
                              ...scheduleData,
                              startTime: e.target.value
                            })
                          })
                        ]
                      }),
                      _jsxs("div", {
                        className: "flex flex-col space-y-2",
                        children: [
                          _jsx("label", {
                            className: "text-sm font-medium",
                            children: "End Time"
                          }),
                          _jsx("input", {
                            type: "time",
                            className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
                            value: scheduleData.endTime,
                            onChange: (e) => setScheduleData({
                              ...scheduleData,
                              endTime: e.target.value
                            })
                          })
                        ]
                      })
                    ]
                  }),
                  
                  _jsxs("div", {
                    className: "flex flex-col space-y-2",
                    children: [
                      _jsx("label", {
                        className: "text-sm font-medium",
                        children: "Notes (Optional)"
                      }),
                      _jsx("textarea", {
                        className: "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
                        placeholder: "Add notes about this scheduling...",
                        value: scheduleData.notes,
                        onChange: (e) => setScheduleData({
                          ...scheduleData,
                          notes: e.target.value
                        })
                      })
                    ]
                  })
                ]
              }),
              
              _jsxs(DialogFooter, {
                className: "gap-2 sm:gap-0",
                children: [
                  _jsx(Button, {
                    variant: "outline",
                    onClick: closeScheduleDialog,
                    children: "Cancel"
                  }),
                  _jsx(Button, {
                    onClick: handleScheduleSubmit,
                    children: "Save Schedule"
                  })
                ]
              })
            ]
          })
        })
      ]
    });
  } catch (error) {
    console.error("Error rendering ProductionCalendar:", error);
    
    // Error state instead of fallback
    return _jsxs("div", {
      className: "p-8 text-center",
      children: [
        _jsx("h2", { className: "text-2xl font-bold text-red-600 mb-4", children: "Calendar Error" }),
        _jsx("p", { className: "mb-4", children: "There was an error loading the calendar." }),
        _jsx(Button, {
          onClick: () => window.location.reload(),
          children: "Reload Page"
        })
      ]
    });
  }
};

// Export the fixed component as default
export default ProductionCalendarFixed;
