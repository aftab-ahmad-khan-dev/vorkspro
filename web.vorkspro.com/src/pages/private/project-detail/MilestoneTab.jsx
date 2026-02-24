// // src/components/project/tabs/MilestonesTab.jsx

// import { Flag, Calendar } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import GlobalDialog from "@/models/GlobalDialog";
// import AddMilestoneDialog from "@/models/task/AddMilestoneDialog";
// import { useState, useMemo, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
// import { toast } from "sonner";
// import { useProjectDetail } from "@/context/ProjectDetailContext";
// import { jwtDecode } from "jwt-decode";
// import { useTabs } from "@/context/TabsContext";

// const STATUS_COLUMNS = {
//   "not started": {
//     title: "Not Started",
//     color: "gray",
//     bg: "bg-gray-500/20",
//     border: "border-gray-300",
//   },
//   "in progress": {
//     title: "In Progress",
//     color: "blue",
//     bg: "bg-blue-500/20",
//     border: "border-blue-400",
//   },
//   completed: {
//     title: "Completed",
//     color: "green",
//     bg: "bg-green-500/20",
//     border: "border-green-500",
//   },
//   delayed: {
//     title: "Delayed",
//     color: "red",
//     bg: "bg-red-500/20",
//     border: "border-red-500",
//   },
// };

// // Key for localStorage (unique per project)
// const getLocalStorageKey = (projectId) => `milestone-statuses-${projectId}`;

// export default function MilestonesTab({ project, refresh }) {
//   const [open, setOpen] = useState(false);
//   const navigate = useNavigate();
//   const baseUrl = import.meta.env.VITE_APP_BASE_URL;
//   const token = localStorage.getItem("token");
//   const { timeline, setTimeline } = useProjectDetail()
//   const decodedToken = jwtDecode(token)
//   const [milestones, setMilestones] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const { actions } = useTabs();
//   const isSuperAdmin = actions?.isSuperAdmin ?? false;

//   const hasPermission = (moduleName, requiredAction) => {
//     if (isSuperAdmin) return true;

//     return actions?.modulePermissions?.some(
//       (modules) => {
//         const currentModule = modules.module == moduleName
//         if (currentModule == true) {
//           return modules.actions.includes(requiredAction)
//         }
//       }
//     );
//   };

//   // Load from localStorage + merge with server data
//   useEffect(() => {
//     if (!project?._id || !project.milestones) return;

//     const localKey = getLocalStorageKey(project._id);
//     const savedStatuses = JSON.parse(localStorage.getItem(localKey) || "{}");

//     const merged = project.milestones.map((m) => ({
//       ...m,
//       status: savedStatuses[m._id] || m.status || "not started",
//     }));

//     setMilestones(merged);
//   }, [project.milestones, project._id]);

//   // Save to localStorage whenever milestones change
//   useEffect(() => {
//     if (!project?._id || milestones.length === 0) return;

//     const localKey = getLocalStorageKey(project._id);
//     const statusMap = {};

//     milestones.forEach((m) => {
//       statusMap[m._id] = m.status;
//     });

//     localStorage.setItem(localKey, JSON.stringify(statusMap));
//   }, [milestones, project._id]);

//   // Grouped by status
//   const milestonesByStatus = useMemo(() => {
//     const grouped = {
//       "not started": [],
//       "in progress": [],
//       completed: [],
//       delayed: [],
//     };

//     milestones.forEach((m) => {
//       const status = m.status || "not started";
//       if (grouped[status]) grouped[status].push(m);
//     });

//     return grouped;
//   }, [milestones]);

//   // Drag handler with localStorage persistence
//   const handleDragEnd = async (result) => {
//     if (!result.destination) return;

//     const { source, destination, draggableId } = result;
//     if (source.droppableId === destination.droppableId) return;

//     const newStatus = destination.droppableId;

//     // Optimistic UI + Save to localStorage immediately
//     setMilestones((prev) => {
//       const updated = prev.map((m) =>
//         m._id === draggableId ? { ...m, status: newStatus } : m
//       );

//       // Save to localStorage right away
//       const statusMap = {};
//       updated.forEach((m) => {
//         statusMap[m._id] = m.status;
//       });
//       localStorage.setItem(
//         getLocalStorageKey(project._id),
//         JSON.stringify(statusMap)
//       );

//       return updated;
//     });

//     try {
//       const response = await fetch(
//         `${baseUrl}milestone/change-status/${draggableId}`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ status: newStatus }),
//         }
//       );

//       const data = await response.json();
//       if (!data?.isSuccess) throw new Error(data?.message || "Failed");

