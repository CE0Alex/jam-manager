import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  HelpCircle,
  FileText,
  Video,
  MessageSquare,
  Mail,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I create a new job?",
      answer:
        "To create a new job, navigate to the Jobs page and click the 'Create Job' button in the top right corner. Fill out the required information in the form and click 'Save' to create the job.",
    },
    {
      question: "How do I assign staff to a job?",
      answer:
        "When creating or editing a job, you'll see a dropdown menu labeled 'Assign To' where you can select a staff member. Alternatively, you can assign jobs from the Staff page by selecting a staff member and using the 'Assign Job' button.",
    },
    {
      question: "How do I schedule a job for production?",
      answer:
        "Navigate to the Schedule page and click on an available time slot in the calendar. Select the job you want to schedule from the dropdown menu and set the start and end times. You can also drag and drop jobs directly onto the calendar.",
    },
    {
      question: "How do I update a job's status?",
      answer:
        "Open the job details by clicking on a job in the Jobs list. In the job details view, you'll find a status dropdown where you can change the current status. Click 'Save' to update the job.",
    },
    {
      question: "How do I view reports?",
      answer:
        "Navigate to the Reports page using the sidebar menu. Here you can select different report types such as Production Reports, Financial Reports, or Staff Performance Reports. Use the date range selector to filter the data.",
    },
    {
      question: "How do I manage staff availability?",
      answer:
        "Go to the Staff page and select a staff member. In their profile, you'll find an 'Availability' tab where you can set their working days and hours. You can also block out specific dates for vacation or other absences.",
    },
    {
      question: "How do I track job progress?",
      answer:
        "The Dashboard provides an overview of all jobs by status. For more detailed tracking, go to the Jobs page where you can filter jobs by status, priority, or assigned staff. Each job card shows its current status and progress.",
    },
    {
      question: "How do I export data from the system?",
      answer:
        "Go to Settings > Data Management. Here you'll find options to export jobs, staff, or other data to CSV format. Select the data type you want to export and click the corresponding export button.",
    },
  ];

  return (
    <MainLayout title="Help & Support">
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for help topics..."
            className="pl-10 py-6 text-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <FileText className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="mb-2">Documentation</CardTitle>
              <p className="text-muted-foreground">
                Browse our comprehensive documentation
              </p>
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Video className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="mb-2">Video Tutorials</CardTitle>
              <p className="text-muted-foreground">
                Watch step-by-step video guides
              </p>
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <MessageSquare className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="mb-2">Live Chat</CardTitle>
              <p className="text-muted-foreground">
                Chat with our support team in real-time
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Can't find what you're looking for? Our support team is here
                  to help you with any questions or issues you may have.
                </p>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>support@printshopmanager.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <span>Live chat available 9am-5pm EST, Mon-Fri</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Input placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <Input placeholder="Your Email" type="email" />
                </div>
                <div className="space-y-2">
                  <Input placeholder="Subject" />
                </div>
                <div className="space-y-2">
                  <textarea
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe your issue or question"
                  />
                </div>
                <Button className="w-full">Submit Request</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
