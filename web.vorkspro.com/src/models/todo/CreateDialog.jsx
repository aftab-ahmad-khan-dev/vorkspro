// src/models/todo/CreateDialog.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DatePicker } from "@/components/DatePicker";
import TagInput from "@/components/TagInput";
import { apiPatch, apiPost } from "@/interceptor/interceptor";

function CreateDialog({ todo, onSuccess }) {
  const isEdit = !!todo;
  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_APP_BASE_URL + "todo";

  const [loading, setLoading] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: null,        // Date object (only date part when no time)
    dueTime: "",          // "14:30" string from <input type="time">
    priority: "medium",
    category: "",
    tags: [],
    isRemainderSet: false,
    isImportant: false,
  });

  // -------------------------------------------------
  // Initialise form when editing or creating
  // -------------------------------------------------
  useEffect(() => {
    if (isEdit && todo) {
      const dueDateObj = todo.dueDate ? new Date(todo.dueDate) : null;

      setFormData({
        title: todo.title || "",
        description: todo.description || "",
        dueDate: dueDateObj,
        dueTime: todo.isTimeSet && dueDateObj
          ? `${dueDateObj.getHours().toString().padStart(2, "0")}:${dueDateObj
            .getMinutes()
            .toString()
            .padStart(2, "0")}`
          : "",
        priority: (todo.priority || "medium").toLowerCase(),
        category: todo.category || "",
        tags: todo.tags || [],
        isRemainderSet: todo.isRemainderSet || false,
        isImportant: todo.isImportant || false,
      });

      setShowTime(!!todo.isTimeSet);
    } else {
      setFormData({
        title: "",
        description: "",
        dueDate: new Date(),
        dueTime: "",
        priority: "medium",
        category: "",
        tags: [],
        isRemainderSet: false,
        isImportant: false,
      });
      setShowTime(false);
    }
  }, [isEdit, todo]);

  // -------------------------------------------------
  // Combine date + time (or just date) into one ISO string
  // -------------------------------------------------
  const buildDueDate = () => {
    if (!formData.dueDate) return null;

    const date = new Date(formData.dueDate); // date part only

    if (showTime && formData.dueTime) {
      const [hours, minutes] = formData.dueTime.split(":").map(Number);
      date.setHours(hours, minutes, 0, 0);
      return date.toISOString();               // full datetime
    }

    // No time → midnight of that day
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  };

  // -------------------------------------------------
  // Submit handler
  // -------------------------------------------------
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);

    const payload = {
      title: formData.title.trim(),
      description: formData.description,
      dueDate: buildDueDate(),
      isTimeSet: showTime,                     // <-- important flag
      priority: formData.priority,
      category: formData.category || undefined,
      tags: formData.tags.filter(Boolean),
      isRemainderSet: formData.isRemainderSet,
      isImportant: formData.isImportant,
    };

    try {
      let data = null;
      if (isEdit) {
        data = await apiPatch(`todo/update/${todo._id}`, payload);
      } else if (!isEdit) {
        data = await apiPost(`todo/create`, payload);
      }
      if (!data.isSuccess) throw new Error(data.message || "Failed");

      toast.success(isEdit ? "Task updated!" : "Task created!");
      onSuccess?.(data.todo || data.data);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------
  // Render helpers
  // -------------------------------------------------
  const subHeading = (title) => (
    <div className="col-span-2 border-b border-[var(--border)] pb-3 mb-4">
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto pr-2">
      {/* Title & Description – unchanged */}
      <div className="col-span-2 space-y-2">
        <Label>Title <span className="text-red-500">*</span></Label>
        <Input
          placeholder="Enter task title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="col-span-2 space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Add any details..."
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* ---------- Schedule ---------- */}
      {subHeading("Schedule")}

      <div className="space-y-3 col-span-2">
        <Label>Due Date</Label>
        <DatePicker
          date={formData.dueDate}
          simpleCalendar={true}
          setDate={(d) => setFormData({ ...formData, dueDate: d })}
        />
      </div>

      <div className="col-span-2 flex items-center gap-3">
        <Checkbox
          id="enable-time"
          checked={showTime}
          onCheckedChange={(c) => {
            setShowTime(c);
            if (!c) setFormData({ ...formData, dueTime: "", isRemainderSet: false, });
          }}
        />
        <Label htmlFor="enable-time" className="cursor-pointer font-normal">
          Set specific time
        </Label>
      </div>

      {showTime && (
        <div className="col-span-2 space-y-3">
          <div className="space-y-2">
            <Label>Time</Label>
            <Input
              type="time"
              value={formData.dueTime}
              onChange={(e) =>
                setFormData({ ...formData, dueTime: e.target.value })
              }
              className="w-full time-input"
            />
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="reminder"
              checked={formData.isRemainderSet}
              onCheckedChange={(c) => setFormData({ ...formData, isRemainderSet: c })}
            />
            <Label htmlFor="reminder" className="cursor-pointer font-normal">
              Set Reminder
            </Label>
          </div>
        </div>
      )
      }

      {/* ---------- Classification (unchanged) ---------- */}
      {subHeading("Classification")}
      {/* Priority & Category – unchanged (copy from your original) */}

      <div className="space-y-2 col-span-2 sm:col-span-1">
        <Label>Priority</Label>
        <Select
          value={formData.priority}
          onValueChange={(v) => setFormData({ ...formData, priority: v })}
        >
          <SelectTrigger className={'w-full'}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 col-span-2 sm:col-span-1">
        <Label>Category</Label>
        <Select
          value={formData.category}
          onValueChange={(v) => setFormData({ ...formData, category: v })}
        >
          <SelectTrigger className={'w-full'}>
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="work">Work</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags – unchanged */}
      <div className="col-span-2 space-y-2">
        <Label>Tags</Label>
        <TagInput
          value={formData.tags}
          onChange={(tags) => setFormData({ ...formData, tags })}
        />
      </div>

      {/* ---------- Options ---------- */}
      {subHeading("Options")}
      {/* Important & Reminder checkboxes – unchanged */}
      <div className="col-span-2 space-y-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="important"
            checked={formData.isImportant}
            onCheckedChange={(c) => setFormData({ ...formData, isImportant: c })}
          />
          <Label htmlFor="important" className="cursor-pointer font-normal flex items-center gap-1">
            <span className="text-yellow-500">Star</span> Mark as Important
          </Label>
        </div>
      </div>

      {/* ---------- Submit ---------- */}
      <div className="col-span-2 flex justify-end pt-6 border-t border-[var(--border)]">
        <Button onClick={handleSubmit} disabled={loading} size="lg">
          {loading ? "Saving..." : isEdit ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </div >
  );
}

export default CreateDialog;