import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { apiPatch } from "@/interceptor/interceptor";
import {
  PenLine,
  Save,
  StickyNote,
  Plus,
  Trash2,
  Type,
  Heading1,
  List,
  Link2,
  Minus,
  GripVertical,
} from "lucide-react";
import { useTabs } from "@/context/TabsContext";
import { cn } from "@/lib/utils";

const BLOCK_TYPES = {
  text: { icon: Type, label: "Text" },
  heading: { icon: Heading1, label: "Heading" },
  list: { icon: List, label: "Bullet list" },
  link: { icon: Link2, label: "Link" },
  divider: { icon: Minus, label: "Divider" },
};

function parseCanvas(value) {
  if (!value?.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (_) {}
  return [{ type: "text", content: value }];
}

function serializeBlocks(blocks) {
  if (!blocks?.length) return "";
  return JSON.stringify(blocks);
}

function BlockEditor({ block, onChange, onRemove, canEdit }) {
  const config = BLOCK_TYPES[block.type] || BLOCK_TYPES.text;
  const Icon = config?.icon || Type;

  if (block.type === "divider") {
    return (
      <div className="group flex items-center gap-2 py-2">
        {canEdit && (
          <>
            <GripVertical className="w-4 h-4 text-[var(--muted-foreground)] shrink-0 opacity-0 group-hover:opacity-100 transition" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition"
              onClick={onRemove}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </>
        )}
        <div className="flex-1 border-t border-[var(--border)]" />
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2 py-2">
      {canEdit && (
        <div className="flex items-center gap-1 shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition">
          <GripVertical className="w-4 h-4 text-[var(--muted-foreground)] cursor-grab" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRemove}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      )}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <Icon className="w-3.5 h-3.5" />
          <span>{config?.label}</span>
        </div>
        {block.type === "link" ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Link text"
              value={block.content || ""}
              onChange={(e) =>
                onChange({ ...block, content: e.target.value })
              }
              disabled={!canEdit}
              className="font-medium"
            />
            <Input
              placeholder="https://..."
              value={block.url || ""}
              onChange={(e) => onChange({ ...block, url: e.target.value })}
              disabled={!canEdit}
              className="text-sm text-[var(--muted-foreground)]"
            />
          </div>
        ) : block.type === "heading" ? (
          <textarea
            placeholder="Heading"
            value={block.content || ""}
            onChange={(e) =>
              onChange({ ...block, content: e.target.value })
            }
            disabled={!canEdit}
            rows={1}
            className="w-full text-lg font-semibold bg-transparent border-0 border-b border-transparent hover:border-[var(--border)] focus:border-[var(--primary)] focus:outline-none resize-none py-1 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
          />
        ) : block.type === "list" ? (
          <textarea
            placeholder="One item per line"
            value={Array.isArray(block.items) ? block.items.join("\n") : (block.content || "")}
            onChange={(e) =>
              onChange({
                ...block,
                items: e.target.value.split("\n").filter(Boolean),
              })
            }
            disabled={!canEdit}
            rows={Math.max(2, (block.items?.length || 1) + 1)}
            className="w-full text-sm bg-transparent border-0 border-b border-transparent hover:border-[var(--border)] focus:border-[var(--primary)] focus:outline-none resize-none py-1 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
          />
        ) : (
          <textarea
            placeholder="Write something…"
            value={block.content || ""}
            onChange={(e) =>
              onChange({ ...block, content: e.target.value })
            }
            disabled={!canEdit}
            rows={Math.max(2, ((block.content || "").split("\n").length || 1) + 1)}
            className="w-full text-sm bg-transparent border-0 border-b border-transparent hover:border-[var(--border)] focus:border-[var(--primary)] focus:outline-none resize-none py-1 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
          />
        )}
      </div>
    </div>
  );
}

