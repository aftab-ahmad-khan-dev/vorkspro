import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/DatePicker";
import { apiPost } from "@/interceptor/interceptor";

function UpdateSalaryDialog({ currentSalary, employeeId, onSuccess }) {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const [formData, setFormData] = useState({
    employeeId,
    newSalary: "",
    date: nextMonth ?? null,
    reason: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  const token = localStorage.getItem("token");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.newSalary || !formData.date || !formData.reason) {
      toast.error("New Salary, Effective Date, and Reason are required!");
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      date: formData.date.toISOString(),
    };

    try {
      const data = await apiPost("salary-history/update-salary", payload);

      if (data?.isSuccess) {
        toast.success("Salary updated successfully!");
        onSuccess?.();
      } else {
        toast.error(data?.message || "Failed to update salary");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="border border-blue-400 dark:border-blue-600 bg-blue-100 dark:bg-blue-600/20 rounded-md p-4">
          <span className="text-blue-700 dark:text-blue-100 font-medium">
            Current Salary: PKR {currentSalary?.toLocaleString() || 0}
          </span>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
            New Salary Amount <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="e.g. 85000"
            value={formData.newSalary}
            onChange={(e) =>
              setFormData({ ...formData, newSalary: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid sm:col-span-1 col-span-2  space-y-2 ">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Effective Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              simpleCalendar={true}
              startMonthFrom={new Date().getMonth() + 1}
              date={formData.date}
              setDate={(date) => setFormData({ ...formData, date })}
              placeholder="Select effective date"
            />
          </div>

          <div className="grid sm:col-span-1 col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Reason for Update <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.reason}
              onValueChange={(value) =>
                setFormData({ ...formData, reason: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Annual Performance Review">
                  Annual Performance Review
                </SelectItem>
                <SelectItem value="Promotion">Promotion</SelectItem>
                <SelectItem value="Increment">Increment</SelectItem>
                <SelectItem value="Market Adjustment">
                  Market Adjustment
                </SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Notes (Optional)
          </label>
          <Input
            placeholder="Any additional details..."
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Updating..." : "Update Salary"}
        </Button>
      </div>
    </div>
  );
}

export default UpdateSalaryDialog;
