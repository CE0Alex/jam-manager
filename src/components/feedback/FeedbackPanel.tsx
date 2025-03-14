import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, ListChecks } from "lucide-react";
import FeedbackForm from "./FeedbackForm";
import FeedbackList from "./FeedbackList";

export default function FeedbackPanel() {
  const [activeTab, setActiveTab] = useState<"submit" | "list">("submit");

  const handleSubmitSuccess = () => {
    // Switch to the list tab after successful submission
    setActiveTab("list");
  };

  return (
    <Card className="w-full h-full border-0 rounded-none">
      <CardHeader className="pb-3">
        <CardTitle>Feedback & Bug Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "submit" | "list")}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="submit" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Submit Feedback
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              View All
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submit" className="mt-0">
            <FeedbackForm onSubmitSuccess={handleSubmitSuccess} />
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <FeedbackList />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
