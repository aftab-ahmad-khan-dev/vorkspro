import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { apiPatch, apiPost } from "@/interceptor/interceptor";
import {
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
  Table2,
  MessageSquare,
  ListTodo,
  Paperclip,
} from "lucide-react";
import { useTabs } from "@/context/TabsContext";
import { cn } from "@/lib/utils";

const CALLOUT_COLORS = [
  { value: "gray", label: "Gray", bg: "bg-[var(--muted)]/40", border: "border-[var(--border)]" },
  { value: "yellow", label: "Yellow", bg: "bg-amber-500/15", border: "border-amber-500/50" },
  { value: "red", label: "Red", bg: "bg-red-500/15", border: "border-red-500/50" },
  { value: "green", label: "Green", bg: "bg-emerald-500/15", border: "border-emerald-500/50" },
  { value: "blue", label: "Blue", bg: "bg-blue-500/15", border: "border-blue-500/50" },
  { value: "purple", label: "Purple", bg: "bg-purple-500/15", border: "border-purple-500/50" },
];

const BLOCK_TYPES = {
  text: { icon: Type, label: "Text" },
  heading: { icon: Heading1, label: "Heading" },
  list: { icon: List, label: "Bullet list" },
  link: { icon: Link2, label: "Link" },
  divider: { icon: Minus, label: "Divider" },
  table: { icon: Table2, label: "Table" },
  callout: { icon: MessageSquare, label: "Callout" },
  todo: { icon: ListTodo, label: "Todo list" },
  attachment: { icon: Paperclip, label: "Attachment" },
};

