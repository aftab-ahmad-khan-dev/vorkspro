import React, { useEffect, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User,
  Briefcase,
  DollarSign,
  Calendar,
  Bug,
  FileText,
  BriefcaseBusiness,
  Settings,
} from "lucide-react";
import GlobalDialog from "@/models/GlobalDialog";
import Confirmation from "@/models/Confirmation";
import { toast } from "sonner";

import SubDepartmentDialog from "@/models/category/SubDepartmentDialog";
import IncomeDialog from "@/models/category/IncomeDialog";
import ExpenseDialog from "@/models/category/ExpenseDialog";
import LeaveTypeDialog from "@/models/category/LeaveTypeDialog";
import BugTypeDialog from "@/models/category/BugTypeDialog";
import DocumentDialog from "@/models/category/DocumentDialog";
import DepartmentDialog from "@/models/category/DepartmentDialog";
import IndustryTypeDialog from "@/models/category/IndustryTypeDialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import DepartmentsTab from "@/components/category/DepartmentsTab";
import SubDepartmentsTab from "@/components/category/SubDepartmentsTab";
import TransactionTypesTab from "@/components/category/TransactionTypesTab";
import GenericCategoryTab from "@/components/category/GenericCategoryTab";
import ConfigurationTab from "@/components/category/ConfigurationTab";
import { apiGet, apiGetByFilter, apiDelete, apiPatch } from "@/interceptor/interceptor";
import { useTabs } from "@/context/TabsContext";

