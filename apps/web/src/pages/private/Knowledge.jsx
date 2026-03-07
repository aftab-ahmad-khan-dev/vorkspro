// src/pages/Knowledge.jsx
import React, { useEffect, useState } from "react";
import {
  Plus,
  Eye,
  Download,
  Edit2,
  Trash2,
  FileText,
  BookOpen,
  Folder,
  Wrench,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import GlobalDialog from "@/models/GlobalDialog";
import AddDocument from "@/models/knowledge/AddDocument";
import Confirmation from "@/models/Confirmation";
import { toast } from "sonner";
import CustomTooltip from "@/components/Tooltip";
import StatCard from "@/components/Stats";
import { useTabs } from "@/context/TabsContext";
import { categoryApi, knowledgeApi } from "@/api/index.js";
import EmptyState from "@/components/EmptyState";

function Knowledge() {
  const [activeTab, setActiveTab] = useState("all-documents");
  const [searchTerm, setSearchTerm] = useState("");
  const [knowledge, setKnowledge] = useState([]);
  const [filteredKnowledge, setFilteredKnowledge] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [activeDepartments, setActiveDepartments] = useState([]);
  const [activeDocumentTypes, setActiveDocumentTypes] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const fileUrl = import.meta.env.VITE_APP_FILE_URL;
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


  // Fetch Stats
  // const fetchStats = async () => {
  //   try {
  //     const res = await fetch(`${baseUrl}knowledge/get-stats`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const data = await res.json();
  //     if (data.isSuccess) setStats(data.stats || {});
  //   } catch (err) {
  //     console.error("Failed to fetch knowledge stats", err);
  //   }
  // };

  // Fetch Departments
  const fetchDepartment = async () => {
    try {
      const data = await categoryApi.department.getActiveList();
      if (data?.isSuccess) {
        setActiveDepartments(data.filteredData?.departments || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch Document Types
  const fetchDocumentsType = async () => {
    try {
      const data = await categoryApi.documentType.getActiveList();
      if (data?.isSuccess) {
        setActiveDocumentTypes(data.documentTypes || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch Knowledge List
  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      const data = await knowledgeApi.getList();
      if (data.isSuccess) {
        setKnowledge(data.knowledge || []);
      }
    } catch (err) {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  // Search + Filter Logic (FIXED FOR OBJECT CATEGORY)
  useEffect(() => {
    let filtered = knowledge;

    // 1. Search Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(term) ||
          doc.tags?.some((tag) => tag.toLowerCase().includes(term)) ||
          doc.description?.toLowerCase().includes(term)
      );
    }

    // 2. Category Filter (activeTab = category _id string)
    if (activeTab !== "all-documents") {
      filtered = filtered.filter((doc) => doc.category?._id === activeTab);
    }

    setFilteredKnowledge(filtered);
  }, [searchTerm, knowledge, activeTab]);

  // Initial Load
  useEffect(() => {
    fetchDepartment();
    fetchDocumentsType();
    fetchKnowledge();
    // fetchStats();
  }, []);

  // Refresh after add/edit/delete
  const handleSuccess = () => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedDoc(null);
    fetchKnowledge();
    // fetchStats();
  };

  const handleEdit = (doc) => {
    setSelectedDoc(doc);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = (doc) => {
    setSelectedDoc(doc);
    setOpenConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const data = await knowledgeApi.delete(selectedDoc._id);
      if (data.isSuccess) {
        toast.success("Document deleted successfully");
        handleSuccess();
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Failed to delete document");
    } finally {
      setOpenConfirm(false);
    }
  };

  const getCategoryIcon = (categoryObj) => {
    const name = categoryObj?.name?.toLowerCase() || "";
    if (name.includes("onboard")) return <BookOpen size={16} />;
    if (name.includes("sop")) return <Folder size={16} />;
    if (name.includes("tech")) return <Wrench size={16} />;
    if (name.includes("proof") || name.includes("address"))
      return <FileText size={16} />;
    return <FileText size={16} />;
  };

  const categories = [
    {
      name: "Total Documents",
      count: stats.total || 0,
      icon: <FileText size={20} />,
    },
    {
      name: "Onboarding",
      count: stats.onboarding || 0,
      icon: <BookOpen size={20} />,
    },
    { name: "SOPs", count: stats.sops || 0, icon: <Folder size={20} /> },
    {
      name: "Technical",
      count: stats.technical || 0,
      icon: <Wrench size={20} />,
    },
  ];

  const handleDownload = async (url, filename) => {
    const blob = await knowledgeApi.download(url);
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  const SkeletonRow = () => (
    <div className="flex items-center justify-between border-b border-[var(--border)] py-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 hList h-8 bg-[var(--border)] rounded"></div>
        <div>
          <div className="h-4 bg-[var(--border)] rounded w-64"></div>
          <div className="h-3 bg-[var(--border)] rounded w-96 mt-2"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-[var(--border)] rounded"></div>
        <div className="w-8 h-8 bg-[var(--border)] rounded"></div>
        <div className="w-8 h-8 bg-[var(--border)] rounded"></div>
        <div className="w-8 h-8 bg-[var(--border)] rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full text-[var(--foreground)] pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">Knowledge Base</h1>
          <p className="mt-1 text-sm sm:text-base text-[var(--muted-foreground)]">
            Company documentation, guides, and resources
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* {categories.map((cat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">{cat.name}</h3>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--muted)]">
                {cat.icon}
              </div>
            </div>
            <p className="text-3xl font-bold">{cat.count}</p>
            <p className="text-sm text-[var(--muted-foreground)]">Documents</p>
          </div>
        ))} */}
        {/* <StatCard title="Total Documents" value={stats.totalDocuments || 0} icon={<FileText size={20} />}></StatCard>
        <StatCard title="Total Documents" value={stats.totalDocuments || 0} icon={<FileText size={20} />}></StatCard>
        <StatCard title="Total Documents" value={stats.totalDocuments || 0} icon={<FileText size={20} />}></StatCard>
        <StatCard title="Total Documents" value={stats.totalDocuments || 0} icon={<FileText size={20} />}></StatCard> */}
      </div>

      {/* Search + Category Filter */}
      <div className="p-4 sm:p-6 border border-[var(--border)] rounded-lg mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Title + Search */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between md:flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold flex-shrink-0">
              {activeDocumentTypes.find((t) => t._id === activeTab)?.name ||
                "All Documents"}
            </h1>

            <div className="relative md:max-w-sm flex">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <Input
                placeholder="Search by title, tags, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Filters + Button */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto md:justify-end">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full sm:w-64">
                <span>
                  {activeTab === "all-documents"
                    ? "All Categories"
                    : activeDocumentTypes.find((t) => t._id === activeTab)
                      ?.name || "Select Category"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-documents">All Categories</SelectItem>
                {activeDocumentTypes.map((type) => (
                  <SelectItem key={type._id} value={type._id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasPermission("Knowledge Base", "Create Records") && (
              <Button
                onClick={() => {
                  setEditMode(false);
                  setSelectedDoc(null);
                  setOpenDialog(true);
                }}
                className="bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Plus size={18} />
                <span>Add Document</span>
              </Button>

            )}

          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="rounded-lg border border-[var(--border)] p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          ) : filteredKnowledge.length === 0 ? (
            <EmptyState 
              icon={FileText}
              title="No documents found"
              subtitle={searchTerm || activeTab !== "all-documents"
                ? "Try adjusting your search or filter"
                : "Start by adding your first document"}
            />
          ) : (
            filteredKnowledge.map((doc) => (
              <div
                key={doc._id}
                className="
            border-b border-[var(--border)] last:border-0
            hover:bg-[var(--muted)/0.05] transition-colors
            rounded-lg px-2 py-3 sm:py-4
          "
              >
                {/* Responsive row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left side */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                    <span className="text-blue-600 shrink-0 mt-0.5 sm:mt-0">
                      {getCategoryIcon(doc.category)}
                    </span>

                    <div className="min-w-0">
                      <p className="font-semibold text-base sm:text-lg truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs sm:text-sm text-[var(--muted-foreground)] truncate">
                        {doc.category?.name || "Uncategorized"} •{" "}
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 sm:gap-3 flex-wrap">
                    {hasPermission("Knowledge Base", "View Records") && (
                      <CustomTooltip
                        tooltipContent={
                          !doc.fileUrl ? "Document unavailable" : "View Document"
                        }
                      >
                        <Button
                          size="sm"
                          className="bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)/0.12]"
                          onClick={() =>
                            window.open(fileUrl + doc.fileUrl, "_blank")
                          }
                          disabled={!doc.fileUrl}
                        >
                          <Eye size={16} />
                        </Button>
                      </CustomTooltip>
                    )}

                    <CustomTooltip
                      tooltipContent={
                        !doc.fileUrl ? "Document unavailable" : "Download Document"
                      }
                    >
                      <Button
                        size="sm"
                        className="bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)/0.12]"
                        onClick={() =>
                          handleDownload(fileUrl + doc.fileUrl, "document.pdf")
                        }
                        disabled={!doc.fileUrl}
                      >
                        <Download size={16} />
                      </Button>
                    </CustomTooltip>
                    {hasPermission("Knowledge Base", "Edit Records") && (
                      <CustomTooltip tooltipContent="Update Document">
                        <Button
                          size="sm"
                          className="bg-transparent text-green-600 hover:bg-green-500/15"
                          onClick={() => handleEdit(doc)}
                        >
                          <Edit2 size={16} />
                        </Button>
                      </CustomTooltip>
                    )}
                    {hasPermission("Knowledge Base", "Delete Records") && (
                      <CustomTooltip tooltipContent="Delete Document">
                        <Button
                          size="sm"
                          className="bg-transparent text-red-600 hover:bg-red-500/15"
                          onClick={() => handleDelete(doc)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </CustomTooltip>
                    )}


                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dialogs */}
      <GlobalDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditMode(false);
          setSelectedDoc(null);
        }}
        label={editMode ? "Edit Document" : "Add New Document"}
      >
        <AddDocument
          departments={activeDepartments}
          categories={activeDocumentTypes}
          document={editMode ? selectedDoc : null}
          onSuccess={handleSuccess}
        />
      </GlobalDialog>

      <Confirmation
        open={openConfirm}
        title="Delete Document"
        message={`Are you sure you want to delete "${selectedDoc?.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onClose={() => setOpenConfirm(false)}
      />
    </div>
  );
}

export default Knowledge;
