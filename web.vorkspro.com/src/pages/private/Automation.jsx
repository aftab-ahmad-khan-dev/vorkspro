import React, { useEffect, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Zap, Layers, Bell, Plus, Edit, Trash2, ListOrdered, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/interceptor/interceptor";
import GlobalDialog from "@/models/GlobalDialog";
import Confirmation from "@/models/Confirmation";
import EmptyState from "@/components/EmptyState";
import SearchableSelect from "@/components/SearchableSelect";
import { useTabs } from "@/context/TabsContext";
import { Link } from "react-router-dom";

export default function Automation() {
  const [activeTab, setActiveTab] = useState("projects");
  const [workTypes, setWorkTypes] = useState([]);
  const [rules, setRules] = useState([]);
  const [statusCategories, setStatusCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState({ task: [], blockage: [], milestone: [] });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [statusCatDialogOpen, setStatusCatDialogOpen] = useState(false);
  const [editingWorkType, setEditingWorkType] = useState(null);
  const [editingRule, setEditingRule] = useState(null);
  const [editingStatusCat, setEditingStatusCat] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, type: null });
  const { actions } = useTabs();
  const isSuperAdmin = actions?.isSuperAdmin ?? false;

  const hasPermission = (action) => {
    if (isSuperAdmin) return true;
    return actions?.modulePermissions?.some(
      (m) => m.module === "Automation" && m.actions?.includes(action)
    );
  };

  const fetchWorkTypes = useCallback(async () => {
    try {
      const data = await apiGet("automation/work-types/all");
      setWorkTypes(data.workTypes || []);
    } catch (e) {
      toast.error(e.message || "Failed to load work types");
    }
  }, []);

  const fetchRules = useCallback(async () => {
    try {
      const data = await apiGet("automation/rules");
      setRules(data.rules || []);
    } catch (e) {
      toast.error(e.message || "Failed to load rules");
    }
  }, []);

  const fetchStatuses = useCallback(async () => {
    try {
      const data = await apiGet("automation/entity-statuses");
      setStatuses(data.statuses || { task: [], blockage: [], milestone: [] });
    } catch (e) {
      console.warn("Failed to load statuses", e);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const data = await apiGet("automation/projects");
      setProjects(data.projects || []);
    } catch (e) {
      toast.error(e.message || "Failed to load projects");
    }
  }, []);

  const fetchStatusCategories = useCallback(async () => {
    try {
      const data = await apiGet("automation/status-categories");
      setStatusCategories(data.categories || []);
    } catch (e) {
      toast.error(e.message || "Failed to load status categories");
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const data = await apiGet("employee/get-active-employees");
      setEmployees(data.filteredData?.employees || []);
    } catch (e) {
      console.warn("Failed to load employees", e);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchWorkTypes(), fetchRules(), fetchStatuses(), fetchStatusCategories(), fetchProjects(), fetchEmployees()]).finally(
      () => setLoading(false)
    );
  }, [fetchWorkTypes, fetchRules, fetchStatuses, fetchStatusCategories, fetchProjects, fetchEmployees]);

  const handleWorkTypeSubmit = async (formData) => {
    try {
      if (editingWorkType) {
        await apiPatch(`automation/work-types/${editingWorkType._id}`, formData);
        toast.success("Work type updated");
      } else {
        await apiPost("automation/work-types", formData);
        toast.success("Work type created");
      }
      setDialogOpen(false);
      setEditingWorkType(null);
      fetchWorkTypes();
    } catch (e) {
      toast.error(e.message || "Operation failed");
    }
  };

  const handleRuleSubmit = async (formData) => {
    try {
      if (editingRule) {
        await apiPatch(`automation/rules/${editingRule._id}`, formData);
        toast.success("Rule updated");
      } else {
        await apiPost("automation/rules", formData);
        toast.success("Rule created");
      }
      setRuleDialogOpen(false);
      setEditingRule(null);
      fetchRules();
    } catch (e) {
      toast.error(e.message || "Operation failed");
    }
  };

  const handleStatusCatSubmit = async (formData) => {
    try {
      if (editingStatusCat) {
        await apiPatch(`automation/status-categories/${editingStatusCat._id}`, formData);
        toast.success("Status category updated");
      } else {
        await apiPost("automation/status-categories", formData);
        toast.success("Status category created");
      }
      setStatusCatDialogOpen(false);
      setEditingStatusCat(null);
      fetchStatusCategories();
      fetchStatuses();
    } catch (e) {
      toast.error(e.message || "Operation failed");
    }
  };

  const handleDelete = async () => {
    const { id, type } = confirmDelete;
    if (!id || !type) return;
    try {
      if (type === "work-type") {
        await apiDelete(`automation/work-types/${id}`);
        toast.success("Work type deleted");
        fetchWorkTypes();
      } else if (type === "status-category") {
        await apiDelete(`automation/status-categories/${id}`);
        toast.success("Status category deleted");
        fetchStatusCategories();
        fetchStatuses();
      } else {
        await apiDelete(`automation/rules/${id}`);
        toast.success("Rule deleted");
        fetchRules();
      }
      setConfirmDelete({ open: false, id: null, type: null });
    } catch (e) {
      toast.error(e.message || "Delete failed");
    }
  };

  const ENTITY_LABELS = { task: "Task", blockage: "Blockage", milestone: "Milestone" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          Automation
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Configure work types and notification rules. When status changes to a specific status, assigned employees receive a notification.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-4 mb-6">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderKanban size={16} />
            Projects
          </TabsTrigger>
          <TabsTrigger value="work-types" className="flex items-center gap-2">
            <Layers size={16} />
            Work Types
          </TabsTrigger>
          <TabsTrigger value="status-categories" className="flex items-center gap-2">
            <ListOrdered size={16} />
            Status Categories
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Bell size={16} />
            Notification Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-0">
          <div className="border border-[var(--border)] rounded-2xl bg-[var(--background)]/20 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Projects & Automation Actions
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Projects with milestones and blockages. Actions show which notifications fire when status changes.
              </p>
            </div>
            {loading ? (
              <div className="animate-pulse h-32 rounded-lg bg-[var(--muted)]/30" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Project</th>
                      <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Milestones</th>
                      <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Blockages</th>
                      <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Actions (To Do)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => {
                      const milestoneCount = p.milestones?.length || 0;
                      const blockageCount = p.blockages?.length || 0;
                      const actionRules = rules.filter(
                        (r) =>
                          (r.entityType === "milestone" && milestoneCount > 0) ||
                          (r.entityType === "blockage" && blockageCount > 0) ||
                          r.entityType === "task"
                      );
                      const actionText =
                        actionRules.length > 0
                          ? actionRules.map((r) => `When ${ENTITY_LABELS[r.entityType]} → ${r.triggerStatus}`).join("; ")
                          : "No rules";
                      return (
                        <tr key={p._id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30">
                          <td className="py-3 px-4">
                            <Link
                              to={`/app/projects/project-detail/${p._id}`}
                              className="font-medium text-[var(--primary)] hover:underline"
                            >
                              {p.name}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-[var(--muted-foreground)]">{p.status || "—"}</td>
                          <td className="py-3 px-4">{milestoneCount}</td>
                          <td className="py-3 px-4">{blockageCount}</td>
                          <td className="py-3 px-4 text-[var(--muted-foreground)] text-xs max-w-xs truncate" title={actionText}>
                            {actionText}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {projects.length === 0 && (
                  <EmptyState
                    icon={FolderKanban}
                    title="No projects"
                    subtitle="Projects will appear here when you have access"
                  />
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="work-types" className="mt-0">
          <div className="border border-[var(--border)] rounded-2xl bg-[var(--background)]/20 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Work Types (e.g. Deployment, Designing, Bug fixing, Revision)
              </h2>
              {hasPermission("Create Records") && (
                <Button
                  onClick={() => {
                    setEditingWorkType(null);
                    setDialogOpen(true);
                  }}
                >
                  <Plus size={16} className="mr-2" />
                  Add Work Type
                </Button>
              )}
            </div>
            {loading ? (
              <div className="animate-pulse h-32 rounded-lg bg-[var(--muted)]/30" />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {workTypes.map((wt) => (
                  <div
                    key={wt._id}
                    className="flex items-center justify-between p-4 border border-[var(--border)] rounded-xl bg-[var(--card)]"
                  >
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{wt.name}</p>
                      {wt.description && (
                        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                          {wt.description}
                        </p>
                      )}
                    </div>
                    {hasPermission("Edit Records") && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingWorkType(wt);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setConfirmDelete({ open: true, id: wt._id, type: "work-type" })
                          }
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {workTypes.length === 0 && (
                  <div className="col-span-full">
                    <EmptyState
                      icon={Layers}
                      title="No work types"
                      subtitle="Add work types like Deployment, Designing, Bug fixing, Revision"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="status-categories" className="mt-0">
          <div className="border border-[var(--border)] rounded-2xl bg-[var(--background)]/20 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Status categories: Pending | In Progress | Done | Blockage
              </h2>
              {hasPermission("Create Records") && (
                <Button
                  onClick={() => {
                    setEditingStatusCat(null);
                    setStatusCatDialogOpen(true);
                  }}
                >
                  <Plus size={16} className="mr-2" />
                  Add Status Category
                </Button>
              )}
            </div>
            {loading ? (
              <div className="animate-pulse h-32 rounded-lg bg-[var(--muted)]/30" />
            ) : (
              <div className="space-y-4">
                {statusCategories.map((cat) => (
                  <div
                    key={cat._id}
                    className="flex flex-wrap items-start justify-between gap-4 p-4 border border-[var(--border)] rounded-xl bg-[var(--card)]"
                  >
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{cat.name}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(cat.subStatuses || []).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-[var(--muted)]/50 text-sm text-[var(--muted-foreground)]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    {hasPermission("Edit Records") && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingStatusCat(cat);
                            setStatusCatDialogOpen(true);
                          }}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setConfirmDelete({ open: true, id: cat._id, type: "status-category" })
                          }
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {statusCategories.length === 0 && (
                  <EmptyState
                    icon={ListOrdered}
                    title="No status categories"
                    subtitle="Add Pending, In Progress, Done, Blockage with sub-statuses"
                  />
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="mt-0">
          <div className="border border-[var(--border)] rounded-2xl bg-[var(--background)]/20 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                When status changes to a specific status, notify assignee
              </h2>
              {hasPermission("Create Records") && (
                <Button
                  onClick={() => {
                    setEditingRule(null);
                    setRuleDialogOpen(true);
                  }}
                >
                  <Plus size={16} className="mr-2" />
                  Add Rule
                </Button>
              )}
            </div>
            {loading ? (
              <div className="animate-pulse h-32 rounded-lg bg-[var(--muted)]/30" />
            ) : (
              <div className="space-y-3">
                {rules.map((r) => (
                  <div
                    key={r._id}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 border border-[var(--border)] rounded-xl bg-[var(--card)]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {ENTITY_LABELS[r.entityType] || r.entityType}
                      </span>
                      <span className="text-[var(--muted-foreground)]">→</span>
                      <span className="px-2 py-1 rounded-md bg-[var(--primary)]/20 text-sm">
                        {r.triggerStatus}
                      </span>
                      {r.workType?.name && (
                        <span className="text-xs text-[var(--muted-foreground)]">
                          ({r.workType.name})
                        </span>
                      )}
                      <span className="text-xs text-[var(--muted-foreground)]">
                        Notify assignee: {r.notifyAssignee ? "Yes" : "No"}
                      </span>
                      {r.additionalNotify?.length > 0 && (
                        <span className="text-xs text-[var(--muted-foreground)]">
                          +{r.additionalNotify.length} extra
                        </span>
                      )}
                    </div>
                    {hasPermission("Edit Records") && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingRule(r);
                            setRuleDialogOpen(true);
                          }}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setConfirmDelete({ open: true, id: r._id, type: "rule" })
                          }
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {rules.length === 0 && (
                  <EmptyState
                    icon={Bell}
                    title="No notification rules"
                    subtitle="Add rules to notify assignees when status changes"
                  />
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Work Type Dialog */}
      <GlobalDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingWorkType(null);
        }}
        label="Work Type"
      >
        <WorkTypeForm
          workType={editingWorkType}
          onSubmit={handleWorkTypeSubmit}
          onCancel={() => {
            setDialogOpen(false);
            setEditingWorkType(null);
          }}
        />
      </GlobalDialog>

      {/* Rule Dialog */}
      <GlobalDialog
        open={ruleDialogOpen}
        onClose={() => {
          setRuleDialogOpen(false);
          setEditingRule(null);
        }}
        label="Notification Rule"
      >
        <RuleForm
          rule={editingRule}
          workTypes={workTypes}
          statuses={statuses}
          statusCategories={statusCategories}
          employees={employees}
          onSubmit={handleRuleSubmit}
          onCancel={() => {
            setRuleDialogOpen(false);
            setEditingRule(null);
          }}
        />
      </GlobalDialog>

      <GlobalDialog
        open={statusCatDialogOpen}
        onClose={() => {
          setStatusCatDialogOpen(false);
          setEditingStatusCat(null);
        }}
        label="Status Category"
      >
        <StatusCategoryForm
          category={editingStatusCat}
          onSubmit={handleStatusCatSubmit}
          onCancel={() => {
            setStatusCatDialogOpen(false);
            setEditingStatusCat(null);
          }}
        />
      </GlobalDialog>

      <Confirmation
        open={confirmDelete.open}
        title="Delete"
        message={`Are you sure you want to delete this ${confirmDelete.type === "work-type" ? "work type" : confirmDelete.type === "status-category" ? "status category" : "rule"}?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null, type: null })}
      />
    </div>
  );
}

function WorkTypeForm({ workType, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: workType?.name || "",
    description: workType?.description || "",
  });

  useEffect(() => {
    setFormData({
      name: workType?.name || "",
      description: workType?.description || "",
    });
  }, [workType]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-[var(--foreground)]">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Deployment, Bug fixing"
          className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--foreground)] bg-[var(--background)]"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--foreground)]">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description"
          rows={2}
          className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--foreground)] bg-[var(--background)]"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(formData)} disabled={!formData.name?.trim()}>
          {workType ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}

function RuleForm({ rule, workTypes, statuses, statusCategories = [], employees, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    entityType: rule?.entityType || "blockage",
    workType: rule?.workType?._id || rule?.workType || "",
    triggerStatus: rule?.triggerStatus || "",
    notifyAssignee: rule?.notifyAssignee ?? true,
    additionalNotify: rule?.additionalNotify?.map((e) => e._id || e) || [],
  });

  useEffect(() => {
    setFormData({
      entityType: rule?.entityType || "blockage",
      workType: rule?.workType?._id || rule?.workType || "",
      triggerStatus: rule?.triggerStatus || "",
      notifyAssignee: rule?.notifyAssignee ?? true,
      additionalNotify: rule?.additionalNotify?.map((e) => e._id || e) || [],
    });
  }, [rule]);

  const availableStatuses = statuses[formData.entityType] || [];
  const entityType = formData.entityType;
  const categoriesForEntity = (statusCategories || []).filter(
    (c) => !c.entityTypes?.length || c.entityTypes.includes(entityType)
  );
  const statusesInCategories = new Set(
    categoriesForEntity.flatMap((c) => c.subStatuses || [])
  );
  const uncategorizedStatuses = availableStatuses.filter((s) => !statusesInCategories.has(s));

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-[var(--foreground)]">Work Type</label>
        <Select
          value={formData.workType || "all"}
          onValueChange={(v) => setFormData({ ...formData, workType: v === "all" ? "" : v })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="All work types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All work types</SelectItem>
            {workTypes.map((wt) => (
              <SelectItem key={wt._id} value={wt._id}>
                {wt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--foreground)]">Entity Type</label>
        <Select
          value={formData.entityType}
          onValueChange={(v) =>
            setFormData({ ...formData, entityType: v, triggerStatus: "" })
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="blockage">Blockage</SelectItem>
            <SelectItem value="milestone">Milestone</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--foreground)]">
          When status changes to
        </label>
        <Select
          value={formData.triggerStatus}
          onValueChange={(v) => setFormData({ ...formData, triggerStatus: v })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {categoriesForEntity.length ? (
              categoriesForEntity.map((cat) => {
                const items = (cat.subStatuses || []).filter((s) =>
                  availableStatuses.includes(s)
                );
                if (!items.length) return null;
                return (
                  <SelectGroup key={cat.name}>
                    <SelectLabel>{cat.name}</SelectLabel>
                    {items.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                );
              })
            ) : null}
            {uncategorizedStatuses.length > 0 && (
              <SelectGroup key="other">
                <SelectLabel>Other</SelectLabel>
                {uncategorizedStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="notifyAssignee"
          checked={formData.notifyAssignee}
          onCheckedChange={(c) => setFormData({ ...formData, notifyAssignee: !!c })}
        />
        <label htmlFor="notifyAssignee" className="text-sm cursor-pointer">
          Notify assignee
        </label>
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--foreground)]">
          Also notify (optional)
        </label>
        <SearchableSelect
          items={employees}
          value={formData.additionalNotify}
          onValueChange={(v) =>
            setFormData({
              ...formData,
              additionalNotify: Array.isArray(v) ? v : v ? [v] : [],
            })
          }
          multi
          placeholder="Select employees"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() =>
            onSubmit({
              ...formData,
              workType: formData.workType || null,
            })
          }
          disabled={!formData.triggerStatus}
        >
          {rule ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}

function StatusCategoryForm({ category, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    subStatuses: (category?.subStatuses || []).join(", "),
    entityTypes: category?.entityTypes || ["task", "milestone", "blockage"],
    sortOrder: category?.sortOrder ?? 0,
  });

  useEffect(() => {
    setFormData({
      name: category?.name || "",
      subStatuses: (category?.subStatuses || []).join(", "),
      entityTypes: category?.entityTypes || ["task", "milestone", "blockage"],
      sortOrder: category?.sortOrder ?? 0,
    });
  }, [category]);

  const handleSubmit = () => {
    const subStatuses = formData.subStatuses
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onSubmit({ ...formData, subStatuses });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-[var(--foreground)]">Category Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Pending, In Progress, Done, Blockage"
          className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--foreground)] bg-[var(--background)]"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--foreground)]">
          Sub-statuses (comma-separated)
        </label>
        <input
          type="text"
          value={formData.subStatuses}
          onChange={(e) => setFormData({ ...formData, subStatuses: e.target.value })}
          placeholder="e.g. not started, waiting for client"
          className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--foreground)] bg-[var(--background)]"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--foreground)]">Sort Order</label>
        <input
          type="number"
          value={formData.sortOrder}
          onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) || 0 })}
          className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--foreground)] bg-[var(--background)]"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!formData.name?.trim()}>
          {category ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}
