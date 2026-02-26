// src/App.jsx
import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Layout from "./layout/Layout";
import Login from "./pages/public/Login";
import Dashboard from "./pages/private/Dashboard";
import Employee from "./pages/private/Employee";
import Attendee from "./pages/private/Attendee";
import TimeSheet from "./pages/private/TimeSheet";
import Performance from "./pages/private/Performance";
import Payroll from "./pages/private/Payroll";
import Project from "./pages/private/Project";
import Task from "./pages/private/Task";
import Client from "./pages/private/Client";
import Finance from "./pages/private/Finance";
import HRManagement from "./pages/private/HRManagement";
import Report from "./pages/private/Report";
import Knowledge from "./pages/private/Knowledge";
import Announcement from "./pages/private/Announcement";
import Settings from "./pages/private/Settings";
import Profile from "./pages/private/Profile";
import Category from "./pages/private/Category";
import EmployeeDetail from "./pages/private/EmployeeDetail";
import { ForwardGuard } from "./guards/ForwardGuard";
import { RouteGuard } from "./guards/RouteGuard";
import NotFound from "./pages/public/NotFound";
import Landing from "./pages/public/Landing";
import LiveDemo from "./pages/public/LiveDemo";
import DemoAdmin from "./pages/public/DemoAdmin";
import AdminAssets from "./pages/private/Admin&Assets";
import FollowHub from "./pages/private/FollowUpHub";
import ToDoList from "./pages/private/MyToDoList";
import ClientDetail from "./pages/private/ClientDetail";
import ProjectDetail from "./pages/private/ProjectDetail";
import MilestoneDetail from "./pages/private/MilestoneDetail";
import { ProjectDetailProvider } from "./context/ProjectDetailContext";
import KeysAndCredentials from "./pages/private/Keys&Credentials";
import { AuthGuard } from "./guards/AuthGuard";
import Blockages from "./pages/private/Blockages";

