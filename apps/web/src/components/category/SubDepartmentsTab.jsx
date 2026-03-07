import React from "react";
import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SubDepartmentCard from "./SubDepartmentCard";
import Pagination from "./Pagination";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "../EmptyState";

export default function SubDepartmentsTab({
  subDepartments,
  departments,
  selectedDepartment,
  onDepartmentChange,
  loading,
  onAdd,
  onEdit,
  onDelete,
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
          Sub Departments
        </h2>
        <div className="sm:flex gap-3 items-center">
          <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              {departments
                .filter((d) => d.isActive)
                .map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button className="mt-3 sm:mt-0" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sub-Department
          </Button>
        </div>
      </div>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subDepartments.map((d) => (
              <SubDepartmentCard
                key={d._id}
                item={d}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>

          {subDepartments.length === 0 && (
            <div className="text-center py-16">
              <EmptyState icon={Layers} title={selectedDepartment ? "No sub departments found in this department." : "No sub-departments found"} subtitle="Create your first sub-department!"></EmptyState>
            </div>
          )}

          <Pagination
            total={pagination.totalItems}
            current={page}
            onChange={onPageChange}
            disabled={loading}
          />
        </>
      )}
    </div>
  );
}
