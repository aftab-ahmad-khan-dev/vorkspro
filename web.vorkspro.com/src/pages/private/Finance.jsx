import React, { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Confirmation from "@/models/Confirmation";
import CreateDialog from "@/models/finance/CreateDialog";
import GlobalDialog from "@/models/GlobalDialog";
import { toast } from "sonner";
import { useTabs } from "@/context/TabsContext";
import { apiGet, apiPost } from "@/interceptor/interceptor";
import EmptyState from "@/components/EmptyState";

function Finance() {
  const [openTransaction, setOpenTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Real data from API
  const [financeStats, setFinanceStats] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState({
    incomeExpenseData: [],
    profitTrendData: [],
  });

  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  const token = localStorage.getItem("token");
  const { actions } = useTabs();
  const isSuperAdmin = actions?.isSuperAdmin || false;

  const hasPermission = (moduleName, requiredAction) => {
    if (isSuperAdmin) return true;

    return actions?.modulePermissions?.some(
      (modules) => {
        const currentModule = modules.module == moduleName;
        if (currentModule == true) {
          return modules.actions.includes(requiredAction);
        }
      }
    );
  };

  // Fetch Transaction Types (for CreateDialog)
  const fetchTransactionTypes = async () => {
    try {
      const data = await apiGet("transaction-type/get-all");
      if (data?.isSuccess) {
        setTransactionType(data?.transactionTypes || []);
      }
    } catch (error) {
      console.error("Failed to fetch transaction types", error);
    }
  };

  // Fetch All Transactions + Compute Stats & Charts
  const fetchTransactions = async () => {
    setLoading(true);
    setStatsLoading(true);
    try {
      const result = await apiPost("transaction/get-all", {});

      if (result.isSuccess && Array.isArray(result.transactions)) {
        const txns = result.transactions;

        // Sort by date (newest first)
        txns.sort((a, b) => new Date(b.date) - new Date(a.date));

        setTransactions(txns.slice(0, 10)); // Show latest 10

        // Compute Stats
        const totalIncome = txns
          .filter((t) => t.transactionType === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = txns
          .filter((t) => t.transactionType === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        const netProfit = totalIncome - totalExpenses;
        const profitMargin =
          totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

        setFinanceStats([
          {
            title: "Total Income",
            value: `$${Math.round(totalIncome / 1000)}K`,
            subtitle: "+12% vs last month",
            color: "text-green-600",
          },
          {
            title: "Total Expenses",
            value: `$${Math.round(totalExpenses / 1000)}K`,
            subtitle: "+8% vs last month",
            color: "text-red-600",
          },
          {
            title: "Net Profit",
            value: `$${Math.round(netProfit / 1000)}K`,
            subtitle: "+18% vs last month",
            color: netProfit >= 0 ? "text-green-600" : "text-red-600",
          },
          {
            title: "Profit Margin",
            value: `${profitMargin}%`,
            subtitle: profitMargin >= 28.7 ? "+2.1%" : "-2.3% vs last month",
            color: profitMargin >= 28.7 ? "text-green-600" : "text-red-600",
          },
        ]);

        // Generate Last 6 Months Chart Data
        const last6Months = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

          const monthTxns = txns.filter((t) => {
            const tDate = new Date(t.date);
            return (
              tDate.getFullYear() === date.getFullYear() &&
              tDate.getMonth() === date.getMonth()
            );
          });

          const income = monthTxns
            .filter((t) => t.transactionType === "income")
            .reduce((s, t) => s + t.amount, 0);

          const expenses = monthTxns
            .filter((t) => t.transactionType === "expense")
            .reduce((s, t) => s + t.amount, 0);

          last6Months.push({
            month: monthNames[date.getMonth()],
            income: Math.round(income / 100) * 100, // round to nearest 100
            expenses: Math.round(expenses / 100) * 100,
            profit: Math.round((income - expenses) / 100) * 100,
          });
        }

        setChartData({
          incomeExpenseData: last6Months,
          profitTrendData: last6Months.map((m) => ({
            month: m.month,
            profit: m.profit,
          })),
        });
      } else {
        toast.error("Failed to load transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionTypes();
    fetchTransactions();
  }, []);

  // Skeleton for Stats Cards
  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-lg p-6 border border-[var(--border)] animate-pulse">
          <div className="h-5 bg-[var(--border)] rounded w-32 mb-3"></div>
          <div className="h-10 bg-[var(--border)] rounded w-24"></div>
          <div className="h-4 bg-[var(--border)] rounded w-28 mt-2"></div>
        </div>
      ))}
    </div>
  );

  // Skeleton for Table Rows
  const TableSkeleton = () => (
    <tbody>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b border-[var(--border)] animate-pulse">
          <td className="py-3 px-4">
            <div className="h-6 bg-[var(--border)] rounded w-20"></div>
          </td>
          <td className="py-3 px-4">
            <div className="h-4 bg-[var(--border)] rounded w-48"></div>
          </td>
          <td className="py-3 px-4">
            <div className="h-4 bg-[var(--border)] rounded w-24"></div>
          </td>
          <td className="py-3 px-4">
            <div className="h-4 bg-[var(--border)] rounded w-20"></div>
          </td>
          <td className="py-3 px-4">
            <div className="h-6 bg-[var(--border)] rounded-full w-24"></div>
          </td>
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className="min-h-screen w-full text-[var(--foreground)] pb-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            Finance Management
          </h1>
          <p className="text-sm sm:text-base text-[var(--muted-foreground)] mt-1">
            Track income, expenses, and financial reports
          </p>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
          {hasPermission("Finance", "Export Data") && (
          <Button className="flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base w-full sm:w-auto">
            <Download size={18} />
            <span className="text-sm">Export Report</span>
          </Button>
          )}

          {
            hasPermission("Finance", "Create Records") && (
          <Button
            onClick={() => setOpenTransaction(true)}
            className="bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus size={18} />
            <span className="text-sm">Add Transaction</span>
          </Button>
            )
          }
        </div>
      </div>

      {/* Top Stats */}
      {statsLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {financeStats.map((item, idx) => (
            <div key={idx} className="rounded-lg p-6 border border-[var(--border)]">
              <h3 className="text-sm font-medium mb-2">{item.title}</h3>
              <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{item.subtitle}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Income vs Expenses */}
        <div className="rounded-lg border border-[var(--border)] p-6">
          <h3 className="text-lg font-bold mb-2">Income vs Expenses</h3>
          <p className="text-sm text-gray-500 mb-4">Monthly comparison over the last 6 months</p>
          {loading ? (
            <div className="h-64 bg-[var(--border)]/20 animate-pulse rounded"></div>
          ) : (
            <div className="h-64 flex justify-end">
              <ResponsiveContainer width="100%" height={280} >
                <BarChart data={chartData.incomeExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="var(--foreground)" />
                  <YAxis stroke="var(--foreground)" />
                  <Tooltip
                    cursor={{ fill: "var(--background)" }}
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="income" name="Income" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Profit Trend */}
        <div className="rounded-lg border border-[var(--border)] p-6">
          <h3 className="text-lg font-bold mb-2">Profit Trend</h3>
          <p className="text-sm text-gray-500 mb-4">Monthly profit over the last 6 months</p>
          {loading ? (
            <div className="h-64 bg-[var(--border)]/20 animate-pulse rounded"></div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.profitTrendData}>
                  <CartesianGrid strokeDasharray="3 4" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: "#6b7280" }} />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Profit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-lg border border-[var(--border)] p-6">
        <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
        <p className="text-sm mb-4">Latest income and expense entries</p>
        <table className="min-w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="py-3 px-4 font-medium">Type</th>
              <th className="py-3 px-4 font-medium">Description</th>
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium">Amount</th>
              <th className="py-3 px-4 font-medium">Status</th>
            </tr>
          </thead>
          {loading ? (
            <TableSkeleton />
          ) : transactions.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={5} className="p-0">
                  <EmptyState 
                    icon={Download}
                    title="No transactions found"
                    subtitle="Add your first transaction to start tracking finances"
                  />
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="border-b border-[var(--border)]">
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full font-semibold text-xs ${t.transactionType === "income"
                        ? "bg-green-600/20 text-green-600"
                        : "bg-red-500/20 text-red-500"
                        }`}
                    >
                      {t.transactionType.charAt(0).toUpperCase() + t.transactionType.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">{t.description || "-"}</td>
                  <td className="py-3 px-4">
                    {new Date(t.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    ${t.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full bg-green-600/20 text-green-600 text-xs">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Add Transaction Dialog */}
      <GlobalDialog
        label="Add new transaction"
        open={openTransaction}
        onClose={() => {
          setOpenTransaction(false);
        }}
      >
        <CreateDialog
          transactionType={transactionType}
          onSuccess={() => {
            setOpenTransaction(false);
            fetchTransactions();
          }}
        />
      </GlobalDialog>
    </div>
  );
}

export default Finance;