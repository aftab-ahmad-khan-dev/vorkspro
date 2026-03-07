import React from 'react';
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function ScheduleDialog() {
  return (
    <div className="w-full rounded-lg shadow- space-y-4">
      {/* Employee */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">Employee</label>
        <Select>
          <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee1">Employee 1</SelectItem>
            <SelectItem value="employee2">Employee 2</SelectItem>
            <SelectItem value="employee3">Employee 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviewer */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">Reviewer</label>
        <Select>
          <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
            <SelectValue placeholder="Select reviewer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reviewer1">Reviewer 1</SelectItem>
            <SelectItem value="reviewer2">Reviewer 2</SelectItem>
            <SelectItem value="reviewer3">Reviewer 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Review Date and Time */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2 mb-4 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">Review Date</label>
          <div className="relative">
            <Input
              type="text"
              placeholder="mm/dd/yyyy"
              className="w-full border border-[var(--border)] rounded-md p-2 pl-10 text-[var(--text)]"
            />
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]" size={18} />
          </div>
        </div>
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">Time</label>
          <div className="relative">
            <Input
              type="text"
              placeholder="--:--"
              className="w-full border border-[var(--border)] rounded-md p-2 pl-10 text-[var(--text)]"
            />
            <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]" size={18} />
          </div>
        </div>
      </div>

      {/* Review Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">Review Type</label>
        <Select>
          <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="type1">Type 1</SelectItem>
            <SelectItem value="type2">Type 2</SelectItem>
            <SelectItem value="type3">Type 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Meeting Agenda */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">Meeting Agenda</label>
        <Textarea
          placeholder="Outline topics to discuss..."
          className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)] h-24"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4">
        <Button>
          Schedule Review
        </Button>
      </div>
    </div>
  );
}

export default ScheduleDialog;