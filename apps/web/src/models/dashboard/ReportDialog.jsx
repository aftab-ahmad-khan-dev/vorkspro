import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ReportDialog() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 py-4 space-y-3">
        <div>
          <Label htmlFor="reportType" className="text-right mb-2">Report Type</Label>
          <Select>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="type1">Type 1</SelectItem>
              <SelectItem value="type2">Type 2</SelectItem>
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
        <div>
          <Label htmlFor="format" className="text-right mb-2">Format</Label>
          <Select>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="format1">Format 1</SelectItem>
              <SelectItem value="format2">Format 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Generate Report
        </Button>
      </div>
    </>
  );
}