export default function Category() {
  const [activeTab, setActiveTab] = useState("departments");
  const [transactionTab, setTransactionTab] = useState("income");

  const { actions } = useTabs();
  const isSuperAdmin = actions?.isSuperAdmin || false;

  const tabsPermission = (moduleName, tabs) => {
    if (isSuperAdmin) return true;
    const module = actions?.modulePermissions?.find(
      (modules) => modules.module === moduleName
    );
    if (!module) return false;
    return module.tabs.some((action) => tabs.includes(action));
  };

  const allowedTabs = React.useMemo(() => {
    const tabs = [];

    if (tabsPermission("Categories", ["Departments"])) {
      tabs.push("departments");
    }

    if (tabsPermission("Categories", ["Sub Departments"])) {
      tabs.push("subDepartments");
    }

    if (tabsPermission("Categories", ["Transection Types"])) {
      tabs.push("transactionFee");
    }

    if (tabsPermission("Categories", ["Leave Types"])) {
      tabs.push("leaveTypes");
    }

    if (tabsPermission("Categories", ["Document Types"])) {
      tabs.push("documentCategories");
    }

    if (tabsPermission("Categories", ["Industry Types"])) {
      tabs.push("industryTypes");
    }

    if (tabsPermission("Categories", ["Configuration"])) {
      tabs.push("configuration");
    }

    return tabs;
  }, [actions, isSuperAdmin]);

  React.useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0] || "");
    }
  }, [allowedTabs, activeTab]);

  useEffect(() => {
    const activeRoute = window.location.pathname;
    localStorage.setItem("activeRoute", activeRoute);
  }, []);

  // ------------------- DATA STATES -------------------
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [subDeptMeta, setSubDeptMeta] = useState({
    totalItems: 0,
    totalPages: 0,
  });
  const [incomeTypes, setIncomeTypes] = useState([]);
  const [incomeMeta, setIncomeMeta] = useState({
    totalItems: 0,
    totalPages: 0,
  });
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [expenseMeta, setExpenseMeta] = useState({
    totalItems: 0,
    totalPages: 0,
  });
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveMeta, setLeaveMeta] = useState({
    totalItems: 0,
    totalPages: 0,
  });
  const [bugTypes, setBugTypes] = useState([]);
  const [bugMeta, setBugMeta] = useState({
    totalItems: 0,
    totalPages: 0,
  });
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documentMeta, setDocumentMeta] = useState({
    totalItems: 0,
    totalPages: 0,
  });
  const [industryTypes, setIndustryTypes] = useState([]);
  const [industryMeta, setIndustryMeta] = useState({
    totalItems: 0,
    totalPages: 0,
  });

  // ------------------- FILTER STATE -------------------
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // ------------------- DIALOG STATES -------------------
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [dialogType, setDialogType] = useState("");

  // ------------------- DELETE CONFIRM -------------------
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
    name: "",
    type: "",
  });

  // ------------------- LOADERS -------------------
  const [loading, setLoading] = useState({});
  const [togglingStatus, setTogglingStatus] = useState({});

  // ------------------- PAGINATION -------------------
  const pageSize = 10;
  const [page, setPage] = useState({
    subDepartments: 1,
    income: 1,
    expense: 1,
    leaveTypes: 1,
    bugTypes: 1,
    documentCategories: 1,
    industry: 1,
  });

  // ==================== FETCH DATA ====================
  const load = useCallback(
    async (tab) => {
      setLoading((p) => ({ ...p, [tab]: true }));
      try {
        if (tab === "departments") {
          const data = await apiGet("department/get-all");
          setDepartments(data.filteredData.departments || []);
        }

        if (tab === "subDepartments") {
          const params = { page: page.subDepartments, size: pageSize };
          if (selectedDepartment) params.departmentId = selectedDepartment;
          const data = await apiGetByFilter("subdepartment/get-by-filter", params);
          setSubDepartments(data.filteredData.subDepartments || []);
          setSubDeptMeta({
            totalItems: data.filteredData.pagination?.totalItems || 0,
            totalPages: data.filteredData.pagination?.totalPages || 0,
          });
        }

        if (tab === "transactionFee") {
          const [inc, exp] = await Promise.all([
            apiGetByFilter("transaction-type/get-by-filter", { type: "income", page: page.income, size: pageSize }),
            apiGetByFilter("transaction-type/get-by-filter", { type: "expense", page: page.expense, size: pageSize }),
          ]);

          setIncomeTypes(inc.filteredData.transactionTypes || []);
          setIncomeMeta({
            totalItems: inc.filteredData.pagination?.totalItems || 0,
            totalPages: inc.filteredData.pagination?.totalPages || 0,
          });

          setExpenseTypes(exp.filteredData.transactionTypes || []);
          setExpenseMeta({
            totalItems: exp.filteredData.pagination?.totalItems || 0,
            totalPages: exp.filteredData.pagination?.totalPages || 0,
          });
        }

        if (tab === "leaveTypes") {
          const data = await apiGetByFilter("leave-type/get-by-filter", { page: page.leaveTypes, size: pageSize });
          setLeaveTypes(data.filteredData.leaveTypes || []);
          setLeaveMeta({
            totalItems: data.filteredData.pagination?.totalItems || 0,
            totalPages: data.filteredData.pagination?.totalPages || 0,
          });
        }

        if (tab === "bugTypes") {
          const data = await apiGetByFilter("bug-type/get-by-filter", { page: page.bugTypes, size: pageSize });
          setBugTypes(data.filteredData.bugTypes || []);
          setBugMeta({
            totalItems: data.filteredData.pagination?.totalItems || 0,
            totalPages: data.filteredData.pagination?.totalPages || 0,
          });
        }

        if (tab === "documentCategories") {
          const data = await apiGetByFilter("document-type/get-by-filter", { page: page.documentCategories, size: pageSize });
          setDocumentTypes(data.filteredData.documents || []);
          setDocumentMeta({
            totalItems: data.filteredData.pagination?.totalItems || 0,
            totalPages: data.filteredData.pagination?.totalPages || 0,
          });
        }

        if (tab === "industryTypes") {
          const data = await apiGet("industry/");
          setIndustryTypes(data.filteredData.industryType || []);
          setIndustryMeta({
            totalItems: data.filteredData.pagination?.totalItems || 0,
            totalPages: data.filteredData.pagination?.totalPages || 0,
          });
        }

        if (tab === "configuration") {
          // Configuration refresh logic can be added here
          console.log("Configuration refreshed");
        }
      } catch (err) {
        toast.error(err.message || "Failed to load data");
      } finally {
        setLoading((p) => ({ ...p, [tab]: false }));
      }
    },
    [
      page.subDepartments,
      page.income,
      page.expense,
      page.leaveTypes,
      page.bugTypes,
      page.documentCategories,
      page.industry,
      selectedDepartment,
    ]
  );

  useEffect(() => {
    load(activeTab);
  }, [activeTab, load]);

  useEffect(() => {
    if (activeTab === "subDepartments") {
      setPage((prev) => ({ ...prev, subDepartments: 1 }));
    }
  }, [selectedDepartment, activeTab]);

  // ==================== DELETE HANDLER ====================
  const deleteItem = async () => {
    const { id, type } = confirmDelete;
    const endpoints = {
      departments: `department/delete/${id}`,
      subDepartments: `subdepartment/delete/${id}`,
      income: `transaction-type/delete/${id}`,
      expense: `transaction-type/delete/${id}`,
      leaveTypes: `leave-type/delete/${id}`,
      bugTypes: `bug-type/delete/${id}`,
      documentCategories: `document-type/delete/${id}`,
      industryTypes: `industry/${id}`,
    };

    try {
      await apiDelete(endpoints[type]);
      toast.success("Deleted successfully");
      load(activeTab);
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setConfirmDelete({ open: false, id: null, name: "", type: "" });
    }
  };

  // ==================== DIALOG HANDLERS ====================
  const openDialog = (type, item = null) => {
    setDialogType(type);
    setEditingItem(item);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setDialogType("");
  };

  const onSuccess = () => {
    load(activeTab);
    closeDialog();
  };

  // ==================== STATUS TOGGLE ====================
  const toggleStatus = async (item, type) => {
    const key = `${type}-${item._id}`;
    setTogglingStatus((p) => ({ ...p, [key]: true }));

    let array = [];
    if (type === "departments") array = departments;
    else if (type === "subDepartments") array = subDepartments;
    else if (type === "leaveTypes") array = leaveTypes;
    else if (type === "bugTypes") array = bugTypes;
    else if (type === "documentCategories") array = documentTypes;
    else if (type === "industryTypes") array = industryTypes;

    const endpointMap = {
      departments: `department/change-status/${item._id}`,
      subDepartments: `subdepartment/change-status/${item._id}`,
      leaveTypes: `leave-type/change-status/${item._id}`,
      bugTypes: `bug-type/change-status/${item._id}`,
      documentCategories: `document-type/change-status/${item._id}`,
      industryTypes: `industry/change-status/${item._id}`,
    };

    const endpoint = endpointMap[type];
    if (!endpoint) return;

    try {
      await apiPatch(endpoint, { isActive: !item.isActive });

      const idx = array.findIndex((i) => i._id === item._id);
      if (idx !== -1) {
        array[idx].isActive = !item.isActive;
        // Trigger re-render by updating state
        if (type === "departments") setDepartments([...departments]);
        else if (type === "subDepartments")
          setSubDepartments([...subDepartments]);
        else if (type === "leaveTypes") setLeaveTypes([...leaveTypes]);
        else if (type === "bugTypes") setBugTypes([...bugTypes]);
        else if (type === "documentCategories")
          setDocumentTypes([...documentTypes]);
        else if (type === "industryTypes") setIndustryTypes([...industryTypes]);
      }

      toast.success(
        `Status ${item.isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setTogglingStatus((p) => ({ ...p, [key]: false }));
    }
  };

  // ==================== HANDLERS ====================
  const handleEdit = (type, item) => {
    openDialog(type, item);
  };

  const handleDelete = (type, item) => {
    setConfirmDelete({
      open: true,
      id: item._id,
      name: item.name,
      type,
    });
  };

  const handleToggle = (type, item) => {
    toggleStatus(item, type);
  };

  const tabConfig = {
    departments: { label: "Departments", icon: User },
    subDepartments: { label: "Sub Departments", icon: Briefcase },
    transactionFee: { label: "Transaction Types", icon: DollarSign },
    leaveTypes: { label: "Leave Types", icon: Calendar },
    // bugTypes: { label: "Bug Types", icon: Bug }, // TODO: Comment for now 
    documentCategories: { label: "Document Types", icon: FileText },
    industryTypes: { label: "Industry Types", icon: BriefcaseBusiness },
    configuration: { label: "Configuration", icon: Settings },
  };

  return (
    <div className="min-h-screen w-full text-[var(--foreground)] pb-8">
      <div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[var(--foreground)] to-[var(--muted-foreground)] bg-clip-text text-transparent">
          Categories Management
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Manage all system categories and configurations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* //TODO: Adjust grid-cols based on number of tabs */}
        {allowedTabs.length >= 2 && (
          <TabsList className="lg:grid hidden bg-[var(--border)] mb-6 rounded-2xl backdrop-blur-sm"
            style={{
              gridTemplateColumns: `repeat(${allowedTabs.length}, minmax(0, 1fr))`,
            }}>
            {Object.entries(tabConfig).filter(([key]) => allowedTabs.includes(key)).map(([key, { label, icon: Icon }]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="rounded-xl text-sm font-medium transition-all duration-200 data-[state=active]:bg-[var(--background)] data-[state=active]:shadow-md"
              >
                <Icon className="h-4 w-4 mr-0 hidden sm:inline" />
                <span className="truncate">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        )}
        {allowedTabs.length >= 2 && (
          <div className="lg:hidden text-[var(--foreground)] mb-3">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full border rounded-lg px-3 py-2 text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(tabConfig).filter(([key]) => allowedTabs.includes(key)).map(([key, { label, icon: Icon }]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="rounded-xl text-sm font-medium transition-all duration-200 data-[state=active]:bg-[var(--background)] data-[state=active]:shadow-md"
                  >

                    <span className="truncate">{label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {/* DEPARTMENTS */}
        {allowedTabs.includes("departments") && (
          <TabsContent value="departments">
            <DepartmentsTab
              departments={departments}
              loading={loading.departments}
              onAdd={() => openDialog("departments")}
              onEdit={(item) => handleEdit("departments", item)}
              onDelete={(item) => handleDelete("departments", item)}
              onToggle={(item) => handleToggle("departments", item)}
              togglingStatus={togglingStatus}
            />
          </TabsContent>
        )}

        {/* SUB-DEPARTMENTS */}
        {allowedTabs.includes("subDepartments") && (
          <TabsContent value="subDepartments">
            <SubDepartmentsTab
              subDepartments={subDepartments}
              departments={departments}
              selectedDepartment={selectedDepartment}
              onDepartmentChange={setSelectedDepartment}
              loading={loading.subDepartments}
              onAdd={() => openDialog("subDepartments")}
              onEdit={(item) => handleEdit("subDepartments", item)}
              onDelete={(item) => handleDelete("subDepartments", item)}
              pagination={subDeptMeta}
              page={page.subDepartments}
              onPageChange={(p) => setPage((prev) => ({ ...prev, subDepartments: p }))}
            />
          </TabsContent>
        )}

        {/* TRANSACTION FEE */}
        {allowedTabs.includes("transactionFee") && (
          <TabsContent value="transactionFee">
            <TransactionTypesTab
              transactionTab={transactionTab}
              onTransactionTabChange={setTransactionTab}
              incomeTypes={incomeTypes}
              expenseTypes={expenseTypes}
              loading={loading.transactionFee}
              onAdd={(type) => openDialog(type)}
              onEdit={(item) => handleEdit(transactionTab, item)}
              onDelete={(item) => handleDelete(transactionTab, item)}
              incomeMeta={incomeMeta}
              expenseMeta={expenseMeta}
              incomePage={page.income}
              expensePage={page.expense}
              onIncomePageChange={(p) => setPage((prev) => ({ ...prev, income: p }))}
              onExpensePageChange={(p) => setPage((prev) => ({ ...prev, expense: p }))}
            />
          </TabsContent>
        )}

        {/* LEAVE TYPES */}
        {allowedTabs.includes("leaveTypes") && (
          <TabsContent value="leaveTypes">
            <GenericCategoryTab
              title="Leave Types"
              items={leaveTypes}
              type="leaveTypes"
              icon={Calendar}
              loading={loading.leaveTypes}
              onAdd={() => openDialog("leaveTypes")}
              onEdit={(item) => handleEdit("leaveTypes", item)}
              onDelete={(item) => handleDelete("leaveTypes", item)}
              onToggle={(item) => handleToggle("leaveTypes", item)}
              togglingStatus={togglingStatus}
              pagination={leaveMeta}
              page={page.leaveTypes}
              onPageChange={(p) => setPage((prev) => ({ ...prev, leaveTypes: p }))}
            />
          </TabsContent>
        )}

        {/* BUG TYPES */}
        {allowedTabs.includes("bugTypes") && (
          <TabsContent value="bugTypes">
            <GenericCategoryTab
              title="Bug Types"
              items={bugTypes}
              type="bugTypes"
              icon={Bug}
              loading={loading.bugTypes}
              onAdd={() => openDialog("bugTypes")}
              onEdit={(item) => handleEdit("bugTypes", item)}
              onDelete={(item) => handleDelete("bugTypes", item)}
              onToggle={(item) => handleToggle("bugTypes", item)}
              togglingStatus={togglingStatus}
              pagination={bugMeta}
              page={page.bugTypes}
              onPageChange={(p) => setPage((prev) => ({ ...prev, bugTypes: p }))}
            />
          </TabsContent>
        )}

        {/* DOCUMENT CATEGORIES */}
        {allowedTabs.includes("documentCategories") && (
          <TabsContent value="documentCategories">
            <GenericCategoryTab
              title="Document Types"
              items={documentTypes}
              type="documentCategories"
              icon={FileText}
              loading={loading.documentCategories}
              onAdd={() => openDialog("documentCategories")}
              onEdit={(item) => handleEdit("documentCategories", item)}
              onDelete={(item) => handleDelete("documentCategories", item)}
              onToggle={(item) => handleToggle("documentCategories", item)}
              togglingStatus={togglingStatus}
              pagination={documentMeta}
              page={page.documentCategories}
              onPageChange={(p) => setPage((prev) => ({ ...prev, documentCategories: p }))}
            />
          </TabsContent>
        )}

        {/* INDUSTRY TYPES */}
        {allowedTabs.includes("industryTypes") && (
          <TabsContent value="industryTypes">
            <GenericCategoryTab
              title="Industry Types"
              items={industryTypes}
              type="industryTypes"
              icon={BriefcaseBusiness}
              loading={loading.industryTypes}
              onAdd={() => openDialog("industryTypes")}
              onEdit={(item) => handleEdit("industryTypes", item)}
              onDelete={(item) => handleDelete("industryTypes", item)}
              onToggle={(item) => handleToggle("industryTypes", item)}
              togglingStatus={togglingStatus}
              pagination={industryMeta}
              page={page.industry}
              onPageChange={(p) => setPage((prev) => ({ ...prev, industry: p }))}
            />
          </TabsContent>
        )}

        {/* CONFIGURATION */}
        {allowedTabs.includes("configuration") && (
          <TabsContent value="configuration">
            <ConfigurationTab
              loading={loading.configuration}
              onRefresh={() => load("configuration")}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* DIALOGS */}
      <GlobalDialog
        open={dialogOpen}
        onClose={closeDialog}
        label={editingItem ? `Edit ${dialogType}` : `Add ${dialogType}`}
      >
        {dialogType === "departments" && (
          <DepartmentDialog
            department={editingItem}
            onSuccess={onSuccess}
            onClose={closeDialog}
          />
        )}
        {dialogType === "subDepartments" && (
          <SubDepartmentDialog
            subDepartment={editingItem}
            onSuccess={onSuccess}
            onClose={closeDialog}
          />
        )}
        {dialogType === "income" && (
          <IncomeDialog
            transaction={editingItem}
            type="income"
            onSuccess={onSuccess}
            onClose={closeDialog}
          />
        )}
        {dialogType === "expense" && (
          <ExpenseDialog
            transaction={editingItem}
            type="expense"
            onSuccess={onSuccess}
            onClose={closeDialog}
          />
        )}
        {dialogType === "leaveTypes" && (
          <LeaveTypeDialog
            leaveType={editingItem}
            onSuccess={onSuccess}
            onClose={closeDialog}
          />
        )}
        {dialogType === "bugTypes" && (
          <BugTypeDialog
            bugType={editingItem}
            onSuccess={onSuccess}
            onClose={closeDialog}
          />
        )}
        {dialogType === "documentCategories" && (
          <DocumentDialog
            document={editingItem}
            onSuccess={onSuccess}
            onClose={closeDialog}
          />
        )}
        {dialogType === "industryTypes" && (
          <IndustryTypeDialog
            industry={editingItem}
            onSuccess={onSuccess}
            onClose={closeDialog}
          />
        )}
      </GlobalDialog>
      {/* CONFIRM DELETE */}
      <Confirmation
        open={confirmDelete.open}
        onClose={() =>
          setConfirmDelete({ open: false, id: null, name: "", type: "" })
        }
        onConfirm={deleteItem}
        name={confirmDelete.name}
      />
    </div>
  );
}
