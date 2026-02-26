import React, { useEffect, useState, useCallback } from "react";
import {
  Eye,
  Pencil,
  Plus,
  Download,
  Search,
  Settings,
  MoreHorizontal,
  Clock,
  Repeat,
  CheckCircle,
  Building2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlobalDialog from "@/models/GlobalDialog";
import CreateDialog from "@/models/client/CreateDialog";
import Pagination from "@/components/UsePagination";
import StatCard from "@/components/Stats";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import ChatDialog from "@/models/client/ChatDialog";
import CustomTooltip from "@/components/Tooltip";
import { useTabs } from "@/context/TabsContext";
import { apiGet, apiGetByFilter, apiPatch } from "@/interceptor/interceptor";
import EmptyState from "@/components/EmptyState";

function Client() {
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();
  const [stat, setStat] = useState({});
  const [industries, setIndustries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statLoading, setStatLoading] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All Clients");
  const [searchTerm, setSearchTerm] = useState("");
  const [exportStatus, setExportStatus] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalItems: 0,
    totalPages: 1,
    lastPage: 1,
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [selectedChatClient, setSelectedChatClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const { actions } = useTabs()
  const isSuperAdmin = actions?.isSuperAdmin || false;

  // Status Change Dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;

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

  const fetchIndustries = async () => {
    try {
      const data = await apiGet("industry/get-active-list");
      if (data?.isSuccess) setIndustries(data.filteredData.industryTypes);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await apiGet("project/get-all");
      if (data?.isSuccess) setProjects(data.filteredData.projects);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchClientStats = async () => {
    try {
      setStatLoading(true);
      const data = await apiGet("client/get-stats");
      if (data?.isSuccess) {
        setStat(data?.stats ?? {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStatLoading(false);
    }
  };

  const fetchClients = async (page = 1, search = "", status = "") => {
    setLoading(true);
    try {
      const data = await apiGetByFilter("client/get-by-filter", {
        page,
        size: pagination.size,
        sort: "createdAt",
        order: "desc",
        search,
        status: status && status !== "All Clients" ? status.toLowerCase() : '',
      });

      if (data?.isSuccess) {
        setClients(data.filteredData?.clients ?? []);
        setPagination({
          page: data.filteredData.pagination.page,
          size: data.filteredData.pagination.size,
          totalItems: data.filteredData.pagination.totalItems,
          totalPages: data.filteredData.pagination.totalPages,
          lastPage: data.filteredData.pagination.lastPage,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  STATUS CHANGE HANDLER                                            */
  /* ------------------------------------------------------------------ */
  const openStatusDialog = (client) => {
    setSelectedClient(client);
    setNewStatus(client.status);
    setStatusDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedClient || newStatus === selectedClient.status) {
      setStatusDialogOpen(false);
      return;
    }

    try {
      const data = await apiPatch(`client/update-status/${selectedClient._id}`, {
        status: newStatus,
      });
      if (!data.isSuccess) throw new Error(data.message || "Failed");

      // ── UPDATE UI IMMEDIATELY ───────────────────────
      setClients((prev) =>
        prev.map((c) =>
          c._id === selectedClient._id ? { ...c, status: newStatus } : c
        )
      );

      +(
        // ── REFRESH LIST WITH CURRENT FILTER (TAB) ───────
        (+(
          // This removes the client from the current tab if status changed
          (+(await fetchClients(pagination.page, searchTerm, activeTab)))
        ))
      );

      setStatusDialogOpen(false);
      toast.success("Status updated successfully");
      await fetchClientStats();
    } catch (e) {
      toast.error(e.message || "Failed to update status");
      -(await fetchClients(pagination.page, searchTerm, activeTab));
      +(
        // Keep consistent – also refresh with current tab on error
        (+(await fetchClients(pagination.page, searchTerm, activeTab)))
      );
    } finally {
      setSelectedClient(null);
      setNewStatus("");
    }
  };

  /* ------------------------------------------------------------------ */
  /*  CALLBACKS                                                        */
  /* ------------------------------------------------------------------ */
  const onSuccess = useCallback(async () => {
    setIsCreateDialogOpen(false);
    setEditingClient(null);
    await fetchClients(pagination.page, searchTerm, activeTab);
    await fetchClientStats();
  }, [pagination.page, searchTerm, activeTab]);

  const handleEdit = (client) => {
    setEditingClient(client);
    setIsCreateDialogOpen(true);
  };

  // const handleDelete = async (id) => {
  //   if (!confirm("Delete this client?")) return;
  //   try {
  //     await fetch(`${baseUrl}client/${id}`, {
  //       method: "DELETE",
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     toast.success("Client deleted");
  //     await fetchClients(pagination.page, searchTerm, activeTab);
  //     await fetchClientStats();
  //   } catch (e) {
  //     toast.error("Failed to delete");
  //   }
  // };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      fetchClients(newPage, searchTerm, activeTab);
    }
  };
  // const STATUS_STYLES = {
  //   Overdue: {
  //     color: "bg-red-600/20",
  //     text: " text-red-500",
  //     icon: <AlertCircle className="w-3.5 h-3.5" />,
  //   },
  //   "Due Soon": {
  //     color: "bg-blue-600/20 ",
  //     text: "text-blue-500",
  //     icon: <Clock className="w-3.5 h-3.5" />,
  //   },
  //   Upcoming: {
  //     color: "bg-green-600/20 ",
  //     text: "text-green-500",
  //     icon: <CheckCircle className="w-3.5 h-3.5" />,
  //   },
  // };

  const tabKeys = {
    "All Clients": "totalClients",
    Lead: "leadClients",
    Active: "activeClients",
    Paused: "pausedClients",
    Inactive: "inactiveClients",
  };

  /* ------------------------------------------------------------------ */
  /*  STATUS STYLES                                                    */
  /* ------------------------------------------------------------------ */
  const statusStyles = {
    lead: { bg: "bg-blue-500/20", text: "text-blue-500" },
    active: { bg: "bg-green-500/20", text: "text-green-500" },
    paused: { bg: "bg-orange-500/20", text: "text-orange-500" },
    inactive: { bg: "bg-red-500/20", text: "text-red-500" },
  };

  const getStatusStyle = (status) =>
    statusStyles[status] || statusStyles.inactive;

  /* ------------------------------------------------------------------ */
  /*  EFFECTS                                                          */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    fetchIndustries();
    fetchProjects();
    fetchClientStats();
  }, []);

  // Combined effect for all client fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(1, searchTerm, activeTab);
    }, searchTerm ? 500 : 0); // Debounce only for search, immediate for tab changes

    return () => clearTimeout(timer);
  }, [searchTerm, activeTab]);

  /* ------------------------------------------------------------------ */
  /*  SKELETON ROW                                                     */
  /* ------------------------------------------------------------------ */
  const SkeletonRow = () => (
    <tr className="border-b border-[var(--border)] animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-[var(--border)] rounded w-full"></div>
        </td>
      ))}
    </tr>
  );

  // const followUps = [
  //   {
  //     id: 1,
  //     name: "StartupXYZ",
  //     lastContact: "2025-10-18",
  //     assignedTo: "Mike Chen",
  //     status: "Due Soon",
  //     statusColor: "bg-blue-600",
  //   },
  //   {
  //     id: 2,
  //     name: "Enterprise Inc",
  //     lastContact: "2025-09-28",
  //     assignedTo: "John Davis",
  //     status: "Overdue",
  //     statusColor: "bg-red-600",
  //   },
  // ];
  const exportClientsToCSV = (status) => {
    // 1️⃣ Filter data
    let data = [...clients];

    if (status !== "all") {
      data = data.filter((c) => c.status === status);
    }

    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    // 2️⃣ CSV Headers
    const headers = [
      "Client Name",
      "Contact Person",
      "Phone",
      "Email",
      "Industry",
      "Projects",
      "Revenue",
      "Status",
    ];

    // 3️⃣ Rows
    const rows = data.map((c) => [
      `"${c.name || ""}"`,
      `"${c.contactName || ""}"`,
      `"${c.phone || ""}"`,
      `"${c.email || ""}"`,
      `"${c.industry?.name || ""}"`,
      `"${c.projects?.length ?? 0}"`,
      `"${c.revenue ?? 0}"`,
      `"${c.status}"`,
    ]);

    // 4️⃣ Combine CSV
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    // 5️⃣ Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `clients-${status}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Export successful");
    setIsExportDialogOpen(false);
  };

  /* ------------------------------------------------------------------ */
  /*  RENDER                                                           */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen w-full text-[var(--foreground)] pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-8">
        {/* Left Section */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            Client Management
          </h1>
          <p className="text-sm sm:text-base text-[var(--muted-foreground)] mt-1">
            Manage client relationships and contracts
          </p>
        </div>

        {/* Right Section */}
        {
          hasPermission("Client Management", "Create Records") && (
            <div className="flex justify-center sm:justify-end">
              <Button
                onClick={() => {
                  setEditingClient(null);
                  setIsCreateDialogOpen(true);
                }}
                className="bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base w-full sm:w-auto"
              >
                <Plus size={18} />
                <span className="text-sm">Add Client</span>
              </Button>
            </div>
          )
        }
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8 w-full">
        <StatCard
          value={stat?.totalClients}
          isLoading={statLoading}
          title="Total Clients"
        />
        <StatCard
          value={stat?.activeClients}
          isLoading={statLoading}
          title="Active Clients"
        />
        <StatCard value={0} isLoading={statLoading} title="Total Revenue" />
        <StatCard value={0} isLoading={statLoading} title="Active Projects" />
        <StatCard
          value={0}
          isLoading={statLoading}
          title="Follow-ups Due"
          cardClass={
            stat?.followUpsDue > 0 &&
            "dark:bg-[var(--background)] bg-[#fff7ed] dark:border-[var(--border)] border-2 border-orange-200"
          }
        />
      </div>

      {/* <div className="border border-orange-400/30 bg-[var(--background)] rounded-lg p-4 sm:p-6 mb-7">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
          <span className="text-orange-500">
            <AlertCircle className="w-5 h-5" />
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Follow-ups Due This Week
          </h2>
        </div>

        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Clients requiring immediate attention
        </p>

        <div className="space-y-3">
          {followUps.map((item) => {
            const style =
              STATUS_STYLES[item.status] || STATUS_STYLES["Upcoming"];
            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-[var(--border)] rounded-lg"
              >
                <div className="flex gap-3 ">
                  <div className="w-10 h-10 rounded-full bg-[var(--border)] flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-[var(--foreground)]" />
                  </div>

                  <div className="">
                    <h3 className="text-[var(--foreground)] text-sm  truncate">
                      {item.name}
                    </h3>
                    <p className="text-[var(--muted-foreground)] text-xs ">
                      Last contact: {item.lastContact} • Assigned to{" "}
                      {item.assignedTo}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <span
                    className={`text-xs font-medium px-3 py-1.5 rounded-full flex items-center justify-center gap-1 ${
                      style.color
                    } ${style.text ?? "text-white"}`}
                  >
                    {style.icon}
                    {item.status}
                  </span>

                  <Button className="w-full sm:w-auto">Add Follow-up</Button>
                </div>
              </div>
            );
          })}
        </div>
      </div> */}

      {/* Tabs + Search */}
      <div className="p-6 border border-[var(--border)] rounded-lg mb-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="hidden sm:block">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="flex gap-2 rounded-2xl bg-[var(--foreground)]/10 p-1 overflow-x-auto">
                {Object.keys(tabKeys).map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    className="rounded-2xl px-4 py-2 text-sm font-medium whitespace-nowrap"
                  >
                    {t} ({stat[tabKeys[t]] ?? "-"})
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="sm:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full border rounded-lg px-3 py-2 text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(tabKeys).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t} ({stat[tabKeys[t]] ?? "-"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end w-full">
            <div className="relative w-full sm:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <Input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            {hasPermission("Client Management", "Export Data") && (
              <Button
                className="border-button w-full sm:w-auto"
                onClick={() => setIsExportDialogOpen(true)}
              >
                <Download size={18} className="mr-2" />
                Export
              </Button>
            )}

          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Contact Person
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Industry
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: pagination.size }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <EmptyState
                      icon={Building2}
                      title="No clients found"
                      subtitle="Try adjusting your search or filters, or add your first client"
                    />
                  </td>
                </tr>
              ) : (
                clients.map((client) => {
                  const style = getStatusStyle(client.status);

                  return (
                    <tr
                      key={client._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => hasPermission("Client Management", "View Details") && navigate(`/app/clients/client-detail/${client._id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          hasPermission("Client Management", "View Details") && navigate(`/app/clients/client-detail/${client._id}`);
                        }
                      }}
                      className="border-b border-[var(--border)] hover:bg-[var(--border)]/30 cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="space-y-1">
                            <p className="font-semibold text-sm">
                              {client.name}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)] flex gap-1 items-center">
                              {client.address && <MapPin size={13} />}
                              {client.address?.city
                                ? `${client?.address?.city}, ${client?.address?.country}`
                                : client?.address?.country}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                        {client.contactName || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--muted-foreground)] flex flex-col items-start gap-3">
                        {/* Phone */}
                        {client.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone
                              size={14}
                              className="text-[var(--text-muted)]"
                            />
                            <span>{client.phone}</span>
                          </span>
                        ) : (
                          "-"
                        )}

                        {/* Email */}
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <Mail
                              size={14}
                              className="text-[var(--text-muted)]"
                            />
                            <span>{client.email}</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                        {client.industry?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                        {client.projects?.length ?? 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                        ${client.revenue?.toLocaleString() ?? 0}
                      </td>

                      {/* STATUS BADGE */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
                        >
                          {client.status?.charAt(0).toUpperCase() +
                            client.status?.slice(1)}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          <CustomTooltip tooltipContent="Communication History">
                            <Button
                              className="bg-transparent hover:text-[var(--button)] text-[var(--button)] hover:bg-[var(--button)]/20"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedChatClient(client);
                                setIsChatDialogOpen(true);
                              }}
                            >
                              <MessageCircle size={16}></MessageCircle>
                            </Button></CustomTooltip>
                          {hasPermission("Client Management", "View Details") && (
                            <CustomTooltip tooltipContent="View Details">
                              <Button
                                className="bg-transparent hover:text-[var(--button)] text-[var(--button)] hover:bg-[var(--button)]/20"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/app/clients/client-detail/${client._id}`);
                                }}
                              >
                                <Eye size={16} />
                              </Button>
                            </CustomTooltip>
                          )}
                          {hasPermission("Client Management", "Edit Records") && (
                            <CustomTooltip tooltipContent="Update Client">
                              <Button
                                onClick={(e) => { e.stopPropagation(); handleEdit(client); }}
                                className="bg-transparent text-green-500 hover:bg-green-500/20 hover:text-green-500"
                                size="sm"
                                variant="ghost"
                              >
                                <Pencil size={16} />
                              </Button>
                            </CustomTooltip>
                          )}
                          {hasPermission("Client Management", "Edit Records") && (
                            <CustomTooltip tooltipContent="Update Status">
                              <Button
                                onClick={(e) => { e.stopPropagation(); openStatusDialog(client); }}
                                className="bg-transparent text-orange-500 hover:bg-orange-500/20 hover:text-orange-500"
                                size="sm"
                                variant="ghost"
                              >
                                <Repeat size={16} />
                              </Button>
                            </CustomTooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {clients.length > 0 && !loading && (
        <div className="mt-6 flex justify-between items-center text-sm text-[var(--muted-foreground)]">
          <p>
            Showing {clients.length} of {pagination.totalItems} clients
          </p>
          <Pagination
            total={pagination.totalItems}
            current={pagination.page}
            pageSize={pagination.size}
            lastPage={pagination.lastPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Create/Edit Dialog */}
      <GlobalDialog
        open={isCreateDialogOpen}
        label={editingClient ? "Edit Client" : "Create Client"}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingClient(null);
        }}
      >
        <CreateDialog
          client={editingClient}
          industries={industries}
          projects={projects}
          onSuccess={onSuccess}
          fetchClients={fetchClients}
          pagination={pagination}
          searchTerm={searchTerm}
          activeTab={activeTab}
        />
      </GlobalDialog>

      {/* STATUS CHANGE DIALOG */}
      <GlobalDialog
        open={statusDialogOpen}
        label="Change Client Status"
        onClose={() => {
          setStatusDialogOpen(false);
          setSelectedClient(null);
          setNewStatus("");
        }}
      >
        {selectedClient && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg">{selectedClient.name}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Current Status:{" "}
                <span className="font-medium">{selectedClient.status}</span>
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
                    const optStyle = getStatusStyle(s);
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
                disabled={
                  !newStatus || newStatus === selectedClient.status || loading
                }
              >
                {/* show loader */}
                {loading && <Loader2 className="animate-spin mr-2" />}
                {loading ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        )}
      </GlobalDialog>

      <GlobalDialog label={'Communication History'} open={isChatDialogOpen} onClose={() => {
        setIsChatDialogOpen(false);
        setSelectedChatClient(null);
      }}>
        <ChatDialog clientId={selectedChatClient?._id}></ChatDialog>
      </GlobalDialog>
      <GlobalDialog
        open={isExportDialogOpen}
        label="Export Clients"
        onClose={() => setIsExportDialogOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Export currently visible clients
          </p>

          {/* DROPDOWN */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Client Type</label>
            <Select value={exportStatus} onValueChange={setExportStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select clients to export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="lead">Lead Clients</SelectItem>
                <SelectItem value="active">Active Clients</SelectItem>
                <SelectItem value="paused">Paused Clients</SelectItem>
                <SelectItem value="inactive">Inactive Clients</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* EXPORT BUTTON */}
          <div className="flex justify-end">
            <Button
              disabled={!exportStatus}
              onClick={() => exportClientsToCSV(exportStatus)}
            >
              Export
            </Button>
          </div>
        </div>
      </GlobalDialog>


    </div>
  );
}

export default Client;
