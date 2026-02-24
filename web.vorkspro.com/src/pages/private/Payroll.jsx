import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import {
  Users,
  Briefcase,
  DollarSign,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calendar,
  User,
  User2,
  FolderPlus,
  UserPlus,
  UserPlus2,
  File,
  DollarSignIcon,
  Calendar1,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import GlobalDialog from "@/models/GlobalDialog";
import { EmployeeDialog } from "@/models/dashboard/EmployeeDialog";
import { ReportDialog } from "@/models/dashboard/ReportDialog";
import { ProjectDialog } from "@/models/dashboard/ProjectDialog";
import { ClientDialog } from "@/models/dashboard/ClientDialog";
import { AnnouncementDialog } from "@/models/dashboard/AnnouncementDialog";
import { InvoiceDialog } from "@/models/dashboard/InvoiceDialog";
import ToggleButton from "@/components/ToggleButton";
import StatCard from "@/components/Stats";

function Payroll() {
  // Sample data for charts
  const revenueExpensesData = [
    { month: "Jan", Revenue: 350, Expenses: 280 },
    { month: "Feb", Revenue: 380, Expenses: 290 },
    { month: "Mar", Revenue: 420, Expenses: 300 },
    { month: "Apr", Revenue: 380, Expenses: 290 },
    { month: "May", Revenue: 450, Expenses: 310 },
    { month: "Jun", Revenue: 400, Expenses: 300 },
  ];

  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [openCreateProjectDialog, setOpenCreateProjectDialog] = useState(false);
  const [openClientDialog, setOpenClientDialog] = useState(false);
  const [openGenerateReportDialog, setOpenGenerateReportDialog] =
    useState(false);
  const [openCreateInvoiceDialog, setOpenCreateInvoiceDialog] = useState(false);
  const [openAnnouncementDialog, setOpenAnnouncementDialog] = useState(false);

  const projectStatusData = [
    { name: "Completed", value: 18, color: "#34d399" }, // medium green
    { name: "In Progress", value: 12, color: "#60a5fa" }, // medium blue
    { name: "On Hold", value: 5, color: "#fbbf24" }, // medium amber
    { name: "Delayed", value: 1, color: "#f87171" }, // medium red
  ];

  const recentActivities = [
    {
      id: 1,
      name: "Sarah Johnson",
      action: "completed task",
      detail: '"API Integration"',
      time: "5 min ago",
      color: "bg-blue-500",
    },
    {
      id: 2,
      name: "Mike Chen",
      action: "submitted timesheet",
      detail: "for approval",
      time: "25 min ago",
      color: "bg-blue-500",
    },
    {
      id: 3,
      name: "Emma Wilson",
      action: "reported a bug",
      detail: "in Project Alpha",
      time: "1 hour ago",
      color: "bg-yellow-500",
    },
    {
      id: 4,
      name: "John Davis",
      action: "approved leave",
      detail: "request",
      time: "2 hours ago",
      color: "bg-green-500",
    },
    {
      id: 5,
      name: "Lisa Anderson",
      action: "added new client",
      detail: '"Tech Corp"',
      time: "5 hours ago",
      color: "bg-blue-500",
    },
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      task: "Payment Gateway Integration",
      project: "E-commerce Platform",
      priority: "high",
      days: "2 days",
    },
    {
      id: 2,
      task: "UI/UX Review",
      project: "Mobile App Redesign",
      priority: "medium",
      days: "4 days",
    },
    {
      id: 3,
      task: "Database Migration",
      project: "CRM System",
      priority: "high",
      days: "1 week",
    },
    {
      id: 4,
      task: "Content Upload",
      project: "Marketing Website",
      priority: "low",
      days: "10 days",
    },
  ];

  const quickActions = [
    { label: "Add Employee", icon: <User2 strokeWidth={2.5}></User2> }, // add actual icons
    {
      label: "Create Project",
      icon: <FolderPlus strokeWidth={2.5}></FolderPlus>,
    },
    { label: "Add Client", icon: <UserPlus2 strokeWidth={2.5}></UserPlus2> },
    { label: "Generate Report", icon: <File strokeWidth={2.5}></File> },
    {
      label: "Create Invoice",
      icon: <DollarSignIcon strokeWidth={2.5}></DollarSignIcon>,
    },
    {
      label: "Add Announcement",
      icon: <Calendar1 strokeWidth={2.5}></Calendar1>,
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-500";
      case "medium":
        return "bg-blue-600/20 text-blue-500";
      case "low":
        return "bg-gray-500/20 text-[var(--mute-button-text)]";
      default:
        return "bg-gray-400/20 text-[var(--mute-button-text)]";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return priority;
    }
  };

  const [activeIndex, setActiveIndex] = useState(null);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="relative isolate overflow-hidden">
      {/* Background (premium, subtle) */}
      <div className="absolute inset-0 -z-20 opacity-25
  bg-[radial-gradient(ellipse_at_top,var(--button),transparent_60%)]"
      />

      <div className="absolute inset-0 -z-30 " />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-[var(--button)]/50 to-transparent" />

      <div className="mx-auto flex min-h-[520px] max-w-5xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl text-center">
          {/* Status */}
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--button)]/25 bg-[var(--button)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--button)] shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--button)]/40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--button)]" />
              </span>
              Coming Soon
            </span>

            {/* Optional secondary chip */}
            <span className="hidden sm:inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--background)]/40 px-3 py-1 text-xs text-[var(--muted-foreground)] backdrop-blur">
              In active development
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-8 text-3xl sm:text-5xl font-semibold tracking-tight text-[var(--foreground)]">
            We’re Building This Experience
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">
            This module is currently being engineered and tested to meet our
            production standards—focused on <span className="text-[var(--foreground)]/90 font-medium">speed</span>,{" "}
            <span className="text-[var(--foreground)]/90 font-medium">security</span>, and{" "}
            <span className="text-[var(--foreground)]/90 font-medium">reliability</span>.
          </p>

          {/* Progress-style card (looks enterprise) */}
          <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--background)]/40 p-5 sm:p-6 backdrop-blur shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-left">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Release readiness
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Finalizing core flows • QA validation • UX polish
                </p>
              </div>

              <div className="flex items-center gap-2 justify-start sm:justify-end">
                <span className="text-xs text-[var(--muted-foreground)]">Status</span>
                <span className="inline-flex items-center rounded-full border border-[var(--button)]/25 bg-[var(--button)]/10 px-2.5 py-1 text-xs font-medium text-[var(--button)]">
                  Testing
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-[var(--foreground)]/10 overflow-hidden">
                <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-[var(--button)]/70 via-[var(--button)]/50 to-[var(--button)]/30" />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                <span>In progress</span>
                <span>62%</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 flex items-center justify-center">
            <div className="h-px w-40 bg-gradient-to-r from-transparent via-[var(--button)]/35 to-transparent" />
          </div>
          <p className="mt-5 text-xs text-[var(--muted-foreground)]">
            Thanks for your patience—this will ship as soon as it passes our quality gates.
          </p>
        </div>
      </div>
    </div>

  );
}