//       toast.success("Status updated");
//       setTimeline((prev) => [
//         {
//           project: project._id,
//           date: new Date(),
//           user: "you",
//           employee: "you",
//           time: new Date().toLocaleTimeString(),
//           key: "Milestone status changed",
//           value: newStatus,
//           milestone: draggableId,
//         },
//         ...prev
//       ]);

//     } catch (error) {
//       // Revert UI + localStorage
//       setMilestones((prev) => {
//         const reverted = prev.map((m) =>
//           m._id === draggableId ? { ...m, status: source.droppableId } : m
//         );

//         const statusMap = {};
//         reverted.forEach((m) => {
//           statusMap[m._id] = m.status;
//         });
//         localStorage.setItem(
//           getLocalStorageKey(project._id),
//           JSON.stringify(statusMap)
//         );

//         return reverted;
//       });

//       toast.error("Failed to save status — reverted");
//     }
//   };

//   const MilestoneCard = ({ milestone, index }) => (
//     <Draggable draggableId={milestone._id} index={index}>
//       {(provided, snapshot) => (
//         <div
//           ref={provided.innerRef}
//           {...provided.draggableProps}
//           {...provided.dragHandleProps}
//           onClick={() =>
//             navigate(`/milestones/milestone-detail/${milestone._id}`)
//           }
//           className={`
//             p-4 rounded-xl border border-[var(--border)] shadow-sm transition-all cursor-pointer bg-border/20 mb-3
//             hover:shadow-md hover:border-gray-300
//             ${snapshot.isDragging ? "shadow-2xl scale-[1.02]  rotate-1" : ""}
//           `}
//         >
//           <h4 className="font-semibold text-foreground text-base">
//             {milestone.name}
//           </h4>

//           {milestone.endDate && (
//             <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
//               <Calendar className="w-4 h-4" />
//               Due: {new Date(milestone.endDate).toLocaleDateString()}
//             </div>
//           )}

//           {milestone.budget != null && (
//             <p className="text-sm font-medium mt-3 text-emerald-600">
//               ${milestone.budget.toLocaleString()}
//             </p>
//           )}
//         </div>
//       )}
//     </Draggable>
//   );

//   async function fetchProjects() {
//     try {
//       const response = await fetch(`${baseUrl}project/get-all`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })

//       const data = await response.json();
//       if (data?.isSuccess) setProjects(data?.filteredData.projects || []);
//     } catch (error) {
//       console.log(error)
//     }
//   }

//   useEffect(() => {
//     fetchProjects();
//   }, [])

//   return (
//     <>
//       <div className="p-8 border border-[var(--border)] rounded-2xl">
//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
//           <div className="flex items-start md:items-center gap-4">
//             <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
//               <Flag className="w-6 h-6 text-orange-600" />
//             </div>
//             <div>
//               <h3 className="text-2xl font-bold text-foreground">
//                 Project Milestones
//               </h3>
//               <p className="text-muted-foreground text-sm">
//                 Drag to update status • Changes saved instantly
//               </p>
//             </div>
//           </div>

//           {
//             milestones.length > 0 && (
//               <Button className={`${!hasPermission('Projects', 'Create Records') ? 'hidden' : ''}`} onClick={() => setOpen(true)}>
//                 <Flag className="w-4 h-4 mr-2" />
//                 Add Milestone
//               </Button>
//             )
//           }
//         </div>

//         {milestones.length > 0 ? (
//           <DragDropContext onDragEnd={handleDragEnd}>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//               {Object.entries(STATUS_COLUMNS).map(([statusKey, column]) => (
//                 <div key={statusKey} className="flex flex-col">
//                   <div
//                     className={`
//                       px-4 py-3 text-foreground rounded-t-xl border-b-2 font-semibold text-sm
//                       ${column.bg} ${column.border}
//                     `}
//                   >
//                     {column.title}{" "}
//                     <span className="text-foreground">
//                       ({milestonesByStatus[statusKey].length})
//                     </span>
//                   </div>

