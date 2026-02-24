import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Lock, User2, Eye, EyeOff, Copy, Edit, Trash2, Loader2, Key, Server, Database, Zap } from "lucide-react";
import StatCard from "@/components/Stats";
import CustomTooltip from "@/components/Tooltip";
import EmptyState from "@/components/EmptyState";
import { toast } from "sonner";
import GlobalDialog from "@/models/GlobalDialog";

function KeysAndCredentials() {
  const [searchTerm, setSearchTerm] = useState("");
  const [envFilter, setEnvFilter] = useState("all");
  const [showValue, setShowValue] = useState({});
  const [copyLoading, setCopyLoading] = useState({});
  const [showDialog, setShowDialog] = useState(false)

  // Mock data - added projectName field
  const credentials = [
    {
      _id: "1",
      name: "Database Connection",
      projectName: "Angivore",
      environment: "Live",
      keyType: "API Key",
      keyValue: "sk_live_abc123xyz789"
    },
    {
      _id: "2",
      name: "Payment Gateway",
      projectName: "Angivore",
      environment: "Testing",
      keyType: "Secret Key",
      keyValue: "sk_test_def456uvw012"
    },
    {
      _id: "3",
      name: "Email Service",
      projectName: "MyApp",
      environment: "Development",
      keyType: "Token",
      keyValue: "token_dev_ghi789rst345"
    }
  ];

  const normalizeEnv = (env) => {
    const e = String(env || "").toLowerCase();
    if (["live", "prod"].includes(e)) return "Live";
    if (["test", "testing"].includes(e)) return "Testing";
    if (["stage", "staging"].includes(e)) return "Staging";
    return "Development";
  };

  const filtered = credentials.filter((c) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      c.name?.toLowerCase().includes(searchLower) ||
      c.keyType?.toLowerCase().includes(searchLower) ||
      c.projectName?.toLowerCase().includes(searchLower); // Added project name search
    const matchesFilter =
      envFilter === "all" || normalizeEnv(c.environment) === envFilter;
    return matchesFilter && matchesSearch;
  });

  const toggleShow = (id) => setShowValue((p) => ({ ...p, [id]: !p[id] }));

  const copyToClipboard = async (value, id) => {
    setCopyLoading((p) => ({ ...p, [id]: true }));
    await navigator.clipboard.writeText(value);
    toast.success("Copied!");
    setTimeout(() => setCopyLoading((p) => ({ ...p, [id]: false })), 1000);
  };

  const live = credentials.filter(c => c.environment?.toLowerCase() === "live").length;
  const testing = credentials.filter(c => ["testing", "staging"].includes(c.environment?.toLowerCase())).length;
  const dev = credentials.filter(c => c.environment?.toLowerCase() === "development").length;

  return (
    <div className="min-h-screen w-full text-[var(--foreground)] pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Keys & Credentials
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[var(--muted-foreground)]">
            Manage your project's keys and credentials securely
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total" value={credentials.length} icon={<Key size={18}/>} iconClass="text-purple-500 bg-purple-500/15" />
          <StatCard title="Live" value={live} icon={<Server size={18}/>} iconClass="text-red-500 bg-red-500/15" />
          <StatCard title="Testing/Staging" value={testing} icon={<Zap size={18}/>} iconClass="text-blue-500 bg-blue-500/15" />
          <StatCard title="Development" value={dev} icon={<Database size={18}/>} iconClass="text-green-500 bg-green-500/15" />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by key name, type or project name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select className="text-foreground" value={envFilter} onValueChange={setEnvFilter}>
            <SelectTrigger className="w-full sm:w-48 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              <SelectItem value="Live">Live</SelectItem>
              <SelectItem value="Testing">Testing</SelectItem>
              <SelectItem value="Staging">Staging</SelectItem>
              <SelectItem value="Development">Development</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => {setShowDialog(true)}} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Add Credential
          </Button>
        </div>

        {/* Credentials Table */}
        <div className="text-foreground overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full">
            <thead className="border-b border-b-[var(--border)]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Environment</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Type</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Value</th>
                <th className="px-6 py-4 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <EmptyState icon={Lock} title="No Credentials Found" subtitle="Try adjusting your filters or add a new credential." />
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id} className="border-b border-b-[var(--border)] hover:bg-border/30 transition">
                    <td className="px-6 py-4 font-medium">
                      {c.name}
                      {c.projectName && (
                        <div className="text-xs text-muted-foreground mt-1">Project: {c.projectName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        normalizeEnv(c.environment) === "Live"
                          ? "bg-red-500/20 text-red-600"
                          : normalizeEnv(c.environment) === "Testing"
                          ? "bg-blue-500/20 text-blue-600"
                          : normalizeEnv(c.environment) === "Staging"
                          ? "bg-orange-500/20 text-orange-600"
                          : "bg-green-500/20 text-green-600"
                      }`}>
                        {normalizeEnv(c.environment)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{c.keyType}</td>
                    <td className="px-6 py-4">
                      {c.keyValue ? (
                        <div className="flex items-center gap-3">
                          <code className="text-xs font-mono bg-border px-2 py-1 rounded">
                            {showValue[c._id] ? c.keyValue : "••••••••"}
                          </code>
                          <CustomTooltip tooltipContent={showValue[c._id] ? "Hide" : "View"}>
                            <Button className="border-button cursor-pointer" size="icon" onClick={() => toggleShow(c._id)}>
                              {showValue[c._id] ? <EyeOff className="w-5 h-5 mt-0.5" /> : <Eye className="w-5 h-5 mt-0.5" />}
                            </Button>
                          </CustomTooltip>
                          <CustomTooltip tooltipContent="Copy">
                            <Button className="border-button" size="icon" onClick={() => copyToClipboard(c.keyValue, c._id)} disabled={copyLoading[c._id]}>
                              {copyLoading[c._id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </CustomTooltip>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <CustomTooltip tooltipContent="Edit Credential">
                        <Button className="border-button" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </CustomTooltip>
                      <CustomTooltip tooltipContent="Delete Credential">
                        <Button size="icon" className="text-red-600 logout-button">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CustomTooltip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Security Best Practices */}
        <div className="p-6 border text-foreground border-border rounded-2xl border-l-4 border-l-primary">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-green-500" /> Security Best Practices
          </h3>
          <div className="grid sm:grid-cols-3 gap-6 text-sm">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <strong>Encrypted Storage</strong>
                <p className="text-muted-foreground text-xs mt-1">AES-256 encryption at rest</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <User2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <strong>Role-Based Access</strong>
                <p className="text-muted-foreground text-xs mt-1">Only authorized users can view</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <strong>Activity Logging</strong>
                <p className="text-muted-foreground text-xs mt-1">All access is audited</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GlobalDialog open={showDialog} onClose={() => {setShowDialog(false)}} label={'Add Keys & Credentials'}></GlobalDialog>
    </div>
  );
}

export default KeysAndCredentials;