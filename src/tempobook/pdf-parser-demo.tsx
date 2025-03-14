import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Eye } from "lucide-react";

export default function PdfParserDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleExtract = async () => {
    if (!file) return;

    setIsLoading(true);

    // Simulate extraction with timeout
    setTimeout(() => {
      // Mock extracted data
      setExtractedData({
        title: "Business Cards - ABC Corp",
        client: "ABC Corporation",
        description: "500 business cards, double-sided, premium stock",
        deadline: "2023-12-15",
        priority: "medium",
        estimatedHours: 2,
        notes: "Client requested rush delivery",
      });

      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">PDF Parser Demo</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload PDF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="font-medium">Drag and drop your PDF here</p>
              <p className="text-sm text-gray-500 mb-2">
                or click to browse files
              </p>

              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                id="pdf-upload"
                onChange={handleFileChange}
              />
              <label htmlFor="pdf-upload">
                <Button variant="outline" type="button">
                  Browse Files
                </Button>
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round(file.size / 1024)} KB
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleExtract}
              disabled={!file || isLoading}
              className="w-full"
            >
              {isLoading ? "Extracting..." : "Extract Data"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extracted Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!extractedData ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Upload and process a PDF to see extracted data</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Invoice Number</Label>
                  <Input value={extractedData.title} readOnly />
                </div>

                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input value={extractedData.client} readOnly />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={extractedData.description} readOnly />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Deadline</Label>
                    <Input value={extractedData.deadline} readOnly />
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Input value={extractedData.priority} readOnly />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Estimated Hours</Label>
                  <Input value={extractedData.estimatedHours} readOnly />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={extractedData.notes} readOnly />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
