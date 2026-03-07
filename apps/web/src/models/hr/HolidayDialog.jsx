import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/interceptor/interceptor";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DatePicker } from "@/components/DatePicker";
import { toast } from "sonner";

function HolidayDialog({ onclose }) {
  const [form, setForm] = useState({
    holiday: "",
    holidayDate: null,
    type: "",
    status: "holidays", // default to holidays
  });

  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;

  const holidayTypes = [
    { value: "public-holiday", label: "Public Holiday" },
    { value: "company-holiday", label: "Company Holiday" },
    { value: "observance", label: "Observance" },
  ];

  const statusOptions = [
    { value: "holidays", label: "Holiday" },
    { value: "events", label: "Event" },
  ];

  async function handleSubmit() {
    if (!form.holiday || !form.holidayDate || !form.type || !form.status) {
      return toast.error("All fields are required!");
    }

    try {
      const payload = {
        holiday: form.holiday,
        holidayDate: form.holidayDate.setHours(12, 0, 0, 0),
        type: form.type,
        status: form.status,
      };
      const data = await apiPost("leave-request/add-holiday", payload);

      if (data.isSuccess) {
        toast.success(data?.message || "Holiday/Event added successfully!");
        onclose();
      } else {
        toast.error(data?.message || "Failed to add");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Holiday / Event Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">
          Name <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="e.g. Christmas Day, Team Offsite"
          className="w-full"
          value={form.holiday}
          onChange={(e) => setForm({ ...form, holiday: e.target.value })}
        />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">
          Date <span className="text-red-500">*</span>
        </label>
        <DatePicker
          date={form.holidayDate}
          setDate={(date) =>
            setForm({
              ...form,
              holidayDate: date,
            })
          }
          simpleCalendar={true}
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">
          Holiday Type <span className="text-red-500">*</span>
        </label>
        <Select
          value={form.type}
          onValueChange={(value) => setForm({ ...form, type: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {holidayTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* NEW: Status - Holiday or Event */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">
          Category <span className="text-red-500">*</span>
        </label>
        <Select
          value={form.status}
          onValueChange={(value) => setForm({ ...form, status: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Holiday or Event?" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button onClick={handleSubmit}>
          {form.status === "holidays" ? "Add Holiday" : "Add Event"}
        </Button>
      </div>
    </div>
  );
}

export default HolidayDialog;