export default Payroll;






// import React, { useState } from "react";
// import { Plus, Download, TrendingUp, Eye } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useTabs } from "@/context/TabsContext";


// function Payroll() {
//   const [activeTab, setActiveTab] = useState("Employee Salaries");

//   const { actions } = useTabs();
//   const isSuperAdmin = actions?.length == 0 || actions == undefined;
//   const hasPermission = (action) => {
//     if (isSuperAdmin == true) return true;
//     console.log(actions)
//     return actions?.includes(action);
//   }

//   const payrollStats = [
//     {
//       title: "Total Payroll (Oct)",
//       value: "$1.92M",
//       subtitle: "+0.8% last month",
//       color: "text-green-600",
//     },
//     {
//       title: "Employees Paid",
//       value: "247",
//       subtitle: "All employees",
//       color: "text-[var(--foreground)]",
//     },
//     {
//       title: "Average Salary",
//       value: "$7,773",
//       subtitle: "Per employee",
//       color: "text-blue-600",
//     },
//     {
//       title: "Pending Payments",
//       value: "0",
//       subtitle: "All processed",
//       color: "text-green-600",
//     },
//   ];

//   const employees = [
//     {
//       initials: "SJ",
//       name: "Sarah Johnson",
//       position: "Senior Developer",
//       department: "Engineering",
//       baseSalary: "$8,500",
//       bonus: "+$500",
//       deductions: "-$850",
//       netSalary: "$8,150",
//       status: "Paid",
//     },
//     {
//       initials: "MC",
//       name: "Mike Chen",
//       position: "UI/UX Designer",
//       department: "Design",
//       baseSalary: "$7,000",
//       bonus: "+$300",
//       deductions: "-$700",
//       netSalary: "$6,600",
//       status: "paid",
//     },
//     {
//       initials: "EW",
//       name: "Emma Wilson",
//       position: "QA Engineer",
//       department: "Engineering",
//       baseSalary: "$6,500",
//       bonus: "+$400",
//       deductions: "-$650",
//       netSalary: "$6,250",
//       status: "paid",
//     },
//     {
//       initials: "JD",
//       name: "John Davis",
//       position: "Project Manager",
//       department: "Management",
//       baseSalary: "$9,000",
//       bonus: "+$700",
//       deductions: "-$900",
//       netSalary: "$8,800",
//       status: "paid",
//     },
//     {
//       initials: "LA",
//       name: "Lisa Anderson",
//       position: "Account Manager",
//       department: "Sales",
//       baseSalary: "$7,500",
//       bonus: "+$1200",
//       deductions: "-$750",
//       netSalary: "$7,950",
//       status: "paid",
//     },
//   ];

