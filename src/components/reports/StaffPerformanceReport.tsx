import React from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface StaffPerformanceReportProps {
  startDate: Date;
  endDate: Date;
}

export default function StaffPerformanceReport({
  startDate,
  endDate,
}: StaffPerformanceReportProps) {
  const { staff, jobs, schedule } = useAppContext();

  // Filter to only production staff
  const productionStaff = staff.filter(
    (member) =>
      member.role.toLowerCase().includes("production") ||
      member.skills.some(
        (skill) =>
          skill.toLowerCase().includes("print") ||
          skill.toLowerCase().includes("production"),
      ),
  );

  // Empty staff productivity data
  const staffProductivity = productionStaff.map((member) => {
    return {
      name: member.name,
      jobsCompleted: 0,
      jobsAssigned: 0,
      completionRate: 0,
    };
  });

  // Empty staff efficiency data
  const staffEfficiency = productionStaff.map((member) => {
    return {
      name: member.name,
      efficiency: 0,
    };
  });

  // Empty staff quality scores
  const staffQualityScores = productionStaff.map((member) => ({
    name: member.name,
    qualityScore: 0,
  }));

  // Empty staff skills data
  const staffSkillsData: any[] = [];

  // Empty on-time delivery data
  const onTimeDeliveryByStaff = productionStaff.map((member) => {
    return {
      name: member.name,
      onTimeRate: 0,
    };
  });

  // Empty top performer
  const topPerformer = staffProductivity[0] || null;

  // Empty average metrics
  const avgCompletionRate = 0;
  const avgQualityScore = 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Average Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgCompletionRate}%</div>
            <p className="text-muted-foreground text-sm mt-1">
              Across production staff
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformer ? (
              <>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${productionStaff.find((s) => s.name === topPerformer.name)?.id || "staff"}`}
                    />
                    <AvatarFallback>
                      {topPerformer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-xl font-bold">{topPerformer.name}</div>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  {topPerformer.completionRate}% completion rate
                </p>
              </>
            ) : (
              <div className="text-xl font-bold">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Average Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgQualityScore}%</div>
            <p className="text-muted-foreground text-sm mt-1">
              Client satisfaction
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Staff Productivity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffProductivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#82ca9d"
                  domain={[0, 100]}
                />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="jobsCompleted"
                  fill="#8884d8"
                  name="Jobs Completed"
                />
                <Bar
                  yAxisId="right"
                  dataKey="completionRate"
                  fill="#82ca9d"
                  name="Completion Rate (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>On-Time Delivery by Staff</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={onTimeDeliveryByStaff}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "On-Time Rate"]} />
                <Legend />
                <Bar
                  dataKey="onTimeRate"
                  fill="#82ca9d"
                  name="On-Time Delivery Rate (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Staff Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffEfficiency}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 150]} />
                <Tooltip formatter={(value) => [`${value}%`, "Efficiency"]} />
                <Legend />
                <Bar
                  dataKey="efficiency"
                  fill="#8884d8"
                  name="Efficiency (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {staffSkillsData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Staff Skills Assessment</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={staffSkillsData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  {productionStaff.map((member, index) => {
                    const colors = [
                      "#8884d8",
                      "#82ca9d",
                      "#ffc658",
                      "#ff8042",
                      "#a4de6c",
                    ];
                    return (
                      <Radar
                        key={member.id}
                        name={member.name}
                        dataKey={member.name}
                        stroke={colors[index % colors.length]}
                        fill={colors[index % colors.length]}
                        fillOpacity={0.2}
                      />
                    );
                  })}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production Staff Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {productionStaff.map((member) => {
              // Get schedule data for this staff member
              const staffEvents = schedule.filter(
                (event) => event.staffId === member.id,
              );
              const totalScheduledHours = staffEvents.reduce((total, event) => {
                const startTime = new Date(event.startTime);
                const endTime = new Date(event.endTime);
                const durationHours =
                  (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                return total + durationHours;
              }, 0);

              // Get assigned jobs
              const assignedJobs = jobs.filter(
                (job) => job.assignedTo === member.id,
              );

              return (
                <div key={member.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`}
                        />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {assignedJobs.length} jobs
                      </Badge>
                      <Badge variant="outline">
                        {totalScheduledHours.toFixed(1)} hours
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Completion Rate</span>
                      <span>
                        {member.performanceMetrics?.completionRate || 0}%
                      </span>
                    </div>
                    <Progress
                      value={member.performanceMetrics?.completionRate || 0}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>On-Time Delivery</span>
                      <span>{member.performanceMetrics?.onTimeRate || 0}%</span>
                    </div>
                    <Progress
                      value={member.performanceMetrics?.onTimeRate || 0}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Quality Score</span>
                      <span>
                        {member.performanceMetrics?.qualityScore || 0}%
                      </span>
                    </div>
                    <Progress
                      value={member.performanceMetrics?.qualityScore || 0}
                      className="h-2"
                    />
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    Available:{" "}
                    {Object.entries(member.availability)
                      .filter(([_, isAvailable]) => isAvailable)
                      .map(([day]) => day.substring(0, 3))
                      .join(", ")}
                  </div>
                </div>
              );
            })}

            {productionStaff.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No production staff members found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
