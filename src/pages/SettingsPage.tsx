import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Shield, Database } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

export default function SettingsPage() {
  return (
    <MainLayout title="Settings">
      <div className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Data Management</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      defaultValue="Print Shop Manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue="America/New_York"
                    >
                      <option value="America/New_York">
                        Eastern Time (ET)
                      </option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">
                        Pacific Time (PT)
                      </option>
                    </select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Display Settings</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable dark mode for the application interface
                      </p>
                    </div>
                    <Switch id="dark-mode" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-view">Compact View</Label>
                      <p className="text-sm text-muted-foreground">
                        Show more content with reduced spacing
                      </p>
                    </div>
                    <Switch id="compact-view" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">System Defaults</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="default-view">
                        Default Dashboard View
                      </Label>
                      <select
                        id="default-view"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="overview"
                      >
                        <option value="overview">Overview</option>
                        <option value="jobs">Jobs</option>
                        <option value="schedule">Schedule</option>
                        <option value="staff">Staff</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default-job-status">
                        Default Job Status
                      </Label>
                      <select
                        id="default-job-status"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="pending"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Job Status Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive emails when job statuses change
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Upcoming Deadlines</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive daily digest of upcoming deadlines
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Staff Assignments</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when jobs are assigned
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>System Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about system updates
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <Separator />

                  <h3 className="text-lg font-medium">In-App Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Job Status Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications when job statuses change
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Upcoming Deadlines</Label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications for upcoming deadlines
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Staff Assignments</Label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications when jobs are assigned
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>System Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications about system updates
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Two-Factor Authentication
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Session Management</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto Logout</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically log out after period of inactivity
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeout">
                        Inactivity Timeout (minutes)
                      </Label>
                      <Input
                        id="timeout"
                        type="number"
                        defaultValue="30"
                        min="5"
                        max="120"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Login History</h3>
                  <div className="rounded-md border">
                    <div className="p-4 bg-muted/50">
                      <div className="grid grid-cols-3 font-medium">
                        <div>Date & Time</div>
                        <div>IP Address</div>
                        <div>Device</div>
                      </div>
                    </div>
                    <div className="p-4 border-t">
                      <div className="grid grid-cols-3">
                        <div>Today, 10:30 AM</div>
                        <div>192.168.1.1</div>
                        <div>Chrome on Windows</div>
                      </div>
                    </div>
                    <div className="p-4 border-t">
                      <div className="grid grid-cols-3">
                        <div>Yesterday, 3:15 PM</div>
                        <div>192.168.1.1</div>
                        <div>Safari on macOS</div>
                      </div>
                    </div>
                    <div className="p-4 border-t">
                      <div className="grid grid-cols-3">
                        <div>Jul 10, 2023, 9:45 AM</div>
                        <div>192.168.1.1</div>
                        <div>Firefox on Windows</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Import & Export</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Import Data</Label>
                      <p className="text-sm text-muted-foreground">
                        Import jobs, staff, or machine data from CSV
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline">Import Jobs</Button>
                        <Button variant="outline">Import Staff</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Export Data</Label>
                      <p className="text-sm text-muted-foreground">
                        Export your data to CSV format
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline">Export Jobs</Button>
                        <Button variant="outline">Export Staff</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Backup & Restore</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Backup Data</Label>
                      <p className="text-sm text-muted-foreground">
                        Create a backup of all your system data
                      </p>
                      <Button variant="outline" className="mt-2">
                        Create Backup
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Restore Data</Label>
                      <p className="text-sm text-muted-foreground">
                        Restore your system from a previous backup
                      </p>
                      <Button variant="outline" className="mt-2">
                        Restore from Backup
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Data Cleanup</h3>
                  <div className="space-y-2">
                    <Label>Clear Old Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Remove completed jobs older than the selected timeframe
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <select
                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="6months"
                      >
                        <option value="1month">1 Month</option>
                        <option value="3months">3 Months</option>
                        <option value="6months">6 Months</option>
                        <option value="1year">1 Year</option>
                      </select>
                      <Button variant="destructive">Clear Data</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
