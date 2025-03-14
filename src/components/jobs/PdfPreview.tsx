import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PdfPreviewProps {
  file: File | Blob;
  onClose: () => void;
  fileUrl?: string; // Optional URL if already available
}

const PdfPreview: React.FC<PdfPreviewProps> = ({
  file,
  onClose,
  fileUrl: propFileUrl,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(propFileUrl || null);
  const [isLoading, setIsLoading] = useState(!propFileUrl);

  useEffect(() => {
    // If we already have a URL from props, use that
    if (propFileUrl) {
      setPdfUrl(propFileUrl);
      setIsLoading(false);
      return;
    }

    // Otherwise create a blob URL from the file
    if (file && !pdfUrl) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setIsLoading(false);

      // Clean up the URL when the component unmounts
      return () => {
        // Only revoke if we created this URL (not if it came from props)
        if (!propFileUrl) {
          URL.revokeObjectURL(url);
        }
      };
    }
  }, [file, propFileUrl]);

  if (isLoading) {
    return (
      <Card className="w-full h-[500px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        <div className="flex justify-end p-2 bg-muted">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </div>
        <div className="h-[500px] w-full">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full"
              title="PDF Preview"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              Unable to preview PDF
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PdfPreview;
