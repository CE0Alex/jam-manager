import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare } from "lucide-react";
import FeedbackPanel from "../feedback/FeedbackPanel";

export default function FeedbackDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-full sm:max-w-md md:max-w-lg overflow-auto"
        side="right"
      >
        <div className="h-full flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Feedback & Bug Reports</h2>
          <div className="flex-1 overflow-auto">
            <FeedbackPanel />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