//                   <Droppable droppableId={statusKey}>
//                     {(provided, snapshot) => (
//                       <div
//                         ref={provided.innerRef}
//                         {...provided.droppableProps}
//                         className={`
//                           min-h-[350px] p-4 rounded-b-xl border border-dashed border-transparent
//                           transition-all bg-border/40
//                           ${snapshot.isDraggingOver ? " ring-2 ring-border" : ""}
//                         `}
//                       >
//                         {milestonesByStatus[statusKey].map((milestone, index) => (
//                           <MilestoneCard
//                             key={milestone._id}
//                             milestone={milestone}
//                             index={index}
//                           />
//                         ))}
//                         {provided.placeholder}
//                       </div>
//                     )}
//                   </Droppable>
//                 </div>
//               ))}
//             </div>
//           </DragDropContext>
//         ) : (
//           <div className="text-center py-24">
//             <div className="w-20 h-20 bg-border rounded-xl flex items-center justify-center mx-auto mb-6">
//               <Flag className="w-10 h-10 text-foreground" />
//             </div>
//             <h4 className="text-xl font-semibold text-foreground">
//               No Milestones Added
//             </h4>
//             <p className="text-muted-foreground mt-2">
//               Create milestones to track project progress
//             </p>
//             {
//               hasPermission('Projects', 'Create Records') && (
//                 <Button className="mt-6" onClick={() => setOpen(true)}>
//                   + Add First Milestone
//                 </Button>
//               )
//             }
//           </div>
//         )}
//       </div>

//       <GlobalDialog open={open} label="Add Milestone" onClose={() => setOpen(false)}>
//         <AddMilestoneDialog
//           selectedProjectId={project._id}
//           projects={projects}
//           onSuccess={() => {
//             refresh();
//             setOpen(false);
//           }}
//           onClose={() => setOpen(false)}
//         />
//       </GlobalDialog>
//     </>
//   );
// }





// src/components/project/tabs/MilestonesTab.jsx
// import { Flag, Calendar, Check } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import GlobalDialog from "@/models/GlobalDialog";
// import AddMilestoneDialog from "@/models/task/AddMilestoneDialog";
// import { useState, useMemo, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
// import { toast } from "sonner";
// import { useProjectDetail } from "@/context/ProjectDetailContext";
// import { jwtDecode } from "jwt-decode";
// import { useTabs } from "@/context/TabsContext";

// const STATUS_COLUMNS = {
//   "not started": {
//     title: "Not Started",
//     color: "gray",
//     bg: "bg-gray-500/20",
//     border: "border-gray-300",
//   },
//   "in progress": {
//     title: "In Progress",
//     color: "blue",
//     bg: "bg-blue-500/20",
//     border: "border-blue-400",
//   },
//   completed: {
//     title: "Completed",
//     color: "green",
//     bg: "bg-green-500/20",
//     border: "border-green-500",
//   },
//   delayed: {
//     title: "Delayed",
//     color: "red",
//     bg: "bg-red-500/20",
//     border: "border-red-500",
//   },
// };

// // Key for localStorage (unique per project)
// const getLocalStorageKey = (projectId) => `milestone-statuses-${projectId}`;

// export default function MilestonesTab({ project, refresh }) {
//   const [open, setOpen] = useState(false);
//   const navigate = useNavigate();
//   const baseUrl = import.meta.env.VITE_APP_BASE_URL;
//   const token = localStorage.getItem("token");
//   const { timeline, setTimeline } = useProjectDetail();
//   const decodedToken = jwtDecode(token);
//   const [milestones, setMilestones] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const { actions } = useTabs();
//   const isSuperAdmin = actions?.isSuperAdmin ?? false;

//   const hasPermission = (moduleName, requiredAction) => {
//     if (isSuperAdmin) return true;
//     return actions?.modulePermissions?.some((modules) => {
//       const currentModule = modules.module == moduleName;
//       if (currentModule == true) {
//         return modules.actions.includes(requiredAction);
//       }
//     });
//   };

//   // Load from localStorage + merge with server data
//   useEffect(() => {
//     if (!project?._id || !project.milestones) return;
//     const localKey = getLocalStorageKey(project._id);
//     const savedStatuses = JSON.parse(localStorage.getItem(localKey) || "{}");
//     const merged = project.milestones.map((m) => ({
//       ...m,
//       status: savedStatuses[m._id] || m.status || "not started",
//     }));
//     setMilestones(merged);
//   }, [project.milestones, project._id]);

//   // Save to localStorage whenever milestones change
//   useEffect(() => {
//     if (!project?._id || milestones.length === 0) return;
//     const localKey = getLocalStorageKey(project._id);
//     const statusMap = {};
//     milestones.forEach((m) => {
//       statusMap[m._id] = m.status;
//     });
//     localStorage.setItem(localKey, JSON.stringify(statusMap));
//   }, [milestones, project._id]);

//   // Grouped by status
//   const milestonesByStatus = useMemo(() => {
//     const grouped = {
//       "not started": [],
//       "in progress": [],
//       completed: [],
//       delayed: [],
//     };
//     milestones.forEach((m) => {
//       const status = m.status || "not started";
//       if (grouped[status]) grouped[status].push(m);
//     });
//     return grouped;
//   }, [milestones]);

