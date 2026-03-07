import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { categoryApi } from "@/api/category.js";

export default function IndustryDialog({ industry, onSuccess, onClose }) {
  const isEdit = !!industry?._id;
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    colorCode: "#3B82F6",
    employee: "",
    head: "",
    ...(industry ?? {}),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await categoryApi.industry.update(industry._id, form);
      } else {
        await categoryApi.industry.create(form);
      }

      toast.success(isEdit ? "Industry updated" : "Industry created");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--text)]">
          Industry Name
        </label>
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g., Engineering"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--text)]">
          Description
        </label>
        <Textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Short description..."
          className="h-24"
        />
      </div>

      {/* Color */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--text)]">Color</label>
        <Input
          type="color"
          name="colorCode"
          value={form.colorCode}
          onChange={handleChange}
        />
      </div>

      {/* Optional: Head, Employee, etc. (uncomment if needed) */}
      {/* <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--text)]">Head (ID)</label>
        <Input name="head" value={form.head} onChange={handleChange} />
      </div> */}

      <div className="flex justify-end gap-3 pt-3">

        <Button type="submit">{isEdit ? "Update" : "Add"} Industry</Button>
      </div>
    </form>
  );
}
