import React from "react";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AnimatePresence } from "framer-motion";
import TransactionCard from "./TransactionCard";
import Pagination from "./Pagination";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "../EmptyState";

export default function TransactionTypesTab({
  transactionTab,
  onTransactionTabChange,
  incomeTypes,
  expenseTypes,
  loading,
  onAdd,
  onEdit,
  onDelete,
  incomeMeta,
  expenseMeta,
  incomePage,
  expensePage,
  onIncomePageChange,
  onExpensePageChange,
}) {
  return (
    <div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 backdrop-blur-sm shadow-lg"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Transaction Types
        </h2>
        <Button onClick={() => onAdd(transactionTab)}>
          <Plus className="h-4 w-4 mr-2" />
          Add {transactionTab === "income" ? "Income" : "Expense"} Type
        </Button>
      </div>

      <Tabs value={transactionTab} onValueChange={onTransactionTabChange}>
        <TabsList className="grid grid-cols-2 mb-6 rounded-xl bg-[var(--border)]">
          <TabsTrigger
            value="income"
            className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:shadow-sm"
          >
            Income
          </TabsTrigger>
          <TabsTrigger
            value="expense"
            className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:shadow-sm"
          >
            Expense
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {incomeTypes.map((t) => (
                    <TransactionCard
                      key={t._id}
                      item={t}
                      type="income"
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {incomeTypes.length === 0 && (
                <div className="text-center py-16">
                  {/* <p className="text-[var(--muted-foreground)]">
                    No income types found. Create your first income type!
                  </p> */}
                  <EmptyState icon={TrendingUp} title="No income types found" subtitle="Create your first income type!"></EmptyState>
                </div>
              )}

              <Pagination
                total={incomeMeta.totalItems}
                current={incomePage}
                onChange={onIncomePageChange}
                disabled={loading}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="expense">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {expenseTypes.map((t) => (
                    <TransactionCard
                      key={t._id}
                      item={t}
                      type="expense"
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {expenseTypes.length === 0 && (
                <div className="text-center py-16">
                  {/* <p className="text-[var(--muted-foreground)]">
                    No expense types found. Create your first expense type!
                  </p> */}
                  <EmptyState icon={TrendingDown} title="No expense types found" subtitle="Create your first expense type!"></EmptyState>
                </div>
              )}

              <Pagination
                total={expenseMeta.totalItems}
                current={expensePage}
                onChange={onExpensePageChange}
                disabled={loading}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
