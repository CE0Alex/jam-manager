import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/components/ui/use-toast";
import { Upload, X } from "lucide-react";

interface FeedbackFormProps {
  onSubmitSuccess?: () => void;
}

export default function FeedbackForm({ onSubmitSuccess }: FeedbackFormProps) {
  const { staff, addFeedback } = useAppContext();
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    submitter: "",
    importance: "medium",
    page: "",
    attemptedAction: "",
    actualResult: "",
    expectedResult: "",
    screenshotUrl: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setScreenshot(file);
        // In a real app, we would upload this to storage and get a URL
        // For now, we'll create a temporary object URL
        const screenshotUrl = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, screenshotUrl }));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setScreenshot(file);
        // In a real app, we would upload this to storage and get a URL
        // For now, we'll create a temporary object URL
        const screenshotUrl = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, screenshotUrl }));
      }
    }
  };

  const handleRemoveFile = () => {
    if (formData.screenshotUrl) {
      URL.revokeObjectURL(formData.screenshotUrl);
    }
    setScreenshot(null);
    setFormData((prev) => ({ ...prev, screenshotUrl: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.submitter || !formData.page || !formData.attemptedAction) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      addFeedback({
        ...formData,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback",
      });

      // Reset form
      setFormData({
        submitter: "",
        importance: "medium",
        page: "",
        attemptedAction: "",
        actualResult: "",
        expectedResult: "",
        screenshotUrl: "",
      });
      setScreenshot(null);

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your feedback",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="submitter">Submitted By *</Label>
        <Select
          value={formData.submitter}
          onValueChange={(value) => handleSelectChange("submitter", value)}
          required
        >
          <SelectTrigger id="submitter">
            <SelectValue placeholder="Select staff member" />
          </SelectTrigger>
          <SelectContent>
            {staff.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="importance">Importance</Label>
        <Select
          value={formData.importance}
          onValueChange={(value) => handleSelectChange("importance", value)}
        >
          <SelectTrigger id="importance">
            <SelectValue placeholder="Select importance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="page">Page/Section *</Label>
        <Select
          value={formData.page}
          onValueChange={(value) => handleSelectChange("page", value)}
          required
        >
          <SelectTrigger id="page">
            <SelectValue placeholder="Select page or section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dashboard">Dashboard</SelectItem>
            <SelectItem value="jobs">Jobs Management</SelectItem>
            <SelectItem value="schedule">Production Schedule</SelectItem>
            <SelectItem value="staff">Staff Management</SelectItem>
            <SelectItem value="reports">Reports</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="attemptedAction">What were you trying to do? *</Label>
        <Textarea
          id="attemptedAction"
          name="attemptedAction"
          value={formData.attemptedAction}
          onChange={handleChange}
          placeholder="Describe what you were attempting to do"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="actualResult">What happened?</Label>
        <Textarea
          id="actualResult"
          name="actualResult"
          value={formData.actualResult}
          onChange={handleChange}
          placeholder="Describe what actually happened"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expectedResult">What did you expect to happen?</Label>
        <Textarea
          id="expectedResult"
          name="expectedResult"
          value={formData.expectedResult}
          onChange={handleChange}
          placeholder="Describe what you expected to happen"
        />
      </div>

      <div className="space-y-2">
        <Label>Screenshot (optional)</Label>
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center ${isDragging ? "border-primary bg-primary/5" : "border-gray-300"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!screenshot ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium">
                  Drag and drop your screenshot here
                </p>
                <p className="text-xs text-gray-500">
                  or click to browse files
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="screenshot-upload"
                onChange={handleFileChange}
              />
              <label htmlFor="screenshot-upload">
                <Button
                  variant="outline"
                  type="button"
                  className="mt-2"
                  size="sm"
                >
                  Browse Files
                </Button>
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{screenshot.name}</p>
                  <p className="text-xs text-gray-500">
                    {Math.round(screenshot.size / 1024)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {formData.screenshotUrl && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Preview:</p>
            <img
              src={formData.screenshotUrl}
              alt="Screenshot preview"
              className="max-h-40 rounded-md border"
            />
          </div>
        )}
      </div>

      <Button type="submit" className="w-full">
        Submit Feedback
      </Button>
    </form>
  );
}
