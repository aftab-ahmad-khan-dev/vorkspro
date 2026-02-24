import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AnnouncementDialog() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 py-4 space-y-3">
        <div>
          <Label htmlFor="title" className="text-right mb-2">Title</Label>
          <Input id="title" defaultValue="Company Update" className="col-span-3" />
        </div>
        <div>
          <Label htmlFor="category" className="text-right mb-2">Category</Label>
          <Select>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category1">Category 1</SelectItem>
              <SelectItem value="category2">Category 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority" className="text-right mb-2">Priority</Label>
          <Select>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority1">Priority 1</SelectItem>
              <SelectItem value="priority2">Priority 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="content" className="text-right mb-2">Content</Label>
          <Input id="content" defaultValue="Write your announcement..." className="col-span-3" />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Publish Announcement
        </Button>
      </div>
    </>
  );
}