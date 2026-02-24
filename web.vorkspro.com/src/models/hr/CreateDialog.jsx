import React, { useEffect, useState } from "react";
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

function CreateDialog({ employees, leaveTypes, onclose }) {
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

  useEffect(() => {
    if (!userLeaveAllocation) return;

    const leaveTypes = userLeaveAllocation.map((l) => l.leaveType);

    setUserLeaveTypes(leaveTypes);
  }, [userLeaveAllocation]);

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

        <SearchableSelect
          items={userLeaveTypes}
          placeholder="Select Leave Type"
          value={form.leaveType}
          onValueChange={(e) => {
            setForm({ ...form, leaveType: e });
          }}
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
        <Button disabled={loading} onClick={handleSubmit}>
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </div>
  );
}

export default CreateDialog;
