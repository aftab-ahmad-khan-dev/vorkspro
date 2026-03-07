import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import SearchableSelect from "@/components/SearchableSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { milestoneApi } from "@/api/milestone.js";

export default function AddMilestoneDialog({ milestone, projects, onSuccess, selectedProjectId, onMilestoneCountChange }) {
  const isEdit = !!milestone;
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    project: milestone?.project?._id || "",
    startDate: null,
    endDate: null,
    description: "",
    task: "",
    // dependencies: milestone?.dependencies || "", // Single dependency as string
    notes: "",
    cost: "",
    status: "not started",
  });

  const [dependency, setDependency] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [existingMilestoneDates, setExistingMilestoneDates] = useState([]);

  const fetchDependencies = async () => {
    if (!form.project) return;
    try {
      const data = await milestoneApi.getByProject(form.project);
      const milestones = data.milestones || [];
      setDependency(milestones);
      
      // Update milestone count for dialog heading
      if (!isEdit && onMilestoneCountChange) {
        onMilestoneCountChange(milestones.length);
      }
      
      // Store existing milestone dates for calendar styling
      const existingDates = [];
      milestones.forEach(m => {
        if (m.startDate && m.endDate) {
          const start = new Date(m.startDate);
          const end = new Date(m.endDate);
          const current = new Date(start);
          
          while (current <= end) {
            existingDates.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
        }
      });
      setExistingMilestoneDates(existingDates);
      
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, [form.project]);

  // Patch milestone data when editing
  useEffect(() => {
    if (!milestone) {
      setForm({
        name: "",
        project: "",
        startDate: null,
        endDate: null,
        description: "",
        task: "",
        // dependencies: "",
        notes: "",
        cost: "",
        status: "not started",
      });
      return;
    }

    const projectId =
      milestone.project?._id ||
      (typeof milestone.project === "string" ? milestone.project : "");

    const startDate = milestone.startDate ? new Date(milestone.startDate) : null;
    const endDate = milestone.endDate ? new Date(milestone.endDate) : null;

    // console.log('Milestone dependencies:', milestone.dependencies);
    // console.log('Setting form dependencies to:', milestone.dependencies || "");

    setForm({
      name: milestone.name || "",
      project: projectId,
      startDate,
      endDate,
      description: milestone.description || "",
      task: Array.isArray(milestone.tasks) ? milestone.tasks.join(", ") : "",
      // dependencies: milestone.dependencies || "",
      notes: milestone.notes || "",
      cost: milestone.cost?.toString() || "",
      status: milestone.status || "not started",
    });

    setDateRange({ from: startDate, to: endDate });
  }, [milestone]);

  useEffect(() => {
    if (!isEdit && selectedProjectId) {
      setForm((prev) => ({ ...prev, project: selectedProjectId }));
    }
  }, [selectedProjectId]);


  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!form.name || !form.project || !form.startDate || !form.endDate) {
      return toast.error(
        "Name, Project, Start Date and End Date are required!"
      );
    }

    const payload = {
      ...form,
      project: form.project,
      startDate: form.startDate.toISOString(),
      endDate: form.endDate.toISOString(),
      cost: form.cost ? Number(form.cost) : undefined,
      tasks: form.task
        ? form.task
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        : undefined,
      // dependencies: form.dependencies || null,
    };

    try {
      setLoading(true);
      const json = isEdit
        ? await milestoneApi.update(milestone._id, payload)
        : await milestoneApi.create(payload);
      if (!json.isSuccess) throw new Error(json.message || "Operation failed");

      toast.success(isEdit ? "Milestone updated!" : "Milestone created!");
      setLoading(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
      {/* Name */}
      <div className="space-y-2 col-span-2 sm:col-span-1">
        <label className="text-sm font-medium">
          Name <span className="text-red-500">*</span>
        </label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Design Phase"
        />
      </div>

      {/* Project */}
      <div className="space-y-2 col-span-2 sm:col-span-1">
        <label className="text-sm font-medium">
          Project <span className="text-red-500">*</span>
        </label>
        <Select
          value={form.project || selectedProjectId}
          onValueChange={(v) =>
            setForm({ ...form, project: v })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects?.map((p) => (
              <SelectItem key={p._id} value={p._id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium">
          Milestone Duration <span className="text-red-500">*</span>
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="border-button justify-start px-2.5 font-normal w-full"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick milestone duration</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range) => {
                setDateRange(range);
                setForm({
                  ...form,
                  startDate: range?.from || null,
                  endDate: range?.to || null
                });
              }}
              numberOfMonths={2}
              modifiers={{
                existingMilestone: existingMilestoneDates
              }}
              modifiersStyles={{
                existingMilestone: {
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  opacity: 0.5,
                  color: 'rgba(0, 0, 0, 0.4)'
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Status */}
      {/* {isEdit && (
        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={form.status}
            onValueChange={(v) => setForm({ ...form, status: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not started">Not Started</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )} */}

      {/* cost */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Cost</label>

        <div className="relative">
          <Input
            type="number"
            value={form.cost}
            onChange={(e) =>
              setForm({ ...form, cost: e.target.value })
            }
            placeholder="50000"
            className="pr-10 no-spinner"
          />

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            $
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          placeholder="Brief description of the milestone..."
        />
      </div>

      {/* Dependencies (Simple Select) */}
      {/* <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium">Dependency</label>
        <Select
          value={form.dependencies}
          onValueChange={(val) => {
            setForm((prev) => ({
              ...prev,
              dependencies: val,
            }));
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select dependency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem >None</SelectItem>
            {dependency.map((dep) => (
              <SelectItem key={dep._id} value={dep._id}>
                {dep.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div> */}

      {/* Notes */}
      <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium">Notes</label>
        <Input
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Any additional notes..."
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 col-span-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button disabled={loading} type="submit">
          {isEdit && loading
            ? "Updating Milestone..."
            : loading
              ? "Creating Milestone..."
              : isEdit
                ? "Update Milestone"
                : "Create Milestone"}{" "}
        </Button>
      </div>
    </form>
  );
}
