import { DollarSign, TrendingUp, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet } from "@/interceptor/interceptor";
import Chip from "@/components/Chip";

export default function BudgetTab({ project, refresh }) {
  const [budgetData, setBudgetData] = useState({
    totalBudget: 0,
    totalExpenses: 0,
    profit: 0,
    departments: [],
    departmentExpenses: {},
  });
  const [loading, setLoading] = useState(true);

  async function getBudgetData() {
    try {
      setLoading(true);
      const response = await apiGet(`project/budget-breakdown/${project._id}`);
      setBudgetData(response);
    } catch (error) {
      console.error("Error fetching budget data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (project?._id) {
      getBudgetData();
    }
  }, [project?._id, refresh]);

  const usagePercentage = budgetData.totalBudget
    ? ((budgetData.totalExpenses / budgetData.totalBudget) * 100).toFixed(1)
    : 0;

  const profitColor = budgetData.profit >= 0 ? "text-green-600" : "text-red-600";
  const availablePercentage = budgetData.totalBudget
    ? (100 - usagePercentage).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="p-6 md:p-8 border border-[var(--border)] rounded-2xl bg-background">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-64 bg-background rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-40 bg-border rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 border border-[var(--border)] rounded-2xl bg-background min-h-[70vh]">
      <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-6">
        Budget Overview
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-[70%] space-y-8 order-2 lg:order-1">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Budget Utilized</span>
              <span className="font-medium text-foreground">
                {usagePercentage}% (${budgetData.totalExpenses.toLocaleString()} / $
                {budgetData.totalBudget.toLocaleString()})
              </span>
            </div>
            <div className="h-3 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${usagePercentage > 90
                  ? "bg-red-500"
                  : usagePercentage > 70
                    ? "bg-amber-500"
                    : "bg-blue-600"
                  }`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {Object.entries(budgetData.departmentExpenses).map(([dept, data]) => {
              const deptPercentage = budgetData.totalExpenses
                ? ((data.amount / budgetData.totalExpenses) * 100).toFixed(1)
                : 0;

              return (
                <div
                  key={dept}
                  className="p-5 border border-[var(--border)] rounded-xl bg-background hover:bg-border transition-all hover:shadow-sm group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[var(--foreground)] truncate">
                          {dept}
                        </h4>
                        <p className="text-2xl font-bold text-foreground mt-1">
                          ${Math.round(data.amount).toLocaleString()}
                        </p>
                        <div className="mt-2 text-sm space-y-1 text-muted-foreground">
                          <p>{deptPercentage}% of budget</p>
                        </div>
                      </div>
                    </div>
                    <Chip
                      status={`${data.employeeCount} team member${data.employeeCount !== 1 ? "s" : ""}`}
                    />
                  </div>
                </div>
              );
            })}

            {Object.keys(budgetData.departmentExpenses).length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No department expenses recorded yet.
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-[30%] space-y-5 order-1 lg:order-2">
          <div className="p-5 border border-[var(--border)] rounded-xl bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-muted-foreground font-medium">Total Budget</span>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              ${budgetData.totalBudget.toLocaleString()}
            </p>
          </div>

          <div className="p-5 border border-[var(--border)] rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-red-600" />
              <span className="text-sm text-muted-foreground font-medium">
                Utilized
              </span>
            </div>

            <p className="text-2xl font-bold text-red-600">
              ${budgetData.totalExpenses.toLocaleString()}
            </p>

            <p className="text-sm text-muted-foreground mt-1">
              {usagePercentage}% of total budget
            </p>
          </div>


          <div className="p-5 border border-[var(--border)] rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm text-muted-foreground font-medium">
                Available
              </span>
            </div>

            <p className={`text-2xl font-bold ${profitColor}`}>
              ${Math.abs(budgetData.profit).toLocaleString()}
              {budgetData.profit < 0 && (
                <span className="text-red-600 ml-1">Loss</span>
              )}
            </p>

            <p className="text-sm text-muted-foreground mt-1">
              {availablePercentage}% remaining
            </p>
          </div>


          <div className="p-5 border border-[var(--border)] rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-muted-foreground font-medium">Departments</span>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {budgetData.departments.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}