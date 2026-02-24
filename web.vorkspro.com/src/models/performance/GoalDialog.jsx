import React from 'react';
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function GoalDialog() {
  return (
    <div className="w-full rounded-lg space-y-4">
      {/* Employee */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">Employee</label>
        <Select>
          <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
            <SelectValue placeholder="Sarah Johnson" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sarahjohnson">Sarah Johnson</SelectItem>
            <SelectItem value="employee2">Employee 2</SelectItem>
            <SelectItem value="employee3">Employee 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Goal Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">Goal Title</label>
        <Input
          type="text"
          placeholder="e.g., Complete API Integration Module"
          className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">Description</label>
        <Textarea
          placeholder="Detailed description of the goal..."
          className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)] h-24"
        />
      </div>

      {/* Target Date and Priority */}
      <div className="flex space-x-4">
        <div className="space-y-2 w-1/2">
          <label className="text-sm font-medium text-[var(--text)]">Target Date</label>
          <div className="relative">
            <Input
              type="text"
              placeholder="mm/dd/yyyy"
              className="w-full border border-[var(--border)] rounded-md p-2 pl-10 text-[var(--text)]"
            />
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
        <div className="space-y-2 w-1/2">
          <label className="text-sm font-medium text-[var(--text)]">Priority</label>
          <Select>
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent >
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">Category</label>
        <Select>
          <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="management">Management</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4">
        <Button>
          Set Goal
        </Button>
      </div>
    </div>
  );
}

export default GoalDialog;