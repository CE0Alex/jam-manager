import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppContext } from "@/context/AppContext";
import { X, Plus, Pencil, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function JobTypeSettings() {
  const { jobTypes, updateJobTypes } = useAppContext();
  
  const [newJobType, setNewJobType] = useState("");
  const [newJobTypeId, setNewJobTypeId] = useState("");
  const [newJobTypeDescription, setNewJobTypeDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleAddJobType = () => {
    if (!newJobType.trim()) {
      toast({
        title: "Error",
        description: "Job type name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (!newJobTypeId.trim()) {
      toast({
        title: "Error",
        description: "Job type ID cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // Validate job type ID - only allow lowercase letters, numbers, and underscores
    const idRegex = /^[a-z0-9_]+$/;
    if (!idRegex.test(newJobTypeId)) {
      toast({
        title: "Error",
        description: "Job type ID can only contain lowercase letters, numbers, and underscores",
        variant: "destructive",
      });
      return;
    }

    // Check if ID already exists
    if (jobTypes.some(jt => jt.id === newJobTypeId)) {
      toast({
        title: "Error",
        description: "Job type ID already exists",
        variant: "destructive",
      });
      return;
    }

    updateJobTypes([
      ...jobTypes,
      {
        id: newJobTypeId,
        name: newJobType,
        description: newJobTypeDescription,
      },
    ]);

    // Reset form
    setNewJobType("");
    setNewJobTypeId("");
    setNewJobTypeDescription("");

    toast({
      title: "Success",
      description: "Job type added successfully",
    });
  };

  const handleRemoveJobType = (id: string) => {
    // Check if any jobs are using this job type
    // In a real app, you would check this before deleting
    const updatedJobTypes = jobTypes.filter(jt => jt.id !== id);
    updateJobTypes(updatedJobTypes);

    toast({
      title: "Success",
      description: "Job type removed successfully",
    });
  };

  const startEditing = (jobType: { id: string; name: string; description?: string }) => {
    setEditingId(jobType.id);
    setEditName(jobType.name);
    setEditDescription(jobType.description || "");
  };

  const saveEdit = () => {
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Job type name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const updatedJobTypes = jobTypes.map(jt => 
      jt.id === editingId
        ? { ...jt, name: editName, description: editDescription }
        : jt
    );
    
    updateJobTypes(updatedJobTypes);
    setEditingId(null);
    
    toast({
      title: "Success",
      description: "Job type updated successfully",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Types</CardTitle>
        <CardDescription>
          Configure the types of jobs handled by your production facility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newJobTypeId">Job Type ID</Label>
              <Input
                id="newJobTypeId"
                value={newJobTypeId}
                onChange={(e) => setNewJobTypeId(e.target.value)}
                placeholder="e.g. screen_printing"
              />
              <p className="text-xs text-muted-foreground">
                Lowercase with underscores, no spaces
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newJobType">Job Type Name</Label>
              <Input
                id="newJobType"
                value={newJobType}
                onChange={(e) => setNewJobType(e.target.value)}
                placeholder="e.g. Screen Printing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newJobTypeDescription">Description</Label>
              <Input
                id="newJobTypeDescription"
                value={newJobTypeDescription}
                onChange={(e) => setNewJobTypeDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
          </div>
          <Button onClick={handleAddJobType} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Job Type
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Current Job Types</h3>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobTypes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-6"
                    >
                      No job types defined yet
                    </TableCell>
                  </TableRow>
                ) : (
                  jobTypes.map((jobType) => (
                    <TableRow key={jobType.id}>
                      <TableCell className="font-mono text-sm">
                        {jobType.id}
                      </TableCell>
                      <TableCell>
                        {editingId === jobType.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        ) : (
                          jobType.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === jobType.id ? (
                          <Input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                          />
                        ) : (
                          jobType.description || "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === jobType.id ? (
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={saveEdit}
                              title="Save"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={cancelEdit}
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditing(jobType)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveJobType(jobType.id)}
                              title="Remove"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
