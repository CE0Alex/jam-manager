import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Filter, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StaffWorkloadChart from "./StaffWorkloadChart";
import StaffAvailabilityChart from "./StaffAvailabilityChart";
import StaffAvatar from "./StaffAvatar";

export default function StaffManagement() {
  const navigate = useNavigate();
  const { staff } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "production" | "sales" | "design"
  >("all");

  // Filter staff based on search term and active tab
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "production" &&
        member.role.toLowerCase().includes("production")) ||
      (activeTab === "sales" && member.role.toLowerCase().includes("sales")) ||
      (activeTab === "design" && member.role.toLowerCase().includes("design"));

    return matchesSearch && matchesTab;
  });

  // Calculate department statistics
  const departments = {
    production: staff.filter((s) => s.role.toLowerCase().includes("production"))
      .length,
    sales: staff.filter((s) => s.role.toLowerCase().includes("sales")).length,
    design: staff.filter((s) => s.role.toLowerCase().includes("design")).length,
    other: staff.filter(
      (s) =>
        !s.role.toLowerCase().includes("production") &&
        !s.role.toLowerCase().includes("sales") &&
        !s.role.toLowerCase().includes("design"),
    ).length,
  };

  // Calculate average performance metrics
  const calculateAverageMetrics = () => {
    const staffWithMetrics = staff.filter((s) => s.performanceMetrics);
    if (staffWithMetrics.length === 0)
      return { completion: 0, onTime: 0, quality: 0 };

    const totals = staffWithMetrics.reduce(
      (acc, s) => {
        if (!s.performanceMetrics) return acc;
        return {
          completion:
            acc.completion + (s.performanceMetrics.completionRate || 0),
          onTime: acc.onTime + (s.performanceMetrics.onTimeRate || 0),
          quality: acc.quality + (s.performanceMetrics.qualityScore || 0),
        };
      },
      { completion: 0, onTime: 0, quality: 0 },
    );

    return {
      completion: Math.round(totals.completion / staffWithMetrics.length),
      onTime: Math.round(totals.onTime / staffWithMetrics.length),
      quality: Math.round(totals.quality / staffWithMetrics.length),
    };
  };

  const averageMetrics = calculateAverageMetrics();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Staff Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your team, track performance, and assign workloads
          </p>
        </div>
        <Button onClick={() => navigate("/staff/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Staff Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{staff.length}</div>
            <p className="text-muted-foreground text-sm mt-1">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-800 border-blue-200"
              >
                Production: {departments.production}
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-200"
              >
                Sales: {departments.sales}
              </Badge>
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-800 border-purple-200"
              >
                Design: {departments.design}
              </Badge>
              {departments.other > 0 && (
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-800 border-gray-200"
                >
                  Other: {departments.other}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Avg. Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion Rate</span>
                  <span>{averageMetrics.completion}%</span>
                </div>
                <Progress value={averageMetrics.completion} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>On-Time Rate</span>
                  <span>{averageMetrics.onTime}%</span>
                </div>
                <Progress value={averageMetrics.onTime} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Quality Score</span>
                  <span>{averageMetrics.quality}%</span>
                </div>
                <Progress value={averageMetrics.quality} className="h-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {
                staff.filter(
                  (s) =>
                    Object.values(s.availability).filter(Boolean).length >= 5,
                ).length
              }
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Staff available 5+ days/week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <StaffWorkloadChart limit={5} />
        <StaffAvailabilityChart />
      </div>

      {/* Staff List Section */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle>Staff Directory</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search staff..."
                  className="pl-8 w-[200px] sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
              >
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="production">Production</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="design">Design</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.length > 0 ? (
              filteredStaff.map((member) => (
                <Card
                  key={member.id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/staff/${member.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-start p-4">
                      <StaffAvatar staffId={member.id} size="lg" />
                      <div className="ml-4">
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {member.role}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3 mr-1" />
                          <span>
                            {member.assignedJobs.length} jobs assigned
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>
                            Available:{" "}
                            {Object.entries(member.availability)
                              .filter(([_, isAvailable]) => isAvailable)
                              .map(([day]) => day.substring(0, 3))
                              .join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {member.performanceMetrics && (
                      <div className="px-4 pb-4">
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Completion Rate</span>
                            <span>
                              {member.performanceMetrics.completionRate}%
                            </span>
                          </div>
                          <Progress
                            value={member.performanceMetrics.completionRate}
                            className="h-1"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No staff members found matching your search criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
