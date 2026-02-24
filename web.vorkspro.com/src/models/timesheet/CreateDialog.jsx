import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LucideCalendar } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

function CreateDialog() {
  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--text)] py-1">Date</label>
          <div className="flex items-center">
            <Input type="date" defaultValue="2025-10-14" className="mt-1" />
            <LucideCalendar className="ml-2 h-4 w-4 text-gray-500" />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--text)] py-1">Hours Worked</label>
          <Input type="number" defaultValue="8" className="mt-1" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text)] py-1">Project</label>
        <Select>
          <SelectTrigger className="w-full border border-[var(--border)]">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="project1">Project 1</SelectItem>
            <SelectItem value="project2">Project 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text)] py-1">Task</label>
        <Input placeholder="Task Title e.g., API Integration" className="w-full" />
      </div>

      <div>
        <label className='block text-sm font-medium text-[var(--text)] py-1'>Description</label>
        <Textarea placeholder="Describe what you worked on..." className="w-full">
        </Textarea>
      </div>

      <div>
        <label className='block text-sm font-medium text-[var(--text)] py-1'>Select Type</label>
        <Select>
          <SelectTrigger className="w-full border border-[var(--border)]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="type1">Type 1</SelectItem>
            <SelectItem value="type2">Type 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end">
        <Button>Add Work Log</Button>
      </div>
    </div>
  );
}

export default CreateDialog