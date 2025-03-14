import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Search, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FeedbackList() {
  const { feedback, staff } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [importanceFilter, setImportanceFilter] = useState<string | null>(null);
  const [pageFilter, setPageFilter] = useState<string | null>(null);

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find((s) => s.id === staffId);
    return staffMember ? staffMember.name : "Unknown";
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "low":
        return <Badge variant="outline">Low</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "high":
        return <Badge variant="default">High</Badge>;
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredFeedback = feedback
    .filter((item) => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.attemptedAction.toLowerCase().includes(searchLower) ||
          item.actualResult.toLowerCase().includes(searchLower) ||
          item.expectedResult.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter((item) => {
      // Importance filter
      if (importanceFilter) {
        return item.importance === importanceFilter;
      }
      return true;
    })
    .filter((item) => {
      // Page filter
      if (pageFilter) {
        return item.page === pageFilter;
      }
      return true;
    })
    // Sort by date (newest first)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const resetFilters = () => {
    setSearchTerm("");
    setImportanceFilter(null);
    setPageFilter(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <Input
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={importanceFilter || "all"}
            onValueChange={(value) =>
              setImportanceFilter(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Importance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Importance</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={pageFilter || "all"}
            onValueChange={(value) =>
              setPageFilter(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pages</SelectItem>
              <SelectItem value="dashboard">Dashboard</SelectItem>
              <SelectItem value="jobs">Jobs</SelectItem>
              <SelectItem value="schedule">Schedule</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="reports">Reports</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || importanceFilter || pageFilter) && (
            <Button variant="ghost" onClick={resetFilters} size="icon">
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {filteredFeedback.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No feedback found
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {filteredFeedback.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                <div className="flex flex-1 justify-between items-center">
                  <div className="text-left">
                    <div className="font-medium truncate max-w-md">
                      {item.attemptedAction}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(item.createdAt), "MMM d, yyyy h:mm a")} •{" "}
                      {getStaffName(item.submitter)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.page}</Badge>
                    {getImportanceBadge(item.importance)}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 bg-muted/20">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">What happened:</h4>
                    <p className="text-sm">
                      {item.actualResult || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      Expected behavior:
                    </h4>
                    <p className="text-sm">
                      {item.expectedResult || "Not specified"}
                    </p>
                  </div>
                  {item.screenshotUrl && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Screenshot:</h4>
                      <div className="relative">
                        <img
                          src={item.screenshotUrl}
                          alt="Feedback screenshot"
                          className="max-h-60 rounded-md border"
                        />
                        <a
                          href={item.screenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 bg-background/80 p-1 rounded-md hover:bg-background"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
