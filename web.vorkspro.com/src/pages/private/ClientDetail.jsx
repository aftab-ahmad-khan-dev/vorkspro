import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  Building,
  Users,
  DollarSign,
  Calendar,
  PencilIcon,
  Briefcase,
  FileText,
  StickyNote,
  User,
  Repeat,
  Target,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GlobalDialog from "@/models/GlobalDialog"; // Adjust path if needed
import ChangeStatusDialog from "@/models/employees/ChangeStatusDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTabs } from "@/context/TabsContext";
import { apiGet, apiPatch } from "@/interceptor/interceptor";
import Chip from "@/components/Chip";
import ProfilePicture from "@/components/ProfilePicture";
import EmptyState from "@/components/EmptyState";
// import EditClientDialog from "@/models/clients/EditClientDialog"; // Create this if needed

function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  const fileUrl = import.meta.env.VITE_APP_FILE_URL;
  const token = localStorage.getItem("token");
  const { actions } = useTabs()
  const isSuperAdmin = actions?.isSuperAdmin || false;
  const hasDetailTabsPermission = (moduleName, requiredTabs) => {
    if (isSuperAdmin) return true;

    return actions?.modulePermissions?.some(
      (modules) => {
        const currentModule = modules.module == moduleName
        if (currentModule == true) {
          return modules.detailTabs.includes(requiredTabs)
        }
      }
    );
  };

  const detailTabsCount = [
    hasDetailTabsPermission("Client Management", "Overview"),
    hasDetailTabsPermission("Client Management", "Projects"),
    hasDetailTabsPermission("Client Management", "Documents"),
    hasDetailTabsPermission("Client Management", "Notes"),
  ].filter(Boolean).length;
  
  console.log(detailTabsCount)
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

  const availableTabs = [];

  useEffect(() => {
    actions?.modulePermissions?.forEach((modules) => {
      if (modules.module == "Client Management") {
        // DetailTabsLength = modules.detailTabs.length

        // Build available tabs array based on permissions
        if (modules.detailTabs.includes("Overview")) {
          availableTabs.push("overview");
        }
        if (modules.detailTabs.includes("Projects")) {
          availableTabs.push("projects");
        }
        if (modules.detailTabs.includes("Documents")) {
          availableTabs.push("documents");
        }
        if (modules.detailTabs.includes("Notes")) {
          availableTabs.push("notes");
        }

        console.log(availableTabs)

        // Set first available tab as default if not already set
        if (availableTabs.length > 0 && !activeTab) {
          console.log(availableTabs)
          setActiveTab(availableTabs[0]);
        }
      }
    });
  }, [actions?.modulePermissions, activeTab]);


  // Helper functions
  const get = (val, fallback = "N/A") => (val && val !== "" ? val : fallback);
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      : "N/A";

  const fetchClientDetail = async () => {
    setLoading(true);
    try {
      const data = await apiGet(`client/get/${id}`);
      if (data.isSuccess && data.client) {
        setClient(data.client);
      }
    } catch (e) {
      console.error("Error fetching client:", e);
    } finally {
      setLoading(false);
    }
  };

  const confirmStatusChange = async () => {
    if (!newStatus || newStatus === client.status) return;

    setLoading(true);

    try {
      const data = await apiPatch(`client/update-status/${client._id}`, { status: newStatus });
      if (data.isSuccess == true) {
        setNewStatus("");
        setOpenStatusDialog(false);
        fetchClientDetail();
        toast.success("Status updated successfully.");
      } else {
        toast.error(data.message || "Failed to update status.");
      }
    } catch (error) {
      toast.error("Failed to update status.");
      console.log(error);
    }
  };

  useEffect(() => {
    fetchClientDetail();
  }, [id]);

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen p-8 space-y-8 animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="h-10 w-32 bg-[var(--border)] rounded"></div>
            <div className="h-6 w-48 ml-28 bg-[var(--border)] rounded"></div>
          </div>
          <div className="h-10 w-36 bg-[var(--border)] rounded"></div>
        </div>

        {/* Main Card */}
        <div className="space-y-6">
          <div className="p-6 border border-[var(--border)] rounded-2xl space-y-6">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--border)]"></div>
              <div className="space-y-3 flex-1">
                <div className="h-7 w-64 bg-[var(--border)] rounded"></div>
                <div className="h-5 w-48 bg-[var(--border)] rounded"></div>
                <div className="flex gap-3">
                  <div className="h-6 w-32 bg-[var(--border)] rounded"></div>
                  <div className="h-6 w-28 bg-[var(--border)] rounded"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-[var(--border)] rounded"></div>
                  <div className="h-4 w-44 bg-[var(--border)] rounded"></div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="h-12 w-full max-w-md bg-[var(--border)] rounded-2xl mb-6"></div>
            <div className="p-6 border border-[var(--border)] rounded-2xl space-y-6">
              <div className="h-6 w-40 bg-[var(--border)] rounded"></div>
              <div className="border border-[var(--border)] rounded-lg p-4">
                <div className="h-32 bg-[var(--border)]/50 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center text-[var(--muted-foreground)]">
        Client not found.
      </div>
    );
  }

  const fullAddress = [
    client?.address?.street,
    client?.address?.city,
    client?.address?.state,
    client?.address?.country,
    client?.address?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  const statusColor =
    client.status === "active"
      ? "bg-green-600/20 text-green-600"
      : client.status === "inactive"
        ? "bg-red-500/20 text-red-500"
        : client.status === "lead"
          ? "bg-blue-600/20 text-blue-600"
          : client.status === "paused"
            ? "bg-orange-600/20 text-orange-600"
            : "bg-gray-500/20 text-gray-500";

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Left Section */}
          <div className="w-full">
            <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Left side: Back + Title/Desc */}
              <div className="flex flex-col gap-2 sm:gap-3">
                {/* Back button row */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="border-button w-full sm:w-auto justify-center sm:justify-start"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </div>

                {/* Title + description */}
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--foreground)] leading-tight">
                    Client Details
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-[var(--muted-foreground)] mt-1">
                    Complete client information and history
                  </p>
                </div>
              </div>

              {/* Right side: Actions */}
              {
                hasPermission("Client Management", "Edit Records") && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                    <Button
                      className="w-full sm:w-auto flex items-center justify-center gap-2"
                      onClick={() => setOpenStatusDialog(client)}
                    >
                      <Target className="w-4 h-4" />
                      Change Status
                    </Button>
                  </div>
                )
              }
            </div>
          </div>

          {/* Optional right-side button (responsive, full-width on mobile) */}
          {/* 
    <Button
      className="border-button w-full sm:w-auto"
      onClick={() => setShowEditDialog(true)}
    >
      <PencilIcon className="w-4 h-4" />
      Edit Client
    </Button>
    */}
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-lg">
        <div className="border border-[var(--border)] rounded-2xl p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-base font-medium sm:text-xl border border-indigo-500/30 bg-indigo-500/15 text-indigo-600 shrink-0">
              {client.name
                ?.split(" ")
                .map((n) => n?.[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "NA"}
            </div>

            {/* Name + meta */}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] leading-tight break-words">
                {get(client.name)}
              </h2>

              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 break-words">
                {get(client.industry?.name)}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span
                  className={`px-2 py-1 ${statusColor} text-xs font-medium rounded-full capitalize`}
                >
                  {get(client.status)}
                </span>

                <span className="px-2 py-1 border border-[var(--border)] rounded-lg text-[var(--foreground)] text-xs capitalize">
                  {get(client.type)}
                </span>
              </div>
            </div>
          </div>

          {/* Divider spacing */}
          <div className="mt-5 sm:mt-6" />

          {/* Info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-x-8 text-sm">
            <div className="flex items-start gap-2 text-[var(--foreground)] min-w-0">
              <Mail className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="break-words min-w-0">{get(client.email)}</span>
            </div>

            <div className="flex items-start gap-2 text-[var(--foreground)] min-w-0">
              <User className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="break-words min-w-0">
                {get(client.contactName)}
              </span>
            </div>

            <div className="flex items-start gap-2 text-[var(--foreground)] min-w-0 md:col-span-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="break-words min-w-0">
                {get(fullAddress, "No address provided")}
              </span>
            </div>

            <div className="flex items-start gap-2 text-[var(--foreground)] min-w-0">
              <Globe className="w-4 h-4 mt-0.5 shrink-0" />
              {!client.website ? (
                <span className="text-[var(--muted-foreground)]">N/A</span>
              ) : (
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate max-w-[240px] sm:max-w-[320px] md:max-w-full"
                  title={client.website}
                >
                  {get(client.website)}
                </a>
              )}
            </div>

            {client.type === "company" && (
              <div className="flex items-start gap-2 text-[var(--foreground)] min-w-0">
                <Users className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="break-words min-w-0">
                  {get(client.companySize)} employees
                </span>
              </div>
            )}

            <div className="flex items-start gap-2 text-[var(--foreground)] min-w-0">
              <Phone className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="break-words min-w-0">{get(client.phone)}</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-5">
          {detailTabsCount > 1 && (
            <TabsList className="hidden sm:flex mb-6 rounded-2xl bg-[var(--foreground)]/10">
              {hasDetailTabsPermission("Client Management", "Overview") && (
                <TabsTrigger
                  value="overview"
                  className="rounded-2xl py-2 text-sm font-medium"
                >
                  Overview
                </TabsTrigger>
              )}
              {hasDetailTabsPermission("Client Management", "Projects") && (
                <TabsTrigger
                  value="projects"
                  className="rounded-2xl py-2 text-sm font-medium"
                >
                  Projects
                </TabsTrigger>
              )}
              {hasDetailTabsPermission("Client Management", "Documents") && (
                <TabsTrigger
                  value="documents"
                  className="rounded-2xl py-2 text-sm font-medium"
                >
                  Documents
                </TabsTrigger>
              )}
              {hasDetailTabsPermission("Client Management", "Notes") && (
                <TabsTrigger
                  value="notes"
                  className="rounded-2xl py-2 text-sm font-medium"
                >
                  Notes
                </TabsTrigger>
              )}
            </TabsList>
          )}

          {detailTabsCount > 1 && (
            <div className="sm:hidden text-[var(--foreground)] mb-3">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full border rounded-lg px-3 py-2 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                  <SelectItem value="notes">Notes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="p-6 border rounded-2xl border-[var(--border)] space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  Company Overview
                </h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {get(client.description, "No description provided.")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="border border-[var(--border)] rounded-lg p-5">
                  <p className="text-sm text-[var(--foreground)] mb-1">
                    Industry
                  </p>
                  <p className="text-lg font-semibold text-[var(--foreground)]">
                    {get(client.industry?.name)}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {get(client.industry?.sector)}
                  </p>
                </div>
                {client.type === "company" && (
                  <div className="border border-[var(--border)] rounded-lg p-5">
                    <p className="text-sm text-[var(--foreground)] mb-1">
                      Company Size
                    </p>
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      {get(client.companySize)}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Employees
                    </p>
                  </div>
                )}
                <div className="border border-[var(--border)] rounded-lg p-5">
                  <p className="text-sm text-[var(--foreground)] mb-1">
                    Annual Revenue
                  </p>
                  {/* // TODO: Add revenue */}
                  <p className="text-lg font-semibold text-[var(--foreground)]">
                    {client.revenue > 0
                      ? `$${client.revenue.toLocaleString()}`
                      : "Not disclosed"}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Estimated
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="text-[var(--muted-foreground)]">
                  Added on {formatDate(client.createdAt)}
                </span>
              </div>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <div className="p-6 border rounded-2xl border-[var(--border)]">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Assigned Projects
              </h3>
              {client.projects?.length > 0 ? (
                <div className="space-y-4">
                  {client.projects.map((project) => (
                    <div
                      key={project._id}
                      className="border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(`/app/projects/project-detail/${project._id}`)}
                    >
                      {/* Top Section */}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-[var(--foreground)] text-lg mb-1">
                            {project.name}
                          </p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {project.description || "No description"}
                          </p>
                        </div>

                        <div className="text-right">
                          {/* <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium capitalize">
                            {project.status}
                          </span> */}
                          <Chip status={project.status}></Chip>
                          <p className="text-xs text-[var(--muted-foreground)] mt-2">
                            {formatDate(project.startDate)} →{" "}
                            {formatDate(project.endDate)}
                          </p>
                        </div>
                      </div>

                      {/* Manager */}
                      <div className="mt-4">
                        <p className="text-foreground text-sm font-medium mb-1">
                          Project Manager
                        </p>
                        <div className="flex items-center gap-3"

                        >
                          {/* <div className="w-9 h-9 rounded-full bg-[var(--border)] flex items-center justify-center text-sm font-medium"

                          >
                            {project.projectManager
                              ? `${project.projectManager.firstName[0]}${project.projectManager.lastName[0]}`
                              : "NA"}
                          </div> */}
                          <ProfilePicture name={project.projectManager?.firstName} profilePicture={project.projectManager?.profilePicture}></ProfilePicture>
                          <div>
                            <p className="font-medium text-[var(--foreground)]">
                              {project.projectManager
                                ? `${project.projectManager.firstName} ${project.projectManager.lastName}`
                                : "Not Assigned"}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {project.projectManager?.email || ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Team Members */}
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-1 text-foreground">
                          Team Members ({project.teamMembers?.length ?? 0})
                        </p>

                        <div className="flex flex-wrap gap-3">
                          {project.teamMembers?.map((member) => {
                            const initials = `${member.firstName[0]}${member.lastName[0]}`;
                            return (
                              <div
                                key={member._id}
                                className="flex items-center gap-2 px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-white hover:bg-[var(--border)] transition-colors"
                              >
                                <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center text-xs font-medium">
                                  {initials}
                                </div>
                                <span className="text-[var(--foreground)] font-medium">
                                  {member.firstName} {member.lastName}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Briefcase className="w-12 h-12 text-[var(--muted-foreground)] mb-3" />
                  <p className="text-lg text-foreground font-medium">No projects assigned</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    This client has no active or past projects.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <div className="p-6 border rounded-2xl border-[var(--border)]">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-5">
                Client Documents
              </h3>

              {client.documents?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {client.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border border-[var(--border)] bg-[var(--background-secondary)] rounded-lg px-4 py-3 hover:border-[var(--primary)] transition-colors"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <FileText className="w-5 h-5 text-[var(--muted-foreground)] shrink-0" />
                        <p className="font-medium text-[var(--foreground)] truncate">
                          {doc.name || `Document ${idx + 1}`}
                        </p>
                      </div>

                      <a
                        href={fileUrl + doc?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-button h-10 w-20 text-center py-2 rounded-lg text-sm font-medium "
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={FileText} title="No Document Uploaded" subtitle="Files for this client will appear here."></EmptyState>
              )}
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <div className="p-6 border rounded-2xl border-[var(--border)]">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Internal Notes
              </h3>
              {client.notes ? (
                <div className="bg-[var(--foreground)]/5 border border-[var(--border)] rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
                </div>
              ) : (
                <EmptyState icon={File} title="No notes" subtitle="Add internal notes about this client for your team."></EmptyState>

              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <GlobalDialog
        open={openStatusDialog}
        label="Change Client Status"
        onClose={() => {
          setOpenStatusDialog(false);
        }}
      >
        {client && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg">{client.name}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Current Status:{" "}
                <span className="font-medium">{client.status}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {["lead", "active", "paused", "inactive"].map((s) => {
                    // const optStyle = getStatusStyle(s);
                    return (
                      <SelectItem key={s} value={s} className={`font-medium`}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={confirmStatusChange}
                disabled={!newStatus || newStatus === client.status || loading}
              >
                {/* show loader */}
                {loading && <Loader2 className="animate-spin mr-2" />}
                {loading ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        )}
      </GlobalDialog>
    </div>
  );
}

export default ClientDetail;
