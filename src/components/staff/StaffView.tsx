import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffList from "./StaffList";
import StaffDetails from "./StaffDetails";
import { StaffMember } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

interface StaffViewProps {
  staffMembers?: StaffMember[];
}

const StaffView = ({ staffMembers }: StaffViewProps = {}) => {
  const navigate = useNavigate();
  const { staff } = useAppContext();
  const [selectedStaffId, setSelectedStaffId] = useState<string | undefined>(
    staff.length > 0 ? staff[0].id : undefined,
  );

  // Use provided staff members or fall back to context
  const allStaff = staffMembers?.length ? staffMembers : staff;

  const selectedStaffMember = allStaff.find((s) => s.id === selectedStaffId);

  const handleSelectStaff = (staffId: string) => {
    setSelectedStaffId(staffId);
  };

  const handleEditStaff = (staffId: string) => {
    navigate(`/staff/${staffId}/edit`);
  };

  return (
    <div className="flex h-full w-full bg-gray-50">
      <div className="w-1/4 p-4 border-r border-gray-200">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Staff Members</h2>
          <Button size="sm" onClick={() => navigate("/staff/new")}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <StaffList
          staffMembers={allStaff}
          onSelectStaff={handleSelectStaff}
          selectedStaffId={selectedStaffId}
        />
      </div>
      <div className="w-3/4 p-4">
        {selectedStaffMember ? (
          <StaffDetails
            staffMember={selectedStaffMember}
            onEditStaff={handleEditStaff}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            {allStaff.length > 0 ? (
              "Select a staff member to view details"
            ) : (
              <div className="text-center">
                <p className="mb-4">No staff members found</p>
                <Button onClick={() => navigate("/staff/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff Member
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffView;
