import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Lock, User2, Eye, EyeOff, Copy, Loader2, Key, Server, Database, Zap, FolderOpen } from "lucide-react";
import StatCard from "@/components/Stats";
import CustomTooltip from "@/components/Tooltip";
import EmptyState from "@/components/EmptyState";
import { toast } from "sonner";
import { apiGet } from "@/interceptor/interceptor";
import GlobalDialog from "@/models/GlobalDialog";
import AddCredentialDialog from "@/models/project/AddCredentialDialog";

function KeysAndCredentials() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [envFilter, setEnvFilter] = useState("all");
  const [showValue, setShowValue] = useState({});
  const [copyLoading, setCopyLoading] = useState({});
  const [showAddKey, setShowAddKey] = useState(false);

  const refreshCredentials = useCallback(() => {
    if (!selectedProjectId) return;
    apiGet(`credential/get-by-project/${selectedProjectId}`)
      .then((data) => {
        if (data?.isSuccess && Array.isArray(data?.credentials)) {
          setCredentials(data.credentials);
        } else {
          setCredentials([]);
        }
      })
      .catch(() => setCredentials([]));
  }, [selectedProjectId]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet("project/get-all");
        if (data?.isSuccess && Array.isArray(data?.filteredData?.projects)) {
          setProjects(data.filteredData.projects);
          if (data.filteredData.projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(data.filteredData.projects[0]._id);
          }
        } else {
          setProjects([]);
        }
      } catch (e) {
        setProjects([]);
        const m = e?.message || "";
        const isNetwork = /failed to fetch|networkerror|load failed/i.test(m);
        const msg = isNetwork
          ? "Unable to connect to the server. Please check your connection and that the API is running."
          : m.toLowerCase().includes("permission")
            ? "You don't have permission to view projects."
            : "Failed to load projects.";
        toast.error(msg);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setCredentials([]);
      return;
    }
    setLoading(true);
    apiGet(`credential/get-by-project/${selectedProjectId}`)
      .then((data) => {
        if (data?.isSuccess && Array.isArray(data?.credentials)) {
          setCredentials(data.credentials);
        } else {
          setCredentials([]);
        }
      })
      .catch(() => {
        toast.error("Failed to load credentials for this project");
        setCredentials([]);
      })
      .finally(() => setLoading(false));
  }, [selectedProjectId]);

  const selectedProjectName = projects.find((p) => p._id === selectedProjectId)?.name || projects.find((p) => p._id === selectedProjectId)?.projectName || "this project";

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
      (c.keyType && c.keyType.toLowerCase().includes(searchLower));
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
    <div className="min-h-screen w-full text-[var(--foreground)] pb-8 flex flex-col gap-8">
      {/* Header */}
      <div className="mb-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          Keys & Credentials
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Secure storage for API keys, passwords, and credentials. Select a project to view or manage.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Project selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
            <FolderOpen className="w-4 h-4" /> Project
          </label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full sm:w-64 text-foreground">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.name || p.projectName || p._id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProjectId && (
            <>
              <Button
                size="sm"
                onClick={() => setShowAddKey(true)}
                className="bg-[var(--button)] text-[var(--primary-foreground)] hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" /> Add key
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/app/projects/project/details/${selectedProjectId}`)}
                className="border-[var(--border)]"
              >
                Open project
              </Button>
            </>
          )}
        </div>

        <GlobalDialog
          open={showAddKey}
          label={`Add key — ${selectedProjectName}`}
          onClose={() => setShowAddKey(false)}
        >
          <AddCredentialDialog
            projectId={selectedProjectId}
            projects={projects}
            onSuccess={() => {
              setShowAddKey(false);
              refreshCredentials();
            }}
            onRefresh={refreshCredentials}
          />
        </GlobalDialog>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard title="Total" value={credentials.length} icon={<Key size={18}/>} iconClass="text-purple-500 bg-purple-500/15" />
          <StatCard title="Live" value={live} icon={<Server size={18}/>} iconClass="text-red-500 bg-red-500/15" />
          <StatCard title="Testing/Staging" value={testing} icon={<Zap size={18}/>} iconClass="text-blue-500 bg-blue-500/15" />
          <StatCard title="Development" value={dev} icon={<Database size={18}/>} iconClass="text-green-500 bg-green-500/15" />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by key name or type..."
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
        </div>

        {/* Credentials Table */}
        <div className="text-foreground overflow-x-auto rounded-xl border border-[var(--border)]">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-[var(--muted-foreground)]">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading credentials…
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-b-[var(--border)]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium">Project</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Environment</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Value</th>
                  <th className="px-6 py-4 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!selectedProjectId ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <EmptyState icon={FolderOpen} title="Select a project" subtitle="Choose a project above to view its keys and credentials." />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <EmptyState icon={Lock} title="No credentials in this project" subtitle="Add credentials from the project's Credentials tab." />
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c._id} className="border-b border-b-[var(--border)] hover:bg-border/30 transition">
                      <td className="px-6 py-4 text-[var(--muted-foreground)] text-sm">{selectedProjectName}</td>
                      <td className="px-6 py-4 font-medium">{c.name}</td>
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
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[var(--border)]"
                          onClick={() => navigate(`/app/projects/project/details/${selectedProjectId}`)}
                        >
                          Manage in project
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Security Best Practices */}
        <div className="p-6 border text-foreground border-border rounded-2xl border-l-4 border-l-primary">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-green-500" /> Project-specific entities
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Keys and credentials are project-specific entities. Each project has its own set; select a project above to view or manage them. Add and edit credentials from each project&apos;s Credentials tab.
          </p>
          <h4 className="text-sm font-semibold mb-2">Security best practices</h4>
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

    </div>
  );
}

export default KeysAndCredentials;