import React, { useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

/**
 * Generic Kanban board with cross-column drag-and-drop.
 * @param {Array<{ id: string, title: string }>} columns
 * @param {Array} items
 * @param {(item) => string} getColumnId - e.g. (item) => item.status
 * @param {(item) => string} getItemId - e.g. (item) => item._id
 * @param {(itemId, fromColumnId, toColumnId) => void|Promise} onMove
 * @param {(item) => React.ReactNode} renderCard
 * @param {string} [className]
 */
export function KanbanBoard({
  columns,
  items,
  getColumnId,
  getItemId = (item) => item._id || item.id,
  onMove,
  renderCard,
  className = "",
}) {
  const itemsByColumn = useMemo(() => {
    const map = {};
    columns.forEach((col) => {
      map[col.id] = items.filter((item) => getColumnId(item) === col.id);
    });
    return map;
  }, [columns, items, getColumnId]);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;
    if (onMove) onMove(draggableId, source.droppableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        className={cn("grid gap-5 overflow-x-auto pb-4", className)}
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(300px, 1fr))`,
        }}
      >
        {columns.map((col) => (
          <Droppable key={col.id} droppableId={col.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  "rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm p-5 min-h-[360px] transition-all duration-200 shadow-sm",
                  snapshot.isDraggingOver && "ring-2 ring-[var(--primary)]/50 bg-[var(--primary)]/8 border-[var(--primary)]/30"
                )}
              >
                <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--foreground)] mb-4 flex items-center justify-between">
                  <span>{col.title}</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)]">
                    {(itemsByColumn[col.id] || []).length}
                  </span>
                </h3>
                <div className="space-y-3">
                  {(itemsByColumn[col.id] || []).map((item, index) => (
                    <Draggable
                      key={getItemId(item)}
                      draggableId={String(getItemId(item))}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            "rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 transition-all cursor-grab active:cursor-grabbing hover:border-[var(--primary)]/30 hover:shadow-md",
                            snapshot.isDragging && "shadow-xl ring-2 ring-[var(--primary)]/40 opacity-95 scale-[1.02] z-10"
                          )}
                        >
                          {renderCard(item)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
