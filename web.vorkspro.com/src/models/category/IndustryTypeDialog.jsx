import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; // optional – replace with your toast lib

const API = {
  base: import.meta.env.VITE_APP_BASE_URL,
  token: () => localStorage.getItem("token"),
};

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

    const url = isEdit
      ? `${API.base}industry/${industry._id}`
      : `${API.base}industry/`;

    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API.token()}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message ?? "Failed");

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
