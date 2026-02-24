// src/models/category/DocumentDialog.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const API = {
  base: import.meta.env.VITE_APP_BASE_URL,
  token: () => localStorage.getItem("token"),
};

export default function DocumentDialog({ document, onSuccess, onClose }) {
  const isEdit = !!document?._id;

  const [form, setForm] = useState({
    name: document?.name || "",
    description: document?.description || "",
    colorCode: document?.colorCode || "#10B981",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEdit
      ? `${API.base}document-type/update/${document._id}`
      : `${API.base}document-type/create`;

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
      if (!res.ok) throw new Error(data.message || "Failed");

      toast.success(isEdit ? "Updated" : "Created");
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
        />
      </div>

      <div>
        <label className="text-sm font-medium">Color</label>
        <Input
          type="color"
          value={form.colorCode}
          onChange={(e) =>
            setForm((p) => ({ ...p, colorCode: e.target.value }))
          }
        />
      </div>

      <div className="flex justify-end gap-3">

        <Button type="submit">{isEdit ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
