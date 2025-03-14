import { useParams } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import StaffForm from "@/components/staff/StaffForm";
import MainLayout from "@/components/layout/MainLayout";

export default function StaffFormPage() {
  const { id } = useParams<{ id: string }>();
  const { getStaffById } = useAppContext();

  const staffMember = id ? getStaffById(id) : undefined;
  const isEditing = Boolean(staffMember);

  return (
    <MainLayout
      title={isEditing ? "Edit Staff Member" : "Add New Staff Member"}
    >
      <div className="max-w-4xl mx-auto">
        <StaffForm staffMember={staffMember} isEditing={isEditing} />
      </div>
    </MainLayout>
  );
}