//   // Sorted milestones for timeline
//   const sortedMilestones = useMemo(() => {
//     return [...milestones].sort((a, b) => {
//       const dateA = a.endDate ? new Date(a.endDate) : new Date(0);
//       const dateB = b.endDate ? new Date(b.endDate) : new Date(0);
//       return dateA - dateB;
//     });
//   }, [milestones]);

//   // Drag handler with localStorage persistence
//   const handleDragEnd = async (result) => {
//     if (!result.destination) return;
//     const { source, destination, draggableId } = result;
//     if (source.droppableId === destination.droppableId) return;
//     const newStatus = destination.droppableId;

//     // Optimistic UI + Save to localStorage immediately
//     setMilestones((prev) => {
//       const updated = prev.map((m) =>
//         m._id === draggableId ? { ...m, status: newStatus } : m
//       );
//       // Save to localStorage right away
//       const statusMap = {};
//       updated.forEach((m) => {
//         statusMap[m._id] = m.status;
//       });
//       localStorage.setItem(
//         getLocalStorageKey(project._id),
//         JSON.stringify(statusMap)
//       );
//       return updated;
//     });

//     try {
//       const response = await fetch(
//         `${baseUrl}milestone/change-status/${draggableId}`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ status: newStatus }),
//         }
//       );
//       const data = await response.json();
//       if (!data?.isSuccess) throw new Error(data?.message || "Failed");
//       toast.success("Status updated");
//       setTimeline((prev) => [
//         {
//           project: project._id,
//           date: new Date(),
//           user: "you",
//           employee: "you",
//           time: new Date().toLocaleTimeString(),
//           key: "Milestone status changed",
//           value: newStatus,
//           milestone: draggableId,
//         },
//         ...prev,
//       ]);
//     } catch (error) {
//       // Revert UI + localStorage
//       setMilestones((prev) => {
//         const reverted = prev.map((m) =>
//           m._id === draggableId ? { ...m, status: source.droppableId } : m
//         );
//         const statusMap = {};
//         reverted.forEach((m) => {
//           statusMap[m._id] = m.status;
//         });
//         localStorage.setItem(
//           getLocalStorageKey(project._id),
//           JSON.stringify(statusMap)
//         );
//         return reverted;
//       });
//       toast.error("Failed to save status — reverted");
//     }
//   };

//   const MilestoneCard = ({ milestone, index }) => (
//     <Draggable draggableId={milestone._id} index={index}>
//       {(provided, snapshot) => (
//         <div
//           ref={provided.innerRef}
//           {...provided.draggableProps}
//           {...provided.dragHandleProps}
//           onClick={() => navigate(`/milestones/milestone-detail/${milestone._id}`)}
//           className={`p-4 rounded-xl border border-[var(--border)] shadow-sm transition-all cursor-pointer bg-border/20 mb-3 hover:shadow-md hover:border-gray-300 ${
//             snapshot.isDragging ? "shadow-2xl scale-[1.02] rotate-1" : ""
//           }`}
//         >
//           <h4 className="font-semibold text-foreground text-base">
//             {milestone.name}
//           </h4>
//           {milestone.endDate && (
//             <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
//               <Calendar className="w-4 h-4" />
//               Due: {new Date(milestone.endDate).toLocaleDateString()}
//             </div>
//           )}
//           {milestone.budget != null && (
//             <p className="text-sm font-medium mt-3 text-emerald-600">
//               ${milestone.budget.toLocaleString()}
//             </p>
//           )}
//         </div>
//       )}
//     </Draggable>
//   );

//   const TimelineItem = ({ milestone, index }) => {
//     const isCompleted = milestone.status === "completed";
//     const isLeft = index % 2 === 0;
//     const year = milestone.endDate
//       ? new Date(milestone.endDate).getFullYear()
//       : "N/A";

