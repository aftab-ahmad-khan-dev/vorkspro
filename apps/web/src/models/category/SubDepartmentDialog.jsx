// src/models/category/SubDepartmentDialog.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { categoryApi } from "@/api/category.js";

export default function SubDepartmentDialog({
  subDepartment,
  onSuccess,
  onClose,
}) {
  const isEdit = !!subDepartment?._id;

  const [form, setForm] = useState({
    name: subDepartment?.name || "",
    description: subDepartment?.description || "",
    department: subDepartment?.department?._id || "",
    isActive: true,
  });

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await categoryApi.department.getByFilter({});
        setDepartments(data.filteredData?.departments || []);
      } catch {}
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await categoryApi.subDepartment.update(subDepartment._id, form);
      } else {
        await categoryApi.subDepartment.create(form);
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
        <label className="text-sm font-medium">Parent Department</label>
        <Select
          value={form.department}
          onValueChange={(v) => setForm((p) => ({ ...p, department: v }))} // ✅ store just ID
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select parent" />
          </SelectTrigger>

          <SelectContent>
            {departments
              .filter((d) => d.isActive) // ✅ filter first
              .map((d) => (
                <SelectItem key={d._id} value={d._id}>
                  {d.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Name</label>
        <Input
          name="name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          name="description"
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit">{isEdit ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
