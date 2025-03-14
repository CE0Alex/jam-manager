import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import StaffList from "@/components/staff/StaffList";
import StaffDetails from "@/components/staff/StaffDetails";

export default function StaffListPage() {
  const navigate = useNavigate();
  const { staff } = useAppContext();
  const [selectedStaffId, setSelectedStaffId] = useState<string | undefined>(
    staff.length > 0 ? staff[0].id : undefined,
  );

  const selectedStaffMember = staff.find((s) => s.id === selectedStaffId);

  const handleSelectStaff = (staffId: string) => {
    setSelectedStaffId(staffId);
  };

  const handleEditStaff = (staffId: string) => {
    navigate(`/staff/${staffId}/edit`);
  };

  return (
    <MainLayout
      title="Staff Management"
      onSearch={(term) => console.log("Search term:", term)}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <Button onClick={() => navigate("/staff/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      <div className="flex h-[calc(100vh-12rem)] gap-6">
        <div className="w-1/4 h-full">
          <StaffList
            staffMembers={staff}
            onSelectStaff={handleSelectStaff}
            selectedStaffId={selectedStaffId}
          />
        </div>
        <div className="w-3/4 h-full">
          {selectedStaffMember ? (
            <StaffDetails
              staffMember={selectedStaffMember}
              onEditStaff={handleEditStaff}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              {staff.length > 0 ? (
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
    </MainLayout>
  );
}
