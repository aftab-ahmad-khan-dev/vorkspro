import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import dayjs from "dayjs";
import SearchableSelect from "@/components/SearchableSelect";
import { apiGet, apiPatch, apiPost } from "@/interceptor/interceptor";

function CreateDialog({ employees, onClose, currentDate, selectedAttendance }) {
  const [isEdit, setIsEdit] = useState(!!selectedAttendance?._id);
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState([]);

  const [form, setForm] = useState({
    employee: selectedAttendance?.employee?._id || "",
    status: selectedAttendance?.status || "present",
    checkIn: selectedAttendance?.checkInTime
      ? dayjs(selectedAttendance.checkInTime).format("HH:mm")
      : "10:00",
    checkOut: selectedAttendance?.checkOutTime
      ? dayjs(selectedAttendance.checkOutTime).format("HH:mm")
      : "19:00",
    date: (currentDate || dayjs()).toDate().toISOString().split("T")[0],
    leaveType: selectedAttendance?.leaveType || "",
    notes: selectedAttendance?.notes || "",
  });

  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;

  // Combine date + time and keep local time (no UTC shift)
  function mergeDateTimeLocal(dateString, timeString) {
    const [hours, minutes] = timeString.split(":");
    return dayjs(dateString)
      .hour(Number(hours))
      .minute(Number(minutes))
      .second(0)
      .millisecond(0)
      .toISOString();
  }

  async function fetchLeaves() {
    try {
      const data = await apiGet(`leave-type/get-by-id/${form.employee}`);
      setLeaves(data?.leaves || []);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.employee) return toast.error("Please choose an employee!");
    if (!form.status) return toast.error("Please choose attendance status!");
    if (!form.checkIn) return toast.error("Please choose check-in time!");
    if (!form.checkOut) return toast.error("Please choose check-out time!");
    if (form.status === "on-leave" && !form.leaveType) {
      return toast.error("Please choose leave type!");
    }

    const checkInTime =
      form.status === "absent" || form.status === "on-leave"
        ? null
        : mergeDateTimeLocal(form.date, form.checkIn);
    const checkOutTime =
      form.status === "absent" || form.status === "on-leave"
        ? null
        : mergeDateTimeLocal(form.date, form.checkOut);

    const payload = {
      employee: form.employee,
      status: form.status,
      checkInTime,
      checkOutTime,
      date: form.date,
      notes: form.notes,
      leaveType: form.status === "on-leave" ? form.leaveType : null,
    };

    try {
      setLoading(true);
      const data = await apiPost("attendance/mark", payload);
      if (data.isSuccess) {
        toast.success("Attendance created successfully!");
        setForm({
          employee: "",
          status: "present",
          checkIn: "10:00",
          checkOut: "19:00",
          notes: "",
          date: dayjs().format("YYYY-MM-DD"),
          leaveType: "",
        });
        onClose();
      } else {
        toast.error(data.message || "Failed to create attendance!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();

    try {
      const payload = {
        checkInTime: mergeDateTimeLocal(form.date, form.checkIn),
        checkOutTime: mergeDateTimeLocal(form.date, form.checkOut),
      };

      const data = await apiPatch(
        `attendance/update/${selectedAttendance._id}`,
        payload
      );
      if (data.isSuccess) {
        toast.success("Attendance updated successfully!");
        onClose();
      } else {
        toast.error(data.message || "Failed to update attendance!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  }

  useEffect(() => {
    if (form.status === "on-leave" && form.employee) {
      fetchLeaves();
    }
  }, [form.status, form.employee]);

  return (
    <div className="space-y-4">
      {!isEdit && (
        <>
          {" "}
          <div>
            {" "}
            <label className="block text-sm font-medium text-[var(--text)] py-2">
              Choose Employee <span className="text-red-500">*</span>{" "}
            </label>
            <SearchableSelect
              value={form.employee}
              placeholder={"Search employee"}
              onValueChange={(value) => setForm({ ...form, employee: value })}
              items={employees}
            />{" "}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] py-2">
              Attendance Status <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.status}
              onValueChange={(value) => setForm({ ...form, status: value })}
            >
              <SelectTrigger className="w-full border border-[var(--border)]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                {/* <SelectItem value="late-arrival">Late Arrival</SelectItem> */}
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {form.status === "on-leave" && (
        <div>
          <label className="block text-sm font-medium text-[var(--text)] py-2">
            Select Leave <span className="text-red-500">*</span>
          </label>
          <Select
            value={form?.leaveType}
            onValueChange={(value) => setForm({ ...form, leaveType: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select leave" />
            </SelectTrigger>
            <SelectContent>
              {leaves?.map((leave) => (
                <SelectItem
                  key={leave?.leaveType?._id}
                  value={leave?.leaveType?._id}
                >
                  {leave?.leaveType?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div
        className={`grid grid-cols-2 ${form.status === "absent" && "hidden"} ${
          form.status === "on-leave" && "hidden"
        } flex gap-4`}
      >
        <div className="flex-1 col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-[var(--text)] py-2">
            Check In Time <span className="text-red-500">*</span>
          </label>
          <Input
            type="time"
            className="time-input"
            step="300"
            disabled={form.status === "on-leave" || form.status === "absent"}
            value={form.checkIn}
            onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
          />
        </div>

        <div className="flex-1 col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-[var(--text)] py-2">
            Check Out Time <span className="text-red-500">*</span>
          </label>
          <Input
            type="time"
            className="time-input"
            step="300"
            disabled={form.status === "on-leave" || form.status === "absent"}
            value={form.checkOut}
            onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
          />
        </div>
      </div>

      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-[var(--text)] py-2">
            Notes (Optional)
          </label>
          <Input
            placeholder="Notes (Optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
      )}

      <div className="flex justify-end py-2">
        <Button
          disabled={loading}
          onClick={!isEdit ? handleSubmit : handleUpdate}
        >
          {loading ? "Saving..." : "Mark Attendance"}
        </Button>
      </div>
    </div>
  );
}

export default CreateDialog;
