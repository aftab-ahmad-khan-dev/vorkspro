// src/models/roles/RoleForm.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check } from "lucide-react";
import { useTabs } from "@/context/TabsContext";
import { apiGet, apiPatch, apiPost } from "@/interceptor/interceptor";
import { useNavigate } from "react-router-dom";
import ToggleButton from "@/components/ToggleButton";

/**
 * Visible actions in UI (View Records is auto-granted and hidden for most modules)
 */
const MODULE_ACTIONS = {
  Employees: ["Create Records", "Edit Records", "Delete Records", "Export Data", "View Details"],
  Attendance: ["Create Records", "Edit Records", "Delete Records", "Export Data"],
  Performance: ["Create Records", "Edit Records", "Delete Records", "Export Data"],
  Payroll: ["Create Records", "Edit Records", "Delete Records", "Export Data", "Process Payroll"],
  Projects: ["Create Records", "Edit Records", "Delete Records", "Export Data", "View Details"],
  Milestones: ["Create Records", "Edit Records", "Delete Records", "View Details"],
  "Client Management": ["Create Records", "Edit Records", "Delete Records", "Export Data", "View Details"],
  "Follow-up-Hub": ["Create Records", "Edit Records", "Delete Records"],
  Finance: ["View Finance", "Export Data"],
  "HR Management": ["Create Records", "Edit Records", "Delete Records", "Export Data"],
  "My To-Do Hub": ["Export Data", "Create Records", "Edit Records", "Delete Records"],
  "Reports & Analytics": ["Export Data"],
  "Admin & Assets": ["Create Records", "Edit Records", "Delete Records", "Export Data"],
  "Knowledge Base": ["Create Records", "Edit Records", "Delete Records"],
  Announcements: ["Create Records", "Edit Records", "Delete Records", "Filter Records"],
  Categories: ["Create Records", "Edit Records", "Delete Records"],
  Settings: ["Access Settings"],
  Blockages: ["Create Records", "Edit Records", "Delete Records"],
  "Keys & Credentials": ["Create Records", "Edit Records", "Delete Records", "Export Data"],
};

const MODULE_TABS = {
  "Follow-up-Hub": ["Schedule Follow-up", "Communication History"],
  "HR Management": ["Leave Requests", "Holidays"],
  Categories: ["Departments", "Sub Departments", "Transection Types", "Leave Types", "Document Types", "Industry Types", "Configuration"],
  Settings: ["Preferences", "Company Info", "Role & Management"],
  Milestones: ["Milestones", "Calender View"],
};

const MODULE_DETAIL_TABS = {
  Employees: ["Salary&Compensation", "Assigned Projects", "Attendance", "Assigned Assets"],
  Projects: ["Overview", "Team", "Activity", "Milestones", "Documents", "Blockages", "Credentials&Keys", "Budget Breakdown"],
  Milestones: ["Team Members", "Notes"],
  "Client Management": ["Overview", "Projects", "Documents", "Notes"],
};

const VALID_TABS = [
  "Milestones", "Calender View", "Schedule Follow-up", "Communication History",
  "Leave Requests", "Holidays", "Departments", "Sub Departments", "Transection Types",
  "Leave Types", "Document Types", "Industry Types", "Configuration", "Preferences", "Company Info", "Role & Management"
];

const VALID_DETAIL_TABS = [
  "Salary&Compensation", "Assigned Projects", "Attendance", "Assigned Assets",
  "Team", "Activity", "Blockages", "Credentials&Keys", "Budget Breakdown",
  "Team Members", "Notes", "Overview", "Projects", "Documents", "Milestones"
];

/**
 * Modules that automatically receive "View Records" when accessed
 */
const MODULES_WITH_AUTO_VIEW = [
  "Employees", "Attendance", "Performance", "Payroll",
  "Projects", "Milestones", "Client Management", "Follow-up-Hub",
  "HR Management", "My To-Do Hub", "Reports & Analytics",
  "Admin & Assets", "Knowledge Base", "Announcements", "Categories", "Settings", "Blockages", "Keys & Credentials"
];

