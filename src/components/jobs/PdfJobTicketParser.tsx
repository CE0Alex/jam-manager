import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ExtractedJobData } from "@/lib/pdfParser";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PdfJobTicketParserProps {
  data: ExtractedJobData;
  rawText?: string; // Optional raw text for manual selection
  fileName: string;
  fileSize?: number;
  onDataUpdate?: (updatedData: ExtractedJobData) => void;
}

const PdfJobTicketParser = ({ 
  data, 
  rawText = '',
  fileName, 
  fileSize,
  onDataUpdate
}: PdfJobTicketParserProps) => {
  const [activeTab, setActiveTab] = useState<string>("auto");
  const [manualData, setManualData] = useState<ExtractedJobData>({...data});
  
  // Format file size for display
  const formattedSize = fileSize 
    ? fileSize < 1024 * 1024 
      ? `${(fileSize / 1024).toFixed(2)} KB` 
      : `${(fileSize / 1024 / 1024).toFixed(2)} MB`
    : undefined;

  // Format the deadline for display
  const formattedDeadline = data.deadline 
    ? format(new Date(data.deadline), 'PPP') 
    : 'Not specified';
    
  const handleManualUpdate = (field: keyof ExtractedJobData, value: string | number) => {
    const updatedData = { ...manualData, [field]: value };
    setManualData(updatedData);
    if (onDataUpdate) {
      onDataUpdate(updatedData);
    }
  };
  
  const applyManualData = () => {
    if (onDataUpdate) {
      onDataUpdate(manualData);
    }
    setActiveTab("auto");
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <FileText className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <CardTitle className="text-base">Extracted Data from PDF</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{fileName}</span>
            {formattedSize && (
              <>
                <span>•</span>
                <span>{formattedSize}</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 px-6 pt-2">
          <TabsTrigger value="auto">Auto Extracted</TabsTrigger>
          <TabsTrigger value="manual">Manual Extract</TabsTrigger>
        </TabsList>
        
        <TabsContent value="auto" className="pt-2">
          <CardContent className="pt-4">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {data.title && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Invoice Number</h3>
                    <p className="text-sm text-foreground">{data.title}</p>
                  </div>
                )}
                
                {data.client && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Client</h3>
                    <p className="text-sm text-foreground">{data.client}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-semibold mb-1">Deadline</h3>
                  <p className="text-sm text-foreground">{formattedDeadline}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-1">Priority</h3>
                  <Badge variant={
                    data.priority === 'high' ? 'destructive' :
                    data.priority === 'medium' ? 'default' :
                    'outline'
                  }>
                    {data.priority || 'Medium'}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-1">Estimated Hours</h3>
                  <p className="text-sm text-foreground">{data.estimatedHours || '1'} hours</p>
                </div>
                
                {data.description && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {data.description}
                    </p>
                  </div>
                )}
                
                {data.notes && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Notes</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {data.notes}
                    </p>
                  </div>
                )}
                
                {/* Show any additional data that might be extracted */}
                {Object.entries(data).filter(([key]) => 
                  !['title', 'client', 'deadline', 'priority', 'estimatedHours', 'description', 'notes'].includes(key)
                ).map(([key, value]) => (
                  <div key={key}>
                    <h3 className="text-sm font-semibold mb-1">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="manual" className="pt-2">
          <CardContent className="pt-4">
            <div className="mb-4 p-2 border border-yellow-200 bg-yellow-50 rounded-md text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-xs">If automatic extraction didn't work correctly, you can manually enter the correct data here.</p>
            </div>
            
            <div className="space-y-6">
              {rawText && (
                <div className="mb-4">
                  <Label htmlFor="rawText">Raw Text from PDF</Label>
                  <ScrollArea className="h-[100px] border rounded-md p-2 text-xs font-mono">
                    <pre className="whitespace-pre-wrap">{rawText}</pre>
                  </ScrollArea>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="manual-title">Invoice Number</Label>
                    <Input 
                      id="manual-title" 
                      value={manualData.title || ''} 
                      onChange={(e) => handleManualUpdate('title', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="manual-client">Client</Label>
                    <Input 
                      id="manual-client" 
                      value={manualData.client || ''} 
                      onChange={(e) => handleManualUpdate('client', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="manual-deadline">Deadline</Label>
                    <Input 
                      id="manual-deadline" 
                      type="date"
                      value={manualData.deadline?.split('T')[0] || ''} 
                      onChange={(e) => handleManualUpdate('deadline', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="manual-hours">Estimated Hours</Label>
                    <Input 
                      id="manual-hours" 
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={manualData.estimatedHours || 1} 
                      onChange={(e) => handleManualUpdate('estimatedHours', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="manual-description">Description</Label>
                    <Textarea 
                      id="manual-description" 
                      value={manualData.description || ''} 
                      onChange={(e) => handleManualUpdate('description', e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="manual-notes">Notes</Label>
                    <Textarea 
                      id="manual-notes" 
                      value={manualData.notes || ''} 
                      onChange={(e) => handleManualUpdate('notes', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={applyManualData}
                >
                  Apply Manual Data
                </Button>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default PdfJobTicketParser; 