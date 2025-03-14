import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import StaffDetails from "@/components/staff/StaffDetails";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getStaffById } = useAppContext();

  const staffMember = id ? getStaffById(id) : undefined;

  const handleEditStaff = (staffId: string) => {
    navigate(`/staff/${staffId}/edit`);
  };

  if (!staffMember) {
    return (
      <MainLayout title="Staff Member Not Found">
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-2xl font-bold mb-4">Staff Member Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The staff member you're looking for doesn't exist or has been
            deleted.
          </p>
          <Button onClick={() => navigate("/staff")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Staff
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Staff Details: ${staffMember.name}`}>
      <StaffDetails staffMember={staffMember} onEditStaff={handleEditStaff} />
    </MainLayout>
  );
}