function parseCanvas(value) {
  if (!value?.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (_) {}
  return [{ type: "text", content: value }];
}

function TextBlockWithMention({ block, onChange, canEdit, project }) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef(null);
  const members = project?.teamMembers || [];
  const filtered = mentionQuery.trim()
    ? members.filter(
        (m) =>
          `${m.firstName || ""} ${m.lastName || ""}`.toLowerCase().includes(mentionQuery.toLowerCase()) ||
          (m.email || "").toLowerCase().includes(mentionQuery.toLowerCase())
      )
    : members.slice(0, 8);

  const insertMention = (member) => {
    const name = `${member.firstName || ""} ${member.lastName || ""}`.trim() || member.email || "User";
    const before = (block.content || "").slice(0, cursorPos);
    const after = (block.content || "").slice(cursorPos);
    const lastAt = before.lastIndexOf("@");
    const newContent = (before.slice(0, lastAt) + `@${name} ` + after).trimEnd();
    const mentions = [...(block.mentions || []), { userId: member._id, name }];
    onChange({ ...block, content: newContent, mentions });
    setShowMentions(false);
    setMentionQuery("");
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleChange = (e) => {
    const v = e.target.value;
    const pos = e.target.selectionStart ?? v.length;
    setCursorPos(pos);
    const before = v.slice(0, pos);
    const lastAt = before.lastIndexOf("@");
    if (lastAt !== -1 && /@[\w\s]*$/.test(before.slice(lastAt))) {
      setMentionQuery(before.slice(lastAt + 1).trim());
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
    onChange({ ...block, content: v });
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        placeholder="Write something… Use @ to mention a project member"
        value={block.content || ""}
        onChange={handleChange}
        onSelect={(e) => setCursorPos(e.target.selectionStart)}
        onBlur={() => setTimeout(() => setShowMentions(false), 180)}
        disabled={!canEdit}
        rows={Math.max(2, ((block.content || "").split("\n").length || 1) + 1)}
        className="w-full text-sm bg-transparent border-0 border-b border-transparent hover:border-[var(--border)] focus:border-[var(--primary)] focus:outline-none resize-none py-1 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
      />
      {showMentions && filtered.length > 0 && (
        <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-lg py-1 max-h-48 overflow-auto">
          {filtered.map((m) => (
            <button
              key={m._id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--muted)]/50 flex items-center gap-2"
              onMouseDown={(e) => { e.preventDefault(); insertMention(m); }}
            >
              <span className="font-medium">{m.firstName} {m.lastName}</span>
              {m.email && <span className="text-xs text-[var(--muted-foreground)] truncate">{m.email}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function serializeBlocks(blocks) {
  if (!blocks?.length) return "";
  return JSON.stringify(blocks);
}

function SortableBlock({
  id,
  canEdit,
  block,
  onUpdate,
  onRemove,
  project,
  uploadAttachment,
  childrenViewer,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 0,
  };

  if (!canEdit) {
    return <div>{childrenViewer}</div>;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-2 rounded-lg transition-colors",
        isDragging && "ring-2 ring-[var(--primary)]/50 shadow-lg bg-[var(--card)]"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="shrink-0 mt-2 p-1 -ml-1 rounded cursor-grab active:cursor-grabbing touch-none hover:bg-[var(--muted)]/30 flex items-center gap-1"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4 text-[var(--muted-foreground)]" />
      </div>
      <div className="flex-1 min-w-0">
        <BlockEditor
          block={block}
          onChange={onUpdate}
          onRemove={onRemove}
          canEdit={canEdit}
          project={project}
          onMention={{ uploadAttachment }}
          hideGripForSortable
        />
      </div>
    </div>
  );
}

function BlockEditor({ block, onChange, onRemove, canEdit, project, onMention, hideGripForSortable }) {
  const config = BLOCK_TYPES[block.type] || BLOCK_TYPES.text;
  const Icon = config?.icon || Type;
  const showGrip = canEdit && !hideGripForSortable;

  if (block.type === "divider") {
    return (
      <div className="group flex items-center gap-2 py-2">
        {canEdit && (
          <>
            {showGrip && <GripVertical className="w-4 h-4 text-[var(--muted-foreground)] shrink-0 opacity-0 group-hover:opacity-100 transition" />}
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

  if (block.type === "callout") {
    const colorConfig = CALLOUT_COLORS.find((c) => c.value === (block.color || "gray")) || CALLOUT_COLORS[0];
    return (
      <div className="group flex items-start gap-2 py-2">
        {canEdit && (
          <div className="flex items-center gap-1 shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition">
            {showGrip && <GripVertical className="w-4 h-4 text-[var(--muted-foreground)]" />}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        )}
        <div className={cn("flex-1 min-w-0 rounded-xl border p-3", colorConfig.bg, colorConfig.border)}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-[var(--muted-foreground)]">{config.label}</span>
            {canEdit && (
              <select
                value={block.color || "gray"}
                onChange={(e) => onChange({ ...block, color: e.target.value })}
                className="text-xs rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1"
              >
                {CALLOUT_COLORS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            )}
          </div>
          <textarea
            placeholder="Callout text…"
            value={block.content || ""}
            onChange={(e) => onChange({ ...block, content: e.target.value })}
            disabled={!canEdit}
            rows={2}
            className="w-full text-sm bg-transparent border-0 focus:outline-none resize-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
          />
        </div>
      </div>
    );
  }

  if (block.type === "table") {
    const rows = Array.isArray(block.rows) ? block.rows : [["", ""], ["", ""]];
    const setCell = (r, c, val) => {
      const next = rows.map((row, i) =>
        i === r ? row.map((cell, j) => (j === c ? val : cell)) : [...row]
      );
      onChange({ ...block, rows: next });
    };
    const addRow = () => onChange({ ...block, rows: [...rows, rows[0].map(() => "")] });
    const addCol = () => onChange({ ...block, rows: rows.map((row) => [...row, ""]) });
    const removeRow = (r) => {
      if (rows.length <= 1) return;
      onChange({ ...block, rows: rows.filter((_, i) => i !== r) });
    };
    return (
      <div className="group flex items-start gap-2 py-2">
        {canEdit && (
          <div className="flex items-center gap-1 shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition">
            {showGrip && <GripVertical className="w-4 h-4 text-[var(--muted-foreground)]" />}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        )}
        <div className="flex-1 min-w-0 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-2">
            <Icon className="w-3.5 h-3.5" />
            <span>{config.label}</span>
            {canEdit && (
              <>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={addRow}>+ Row</Button>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={addCol}>+ Col</Button>
              </>
            )}
          </div>
          <table className="w-full border border-[var(--border)] rounded-lg overflow-hidden">
            <tbody>
              {rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className="border border-[var(--border)] p-1">
                      <input
                        value={cell}
                        onChange={(e) => setCell(r, c, e.target.value)}
                        disabled={!canEdit}
                        className="w-full min-w-[80px] text-sm bg-transparent border-0 focus:outline-none px-1 py-0.5"
                      />
                    </td>
                  ))}
                  {canEdit && rows.length > 1 && (
                    <td className="border-0 p-0 w-8">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRow(r)}>
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (block.type === "todo") {
    const items = Array.isArray(block.items) ? block.items : [];
    const updateItem = (i, updates) => {
      const next = items.map((item, idx) => (idx === i ? { ...item, ...updates } : item));
      onChange({ ...block, items: next });
    };
    const addItem = () => onChange({ ...block, items: [...items, { text: "", done: false }] });
    const removeItem = (i) => onChange({ ...block, items: items.filter((_, idx) => idx !== i) });
    return (
      <div className="group flex items-start gap-2 py-2">
        {canEdit && (
          <div className="flex items-center gap-1 shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition">
            {showGrip && <GripVertical className="w-4 h-4 text-[var(--muted-foreground)]" />}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-2">
            <Icon className="w-3.5 h-3.5" />
            <span>{config.label}</span>
            {canEdit && (
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={addItem}>+ Item</Button>
            )}
          </div>
          <ul className="space-y-1">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!item.done}
                  onChange={(e) => updateItem(i, { done: e.target.checked })}
                  disabled={!canEdit}
                  className="rounded border-[var(--border)]"
                />
                <input
                  value={item.text || ""}
                  onChange={(e) => updateItem(i, { text: e.target.value })}
                  disabled={!canEdit}
                  placeholder="To-do item"
                  className={cn(
                    "flex-1 text-sm bg-transparent border-0 border-b border-transparent focus:border-[var(--primary)] focus:outline-none py-0.5",
                    item.done && "line-through text-[var(--muted-foreground)]"
                  )}
                />
                {canEdit && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeItem(i)}>
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (block.type === "attachment") {
    return (
      <div className="group flex items-start gap-2 py-2">
        {canEdit && (
          <div className="flex items-center gap-1 shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition">
            {showGrip && <GripVertical className="w-4 h-4 text-[var(--muted-foreground)]" />}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-1">
            <Icon className="w-3.5 h-3.5" />
            <span>{config.label}</span>
          </div>
          {block.url ? (
            <a
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--primary)] hover:underline flex items-center gap-2"
            >
              <Paperclip className="w-4 h-4" />
              {block.name || "Attachment"}
            </a>
          ) : canEdit && onMention?.uploadAttachment ? (
            <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline">
              <Paperclip className="w-4 h-4" />
              <span>Upload file</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onMention.uploadAttachment(file, (url, name) => onChange({ ...block, url, name: name || file.name }));
                  e.target.value = "";
                }}
              />
            </label>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2 py-2">
      {canEdit && (
        <div className="flex items-center gap-1 shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition">
          {showGrip && <GripVertical className="w-4 h-4 text-[var(--muted-foreground)] cursor-grab" />}
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
          <TextBlockWithMention
            block={block}
            onChange={onChange}
            canEdit={canEdit}
            project={project}
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

  if (block.type === "callout") {
    const colorConfig = CALLOUT_COLORS.find((c) => c.value === (block.color || "gray")) || CALLOUT_COLORS[0];
    return (
      <div className={cn("rounded-xl border p-3", colorConfig.bg, colorConfig.border)}>
        <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{block.content || ""}</p>
      </div>
    );
  }

  if (block.type === "table") {
    const rows = Array.isArray(block.rows) ? block.rows : [];
    if (!rows.length) return null;
    return (
      <div className="overflow-x-auto py-2">
        <table className="w-full border border-[var(--border)] rounded-lg">
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} className="border border-[var(--border)] p-2 text-sm text-[var(--foreground)]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.type === "todo") {
    const items = Array.isArray(block.items) ? block.items : [];
    return (
      <ul className="space-y-1 py-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className={cn(item.done && "line-through text-[var(--muted-foreground)]")}>
              {item.done ? "☑" : "☐"} {item.text || "..."}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "attachment") {
    if (!block.url) return null;
    return (
      <a
        href={block.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-[var(--primary)] hover:underline flex items-center gap-2 py-1"
      >
        <Paperclip className="w-4 h-4" />
        {block.name || "Attachment"}
      </a>
    );
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
      const mentionedUserIds = collectMentionedUserIds();
      const data = await apiPatch(`project/update-canvas/${project._id}`, {
        canvas: payload,
        mentionedUserIds,
      });
      if (data?.isSuccess) {
        setHasEdited(false);
        toast.success("Canvas saved");
        if (mentionedUserIds.length > 0) toast.success("Mentioned members will be notified.");
        refresh?.();
      } else {
        toast.error(data?.message || "Failed to save");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to save canvas");
    } finally {
      setSaving(false);
    }
  }, [project?._id, blocks, refresh, collectMentionedUserIds]);

  const addBlock = (type) => {
    let newBlock;
    if (type === "link") newBlock = { type, content: "", url: "" };
    else if (type === "list") newBlock = { type, items: [] };
    else if (type === "table") newBlock = { type, rows: [["", ""], ["", ""]] };
    else if (type === "callout") newBlock = { type, content: "", color: "gray" };
    else if (type === "todo") newBlock = { type, items: [{ text: "", done: false }] };
    else if (type === "attachment") newBlock = { type, name: "", url: "" };
    else newBlock = { type, content: "" };
    setBlocks((prev) => [...prev, newBlock]);
    setHasEdited(true);
    setShowAddMenu(false);
  };

  const uploadAttachment = useCallback(
    async (file, onDone) => {
      if (!project?._id) return;
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await apiPost(`project/upload-canvas-attachment/${project._id}`, form);
        const url = res?.url;
        if (url) onDone(url, file.name);
        else toast.error("Upload failed");
      } catch (err) {
        toast.error(err?.message || "Upload failed");
      }
    },
    [project?._id]
  );

  const collectMentionedUserIds = useCallback(() => {
    const ids = new Set();
    blocks.forEach((b) => {
      (b.mentions || []).forEach((m) => m.userId && ids.add(m.userId));
    });
    return [...ids];
  }, [blocks]);

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

  const moveBlock = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setBlocks((prev) => arrayMove(prev, fromIndex, toIndex));
    setHasEdited(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const fromIndex = Number(String(active.id).replace("block-", ""));
      const toIndex = Number(String(over.id).replace("block-", ""));
      if (Number.isNaN(fromIndex) || Number.isNaN(toIndex)) return;
      moveBlock(fromIndex, toIndex);
    },
    [moveBlock]
  );

  const isEmpty = !blocks?.length;
  const canvasTitle = project?.name ? `${project.name} – Canvas` : "Your canvas title";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 overflow-hidden flex flex-col min-h-[420px]">
      {/* Slack-style header: title + prompt */}
      <div className="p-6 sm:p-8 border-b border-[var(--border)]/50">
        <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--foreground)] mb-1">
          {canvasTitle}
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-1">
          Feeling stuck? Try a template.
        </p>
        <p className="text-[var(--foreground)]">
          Time to document your genius!
        </p>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-[280px] p-4 sm:p-6 overflow-y-auto">
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
            <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-md">
              Use the toolbar below to add text, headings, lists, links, tables, callouts, todo lists, attachments, or dividers. Use @ in text to mention project members.
            </p>
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-12 w-12 p-0"
              onClick={() => addBlock("text")}
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        ) : (
          <div className="space-y-1 pb-4">
            {canEdit && (
              <div className="flex items-center justify-end gap-2 mb-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSave}
                  disabled={saving || !hasEdited}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            )}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((_, i) => `block-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block, index) => (
                  <div
                    key={index}
                    className={cn(
                      "rounded-lg transition-colors",
                      canEdit && "hover:bg-[var(--muted)]/20"
                    )}
                  >
                    {canEdit ? (
                      <SortableBlock
                        id={`block-${index}`}
                        canEdit={canEdit}
                        block={block}
                        onUpdate={(updated) => updateBlock(index, updated)}
                        onRemove={() => removeBlock(index)}
                        project={project}
                        uploadAttachment={uploadAttachment}
                        childrenViewer={<BlockViewer block={block} />}
                      />
                    ) : (
                      <BlockViewer block={block} />
                    )}
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      {/* Slack-style footer toolbar: green + and visible block shortcuts (light blue rounded) */}
      {canEdit && (
        <div className="sticky bottom-0 p-3 border-t border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm flex items-center justify-center gap-2 flex-wrap">
          <div className="relative">
            <Button
              size="icon"
              className="h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 shrink-0"
              onClick={() => setShowAddMenu((v) => !v)}
            >
              <Plus className="w-5 h-5" />
            </Button>
            {showAddMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowAddMenu(false)}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 py-1 rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-lg min-w-[200px]">
                  {Object.entries(BLOCK_TYPES).map(([type, { icon: Icon, label }]) => (
                    <button
                      key={type}
                      onClick={() => addBlock(type)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[var(--muted)]/50 text-left rounded-lg"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {(["text", "heading", "list", "link", "divider", "table", "callout", "todo", "attachment"].map((type) => {
              const { icon: Icon, label } = BLOCK_TYPES[type] || {};
              if (!Icon) return null;
              return (
                <Button
                  key={type}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl bg-sky-500/15 border-sky-500/40 text-[var(--foreground)] hover:bg-sky-500/25 hover:border-sky-500/60 shrink-0"
                  onClick={() => addBlock(type)}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            }))}
          </div>
        </div>
      )}
    </div>
  );
}
