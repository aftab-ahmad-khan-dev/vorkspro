// src/models/category/ExpenseDialog.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { categoryApi } from "@/api/category.js";

export default function ExpenseDialog({ transaction, type = "expense", onSuccess, onClose }) {
  const isEdit = !!transaction?._id;

  const [form, setForm] = useState({
    name: transaction?.name || "",
    description: transaction?.description || "",
    type,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await categoryApi.transactionType.update(transaction._id, form);
      } else {
        await categoryApi.transactionType.create(form);
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
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-3">

        <Button type="submit">{isEdit ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}