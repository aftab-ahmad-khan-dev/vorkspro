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

function Performance() {
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

export default Performance;




// import React, { useState } from "react";
// import { Star, Target, Plus, Eye } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import GlobalDialog from "@/models/GlobalDialog";
// import ScheduleDialog from "@/models/performance/ScheduleDialog";
// import GoalDialog from "@/models/performance/GoalDialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useTabs } from "@/context/TabsContext";


// function Performance() {
//   const [activeTab, setActiveTab] = useState("overview");
//   const [showScheduleDialog, setShowScheduleDialog] = useState(false);
//   const [showGoalDialog, setShowGoalDialog] = useState(false);
//   const { actions } = useTabs()
//   const isSuperAdmin = actions?.length == 0 || actions == undefined

//   const hasPermissions = (action) => {
//     if (isSuperAdmin == true) return true;

//     // return actions?.includes(action);
//   }

//   const performanceStats = [
//     {
//       title: "Avg. Performance",
//       value: "91.2%",
//       subtitle: "Company average",
//       color: "text-blue-600",
//     },
//     {
//       title: "Active Goals",
//       value: "156",
//       subtitle: "Across all employees",
//       color: "text-[var(--foreground)]",
//     },
//     {
//       title: "Reviews Completed",
//       value: "89",
//       subtitle: "This quarter",
//       color: "text-green-600",
//     },
//     {
//       title: "Top Performers",
//       value: "42",
//       subtitle: "Above 90% score",
//       color: "text-purple-600",
//     },
//   ];

//   const employees = [
//     {
//       initials: "SJ",
//       name: "Sarah Johnson",
//       department: "Engineering",
//       score: 92,
//       goals: "8/10 goals",
//       rating: 4.6,
//       lastReview: "2025-09-15",
//     },
//     {
//       initials: "MC",
//       name: "Mike Chen",
//       department: "Design",
//       score: 88,
//       goals: "7/8 goals",
//       rating: 4.4,
//       lastReview: "2025-09-20",
//     },
//     {
//       initials: "EW",
//       name: "Emma Wilson",
//       department: "Engineering",
//       score: 95,
//       goals: "10/10 goals",
//       rating: 4.8,
//       lastReview: "2025-09-10",
//     },
//     {
//       initials: "JD",
//       name: "John Davis",
//       department: "Management",
//       score: 90,
//       goals: "9/10 goals",
//       rating: 4.5,
//       lastReview: "2025-09-18",
//     },
//   ];

//   const feedbacks = [
//     {
//       initials: "SJ",
//       name: "Sarah Johnson",
//       department: "Engineering",
//       score: 92,
//       goals: "8/10 goals",
//       rating: 4.6,
//       lastReview: "2025-09-15",
//     },
//     {
//       initials: "MC",
//       name: "Mike Chen",
//       department: "Design",
//       score: 88,
//       goals: "7/8 goals",
//       rating: 4.4,
//       lastReview: "2025-09-20",
//     },
//     {
//       initials: "EW",
//       name: "Emma Wilson",
//       department: "Engineering",
//       score: 95,
//       goals: "10/10 goals",
//       rating: 4.8,
//       lastReview: "2025-09-10",
//     },
//     {
//       initials: "JD",
//       name: "John Davis",
//       department: "Management",
//       score: 90,
//       goals: "9/10 goals",
//       rating: 4.5,
//       lastReview: "2025-09-18",
//     },
//   ];

//   return (
//     <div className="min-h-screen w-full text-[var(--foreground)] pb-8">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-8">
//         {/* Text Section */}
//         <div className="text-center sm:text-left">
//           <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
//             Performance Management
//           </h1>
//           <p className="text-sm sm:text-base text-[var(--muted-foreground)] mt-1">
//             Track goals, conduct reviews, and manage employee performance
//           </p>
//         </div>

//         {/* Actions Section */}
//         <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3">
//           {hasPermissions('Create Records') && (
//             <>
//               <Button
//                 onClick={() => setShowGoalDialog(true)}
//                 className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base"
//               >
//                 <Target size={18} />
//                 <span className="text-sm">Set Goals</span>
//               </Button>

//               <Button
//                 onClick={() => setShowScheduleDialog(true)}
//                 className="bg-black text-white hover:bg-gray-800 flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base"
//               >
//                 <Plus size={18} />
//                 <span className="text-sm">Schedule Review</span>
//               </Button>
//             </>
//           )}

//         </div>
//       </div>

//       {/* Top Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {performanceStats.map((item, idx) => (
//           <div
//             key={idx}
//             className="rounded-lg p-6 border border-[var(--border)]   transition-colors duration-300 ease-in-out"
//           >
//             <h3 className="text-sm font-medium mb-2">{item.title}</h3>
//             <p
//               className={`text-3xl font-bold ${item.color ?? "text-[var(--foreground)]"
//                 }`}
//             >
//               {item.value}
//             </p>
//             <p className="text-sm">{item.subtitle}</p>
//           </div>
//         ))}
//       </div>

//       {/* Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//         <TabsList className="sm:flex hidden mb-6 rounded-2xl bg-[var(--foreground)]/10">
//           <TabsTrigger
//             value="overview"
//             className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
//           >
//             Performance Overview
//           </TabsTrigger>
//           <TabsTrigger
//             value="goals"
//             className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
//           >
//             Goals & KPIs
//           </TabsTrigger>
//           <TabsTrigger
//             value="reviews"
//             className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
//           >
//             Reviews
//           </TabsTrigger>
//           <TabsTrigger
//             value="feedback"
//             className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
//           >
//             Peer Feedback
//           </TabsTrigger>
//         </TabsList>

//         <div className="sm:hidden text-[var(--foreground)] mb-3">
//           <Select value={activeTab} onValueChange={setActiveTab}>
//             <SelectTrigger className="w-full border rounded-lg px-3 py-2 text-sm">
//               <SelectValue placeholder="Select status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="overview"> Performance Overview</SelectItem>
//               <SelectItem value="goals">Goals & KPIs</SelectItem>
//               <SelectItem value="reviews">Reviews</SelectItem>
//               <SelectItem value="feedback">Peer Feedback</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Performance Overview Tab */}
//         <TabsContent
//           value="overview"
//           className="transition-opacity over duration-300 ease-in-out"
//         >
//           <div className="p-0 border border-[var(--border)] rounded-lg">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-[var(--border)]">
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Employee
//                     </th>
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Department
//                     </th>
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Overall Score
//                     </th>
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Goals Progress
//                     </th>
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Rating
//                     </th>
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Last Review
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
//                             className={`w-10 h-10 ${emp.color} rounded-full flex items-center justify-center bg-[var(--border)] font-semibold text-sm text-[var(--foreground)]`}
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
//                       <td className="px-6 py-4">
//                         <span className="px-2 py-1 rounded-full text-xs font-medium text-[var(--foreground)] bg-[var(--border)]">
//                           {emp.department}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-2">
//                           <div className="w-24 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
//                             <div
//                               className="h-full bg-green-500"
//                               style={{ width: `${emp.score}%` }}
//                             ></div>
//                           </div>
//                           <span
//                             className={`px-2 py-0.5 text-xs font-medium rounded-full ${emp.score >= 90
//                               ? "bg-green-600/20 text-green-600 dark:text-green-500"
//                               : emp.score >= 85
//                                 ? "bg-blue-600/20 text-blue-500"
//                                 : "bg-yellow-600/20 text-yellow-500"
//                               }`}
//                           >
//                             {emp.score}%
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-sm text-[var(--muted-foreground)]">
//                           {emp.goals}
//                         </p>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-1 text-yellow-500">
//                           <Star size={16} fill="currentColor" />{" "}
//                           <p className="text-sm text-[var(--muted-foreground)]">
//                             {emp.rating}
//                           </p>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-sm text-[var(--muted-foreground)]">
//                           {emp.lastReview}
//                         </p>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex gap-0 justify-center">
//                           {hasPermissions("View Records") && (
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
//                   No employees found.
//                 </p>
//                 <p className="text-[var(--muted-foreground)] mt-2">
//                   Try adjusting your search or filter to find matching
//                   employees.
//                 </p>
//               </div>
//             )}
//           </div>
//         </TabsContent>

//         {/* Goals & KPIs Tab */}
//         <TabsContent
//           value="goals"
//           className="transition-opacity duration-300 ease-in-out"
//         >
//           <div className="p-0 border border-[var(--border)] rounded-lg">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-[var(--border)]">
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Employee
//                     </th>
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Goal
//                     </th>
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Target Date
//                     </th>
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Progress
//                     </th>
//                     <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
//                       Priority
//                     </th>
//                     <th className="px-6 py-3 text-center text-sm font-medium text-[var(--card-foreground)]">
//                       Status
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
//                             className={`w-10 h-10 ${emp.color} rounded-full flex items-center justify-center bg-[var(--border)] font-semibold text-sm text-[var(--foreground)]`}
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
//                       <td className="px-6 py-4">
//                         <span className="px-2 py-1 rounded-full text-xs font-medium text-[var(--foreground)] bg-[var(--border)]">
//                           {emp.department}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-sm text-[var(--muted-foreground)]">
//                           {emp.goals}
//                         </p>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-sm text-[var(--muted-foreground)]">
//                           {emp.goals}
//                         </p>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-sm text-[var(--muted-foreground)]">
//                           {emp.goals}
//                         </p>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex gap-0 justify-center">
//                           {hasPermissions("View Records") && (
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
//                   No goals found.
//                 </p>
//                 <p className="text-[var(--muted-foreground)] mt-2">
//                   Try adjusting your search or filter to find matching goals.
//                 </p>
//               </div>
//             )}
//           </div>
//         </TabsContent>

//         {/* Reviews Tab */}
//         <TabsContent
//           value="reviews"
//           className="transition-opacity duration-300 ease-in-out"
//         >
//           <div className="p-6 border border-[var(--border)] rounded-[var(--radius-md)]   transition-colors duration-300 ease-in-out">
//             <h2 className="text-lg font-bold mb-1">Reviews</h2>
//             <p className="text-sm mb-4">Manage and view performance reviews</p>
//             <div className="space-y-4">
//               {employees.map((emp, idx) => (
//                 <div
//                   key={idx}
//                   className="flex items-center justify-between border p-3 rounded-lg border-[var(--border)] py-2"
//                 >
//                   <div>
//                     <p className="font-medium">{emp.name}</p>
//                     <p className="text-sm text-[var(--muted-foreground)]">
//                       Last Review: {emp.lastReview}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-medium">Rating: {emp.rating}</p>
//                     <span className="bg-green-600/20 text-green-600 dark:text-green-500 p-1 rounded-sm text-xs">
//                       Completed
//                     </span>
//                     {/* <Button size="sm" className="bg-[var(--button)] text-[var(--button-text)] hover:bg-[var(--mute-button)] mt-2">
//                       View Review
//                     </Button> */}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </TabsContent>

//         {/* Peer Feedback Tab */}
//         <TabsContent
//           value="feedback"
//           className="transition-opacity duration-300 ease-in-out"
//         >
//           <div className="p-6 border border-[var(--border)] rounded-[var(--radius-md)]   transition-colors duration-300 ease-in-out">
//             <h2 className="text-lg font-bold mb-1">Reviews</h2>
//             <p className="text-sm mb-4">Manage and view performance reviews</p>
//             <div className="space-y-4">
//               {feedbacks.map((emp, idx) => (
//                 <div
//                   key={idx}
//                   className="flex items-center justify-between border p-3 rounded-lg border-[var(--border)] py-2"
//                 >
//                   <div>
//                     <p className="font-medium">{emp.name}</p>
//                     <p className="text-sm text-[var(--muted-foreground)]">
//                       Last Review: {emp.lastReview}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-medium">Rating: {emp.rating}</p>
//                     <span className="border-button p-1 rounded-sm text-xs">
//                       Creativity
//                     </span>
//                     {/* <Button size="sm" className="bg-[var(--button)] text-[var(--button-text)] hover:bg-[var(--mute-button)] mt-2">
//                       View Review
//                     </Button> */}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </TabsContent>
//       </Tabs>

//       <GlobalDialog
//         open={showScheduleDialog}
//         label={"Schedule Performance Review"}
//         onClose={() => {
//           setShowScheduleDialog(false);
//         }}
//       >
//         <ScheduleDialog></ScheduleDialog>
//       </GlobalDialog>

//       <GlobalDialog
//         open={showGoalDialog}
//         label={"Set Performance Goal"}
//         onClose={() => {
//           setShowGoalDialog(false);
//         }}
//       >
//         <GoalDialog></GoalDialog>
//       </GlobalDialog>
//     </div>
//   );
// }

// export default Performance;
