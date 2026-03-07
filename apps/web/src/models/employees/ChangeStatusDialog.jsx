import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/DatePicker";
import React, { useState } from "react";
import { toast } from "sonner";
import Chip from "@/components/Chip";
import { apiPatch } from "@/interceptor/interceptor";

function ChangeStatusDialog({ status, employeeId, onClose }) {
  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;

  // Set default newStatus as current status
  const [newStatus, setNewStatus] = useState(status);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSubmit = async () => {
    try {
      const payload = {
        status: newStatus,
      };

      // if resigned/terminated → send date also
      if (newStatus === "resigned" || newStatus === "terminated") {
        payload.date = selectedDate;
      }

      const data = await apiPatch("employee/change-status/" + employeeId, payload);
      if (data?.isSuccess) {
        toast.success(data?.message);
        onClose();
      } else {
        toast.error(data?.message);
      }
    } catch (error) {
      toast.error(error?.message);
    }
  };

  const yesterday = new Date();

  return (
    <div>
      <p className="relative -top-6 text-sm z-50 capitalize flex gap-2 items-center">
        Current Status: <Chip status={status}></Chip>
      </p>
      <div className="space-y-4">
        <Label className="mb-2">Status</Label>

        {/* FIXED — correct Select handling */}
        <Select value={newStatus} onValueChange={setNewStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>

          <SelectContent>
            {status === "active" ? (
              <>
                <SelectItem value="resigned">Resigned</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resigned">Resigned</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>

        {/* FIXED — show date only when new status is resigned or terminated */}
        {(newStatus === "resigned" || newStatus === "terminated") && (
          <div>
            <Label className="mb-2">Date</Label>
            <DatePicker
              date={selectedDate}
              simpleCalendar={true}
              minDate={yesterday.setDate(yesterday.getDate() - 1)}
              setDate={(date) => setSelectedDate(date)}
              placeholder={`Select ${newStatus} date`}
            />
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </div>
    </div>
  );
}

export default ChangeStatusDialog;