function App() {
  const token = localStorage.getItem("token");






  return (
    <Routes>
      {/* Landing (public) */}
      <Route path="/" element={<Landing />} />
      <Route path="/demo" element={<LiveDemo />} />
      <Route path="/demo/admin" element={<DemoAdmin />} />

      <Route
        path="/login"
        element={
          <ForwardGuard>
            <Login />
          </ForwardGuard>
        }
      />

      {/* Protected App (portal) */}
      <Route
        path="/app"
        element={
          <AuthGuard>
            <RouteGuard>
              <Layout />
            </RouteGuard>
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />

        {/* Single dashboard for all roles (including admin-created). Uses tabs/role for title/summary and modules. */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admin-dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="hr-dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="project-manager-dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="finance-manager-dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="employee-dashboard" element={<Navigate to="/app/dashboard" replace />} />

        {/* Employee Management */}
        <Route path="employees" element={<Employee />} />
        <Route path="employees/employee-detail/:id" element={<EmployeeDetail />} />

        <Route path="attendance" element={<Attendee />} />
        <Route path="timesheets" element={<TimeSheet />} />

        <Route path="performance" element={<Performance />} />

        <Route path="payroll" element={<Payroll />} />

        {/* Project Management */}
        <Route path="projects" element={<Project />} />
        <Route path="projects/credentials" element={<KeysAndCredentials />} />
        <Route path="credentials" element={<Navigate to="/app/projects/credentials" replace />} />
        <Route path="blockages" element={<Blockages />} />
        <Route
          path="projects/project-detail/:id"
          element={
            <ProjectDetailProvider>
              <ProjectDetail />
            </ProjectDetailProvider>
          }
        />

        <Route path="milestones" element={<Task />} />
        <Route path="milestones/milestone-detail/:id" element={<MilestoneDetail />} />

        {/* Clients */}
        <Route path="client-management" element={<Client />} />
        <Route path="clients/client-detail/:id" element={<ClientDetail />} />

        {/* Finance */}
        <Route path="finance" element={<Finance />} />

        {/* HR Management */}
        <Route path="hr-management" element={<HRManagement />} />

        {/* Reports */}
        <Route path="reports" element={<Report />} />

        {/* Follow-up Hub */}
        <Route path="follow-up-hub" element={<FollowHub />} />

        {/* My To-Do Hub */}
        <Route path="my-todo-list" element={<ToDoList />} />

        {/* Admin & Assets */}
        <Route path="admin-&-assets" element={<AdminAssets />} />

        {/* Knowledge Base */}
        <Route path="knowledge-base" element={<Knowledge />} />

        {/* Announcements */}
        <Route path="announcements" element={<Announcement />} />

        {/* Categories */}
        <Route path="categories" element={<Category />} />

        {/* Always Accessible Routes */}
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;











// src/App.jsx
// import { Route, Routes, Navigate } from "react-router-dom";
// import "./App.css";
// import Layout from "./layout/Layout";
// import Login from "./pages/public/Login";
// import Dashboard from "./pages/private/Dashboard";
// import Employee from "./pages/private/Employee";
// import Attendee from "./pages/private/Attendee";
// import TimeSheet from "./pages/private/TimeSheet";
// import Performance from "./pages/private/Performance";
// import Payroll from "./pages/private/Payroll";
// import Project from "./pages/private/Project";
// import Task from "./pages/private/Task";
// import Client from "./pages/private/Client";
// import Finance from "./pages/private/Finance";
// import HRManagement from "./pages/private/HRManagement";
// import Report from "./pages/private/Report";
// import Knowledge from "./pages/private/Knowledge";
// import Announcement from "./pages/private/Announcement";
// import Settings from "./pages/private/Settings";
// import Profile from "./pages/private/Profile";
// import Category from "./pages/private/Category";
// import EmployeeDetail from "./pages/private/EmployeeDetail";
// import { AuthGuard } from "./guards/authGuard";
// import { ForwardGuard } from "./guards/ForwardGuard";
// import NotFound from "./pages/public/NotFound";
// import AdminAssets from "./pages/private/Admin&Assets";
// import FollowHub from "./pages/private/FollowUpHub";
// import ToDoList from "./pages/private/MyToDoList";
// import ClientDetail from "./pages/private/ClientDetail";
// import ProjectDetail from "./pages/private/ProjectDetail";
// import MilestoneDetail from "./pages/private/MilestoneDetail";
// import { ProjectDetailProvider } from "./context/ProjectDetailContext";
// import { useTabs } from "./context/TabsContext";
// import Blockages from "./pages/private/blockages";
// import { useEffect } from "react";
// import { apiPost } from "./interceptor/interceptor";
// import KeysAndCredentials from "./pages/private/Keys&Credentials";

// function App() {
//   const { tabs } = useTabs();
//   const token = localStorage.getItem("token");
//   useEffect(() => {
//     if (!token) return;

//     window.OneSignalDeferred = window.OneSignalDeferred || [];
//     window.OneSignalDeferred.push(async (OneSignal) => {
//       try {
//         await OneSignal.init({
//           appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
//           allowLocalhostAsSecureOrigin: true,
//         });

//         console.log("OneSignal initialized successfully");
        
//         // Add notification event listener
//         OneSignal.Notifications.addEventListener('click', (event) => {
//           console.log('OneSignal notification clicked:', event);
//         });
        
//         OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
//           console.log('OneSignal notification received:', event);
//         });

//         const permission = await OneSignal.Notifications.permission;
//         console.log("Permission:", permission);

//         if (permission !== "granted") {
//           await OneSignal.Notifications.requestPermission();
//         }

//         const userId = await OneSignal.User.PushSubscription.id;
//         console.log("OneSignal User ID:", userId);

//         if (userId) {
//           const saved = localStorage.getItem("oneSignalPlayerId");
//           if (saved !== userId) {
//             await apiPost("user/save-player-id", { playerId: userId });
//             localStorage.setItem("oneSignalPlayerId", userId);
//           }
//         }
//       } catch (error) {
//         console.error("OneSignal initialization error:", error);
//       }
//     });
//   }, [token]);




//   // === PERMISSION LOGIC (Same as Sidebar) ===
//   const userRole = tabs?.role || tabs; // Handle both tabs.role and direct tabs (adjust based on your context)

//   const isSuperAdmin = tabs?.isSuperAdmin ?? false;

//   // Extract module names where user has at least one action
//   const allowedModuleNames = isSuperAdmin
//     ? [
//       "Dashboard",
//       "Employees",
//       "Attendance",
//       "Performance",
//       "Payroll",
//       "Projects",
//       "Milestones",
//       "Client Management",
//       "Follow-up-Hub",
//       "Finance",
//       "HR Management",
//       "Reports & Analytics",
//       "Admin & Assets",
//       "Knowledge Base",
//       "Announcements",
//       "Categories",
//       "My To-Do Hub",
//     ]
//     : (userRole?.modulePermissions || [])
//       .filter((perm) => Array.isArray(perm.actions) && perm.actions.length > 0)
//       .map((perm) => perm.module);

//   // Helper: Check permission for a module
//   const hasModuleAccess = (moduleName) => {
//     return isSuperAdmin || allowedModuleNames.includes(moduleName);
//   };

//   // Reusable Protected Route for Modules
//   const ProtectedModuleRoute = ({ module, children }) => {
//     if (!hasModuleAccess(module)) {
//       return <Navigate to="/settings" replace />;
//     }
//     return children;
//   };

//   return (
//     <Routes>
//       {/* Public Routes */}
//       <Route path="*" element={<NotFound />} />
//       <Route
//         path="/login"
//         element={
//           <ForwardGuard>
//             <Login />
//           </ForwardGuard>
//         }
//       />

//       {/* Protected Layout */}
//       <Route
//         path="/"
//         element={
//           <AuthGuard>
//             <Layout />
//           </AuthGuard>
//         }
//       >
//         {/* Default Redirect */}
//         <Route index element={<Navigate to="/dashboard" replace />} />

//         {/* Dashboard */}
//         <Route
//           path="dashboard"
//           element={
//             <ProtectedModuleRoute module="Dashboard">
//               <Dashboard />
//             </ProtectedModuleRoute>
//           }
//         />

//         {/* Employee Management */}
//         <Route
//           path="employees"
//           element={
//             <ProtectedModuleRoute module="Employees">
//               <Employee />
//             </ProtectedModuleRoute>
//           }
//         />
//         <Route
//           path="employees/employee-detail/:id"
//           element={
//             <ProtectedModuleRoute module="Employees">
//               <EmployeeDetail />
//             </ProtectedModuleRoute>
//           }
//         />

//         <Route
//           path="attendance"
//           element={
//             <ProtectedModuleRoute module="Attendance">
//               <Attendee />
//             </ProtectedModuleRoute>
//           }
//         />
//         <Route
//           path="timesheets"
//           element={
//             <ProtectedModuleRoute module="Attendance">
//               <TimeSheet />
//             </ProtectedModuleRoute>
//           }
//         />

//         <Route
//           path="performance"
//           element={
//             <ProtectedModuleRoute module="Performance">
//               <Performance />
//             </ProtectedModuleRoute>
//           }
//         />

//         <Route
//           path="payroll"
//           element={
//             <ProtectedModuleRoute module="Payroll">
//               <Payroll />
//             </ProtectedModuleRoute>
//           }
//         />

//         {/* Project Management */}
//         <Route
//           path="projects"
//           element={
//             <ProtectedModuleRoute module="Projects">
//               <Project />
//             </ProtectedModuleRoute>
//           }
//         />
//         <Route
//           path="credentials"
//           element={
//             <ProtectedModuleRoute module="Keys & Credentials">
//               <KeysAndCredentials />
//             </ProtectedModuleRoute>
//           }
//         />
//         <Route
//           path="blockages"
//           element={
//             <ProtectedModuleRoute module="Blockages">
//               < Blockages />
//             </ProtectedModuleRoute>
//           }
//         />
//         <Route
//           path="projects/project-detail/:id"
//           element={
//             <ProtectedModuleRoute module="Projects">
//               <ProjectDetailProvider>
//                 <ProjectDetail />
//               </ProjectDetailProvider>
//             </ProtectedModuleRoute>
//           }
//         />

//         <Route
//           path="milestones"
//           element={
//             <ProtectedModuleRoute module="Milestones">
//               <Task />
//             </ProtectedModuleRoute>
//           }
//         />
//         <Route
//           path="milestones/milestone-detail/:id"
//           element={
//             <ProtectedModuleRoute module="Milestones">
//               <MilestoneDetail />
//             </ProtectedModuleRoute>
//           }
//         />

//         {/* Clients */}
//         <Route
//           path="client-management"
//           element={
//             <ProtectedModuleRoute module="Client Management">
//               <Client />
//             </ProtectedModuleRoute>
//           }
//         />
//         <Route
//           path="clients/client-detail/:id"
//           element={
//             <ProtectedModuleRoute module="Client Management">
//               <ClientDetail />
//             </ProtectedModuleRoute>
//           }
//         />

//         {/* Finance */}
//         <Route
//           path="finance"
//           element={
//             <ProtectedModuleRoute module="Finance">
//               <Finance />
//             </ProtectedModuleRoute>
//           }
//         />

//         {/* HR Management */}
//         <Route
//           path="hr-management"
//           element={
//             <ProtectedModuleRoute module="HR Management">
//               <HRManagement />
//             </ProtectedModuleRoute>
//           }
//         />

//         {/* Reports */}
//         <Route
//           path="reports"
//           element={
//             <ProtectedModuleRoute module="Reports & Analytics">
//               <Report />
//             </ProtectedModuleRoute>
//           }
//         />

//         {/* Follow-up Hub */}
//         <Route
//           path="follow-up-hub"
//           element={
//             <ProtectedModuleRoute module="Follow-up-Hub">
//               <FollowHub />
//             </ProtectedModuleRoute>
//           }
//         />

//         {/* My To-Do Hub */}
//         <Route
//           path="my-todo-list"
//           element={
//             <ProtectedModuleRoute module="My To-Do Hub">
//               <ToDoList />
//             </ProtectedModuleRoute>
//           }
//         />

//         {/* Admin & Assets */}
//         <Route
//           path="admin-&-assets"
//           element={
//             <ProtectedModuleRoute module="Admin & Assets">
//               <AdminAssets />
//             </ProtectedModuleRoute>
//           }
//         />

//         {/* Knowledge Base */}
//         <Route
//           path="knowledge-base"
//           element={
//             <ProtectedModuleRoute module="Knowledge Base">
//               <Knowledge />
//             </ProtectedModuleRoute>
//           }
//         />

//         {/* Announcements */}
//         <Route
//           path="announcements"
//           element={
//             <ProtectedModuleRoute module="Announcements">
//               <Announcement />
//             </ProtectedModuleRoute>
//           }
//         />

//         {/* Categories */}
//         <Route
//           path="categories"
//           element={
//             <ProtectedModuleRoute module="Categories">
//               <Category />
//             </ProtectedModuleRoute>
//           }
//         />

//         {/* Always Accessible Routes */}
//         <Route path="settings" element={<Settings />} />
//         <Route path="profile" element={<Profile />} />
//       </Route>
//     </Routes>
//   );
// }

// export default App;