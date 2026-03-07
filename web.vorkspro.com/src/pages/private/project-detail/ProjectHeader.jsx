// src/components/project/ProjectHeader.jsx
import { useEffect, useState } from "react";
import { ArrowLeft, Edit, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProjectStatsGrid from "./ProjectStatsGrid";
import { toast } from "sonner";

export default function ProjectHeader({ project, onBack, clients, employees, onEditProject, refresh, onNavigateToTab }) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  const token = localStorage.getItem("token");
  const [localProject, setLocalProject] = useState(project);

  const get = (val, fallback = "N/A") => (val && val !== "" ? val : fallback);

  const capitalize = (str) =>
    str
      ? str.charAt(0).toUpperCase() + str.slice(1).replace("-", " ")
      : "";

  const statusColor =
    localProject.status === "in progress"
      ? "bg-blue-500/20 text-blue-500"
      : localProject.status === "completed"
        ? "bg-green-500/20 text-green-500"
        : localProject.status === "on hold"
          ? "bg-orange-500/20 text-orange-500"
          : localProject.status === "cancelled"
            ? "bg-red-500/20 text-red-500"
            : "bg-gray-500/20 text-gray-500";


  const priorityColor =
    project.priority === "high"
      ? "bg-red-500/20 text-red-500"
      : project.priority === "medium"
        ? "bg-yellow-600/20 text-yellow-600"
        : "bg-green-500/20 text-green-500";

  const handleSave = async () => {
    if (!selectedStatus) return;

    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}project/change-status/${project._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: selectedStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      setLocalProject(prev => ({
        ...prev,
        status: selectedStatus,
      }));

      toast.success("Project status updated");
      setOpen(false);

      // optional – parent refresh
      if (refresh) refresh();
      // const data = await res.json();

      // // Optimistically update the project prop (assuming parent passes setProject or similar)
      // // If project is immutable, you might need a callback prop like onProjectUpdate
      // if (data.data?.project) {
      //   if (refresh) {
      //     refresh();
      //   }
      // }

      // setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Error updating status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  return (
    <div id="driver-project-header" className="mb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4 w-full">
          <Button
            className="border-button flex items-center gap-2"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          <div>
            <h1 className="text-2xl text-[var(--foreground)] font-bold">
              Project Details
            </h1>
            <p className="text-muted-foreground">
              Timeline, team, cost, and progress
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button className='border-button' onClick={onEditProject}>
            <Edit className="w-4 h-4 mr-" /> Edit Project
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Target className="w-4 h-4 mr-2" /> Change Status
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-foreground">Change Project Status</DialogTitle>
                <DialogDescription>
                  Select a new status for the project "{get(project.name)}".
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="status" className="text-foreground">Status</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className={'w-full text-foreground'}>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="not started">Not Started</SelectItem>
                        <SelectItem value="in progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSave}
                  disabled={!selectedStatus || loading}
                >
                  {loading ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-6 p-8 border border-[var(--border)] rounded-2xl bg-gradient-to-br from-background to-muted/5">
        <div className="px-3">
          <h2 className="text-3xl text-[var(--foreground)] font-bold">
            {get(project.name)}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            {get(project.description, "No description provided.")}
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <span
              className={`px-4 py-2 rounded-full capitalize text-sm font-medium ${statusColor}`}
            >
              {capitalize(get(project.status))}
            </span>
            <span
              className={`px-4 py-2 rounded-full text-sm capitalize font-medium ${priorityColor}`}
            >
              {get(project.priority)} Priority
            </span>
          </div>
        </div>
        <ProjectStatsGrid project={project} onNavigateToTab={onNavigateToTab} />
      </div>
    </div>
  );
}