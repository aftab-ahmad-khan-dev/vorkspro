import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  Users,
  XCircle,
  DollarSign,
  Building,
  Target,
  NotebookTabs,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

import { useNavigate, useParams } from "react-router-dom";
import StatCard from "@/components/Stats";
import Chip from "@/components/Chip";
import { useTabs } from "@/context/TabsContext";
import EmptyState from "@/components/EmptyState";

function MilestoneDetail() {
  const { id: milestoneId } = useParams();
  const navigate = useNavigate();

  const [milestone, setMilestone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const { actions } = useTabs();
  const isSuperAdmin = actions?.isSuperAdmin ?? false;

  const hasDetailTabsPermission = (moduleName, requiredTabs) => {
    if (isSuperAdmin) return true;

    return actions?.modulePermissions?.some((modules) => {
      const currentModule = modules.module == moduleName;
      if (currentModule == true) {
        return modules.detailTabs.includes(requiredTabs);
      }
    });
  };

  const detailTabsCount = [
    hasDetailTabsPermission("Milestones", "Team Members"),
    hasDetailTabsPermission("Milestones", "Notes"),
  ].filter(Boolean).length;

  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  const token = localStorage.getItem("token");

  // Milestone status options (adjust if your backend enum differs)
  const milestoneStatusOptions = [
    { value: "not started", label: "Not Started" },
    { value: "in progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "delayed", label: "Delayed" },
  ];

  // Fetch milestone details
  const fetchMilestone = async () => {
    if (!milestoneId) return;

    try {
      const res = await fetch(`${baseUrl}milestone/get-by-id/${milestoneId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.isSuccess && data.milestone) {
        setMilestone(data.milestone);
      } else {
        console.error("Failed to load milestone:", data.message);
      }
    } catch (err) {
      console.error("Error fetching milestone:", err);
    }
  };

  useEffect(() => {
    const loadMilestone = async () => {
      setLoading(true);
      await fetchMilestone();
      setLoading(false);
    };

    loadMilestone();
  }, [milestoneId]);

  const availableTabs = [];

  useEffect(() => {
    actions?.modulePermissions?.forEach((modules) => {
      if (modules.module == "Milestones") {
        // DetailTabsLength = modules.detailTabs.length

        // Build available tabs array based on permissions
        if (modules.detailTabs.includes("Team Members")) {
          availableTabs.push("assignees");
        }
        if (modules.detailTabs.includes("Notes")) {
          availableTabs.push("notes");
        }
        // Set first available tab as default if not already set
        if (availableTabs.length > 0 && !activeTab) {
          setActiveTab(availableTabs[0]);
        }
      }
    });
  }, [actions?.modulePermissions, activeTab]);

  // Handle status change
  const handleStatusChange = async () => {
    if (!selectedStatus || selectedStatus === milestone?.status) return;

    setSavingStatus(true);

    try {
      const res = await fetch(`${baseUrl}milestone/change-status/${milestoneId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const data = await res.json();

      if (data.isSuccess) {
        // Update local state instantly
        setMilestone((prev) => ({ ...prev, status: selectedStatus }));
        setDialogOpen(false);
        setSelectedStatus("");
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("An error occurred while updating the status. Please try again.");
    } finally {
      setSavingStatus(false);
    }
  };

  // Helper: Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className='min-h-screen space-y-8 animate-pulse p-6'>
        <div className='flex justify-between items-start'>
          <div className='space-y-3'>
            <div className='h-10 w-32 bg-[var(--border)] rounded'></div>
            <div className='h-6 w-48 bg-[var(--border)] rounded'></div>
          </div>
        </div>

        <div className='p-8 border border-[var(--border)] rounded-2xl space-y-6'>
          <div className='flex gap-6'>
            <div className='w-16 h-16 rounded-full bg-[var(--border)]'></div>
            <div className='space-y-4 flex-1'>
              <div className='h-8 w-80 bg-[var(--border)] rounded'></div>
              <div className='h-5 w-64 bg-[var(--border)] rounded'></div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-20 bg-[var(--border)] rounded-lg'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (!milestone) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-xl text-muted-foreground'>Milestone not found.</p>
      </div>
    );
  }

  const project = milestone.project || {};

  return (
    <div className='min-h-screen w-full pb-8 bg-[var(--background)] text-[var(--foreground)]'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8'>
        {/* Header */}
        <div className='relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-sm px-4 py-4 sm:px-6 sm:py-5 shadow-md shadow-[var(--primary)]/5'>
          <div className='pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[var(--primary)]/12 to-transparent' />
          <div className='relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-start gap-3 sm:gap-4'>
              <Button
                variant='outline'
                className='border-button shrink-0'
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back
              </Button>

              <div>
                <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>
                  Milestone details
                </h1>
                <p className='text-sm text-[var(--muted-foreground)] mt-1'>
                  Overview, status, and team for this milestone.
                </p>
                <div className='mt-3 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-[var(--muted-foreground)]'>
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-[var(--muted)]/40 px-3 py-1'>
                    <Calendar className='w-3.5 h-3.5' />
                    {formatDate(milestone.startDate)} – {formatDate(milestone.endDate)}
                  </span>
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-[var(--muted)]/40 px-3 py-1'>
                    <Flag className='w-3.5 h-3.5' />
                    {project.name || "Unassigned project"}
                  </span>
                </div>
              </div>
            </div>

            {/* Change Status Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className='shrink-0'>
                  <Target className='w-4 h-4 mr-2' />
                  Change status
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle className='text-foreground'>
                    Change milestone status
                  </DialogTitle>
                  <DialogDescription>
                    Update the status for <strong>{milestone.name}</strong>.
                  </DialogDescription>
                </DialogHeader>

                <div className='grid gap-4 py-4'>
                  <Label className='text-foreground' htmlFor='status'>
                    Status
                  </Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className='w-full text-foreground'>
                      <SelectValue placeholder='Select new status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {milestoneStatusOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            disabled={option.value === milestone.status}
                          >
                            {option.label}
                            {option.value === milestone.status && " (Current)"}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button
                    onClick={handleStatusChange}
                    disabled={
                      !selectedStatus ||
                      savingStatus ||
                      selectedStatus === milestone.status
                    }
                  >
                    {savingStatus ? "Saving..." : "Save changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Content Card */}
        <div className='space-y-8'>
          <div className='border border-border rounded-2xl overflow-hidden'>
            <div className='p-8 bg-background'>
              <div className='flex items-start flex-col sm:flex-row gap-6'>
                <div className='w-16 h-16 rounded-full bg-border flex items-center justify-center shrink-0'>
                  <Flag className='w-8 h-8 text-foreground' />
                </div>

                <div className='flex-1'>
                  <h2 className='text-2xl font-bold text-foreground'>
                    {milestone.name}
                  </h2>
                  <p className='text-muted-foreground mt-1'>
                    {project.name || "No Project Assigned"}
                  </p>

                  <div className='flex flex-wrap items-center gap-3 mt-4'>
                    <Chip status={milestone.status} />

                    {milestone.cost > 0 && actions.cost && (
                      <span className='px-4 py-2 border border-border rounded-full text-sm flex text-foreground items-center gap-2'>
                        <DollarSign className='w-4 h-4' />
                        {milestone.cost.toLocaleString()}
                      </span>
                    )}

                    <span className='px-4 py-2 border border-border rounded-full text-foreground text-sm flex items-center gap-2'>
                      <Users className='w-4 h-4' />
                      {project.teamMembers?.length || 0} Team Member
                      {project.teamMembers?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Meta Information */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-sm'>
                <div className='flex items-center gap-3'>
                  <Calendar className='w-5 h-5 text-muted-foreground' />
                  <div>
                    <p className='text-muted-foreground'>Start Date</p>
                    <p className='font-medium text-foreground'>
                      {formatDate(milestone.startDate)}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <Calendar className='w-5 h-5 text-muted-foreground' />
                  <div>
                    <p className='text-muted-foreground'>Due Date</p>
                    <p className='font-medium text-foreground'>
                      {formatDate(milestone.endDate)}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <Building className='w-5 h-5 text-muted-foreground' />
                  <div>
                    <p className='text-muted-foreground'>Client</p>
                    <p className='font-medium text-foreground'>
                      {project.client?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {milestone.description?.trim() && (
                <div className='mt-8'>
                  <p className='text-muted-foreground text-sm'>Description</p>
                  <p className='mt-2 text-foreground'>{milestone.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            {/* Tabs for sm and above */}
            {detailTabsCount > 1 && (
              <TabsList className='hidden sm:grid w-full grid-cols-2 rounded-2xl bg-border mb-4'>
                {hasDetailTabsPermission("Milestones", "Team Members") && (
                  <TabsTrigger value='assignees'>Team Members</TabsTrigger>
                )}
                {/* <TabsTrigger value="progress">Progress</TabsTrigger> */}
                {hasDetailTabsPermission("Milestones", "Notes") && (
                  <TabsTrigger value='notes'>Notes</TabsTrigger>
                )}
              </TabsList>
            )}

            {detailTabsCount > 1 && (
              <div className='sm:hidden mb-3'>
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className='w-full border text-foreground rounded-lg px-3 py-2 text-sm'>
                    <SelectValue placeholder='Select view' />
                  </SelectTrigger>

                  <SelectContent>
                    {hasDetailTabsPermission("Milestones", "Team Members") && (
                      <SelectItem value='assignees'>Team Members</SelectItem>
                    )}
                    {/* <TabsTrigger value="progress">Progress</TabsTrigger> */}
                    {hasDetailTabsPermission("Milestones", "Notes") && (
                      <SelectItem value='notes'>Notes</SelectItem>
                    )}
                    {/* <SelectItem value="progress">Progress</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
            )}

            <TabsContent value='assignees' className='mt-6'>
              <div className='border border-border rounded-2xl p-6'>
                <h3 className='text-lg text-foreground font-semibold mb-6'>
                  Project Team ({project.teamMembers?.length || 0})
                </h3>

                {!project.teamMembers || project.teamMembers.length === 0 ? (
                  <div className='text-center py-12'>
                    {/* <Users className="mx-auto w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No team members assigned</p> */}
                    <EmptyState
                      icon={Users}
                      title='No team members'
                      subtitle='Invite your first team member to get started'
                    ></EmptyState>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {project.teamMembers.map((member) => {
                      const initials =
                        `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase();
                      const isManager = member._id === project.projectManager?._id;

                      return (
                        <div
                          key={member._id}
                          onClick={() =>
                            navigate(`/app/employees/employee-detail/${member._id}`)
                          }
                          className='flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition cursor-pointer'
                        >
                          <div className='w-12 bg-border h-12 rounded-full flex items-center justify-center text-sm font-medium'>
                            {initials || "NA"}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='font-medium text-foreground truncate'>
                              {member.firstName} {member.lastName}
                              {isManager && (
                                <span className='ml-2 text-xs text-blue-600'>
                                  (Manager)
                                </span>
                              )}
                            </p>
                            <p className='text-sm text-muted-foreground truncate'>
                              {member.email}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* <TabsContent value="progress" className="mt-6">
              <div className="border border-border rounded-2xl p-6">
                <h3 className="text-lg text-foreground font-semibold mb-6">Milestone Progress</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <StatCard
                    title="Tasks Completed"
                    value={`${milestone.tasks?.filter((t) => t.completed)?.length || 0} / ${milestone.tasks?.length || 0}`}
                    valueClass="text-foreground"
                  />
                  <StatCard
                    title="Budget"
                    value={milestone.budget?.toLocaleString() || "0"}
                    prefix="PKR "
                    valueClass="text-foreground"
                  />
                  <StatCard
                    title="Duration"
                    value={`${Math.ceil(
                      (new Date(milestone.endDate) - new Date(milestone.startDate)) /
                      (1000 * 60 * 60 * 24)
                    )} days`}
                    valueClass="text-blue-600"
                  />
                </div>

                {milestone.tasks && milestone.tasks.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Task List</h4>
                    {milestone.tasks.map((task, idx) => (
                      <div key={idx} className="flex items-center gap-4 text-sm">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.completed
                            ? "border-green-600 bg-green-600"
                            : "border-border"
                            }`}
                        >
                          {task.completed && <CheckCircle2 className="w-5 h-5 text-white" />}
                        </div>
                        <span
                          className={task.completed ? "line-through text-muted-foreground" : "text-foreground"}
                        >
                          {task.title || `Task ${idx + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent> */}

            <TabsContent value='notes' className='mt-6'>
              <div className='border border-border rounded-2xl p-6'>
                <h3 className='text-lg font-semibold text-foreground mb-6'>
                  Internal Notes
                </h3>
                {milestone.notes ? (
                  <div className='bg-background hover:bg-border border border-border rounded-lg p-5'>
                    <p className='text-foreground whitespace-pre-wrap'>
                      {milestone.notes}
                    </p>
                  </div>
                ) : (
                  <div className='text-center py-12 text-muted-foreground'>
                    {/* No internal notes added yet. */}
                    <EmptyState
                      icon={NotebookTabs}
                      title='No internal notes added yet.'
                      subtitle='This milestone has no internal notes.'
                    ></EmptyState>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default MilestoneDetail;