//   const paymentHistory = [
//     {
//       month: "May 2025",
//       totalPaid: "$1,845,000",
//       employees: 247,
//       avgSalary: "$7,469",
//       growth: null,
//     },
//     {
//       month: "Jun 2025",
//       totalPaid: "$1,856,000",
//       employees: 247,
//       avgSalary: "$7,515",
//       growth: "+0.6%",
//     },
//     {
//       month: "Jul 2025",
//       totalPaid: "$1,872,000",
//       employees: 247,
//       avgSalary: "$7,579",
//       growth: "+0.9%",
//     },
//     {
//       month: "Aug 2025",
//       totalPaid: "$1,890,000",
//       employees: 247,
//       avgSalary: "$7,652",
//       growth: "+1.0%",
//     },
//     {
//       month: "Sep 2025",
//       totalPaid: "$1,905,000",
//       employees: 247,
//       avgSalary: "$7,713",
//       growth: "+0.8%",
//     },
//     {
//       month: "Oct 2025",
//       totalPaid: "$1,920,000",
//       employees: 247,
//       avgSalary: "$7,773",
//       growth: "+0.8%",
//     },
//   ];

//   const chartData = [
//     { name: "May", value: 1845000 },
//     { name: "Jun", value: 1856000 },
//     { name: "Jul", value: 1872000 },
//     { name: "Aug", value: 1890000 },
//     { name: "Sep", value: 1905000 },
//     { name: "Oct", value: 1920000 },
//   ];

//   const salaryComponents = [
//     { name: "Base Salary", percentage: 87.5, amount: "$1,680,000" },
//     { name: "Bonuses", percentage: 7.6, amount: "$145,000" },
//     { name: "Overtime", percentage: 4.9, amount: "$95,000" },
//   ];

//   const departments = [
//     { name: "Engineering", employees: 95, total: "$840,000", avg: "$8,842" },
//     { name: "Design", employees: 42, total: "$294,000", avg: "$7,000" },
//     { name: "Management", employees: 28, total: "$252,000", avg: "$9,000" },
//     { name: "Sales", employees: 35, total: "$315,000", avg: "$9,000" },
//     { name: "HR", employees: 18, total: "$162,000", avg: "$9,000" },
//   ];

//   return (
//     <div className="min-h-screen w-full pb-8">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-8">
//         {/* Left Section */}
//         <div className="text-center sm:text-left">
//           <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
//             Payroll Management
//           </h1>
//           <p className="text-sm sm:text-base text-[var(--foreground)] mt-1">
//             Manage employee salaries and payment processing
//           </p>
//         </div>

