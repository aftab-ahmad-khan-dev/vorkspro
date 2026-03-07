import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ClientDialog() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 py-4 space-y-3">
        <div>
          <Label htmlFor="companyName" className="text-right mb-2">Company Name</Label>
          <Input id="companyName" defaultValue="Tech Corp" className="col-span-3" />
        </div>
        <div>
          <Label htmlFor="contactPerson" className="text-right mb-2">Contact Person</Label>
          <Input id="contactPerson" defaultValue="John Smith" className="col-span-3" />
        </div>
        <div>
          <Label htmlFor="email" className="text-right mb-2">Email</Label>
          <Input id="email" type="email" defaultValue="john@techcorp.com" className="col-span-3" />
        </div>
        <div>
          <Label htmlFor="phone" className="text-right mb-2">Phone</Label>
          <Input id="phone" defaultValue="+1 234 567 8900" className="col-span-3" />
        </div>
        <div>
          <Label htmlFor="industry" className="text-right mb-2">Industry</Label>
          <Select>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="industry1">Industry 1</SelectItem>
              <SelectItem value="industry2">Industry 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="address" className="text-right mb-2">Address</Label>
          <Input id="address" defaultValue="123 Business St, City, State" className="col-span-3" />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>
    </>
  );
}