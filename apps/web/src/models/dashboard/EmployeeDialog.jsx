// ✅ Simplified EmployeeDialog (no <Dialog>)
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function EmployeeDialog() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 py-4 space-y-3">
        <div>
          <Label htmlFor="firstName" className="text-right mb-2">First Name</Label>
          <Input id="firstName" defaultValue="John" className="col-span-3" />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-right mb-2">Last Name</Label>
          <Input id="lastName" defaultValue="Doe" className="col-span-3" />
        </div>
        <div>
          <Label htmlFor="email" className="text-right mb-2">Email</Label>
          <Input id="email" type="email" defaultValue="john.doe@company.com" className="col-span-3" />
        </div>
        <div>
          <Label htmlFor="phone" className="text-right mb-2">Phone</Label>
          <Input id="phone" defaultValue="+1 234 567 8900" className="col-span-3" />
        </div>
        <div>
          <Label htmlFor="department" className="text-right mb-2">
            Department
          </Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="department1">Department 1</SelectItem>
              <SelectItem value="department2">Department 2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="position" className="text-right mb-2">Position</Label>
          <Input id="position" defaultValue="Software Engineer" className="col-span-3" />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>
    </>
  );
}
