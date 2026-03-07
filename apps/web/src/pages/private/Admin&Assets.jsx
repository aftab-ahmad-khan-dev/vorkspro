import React, { useEffect, useState } from "react";
import {
  Search,
  Download,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Laptop,
  Smartphone,
  KeyRound,
  MoveRight,
  Boxes,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlobalDialog from "@/models/GlobalDialog";
import Confirmation from "@/models/Confirmation";
import Pagination from "@/components/UsePagination";
import StatCard from "@/components/Stats";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomTooltip from "@/components/Tooltip";
import Chip from "@/components/Chip";
import CreateAssetDialog from "@/models/adminandassets/AssetsDialog";
import { useTabs } from "@/context/TabsContext";
import { apiDelete, apiGet, apiGetByFilter } from "@/interceptor/interceptor";
import EmptyState from "@/components/EmptyState";

export default function AdminAssets() {
  /* ────────────────────── STATE ────────────────────── */
  const [searchTerm, setSearchTerm] = useState("");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 10,
    totalItems: 0,
    totalPages: 1,
    lastPage: 1,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [openConfirmation, setOpenConfirmation] = useState(false);

  /* ────────────────────── CONSTANTS ────────────────────── */
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  const token = localStorage.getItem("token");
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


  /* ────────────────────── FETCH LOGIC ────────────────────── */
  const fetchAssets = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const data = await apiGetByFilter("admin-and-assets/get-by-filter", {
        page,
        size: paginationData.size,
        sort: "createdAt",
        order: "desc",
        search,
      });

      if (data.isSuccess) {
        setAssets(data?.filteredData?.adminAndAssets || []);
        setPaginationData(data?.filteredData?.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await apiGet("admin-and-assets/get-stats");
      setStats(data.stats || {});
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchEmployeesAndDepartments = async () => {
    try {
      const empData = await apiGet("employee/get-active-employees");
      const deptData = await apiGet("department/get-active-list");

      if (empData.isSuccess) setEmployees(empData.filteredData.employees || []);
      if (deptData.isSuccess) setDepartments(deptData.filteredData.departments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      const data = await apiDelete(`admin-and-assets/delete/${selectedAsset._id}`);
      if (data.isSuccess) {
        toast.success("Asset deleted successfully");
        fetchAssets(paginationData.page, searchTerm);
        fetchStats();
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setOpenConfirmation(false);
    }
  };

  /* ────────────────────── EFFECTS ────────────────────── */
  useEffect(() => {
    fetchEmployeesAndDepartments();
    fetchStats();
  }, []);

  // Combined effect for all asset fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssets(1, searchTerm);
    }, searchTerm ? 500 : 0); // Debounce only for search, immediate on mount
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  /* ────────────────────── HANDLERS ────────────────────── */
  const handleCreate = () => {
    setEditMode(false);
    setOpenDialog(true);
  };

  const handleUpdate = (asset) => {
    setSelectedAsset(asset);
    setEditMode(true);
    setOpenDialog(true);
  };

  const pageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paginationData.lastPage) {
      fetchAssets(newPage, searchTerm);
    }
  };

  /* ────────────────────── ICON HELPER ────────────────────── */
  const getAssetIcon = (type) => {
    switch (type) {
      case "mobile devices":
        return <Smartphone size={16} className="text-purple-500" />;
      case "software license":
        return <KeyRound size={16} className="text-indigo-500" />;
      default:
        return <Laptop size={16} className="text-blue-500" />;
    }
  };

  /* ────────────────────── SKELETON ────────────────────── */
  const SkeletonRow = () => (
    <tr className="border-b border-[var(--border)] animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-[var(--border)] rounded w-full"></div>
        </td>
      ))}
    </tr>
  );

  /* ────────────────────── RENDER ────────────────────── */
  return (
    <div className="min-h-screen w-full text-[var(--foreground)] pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Admin & Assets Management
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[var(--muted-foreground)]">
            Manage company assets, documents, and policies
          </p>
        </div>

        {hasPermission("Admin & Assets", "Create Records") && (
          <Button
            onClick={handleCreate}
            className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Asset
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Assets" isLoading={statsLoading} value={stats?.totalAdminAndAssets} />
        <StatCard title="Active Assets" isLoading={statsLoading} value={stats?.activeAdminAndAssets} valueClass="text-blue-500" />
        <StatCard title="Assigned Assets" isLoading={statsLoading} value={stats?.assignedAdminAndAssets} valueClass="text-green-500" />
        <StatCard title="Unassigned Assets" isLoading={statsLoading} value={stats?.unassignedAdminAndAssets} valueClass="text-orange-500" />
      </div>

      {/* Search + Export */}
      <div className="p-4 sm:p-6 border border-[var(--border)] rounded-lg mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* <div className="flex flex-col gap-3 lg:max-w-xl w-full"> */}
          {/* Mobile Dropdown */}
          {/* <div className="sm:hidden">
              <Select defaultValue="assets">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assets">Company Assets</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

          {/* Desktop Tabs */}
          {/* <div className="hidden sm:block">
              <Tabs defaultValue="assets"> */}
          {/* <TabsList className="flex flex-wrap gap-2 rounded-2xl bg-[var(--foreground)]/10 p-1">
                  <TabsTrigger value="assets" className="rounded-2xl px-4 py-2 text-xs sm:text-sm font-medium">
                    Company Assets ({stats?.totalAssets ?? "-"})
                  </TabsTrigger>
                </TabsList> */}
          {/* </Tabs> */}
          {/* </div>
          </div> */}

          <div className="text-2xl flex items-center">Admin & Assets listing
            {/* &nbsp;
            <span className="mt-2">
              <MoveRight size={28}></MoveRight>
            </span> */}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <Input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            {hasPermission("Admin & Assets", "Export Data") && (
              <Button className="border-button w-full sm:w-auto justify-center">
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
                <th className="px-6 py-3 text-left text-sm font-medium">Asset</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Serial Number</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Assigned To</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Purchase Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Value</th>
                {/* <th className="px-6 py-3 text-left text-sm font-medium">Status</th> */}
                <th className="px-6 py-3 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: paginationData.size }).map((_, i) => <SkeletonRow key={i} />)
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[var(--muted-foreground)]">
                    <EmptyState icon={Package} title="No assets found" subtitle="Try adjusting your search or filters."></EmptyState>
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr
                    key={asset._id}
                    className="border-b border-[var(--border)] hover:bg-[var(--border)]/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-md grid place-items-center bg-blue-500/20">
                          {getAssetIcon(asset.assetType)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{asset.assetName}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{asset.assetType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                      {asset.serialNumber || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">
                        {asset.assignedTo
                          ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}`
                          : "Unassigned"}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {asset.department?.name || ""}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                      {asset.purchaseDate
                        ? new Date(asset.purchaseDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                      PKR {asset.value || "0"}
                    </td>
                    {/* <td className="px-6 py-4">
                      <Chip status={asset.status || "available"} />
                    </td> */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        {hasPermission("Admin & Assets", "Edit Records") && (
                          <CustomTooltip tooltipContent="Update Asset">
                            <Button
                              size="sm"
                              className="bg-transparent text-green-500 hover:bg-green-500/20"
                              onClick={() => handleUpdate(asset)}
                            >
                              <Edit2 size={16} />
                            </Button>
                          </CustomTooltip>
                        )}

                        {hasPermission("Admin & Assets", "Delete Records") && (
                          <CustomTooltip tooltipContent="Delete Asset">
                            <Button
                              size="sm"
                              className="bg-transparent text-red-500 hover:bg-red-500/20"
                              onClick={() => {
                                setSelectedAsset(asset);
                                setOpenConfirmation(true);
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </CustomTooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {assets.length > 0 && !loading && (
        <div className="mt-6 flex justify-between items-center text-sm text-[var(--muted-foreground)]">
          <p>
            Showing {assets.length} of {paginationData.totalItems} assets
          </p>
          <Pagination
            total={paginationData.totalItems}
            current={paginationData.page}
            pageSize={paginationData.size}
            lastPage={paginationData.lastPage}
            onPageChange={pageChange}
          />
        </div>
      )}

      {/* Dialogs */}
      <GlobalDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        label={editMode ? "Update Asset" : "Add New Asset"}
      >
        <CreateAssetDialog
          employees={employees}
          departments={departments}
          asset={editMode ? selectedAsset : null}
          onSuccess={() => {
            setOpenDialog(false);
            fetchAssets(paginationData.page, searchTerm);
            fetchStats();
          }}
          onCancel={() => setOpenDialog(false)}
        />
      </GlobalDialog>

      <Confirmation
        open={openConfirmation}
        title="Delete Asset"
        onClose={() => setOpenConfirmation(false)}
        onConfirm={handleDelete}
        name={selectedAsset?.assetName || ""}
      />
    </div>
  );
}