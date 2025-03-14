import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StaffMember } from "@/types";
import { useAppContext } from "@/context/AppContext";

interface StaffListProps {
  staffMembers?: StaffMember[];
  onSelectStaff?: (staffId: string) => void;
  selectedStaffId?: string;
}

const StaffList = ({
  staffMembers = [],
  onSelectStaff = () => {},
  selectedStaffId,
}: StaffListProps) => {
  const { staff } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");

  // Use provided staff members or fall back to context
  const allStaff = staffMembers.length > 0 ? staffMembers : staff;

  const filteredStaff = allStaff.filter((staff) =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Card className="h-full w-full bg-white">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {filteredStaff.map((staff) => (
              <div
                key={staff.id}
                className={`p-3 rounded-md cursor-pointer transition-colors ${selectedStaffId === staff.id ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-muted"}`}
                onClick={() => onSelectStaff(staff.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.id}`}
                    />
                    <AvatarFallback>
                      {staff.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{staff.name}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {staff.role}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {staff.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {staff.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{staff.skills.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {staff.assignedJobs.length} assigned job
                  {staff.assignedJobs.length !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
            {filteredStaff.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No staff members found
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default StaffList;
