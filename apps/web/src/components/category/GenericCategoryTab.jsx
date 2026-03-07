import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import CategoryCard from "./CategoryCard";
import Pagination from "./Pagination";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "@/components/EmptyState";

export default function GenericCategoryTab({
  title,
  items,
  type,
  icon,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  togglingStatus,
  pagination,
  page,
  onPageChange,
}) {
  return (
    <div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 border border-[var(--border)] rounded-2xl bg-[var(--background)]/20 backdrop-blur-sm shadow-lg"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          {title}
        </h2>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add {title.slice(0, -1)}
        </Button>
      </div>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {items.map((item) => (
                <CategoryCard
                  key={item._id}
                  item={item}
                  type={type}
                  icon={icon}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggle={onToggle}
                  isToggling={togglingStatus[`${type}-${item._id}`]}
                />
              ))}
            </AnimatePresence>
          </div>
          {items.length === 0 && (
            <EmptyState 
              icon={icon}
              title={`No ${title.toLowerCase()} found`}
              subtitle={`Create your first ${title.toLowerCase().slice(0, -1)} to get started`}
            />
          )}

          {pagination && (
            <Pagination
              total={pagination.totalItems}
              current={page}
              onChange={onPageChange}
              disabled={loading}
            />
          )}
        </>
      )}
    </div>
  );
}
