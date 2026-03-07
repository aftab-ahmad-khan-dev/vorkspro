// src/models/category/BugTypeDialog.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { categoryApi } from "@/api/category.js";

export default function BugTypeDialog({ bugType, onSuccess, onClose }) {
  const isEdit = !!bugType?._id;

  const [form, setForm] = useState({
    name: bugType?.name || "",
    description: bugType?.description || "",
    colorCode: bugType?.colorCode || "#EF4444",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await categoryApi.bugType.update(bugType._id, form);
      } else {
        await categoryApi.bugType.create(form);
      }

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
