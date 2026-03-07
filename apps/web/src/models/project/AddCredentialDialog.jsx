import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import TagInput from "@/components/TagInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { credentialApi } from "@/api/credential.js";
import {
  Cloud,
  Database,
  Eye,
  EyeOff,
  FolderOpen,
  Lock,
  Server,
  Shield,
  Zap,
} from "lucide-react";

function AddCredentialDialog({
  selectedApiKey,
  onClose,
  onSuccess,
  projectId,
  onRefresh,
  projects = [],
}) {
  const isEditMode = !!selectedApiKey;
  const showProjectDropdown = !isEditMode && Array.isArray(projects) && projects.length > 0;

  const defaultForm = {
    name: "",
    environment: "Development",
    keyType: "apiKey",
    keyValue: "",
    description: "",
    tags: [],
  };

  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || (projects[0]?._id) || "");

  // 🔧 Normalizers so Select values match options exactly
  const normalizeEnvironment = (env) => {
    if (!env) return "Development";
    const v = String(env).toLowerCase();

    if (["live", "prod", "production"].includes(v)) return "Live";
    // if (["test", "testing"].includes(v)) return "Testing";
    if (["stage", "staging"].includes(v)) return "Staging";
    if (["dev", "development"].includes(v)) return "Development";

    return "Development";
  };

  const normalizeKeyType = (type) => {
    if (!type) return "apiKey";
    const v = String(type).toLowerCase();

    if (["api", "api_key", "api-key", "apikey"].includes(v)) return "apiKey";
    if (["secret", "secret_key", "secret-key", "secretkey"].includes(v))
      return "secretKey";
    if (["token", "bearer"].includes(v)) return "token";
    if (["password", "pass"].includes(v)) return "password";
    if (["credential", "creds"].includes(v)) return "credential";

    return "apiKey";
  };

  // 🔁 Prefill ALL fields from selectedApiKey
  useEffect(() => {
    if (isEditMode && selectedApiKey) {
      setFormData({
        name: selectedApiKey.name || "",
        environment: normalizeEnvironment(
          selectedApiKey.environment ||
          selectedApiKey.env ||
          selectedApiKey.status
        ),
        keyType: normalizeKeyType(
          selectedApiKey.keyType ||
          selectedApiKey.type ||
          selectedApiKey.key_type
        ),
        keyValue:
          selectedApiKey.keyValue ||
          selectedApiKey.value ||
          selectedApiKey.key ||
          "",
        description: selectedApiKey.description || selectedApiKey.desc || "",
        tags: selectedApiKey.tags || selectedApiKey.categories || [],
      });
    } else {
      setFormData(defaultForm);
    }
  }, [isEditMode, selectedApiKey]);

  useEffect(() => {
    if (projectId) setSelectedProjectId(projectId);
    else if (projects.length > 0 && !selectedProjectId) setSelectedProjectId(projects[0]._id);
  }, [projectId, projects]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!token) {
      toast.error("Authentication token missing. Please log in again.");
      return;
    }

    const requiredFields = ["name", "environment", "keyType"];

    for (const field of requiredFields) {
      const value = formData[field];
      if (!value || (typeof value === "string" && !value.trim())) {
        const label = field
          .replace(/([A-Z])/g, " $1")
          .replace("key", "Key")
          .replace("environment", "Environment")
          .trim();

        toast.error(`${label} is required`);
        return;
      }
    }

    setLoading(true);

    const effectiveProjectId = showProjectDropdown ? selectedProjectId : projectId;
    if (!effectiveProjectId && !isEditMode) {
      toast.error("Please select a project.");
      setLoading(false);
      return;
    }

    const payload = {
      _id: selectedApiKey?._id,
      name: formData.name.trim(),
      environment: formData.environment,
      keyType: formData.keyType,
      keyValue: formData.keyValue.trim(),
      description: formData.description?.trim() || "",
      tags: formData.tags || [],
    };

    try {
      const data = isEditMode
        ? await credentialApi.update(projectId, payload)
        : await credentialApi.create(effectiveProjectId, payload);

      if (data.isSuccess) {
        toast.success(
          isEditMode
            ? "Credential updated successfully!"
            : "Credential created successfully!"
        );
        onSuccess?.();
        onRefresh();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      console.error(error);
      // toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Project (when creating with projects list) */}
      {showProjectDropdown && (
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-[var(--muted-foreground)]" />
            Project <span className="text-red-500">*</span>
          </label>
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
          >
            <SelectTrigger className="flex w-full items-center gap-2 rounded-sm border border-[var(--border)] px-3 py-2 cursor-pointer">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.name || p.projectName || p._id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Name */}
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium">
          Credential Name <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="e.g., Firebase API Key"
        />
      </div>

      {/* Environment & Key Type */}
      <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
        {/* Environment */}
        <div className="w-full sm:w-1/2">
          <label className="mb-1 block text-sm font-medium">
            Environment <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.environment}
            onValueChange={(value) => handleChange("environment", value)}
          >
            <SelectTrigger className="flex w-full items-center gap-2 rounded-sm border border-[var(--border)] px-3 py-2 cursor-pointer">
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Live">
                <span className="flex items-center gap-2">
                  <Server className="text-red-500 h-4 w-4" />
                  Live
                </span>
              </SelectItem>
              {/* <SelectItem value="Testing">
                <span className="flex items-center gap-2">
                  <Zap className="text-blue-500 h-4 w-4" />
                  Testing
                </span>
              </SelectItem> */}
              <SelectItem value="Staging">
                <span className="flex items-center gap-2">
                  <Cloud className="text-orange-500 h-4 w-4" />
                  Staging
                </span>
              </SelectItem>
              <SelectItem value="Development">
                <span className="flex items-center gap-2">
                  <Database className="text-green-500 h-4 w-4" />
                  Development
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Type */}
        <div className="w-full sm:w-1/2">
          <label className="mb-1 block text-sm font-medium">
            Key Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.keyType}
            onValueChange={(value) => handleChange("keyType", value)}
          >
            <SelectTrigger className="flex w-full items-center gap-2 rounded-sm border border-[var(--border)] px-3 py-2 cursor-pointer">
              <SelectValue placeholder="Select key type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apiKey">API Key</SelectItem>
              <SelectItem value="secretKey">Secret Key</SelectItem>
              <SelectItem value="token">Token</SelectItem>
              <SelectItem value="password">Password</SelectItem>
              <SelectItem value="credential">Credential</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Value */}
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium">
          Key Value
        </label>
        <div className="relative">
          <Input
            type={showKey ? "text" : "password"}
            placeholder="Enter the key or secret value"
            className="text-sm text-[var(--foreground)] pr-20 pl-9"
            value={formData.keyValue}
            onChange={(e) => handleChange("keyValue", e.target.value)}
          />
          <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
          <button
            type="button"
            onClick={() => setShowKey((prev) => !prev)}
            className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition"
          >
            {showKey ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          <p className="text-xs text-[var(--muted-foreground)]">
            This value will be encrypted and stored securely.
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="md:col-span-2 space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Usage notes, expiry date, provider details, access scope, etc."
          className="h-20"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium">Tags (Optional)</label>
        <TagInput
          value={formData.tags}
          onChange={(tags) => handleChange("tags", tags)}
        />
        <p className="text-xs text-[var(--muted-foreground)]">
          Add tags to categorize and easily find credentials.
        </p>
      </div>

      {/* Actions */}
      <div className="md:col-span-2 flex justify-end pt-4 gap-2">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
              ? "Update Credential"
              : "Create Credential"}
        </Button>
      </div>
    </div>
  );
}

export default AddCredentialDialog;
