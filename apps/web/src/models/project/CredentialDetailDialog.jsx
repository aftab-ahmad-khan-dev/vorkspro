import React, { useState } from "react";
import {
  Key,
  Server,
  Shield,
  Eye,
  EyeOff,
  Lock,
  FileText,
  Database,
  Cloud,
  Zap,
  Copy,
  Tag,
} from "lucide-react";

function CredentialDetailDialog({
  name,
  environment,
  keyType,
  keyValue,
  description,
  credentialTags,
}) {
  const [showKey, setShowKey] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);

  const safeString = (val) => {
    if (!val) return "N/A";
    const str = typeof val === "string" ? val : String(val);
    return str.trim() || "N/A";
  };

  const credentialName = safeString(name);
  const credentialEnv = safeString(environment);
  const credentialKeyType = safeString(keyType);
  const credentialKey = safeString(keyValue);
  const credentialDescription = safeString(description);

  const envBadge = (() => {
    const v = credentialEnv.toLowerCase();

    if (v.includes("live") || v.includes("prod"))
      return {
        icon: <Server className="w-3.5 h-3.5" />,
        classes: "bg-red-500/10 text-red-600 border-red-500/20",
      };

    if (v.includes("test"))
      return {
        icon: <Zap className="w-3.5 h-3.5" />,
        classes: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      };

    if (v.includes("stag"))
      return {
        icon: <Cloud className="w-3.5 h-3.5" />,
        classes: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      };

    if (v.includes("dev"))
      return {
        icon: <Database className="w-3.5 h-3.5" />,
        classes: "bg-green-500/10 text-green-600 border-green-500/20",
      };

    return {
      icon: <Server className="w-3.5 h-3.5" />,
      classes: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    };
  })();

  const maskedKey = "•".repeat(credentialKey.length || 8);

  const copyValue = async () => {
    try {
      setCopyLoading(true);

      await navigator.clipboard.writeText(credentialKey);

      // force 500ms loading animation
      await new Promise((res) => setTimeout(res, 400));
    } catch (error) {
      console.error("Copy failed", error);
    } finally {
      setCopyLoading(false);
    }
  };
  return (
    <div className="rounded-2xl px-5 py-4 ">
      {/* HEADER */}
      <div className="pb-4 border-b border-[var(--border)]">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--button)]/10 border border-[var(--button)]/40">
              <Key className="w-5 h-5 text-[var(--button)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--foreground)] leading-snug">
              {credentialName}
            </h2>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[13px] font-medium ${envBadge.classes}`}
          >
            {envBadge.icon}
            {credentialEnv.charAt(0).toUpperCase() + credentialEnv.slice(1)}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-black/5 dark:bg-white/5 px-2.5 py-1 text-[11px] font-medium text-[var(--muted-foreground)]">
            <Shield className="w-3.5 h-3.5" />
            {credentialKeyType}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="mt-6 space-y-6">
        {/* KEY VALUE */}
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            <Lock className="w-3.5 h-3.5" />
            Key Value
          </p>

          <div className="rounded-xl border border-[var(--border)] bg-black/[0.03] dark:bg-white/[0.03] px-3 py-3">
            <div className="flex items-center gap-2">
              <p className="flex-1 font-mono text-xs md:text-sm text-[var(--foreground)] break-all">
                {showKey ? credentialKey : maskedKey}
              </p>

              {/* Copy button with loading spinner */}
              <button
                type="button"
                disabled={copyLoading}
                onClick={copyValue}
                className={`h-8 w-8 flex items-center cursor-pointer justify-center rounded-md border border-[var(--border)] bg-black/5 dark:bg-white/5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-black/10 dark:hover:bg-white/10
                  ${
                    copyLoading ? "bg-blue-500/10" : "hover:bg-blue-500/20"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {copyLoading ? (
                  <svg
                    className="animate-spin h-4 w-4 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              {/* Show / hide button */}
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="h-8 w-8 flex items-center cursor-pointer justify-center rounded-md border border-[var(--border)] bg-black/5 dark:bg-white/5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-black/10 dark:hover:bg-white/10"
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* DESCRIPTION – placed below Key Value */}
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            <FileText className="w-3.5 h-3.5" />
            Description
          </p>

          <div className="rounded-xl border border-dashed border-[var(--border)] bg-black/[0.02] dark:bg-white/[0.05] px-3 py-3">
            <p className="text-xs md:text-sm leading-relaxed text-[var(--foreground)]">
              {credentialDescription}
            </p>
          </div>
        </div>

        {/* tags */}
        {/* <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            <Tag className="w-3.5 h-3.5" />
            Tags
          </p>

          <div className="flex flex-wrap gap-2">
            {credentialTags.map((tag) => (
              <div
                key={tag}
                className="inline-flex items-center rounded-full bg-black/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]"
              >
                {tag}
              </div>
            ))}
          </div>
        </div> */}
      </div>

      {/* FOOTER */}
      <div className="mt-6 rounded-xl border border-[var(--border)] bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3 text-[11px] leading-relaxed text-[var(--muted-foreground)]">
        Viewing sensitive details is logged. Follow internal security rotation
        guidelines.
      </div>
    </div>
  );
}

export default CredentialDetailDialog;
