import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchableSelect({
  placeholder = "Select an option...",
  items = [],
  value,
  onValueChange,
  onItemSelect,
  loading = false,
  multi = false,
  allowAddNew = false,
  onAddNew,
  addingNew = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredItems, setFilteredItems] = useState(items);
  const [newItemName, setNewItemName] = useState("");
  const inputRef = useRef(null);

  // Get display name
  const getDisplayName = (item) => {
    if (!item) return "";
    if (item.firstName || item.lastName)
      return `${item.firstName || ""} ${item.lastName || ""}`.trim();
    return item.name || "";
  };

  const getInitials = (item) => {
    const name = getDisplayName(item);
    if (!name) return "??";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0][0]?.toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Focus search input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Filter items based on search
  useEffect(() => {
    const term = search?.toLowerCase().trim();
    if (!term) {
      setFilteredItems(items);
      return;
    }

    setFilteredItems(
      items.filter((item) =>
        getDisplayName(item).toLowerCase().includes(term)
      )
    );
  }, [search, items]);

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) setSearch("");
  };

  // Check if an item is selected
  const isSelected = (id) =>
    multi ? Array.isArray(value) && value.includes(id) : value === id;

  // Check if ALL filtered items are selected
  const allFilteredSelected = useMemo(() => {
    if (!multi || filteredItems.length === 0) return false;
    return filteredItems.every((item) => isSelected(item._id));
  }, [filteredItems, value, multi]);

  // Check if NONE are selected (for "None" styling)
  const noneSelected = multi
    ? !Array.isArray(value) || value.length === 0
    : !value;

  // Handle item selection
  const handleSelect = (itemOrAction) => {
    // Special case: "All" selection
    if (itemOrAction === "ALL") {
      if (allFilteredSelected) {
        // Deselect all
        onValueChange([]);
      } else {
        // Select all currently filtered items
        const allIds = filteredItems.map((i) => i._id);
        onValueChange(allIds);
      }
      return;
    }

    // Special case: "None"
    if (itemOrAction === "NONE") {
      onValueChange(multi ? [] : "");
      return;
    }

    // Regular item
    const item = itemOrAction;
    const id = item._id;

    if (multi) {
      const current = Array.isArray(value) ? [...value] : [];
      const newValue = current.includes(id)
        ? current.filter((v) => v !== id)
        : [...current, id];

      onValueChange(newValue);
    } else {
      onValueChange(id);
      setOpen(false);
    }

    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  return (
    <Select
      open={open}
      onOpenChange={handleOpenChange}
      value={multi ? undefined : value}
      onValueChange={multi ? undefined : onValueChange}
    >
      <SelectTrigger className="w-full">
        {multi ? (
          <div className="flex flex-wrap gap-1 min-h-[20px] py-1">
            {Array.isArray(value) && value.length > 0 ? (
              value.map((id) => {
                const item = items.find((i) => i._id === id);
                return (
                  item && (
                    <span
                      key={id}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-[var(--border)] text-[var(--foreground)] text-xs font-medium"
                    >
                      {getInitials(item)}
                    </span>
                  )
                );
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        ) : (
          <span>
            {getDisplayName(items.find((i) => i._id === value)) || placeholder}
          </span>
        )}
      </SelectTrigger>

      <SelectContent>
        {/* Search Bar */}
        <div className="p-2 sticky top-0 bg-[var(--background)] z-10 border-b`">
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search..."
              className="pl-8 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Options List */}
        {loading ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="px-3 py-4">
            <div className="text-center text-sm text-muted-foreground mb-3">
              No results found
            </div>
            {allowAddNew && onAddNew && (
              <div className="flex gap-2 px-2">
                <Input
                  placeholder="Enter name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter" && newItemName.trim()) {
                      onAddNew(newItemName.trim());
                      setNewItemName("");
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="h-9"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (newItemName.trim()) {
                      onAddNew(newItemName.trim());
                      setNewItemName("");
                    }
                  }}
                  disabled={addingNew || !newItemName.trim()}
                  className="px-4 h-9"
                >
                  {addingNew ? "..." : "Add"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {/* "None" Option */}
            <div
              className={cn(
                "flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer hover:bg-border/50 rounded-md mx-2 mt-2",
                noneSelected && "bg-border/50 font-medium"
              )}
              onClick={() => handleSelect("NONE")}
            >
              <span>None</span>
              {noneSelected && <Check className="w-4 h-4" />}
            </div>

            {/* "All" Option - Only in multi mode */}
            {multi && (
              <div
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer hover:bg-border/50 rounded-md mx-2",
                  allFilteredSelected && "bg-border/50 font-medium"
                )}
                onClick={() => handleSelect("ALL")}
              >
                <span className="font-medium">All</span>
                {allFilteredSelected && <Check className="w-4 h-4" />}
              </div>
            )}

            {/* Separator */}
            {multi && <div className="my-1 border-t border-t-[var(--border)] mx-4" />}

            {/* Actual Items */}
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer hover:bg-border/50 rounded-md mx-2",
                  isSelected(item._id) && "bg-border/50 font-medium"
                )}
                onClick={() => handleSelect(item)}
              >
                <span>{getDisplayName(item)}</span>
                {isSelected(item._id) && <Check className="w-4 h-4" />}
              </div>
            ))}
          </div>
        )}
      </SelectContent>
    </Select>
  );
}