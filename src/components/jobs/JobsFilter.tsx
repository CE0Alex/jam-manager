import React, { useState } from "react";
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  X,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { JobStatus, JobPriority } from "../../types";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "../ui/dropdown-menu";
import { Calendar } from "../ui/calendar";

interface JobsFilterProps {
  onFilterChange?: (filters: JobsFilterState) => void;
}

interface JobsFilterState {
  search: string;
  status: JobStatus[];
  priority: JobPriority[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  client: string[];
}

const JobsFilter = ({ onFilterChange = () => {} }: JobsFilterProps) => {
  const [filters, setFilters] = useState<JobsFilterState>({
    search: "",
    status: [],
    priority: [],
    dateRange: {
      from: undefined,
      to: undefined,
    },
    client: [],
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Mock client list for dropdown
  const clientOptions = [
    "Acme Corp",
    "Globex Industries",
    "Wayne Enterprises",
    "Stark Industries",
    "Umbrella Corporation",
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, search: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStatusChange = (status: JobStatus) => {
    let newStatuses: JobStatus[];
    if (filters.status.includes(status)) {
      newStatuses = filters.status.filter((s) => s !== status);
    } else {
      newStatuses = [...filters.status, status];
    }

    const newFilters = { ...filters, status: newStatuses };
    setFilters(newFilters);
    updateActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriorityChange = (priority: JobPriority) => {
    let newPriorities: JobPriority[];
    if (filters.priority.includes(priority)) {
      newPriorities = filters.priority.filter((p) => p !== priority);
    } else {
      newPriorities = [...filters.priority, priority];
    }

    const newFilters = { ...filters, priority: newPriorities };
    setFilters(newFilters);
    updateActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClientChange = (client: string) => {
    let newClients: string[];
    if (filters.client.includes(client)) {
      newClients = filters.client.filter((c) => c !== client);
    } else {
      newClients = [...filters.client, client];
    }

    const newFilters = { ...filters, client: newClients };
    setFilters(newFilters);
    updateActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (range: {
    from: Date | undefined;
    to: Date | undefined;
  }) => {
    const newFilters = { ...filters, dateRange: range };
    setFilters(newFilters);
    updateActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const updateActiveFilters = (currentFilters: JobsFilterState) => {
    const active: string[] = [];

    if (currentFilters.status.length > 0) {
      active.push("Status");
    }

    if (currentFilters.priority.length > 0) {
      active.push("Priority");
    }

    if (currentFilters.client.length > 0) {
      active.push("Client");
    }

    if (currentFilters.dateRange.from || currentFilters.dateRange.to) {
      active.push("Date");
    }

    setActiveFilters(active);
  };

  const clearFilter = (filterType: string) => {
    let newFilters = { ...filters };

    switch (filterType) {
      case "Status":
        newFilters.status = [];
        break;
      case "Priority":
        newFilters.priority = [];
        break;
      case "Client":
        newFilters.client = [];
        break;
      case "Date":
        newFilters.dateRange = { from: undefined, to: undefined };
        break;
      default:
        break;
    }

    setFilters(newFilters);
    updateActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const newFilters = {
      search: "",
      status: [],
      priority: [],
      dateRange: {
        from: undefined,
        to: undefined,
      },
      client: [],
    };

    setFilters(newFilters);
    setActiveFilters([]);
    onFilterChange(newFilters);
  };

  const formatDateRange = () => {
    const { from, to } = filters.dateRange;
    if (from && to) {
      return `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`;
    }
    if (from) {
      return `From ${format(from, "MMM d, yyyy")}`;
    }
    if (to) {
      return `Until ${format(to, "MMM d, yyyy")}`;
    }
    return "Select dates";
  };

  return (
    <div className="w-full bg-white p-4 rounded-md shadow-sm border border-gray-200">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder="Search jobs by title, client, or description..."
              value={filters.search}
              onChange={handleSearchChange}
              className="pl-10 w-full"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                Status
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuCheckboxItem
                checked={filters.status.includes("pending")}
                onCheckedChange={() => handleStatusChange("pending")}
              >
                Pending
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.status.includes("in_progress")}
                onCheckedChange={() => handleStatusChange("in_progress")}
              >
                In Progress
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.status.includes("review")}
                onCheckedChange={() => handleStatusChange("review")}
              >
                Review
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.status.includes("completed")}
                onCheckedChange={() => handleStatusChange("completed")}
              >
                Completed
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.status.includes("cancelled")}
                onCheckedChange={() => handleStatusChange("cancelled")}
              >
                Cancelled
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                Priority
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuCheckboxItem
                checked={filters.priority.includes("low")}
                onCheckedChange={() => handlePriorityChange("low")}
              >
                Low
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.priority.includes("medium")}
                onCheckedChange={() => handlePriorityChange("medium")}
              >
                Medium
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.priority.includes("high")}
                onCheckedChange={() => handlePriorityChange("high")}
              >
                High
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.priority.includes("urgent")}
                onCheckedChange={() => handlePriorityChange("urgent")}
              >
                Urgent
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                Client
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {clientOptions.map((client) => (
                <DropdownMenuCheckboxItem
                  key={client}
                  checked={filters.client.includes(client)}
                  onCheckedChange={() => handleClientChange(client)}
                >
                  {client}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon size={16} />
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{
                  from: filters.dateRange.from,
                  to: filters.dateRange.to,
                }}
                onSelect={handleDateRangeChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {filter}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={() => clearFilter(filter)}
                  />
                </Badge>
              ))}
              {activeFilters.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs h-6"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsFilter;