//         {/* Right Section */}
//         <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3">
//           {hasPermission('Export Data') && (
//             <Button className="border-button flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base">
//               <Download size={18} />
//               <span className="text-sm">Export Payroll</span>
//             </Button>
//           )}

//           {hasPermission('Create Records') && (
//             <Button className="bg-black text-white hover:bg-gray-800 flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base">
//               <Plus size={18} />
//               <span className="text-sm">Process Payroll</span>
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Top Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {payrollStats.map((item, idx) => (
//           <div
//             key={idx}
//             className=" rounded-lg p-6 border border-[var(--border)]"
//           >
//             <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">
//               {item.title}
//             </h3>
//             <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
//             <p className="text-sm text-[var(--foreground)] mt-1">
//               {item.subtitle}
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//         <TabsList className="sm:flex hidden mb-6 rounded-2xl bg-[var(--foreground)]/10">
//           <TabsTrigger
//             value="Employee Salaries"
//             className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
//           >
//             Employee Salaries
//           </TabsTrigger>
//           <TabsTrigger
//             value="Salary Breakdown"
//             className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
//           >
//             Salary Breakdown
//           </TabsTrigger>
//           <TabsTrigger
//             value="Payment History"
//             className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
//           >
//             Payment History
//           </TabsTrigger>
//           <TabsTrigger
//             value="Upcoming Payments"
//             className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
//           >
//             Upcoming Payments
//           </TabsTrigger>
//         </TabsList>

//         <div className="sm:hidden text-[var(--foreground)] mb-3">
//           <Select value={activeTab} onValueChange={setActiveTab}>
//             <SelectTrigger className="w-full border rounded-lg px-3 py-2 text-sm">
//               <SelectValue placeholder="Select status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="Employee Salaries">Employee Salaries</SelectItem>
//               <SelectItem value="Salary Breakdown">Salary Breakdown</SelectItem>
//               <SelectItem value="Payment History">Payment History</SelectItem>
//               <SelectItem value="Upcoming Payments">Upcoming Payments</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Employee Salaries Tab */}
//         <TabsContent value="Employee Salaries">
//           <div className="p-0 border border-[var(--border)] rounded-lg">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-[var(--border)]">
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Employee
//                     </th>
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Position
//                     </th>
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Base Salary
//                     </th>
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Bonus
//                     </th>
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Deductions
//                     </th>
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Net Salary
//                     </th>
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-center text-sm font-medium text-[var(--card-foreground)]">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {employees.map((emp, idx) => (
//                     <tr
//                       key={idx}
//                       className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--border)] transition-all duration-300"
//                     >
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <div
//                             className={`w-10 h-10 ${emp.color} rounded-full flex items-center justify-center font-semibold bg-[var(--border)] text-sm text-[var(--foreground)]`}
//                           >
//                             {emp.initials}
//                           </div>
//                           <div>
//                             <p className="font-semibold text-sm text-[var(--card-foreground)]">
//                               {emp.name}
//                             </p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
//                         {emp.position}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
//                         {emp.baseSalary}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-green-600 font-medium">
//                         {emp.bonus}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-red-600 font-medium">
//                         {emp.deductions}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-[var(--muted-foreground)] font-medium">
//                         {emp.netSalary}
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-600 dark:text-green-500">
//                           {emp.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex gap-0 justify-center">
//                           {hasPermission('View Records') && (
//                             <Button
//                               className="text-[var(--button)] bg-transparent hover:bg-[var(--button)]/30 dark:hover:bg-[var(--button)]/20"
//                               size="sm"
//                             >
//                               <Eye size={16} />
//                             </Button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             {employees.length === 0 && (
//               <div className="px-6 py-12 text-center">
//                 <p className="text-[var(--muted-foreground)] text-lg">
//                   No employee salary details found.
//                 </p>
//                 <p className="text-[var(--muted-foreground)] mt-2">
//                   Try adjusting your search or filter to find employee salary
//                   details.
//                 </p>
//               </div>
//             )}
//           </div>
//         </TabsContent>

//         {/* Salary Breakdown Tab */}
//         <TabsContent value="Salary Breakdown">
//           <div className="grid grid-cols-2 gap-6">
//             {/* Salary Components */}
//             <div className=" p-6 border border-[var(--border)] rounded-lg">
//               <h2 className="text-lg font-bold mb-2 text-[var(--foreground)]">
//                 Salary Components
//               </h2>
//               <p className="text-sm text-[var(--foreground)] mb-6">
//                 Breakdown of total payroll
//               </p>

//               <div className="space-y-6">
//                 {salaryComponents.map((component, idx) => (
//                   <div key={idx}>
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-sm font-medium text-[var(--foreground)]">
//                         {component.name}
//                       </span>
//                       <div className="text-right">
//                         <span className="text-sm font-semibold text-[var(--foreground)]">
//                           {component.percentage}%
//                         </span>
//                         <span className="text-sm text-[var(--foreground)] ml-2">
//                           {component.amount}
//                         </span>
//                       </div>
//                     </div>
//                     <div className="w-full rounded-full h-2">
//                       <div
//                         className="bg-blue-600 h-2 rounded-full"
//                         style={{ width: `${component.percentage}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 ))}

//                 <div className="pt-4 border-t border-[var(--border)]">
//                   <div className="flex justify-between items-center">
//                     <span className="text-base font-semibold text-[var(--foreground)]">
//                       Total Payroll
//                     </span>
//                     <span className="text-2xl font-bold text-green-600">
//                       $1,920,000
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Department-wise Distribution */}
//             <div className=" p-6 border border-[var(--border)] rounded-lg">
//               <h2 className="text-lg font-bold mb-2 text-[var(--foreground)]">
//                 Department-wise Distribution
//               </h2>
//               <p className="text-sm text-[var(--foreground)] mb-6">
//                 Salary allocation by department
//               </p>

//               <div className="space-y-4">
//                 {departments.map((dept, idx) => (
//                   <div
//                     key={idx}
//                     className="pb-4 border-b border-[var(--border)] last:border-0"
//                   >
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <h3 className="font-semibold text-[var(--foreground)]">
//                           {dept.name}
//                         </h3>
//                         <p className="text-sm text-[var(--foreground)]">
//                           {dept.employees} employees
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-bold text-[var(--foreground)]">
//                           {dept.total}
//                         </p>
//                         <p className="text-sm text-[var(--foreground)]">
//                           {dept.avg} avg
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </TabsContent>

//         {/* Payment History Tab */}
//         <TabsContent value="Payment History">
//           <div className="p-6 border border-[var(--border)] rounded-lg">
//             <h2 className="text-lg font-bold mb-2 text-[var(--foreground)]">
//               Payment History
//             </h2>
//             <p className="text-sm text-[var(--foreground)] mb-6">
//               Monthly payroll trends
//             </p>

//             {/* Chart */}
//             <div className="h-80 mb-8">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={chartData}>
//                   <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" />
//                   <XAxis
//                     dataKey="name"
//                     axisLine={false}
//                     tickLine={false}
//                     style={{ fontSize: "12px", fill: "#6b7280" }}
//                   />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     style={{ fontSize: "12px", fill: "#6b7280" }}
//                     tickFormatter={(value) =>
//                       `${(value / 1000000).toFixed(1)}M`
//                     }
//                   />
//                   <Tooltip
//                     cursor={{ fill: "var(--border)" }}
//                     formatter={(value) => `$${value.toLocaleString()}`}
//                     contentStyle={{
//                       borderRadius: "8px",
//                       border: "1px solid #e5e7eb",
//                       background: "var(--background)",
//                       color: "var(--foreground)",
//                     }}
//                   />
//                   <Bar
//                     dataKey="value"
//                     fill="#10b981"
//                     radius={[4, 4, 0, 0]}
//                     isAnimationActive={true}
//                     animationDuration={300}
//                     onMouseEnter={(data, index) => {
//                       const bars =
//                         document.querySelectorAll(".recharts-bar-rect");
//                       if (bars[index]) {
//                         bars[index].style.transition =
//                           "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), filter 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
//                         bars[index].style.transform = "scale(1.1)";
//                         bars[index].style.filter = "brightness(1.2)";
//                       }
//                     }}
//                     onMouseLeave={(data, index) => {
//                       const bars =
//                         document.querySelectorAll(".recharts-bar-rect");
//                       if (bars[index]) {
//                         bars[index].style.transition =
//                           "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), filter 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
//                         bars[index].style.transform = "scale(1)";
//                         bars[index].style.filter = "brightness(1)";
//                       }
//                     }}
//                   />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto">
//               <table className="min-w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-[var(--border)]">
//                     <th className="py-3 px-4 text-left font-semibold text-[var(--foreground)]">
//                       Month
//                     </th>
//                     <th className="py-3 px-4 text-left font-semibold text-[var(--foreground)]">
//                       Total Paid
//                     </th>
//                     <th className="py-3 px-4 text-left font-semibold text-[var(--foreground)]">
//                       Employees
//                     </th>
//                     <th className="py-3 px-4 text-left font-semibold text-[var(--foreground)]">
//                       Avg. Salary
//                     </th>
//                     <th className="py-3 px-4 text-left font-semibold text-[var(--foreground)]">
//                       Growth
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paymentHistory.map((record, idx) => (
//                     <tr
//                       key={idx}
//                       className="border-b border-[var(--border)] hover"
//                     >
//                       <td className="py-4 px-4 font-medium text-[var(--foreground)]">
//                         {record.month}
//                       </td>
//                       <td className="py-4 px-4 text-[var(--foreground)]">
//                         {record.totalPaid}
//                       </td>
//                       <td className="py-4 px-4 text-[var(--foreground)]">
//                         {record.employees}
//                       </td>
//                       <td className="py-4 px-4 text-[var(--foreground)]">
//                         {record.avgSalary}
//                       </td>
//                       <td className="py-4 px-4">
//                         {record.growth ? (
//                           <span className="flex items-center gap-1 text-green-600 font-medium">
//                             <TrendingUp className="w-4 h-4" />
//                             {record.growth}
//                           </span>
//                         ) : (
//                           <span className="text-gray-400">-</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </TabsContent>

//         {/* Upcoming Payments Tab */}
//         <TabsContent value="Upcoming Payments">
//           <div className=" p-6 border border-[var(--border)] rounded-lg">
//             <h2 className="text-lg font-bold mb-2 text-[var(--foreground)] ">
//               Upcoming Payments
//             </h2>
//             <p className="text-sm text-[var(--foreground)] mb-6">
//               Scheduled salary disbursements for next month
//             </p>

//             {/* Summary Card */}
//             <div className="bg-blue-50 dark:bg-blue-600/10 border border-blue-200 rounded-lg p-6 mb-6">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <p className="text-sm font-medium text-[var(--foreground)]">
//                     Next Payroll Processing
//                   </p>
//                   <p className="text-[var(--foreground)] text-sm mt-1">
//                     November 1, 2025
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm font-medium text-[var(--foreground)]">
//                     Estimated Total
//                   </p>
//                   <p className="text-3xl font-bold text-blue-600">$1.92M</p>
//                 </div>
//               </div>
//             </div>

//             {/* Employee List */}
//             <div className="space-y-3 mb-6">
//               {employees.map((emp, idx) => (
//                 <div
//                   key={idx}
//                   className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg hover"
//                 >
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold bg-[var(--border)] text-sm text-[var(--foreground)]">
//                       {emp.initials}
//                     </div>
//                     <div>
//                       <h3 className="font-semibold text-[var(--foreground)]">
//                         {emp.name}
//                       </h3>
//                       <p className="text-sm text-[var(--foreground)]">
//                         {emp.department} • {emp.position}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-6">
//                     <div className="text-right">
//                       <p className="font-bold text-[var(--foreground)]">
//                         {emp.netSalary}
//                       </p>
//                       <p className="text-sm text-[var(--foreground)]">
//                         Nov 1, 2025
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-2 text-[var(--foreground)]">
//                       <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
//                         <div className="w-2 h-2 rounded-full bg-gray-400"></div>
//                       </div>
//                       <span className="text-sm font-medium">Scheduled</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Process Button */}
//             {hasPermission('Create Records') && (
//               <div className="flex justify-center">
//                 <Button>Process All Payments</Button>
//               </div>
//             )}
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

// export default Payroll;
