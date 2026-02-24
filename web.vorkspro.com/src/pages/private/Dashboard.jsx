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

function Dashboard() {
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



  //   <div className="min-h-screen w-full pb-1">
  //     {/* Header */}
  //     <div className="flex justify-between items-center mb-8">
  //       <div>
  //         <h1 className="text-3xl text-[var(--foreground)] font-bold">
  //           Dashboard
  //         </h1>
  //         <p className="text-[var(--foreground)] mt-1">
  //           Welcome back! Here's what's happening today.
  //         </p>
  //       </div>
  //       {/* <div className="flex items-center gap-2 bg-gray-900/30 text-gray-900 border border-gray-400 px-4 py-2 rounded-sm">
  //         <Calendar size={18} />
  //         <span className="text-sm font-medium">October 15, 2025</span>
  //       </div> */}
  //     </div>

  //     {/* Stats Cards */}
  //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 dark:text-[var(--foreground)] dark:bg-[var(--background)]">
  //       <StatCard title="Total Employees" value={7} />

  //       <StatCard value={256} title="Total Employees" />
  //       <StatCard value={256} title="Total Employees" />
  //       <StatCard value={256} title="Total Employees" />

  //       {/* <div className="rounded-lg p-6 border border-[var(--border)]">
  //         <div className="flex items-center justify-between mb-4">
  //           <h3 className="text-sm font-medium">Total Employees</h3>
  //           <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
  //             <Users size={20} className="text-blue-600" />
  //           </div>
  //         </div>
  //         <p className="text-3xl font-bold mb-2">247</p>
  //         <p className="text-sm text-green-600 flex items-center gap-1">
  //           <TrendingUp size={16} /> +12 from last month
  //         </p>
  //       </div>

  //       <div className="rounded-lg p-6 border border-[var(--border)]">
  //         <div className="flex items-center justify-between mb-4">
  //           <h3 className="text-sm font-medium">Active Projects</h3>
  //           <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
  //             <Briefcase size={20} className="text-green-600" />
  //           </div>
  //         </div>
  //         <p className="text-3xl font-bold mb-2">34</p>
  //         <p className="text-sm text-green-600 flex items-center gap-1">
  //           <TrendingUp size={16} /> +5 from last month
  //         </p>
  //       </div>

  //       <div className="rounded-lg p-6 border border-[var(--border)]">
  //         <div className="flex items-center justify-between mb-4">
  //           <h3 className=" text-sm font-medium">Monthly Revenue</h3>
  //           <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
  //             <DollarSign size={20} className="text-purple-600" />
  //           </div>
  //         </div>
  //         <p className="text-3xl font-bold mb-2">$428K</p>
  //         <p className="text-sm text-green-600 flex items-center gap-1">
  //           <TrendingUp size={16} /> +18% from last month
  //         </p>
  //       </div>

  //       <div className="rounded-lg p-6 border border-[var(--border)]">
  //         <div className="flex items-center justify-between mb-4">
  //           <h3 className=" text-sm font-medium">Tasks Completed</h3>
  //           <div className="w-10 h-10 bg-[var(--button)] rounded-lg flex items-center justify-center">
  //             <CheckCircle size={20} className="text-orange-600" />
  //           </div>
  //         </div>
  //         <p className="text-3xl font-bold  mb-2">892</p>
  //         <p className="text-sm text-red-600 flex items-center gap-1">
  //           <TrendingDown size={16} /> -2% from last month
  //         </p>
  //       </div> */}
  //     </div>

  //     {/* Charts Row */}
  //     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 dark:bg-[var(--background) dark:text-[var(--foreground)]">
  //       {/* Revenue vs Expenses Chart */}
  //       <div className="lg:col-span-2 rounded-lg p-6 border border-[var(--border)] ">
  //         <h3 className="text-lg font-bold mb-1">Revenue vs Expenses</h3>
  //         <p className="text-sm  mb-6">Monthly financial overview</p>
  //         <ResponsiveContainer width="100%" height={300}>
  //           <BarChart data={revenueExpensesData}>
  //             <CartesianGrid
  //               strokeDasharray="3 3"
  //               stroke="hsl(var(--border))"
  //             />
  //             <XAxis
  //               dataKey="month"
  //               stroke="var(--foreground)"
  //               className="text-[var(--foreground)]"
  //             />
  //             <YAxis stroke="var(--foreground)" />

  //             <Tooltip
  //               cursor={{ fill: "var(--background)" }} // light highlight background on hover
  //               contentStyle={{
  //                 backgroundColor: "var(--background)",
  //                 border: "1px solid var(--border)",
  //                 borderRadius: "8px",
  //                 color: "hsl(var(--foreground))",
  //               }}
  //               labelStyle={{
  //                 fontWeight: "600",
  //                 color: "hsl(var(--foreground))",
  //               }}
  //               itemStyle={{
  //                 color: "hsl(var(--primary))",
  //               }}
  //               formatter={(value, name) => {
  //                 const color =
  //                   name === "Revenue"
  //                     ? "#60a5fa" // blue
  //                     : name === "Expenses"
  //                     ? "#f87171" // red
  //                     : "hsl(var(--foreground))";

  //                 return [
  //                   <span style={{ color, fontWeight: 600 }}>
  //                     {value.toLocaleString()}
  //                   </span>,
  //                   name.charAt(0).toUpperCase() + name.slice(1),
  //                 ];
  //               }}
  //             />

  //             <Legend />

  //             <Bar
  //               dataKey="Expenses"
  //               fill=" #f87171" // darker blue
  //               radius={[8, 8, 0, 0]}
  //             />
  //             <Bar
  //               dataKey="Revenue"
  //               fill="#60a5fa" // darker red
  //               radius={[8, 8, 0, 0]}
  //             />
  //           </BarChart>
  //         </ResponsiveContainer>
  //       </div>

  //       {/* Project Status Pie Chart */}
  //       <div className="rounded-lg p-6 border border-[var(--border)]">
  //         <h3 className="text-lg font-bold  mb-1">Project Status</h3>
  //         <p className="text-sm  mb-6">Distribution overview</p>
  //         <ResponsiveContainer width="100%" height={300}>
  //           <PieChart>
  //             <Pie
  //               data={projectStatusData}
  //               cx="50%"
  //               cy="50%"
  //               innerRadius={60}
  //               outerRadius={100}
  //               paddingAngle={2}
  //               dataKey="value"
  //               activeIndex={activeIndex}
  //               onMouseEnter={onPieEnter}
  //               onMouseLeave={onPieLeave}
  //               isAnimationActive
  //               animationDuration={400}
  //               style={{
  //                 cursor: "pointer",
  //                 transition: "all 0.3s ease-in-out",
  //               }}
  //               activeShape={(props) => {
  //                 const {
  //                   cx,
  //                   cy,
  //                   innerRadius,
  //                   outerRadius,
  //                   startAngle,
  //                   endAngle,
  //                   fill,
  //                   payload,
  //                 } = props;
  //                 return (
  //                   <g>
  //                     <Sector
  //                       cx={cx}
  //                       cy={cy}
  //                       innerRadius={innerRadius}
  //                       outerRadius={outerRadius + 2} // subtle hover grow
  //                       startAngle={startAngle}
  //                       endAngle={endAngle}
  //                       fill={fill}
  //                       style={{ transition: "all 0.3s ease-in-out" }}
  //                     />
  //                     <text
  //                       x={cx}
  //                       y={cy}
  //                       dy={8}
  //                       textAnchor="middle"
  //                       fill={fill}
  //                       className="text-sm font-medium"
  //                     >
  //                       {payload?.name}
  //                     </text>
  //                   </g>
  //                 );
  //               }}
  //             >
  //               {projectStatusData.map((entry, index) => (
  //                 <Cell key={`cell-${index}`} fill={entry.color} />
  //               ))}
  //             </Pie>

  //             <Tooltip
  //               contentStyle={{
  //                 backgroundColor: "var(--background)",
  //                 border: "1px solid var(--border)",
  //                 borderRadius: "8px",
  //                 color: "hsl(var(--foreground))",
  //               }}
  //               itemStyle={{ color: "hsl(var(--foreground))" }}
  //               formatter={(value, name, payload) => {
  //                 const label = typeof name === "string" ? name : payload?.name;
  //                 const color =
  //                   label === "Completed"
  //                     ? "#34d399"
  //                     : label === "In Progress"
  //                     ? "#60a5fa"
  //                     : payload?.payload?.color ?? "hsl(var(--foreground))";

  //                 return [
  //                   <span style={{ color, fontWeight: 600 }}>
  //                     {Number(value).toLocaleString()}
  //                   </span>,
  //                   typeof label === "string"
  //                     ? label.charAt(0).toUpperCase() + label.slice(1)
  //                     : label,
  //                 ];
  //               }}
  //             />
  //           </PieChart>
  //         </ResponsiveContainer>

  //         <div className="mt-4 space-y-2">
  //           {projectStatusData.map((item, idx) => (
  //             <div
  //               key={idx}
  //               className="flex items-center justify-between text-sm"
  //             >
  //               <div className="flex items-center gap-2">
  //                 <div
  //                   className="w-3 h-3 rounded-full"
  //                   style={{ backgroundColor: item.color }}
  //                 ></div>
  //                 <span className="">{item.name}</span>
  //               </div>
  //               <span className="font-semibold">{item.value}</span>
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     </div>

  //     {/* Activity & Deadlines Row */}
  //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 text-[var(--foreground)]">
  //       {/* Recent Activity */}
  //       <div className="rounded-lg p-6 border border-[var(--border)]">
  //         <h3 className="text-lg font-bold  mb-1">Recent Activity</h3>
  //         <p className="text-sm mb-6">Latest updates from your team</p>
  //         <div className="space-y-4">
  //           {recentActivities.map((activity) => (
  //             <div key={activity.id} className="flex items-start gap-3">
  //               <div
  //                 className={`w-2 h-2 rounded-full mt-2 ${activity.color}`}
  //               ></div>
  //               <div className="flex-1 min-w-0">
  //                 <p className="text-sm ">
  //                   <span className="font-semibold">{activity.name}</span>
  //                   <span className=""> {activity.action} </span>
  //                   <span className="">{activity.detail}</span>
  //                 </p>
  //                 <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       </div>

  //       {/* Upcoming Deadlines */}
  //       <div className="rounded-lg p-6 border border-[var(--border)]">
  //         <h3 className="text-lg font-bold  mb-1">Upcoming Deadlines</h3>
  //         <p className="text-sm  mb-6">Tasks requiring attention</p>
  //         <div className="space-y-3">
  //           {upcomingDeadlines.map((deadline) => (
  //             <div
  //               key={deadline.id}
  //               className="flex items-start justify-between pb-3 last:border-b-0"
  //             >
  //               <div className="flex-1">
  //                 <p className="text-sm font-semibold ">{deadline.task}</p>
  //                 <p className="text-xs ">{deadline.project}</p>
  //               </div>
  //               <div className="flex items-center gap-2">
  //                 <span
  //                   className={`text-xs px-2 py-1 rounded ${getPriorityColor(
  //                     deadline.priority
  //                   )}`}
  //                 >
  //                   {getPriorityLabel(deadline.priority)}
  //                 </span>
  //                 <span className="text-xs  whitespace-nowrap">
  //                   {deadline.days}
  //                 </span>
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     </div>

  //     {/* Quick Actions */}
  //     <div className=" rounded-lg p-6 border border-[var(--border)] text-[var(--foreground)] my-8">
  //       <h3 className="text-lg font-bold  mb-6">Quick Actions</h3>
  //       <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-6 lg:grid-cols-3 gap-4">
  //         {quickActions.map((action, idx) => (
  //           <Button
  //             key={idx}
  //             onClick={() => {
  //               (action.label === "Add Employee" &&
  //                 setOpenEmployeeDialog(true)) ||
  //                 (action.label === "Create Project" &&
  //                   setOpenCreateProjectDialog(true)) ||
  //                 (action.label === "Add Client" &&
  //                   setOpenClientDialog(true)) ||
  //                 (action.label === "Generate Report" &&
  //                   setOpenGenerateReportDialog(true)) ||
  //                 (action.label === "Create Invoice" &&
  //                   setOpenCreateInvoiceDialog(true)) ||
  //                 (action.label === "Add Announcement" &&
  //                   setOpenAnnouncementDialog(true));
  //             }}
  //             className={`
  //                        group
  //                   flex flex-col items-center justify-center gap-3
  //                  bg-[var(--background)]
  //                      border-button
  //                     rounded-xl border-2
  //                     transition-all duration-200
  //                     h-32
                        
                        
  //                   `}
  //           >
  //             <div
  //               className="
  //                    flex items-center justify-center w-12 h-12 rounded-full
  //                    bg-[var(--button)]/20 text-[var(--button)]
  //                    group-hover:bg-[var(--button)] group-hover:text-white
  //                    transition-colors duration-200 ease-in-out
  // "
  //             >
  //               {action.icon}
  //             </div>

  //             <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
  //               {action.label}
  //             </div>
  //           </Button>
  //         ))}
  //       </div>
  //     </div>

  //     <GlobalDialog
  //       open={openEmployeeDialog}
  //       onClose={() => setOpenEmployeeDialog(false)}
  //       label={"Add Employee"}
  //     >
  //       <EmployeeDialog></EmployeeDialog>
  //     </GlobalDialog>
  //     <GlobalDialog
  //       open={openCreateProjectDialog}
  //       onClose={() => setOpenCreateProjectDialog(false)}
  //       label={"Create Project"}
  //     >
  //       <ProjectDialog></ProjectDialog>
  //     </GlobalDialog>
  //     <GlobalDialog
  //       open={openClientDialog}
  //       onClose={() => setOpenClientDialog(false)}
  //       label={"Add Client"}
  //     >
  //       <ClientDialog></ClientDialog>
  //     </GlobalDialog>
  //     <GlobalDialog
  //       open={openGenerateReportDialog}
  //       onClose={() => setOpenGenerateReportDialog(false)}
  //       label={"Generate Report"}
  //     >
  //       <ReportDialog></ReportDialog>
  //     </GlobalDialog>
  //     <GlobalDialog
  //       open={openCreateInvoiceDialog}
  //       onClose={() => setOpenCreateInvoiceDialog(false)}
  //       label={"Create Invoice"}
  //     >
  //       <InvoiceDialog></InvoiceDialog>
  //     </GlobalDialog>
  //     <GlobalDialog
  //       open={openAnnouncementDialog}
  //       onClose={() => setOpenAnnouncementDialog(false)}
  //       label={"Add Announcement"}
  //     >
  //       <AnnouncementDialog></AnnouncementDialog>
  //     </GlobalDialog>
  //   </div>
  );
}

export default Dashboard;
