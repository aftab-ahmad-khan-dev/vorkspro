// src/components/project/tabs/credentials/CredentialsTable.jsx
import {
  Eye,
  EyeOff,
  Copy,
  Edit,
  Trash2,
  Loader2,
  CloudCog,
  Key,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useTabs } from "@/context/TabsContext";
import GlobalDialog from "@/models/GlobalDialog";
import AddCredentialDialog from "@/models/project/AddCredentialDialog";
import Confirmation from "@/models/Confirmation";
import CustomTooltip from "@/components/Tooltip";
import EmptyState from "@/components/EmptyState";
import { apiDelete } from "@/interceptor/interceptor";

const normalizeEnv = (env) => {
  const e = String(env || "").toLowerCase();
  if (["live", "prod"].includes(e)) return "Live";
  if (["test", "testing"].includes(e)) return "Testing";
  if (["stage", "staging"].includes(e)) return "Staging";
  return "Development";
};

const keyTypeIcon = (type) => {
  const map = {
    "API Key": "KeyRound",
    "Secret Key": "LockKeyhole",
    Token: "Shield",
    Password: "Lock",
  };
  const Icon = lucideIcons[map[type] || "Shield"];
  return Icon && <Icon className="w-4 h-4" />;
};

export default function CredentialsTable({
  credentials,
  search,
  filter,
  onRefresh,
  projectId,
}) {
  console.log(projectId);

  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  const token = localStorage.getItem("token");
  const [showValue, setShowValue] = useState({});
  const [copyLoading, setCopyLoading] = useState({});
  const { actions } = useTabs();
  const isSuperAdmin = actions?.isSuperAdmin ?? false;
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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

  const filtered = credentials.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.keyType?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" || normalizeEnv(c.environment) === filter;
    return matchesFilter && matchesSearch;
  });

  const toggleShow = (id) => setShowValue((p) => ({ ...p, [id]: !p[id] }));

  const copyToClipboard = async (value, id) => {
    setCopyLoading((p) => ({ ...p, [id]: true }));
    await navigator.clipboard.writeText(value);
    toast.success("Copied!");
    setTimeout(() => setCopyLoading((p) => ({ ...p, [id]: false })), 1000);
  };

  // Dialog states would be lifted to parent in real app
  const handleEdit = (cred) => {
    setSelectedCredential(cred);
    setOpenEditDialog(true);
  };
  const handleDelete = (cred) => {
    setSelectedCredential(cred);
    setOpenDeleteDialog(true);
  };

  const onConfirmDelete = async () => {
    try {
      const data = await apiDelete(`credential/delete/${projectId}`, { credentialId: selectedCredential });

      if (data?.isSuccess) {
        toast.success("Credential deleted successfully");
        setOpenDeleteDialog(false);
        onRefresh();
        return;
      }
      toast.success("Credential deleted successfully");
      setOpenDeleteDialog(false);
      onRefresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="text-foreground overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full">
        <thead className=" border-b border-b-[var(--border)]">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium">Name</th>
            <th className="px-6 py-4 text-left text-sm font-medium">
              Environment
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium">Type</th>
            <th className="px-6 py-4 text-left text-sm font-medium">Value</th>
            <th className="px-6 py-4 text-right text-sm font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-12 text-center text-muted-foreground"
              >
                {/* <div className="flex flex-col items-center gap-3">
                  <span className="text-sm font-medium">
                    No Credentials Found
                  </span>
                  <span className="text-xs">
                    Try adjusting your filters or add a new credential.
                  </span>
                </div> */}
                <EmptyState icon={Lock} title="No Credentials Found" subtitle="Try adjusting your filters or add a new credential."></EmptyState>
              </td>
            </tr>
          ) : (
            filtered.map((c) => (
              <tr
                key={c._id}
                className="border-b border-b-[var(--border)] hover:bg-border/30 transition"
              >
                <td className="px-6 py-4 font-medium">{c.name}</td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${normalizeEnv(c.environment) === "Live"
                      ? "bg-red-500/20 text-red-600"
                      : normalizeEnv(c.environment) === "Testing"
                        ? "bg-blue-500/20 text-blue-600"
                        : normalizeEnv(c.environment) === "Staging"
                          ? "bg-orange-500/20 text-orange-600"
                          : "bg-green-500/20 text-green-600"
                      }`}
                  >
                    {normalizeEnv(c.environment)}
                  </span>
                </td>

                <td className="px-6 py-4 capitalize">{c.keyType}</td>

                <td className="px-6 py-4">
                  {c.keyValue ? (
                    <div className="flex items-center gap-3">
                      <code className="text-xs font-mono bg-border px-2 py-1 rounded">
                        {showValue[c._id] ? c.keyValue : "••••••••"}
                      </code>

                      <CustomTooltip tooltipContent={showValue[c._id] ? "Hide" : "View"}>
                        <Button
                          className="border-button cursor-pointer"
                          size="icon"
                          onClick={() => toggleShow(c._id)}
                        >
                          {showValue[c._id] ? (
                            <EyeOff className="w-5 h-5 mt-0.5" />
                          ) : (
                            <Eye className="w-5 h-5 mt-0.5" />
                          )}
                        </Button>
                      </CustomTooltip>

                      <CustomTooltip tooltipContent="Copy">
                        <Button
                          className="border-button"
                          size="icon"
                          onClick={() => copyToClipboard(c.keyValue, c._id)}
                          disabled={copyLoading[c._id]}
                        >
                          {copyLoading[c._id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </CustomTooltip>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </td>

                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  {hasPermission("Projects", "Edit Records") && (
                    <CustomTooltip tooltipContent="Update Credential">
                      <Button
                        className="border-button"
                        size="icon"
                        onClick={() => handleEdit(c)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </CustomTooltip>
                  )}

                  {hasPermission("Projects", "Delete Records") && (
                    <CustomTooltip tooltipContent="Delete Credential">
                      <Button
                        size="icon"
                        onClick={() => handleDelete(c)}
                        className="text-red-600 logout-button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CustomTooltip>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>

      </table>
      <GlobalDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        label="Edit Credential"
      >
        <AddCredentialDialog
          selectedApiKey={selectedCredential}
          projectId={projectId}
          onRefresh={onRefresh}
          onSuccess={() => setOpenEditDialog(false)}
        ></AddCredentialDialog>
      </GlobalDialog>
      <Confirmation
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        name={"Credential"}
        onConfirm={() => onConfirmDelete()}
      ></Confirmation>
    </div>
  );
}