/**
 * Grouped & Standalone modules
 */
const MODULE_GROUPS = [
  {
    id: "employee-management",
    title: "Employee Management",
    modules: ["Employees", "Attendance", "Performance", "Payroll"],
  },
  {
    id: "project-management",
    title: "Project Management",
    modules: ["Projects", "Milestones", "Blockages", "Keys & Credentials"],
  },
];

const STANDALONE_MODULES = [
  "Client Management",
  "Follow-up-Hub",
  "Finance",
  "HR Management",
  "My To-Do Hub",
  "Reports & Analytics",
  "Admin & Assets",
  "Knowledge Base",
  "Announcements",
  "Categories",
  "Settings",
  "Blockages"
];

/**
 * Normalize permissions from backend
 */
const normalizeModulePermissions = (permissions = []) => {
  if (!Array.isArray(permissions)) return [];
  return permissions
    .filter((p) => p && typeof p === "object" && typeof p.module === "string" && Array.isArray(p.actions))
    .map((p) => ({
      module: p.module.trim(),
      actions: [...new Set(p.actions.filter((a) => typeof a === "string"))],
      tabs: Array.isArray(p.tabs) ? [...new Set(p.tabs.filter((t) => typeof t === "string" && VALID_TABS.includes(t)))] : [],
      detailTabs: Array.isArray(p.detailTabs) ? [...new Set(p.detailTabs.filter((t) => typeof t === "string" && VALID_DETAIL_TABS.includes(t)))] : [],
    }));
};

