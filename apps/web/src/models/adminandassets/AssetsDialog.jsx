// components/assets/CreateAssetDialog.jsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/DatePicker";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { apiPatch, apiPost } from "@/interceptor/interceptor";

export default function CreateAssetDialog({
  employees = [],
  departments = [],
  asset = null, // ← Now supports edit mode
  onSuccess,
  onCancel,
}) {
  const isEditMode = !!asset;

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    assetName: "",
    assetType: "",
    serialNumber: "",
    value: "",
    purchaseDate: null,
    warrantyUntil: null,
    assignedTo: "",
    department: "",
    // status: "",
    notes: "",
  });

  const baseUrl = `${import.meta.env.VITE_APP_BASE_URL}admin-and-assets`;
  const token = localStorage.getItem("token");

  // Initialize form when editing
  useEffect(() => {
    if (isEditMode && asset) {
      setFormData({
        assetName: asset.assetName || "",
        assetType: asset.assetType || "",
        serialNumber: asset.serialNumber || "",
        value: asset.value || "",
        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : null,
        warrantyUntil: asset.warrantyUntil ? new Date(asset.warrantyUntil) : null,
        assignedTo: asset.assignedTo?._id || asset.assignedTo || "",
        department: asset.department?._id || asset.department || "",
        // status: asset.status || "",
        notes: asset.notes || "",
      });
    } else {
      // Reset for create mode
      setFormData({
        assetName: "",
        assetType: "",
        serialNumber: "",
        value: "",
        purchaseDate: null,
        warrantyUntil: null,
        assignedTo: "",
        department: "",
        status: "",
        notes: "",
      });
    }
  }, [asset, isEditMode]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-select department when employee is selected
  const handleEmployeeSelect = (employeeId) => {
    handleChange("assignedTo", employeeId);

    if (!employeeId) {
      handleChange("department", "");
      return;
    }

    const selectedEmp = employees.find((emp) => emp._id === employeeId);
    if (!selectedEmp) return;

    const deptId = selectedEmp.department?._id || selectedEmp.department;
    if (deptId) {
      handleChange("department", deptId);
    }
  };

  const validateForm = () => {
    const required = ["assetName", "assetType", "value", "purchaseDate"];
    const missing = required.filter((field) => !formData[field]);

    if (missing.length > 0) {
      toast.error("Please fill all required fields");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      ...formData,
      purchaseDate: formData.purchaseDate?.toISOString() || "",
      warrantyUntil: formData.warrantyUntil?.toISOString() || "",
      value: Number(formData.value),
      assignedTo: formData.assignedTo || undefined,
      department: formData.department || undefined,
    };
    try {
      setLoading(true);
      let data = null;
      if (isEditMode) {
        data = await apiPatch(`admin-and-assets/update/${asset._id}`, payload);
      } else if (!isEditMode) {
        data = await apiPost(`admin-and-assets/create`, payload);
      }

      if (data.isSuccess) {
        toast.success(
          isEditMode ? "Asset updated successfully!" : "Asset added successfully!"
        );
        onSuccess?.();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        {subHeading("Asset Details")}

        {/* Asset Name */}
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Asset Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. MacBook Pro 16-inch"
            value={formData.assetName}
            onChange={(e) => handleChange("assetName", e.target.value)}
          />
        </div>

        {/* Asset Type */}
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Asset Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData?.assetType}
            onValueChange={(value) => handleChange("assetType", value)}
          >
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mobile devices">Mobile Devices</SelectItem>
              <SelectItem value="software license">Software License</SelectItem>
              <SelectItem value="hardware">Hardware</SelectItem>
              <SelectItem value="accessory">Accessory</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Serial Number */}
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Serial Number
          </label>
          <Input
            placeholder="e.g. C02Z1234ABCD"
            value={formData.serialNumber}
            onChange={(e) => handleChange("serialNumber", e.target.value)}
          />
        </div>

        {/* Value */}
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Value (PKR) <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <Input
              type="number"
              placeholder="2499"
              value={formData.value}
              onChange={(e) => handleChange("value", e.target.value)}
              className="pr-14 no-spinner"
            />

            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              PKR
            </span>
          </div>
        </div>

        {/* Purchase Date */}
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Purchase Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            date={formData.purchaseDate}
            setDate={(date) => handleChange("purchaseDate", date)}
            placeholder="Select purchase date"
            maxDate={new Date()}
          />
        </div>

        {/* Warranty Until */}
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Warranty Until
          </label>
          <DatePicker
            date={formData.warrantyUntil}
            setDate={(date) => handleChange("warrantyUntil", date)}
            placeholder="Select warranty end date"
            minDate={formData.purchaseDate || undefined}
          />
        </div>

        {/* Assigned To */}
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Assign To
          </label>
          <Select
            value={formData.assignedTo}
            onValueChange={handleEmployeeSelect}
          >
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {/* <SelectItem value="">Unassigned</SelectItem> */}
              {employees.map((emp) => (
                <SelectItem key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department */}
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Department
          </label>
          <Select
            value={formData.department}
            onValueChange={(value) =>
              handleChange("department", value === "none" ? "" : value)
            }
          >
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {departments
                .filter((d) => d.isActive !== false)
                .map((dept) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* status */}
        {/* <div className="flex flex-col space-y-2 col-span-2">
          <label className="text-sm font-medium text-[var(--text)]">Status</label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              handleChange("status", value === "none" ? "" : value)
            }
          >
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        {/* Notes */}
        <div className="col-span-2 flex flex-col space-y-2">
          <label className="text-sm font-medium text-[var(--text)]">Notes</label>
          <Textarea
            placeholder="Any additional information..."
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="min-h-24"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">

        <Button
          onClick={handleSubmit}
          className="bg-[var(--button)] text-white"
          disabled={loading}
        >
          {loading
            ? isEditMode
              ? "Updating..."
              : "Adding..."
            : isEditMode
              ? "Update Asset"
              : "Add Asset"}
        </Button>
      </div>
    </div>
  );
}