//     return (
//       <div className={`relative flex ${isLeft ? "justify-start" : "justify-end"} mb-8`}>
//         <div className={`w-1/2 ${isLeft ? "pr-8 text-right" : "pl-8 text-left"}`}>
//           {isLeft && (
//             <div className="font-bold text-lg text-foreground">{year}</div>
//           )}
//           <div
//             className="p-4 rounded-xl border border-[var(--border)] shadow-sm bg-border/20 cursor-pointer hover:shadow-md hover:border-gray-300"
//             onClick={() => navigate(`/milestones/milestone-detail/${milestone._id}`)}
//           >
//             <h4 className="font-semibold text-foreground text-base">
//               {milestone.name}
//             </h4>
//             {milestone.endDate && (
//               <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
//                 <Calendar className="w-4 h-4" />
//                 Due: {new Date(milestone.endDate).toLocaleDateString()}
//               </div>
//             )}
//             {milestone.budget != null && (
//               <p className="text-sm font-medium mt-3 text-emerald-600">
//                 ${milestone.budget.toLocaleString()}
//               </p>
//             )}
//           </div>
//           {!isLeft && (
//             <div className="font-bold text-lg text-foreground">{year}</div>
//           )}
//         </div>
//         <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
//           <div
//             className={`w-8 h-8 rounded-full flex items-center justify-center ${
//               isCompleted ? "bg-blue-500" : "bg-gray-300"
//             }`}
//           >
//             {isCompleted && <Check className="w-5 h-5 text-white" />}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   async function fetchProjects() {
//     try {
//       const response = await fetch(`${baseUrl}project/get-all`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await response.json();
//       if (data?.isSuccess) setProjects(data?.filteredData.projects || []);
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   return (
//     <>
//       <div className="p-8 border border-[var(--border)] rounded-2xl">
//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
//           <div className="flex items-start md:items-center gap-4">
//             <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
//               <Flag className="w-6 h-6 text-orange-600" />
//             </div>
//             <div>
//               <h3 className="text-2xl font-bold text-foreground">
//                 Project Milestones
//               </h3>
//               <p className="text-muted-foreground text-sm">
//                 Drag to update status • Changes saved instantly
//               </p>
//             </div>
//           </div>
//           {milestones.length > 0 && (
//             <Button
//               className={`${!hasPermission("Projects", "Create Records") ? "hidden" : ""}`}
//               onClick={() => setOpen(true)}
//             >
//               <Flag className="w-4 h-4 mr-2" /> Add Milestone
//             </Button>
//           )}
//         </div>

//         <Tabs defaultValue="kanban" className="w-full">
//           <TabsList className="mb-6">
//             <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
//             <TabsTrigger value="timeline">Timeline</TabsTrigger>
//           </TabsList>
//           <TabsContent value="kanban">
//             {milestones.length > 0 ? (
//               <DragDropContext onDragEnd={handleDragEnd}>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//                   {Object.entries(STATUS_COLUMNS).map(
//                     ([statusKey, column]) => (
//                       <div key={statusKey} className="flex flex-col">
//                         <div
//                           className={`px-4 py-3 text-foreground rounded-t-xl border-b-2 font-semibold text-sm ${column.bg} ${column.border}`}
//                         >
//                           {column.title}{" "}
//                           <span className="text-foreground">
//                             ({milestonesByStatus[statusKey].length})
//                           </span>
//                         </div>
//                         <Droppable droppableId={statusKey}>
//                           {(provided, snapshot) => (
//                             <div
//                               ref={provided.innerRef}
//                               {...provided.droppableProps}
//                               className={`min-h-[350px] p-4 rounded-b-xl border border-dashed border-transparent transition-all bg-border/40 ${
//                                 snapshot.isDraggingOver ? " ring-2 ring-border" : ""
//                               }`}
//                             >
//                               {milestonesByStatus[statusKey].map(
//                                 (milestone, index) => (
//                                   <MilestoneCard
//                                     key={milestone._id}
//                                     milestone={milestone}
//                                     index={index}
//                                   />
//                                 )
//                               )}
//                               {provided.placeholder}
//                             </div>
//                           )}
//                         </Droppable>
//                       </div>
//                     )
//                   )}
//                 </div>
//               </DragDropContext>
//             ) : (
//               <div className="text-center py-24">
//                 <div className="w-20 h-20 bg-border rounded-xl flex items-center justify-center mx-auto mb-6">
//                   <Flag className="w-10 h-10 text-foreground" />
//                 </div>
//                 <h4 className="text-xl font-semibold text-foreground">
//                   No Milestones Added
//                 </h4>
//                 <p className="text-muted-foreground mt-2">
//                   Create milestones to track project progress
//                 </p>
//                 {hasPermission("Projects", "Create Records") && (
//                   <Button className="mt-6" onClick={() => setOpen(true)}>
//                     + Add First Milestone
//                   </Button>
//                 )}
//               </div>
//             )}
//           </TabsContent>
//           <TabsContent value="timeline">
//             {milestones.length > 0 ? (
//               <div className="relative">
//                 <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-300 h-full"></div>
//                 {sortedMilestones.map((milestone, index) => (
//                   <TimelineItem
//                     key={milestone._id}
//                     milestone={milestone}
//                     index={index}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-24">
//                 <div className="w-20 h-20 bg-border rounded-xl flex items-center justify-center mx-auto mb-6">
//                   <Flag className="w-10 h-10 text-foreground" />
//                 </div>
//                 <h4 className="text-xl font-semibold text-foreground">
//                   No Milestones Added
//                 </h4>
//                 <p className="text-muted-foreground mt-2">
//                   Create milestones to track project progress
//                 </p>
//                 {hasPermission("Projects", "Create Records") && (
//                   <Button className="mt-6" onClick={() => setOpen(true)}>
//                     + Add First Milestone
//                   </Button>
//                 )}
//               </div>
//             )}
//           </TabsContent>
//         </Tabs>
//       </div>
//       <GlobalDialog open={open} label="Add Milestone" onClose={() => setOpen(false)}>
//         <AddMilestoneDialog
//           selectedProjectId={project._id}
//           projects={projects}
//           onSuccess={() => {
//             refresh();
//             setOpen(false);
//           }}
//           onClose={() => setOpen(false)}
//         />
//       </GlobalDialog>
//     </>
//   );
// }
















import { Flag, Calendar, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlobalDialog from "@/models/GlobalDialog";
import AddMilestoneDialog from "@/models/task/AddMilestoneDialog";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useProjectDetail } from "@/context/ProjectDetailContext";
import { jwtDecode } from "jwt-decode";
import { useTabs } from "@/context/TabsContext";
import EmptyState from "@/components/EmptyState";

const STATUS_COLUMNS = {
  "not started": {
    title: "Not Started",
    color: "gray",
    bg: "bg-gray-500/20",
    border: "border-gray-300",
  },
  "in progress": {
    title: "In Progress",
    color: "blue",
    bg: "bg-blue-500/20",
    border: "border-blue-400",
  },
  completed: {
    title: "Completed",
    color: "green",
    bg: "bg-green-500/20",
    border: "border-green-500",
  },
  delayed: {
    title: "Delayed",
    color: "red",
    bg: "bg-red-500/20",
    border: "border-red-500",
  },
};

// Key for localStorage (unique per project)
const getLocalStorageKey = (projectId) => `milestone-statuses-${projectId}`;

export default function MilestonesTab({ project, refresh, onMilestonesUpdate }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  const token = localStorage.getItem("token");
  const { timeline, setTimeline } = useProjectDetail();
  const decodedToken = jwtDecode(token);
  const [milestones, setMilestones] = useState([]);
  const [projects, setProjects] = useState([]);
  const [milestoneCount, setMilestoneCount] = useState(0);
  const { actions } = useTabs();
  const isSuperAdmin = actions?.isSuperAdmin ?? false;

  const hasPermission = (moduleName, requiredAction) => {
    if (isSuperAdmin) return true;
    return actions?.modulePermissions?.some((modules) => {
      const currentModule = modules.module == moduleName;
      if (currentModule == true) {
        return modules.actions.includes(requiredAction);
      }
    });
  };

  // Load from localStorage + merge with server data
  useEffect(() => {
    if (!project?._id || !project.milestones) return;
    const localKey = getLocalStorageKey(project._id);
    const savedStatuses = JSON.parse(localStorage.getItem(localKey) || "{}");
    const merged = project.milestones.map((m) => ({
      ...m,
      status: savedStatuses[m._id] || m.status || "not started"
    }));
    setMilestones(merged);
    setMilestoneCount(merged.length);
  }, [project.milestones, project._id]);

  // Save to localStorage whenever milestones change
  useEffect(() => {
    if (!project?._id || milestones.length === 0) return;
    const localKey = getLocalStorageKey(project._id);
    const statusMap = {};
    milestones.forEach((m) => {
      statusMap[m._id] = m.status;
    });
    localStorage.setItem(localKey, JSON.stringify(statusMap));
    
    // Notify parent of milestone updates for progress calculation
    if (onMilestonesUpdate) {
      onMilestonesUpdate(milestones);
    }
  }, [milestones, project._id, onMilestonesUpdate]);

  // Grouped by status
  const milestonesByStatus = useMemo(() => {
    const grouped = {
      "not started": [],
      "in progress": [],
      completed: [],
      delayed: [],
    };
    milestones.forEach((m) => {
      const status = m.status || "not started";
      if (grouped[status]) grouped[status].push(m);
    });
    return grouped;
  }, [milestones]);

  // Sorted milestones for timeline
  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => {
      // Sort by sortIndex if available, otherwise by date
      if (a.sortIndex !== undefined && b.sortIndex !== undefined) {
        return a.sortIndex - b.sortIndex;
      }
      const dateA = a.endDate ? new Date(a.endDate) : new Date(0);
      const dateB = b.endDate ? new Date(b.endDate) : new Date(0);
      return dateA - dateB;
    });
  }, [milestones]);

  // Drag handler with localStorage persistence
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;
    const newStatus = destination.droppableId;

    // Optimistic UI + Save to localStorage immediately
    setMilestones((prev) => {
      const updated = prev.map((m) =>
        m._id === draggableId ? { ...m, status: newStatus } : m
      );
      // Save to localStorage right away
      const statusMap = {};
      updated.forEach((m) => {
        statusMap[m._id] = m.status;
      });
      localStorage.setItem(
        getLocalStorageKey(project._id),
        JSON.stringify(statusMap)
      );
      return updated;
    });

    try {
      const response = await fetch(
        `${baseUrl}milestone/change-status/${draggableId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await response.json();
      if (!data?.isSuccess) throw new Error(data?.message || "Failed");
      toast.success("Status updated");
      setTimeline((prev) => [
        {
          project: project._id,
          date: new Date(),
          user: "you",
          employee: "you",
          time: new Date().toLocaleTimeString(),
          key: "Milestone status changed",
          value: newStatus,
          milestone: draggableId,
        },
        ...prev,
      ]);
    } catch (error) {
      // Revert UI + localStorage
      setMilestones((prev) => {
        const reverted = prev.map((m) =>
          m._id === draggableId ? { ...m, status: source.droppableId } : m
        );
        const statusMap = {};
        reverted.forEach((m) => {
          statusMap[m._id] = m.status;
        });
        localStorage.setItem(
          getLocalStorageKey(project._id),
          JSON.stringify(statusMap)
        );
        return reverted;
      });
      toast.error("Failed to save status — reverted");
    }
  };

  // Timeline drag handler for reordering
  const handleTimelineDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.index === destination.index) return;

    // Swap logic: directly exchange positions
    const updatedMilestones = milestones.map(m => {
      if (m._id === draggableId) {
        // Dragged milestone gets the destination index
        return { ...m, sortIndex: destination.index };
      } else if (m.sortIndex === destination.index) {
        // Milestone at destination gets the source index
        return { ...m, sortIndex: source.index };
      }
      return m;
    });

    // Optimistic UI update
    setMilestones(updatedMilestones);

    try {
      const response = await fetch(
        `${baseUrl}project/change-index/${draggableId}?projectId=${project._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            fromIndex: source.index,
            toIndex: destination.index 
          }),
        }
      );
      const data = await response.json();
      if (!data?.isSuccess) throw new Error(data?.message || "Failed");
      toast.success("Timeline order updated");
    } catch (error) {
      // Revert on error
      setMilestones(milestones);
      toast.error("Failed to update timeline order");
    }
  };

  const MilestoneCard = ({ milestone, index }) => (
    <Draggable draggableId={milestone._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => navigate(`/milestones/milestone-detail/${milestone._id}`)}
          className={`p-4 rounded-xl border border-[var(--border)] shadow-sm transition-all cursor-pointer bg-border/20 mb-3 hover:shadow-md hover:border-gray-300 ${snapshot.isDragging ? "shadow-2xl scale-[1.02] rotate-1" : ""
            }`}
        >
          <h4 className="font-semibold text-foreground text-base">
            {milestone.name}
          </h4>
          {milestone.endDate && (
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Due: {new Date(milestone.endDate).toLocaleDateString()}
            </div>
          )}
          {milestone.cost != null && actions.cost && (
            <p className="text-sm font-medium mt-3 text-emerald-600">
              ${milestone.cost.toLocaleString()}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );

  const TimelineItem = ({ milestone, index }) => {
    const isCompleted = milestone.status === "completed";
    const isLeft = index % 2 === 0;
    const year = milestone.endDate
      ? new Date(milestone.endDate).getFullYear()
      : "N/A";

    return (
      <Draggable draggableId={milestone._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`relative flex items-center ${isLeft ? "justify-start" : "justify-end"} mb-12 ${snapshot.isDragging ? "z-50" : ""}`}
          >
            <div className={`absolute top-1/2 -translate-y-1/2 h-0.5 bg-gray-300 ${isLeft ? 'left-[calc(50%-2rem)] w-[2rem]' : 'left-1/2 w-[2rem]'}`}></div>
            <div className={`w-1/2 ${isLeft ? "pr-8 text-right" : "pl-8 text-left"}`}>
              {isLeft && (
                <div className="font-bold text-lg text-foreground mb-2">{year}</div>
              )}
              <div
                className={`p-1 sm:p-4 rounded-xl border border-[var(--border)] shadow-sm bg-border/20 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all ${snapshot.isDragging ? "shadow-2xl scale-[1.02] rotate-1" : ""}`}
                onClick={() => navigate(`/milestones/milestone-detail/${milestone._id}`)}
              >
                <h4
                  className="font-semibold text-foreground text-start truncate max-w-[140px] block text-base"
                  title={milestone.name}
                >
                  {index + 1}. {milestone.name}
                </h4>

                {milestone.endDate && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Due: {new Date(milestone.endDate).toLocaleDateString()}
                  </div>
                )}
                {milestone.cost != null && actions.cost &&(
                  <p className="text-sm font-medium mt-3 text-emerald-600">
                    ${milestone.cost.toLocaleString()}
                  </p>
                )}
              </div>
              {!isLeft && (
                <div className="font-bold text-lg text-foreground mt-2">{year}</div>
              )}
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-12 h-12">
              <div className={`absolute inset-0 rounded-full border-2 ${isCompleted ? "border-blue-200" : "border-gray-200"} shadow-sm`}></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md z-10 ${isCompleted ? "bg-blue-500" : "bg-gray-300"}`}
              >
                {isCompleted && <Check className="w-5 h-5 text-white" />}
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  async function fetchProjects() {
    try {
      const response = await fetch(`${baseUrl}project/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data?.isSuccess) setProjects(data?.filteredData.projects || []);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <>
      <div className="p-2 sm:p-8 border border-[var(--border)] rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-start md:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Flag className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                Project Milestones
              </h3>
              <p className="text-muted-foreground text-sm">
                Drag to update status • Changes saved instantly
              </p>
            </div>
          </div>
          {milestones.length > 0 && (
            <Button
              className={`${!hasPermission("Projects", "Create Records") ? "hidden" : ""}`}
              onClick={() => setOpen(true)}
            >
              <Flag className="w-4 h-4 mr-2" /> Add Milestone
            </Button>
          )}
        </div>

        <Tabs defaultValue="kanban" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          </TabsList>
          <TabsContent value="kanban">
            {milestones.length > 0 ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {Object.entries(STATUS_COLUMNS).map(
                    ([statusKey, column]) => (
                      <div key={statusKey} className="flex flex-col">
                        <div
                          className={`px-4 py-3 text-foreground rounded-t-xl border-b-2 font-semibold text-sm ${column.bg} ${column.border}`}
                        >
                          {column.title}{" "}
                          <span className="text-foreground">
                            ({milestonesByStatus[statusKey].length})
                          </span>
                        </div>
                        <Droppable droppableId={statusKey}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`min-h-[350px] p-4 rounded-b-xl border border-dashed border-transparent transition-all bg-border/40 ${snapshot.isDraggingOver ? " ring-2 ring-border" : ""
                                }`}
                            >
                              {milestonesByStatus[statusKey].map(
                                (milestone, index) => (
                                  <MilestoneCard
                                    key={milestone._id}
                                    milestone={milestone}
                                    index={index}
                                  />
                                )
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )
                  )}
                </div>
              </DragDropContext>
            ) : (
              <div className="text-center py-24">
                {/* <div className="w-20 h-20 bg-border rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Flag className="w-10 h-10 text-foreground" />
                </div>
                <h4 className="text-xl font-semibold text-foreground">
                  No Milestones Added
                </h4>
                <p className="text-muted-foreground mt-2">
                  Create milestones to track project progress
                </p> */}
                <EmptyState noPadding={false} icon={Flag} title="No Milestones Added" subtitle="Create milestones to track project progress"></EmptyState>
                {hasPermission("Projects", "Create Records") && (
                  <Button onClick={() => setOpen(true)}>
                    + Add First Milestone
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="timeline">
            {milestones.length > 0 ? (
              <DragDropContext onDragEnd={handleTimelineDragEnd}>
                <Droppable droppableId="timeline">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="relative"
                    >
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gray-200 h-full"></div>
                      {sortedMilestones.map((milestone, index) => (
                        <TimelineItem
                          key={milestone._id}
                          milestone={milestone}
                          index={index}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <div className="text-center py-24">
                <EmptyState noPadding={false} icon={Clock} title="No Timeline created" subtitle="Create milestones to track project progress"></EmptyState>
                {hasPermission("Projects", "Create Records") && (
                  <Button className="" onClick={() => setOpen(true)}>
                    + Add First Milestone
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <GlobalDialog open={open} label={`Add Milestone${milestoneCount > 0 ? ` (${milestoneCount + 1})` : ''}`} onClose={() => setOpen(false)}>
        <AddMilestoneDialog
          selectedProjectId={project._id}
          projects={projects}
          onSuccess={() => {
            refresh();
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
          onMilestoneCountChange={setMilestoneCount}
        />
      </GlobalDialog>
    </>
  );
}