export default function RoleForm({ role, onSuccess, onClose }) {
  const isEdit = !!role;
  const baseUrl = import.meta.env.VITE_APP_BASE_URL + "role";
  const token = localStorage.getItem("token");
  const { setTabs, setActions } = useTabs()
  const navigate = useNavigate()
  const [toggleValue, setToggleValue] = useState(false);

  const [form, setForm] = useState({
    name: role?.name || "",
    description: role?.description || "",
    modulePermissions: normalizeModulePermissions(role?.modulePermissions),
    globalActionPermissions: role?.globalActionPermissions || [],
  });

  const [loading, setLoading] = useState(false);
  const [openAccordions, setOpenAccordions] = useState([]);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [localBudget, setLocalBudget] = useState(role?.cost || false);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState(null);

  useEffect(() => {
    if (role) {
      setForm({
        name: role.name || "",
        description: role.description || "",
        modulePermissions: normalizeModulePermissions(role.modulePermissions),
        globalActionPermissions: role.globalActionPermissions || [],
      });
      setLocalBudget(role.cost || false);
    }
  }, [role]);

  useEffect(() => {
    if (!role?._id) return;
    let cancelled = false;
    setLoadingUsers(true);
    apiGet("user/list")
      .then((data) => {
        if (!cancelled && data?.isSuccess && Array.isArray(data?.users)) {
          setUsersList(data.users);
        }
      })
      .catch(() => {
        if (!cancelled) setUsersList([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingUsers(false);
      });
    return () => { cancelled = true; };
  }, [role?._id]);

  const handleAccordionChange = (values) => {
    const newlyOpened = values.filter((v) => !openAccordions.includes(v));
    setOpenAccordions(values);

    newlyOpened.forEach((module) => {
      if (MODULES_WITH_AUTO_VIEW.includes(module)) {
        ensureViewRecords(module);
      }
    });
  };

  const ensureViewRecords = (moduleName) => {
    setForm((prev) => {
      const current = normalizeModulePermissions(prev.modulePermissions);
      const existing = current.find((p) => p.module === moduleName);

      if (existing) {
        if (!existing.actions.includes("View Records")) {
          return {
            ...prev,
            modulePermissions: current.map((p) =>
              p.module === moduleName
                ? { ...p, actions: [...p.actions, "View Records"] }
                : p
            ),
          };
        }
      } else {
        return {
          ...prev,
          modulePermissions: [...current, { module: moduleName, actions: ["View Records"] }],
        };
      }
      return prev;
    });
  };

  const toggleModuleTab = (moduleName, tab) => {
    setForm((prev) => {
      const current = normalizeModulePermissions(prev.modulePermissions);
      const existing = current.find((p) => p.module === moduleName);

      const updatedTabs = existing?.tabs
        ? existing.tabs.includes(tab)
          ? existing.tabs.filter((t) => t !== tab)
          : [...existing.tabs, tab]
        : [tab];

      const newPermissions = current.filter((p) => p.module !== moduleName).concat({
        module: moduleName,
        actions: existing?.actions || ["View Records"],
        tabs: updatedTabs,
        detailTabs: existing?.detailTabs || [],
      });

      return { ...prev, modulePermissions: newPermissions };
    });
  };

  const toggleModuleDetailTab = (moduleName, tab) => {
    setForm((prev) => {
      const current = normalizeModulePermissions(prev.modulePermissions);
      const existing = current.find((p) => p.module === moduleName);

      const updatedDetailTabs = existing?.detailTabs
        ? existing.detailTabs.includes(tab)
          ? existing.detailTabs.filter((t) => t !== tab)
          : [...existing.detailTabs, tab]
        : [tab];

      const newPermissions = current.filter((p) => p.module !== moduleName).concat({
        module: moduleName,
        actions: existing?.actions || ["View Records"],
        tabs: existing?.tabs || [],
        detailTabs: updatedDetailTabs,
      });

      return { ...prev, modulePermissions: newPermissions };
    });
  };

  const toggleModuleAction = (moduleName, action) => {
    setForm((prev) => {
      const current = normalizeModulePermissions(prev.modulePermissions);
      const existing = current.find((p) => p.module === moduleName);

      let updatedActions = existing
        ? existing.actions.includes(action)
          ? existing.actions.filter((a) => a !== action)
          : [...existing.actions, action]
        : [action];

      if (MODULES_WITH_AUTO_VIEW.includes(moduleName)) {
        if (updatedActions.length > 0 && !updatedActions.includes("View Records")) {
          updatedActions.push("View Records");
        }
      }

      const newPermissions =
        updatedActions.length === 0
          ? current.filter((p) => p.module !== moduleName)
          : current.filter((p) => p.module !== moduleName).concat({
            module: moduleName,
            actions: updatedActions,
            tabs: existing?.tabs || [],
            detailTabs: existing?.detailTabs || [],
          });

      return { ...prev, modulePermissions: newPermissions };
    });
  };

  // Toggle entire module access (header checkbox) — works for all modules including Dashboard
  const toggleModuleAccess = (moduleName) => {
    setForm((prev) => {
      const current = normalizeModulePermissions(prev.modulePermissions);
      const existing = current.find((p) => p.module === moduleName);

      if (existing) {
        // Remove all access
        return {
          ...prev,
          modulePermissions: current.filter((p) => p.module !== moduleName),
        };
      } else {
        // Grant only View Records
        return {
          ...prev,
          modulePermissions: [
            ...current,
            { module: moduleName, actions: ["View Records"] },
          ],
        };
      }
    });
  };

  const getModuleActions = (moduleName) => {
    const perm = form.modulePermissions.find((p) => p.module === moduleName);
    return perm?.actions || [];
  };

  const getModuleTabs = (moduleName) => {
    const perm = form.modulePermissions.find((p) => p.module === moduleName);
    return perm?.tabs || [];
  };

  const getModuleDetailTabs = (moduleName) => {
    const perm = form.modulePermissions.find((p) => p.module === moduleName);
    return perm?.detailTabs || [];
  };

  const hasVisiblePermissions = (moduleName) => {
    const actions = getModuleActions(moduleName);
    return actions.some((a) => a !== "View Records");
  };

  const hasAnyPermissionInGroup = (modules) => {
    return modules.some((mod) => getModuleActions(mod).length > 0);
  };

  // Final payload — Dashboard is optional
  const getFinalModulePermissions = () => {
    const base = [...form.modulePermissions];

    // Ensure opened auto-view modules have View Records
    MODULES_WITH_AUTO_VIEW.forEach((mod) => {
      if (openAccordions.includes(mod)) {
        const existing = base.find((p) => p.module === mod);
        if (!existing) {
          base.push({ module: mod, actions: ["View Records"] });
        } else if (!existing.actions.includes("View Records")) {
          existing.actions = [...existing.actions, "View Records"];
        }
      }
    });

    return base;
  };

  const validateForm = () => {
    if (!isEdit && !form.name.trim()) {
      toast.error("Role name is required");
      return false;
    }

    const finalPermissions = getFinalModulePermissions();
    if (finalPermissions.length === 0 && form.globalActionPermissions.length === 0) {
      toast.error("Please grant access to at least one module");
      return false;
    }

    return true;
  };

  const refreshToken = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const data = await apiPost("user/refresh-token", { token });

      if (data?.isSuccess) {
        if (data?.token) {
          localStorage.setItem("token", data.token);
        }
      } else {
        localStorage.removeItem("token");
        navigate("/login");
        toast.error("Session expired. Please log in again.");
      }
    } catch (error) {
      console.log('error:', error)
      localStorage.removeItem("token");
      navigate("/login");
      toast.error("Something went wrong. Please log in again.");
    }
  };

  async function fetchRoles() {
    try {
      const data = await apiGet("user/get-roles");
      if (data?.isSuccess) {
        setTabs(data.role)
        setActions(data.role)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleBudgetToggle = async (newBudgetValue) => {
    if (!role?._id) return;
    setLocalBudget(newBudgetValue)
    setToggleValue(newBudgetValue)
  };

  const handleAssignRole = async (user, assign) => {
    if (!role?._id || !user?._id) return;
    setAssigningUserId(user._id);
    try {
      const data = await apiPatch(`user/${user._id}/role`, { role: assign ? role._id : null });
      if (data?.isSuccess && data?.user) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, role: data.user.role } : u))
        );
        toast.success(assign ? "Role assigned" : "Role unassigned");
      } else {
        toast.error(data?.message || "Failed to update role");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to update role");
    } finally {
      setAssigningUserId(null);
    }
  };

  const handleSubmit = async () => {


    setBudgetLoading(true);
    const data = await apiPatch(`role/toggle-budget/${role._id}`, { cost: toggleValue });
    if (data?.isSuccess) {
      setLocalBudget(toggleValue);
      // toast.success("Budget updated successfully");
      onSuccess?.();
    } else {
      // toast.error(data.message || "Failed to update budget");
      console.log(data.message)
    }

    if (!validateForm()) return;
    setLoading(true);

    const finalModulePermissions = getFinalModulePermissions();

    try {
      // const url = isEdit ? `${baseUrl}/${role._id}` : `${baseUrl}/create`;
      // const method = isEdit ? "PATCH" : "POST";

      const payload = isEdit
        ? {
          modulePermissions: finalModulePermissions,
          globalActionPermissions: form.globalActionPermissions,
        }
        : {
          name: form.name.trim(),
          description: form.description.trim(),
          modulePermissions: finalModulePermissions,
          globalActionPermissions: form.globalActionPermissions,
        };

      let data = null;
      if (isEdit) {
        data = await apiPatch(`role/${role._id}`, payload);
      } else if (!isEdit) {
        data = await apiPost(`role/create`, payload);
      }

      if (data?.isSuccess) {
        toast.success(isEdit ? "Role updated successfully" : "Role created successfully");
        fetchRoles()
        refreshToken();
        onSuccess?.();
        onClose?.();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderModuleAccordion = (module) => {
    const availableActions = MODULE_ACTIONS[module] || [];
    const allActions = getModuleActions(module);
    const hasView = allActions.includes("View Records");
    const hasVisible = hasVisiblePermissions(module);
    // Count only actions (excluding View Records), not tabs or detail tabs
    const visibleCount = allActions.filter((a) => a !== "View Records" && availableActions.includes(a)).length;
    const totalCount = availableActions.length;
    const isOpen = openAccordions.includes(module);
    const hasAnyPermission = hasView || hasVisible;

    return (
      <AccordionItem
        key={module}
        value={module}
        className="border border-[var(--border)] rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow"
      >
        <AccordionTrigger
          className="px-5 py-4 hover:no-underline"
          onClick={(e) => {
            if (e.target.closest("button[role='checkbox']")) {
              e.stopPropagation();
            }
          }}
        >
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-4">
              <button
                role="checkbox"
                aria-checked={hasAnyPermission}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleModuleAccess(module);
                }}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary ${isOpen
                  ? "bg-primary border-primary text-primary-foreground"
                  : hasAnyPermission
                    ? "bg-primary/20 border-primary"
                    : "border-[var(--border)] bg-background"
                  }`}
              >
                {hasAnyPermission && <Check className="w-4 h-4" />}
              </button>
              <span className="font-medium text-foreground">{module}</span>
            </div>
            {hasVisible ? (
              <span className="text-sm text-muted-foreground">
                {visibleCount}/{totalCount} actions
              </span>
            ) : hasView ? (
              <span className="text-sm text-muted-foreground">View access only</span>
            ) : null}
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-6 py-5 border-t border-[var(--border)] bg-background">
          {hasView && (
            <div className="mb-4 pb-3 border-b border-dashed border-[var(--border)]">
              <p className="text-sm font-medium text-primary">
                View Records access automatically granted
              </p>
            </div>
          )}
          {availableActions.length > 0 ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-3 text-foreground">Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableActions.map((action) => (
                    <label
                      key={action}
                      className="flex items-center gap-3 cursor-pointer select-none text-sm hover:bg-muted/50 px-4 py-3 -mx-4 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={allActions.includes(action)}
                        onChange={() => toggleModuleAction(module, action)}
                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                      />
                      <span className="text-foreground/90">{action}</span>
                    </label>
                  ))}
                </div>
              </div>
              {MODULE_TABS[module] && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-foreground">Tabs Access</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MODULE_TABS[module].map((tab) => (
                      <label
                        key={tab}
                        className="flex items-center gap-3 cursor-pointer select-none text-sm hover:bg-muted/50 px-4 py-3 -mx-4 rounded-lg transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={getModuleTabs(module).includes(tab)}
                          onChange={() => toggleModuleTab(module, tab)}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-foreground/90">{tab}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {MODULE_DETAIL_TABS[module] && allActions.includes("View Details") && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-foreground">Detail Tabs Access</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MODULE_DETAIL_TABS[module].map((tab) => (
                      <label
                        key={tab}
                        className="flex items-center gap-3 cursor-pointer select-none text-sm hover:bg-muted/50 px-4 py-3 -mx-4 rounded-lg transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={getModuleDetailTabs(module).includes(tab)}
                          onChange={() => toggleModuleDetailTab(module, tab)}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-foreground/90">{tab}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic py-2">
              Only View Records access available
            </p>
          )}
        </AccordionContent>
      </AccordionItem>
    );
  };

  // Dashboard state
  const dashboardActions = getModuleActions("Dashboard");
  const hasDashboardAccess = dashboardActions.includes("View Records");

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      {/* Role Name & Description */}
      {!isEdit && (
        <div className="space-y-6 rounded-xl p-8 border border-[var(--border)] shadow-sm bg-background">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Role Name</label>
            <Input
              placeholder="e.g., CEO, Project Manager"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Description (Optional)</label>
            <Textarea
              placeholder="Brief description of this role..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="min-h-32 resize-none"
            />
          </div>
        </div>
      )}
      {/* Module Permissions */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Module Permissions</h2>
          {isEdit && (
            <div className="flex justify-end gap-3">
              <label className="-mt-[7px] font-semibold text-foreground text-xl">Sensitive Information</label>
              <ToggleButton
                onToggle={handleBudgetToggle}
                isLoading={budgetLoading}
                isActive={localBudget}
                scale={125}
              />
            </div>
          )}
        </div>

        {/* Dashboard — Fully toggleable with consistent checkmark */}
        <div className="border border-[var(--border)] rounded-lg overflow-hidden shadow-sm hover:bg-background bg-background/30">
          <div
            className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => toggleModuleAccess("Dashboard")}
          >
            <div className="flex items-center gap-4">
              <button
                role="checkbox"
                aria-checked={hasDashboardAccess}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleModuleAccess("Dashboard");
                }}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary ${hasDashboardAccess
                  ? "bg-primary/20 border-primary"
                  : "border-[var(--border)] bg-background"
                  }`}
              >
                {hasDashboardAccess && <Check className="w-4 h-4" />}
              </button>
              <span className="font-medium text-foreground">Dashboard</span>
            </div>
            {hasDashboardAccess && (
              <span className="text-sm text-muted-foreground">View access only</span>
            )}
          </div>
          {hasDashboardAccess && (
            <div className="px-6 py-5 border-t border-[var(--border)] bg-background">
              <p className="text-sm font-medium text-primary">
                View Records access granted
              </p>
            </div>
          )}
        </div>

        <Accordion
          type="multiple"
          value={openAccordions}
          onValueChange={handleAccordionChange}
          className="space-y-5"
        >
          {/* Grouped Modules */}
          {MODULE_GROUPS.map((group) => {
            const hasAny = hasAnyPermissionInGroup(group.modules);
            return (
              <AccordionItem
                key={group.id}
                value={group.id}
                className="px-5 border-2 border-[var(--border)] rounded-xl overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <span className="font-semibold">{group.title}</span>
                    {hasAny && (
                      <span className="ml-auto text-sm font-normal text-muted-foreground">
                        Active permissions
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-8 px-8 bg-background/30">
                  <div className="space-y-4">
                    {group.modules.map(renderModuleAccordion)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}

          {/* Standalone Modules */}
          <div className="space-y-4">
            {STANDALONE_MODULES.map(renderModuleAccordion)}
          </div>
        </Accordion>
      </section>

      {/* User register list — assign this role to users (edit only) */}
      {isEdit && role?._id && (
        <section className="space-y-4 rounded-xl p-6 border border-[var(--border)] shadow-sm bg-background">
          <h2 className="text-xl font-bold text-foreground">Assign role to users</h2>
          <p className="text-sm text-muted-foreground">
            Users with this role are listed below. Check or uncheck to assign or remove &quot;{role.name}&quot;.
          </p>
          {loadingUsers ? (
            <p className="text-sm text-muted-foreground py-4">Loading users...</p>
          ) : usersList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No users found.</p>
          ) : (
            <div className="border border-[var(--border)] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-muted/50">
                    <th className="text-left p-3 font-semibold text-foreground">Name</th>
                    <th className="text-left p-3 font-semibold text-foreground">Email</th>
                    <th className="text-left p-3 font-semibold text-foreground">Current role</th>
                    <th className="text-left p-3 font-semibold text-foreground">Assign this role</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => {
                    const hasRole = u.role?._id === role._id;
                    const busy = assigningUserId === u._id;
                    return (
                      <tr key={u._id} className="border-b border-[var(--border)] hover:bg-muted/30">
                        <td className="p-3 text-foreground">
                          {[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}
                        </td>
                        <td className="p-3 text-foreground">{u.email || u.username || "—"}</td>
                        <td className="p-3 text-muted-foreground">{u.role?.name ?? "—"}</td>
                        <td className="p-3">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={hasRole}
                              disabled={busy}
                              onChange={() => handleAssignRole(u, !hasRole)}
                              className="w-4 h-4 text-primary rounded focus:ring-primary"
                            />
                            <span className="text-foreground/90">{busy ? "Updating…" : hasRole ? "Assigned" : "Assign"}</span>
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-8">
        <Button size="lg" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Role" : "Create Role"}
        </Button>
      </div>
    </div>
  );
}