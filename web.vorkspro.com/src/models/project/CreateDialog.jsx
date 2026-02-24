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
import TagInput from "@/components/TagInput";
import { X, Plus, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

function CreateDialog({
  clients: initialClients = [],
  employees: initialEmployees = [],
  selectedProject,
  onSuccess,
}) {
  const isEditMode = !!selectedProject;
  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_APP_BASE_URL + "project";
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState(initialClients);
  const [addingClient, setAddingClient] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    tags: [],
    description: "",
    startDate: null,
    endDate: null,
    status: "not started",
    priority: "medium",
    projectManager: "",
    teamMembers: [],
    budget: "",
    client: "",
  });

  const [dateRange, setDateRange] = useState({ from: null, to: null });

  useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);

  useEffect(() => {
    if (isEditMode && selectedProject) {
      const startDate = selectedProject.startDate ? new Date(selectedProject.startDate) : null;
      const endDate = selectedProject.endDate ? new Date(selectedProject.endDate) : null;

      setFormData({
        name: selectedProject.name || "",
        tags: selectedProject.tags || [],
        description: selectedProject.description || "",
        startDate,
        endDate,
        status: selectedProject.status || "not started",
        priority: selectedProject.priority || "medium",
        projectManager: selectedProject.projectManager?._id || "",
        teamMembers:
          selectedProject.teamMembers?.map((m) => m._id).filter(Boolean) || [],
        budget: selectedProject.budget || "",
        client: selectedProject.client?._id || "",
      });

      setDateRange({ from: startDate, to: endDate });
    }
  }, [isEditMode, selectedProject]);

  const handleSubmit = async () => {
    if (formData.startDate && formData.endDate) {
      if (formData.startDate > formData.endDate) {
        toast.error("Start date cannot be after end date");
        return;
      }
    }
    const required = [
      "name",
      "client",
      // "startDate",
      // "endDate",
      // "budget",
      // "priority",
      // "status",
    ];
    for (const field of required) {
      if (
        !formData[field] ||
        (Array.isArray(formData[field]) && formData[field].length === 0)
      ) {
        toast.error(`${field.replace(/([A-Z])/g, " $1").trim()} is required`);
        return;
      }
    }
    // if (!formData.teamMembers.length) {
    //   toast.error("At least one team member is required");
    //   return;
    // }

    if (!formData.projectManager) {
      // delete the field and don't send in payload if the field is empty
      delete formData.projectManager;
    }

    setLoading(true);
    const payload = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate.getTime() - formData.startDate.getTimezoneOffset() * 60000).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate.getTime() - formData.endDate.getTimezoneOffset() * 60000).toISOString() : null,
    };

    try {
      const url = isEditMode
        ? `${baseUrl}/update/${selectedProject._id}`
        : `${baseUrl}/create`;
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.isSuccess) {
        toast.success(isEditMode ? "Project updated!" : "Project created!");
        onSuccess?.();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (clientName) => {
    setAddingClient(true);
    try {
      const res = await fetch(import.meta.env.VITE_APP_BASE_URL + "client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: clientName, companySize: "0" }),
      });

      const data = await res.json();
      if (data.isSuccess) {
        const newClient = data.client;
        setClients([...clients, newClient]);
        setFormData({ ...formData, client: newClient._id });
        toast.success("Client added successfully!");
      } else {
        toast.error(data.message || "Failed to add client");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setAddingClient(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2 col-span-2 md:col-span-1">
        <label className="text-sm font-medium">
          Project Name <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="E-commerce Platform"
        />
      </div>

      <div className="space-y-2 col-span-2 md:col-span-1">
        <label className="text-sm font-medium">
          Client <span className="text-red-500">*</span>
        </label>
        <SearchableSelect
          placeholder="Search or select client..."
          items={clients}
          value={formData.client}
          onValueChange={(v) => setFormData({ ...formData, client: v })}
          allowAddNew={true}
          onAddNew={handleAddClient}
          addingNew={addingClient}
        />
      </div>

      <div className="col-span-2 space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Brief project description..."
          className="h-24"
        />
      </div>

      <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium">
          Project Duration
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              // variant="outline"
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
                <span>Pick project duration</span>
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
                setFormData({
                  ...formData,
                  startDate: range?.from || null,
                  endDate: range?.to || null
                });
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Budget
        </label>

        <div className="relative">
          <Input
            type="number"
            value={formData.budget}
            onChange={(e) =>
              setFormData({ ...formData, budget: e.target.value })
            }
            placeholder="12500"
            className="pr-10 no-spinner"
          />

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            $
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Priority
        </label>
        <Select
          value={formData.priority}
          onValueChange={(v) => setFormData({ ...formData, priority: v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium">Project Manager</label>
        <SearchableSelect
          placeholder="Search project manager"
          items={initialEmployees}
          value={formData.projectManager}
          onValueChange={(v) => setFormData({ ...formData, projectManager: v })}
        />
      </div>

      <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium">
          Team Members
        </label>
        <SearchableSelect
          placeholder="Search team members"
          items={initialEmployees}
          value={formData.teamMembers}
          onValueChange={(v) => setFormData({ ...formData, teamMembers: v })}
          multi
        />
        {formData.teamMembers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.teamMembers.map((id) => {
              const member = initialEmployees.find((e) => e._id === id);
              if (!member) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 py-1 pl-2 pr-1 rounded-full bg-[var(--foreground)]/5 border border-[var(--border)] hover:bg-[var(--foreground)]/10 transition"
                >
                  <div className="w-5 h-5 rounded-full bg-[var(--button)] text-white flex items-center justify-center text-[10px] font-medium">
                    {member.firstName[0]}
                  </div>
                  <span className="text-xs font-medium">
                    {member.firstName} {member.lastName.split(" ")[0]}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        teamMembers: formData.teamMembers.filter(
                          (m) => m !== id
                        ),
                      })
                    }
                    className="w-5 h-5 flex items-center justify-center hover:bg-red-100 rounded-full transition"
                  >
                    <X size={12} className="text-red-500" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium">Tags</label>
        <TagInput
          value={formData.tags}
          onChange={(tags) => setFormData({ ...formData, tags })}
        />
      </div>

      <div className="col-span-2 flex justify-end pt-4">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
              ? "Update Project"
              : "Create Project"}
        </Button>
      </div>
    </div>
  );
}

export default CreateDialog;
