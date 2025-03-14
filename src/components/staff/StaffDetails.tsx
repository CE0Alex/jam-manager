import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, Calendar, Award, Edit, Clock } from "lucide-react";
import AssignedJobs from "./AssignedJobs";
import PerformanceMetrics from "./PerformanceMetrics";
import StaffAvailabilityEditor from "./StaffAvailabilityEditor";
import { StaffMember } from "@/types";
import { useAppContext } from "@/context/AppContext";

interface StaffDetailsProps {
  staffMember?: StaffMember;
  onEditStaff?: (staffId: string) => void;
}

const StaffDetails = ({
  staffMember,
  onEditStaff = () => {},
}: StaffDetailsProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const { updateStaffMember } = useAppContext();

  // Default staff member data if none provided
  const defaultStaffMember: StaffMember = {
    id: "",
    name: "",
    role: "",
    email: "",
    phone: "",
    skills: [],
    availability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    assignedJobs: [],
    performanceMetrics: {
      completionRate: 0,
      onTimeRate: 0,
      qualityScore: 0,
    },
  };

  const staff = staffMember || defaultStaffMember;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const formatAvailability = (availability: StaffMember["availability"]) => {
    const days = [
      { key: "monday", label: "Mon" },
      { key: "tuesday", label: "Tue" },
      { key: "wednesday", label: "Wed" },
      { key: "thursday", label: "Thu" },
      { key: "friday", label: "Fri" },
      { key: "saturday", label: "Sat" },
      { key: "sunday", label: "Sun" },
    ];

    return (
      <div className="flex space-x-1">
        {days.map((day) => (
          <Badge
            key={day.key}
            variant={
              availability[day.key as keyof typeof availability]
                ? "default"
                : "outline"
            }
            className={
              availability[day.key as keyof typeof availability]
                ? "bg-green-100 text-green-800"
                : "text-gray-400"
            }
          >
            {day.label}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.id}`}
                alt={staff.name}
              />
              <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{staff.name}</h2>
              <p className="text-gray-500">{staff.role}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditStaff(staff.id)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Contact Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span>{staff.email}</span>
              </div>
              {staff.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{staff.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Availability
            </h3>
            {formatAvailability(staff.availability)}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6 border-b">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Assigned Jobs</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {staff.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Completion Rate</span>
                      <span className="text-sm font-medium">
                        {staff.performanceMetrics?.completionRate || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${staff.performanceMetrics?.completionRate || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">On-Time Delivery</span>
                      <span className="text-sm font-medium">
                        {staff.performanceMetrics?.onTimeRate || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${staff.performanceMetrics?.onTimeRate || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Quality Score</span>
                      <span className="text-sm font-medium">
                        {staff.performanceMetrics?.qualityScore || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${staff.performanceMetrics?.qualityScore || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="mr-4 flex-shrink-0">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Completed job #1082 - Business Cards for XYZ Corp
                      </p>
                      <p className="text-sm text-gray-500">
                        Yesterday at 2:30 PM
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex">
                    <div className="mr-4 flex-shrink-0">
                      <Award className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Received 5-star rating from client ABC Inc
                      </p>
                      <p className="text-sm text-gray-500">2 days ago</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex">
                    <div className="mr-4 flex-shrink-0">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Assigned to new job #1095 - Event Banners
                      </p>
                      <p className="text-sm text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="p-6">
          <AssignedJobs staffId={staff.id} />
        </TabsContent>

        <TabsContent value="performance" className="p-6">
          <PerformanceMetrics staffMember={staff} />
        </TabsContent>

        <TabsContent value="availability" className="p-6">
          <StaffAvailabilityEditor
            staffMember={staff}
            onSave={(updatedStaff) => {
              updateStaffMember(updatedStaff);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffDetails;
