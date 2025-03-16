import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { StaffMember } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StaffFormProps {
  staffMember?: StaffMember;
  isEditing?: boolean;
}

export default function StaffForm({
  staffMember,
  isEditing = false,
}: StaffFormProps) {
  const navigate = useNavigate();
  const { addStaffMember, updateStaffMember, settings, applyDefaultAvailabilityToStaff } = useAppContext();

  const [formData, setFormData] = useState<{
    name: string;
    role: string;
    email: string;
    phone: string;
    skills: string[];
    newSkill: string;
    availability: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
    availabilityHours: {
      monday: { start: string; end: string };
      tuesday: { start: string; end: string };
      wednesday: { start: string; end: string };
      thursday: { start: string; end: string };
      friday: { start: string; end: string };
      saturday: { start: string; end: string };
      sunday: { start: string; end: string };
    };
  }>({
    name: "",
    role: "",
    email: "",
    phone: "",
    skills: [],
    newSkill: "",
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    availabilityHours: {
      monday: { start: settings.businessHours.start, end: settings.businessHours.end },
      tuesday: { start: settings.businessHours.start, end: settings.businessHours.end },
      wednesday: { start: settings.businessHours.start, end: settings.businessHours.end },
      thursday: { start: settings.businessHours.start, end: settings.businessHours.end },
      friday: { start: settings.businessHours.start, end: settings.businessHours.end },
      saturday: { start: settings.businessHours.start, end: settings.businessHours.end },
      sunday: { start: settings.businessHours.start, end: settings.businessHours.end },
    },
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (staffMember && isEditing) {
      setFormData({
        name: staffMember.name,
        role: staffMember.role,
        email: staffMember.email,
        phone: staffMember.phone || "",
        skills: [...staffMember.skills],
        newSkill: "",
        availability: { ...staffMember.availability },
        availabilityHours: staffMember.availabilityHours || {
          monday: { start: settings.businessHours.start, end: settings.businessHours.end },
          tuesday: { start: settings.businessHours.start, end: settings.businessHours.end },
          wednesday: { start: settings.businessHours.start, end: settings.businessHours.end },
          thursday: { start: settings.businessHours.start, end: settings.businessHours.end },
          friday: { start: settings.businessHours.start, end: settings.businessHours.end },
          saturday: { start: settings.businessHours.start, end: settings.businessHours.end },
          sunday: { start: settings.businessHours.start, end: settings.businessHours.end },
        },
      });
    }
  }, [staffMember, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAvailabilityChange = (day: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: checked,
      },
    }));
  };

  const handleHoursChange = (
    day: string,
    field: "start" | "end",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      availabilityHours: {
        ...prev.availabilityHours,
        [day]: {
          ...prev.availabilityHours[day as keyof typeof prev.availabilityHours],
          [field]: value,
        },
      },
    }));
  };

  const addSkill = () => {
    if (
      formData.newSkill.trim() &&
      !formData.skills.includes(formData.newSkill.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: "",
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.role.trim()) {
      errors.role = "Role is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isEditing && staffMember) {
      updateStaffMember({
        ...staffMember,
        name: formData.name,
        role: formData.role,
        email: formData.email,
        phone: formData.phone || undefined,
        skills: formData.skills,
        availability: formData.availability,
        availabilityHours: formData.availabilityHours,
      });
      navigate(`/staff`);
    } else {
      addStaffMember({
        name: formData.name,
        role: formData.role,
        email: formData.email,
        phone: formData.phone || undefined,
        skills: formData.skills,
        availability: formData.availability,
        availabilityHours: formData.availabilityHours,
        assignedJobs: [],
        performanceMetrics: {
          completionRate: 0,
          onTimeRate: 0,
          qualityScore: 0,
        },
      });
      navigate("/staff");
    }
  };

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Staff Member" : "Add New Staff Member"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className={validationErrors.name ? "text-destructive" : ""}
              >
                Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={validationErrors.name ? "border-destructive" : ""}
              />
              {validationErrors.name && (
                <p className="text-sm text-destructive">
                  {validationErrors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="role"
                className={validationErrors.role ? "text-destructive" : ""}
              >
                Role *
              </Label>
              <Input
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={validationErrors.role ? "border-destructive" : ""}
              />
              {validationErrors.role && (
                <p className="text-sm text-destructive">
                  {validationErrors.role}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className={validationErrors.email ? "text-destructive" : ""}
              >
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={validationErrors.email ? "border-destructive" : ""}
              />
              {validationErrors.email && (
                <p className="text-sm text-destructive">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {skill}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill"
                value={formData.newSkill}
                name="newSkill"
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button type="button" size="icon" onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Availability</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  // Apply business hours to all days that are enabled
                  const updatedHours = { ...formData.availabilityHours };
                  Object.keys(formData.availability).forEach(day => {
                    if (formData.availability[day as keyof typeof formData.availability]) {
                      updatedHours[day as keyof typeof updatedHours] = {
                        start: settings.businessHours.start,
                        end: settings.businessHours.end
                      };
                    }
                  });
                  setFormData(prev => ({
                    ...prev,
                    availabilityHours: updatedHours
                  }));
                }}
              >
                Apply Business Hours
              </Button>
            </div>
            <div className="space-y-4">
              {days.map((day) => (
                <div key={day.key} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 w-1/4">
                    <Checkbox
                      id={`${day.key}-available`}
                      checked={
                        formData.availability[
                          day.key as keyof typeof formData.availability
                        ]
                      }
                      onCheckedChange={(checked) =>
                        handleAvailabilityChange(day.key, checked as boolean)
                      }
                    />
                    <Label htmlFor={`${day.key}-available`}>{day.label}</Label>
                  </div>

                  {formData.availability[
                    day.key as keyof typeof formData.availability
                  ] && (
                    <div className="flex items-center space-x-2 w-3/4">
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="space-y-2">
                          <Label htmlFor={`${day.key}-start`}>Start Time</Label>
                          <Select
                            value={
                              formData.availabilityHours[
                                day.key as keyof typeof formData.availabilityHours
                              ]?.start || "08:00"
                            }
                            onValueChange={(value) =>
                              handleHoursChange(day.key, "start", value)
                            }
                          >
                            <SelectTrigger id={`${day.key}-start`}>
                              <SelectValue placeholder="Start time" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 19 }, (_, i) => {
                                const hour = Math.floor(i / 2) + 8;
                                const minute = i % 2 === 0 ? "00" : "30";
                                const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                                const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
                                return (
                                  <SelectItem key={time} value={time}>
                                    {displayTime}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${day.key}-end`}>End Time</Label>
                          <Select
                            value={
                              formData.availabilityHours[
                                day.key as keyof typeof formData.availabilityHours
                              ]?.end || "17:00"
                            }
                            onValueChange={(value) =>
                              handleHoursChange(day.key, "end", value)
                            }
                          >
                            <SelectTrigger id={`${day.key}-end`}>
                              <SelectValue placeholder="End time" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 19 }, (_, i) => {
                                const hour = Math.floor(i / 2) + 8;
                                const minute = i % 2 === 0 ? "00" : "30";
                                const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                                const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
                                return (
                                  <SelectItem key={time} value={time}>
                                    {displayTime}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? "Update Staff Member" : "Add Staff Member"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
