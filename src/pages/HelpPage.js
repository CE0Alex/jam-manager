import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Video, MessageSquare, Mail, } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
export default function HelpPage() {
    const faqs = [
        {
            question: "How do I create a new job?",
            answer: "To create a new job, navigate to the Jobs page and click the 'Create Job' button in the top right corner. Fill out the required information in the form and click 'Save' to create the job.",
        },
        {
            question: "How do I assign staff to a job?",
            answer: "When creating or editing a job, you'll see a dropdown menu labeled 'Assign To' where you can select a staff member. Alternatively, you can assign jobs from the Staff page by selecting a staff member and using the 'Assign Job' button.",
        },
        {
            question: "How do I schedule a job for production?",
            answer: "Navigate to the Schedule page and click on an available time slot in the calendar. Select the job you want to schedule from the dropdown menu and set the start and end times. You can also drag and drop jobs directly onto the calendar.",
        },
        {
            question: "How do I update a job's status?",
            answer: "Open the job details by clicking on a job in the Jobs list. In the job details view, you'll find a status dropdown where you can change the current status. Click 'Save' to update the job.",
        },
        {
            question: "How do I view reports?",
            answer: "Navigate to the Reports page using the sidebar menu. Here you can select different report types such as Production Reports, Financial Reports, or Staff Performance Reports. Use the date range selector to filter the data.",
        },
        {
            question: "How do I manage staff availability?",
            answer: "Go to the Staff page and select a staff member. In their profile, you'll find an 'Availability' tab where you can set their working days and hours. You can also block out specific dates for vacation or other absences.",
        },
        {
            question: "How do I track job progress?",
            answer: "The Dashboard provides an overview of all jobs by status. For more detailed tracking, go to the Jobs page where you can filter jobs by status, priority, or assigned staff. Each job card shows its current status and progress.",
        },
        {
            question: "How do I export data from the system?",
            answer: "Go to Settings > Data Management. Here you'll find options to export jobs, staff, or other data to CSV format. Select the data type you want to export and click the corresponding export button.",
        },
    ];
    return (_jsx(MainLayout, { title: "Help & Support", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-3 h-5 w-5 text-muted-foreground" }), _jsx(Input, { placeholder: "Search for help topics...", className: "pl-10 py-6 text-lg" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx(Card, { className: "hover:bg-muted/50 transition-colors cursor-pointer", children: _jsxs(CardContent, { className: "p-6 flex flex-col items-center text-center", children: [_jsx(FileText, { className: "h-12 w-12 text-primary mb-4" }), _jsx(CardTitle, { className: "mb-2", children: "Documentation" }), _jsx("p", { className: "text-muted-foreground", children: "Browse our comprehensive documentation" })] }) }), _jsx(Card, { className: "hover:bg-muted/50 transition-colors cursor-pointer", children: _jsxs(CardContent, { className: "p-6 flex flex-col items-center text-center", children: [_jsx(Video, { className: "h-12 w-12 text-primary mb-4" }), _jsx(CardTitle, { className: "mb-2", children: "Video Tutorials" }), _jsx("p", { className: "text-muted-foreground", children: "Watch step-by-step video guides" })] }) }), _jsx(Card, { className: "hover:bg-muted/50 transition-colors cursor-pointer", children: _jsxs(CardContent, { className: "p-6 flex flex-col items-center text-center", children: [_jsx(MessageSquare, { className: "h-12 w-12 text-primary mb-4" }), _jsx(CardTitle, { className: "mb-2", children: "Live Chat" }), _jsx("p", { className: "text-muted-foreground", children: "Chat with our support team in real-time" })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Frequently Asked Questions" }) }), _jsx(CardContent, { children: _jsx(Accordion, { type: "single", collapsible: true, className: "w-full", children: faqs.map((faq, index) => (_jsxs(AccordionItem, { value: `item-${index}`, children: [_jsx(AccordionTrigger, { className: "text-left", children: faq.question }), _jsx(AccordionContent, { children: faq.answer })] }, index))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Contact Support" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-muted-foreground", children: "Can't find what you're looking for? Our support team is here to help you with any questions or issues you may have." }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "h-5 w-5 text-muted-foreground" }), _jsx("span", { children: "support@printshopmanager.com" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MessageSquare, { className: "h-5 w-5 text-muted-foreground" }), _jsx("span", { children: "Live chat available 9am-5pm EST, Mon-Fri" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "space-y-2", children: _jsx(Input, { placeholder: "Your Name" }) }), _jsx("div", { className: "space-y-2", children: _jsx(Input, { placeholder: "Your Email", type: "email" }) }), _jsx("div", { className: "space-y-2", children: _jsx(Input, { placeholder: "Subject" }) }), _jsx("div", { className: "space-y-2", children: _jsx("textarea", { className: "min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", placeholder: "Describe your issue or question" }) }), _jsx(Button, { className: "w-full", children: "Submit Request" })] })] }) })] })] }) }));
}
