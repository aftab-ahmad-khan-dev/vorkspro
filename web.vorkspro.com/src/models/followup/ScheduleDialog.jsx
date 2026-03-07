// src/models/followup/CreateScheduleDialog.jsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import moment from "moment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { DatePicker } from "@/components/DatePicker";
import { Clock } from "lucide-react";
import SearchableSelect from "@/components/SearchableSelect";
import { apiPatch, apiPost } from "@/interceptor/interceptor";

function ScheduleDialog({
  clients = [],
  allEmployees = [],
  followup,                    // for edit mode
  onSuccess,
}) {
  const isEditMode = !!followup;
  const [loading, setLoading] = useState(false);
  const now = new Date(); // current date & time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const [formData, setFormData] = useState({
    client: followup?.client?._id || "",
    assignTo: followup?.assignTo?._id || "",
    topic: followup?.topic || "",
    date: followup?.date ? new Date(followup.date) : null,
    time: followup?.time || "",
    priority: followup?.priority || "medium",
    notes: followup?.notes || "",
    isReminderSet: followup?.isReminderSet || false,
  });

  const baseUrl = import.meta.env.VITE_APP_BASE_URL + "followup";
  const token = localStorage.getItem("token");

  // Required fields for scheduling (not logging)
  const requiredFields = ["client", "assignTo", "topic", "date", "time"];

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const missing = requiredFields.filter((field) => !formData[field]);
    if (missing.length > 0) {
      toast.error("Please fill all required fields");
      return false;
    }

    if (formData.date && formData.time) {
      const selectedDateTime = new Date(formData.date);
      const [hours, minutes] = formData.time.split(":");
      selectedDateTime.setHours(Number(hours), Number(minutes), 0, 0);

      const now = new Date();

      if (selectedDateTime < now) {
        toast.error("Date and time cannot be in the past");
        return false;
      }
    }

    return true;
  };


  async function handleSubmit() {
    if (!validateForm()) return;

    const remindAt = formData.date && formData.time ? (() => {
      const d = new Date(formData.date);
      const [h, m] = formData.time.split(":").map(Number);
      d.setHours(h, m, 0, 0);
      return d;
    })() : null;

    const payload = {
      ...formData,
      remindAtUtc: formData.isReminderSet && remindAt ? remindAt.toISOString() : null,
    };

    try {
      setLoading(true);
      let data = null;
      if (isEditMode) {
        data = await apiPatch(`followup/update/${followup._id}`, payload);
      } else if (!isEditMode) {
        data = await apiPost(`followup/schedule-followup`, payload);
      }

      if (data.isSuccess) {
        toast.success(
          isEditMode
            ? "Follow-up updated successfully!"
            : "Follow-up scheduled successfully! You'll get a browser notification at the reminder time."
        );
        onSuccess?.();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      console.log(error)
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function subHeading(title) {
    return (
      <div className="col-span-2">
        <div className="border-b border-b-[var(--border)] py-1 font-semibold text-[var(--text)]">
          {title}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {subHeading("Schedule Follow-up Details")}

        {/* Client */}
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Client <span className="text-red-500">*</span>
          </label>
          <Select value={formData.client} onValueChange={(v) => handleChange("client", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients?.length > 0 ? (
                clients.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="none">
                  No clients available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Assign To */}
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Assign To <span className="text-red-500">*</span>
          </label>
          {/* <Select value={formData.assignTo} onValueChange={(v) => handleChange("assignTo", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {allEmployees?.length > 0 ? (
                allEmployees.map((emp) => (
                  <SelectItem key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="none">
                  No employees available
                </SelectItem>
              )}
            </SelectContent>
          </Select> */}
          <SearchableSelect items={allEmployees} value={formData.assignTo} onValueChange={(e) => { setFormData({ ...formData, assignTo: e }) }}></SearchableSelect>
        </div>

        {/* Topic */}
        <div className="flex flex-col space-y-2 col-span-2">
          <label className="text-sm font-medium text-[var(--text)]">
            Topic / Purpose <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. Contract renewal discussion, Project review"
            value={formData.topic}
            onChange={(e) => handleChange("topic", e.target.value)}
          />
        </div>

        {/* Date */}
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            date={formData.date}
            simpleCalendar={true}
            setDate={(date) => handleChange("date", date)}
            placeholder="Select date"
            minDate={today}
          />
        </div>

        {/* Time */}
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Time <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type="time"
              value={formData.time}
              onChange={(e) => handleChange("time", e.target.value)}
              className="pl-10  "
            />
            {/* <Clock className="absolute left-3 top-3 h-4 w-4 text-foreground" /> */}
          </div>
        </div>

        {/* Priority */}
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Priority
          </label>
          <Select value={formData.priority} onValueChange={(v) => handleChange("priority", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="flex flex-col space-y-2 col-span-2">
          <label className="text-sm font-medium text-[var(--text)]">
            Notes (optional)
          </label>
          <Textarea
            placeholder="Add any context, action items, or special instructions..."
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={4}
          />
        </div>
      </div>

      {/* Reminder */}
      <div className="flex items-center space-x-3 col-span-2 sm:col-span-1">
        <Checkbox
          id="reminder"
          checked={formData.isReminderSet}
          onCheckedChange={(checked) => handleChange("isReminderSet", checked)}
        />
        <label
          htmlFor="reminder"
          className="text-sm font-medium cursor-pointer select-none"
        >
          Set reminder notification
        </label>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={handleSubmit}
          className="bg-[var(--button)] text-white"
          disabled={loading}
        >
          {loading
            ? isEditMode
              ? "Updating..."
              : "Scheduling..."
            : isEditMode
              ? "Update Follow-up"
              : "Schedule Follow-up"}
        </Button>
      </div>
    </div>
  );
}

export default ScheduleDialog;