function BlockViewer({ block }) {
  const config = BLOCK_TYPES[block.type] || BLOCK_TYPES.text;

  if (block.type === "divider") {
    return <div className="py-2 border-t border-[var(--border)]" />;
  }

  if (block.type === "heading") {
    return (
      <h3 className="text-lg font-semibold text-[var(--foreground)] py-1">
        {block.content || "..."}
      </h3>
    );
  }

  if (block.type === "list") {
    const items = block.items || (block.content ? block.content.split("\n") : []);
    return (
      <ul className="list-disc list-inside space-y-1 text-sm text-[var(--foreground)] py-1">
        {items.filter(Boolean).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "link") {
    const url = block.url || block.content || "#";
    const text = block.content || block.url || url;
    return (
      <a
        href={url.startsWith("http") ? url : `https://${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-[var(--primary)] hover:underline py-1 inline-block"
      >
        {text}
      </a>
    );
  }

  return (
    <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap py-1">
      {block.content || ""}
    </p>
  );
}

export default function CanvasTab({ project, refresh }) {
  const [blocks, setBlocks] = useState(() =>
    parseCanvas(project?.canvas)
  );
  const [saving, setSaving] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const { actions } = useTabs();
  const isSuperAdmin = actions?.isSuperAdmin ?? false;
  const canEdit =
    isSuperAdmin ||
    actions?.modulePermissions?.some(
      (m) => m.module === "Projects" && m.actions?.includes("Edit Records")
    );

  useEffect(() => {
    setBlocks(parseCanvas(project?.canvas));
  }, [project?._id, project?.canvas]);

  const handleSave = useCallback(async () => {
    if (!project?._id) return;
    setSaving(true);
    try {
      const payload = serializeBlocks(blocks);
      const data = await apiPatch(`project/update-canvas/${project._id}`, {
        canvas: payload,
      });
      if (data?.isSuccess) {
        setHasEdited(false);
        toast.success("Canvas saved");
        refresh?.();
      } else {
        toast.error(data?.message || "Failed to save");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to save canvas");
    } finally {
      setSaving(false);
    }
  }, [project?._id, blocks, refresh]);

  const addBlock = (type) => {
    const newBlock =
      type === "link"
        ? { type, content: "", url: "" }
        : type === "list"
          ? { type, items: [] }
          : { type, content: "" };
    setBlocks((prev) => [...prev, newBlock]);
    setHasEdited(true);
    setShowAddMenu(false);
  };

  const updateBlock = (index, updated) => {
    setBlocks((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
    setHasEdited(true);
  };

  const removeBlock = (index) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
    setHasEdited(true);
  };

  const isEmpty = !blocks?.length;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-[var(--border)] bg-[var(--card)]/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
            <StickyNote className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Project canvas
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Notes, ideas, links — create when you need it, like Slack canvas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddMenu((v) => !v)}
                className="shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add block
              </Button>
              {showAddMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowAddMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-20 py-1 rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-lg min-w-[160px]">
                    {Object.entries(BLOCK_TYPES).map(([type, { icon: Icon, label }]) => (
                      <button
                        key={type}
                        onClick={() => addBlock(type)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)]/50 text-left"
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {canEdit && !isEmpty && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !hasEdited}
              className="shrink-0"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving…" : "Save"}
            </Button>
          )}
        </div>
      </div>

      <div className="min-h-[320px] p-4 sm:p-6">
        {isEmpty && !canEdit ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <StickyNote className="w-14 h-14 text-[var(--muted-foreground)]/50 mb-4" />
            <p className="text-[var(--foreground)] font-medium">No canvas yet</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-sm">
              Only users with edit access can create a canvas for this project.
            </p>
          </div>
        ) : isEmpty && canEdit ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--border)]/50 flex items-center justify-center mb-4">
              <PenLine className="w-8 h-8 text-[var(--muted-foreground)]" />
            </div>
            <p className="text-[var(--foreground)] font-medium">
              Create a canvas for this project
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-md mb-6">
              Add notes, decisions, links, and ideas — your team’s space, on your terms.
            </p>
            <Button onClick={() => addBlock("text")}>
              <Plus className="w-4 h-4 mr-2" />
              Create canvas
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {blocks.map((block, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-lg transition-colors",
                  canEdit && "hover:bg-[var(--muted)]/20"
                )}
              >
                {canEdit ? (
                  <BlockEditor
                    block={block}
                    onChange={(updated) => updateBlock(index, updated)}
                    onRemove={() => removeBlock(index)}
                    canEdit={canEdit}
                  />
                ) : (
                  <BlockViewer block={block} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
