import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { DatePicker } from "@/components/DatePicker";
import { Clock } from "lucide-react";
import { apiPatch, apiPost } from "@/interceptor/interceptor";
import moment from "moment";

function LogDialog({
  clients = [],              // array of client objects { _id, name }
  log,                       // existing log for edit mode (optional)
  onSuccess,                 // callback after success
  allEmployees = [],         // optional: if you want to assign log to an employee
}) {
  const isEditMode = !!log;
  const [loading, setLoading] = useState(false);
  const now = new Date(); // current date & time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [formData, setFormData] = useState({
    client: log?.client?._id || "",
    communicationType: log?.communicationType || "",
    topic: log?.topic || "",
    date: log?.date ? new Date(log.date) : null,
    time: log?.time || "",
    outcome: log?.outcome || "",
    notes: log?.notes || "",
  });

  const baseUrl = import.meta.env.VITE_APP_BASE_URL + "followup";
  const token = localStorage.getItem("token");

  const requiredFields = ["client", "communicationType", "topic", "date", "time"];

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
      const oneMinuteAgo = new Date(now.getTime() - 60000);

      if (selectedDateTime >= now) {
        toast.error("Date and time must be at least 1 minute in the past");
        return false;
      }
    }

    return true;
  };


  async function handleSubmit() {
    if (!validateForm()) return;

    // Combine date and time into a single datetime
    const selectedDateTime = new Date(formData.date);
    const [hours, minutes] = formData.time.split(":");
    selectedDateTime.setHours(Number(hours), Number(minutes), 0, 0);

    const payload = {
      ...formData,
      date: formData.date ? moment(selectedDateTime).format("YYYY-MM-DD HH:mm:ss") : "",
    };
    try {
      setLoading(true);
      let data = null;
      if (isEditMode) {
        data = await apiPatch(`followup/update/${log._id}`, payload);
      } else {
        data = await apiPost(`followup/log-followup`, payload);
      }

      if (data.isSuccess) {
        toast.success(
          isEditMode
            ? "Communication log updated successfully!"
            : "Communication log created successfully!"
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
        {subHeading("Communication Log Details")}

        {/* Client */}
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Client <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.client}
            onValueChange={(v) => handleChange("client", v)}
          >
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients?.length > 0 ? (
                clients.map((client) => (
                  <SelectItem key={client._id} value={client._id}>
                    {client.name}
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

        {/* Communication Type */}
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Communication Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.communicationType}
            onValueChange={(v) => handleChange("communicationType", v)}
          >
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phone-call">Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="video-meeting">Video Meeting</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="in-person">In person</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Topic */}
        <div className="flex flex-col space-y-2 col-span-2">
          <label className="text-sm font-medium text-[var(--text)]">
            Topic / Subject <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter topic or subject"
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
            setDate={(date) => handleChange("date", date)}
            simpleCalendar={true}
            placeholder="Select date"
            maxDate={now} />
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
              className="pl-10"
            />
            {/* <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" /> */}
          </div>
        </div>

        {/* Outcome */}
        <div className="flex flex-col space-y-2 col-span-2">
          <label className="text-sm font-medium text-[var(--text)]">
            Outcome
          </label>
          <Select
            value={formData.outcome}
            onValueChange={(v) => handleChange("outcome", v)}
          >
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Select outcome (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="followup-required">Follow-up Required</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="flex flex-col space-y-2 col-span-2">
          <label className="text-sm font-medium text-[var(--text)]">
            Notes
          </label>
          <Textarea
            placeholder="Add any additional details, action items, or remarks..."
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={5}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={handleSubmit}
          className="bg-[var(--button)] text-white"
          disabled={loading}
        >
          {loading
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
              ? "Update Log"
              : "Create Log"}
        </Button>
      </div>
    </div>
  );
}

export default LogDialog;