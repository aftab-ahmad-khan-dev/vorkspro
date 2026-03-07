import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function CreateDialog() {
  return (
    <div className="space-y-4">
      {/* Task Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">Task Title</label>
        <Input
          type="text"
          placeholder="e.g., API Integration"
          className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]"
        />
      </div>

      {/* Project */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">Project</label>
        <Select>
          <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="project1">Project 1</SelectItem>
            <SelectItem value="project2">Project 2</SelectItem>
            <SelectItem value="project3">Project 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">Description</label>
        <Textarea
          placeholder="Task details..."
          className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)] h-24"
        />
      </div>

      {/* Assign To and Priority */}
      <div className="flex space-x-4">
        <div className="space-y-2 w-1/2">
          <label className="text-sm font-medium text-[var(--text)]">Assign To</label>
          <Select>
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent >
              <SelectItem value="assignee1">Assignee 1</SelectItem>
              <SelectItem value="assignee2">Assignee 2</SelectItem>
              <SelectItem value="assignee3">Assignee 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 w-1/2">
          <label className="text-sm font-medium text-[var(--text)]">Priority</label>
          <Select>
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Due Date and Milestone */}
      <div className="flex space-x-4">
        <div className="space-y-2 w-1/2">
          <label className="text-sm font-medium text-[var(--text)]">Due Date</label>
          <Input
            type="text"
            placeholder="mm/dd/yyyy"
            className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]"
          />
        </div>
        <div className="space-y-2 w-1/2">
          <label className="text-sm font-medium text-[var(--text)]">Milestone (Optional)</label>
          <Select>
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Link to milestone" />
            </SelectTrigger>
            <SelectContent >
              <SelectItem value="milestone1">Milestone 1</SelectItem>
              <SelectItem value="milestone2">Milestone 2</SelectItem>
              <SelectItem value="milestone3">Milestone 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4">
        <Button>
          Create Task
        </Button>
      </div>
    </div>
  );
}

export default CreateDialog;