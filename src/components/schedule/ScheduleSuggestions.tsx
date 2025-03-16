import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { formatTime12Hour } from "@/lib/timeUtils";
import { CalendarClock, Check, Star, User } from "lucide-react";

interface ScheduleSuggestion {
  staffId: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  conflictFree: boolean;
  utilizationScore: number;
  relevanceScore: number;
  totalScore: number;
}

interface ScheduleSuggestionsProps {
  suggestions: ScheduleSuggestion[];
  onSelect: (suggestion: ScheduleSuggestion) => void;
  onRefresh?: () => void;
}

export default function ScheduleSuggestions({
  suggestions,
  onSelect,
  onRefresh
}: ScheduleSuggestionsProps) {
  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">No Scheduling Suggestions Available</CardTitle>
          <CardDescription>
            We couldn't find any suitable scheduling suggestions based on staff availability.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              Try Different Parameters
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Recommended Schedules</h3>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion, index) => (
          <Card key={index} className={index === 0 ? "border-2 border-primary" : ""}>
            {index === 0 && (
              <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2">
                <Badge className="bg-primary text-white">
                  <Star className="h-3 w-3 mr-1" /> Best Match
                </Badge>
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <User className="h-4 w-4 mr-2" />
                {suggestion.staffName}
              </CardTitle>
              <CardDescription className="flex items-center">
                <CalendarClock className="h-4 w-4 mr-2" />
                {format(parseISO(suggestion.date), "EEEE, MMMM d")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Start Time</div>
                  <div className="font-medium">
                    {formatTimeDisplay(suggestion.startTime)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">End Time</div>
                  <div className="font-medium">
                    {formatTimeDisplay(suggestion.endTime)}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="text-xs">
                  <div className="text-muted-foreground">Skill Match</div>
                  <div className="flex items-center">
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-600 rounded-full" 
                        style={{ width: `${suggestion.relevanceScore}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 font-medium">{Math.round(suggestion.relevanceScore)}%</span>
                  </div>
                </div>
                <div className="text-xs">
                  <div className="text-muted-foreground">Time Utilization</div>
                  <div className="flex items-center">
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-600 rounded-full" 
                        style={{ width: `${suggestion.utilizationScore}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 font-medium">{Math.round(suggestion.utilizationScore)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant={index === 0 ? "default" : "outline"}
                className="w-full" 
                onClick={() => onSelect(suggestion)}
              >
                <Check className="h-4 w-4 mr-2" />
                {index === 0 ? "Apply Best Match" : "Select This Schedule"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
