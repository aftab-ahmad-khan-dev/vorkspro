import React from "react";
import { Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import CategoryCard from "./CategoryCard";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "@/components/EmptyState";

export default function DepartmentsTab({ departments, loading, onAdd, onEdit, onDelete, onToggle, togglingStatus }) {
  return (
    <div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 border border-[var(--border)] rounded-2xl bg-[var(--background)]/20 backdrop-blur-sm shadow-lg"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Departments
        </h2>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-6">
          <AnimatePresence>
            {departments.map((d) => (
              <CategoryCard
                key={d._id}
                item={d}
                type="departments"
                icon={User}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggle={onToggle}
                isToggling={togglingStatus[`departments-${d._id}`]}
              />
            ))}
          </AnimatePresence>
          {departments.length === 0 && (
            <div className="col-span-full">
              <EmptyState 
                icon={User}
                title="No departments found"
                subtitle="Create your first department to get started"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
