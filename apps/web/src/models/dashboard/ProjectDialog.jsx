import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ProjectDialog() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 py-4 space-y-3">
        <div>
          <Label htmlFor="projectName" className="text-right mb-2">Project Name</Label>
          <Input id="projectName" defaultValue="E-commerce Platform" className="col-span-3" />
        </div>
        <div>
          <Label htmlFor="description" className="text-right mb-2">Description</Label>
          <Input id="description" defaultValue="Project overview..." className="col-span-3" />
        </div>
        <div>
          <Label htmlFor="client" className="text-right mb-2">Client</Label>
          <Select>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client1">Client 1</SelectItem>
              <SelectItem value="client2">Client 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="projectManager" className="text-right mb-2">Project Manager</Label>
          <Select>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manager1">Manager 1</SelectItem>
              <SelectItem value="manager2">Manager 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="startDate" className="text-right mb-2">Start Date</Label>
          <Input id="startDate" type="date" className="col-span-3" />
        </div>
        <div>
          <Label htmlFor="endDate" className="text-right mb-2">End Date</Label>
          <Input id="endDate" type="date" className="col-span-3" />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Project
        </Button>
      </div>
    </>
  );
}