import React, { useState } from "react";
import { Calendar1, DollarSignIcon, Download, File, FolderPlus, User2, UserPlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Report() {

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


    // const [activeTab, setActiveTab] = useState("employee-performance");

    // const employeePerformance = [
    //   { name: "Sarah J.", value: 60 },
    //   { name: "Mike C.", value: 55 },
    //   { name: "Emma W.", value: 58 },
    //   { name: "John D.", value: 52 },
    //   { name: "Lisa A.", value: 50 },
    // ];

    // const COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6"];

    // const employeePerformanceData = [
    //   { name: "Week 1", tasks: 40, efficiency: 85 },
    //   { name: "Week 2", tasks: 45, efficiency: 88 },
    //   { name: "Week 3", tasks: 38, efficiency: 80 },
    //   { name: "Week 4", tasks: 50, efficiency: 90 },
    // ];

    // const departmentDistributionData = [
    //   { name: "Engineering", value: 35 },
    //   { name: "Marketing", value: 20 },
    //   { name: "Design", value: 15 },
    //   { name: "Sales", value: 18 },
    //   { name: "HR", value: 12 },
    // ];

    // const attendanceData = [
    //   { name: "Oct 15", present: 85, absent: 15 },
    //   { name: "Oct 16", present: 88, absent: 12 },
    //   { name: "Oct 17", present: 90, absent: 10 },
    //   { name: "Oct 18", present: 92, absent: 8 },
    //   { name: "Oct 19", present: 87, absent: 13 },
    //   { name: "Oct 20", present: 89, absent: 11 },
    //   { name: "Oct 21", present: 91, absent: 9 },
    //   { name: "Oct 22", present: 93, absent: 7 },
    // ];

    // const reports = [
    //   { name: "Attendance Report", icon: "📄" },
    //   { name: "Performance Review", icon: "📄" },
    //   { name: "Timesheet Summary", icon: "📄" },
    //   { name: "Leave Balance", icon: "📄" },
    //   { name: "Productivity Analysis", icon: "📄" },
    //   { name: "Salary Overview", icon: "📄" },
    // ];

    // return (
    //   <div className="min-h-screen w-full text-[var(--foreground)] pb-8">
    //     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
    //       {/* Left Section */}
    //       <div className="text-center sm:text-left">
    //         <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
    //           Reports & Analytics
    //         </h1>
    //         <p className="mt-1 text-sm sm:text-base text-[var(--muted-foreground)]">
    //           Comprehensive insights and data visualization
    //         </p>
    //       </div>

    //       {/* Right Section */}
    //       <div className="flex justify-center sm:justify-end w-full sm:w-auto">
    //         <Button className="bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base w-full sm:w-auto rounded-md">
    //           <span className="text-sm ">This Month</span>
    //           <Download size={16} className="ml-0.5" />
    //         </Button>
    //       </div>
    //     </div>

    //     <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    //       <div className="p-6 border border-[var(--border)] rounded-lg   transition-colors duration-300 ease-in-out">
    //         <h3 className="text-sm font-medium mb-2">Total Reports</h3>
    //         <p className="text-3xl font-bold text-[var(--foreground)]">156</p>
    //         <p className="text-sm">+5% this month</p>
    //       </div>
    //       <div className="p-6 border border-[var(--border)] rounded-lg   transition-colors duration-300 ease-in-out">
    //         <h3 className="text-sm font-medium mb-2">Active Insights</h3>
    //         <p className="text-3xl font-bold text-blue-600">42</p>
    //         <p className="text-sm">Actionable items</p>
    //       </div>
    //       <div className="p-6 border border-[var(--border)] rounded-lg   transition-colors duration-300 ease-in-out">
    //         <h3 className="text-sm font-medium mb-2">Productivity Score</h3>
    //         <p className="text-3xl font-bold text-green-600">88%</p>
    //         <p className="text-sm">+5% from last month</p>
    //       </div>
    //       <div className="p-6 border border-[var(--border)] rounded-lg   transition-colors duration-300 ease-in-out">
    //         <h3 className="text-sm font-medium mb-2">ROI</h3>
    //         <p className="text-3xl font-bold text-[var(--foreground)]">245%</p>
    //         <p className="text-sm">Return on investment</p>
    //       </div>
    //     </div>

    //     <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
    //       <TabsList className="hidden sm:flex mb-6 rounded-2xl bg-[var(--foreground)]/10">
    //         <TabsTrigger
    //           value="employee-performance"
    //           className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
    //         >
    //           Employee Performance
    //         </TabsTrigger>
    //         <TabsTrigger
    //           value="department-distribution"
    //           className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
    //         >
    //           Department Distribution
    //         </TabsTrigger>
    //         <TabsTrigger
    //           value="custom-reports"
    //           className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
    //         >
    //           Custom Reports
    //         </TabsTrigger>
    //         <TabsTrigger
    //           value="attendance-overview"
    //           className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
    //         >
    //           Attendance Overview
    //         </TabsTrigger>
    //       </TabsList>

    //       <div className="sm:hidden text-[var(--foreground)] mb-3">
    //         <Select value={activeTab} onValueChange={setActiveTab}>
    //           <SelectTrigger className="w-full border rounded-lg px-3 py-2 text-sm">
    //             <SelectValue placeholder="Select status" />
    //           </SelectTrigger>
    //           <SelectContent>
    //             <SelectItem value="employee-performance">
    //               Employee Performance
    //             </SelectItem>
    //             <SelectItem value="department-distribution">
    //               Department Distribution
    //             </SelectItem>
    //             <SelectItem value="custom-reports">Custom Reports</SelectItem>
    //             <SelectItem value="attendance-overview">
    //               Attendance Overview
    //             </SelectItem>
    //           </SelectContent>
    //         </Select>
    //       </div>

    //       {/* Employee Performance Tab */}
    //       <TabsContent
    //         value="employee-performance"
    //         className="transition-opacity duration-300 ease-in-out"
    //       >
    //         <div className="p-6 border border-[var(--border)] rounded-[var(--radius-md)]   transition-colors duration-300 ease-in-out">
    //           <h3 className="text-lg font-bold mb-4">Employee Performance</h3>
    //           <p className="text-sm mb-4">
    //             Tasks completed and efficiency ratings
    //           </p>
    //           <div className="h-64">
    //             <ResponsiveContainer width="100%" height="100%">
    //               <BarChart data={employeePerformanceData}>
    //                 <CartesianGrid
    //                   strokeDasharray="3 3"
    //                   stroke="hsl(var(--border))"
    //                 />
    //                 <XAxis dataKey="name" stroke="var(--foreground)" />
    //                 <YAxis stroke="var(--foreground)" />
    //                 <Tooltip
    //                   cursor={{ fill: "var(--background)" }}
    //                   contentStyle={{
    //                     backgroundColor: "var(--background)",
    //                     border: "1px solid var(--border)",
    //                     borderRadius: "8px",
    //                     color: "hsl(var(--foreground))",
    //                   }}
    //                   labelStyle={{
    //                     fontWeight: "600",
    //                     color: "hsl(var(--foreground))",
    //                   }}
    //                   itemStyle={{
    //                     color: "hsl(var(--primary))",
    //                   }}
    //                   formatter={(value, name) => {
    //                     const color =
    //                       name === "Tasks Completed"
    //                         ? "#3b82f6"
    //                         : name === "Efficiency (%)"
    //                         ? "#22c55e"
    //                         : "hsl(var(--foreground))";

    //                     return [
    //                       <span style={{ color, fontWeight: 600 }}>
    //                         {value.toLocaleString()}
    //                       </span>,
    //                       name.charAt(0).toUpperCase() + name.slice(1),
    //                     ];
    //                   }}
    //                 />
    //                 <Legend />

    //                 <Bar
    //                   dataKey="efficiency"
    //                   fill="#22c55e"
    //                   radius={[6, 6, 0, 0]}
    //                   name="Efficiency (%)"
    //                   activeBar={{ fill: "#4ade80" }}
    //                 />
    //                 <Bar
    //                   dataKey="tasks"
    //                   fill="#3b82f6"
    //                   radius={[6, 6, 0, 0]}
    //                   name="Tasks Completed"
    //                   activeBar={{ fill: "#60a5fa" }}
    //                 />
    //               </BarChart>
    //             </ResponsiveContainer>
    //           </div>
    //         </div>
    //       </TabsContent>

    //       {/* Department Distribution Tab */}
    //       <TabsContent
    //         value="department-distribution"
    //         className="transition-opacity duration-300 ease-in-out"
    //       >
    //         <div className="p-6 border border-[var(--border)] rounded-[var(--radius-md)]   transition-colors duration-300 ease-in-out">
    //           <h3 className="text-lg font-bold mb-4">Department Distribution</h3>
    //           <p className="text-sm mb-4">Employee count by department</p>
    //           <div className="h-64">
    //             <ResponsiveContainer width="100%" height="110%">
    //               <PieChart>
    //                 <Tooltip
    //                   contentStyle={{
    //                     backgroundColor: "var(--background)",
    //                     border: "1px solid var(--border)",
    //                     borderRadius: "8px",
    //                     color: "hsl(var(--foreground))",
    //                   }}
    //                   itemStyle={{
    //                     color: "hsl(var(--foreground))",
    //                   }}
    //                   formatter={(value, name, { payload }) => {
    //                     const label =
    //                       typeof name === "string" ? name : payload?.name;

    //                     const color =
    //                       label === "Engineering"
    //                         ? "#3b82f6"
    //                         : label === "Marketing"
    //                         ? "#22c55e"
    //                         : label === "Design"
    //                         ? "#eab308"
    //                         : label === "Sales"
    //                         ? "#ef4444"
    //                         : label === "HR"
    //                         ? "#8b5cf6"
    //                         : payload?.color ?? "hsl(var(--foreground))";

    //                     return [
    //                       <span style={{ fontWeight: 600, color }}>
    //                         {Number(value).toLocaleString()}
    //                       </span>,
    //                       label,
    //                     ];
    //                   }}
    //                 />
    //                 <Legend />

    //                 <Pie
    //                   data={departmentDistributionData}
    //                   dataKey="value"
    //                   nameKey="name"
    //                   cx="50%"
    //                   cy="50%"
    //                   outerRadius={100}
    //                   label
    //                 >
    //                   {departmentDistributionData.map((entry, index) => (
    //                     <Cell
    //                       key={`cell-${index}`}
    //                       fill={COLORS[index % COLORS.length]}
    //                     />
    //                   ))}
    //                 </Pie>
    //               </PieChart>
    //             </ResponsiveContainer>
    //           </div>
    //         </div>
    //       </TabsContent>

    //       {/* Custom Reports Tab */}
    //       <TabsContent
    //         value="custom-reports"
    //         className="transition-opacity duration-300 ease-in-out"
    //       >
    //         <div className="p-6 border border-[var(--border)] rounded-[var(--radius-md)]   transition-colors duration-300 ease-in-out">
    //           <h3 className="text-lg font-bold mb-4">
    //             Available Employee Reports
    //           </h3>
    //           <p className="text-sm mb-4">Generate detailed reports</p>
    //           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    //             {reports.map((report, idx) => (
    //               <div
    //                 key={idx}
    //                 className="flex items-center gap-2 p-4 border border-[var(--border)] rounded-lg transition-colors duration-300 ease-in-out"
    //               >
    //                 <span>{report.icon}</span>
    //                 <span className="font-medium">{report.name}</span>
    //                 <Button
    //                   size="sm"
    //                   className="ml-auto bg-[var(--button)] text-[var(--button-text)]"
    //                 >
    //                   Generate
    //                 </Button>
    //               </div>
    //             ))}
    //           </div>
    //         </div>
    //       </TabsContent>

    //       {/* Attendance Overview Tab */}
    //       <TabsContent
    //         value="attendance-overview"
    //         className="transition-opacity duration-300 ease-in-out"
    //       >
    //         <div className="p-6 border border-[var(--border)] rounded-[var(--radius-md)]   transition-colors duration-300 ease-in-out">
    //           <h3 className="text-lg font-bold mb-4">Attendance Overview</h3>
    //           <p className="text-sm mb-4">Attendance trends for the past week</p>
    //           <div className="h-64">
    //             <ResponsiveContainer width="100%" height="100%">
    //               <BarChart data={attendanceData}>
    //                 <CartesianGrid
    //                   strokeDasharray="3 3"
    //                   stroke="hsl(var(--border))"
    //                 />
    //                 <XAxis dataKey="name" stroke="var(--foreground)" />
    //                 <YAxis stroke="var(--foreground)" />
    //                 <Tooltip
    //                   cursor={{ fill: "var(--background)" }}
    //                   contentStyle={{
    //                     backgroundColor: "var(--background)",
    //                     border: "1px solid var(--border)",
    //                     borderRadius: "8px",
    //                     color: "hsl(var(--foreground))",
    //                   }}
    //                   labelStyle={{
    //                     fontWeight: "600",
    //                     color: "hsl(var(--foreground))",
    //                   }}
    //                   itemStyle={{ color: "hsl(var(--primary))" }}
    //                   formatter={(value, name) => {
    //                     const color =
    //                       name === "Present (%)"
    //                         ? "#22c55e"
    //                         : name === "Absent (%)"
    //                         ? "#ef4444"
    //                         : "hsl(var(--foreground))";

    //                     return [
    //                       <span style={{ color, fontWeight: 600 }}>
    //                         {value.toLocaleString()}
    //                       </span>,
    //                       name.charAt(0).toUpperCase() + name.slice(1),
    //                     ];
    //                   }}
    //                 />
    //                 <Legend />

    //                 <Bar
    //                   dataKey="absent"
    //                   fill="#ef4444"
    //                   radius={[6, 6, 0, 0]}
    //                   name="Absent (%)"
    //                   activeBar={{ fill: "#f87171" }}
    //                 />

    //                 <Bar
    //                   dataKey="present"
    //                   fill="#22c55e"
    //                   radius={[6, 6, 0, 0]}
    //                   name="Present (%)"
    //                   activeBar={{ fill: "#4ade80" }}
    //                 />
    //               </BarChart>
    //             </ResponsiveContainer>
    //           </div>
    //         </div>
    //       </TabsContent>
    //     </Tabs>
    //   </div>
  );
}

export default Report;
