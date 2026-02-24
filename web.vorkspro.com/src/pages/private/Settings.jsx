import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Moon, Plus, Shield, Sun, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import AddRoleDialog from "@/models/settings/AddRoleDialog";
import GlobalDialog from "@/models/GlobalDialog";
import { toast } from "sonner";
import Confirmation from "@/models/Confirmation";
import ToggleButton from "@/components/ToggleButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTabs } from "@/context/TabsContext";
import { has } from "lodash";
import CustomTooltip from "@/components/Tooltip";
import { apiDelete, apiGet, apiPatch } from "@/interceptor/interceptor";

function Settings() {
  const [activeTab, setActiveTab] = useState("preferences");
  const [isActive, setIsActive] = useState(false);
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [togglingRoles, setTogglingRoles] = useState(new Set());
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  const [selectedRole, setSelectedRole] = useState({});
  const token = localStorage.getItem("token");

  const [companyInfo, setCompanyInfo] = useState({
    companyName: "Your Software Company",
    email: "contact@company.com",
    phone: "+1 234 567 8900",
    address: "123 Tech Street, San Francisco, CA 94105",
    website: "www.company.com",
    industry: "Software Development",
  });

  const { actions } = useTabs();
  const isSuperAdmin = actions?.isSuperAdmin || false;

  const hasPermission = (moduleName, requiredAction) => {
    if (isSuperAdmin) return true;

    return actions?.modulePermissions?.some(
      (modules) => {
        const currentModule = modules.module == moduleName
        if (currentModule == true) {
          return modules.actions.includes(requiredAction)
        }
      }
    );
  };

  const tabsPermission = (moduleName, tabs) => {
    if (isSuperAdmin) return true;
    const module = actions?.modulePermissions?.find(
      (modules) => modules.module === moduleName
    );
    if (!module) return false;
    return module.tabs.some((action) => tabs.includes(action));
  };

  const allowedTabs = useMemo(() => {
    const tabs = [];
    if (tabsPermission("Settings", ["Preferences"])) tabs.push("preferences");
    if (tabsPermission("Settings", ["Company Info"])) tabs.push("company");
    if (tabsPermission("Settings", ["Role & Management"])) tabs.push("roles");
    return tabs;
  }, [actions, isSuperAdmin]);

  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0] || "");
    }
  }, [allowedTabs, activeTab]);


  useEffect(() => {
    getRoles();
  }, []);

  async function getRoles() {
    const data = await apiGet("role");

    setRoles(data?.roles);
  }

  async function changeStatus(body) {
    const roleId = body._id;

    // Add to toggling set
    setTogglingRoles((prev) => new Set(prev).add(roleId));

    try {
      const data = await apiPatch(`role/toggle-status/${roleId}`, { isActive: !body.isActive });

      if (!data?.isSuccess) throw new Error("Failed to update status");

      // Update roles state immutably
      setRoles((prevRoles) =>
        prevRoles.map((role) =>
          role._id === roleId ? { ...role, isActive: !role.isActive } : role
        )
      );

      toast.success(
        `Role ${body.isActive ? "deactivated" : "activated"} successfully`
      );
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      // Remove from toggling set
      setTogglingRoles((prev) => {
        const next = new Set(prev);
        next.delete(roleId);
        return next;
      });
    }
  }

  async function handleConfirm() {
    console.log(selectedRole);
    try {
      const data = await apiDelete(`role/${selectedRole?._id}`);
      if (data?.isSuccess) {
        toast.success("Role deleted successfully!");
      }
      setIsConfirmationOpen(false);
      getRoles();
    } catch (err) {
      toast.error(err.message || "Failed to delete role");
    }
  }

  const [roles, setRoles] = useState([]);

  const [notifications, setNotifications] = useState({
    emailNotifications: false,
    taskAssignments: false,
    projectUpdates: false,
    leaveApprovals: false,
    announcements: false,
  });

  // Initialize theme and colors from localStorage or defaults
  const [themeMode, setThemeMode] = useState(
    () => localStorage.getItem("themeMode") || "light"
  );

  const lightColors = [
    {
      name: "blue",
      value: "oklch(65.5% 0.178 247)",
      border: "border-blue-500",
      bg: "#ADD8E6",
    },
    {
      name: "purple",
      value: "oklch(65% 0.15 270)",
      border: "border-purple-500",
      bg: "#D8BFD8",
    },
    {
      name: "green",
      value: "oklch(70% 0.15 140)",
      border: "border-green-500",
      bg: "#90EE90",
    },
    {
      name: "orange",
      value: "oklch(70% 0.2 40)",
      border: "border-orange-500",
      bg: "#FFA07A",
    },
    {
      name: "pink",
      value: "oklch(70% 0.15 330)",
      border: "border-pink-500",
      bg: "#FFB6C1",
    },
    {
      name: "teal",
      value: "oklch(65% 0.15 180)",
      border: "border-teal-500",
      bg: "#AFEEEE",
    },
  ];

  const darkColors = [
    {
      name: "blue",
      value: "oklch(45% 0.15 247)",
      border: "border-blue-500",
      bg: "#1E90FF",
    },
    {
      name: "purple",
      value: "oklch(45% 0.15 270)",
      border: "border-purple-500",
      bg: "#9370DB",
    },
    {
      name: "green",
      value: "oklch(50% 0.15 140)",
      border: "border-green-500",
      bg: "#3CB371",
    },
    {
      name: "orange",
      value: "oklch(50% 0.2 40)",
      border: "border-orange-500",
      bg: "#FF4500",
    },
    {
      name: "pink",
      value: "oklch(50% 0.15 330)",
      border: "border-pink-500",
      bg: "#FF69B4",
    },
    {
      name: "teal",
      value: "oklch(45% 0.15 180)",
      border: "border-teal-500",
      bg: "#008080",
    },
  ];
  const items = [
    {
      key: "emailNotifications",
      label: "Email Notifications",
      desc: "Receive email updates for important events.",
    },
    {
      key: "taskAssignments",
      label: "Task Assignments",
      desc: "Notify when tasks are assigned to you.",
    },
    {
      key: "projectUpdates",
      label: "Project Updates",
      desc: "Get updates on project milestones.",
    },
    {
      key: "leaveApprovals",
      label: "Leave Approvals",
      desc: "Notify managers of pending leave requests.",
    },
    {
      key: "announcements",
      label: "Announcements",
      desc: "Receive company-wide announcements.",
    },
  ];

  const [lightColor, setLightColor] = useState(() => {
    const saved = localStorage.getItem("lightColor");
    return lightColors.find((color) => color.name === saved)
      ? saved
      : lightColors[0].name;
  });
  const [darkColor, setDarkColor] = useState(() => {
    const saved = localStorage.getItem("darkColor");
    return darkColors.find((color) => color.name === saved)
      ? saved
      : darkColors[0].name;
  });

  // Apply saved theme and colors on mount and updates
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Apply theme
      if (themeMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Apply light color only if in light mode
      if (themeMode === "light") {
        const selectedLightColor = lightColors.find(
          (color) => color.name === lightColor
        );
        if (selectedLightColor) {
          document.documentElement.style.setProperty(
            "--primary",
            selectedLightColor.value
          );
          document.documentElement.style.setProperty(
            "--button",
            selectedLightColor.value
          );
        }
      }

      // Apply dark color only if in dark mode
      if (themeMode === "dark") {
        const selectedDarkColor = darkColors.find(
          (color) => color.name === darkColor
        );
        if (selectedDarkColor) {
          document.documentElement.style.setProperty(
            "--primary",
            selectedDarkColor.value
          );
          document.documentElement.style.setProperty(
            "--button",
            selectedDarkColor.value
          );
        }
      }
    }
  }, [themeMode, lightColor, darkColor]);

  const handleCompanyChange = (e) => {
    setCompanyInfo({ ...companyInfo, [e.target.name]: e.target.value });
  };

  const handleNotificationChange = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
    localStorage.setItem("themeMode", mode);
    if (typeof window !== "undefined") {
      if (mode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  function SwitchToggle({
    name,
    checked,
    onChange, // (nextBool) => void
    className = "",
    size = "md", // "sm" | "md" | "lg"
    disabled = false,
    ariaLabel,
  }) {
    const reduce = useReducedMotion();

    const sizes = {
      sm: { w: 36, h: 20, thumb: 16, pad: 2 },
      md: { w: 44, h: 24, thumb: 20, pad: 2 },
      lg: { w: 56, h: 32, thumb: 28, pad: 2 },
    }[size];

    const trackClasses =
      "relative inline-flex items-center shrink-0 rounded-full border transition-colors duration-200 outline-none " +
      (checked
        ? "bg-[var(--primary)]/90 border-[var(--primary)]/80"
        : "bg-[var(--muted)]/50 border-[var(--border)]");

    const focusRing =
      "focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]";

    const thumbSpring = reduce
      ? { duration: 0 }
      : { type: "spring", stiffness: 420, damping: 28, mass: 0.25 };

    return (
      <label
        className={`inline-flex cursor-pointer select-none ${disabled ? "opacity-60 cursor-not-allowed" : ""
          } ${className}`}
        aria-label={ariaLabel || name}
      >
        <input
          type="checkbox"
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only"
        />

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={ariaLabel || name}
          onClick={() => !disabled && onChange?.(!checked)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              onChange?.(!checked);
            }
            if (e.key === "ArrowLeft") onChange?.(false);
            if (e.key === "ArrowRight") onChange?.(true);
          }}
          className={`${trackClasses} ${focusRing}`}
          style={{
            width: sizes.w,
            height: sizes.h,
            padding: sizes.pad,
          }}
        >
          {/* background sheen */}
          <motion.span
            aria-hidden
            className="absolute inset-0  rounded-full"
            initial={false}
            animate={{
              background: checked
                ? "bg-[var(--button)]  text-[var(--button-text)] mt-2 transition-colors duration-3000 ease-in-out"
                : "bg-[var(--background)]/20 text-[var(--muted-foreground)] mt-0 transition-colors duration-3000 ease-in-out",
            }}
            transition={{ duration: 3 }}
          />

          {/* thumb */}
          <motion.span
            aria-hidden
            className="relative block rounded-full bg-white shadow-md"
            style={{
              width: sizes.thumb,
              height: sizes.thumb,
            }}
            initial={false}
            animate={{
              x: checked ? sizes.w - sizes.thumb - sizes.pad * 2 : 0,
              boxShadow: checked
                ? "0 6px 18px rgba(0,0,0,0.18)"
                : "0 4px 12px rgba(0,0,0,0.12)",
            }}
            transition={thumbSpring}
            whileTap={!disabled ? { scale: reduce ? 1 : 0.95 } : {}}
          />
        </button>
      </label>
    );
  }

  // async function handleConfirm(id) {
  //   const res = await fetch(`${baseUrl}0role/${id}`, {});
  // }

  const handleColorChange = (colorName, mode) => {
    const colors = mode === "light" ? lightColors : darkColors;
    const selectedColor = colors.find((color) => color.name === colorName);

    if (selectedColor && typeof window !== "undefined") {
      const root = document.documentElement;

      // ⚡ Force update after theme activation
      requestAnimationFrame(() => {
        root.style.setProperty("--primary", selectedColor.value);
        root.style.setProperty("--button", selectedColor.value);
      });

      // ✅ Persist selection
      if (mode === "light") {
        setLightColor(colorName);
        localStorage.setItem("lightColor", colorName);
      } else {
        setDarkColor(colorName);
        localStorage.setItem("darkColor", colorName);
      }
    }
  };

  const handleSave = () => {
    localStorage.setItem("themeMode", themeMode);
    localStorage.setItem("lightColor", lightColor);
    localStorage.setItem("darkColor", darkColor);
    console.log("Saved:", {
      companyInfo,
      roles,
      notifications,
      themeMode,
      lightColor,
      darkColor,
    });
  };

  const handleEditPermissions = (role) => {
    setSelectedRole(role);
    setIsAddRoleDialogOpen(true);
  };

  useEffect(() => {
    const activeRoute = window.location.pathname;
    localStorage.setItem("activeRoute", activeRoute);
  }, []);

  return (
    <div className="min-h-screen w-full text-[var(--foreground)] transition-colors duration-300 ease-in-out pb-8">
      <div className="flex justify-between items-center mb-8">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Settings
          </h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            Manage system preferences and configurations
          </p>
        </div>
      </div>

      {/* Debug Element to Verify Color Application */}
      <div
        className="debug-primary w-10 h-10 mb-4"
        title="Debug: Shows --primary color"
      ></div>

      {/* ───── Tabs Section ───── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {hasPermission("Settings", "Access Settings") &&
          allowedTabs.length >= 2 && (
            <TabsList className="hidden sm:flex mb-6 rounded-2xl bg-[var(--foreground)]/10">
              {allowedTabs.includes("preferences") && (
                <TabsTrigger
                  value="preferences"
                  className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
                >
                  Preferences
                </TabsTrigger>
              )}
              {allowedTabs.includes("company") && (
                <TabsTrigger
                  value="company"
                  className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
                >
                  Company Info
                </TabsTrigger>
              )}
              {allowedTabs.includes("roles") && (
                <TabsTrigger
                  value="roles"
                  className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
                >
                  Role & Management
                </TabsTrigger>
              )}
            </TabsList>)
        }
        {allowedTabs.length >= 2 && (
          <div className="sm:hidden text-[var(--foreground)] mb-3">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full border rounded-lg px-3 py-2 text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {allowedTabs.includes("preferences") && (
                  <SelectItem value="preferences">Preferences</SelectItem>
                )}
                {allowedTabs.includes("company") && (
                  <SelectItem value="company">Company Info</SelectItem>
                )}
                {allowedTabs.includes("roles") && (
                  <SelectItem value="roles">Role & Management</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
        {/* ───── Company Info Tab ───── */}
        <TabsContent
          value="company"
          className="transition-opacity duration-300 ease-in-out"
        >
          <div className="p-6 border border-[var(--border)] rounded-[var(--radius-md)]   transition-colors duration-300 ease-in-out">
            <h2 className="text-xl font-semibold mb-4">Company Information</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Update your company details and branding
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">
                  Company Name
                </label>
                <Input
                  name="companyName"
                  value={companyInfo.companyName}
                  onChange={handleCompanyChange}
                  className="mt-1 w-full transition-colors duration-300 ease-in-out"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <Input
                    name="email"
                    value={companyInfo.email}
                    onChange={handleCompanyChange}
                    className="mt-1 w-full transition-colors duration-300 ease-in-out"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <Input
                    name="phone"
                    value={companyInfo.phone}
                    onChange={handleCompanyChange}
                    className="mt-1 w-full transition-colors duration-300 ease-in-out"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Address</label>
                <Input
                  name="address"
                  value={companyInfo.address}
                  onChange={handleCompanyChange}
                  className="mt-1 w-full transition-colors duration-300 ease-in-out"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Website</label>
                  <Input
                    name="website"
                    value={companyInfo.website}
                    onChange={handleCompanyChange}
                    className="mt-1 w-full transition-colors duration-300 ease-in-out"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Industry</label>
                  <Input
                    name="industry"
                    value={companyInfo.industry}
                    onChange={handleCompanyChange}
                    className="mt-1 w-full transition-colors duration-300 ease-in-out"
                  />
                </div>
              </div>
              <Button
                className="bg-[var(--button)] text-[var(--button-text)] mt-4 transition-colors duration-300 ease-in-out"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ───── Roles Tab ───── */}
        <TabsContent
          value="roles"
          className="transition-opacity duration-300 ease-in-out"
        >
          <div className="p-0 border border-[var(--border)] rounded-[var(--radius-md)] transition-colors duration-300 ease-in-out">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:p-5 p-4 sm:justify-between sm:items-center border-b border-[var(--border)]">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Roles & Permissions
                </h2>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                  Manage user roles and access control
                </p>
              </div>
              <Button
                onClick={() => {
                  setIsAddRoleDialogOpen(true);
                  setSelectedRole(null);
                }}
                className="mt-1 sm:mt-0 w-full sm:w-auto justify-center bg-[var(--button)] text-[var(--button-text)] flex items-center gap-2 transition-colors duration-300 ease-in-out"
              >
                <Plus size={18} /> Add Role
              </Button>
            </div>

            <div>
              {roles?.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-[var(--muted-foreground)]">
                  <div className="bg-[var(--foreground)]/5 p-4 rounded-full mb-3">
                    <Shield className="w-8 h-8 text-[var(--muted-foreground)]" />
                  </div>
                  <p className="text-base sm:text-lg font-medium text-[var(--text)]">
                    No Roles Found
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 max-w-md">
                    You haven't created any roles yet. Start by adding one
                    below.
                  </p>
                  <Button
                    onClick={() => setIsAddRoleDialogOpen(true)}
                    className="mt-4 w-full sm:w-auto justify-center bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Role
                  </Button>
                </div>
              ) : (
                roles?.map((role, index) => (
                  <div
                    key={role.name}
                    className={`
    flex flex-col sm:flex-row
    gap-3 sm:gap-4
    px-4 sm:px-5
    py-3
    sm:items-center sm:justify-between
    hover:bg-[var(--foreground)]/10
    transition-colors duration-300 ease-in-out
    ${index !== roles.length - 1 ? "border-b border-[var(--border)]" : ""}
  `}
                  >
                    {/* LEFT — Role info */}
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <Shield className="mt-0.5 sm:mt-0 shrink-0" />

                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {role.name}
                        </p>
                        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] line-clamp-2 sm:line-clamp-1">
                          {role.description}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT — Actions */}
                    <div
                      className="
    flex flex-col sm:flex-row
    gap-2 sm:gap-3
    w-full sm:w-auto
    sm:items-center
  "
                    >
                      {/* Toggle */}
                      <div className="flex justify-between sm:justify-start items-center">
                        <ToggleButton
                          onToggle={() => changeStatus(role)}
                          isLoading={togglingRoles.has(role._id)}
                          isActive={role.isActive}
                        />
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          size="sm"
                          onClick={() => handleEditPermissions(role)}
                          className="flex-1 sm:flex-none border-button whitespace-nowrap"
                        >
                          Edit Permissions
                        </Button>
                        <CustomTooltip tooltipContent="Delete Role">
                          <Button
                            size="sm"
                            onClick={() => {
                              setIsConfirmationOpen(true);
                              setSelectedRole(role);
                            }}
                            className="
          flex-1 sm:flex-none
          bg-transparent
          border border-[var(--border)]
          text-[var(--text)]
          hover:text-red-500
          hover:bg-red-500/20
          justify-center
        "
                          >
                            <Trash2 size={16} />
                          </Button>
                        </CustomTooltip>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* ───── Notifications Tab ───── */}
        <TabsContent
          value="notifications"
          className="transition-opacity duration-300 ease-in-out"
        >
          <div className="p-6 border border-[var(--border)] rounded-[var(--radius-md)] transition-colors duration-300 ease-in-out bg-[var(--background)]/80">
            <h2 className="text-xl font-semibold mb-4">
              Notification Preferences
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Configure system notifications and alerts
            </p>

            <div className="space-y-5">
              {items.map(({ key, label, desc }) => {
                const isOn = !!notifications[key];
                return (
                  <div
                    key={key}
                    className="rounded-[var(--radius-sm)] border border-[var(--border)]/70 bg-[var(--background)]/60 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <label
                          htmlFor={`notif-${key}`}
                          className="text-sm font-medium"
                        >
                          {label}
                        </label>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-2">
                          {desc}
                        </p>
                      </div>

                      {/* Switch toggle wired to your handler */}

                      <ToggleButton
                        name={`notif-${key}`}
                        checked={isOn}
                        onChange={(next) =>
                          handleNotificationChange({
                            target: {
                              name: key,
                              type: "checkbox",
                              checked: next,
                            },
                          })
                        }
                        size="md"
                        ariaLabel={label}
                      />
                    </div>
                  </div>
                );
              })}

              <Button
                className="bg-[var(--button)] text-[var(--button-text)] mt-2 transition-colors duration-300 ease-in-out w-full sm:w-auto"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ───── Preferences Tab ───── */}
        <TabsContent
          value="preferences"
          className="transition-opacity duration-300 ease-in-out"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl shadow-xl"
          >
            <h2 className="text-2xl font-bold mb-2 text-[var(--primary)]  ">
              Appearance Preferences
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-8">
              Customize your visual experience with themes and accent colors.
            </p>

            {/* --- Theme Mode Cards --- */}
            <div
              role="radiogroup"
              aria-label="Theme Mode"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
            >
              {[
                {
                  mode: "light",
                  icon: Sun,
                  label: "Light Mode",
                  desc: "Bright, clean, and energetic",
                  glow: "shadow-yellow-400/40",
                  iconBg: "bg-gradient-to-br from-yellow-400 to-amber-500",
                },
                {
                  mode: "dark",
                  icon: Moon,
                  label: "Dark Mode",
                  desc: "Easy on the eyes at night",
                  glow: "shadow-purple-500/50",
                  iconBg: "bg-gradient-to-br from-purple-500 to-indigo-600",
                },
              ].map((item) => {
                const isSelected = themeMode === item.mode;
                return (
                  <motion.button
                    key={item.mode}
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleThemeChange(item.mode)}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative p-[2px] cursor-pointer rounded-2xl overflow-hidden transition-all duration-50 ${isSelected
                      ? "shadow-2xl bg-gradient-to-r from-[var(--primary)]/60 to-transparent"
                      : "border-1 border-[var(--border)] hover:border-[var(--primary)]/40"
                      }`}
                  >
                    {/* Inner glass card */}
                    <div className="relative rounded-2xl bg-[var(--background)]/85 backdrop-blur-xl p-6 text-center transition-all duration-300">
                      {/* Glow pulse */}
                      {isSelected && (
                        <div
                          className={`absolute inset-0 ${item.glow} blur-2xl opacity-40 animate-pulse`}
                        />
                      )}

                      <div className="relative z-10 flex flex-col items-center">
                        <div
                          className={`mb-4 w-16 h-16 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-lg`}
                        >
                          <item.icon className="w-8 h-8 text-white" />
                        </div>

                        <h3
                          className={`font-semibold text-lg ${isSelected
                            ? "text-[var(--foreground)]"
                            : "text-[var(--foreground)]/90"
                            }`}
                        >
                          {item.label}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                          {item.desc}
                        </p>
                      </div>

                      {/* Indicator line */}
                      {isSelected && (
                        <motion.div
                          layoutId="theme-indicator"
                          className="absolute left-4 right-4 bottom-2 h-[3px] rounded-full bg-[var(--primary)]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.25 }}
                        />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* --- Accent Color Palette --- */}
            <AnimatePresence mode="wait">
              {themeMode && (
                <motion.div
                  key={themeMode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <p className="text-sm font-medium">
                    {themeMode === "light" ? "Light" : "Dark"} Mode Accent Color
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mb-4">
                    Choose your preferred accent color.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {(themeMode === "light" ? lightColors : darkColors).map(
                      (color) => {
                        const isActive =
                          color.name ===
                          (themeMode === "light" ? lightColor : darkColor);
                        return (
                          <motion.button
                            key={color.name}
                            onClick={() =>
                              handleColorChange(color.name, themeMode)
                            }
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative w-14 h-14 rounded-xl cursor-pointer border-2 transition-all duration-300 ${isActive
                              ? "border-[var(--primary)] shadow-lg scale-105"
                              : "border-[var(--border)] hover:border-[var(--primary)]/50"
                              }`}
                            style={{
                              background: color.bg,
                              boxShadow: isActive
                                ? `0 0 20px ${color.glow || color.bg}80`
                                : "none",
                            }}
                          >
                            {isActive && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center"
                              >
                                <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-4 h-4 text-[var(--primary)]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      }
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </TabsContent>
      </Tabs>

      <GlobalDialog
        className={'w-4xl h-[800px]'}
        label={selectedRole ? "Edit Role" : "Add Role"}
        open={isAddRoleDialogOpen}
        onClose={() => {
          setIsAddRoleDialogOpen(false);
        }}
      >
        <AddRoleDialog
          onClose={() => {
            setIsAddRoleDialogOpen(false), getRoles();
          }}
          role={selectedRole}
        ></AddRoleDialog>
      </GlobalDialog>

      <Confirmation
        open={isConfirmationOpen}
        onClose={() => {
          setIsConfirmationOpen(false), getRoles();
        }}
        onConfirm={handleConfirm}
      ></Confirmation>
    </div>
  );
}

export default Settings;
