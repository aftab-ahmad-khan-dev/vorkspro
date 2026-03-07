import React, { useEffect, useMemo, useState } from "react";
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
import SearchableSelect from "@/components/SearchableSelect";
import { toast } from "sonner";
import { DatePicker } from "@/components/DatePicker";
import { apiPost } from "@/interceptor/interceptor";

function CreateDialog({ employees, leaveTypes, upcomingCelebrations = [], onclose }) {
  const [form, setForm] = useState({
    employee: "",
    leaveType: "",
    startDate: null,
    endDate: null,
    reason: "",
  });
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [userLeaveAllocation, setUserLeaveAllocation] = useState([]);
  const [userLeaveTypes, setUserLeaveTypes] = useState([]);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;

  const hasLeaveTypes = userLeaveTypes && userLeaveTypes.length > 0;

  useEffect(() => {
    if (userLeaveAllocation && userLeaveAllocation.length > 0) {
      const allocated = userLeaveAllocation.map((l) => l.leaveType);
      setUserLeaveTypes(allocated);
    } else if (leaveTypes && leaveTypes.length > 0) {
      setUserLeaveTypes(leaveTypes);
    } else {
      setUserLeaveTypes([]);
    }
  }, [userLeaveAllocation, leaveTypes]);

  const relevantCelebrations = useMemo(() => {
    if (
      !form.startDate ||
      !form.endDate ||
      !Array.isArray(upcomingCelebrations) ||
      upcomingCelebrations.length === 0
    ) {
      return [];
    }

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return [];
    }

    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(23, 59, 59, 999);

    return upcomingCelebrations.filter((celebration) => {
      if (!celebration?.date) return false;
      const d = new Date(celebration.date);
      if (Number.isNaN(d.getTime())) return false;
      return d >= startDay && d <= endDay;
    });
  }, [form.startDate, form.endDate, upcomingCelebrations]);

  async function handleSubmit() {
    if (!form.employee || !form.leaveType || !form.startDate || !form.endDate) {
      return toast.error("All fields are required!");
    }

    try {
      setLoading(true);
      const data = await apiPost("leave-request/create", form);
      if (data.isSuccess) {
        toast.success(data.message);
        onclose();
        setLoading(false);
      } else {
        setLoading(false);
        toast.error(data?.message);
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-4">
      {/* Employee */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-[var(--text)]">
          Employee <span className="text-red-500">*</span>
        </label>

        <SearchableSelect
          items={employees}
          placeholder="Select Employee"
          onValueChange={(e) => {
            setForm({ ...form, employee: e });
            setSelectedEmployees(form?.employee);
          }}
          onItemSelect={(obj) => {
            setUserLeaveAllocation(obj?.leaveAllocation);
          }}
          value={form?.employee}
        ></SearchableSelect>
      </div>

      {/* Leave Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">
          Leave Type <span className="text-red-500">*</span>
        </label>

        {!hasLeaveTypes && (
          <p className="text-xs text-red-500 bg-red-500/5 border border-red-500/30 rounded-md px-3 py-2">
            This employee currently has no active leave types configured. Please
            contact HR or update leave types before submitting a request.
          </p>
        )}

        <SearchableSelect
          items={userLeaveTypes}
          placeholder={hasLeaveTypes ? "Select Leave Type" : "No leave types available"}
          value={form.leaveType}
          onValueChange={(e) => {
            setForm({ ...form, leaveType: e });
          }}
          disabled={!hasLeaveTypes}
        ></SearchableSelect>
      </div>

      {/* From Date and To Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            From <span className="text-red-500">*</span>
          </label>
          <DatePicker
            setDate={(e) => setForm({ ...form, startDate: e })}
            date={form.startDate}
            simpleCalendar={true}
          ></DatePicker>
        </div>
        <div className="space-y-2 col-span-2 sm:col-span-1 ">
          <label className="text-sm font-medium text-[var(--text)]">
            To <span className="text-red-500">*</span>
          </label>
          <DatePicker
            setDate={(e) => setForm({ ...form, endDate: e })}
            simpleCalendar={true}
            date={form.endDate}
          ></DatePicker>
        </div>
      </div>

      {relevantCelebrations.length > 0 && (
        <div className="mt-2 rounded-md border border-purple-500/30 bg-purple-500/5 px-3 py-2 text-xs text-[var(--text)] space-y-1">
          <p className="font-medium text-[var(--foreground)]">
            This leave overlaps with upcoming celebrations:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {relevantCelebrations.map((celebration, index) => (
              <li key={celebration._id || `${celebration.date}-${index}`}>
                <span className="font-medium">
                  {celebration.title}
                </span>
                {celebration.subtitle && (
                  <span className="text-[var(--muted-foreground)]">
                    {" "}
                    — {celebration.subtitle}
                  </span>
                )}{" "}
                {celebration.date && (
                  <>
                    {" "}
                    on{" "}
                    {new Date(celebration.date).toLocaleDateString()}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reason */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">Reason</label>
        <Textarea
          placeholder="Explain your reason for leave..."
          className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)] h-24"
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4 mt-5">
        <Button disabled={loading || !hasLeaveTypes} onClick={handleSubmit}>
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </div>
  );
}

export default CreateDialog;
