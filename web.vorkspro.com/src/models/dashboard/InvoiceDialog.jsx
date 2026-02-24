import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function InvoiceDialog() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 py-4 space-y-3">
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
          <Label htmlFor="project" className="text-right mb-2">Project</Label>
          <Select>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="project1">Project 1</SelectItem>
              <SelectItem value="project2">Project 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="invoiceDate" className="text-right mb-2">Invoice Date</Label>
          <Input id="invoiceDate" type="date" className="col-span-3" />
        </div>
        <div>
          <Label htmlFor="dueDate" className="text-right mb-2">Due Date</Label>
          <Input id="dueDate" type="date" className="col-span-3" />
        </div>
        <div>
          <Label htmlFor="amount" className="text-right mb-2">Amount</Label>
          <Input id="amount" type="number" defaultValue="0.00" step="0.01" className="col-span-3" />
        </div>
        <div>
          <Label htmlFor="description" className="text-right mb-2">Description</Label>
          <Input id="description" defaultValue="Invoice details..." className="col-span-3" />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>
    </>
  );
}